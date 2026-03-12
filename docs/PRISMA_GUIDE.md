# Prisma 使用指南（面向前端开发者）

## 目录

- [什么是 Prisma](#什么是-prisma)
- [项目中的文件结构](#项目中的文件结构)
- [前置准备](#前置准备)
- [常用命令](#常用命令)
- [Schema 语法速查](#schema-语法速查)
- [CRUD 操作速查](#crud-操作速查)
- [关联查询](#关联查询)
- [常见问题](#常见问题)

---

## 什么是 Prisma

Prisma 是一个 **Node.js/TypeScript 的 ORM**（对象关系映射），通俗理解：

| 前端类比 | Prisma 概念 |
|---------|------------|
| TypeScript interface | Prisma model（表结构定义） |
| `.graphql` schema 文件 | `.prisma` schema 文件 |
| API 请求 `fetch('/api/users')` | `prisma.user.findMany()` |
| GraphQL 的 `include` / `populate` | Prisma 的 `include` |
| 前端 Code Generator | `prisma generate`（自动生成类型和客户端） |

**核心理念**：你在 `.prisma` 文件里声明表结构，Prisma 自动帮你生成类型安全的数据库操作代码。

---

## 项目中的文件结构

```
mind-trace-server/
├── .env                          # 数据库连接字符串（⚠️ 不要提交到 git）
├── prisma/
│   ├── schema.prisma             # ⭐ 核心文件：定义所有表结构
│   └── migrations/               # 数据库迁移记录（执行 migrate 后生成）
├── prisma.config.ts              # Prisma 配置文件
├── src/
│   └── prisma/
│       ├── prisma.service.ts     # NestJS 中的 Prisma 服务
│       └── prisma.module.ts      # NestJS 模块
```

### 各文件的作用

| 文件 | 作用 | 需要手动编辑？ |
|------|------|--------------|
| `prisma/schema.prisma` | 定义表结构和关联关系 | ✅ 是，这是你最常编辑的文件 |
| `.env` | 存放数据库连接地址 | ✅ 是，配一次就行 |
| `prisma.config.ts` | Prisma CLI 配置 | ❌ 一般不用动 |
| `src/prisma/prisma.service.ts` | NestJS 中注入使用的服务 | ❌ 一般不用动 |
| `node_modules/@prisma/client` | 自动生成的客户端代码 | ❌ 自动生成，不要手动改 |

---

## 前置准备

### 1. 确保 MySQL 已安装并启动

Windows 上推荐用 [MySQL Installer](https://dev.mysql.com/downloads/installer/) 或 [XAMPP](https://www.apachefriends.org/)。

验证 MySQL 是否运行：

```bash
mysql -u root -p
# 输入密码后能进入 mysql> 命令行就说明正常
```

### 2. 创建数据库

```sql
CREATE DATABASE mind_trace;
```

### 3. 配置 .env

打开项目根目录的 `.env` 文件，把连接字符串改成你的真实信息：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/mind_trace"
```

示例（用户名 root，密码 123456）：

```env
DATABASE_URL="mysql://root:123456@localhost:3306/mind_trace"
```

> ⚠️ 如果密码中包含特殊字符（如 `@`、`#`、`%`），需要进行 URL 编码。
> 例如密码是 `p@ss#123`，写成 `p%40ss%23123`

### 4. 同步表结构到数据库

```bash
npx prisma db push
```

成功后会看到类似输出：

```
Your database is now in sync with your Prisma schema.
```

### 5. 验证：用浏览器查看数据库

```bash
npx prisma studio
```

会自动打开浏览器（默认 http://localhost:5555），你可以：
- 查看所有表
- 浏览/新增/编辑/删除数据
- 就像操作 Excel 表格一样直观

---

## 常用命令

| 命令 | 用途 | 什么时候用 |
|------|------|-----------|
| `npx prisma generate` | 根据 schema 生成 Prisma Client | 修改了 schema.prisma 后 |
| `npx prisma db push` | 将 schema 同步到数据库（不生成迁移文件） | **开发阶段**快速同步 |
| `npx prisma migrate dev --name 描述` | 生成迁移文件并同步数据库 | **正式开发**中使用，可追溯改表历史 |
| `npx prisma studio` | 打开浏览器数据库管理界面 | 想查看/编辑数据时 |
| `npx prisma db seed` | 运行种子数据脚本 | 想填充测试数据时 |
| `npx prisma format` | 格式化 schema.prisma | 写完 schema 后美化格式 |

### `db push` vs `migrate dev` 的区别

| | `db push` | `migrate dev` |
|---|-----------|---------------|
| **适用场景** | 开发初期，频繁改表 | 功能稳定后 |
| **迁移文件** | 不生成 | 生成（可追溯历史） |
| **数据丢失风险** | 可能会丢数据 | 会提醒你 |
| **团队协作** | 不适合 | 适合（迁移文件可以提交 git） |

**建议**：前期用 `db push` 快速迭代，后期切换到 `migrate dev`。

---

## Schema 语法速查

### 基本结构

```prisma
model 表名 {
  字段名  类型  修饰符/属性
}
```

### 字段类型对照

| Prisma 类型 | TypeScript 类型 | MySQL 类型 | 说明 |
|------------|----------------|-----------|------|
| `String` | `string` | VARCHAR(191) | 字符串 |
| `Int` | `number` | INT | 整数 |
| `Float` | `number` | DOUBLE | 浮点数 |
| `Boolean` | `boolean` | TINYINT(1) | 布尔值 |
| `DateTime` | `Date` | DATETIME | 日期时间 |
| `Json` | `object` | JSON | JSON 数据 |

### 常用修饰符

```prisma
model User {
  id        Int      @id @default(autoincrement())  // 主键，自增
  email     String   @unique                         // 唯一约束
  name      String?                                  // ? 表示可选（可以为 null）
  role      String   @default("user")                // 默认值
  bio       String   @db.Text                        // 指定 MySQL 用 TEXT 类型
  createdAt DateTime @default(now())                  // 默认当前时间
  updatedAt DateTime @updatedAt                       // 更新时自动修改时间
}
```

### 定义关联关系

```prisma
// 一对多：一个用户有多篇日记
model User {
  id      Int     @id @default(autoincrement())
  diaries Diary[]    // 这一侧放数组
}

model Diary {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])  // 这一侧定义外键
  userId Int
}

// 多对多：日记和标签
model Diary {
  id   Int   @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id      Int     @id @default(autoincrement())
  diaries Diary[]
}
```

---

## CRUD 操作速查

在 NestJS 的 Service 中注入 `PrismaService` 后使用：

```typescript
constructor(private prisma: PrismaService) {}
```

### 创建（Create）

```typescript
// 创建一条记录
const user = await this.prisma.user.create({
  data: {
    username: 'alice',
    email: 'alice@example.com',
    password: hashedPassword,
  },
});

// 批量创建
const count = await this.prisma.user.createMany({
  data: [
    { username: 'bob', email: 'bob@example.com', password: '...' },
    { username: 'charlie', email: 'charlie@example.com', password: '...' },
  ],
});
```

### 查询（Read）

```typescript
// 查询所有
const users = await this.prisma.user.findMany();

// 条件查询
const user = await this.prisma.user.findUnique({
  where: { email: 'alice@example.com' },
});

// 模糊查询 + 分页 + 排序
const diaries = await this.prisma.diary.findMany({
  where: {
    title: { contains: '旅行' },      // title 包含 "旅行"
    userId: 1,                         // 属于用户 1
  },
  orderBy: { createdAt: 'desc' },      // 按创建时间倒序
  skip: 0,                             // 跳过 0 条（分页偏移）
  take: 10,                            // 取 10 条（每页条数）
});

// 查询数量
const count = await this.prisma.diary.count({
  where: { userId: 1 },
});
```

### 更新（Update）

```typescript
// 更新一条
const updated = await this.prisma.diary.update({
  where: { id: 1 },
  data: { title: '新标题' },
});

// 条件批量更新
const count = await this.prisma.diary.updateMany({
  where: { userId: 1 },
  data: { mood: 'happy' },
});
```

### 删除（Delete）

```typescript
// 删除一条
await this.prisma.diary.delete({
  where: { id: 1 },
});

// 条件批量删除
await this.prisma.diary.deleteMany({
  where: { userId: 1 },
});
```

### 创建或更新（Upsert）

```typescript
// 存在则更新，不存在则创建
const user = await this.prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { nickname: '新昵称' },
  create: {
    username: 'alice',
    email: 'alice@example.com',
    password: '...',
  },
});
```

---

## 关联查询

### 查询时包含关联数据（Include）

类似 GraphQL 的嵌套查询：

```typescript
// 查询用户时，同时带出他的所有日记
const userWithDiaries = await this.prisma.user.findUnique({
  where: { id: 1 },
  include: {
    diaries: true,  // 包含所有日记
  },
});
// 结果：{ id: 1, username: 'alice', ..., diaries: [{ id: 1, title: '...', ... }] }

// 也可以对关联数据做筛选
const userWithRecentDiaries = await this.prisma.user.findUnique({
  where: { id: 1 },
  include: {
    diaries: {
      where: { mood: 'happy' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
```

### 只选择部分字段（Select）

类似 GraphQL 的字段选择：

```typescript
const user = await this.prisma.user.findUnique({
  where: { id: 1 },
  select: {
    username: true,
    email: true,
    // 不选 password，避免泄露
    diaries: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});
// 结果：{ username: 'alice', email: '...', diaries: [{ id: 1, title: '...' }] }
```

### 创建时同时创建关联数据

```typescript
// 创建用户的同时创建日记
const user = await this.prisma.user.create({
  data: {
    username: 'alice',
    email: 'alice@example.com',
    password: '...',
    diaries: {
      create: [
        { title: '第一篇日记', content: '今天开始写日记' },
        { title: '第二篇日记', content: '天气真好' },
      ],
    },
  },
  include: { diaries: true },
});
```

---

## 常见问题

### Q: 修改了 schema.prisma 后怎么办？

**每次修改 schema.prisma 后，需要两步：**

```bash
# 1. 同步到数据库
npx prisma db push

# 2. 重新生成客户端（db push 通常会自动执行这步，但保险起见可以手动跑）
npx prisma generate
```

### Q: 报错 "Can't reach database server"？

检查：
1. MySQL 是否已启动
2. `.env` 中的用户名、密码、端口是否正确
3. 数据库 `mind_trace` 是否已创建

### Q: 报错 "P1001: Can't reach database server at `localhost:3306`"？

MySQL 可能没有运行，或者端口不是 3306。检查 MySQL 服务状态。

### Q: 想重置数据库（清空所有数据重来）？

```bash
npx prisma migrate reset
# 或者
npx prisma db push --force-reset
```

⚠️ 这会**删除所有数据**，仅在开发阶段使用。

### Q: 如何查看 Prisma 生成的实际 SQL？

在 `PrismaService` 中开启日志：

```typescript
// prisma.service.ts
constructor() {
  super({
    log: ['query', 'info', 'warn', 'error'],
  });
}
```

这样每次操作数据库时，控制台都会输出实际执行的 SQL 语句。

### Q: `.env` 中的密码有特殊字符怎么办？

对特殊字符进行 URL 编码：

| 字符 | 编码 |
|------|------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |

### Q: Prisma Studio 打不开？

确保先执行了 `npx prisma db push` 同步表结构，再执行 `npx prisma studio`。
