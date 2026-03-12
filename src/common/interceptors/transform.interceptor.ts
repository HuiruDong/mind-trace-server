import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式拦截器（类似前端 axios 的响应拦截器）
 * 所有成功的返回都会被包装成 { code, message, data } 格式
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // map 就像前端的 .then(res => ...)，对返回值做一层包装
      map((data) => ({
        code: 200,
        message: 'ok',
        data: data ?? null,
      })),
    );
  }
}
