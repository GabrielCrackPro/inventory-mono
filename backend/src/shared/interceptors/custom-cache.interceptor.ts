import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { CustomLogger } from '../utils';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  private readonly logger = new CustomLogger('CACHE');

  constructor(cacheManager: Cache, reflector: Reflector) {
    super(cacheManager, reflector);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<import('rxjs').Observable<any>> {
    const http = (context as any).switchToHttp?.();
    const request = http?.getRequest?.();
    const response = http?.getResponse?.();
    const key = this.trackBy(context);

    if (!key) {
      return super.intercept(context, next);
    }

    try {
      const value = await (this as any).cacheManager.get(key);
      if (response?.setHeader) {
        response.setHeader('X-Cache', value !== undefined ? 'HIT' : 'MISS');
      }
      const method = request?.method ?? 'GET';
      const url = request?.url ?? '';
      if (value !== undefined) {
        this.logger.log(`HIT ${method} ${url} key=${key}`);
      } else {
        this.logger.log(`MISS ${method} ${url} key=${key}`);
      }
    } catch {
      // ignore cache probing errors
    }

    return super.intercept(context, next);
  }
}
