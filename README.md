# Mind Trace Server

基于 NestJS + Prisma 的后端服务。

## 目录结构

```
src/
├── main.ts                       # 入口文件
├── app.module.ts                 # 根模块
├── app.controller.ts             # 根控制器（可选）
├── app.service.ts                # 根服务（可选）
│
├── common/                       # 公共/共享代码
│   ├── decorators/               # 自定义装饰器
│   ├── filters/                  # 异常过滤器
│   ├── guards/                   # 守卫
│   ├── interceptors/             # 拦截器
│   ├── pipes/                    # 管道
│   ├── middleware/               # 中间件
│   ├── dto/                      # 公共 DTO
│   ├── interfaces/               # 公共接口
│   └── constants/                # 常量
│
├── config/                       # 配置模块
│   ├── config.module.ts
│   └── configuration.ts
│
├── prisma/                       # Prisma 模块（数据库）
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
└── modules/                      # 业务模块
    ├── user/
    │   ├── user.module.ts
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   └── update-user.dto.ts
    │   └── entities/
    │       └── user.entity.ts
    │
    └── mood/
        ├── mood.module.ts
        ├── mood.controller.ts
        ├── mood.service.ts
        ├── dto/
        │   ├── create-mood.dto.ts
        │   └── update-mood.dto.ts
        └── entities/
            └── mood.entity.ts
```

## 命名规范

| 类型 | 文件名 | 类名 | 示例 |
|------|--------|------|------|
| Module | `*.module.ts` | `*Module` | `user.module.ts` → `UserModule` |
| Controller | `*.controller.ts` | `*Controller` | `user.controller.ts` → `UserController` |
| Service | `*.service.ts` | `*Service` | `user.service.ts` → `UserService` |
| Guard | `*.guard.ts` | `*Guard` | `auth.guard.ts` → `AuthGuard` |
| Pipe | `*.pipe.ts` | `*Pipe` | `validation.pipe.ts` → `ValidationPipe` |
| Filter | `*.filter.ts` | `*Filter` | `http-exception.filter.ts` → `HttpExceptionFilter` |
| Interceptor | `*.interceptor.ts` | `*Interceptor` | `logging.interceptor.ts` → `LoggingInterceptor` |
| Middleware | `*.middleware.ts` | `*Middleware` | `logger.middleware.ts` → `LoggerMiddleware` |
| Decorator | `*.decorator.ts` | — | `roles.decorator.ts` → `@Roles()` |
| DTO | `*.dto.ts` | `*Dto` | `create-user.dto.ts` → `CreateUserDto` |
| Entity | `*.entity.ts` | `*Entity` | `user.entity.ts` → `UserEntity` |
| Interface | `*.interface.ts` | — | `user.interface.ts` |
| Spec | `*.spec.ts` | — | `user.service.spec.ts` |

## 命名原则

1. **文件名用 kebab-case**（短横线分隔），如 `create-user.dto.ts`
2. **类名用 PascalCase**，如 `CreateUserDto`
3. **一个模块一个目录**，模块内高内聚，包含自己的 controller、service、dto、entity
4. **公共代码放 `common/`**，跨模块共享的守卫、管道、装饰器等
5. **业务模块放 `modules/`**，用 `nest g res modules/<name>` 生成

## 常用 CLI 命令

```bash
# 生成完整 CRUD 资源模块
nest g res modules/user

# 生成守卫
nest g guard common/guards/auth

# 生成过滤器
nest g filter common/filters/http-exception

# 生成拦截器
nest g interceptor common/interceptors/logging
```

## TODO

- [ ] **Content 富文本迁移**：当前 `Diary.content` 使用纯文本格式，后期切换为富文本后，需要对存量数据做一次迁移，将纯文本包裹为 `<p>content</p>` 格式。