import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用校验管道（类似前端的全局表单校验中间件）
  // 所有带 @Body() 的请求都会自动按 DTO 上的装饰器校验
  // whitelist: true → 自动过滤掉 DTO 中没定义的字段（防止前端多传恶意字段）
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 全局响应拦截器：统一成功响应格式 { code: 200, message: 'ok', data: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器：统一错误响应格式 { code: 400/500, message: '...', data: null }
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
