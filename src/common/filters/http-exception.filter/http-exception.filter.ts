import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 统一异常过滤器（类似前端 axios 的错误拦截器）
 * 所有抛出的异常都会被捕获，并包装成统一的 { code, message, data } 格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 获取 HTTP 状态码，默认 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误消息
    let message = '服务器内部错误';
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      // class-validator 校验失败时，message 是数组，如 ["name 不能为空"]
      message = typeof res === 'string' ? res : (res as any).message;
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
