# Mood 模块开发笔记

> 作为前端转后端的第一个完整模块，记录遇到的问题和知识点。

---

## 一、开发顺序

**有依赖关系的模块，先做被依赖的那个。**

```
MoodGroup（先做）→ Mood（后做）→ Diary（最后做）
```

原因：Mood 表有 `groupId` 必填外键，创建 Mood 时必须关联一个已存在的 MoodGroup。
类比前端：先有下拉选项数据（MoodGroup），才能提交表单（Mood）。

---

## 二、项目中各文件的职责

| 文件 | 职责 | 前端类比 |
|------|------|---------|
| `schema.prisma` | 定义数据库表结构 | TypeScript 类型定义 |
| `*.dto.ts` | 定义请求入参 + 校验规则 | 表单的 rules 规则 |
| `*.service.ts` | 业务逻辑 + 数据库操作 | composable / hook |
| `*.controller.ts` | 接收请求、调用 Service | 页面路由组件 |
| `*.entity.ts` | ~~描述数据库记录形状~~ | **用 Prisma 的项目不需要手写，Prisma 自动生成类型** |
| `*.module.ts` | 注册 Controller 和 Service | Vue 的 app.use() 注册插件 |

---

## 三、关于 async/await

**NestJS 会自动处理返回的 Promise**，所以：

```typescript
// ✅ 单个查询直接返回 → 不需要 await
getAllMoodGroups() {
  return this.prisma.moodGroup.findMany();
}

// ✅ 多个查询要组装 → 需要 await
async getDashboard() {
  const [groups, count] = await Promise.all([
    this.prisma.moodGroup.findMany(),
    this.prisma.diary.count(),
  ]);
  return { groups, count };
}

// ✅ 单个查询但要加工 → 需要 await
async getAllMoodGroups() {
  const groups = await this.prisma.moodGroup.findMany();
  return { total: groups.length, data: groups };
}
```

**一句话：只有需要拿到结果做进一步处理时，才需要 await。**

---

## 四、DTO 校验

### 安装依赖

```bash
npm install class-validator class-transformer
```

### 全局启用（main.ts）

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
// whitelist: true → 自动过滤掉 DTO 中没定义的字段（防止前端多传恶意字段）
```

### DTO 中使用装饰器

```typescript
export class CreateMoodGroupDto {
  @IsString({ message: 'name 必须是字符串' })
  @IsNotEmpty({ message: 'name 不能为空' })
  @MaxLength(50, { message: 'name 最长50个字符' })
  name: string;
}
```

### Update DTO 用 PartialType 继承

```typescript
// 把 Create 的所有字段变成可选，校验装饰器也会自动继承
export class UpdateMoodGroupDto extends PartialType(CreateMoodGroupDto) {}
```

类比前端：后端的 DTO 校验 = 前端的表单 rules 校验，两端都要做。前端防君子，后端防小人。

---

## 五、统一响应格式

### 成功响应（TransformInterceptor）

```json
{ "code": 200, "message": "ok", "data": [...] }
```

### 失败响应（HttpExceptionFilter）

```json
{ "code": 400, "message": ["name 不能为空"], "data": null }
```

### 注册位置（main.ts）

```typescript
app.useGlobalInterceptors(new TransformInterceptor());  // 成功响应包装
app.useGlobalFilters(new HttpExceptionFilter());         // 异常响应包装
```

| 后端概念 | 前端类比 |
|---------|---------|
| TransformInterceptor | axios 响应拦截器 `res => res.data` |
| HttpExceptionFilter | axios 错误拦截器 `err => ElMessage.error(...)` |
| ValidationPipe | 表单 rules 校验中间件 |

---

## 六、Prisma 常用操作 → SQL 对照

| Prisma 方法 | 等价 SQL | 说明 |
|-------------|---------|------|
| `findMany()` | `SELECT * FROM table` | 查全部 |
| `findMany({ where })` | `SELECT * WHERE ...` | 条件查询 |
| `findMany({ include })` | `SELECT * ... LEFT JOIN` | 关联查询 |
| `findUnique({ where })` | `SELECT * WHERE id = ? LIMIT 1` | 查单条 |
| `create({ data })` | `INSERT INTO table (...)` | 创建 |
| `update({ where, data })` | `UPDATE table SET ... WHERE ...` | 更新 |
| `delete({ where })` | `DELETE FROM table WHERE ...` | 删除 |

---

## 七、外键关联

创建 Mood 时关联 MoodGroup，只需要传 `groupId`：

```typescript
this.prisma.mood.create({
  data: {
    title: '快乐',
    groupId: 1,  // ← 这就完成了关联
  },
});
```

类比前端：表单里的 `<Select>` 下拉框，提交时只传选中的 value（id），不需要传整个 option 对象。

---

## 八、更新/删除前先检查 id 是否存在

```typescript
// 不要直接操作数据库，先检查
async updateMoodGroup(id: number, dto: UpdateMoodGroupDto) {
  await this.ensureGroupExists(id);  // 不存在就抛 404
  return this.prisma.moodGroup.update({ where: { id }, data: dto });
}
```

`ensureGroupExists` 放在 Service 的方法中（不是 utils），因为它依赖 `this.prisma`，不是纯函数。
当其他 Service 也需要调用时，改为 `public` 即可。

---

## 九、ParseIntPipe

URL 参数默认是字符串，Prisma 需要数字。`ParseIntPipe` 自动转换：

```typescript
@Delete(':id')
deleteMood(@Param('id', ParseIntPipe) id: number) { ... }
// '/mood/abc' → 自动返回 400 错误
// '/mood/1'   → id 变成数字 1
```

---

## 十、没有数据库也能做的验证

| 命令 | 作用 | 类比前端 |
|------|------|---------|
| `npx prisma validate` | 检查 schema 语法 | ESLint |
| `npx prisma generate` | 生成类型客户端 | tsc 编译检查 |
| `npx prisma format` | 格式化 schema | Prettier |
| TypeScript 编译 | Service/Controller 类型正确性 | 跟前端一样 |
