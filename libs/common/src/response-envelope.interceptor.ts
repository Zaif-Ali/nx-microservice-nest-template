import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { SKIP_ENVELOPE } from './skip-envelope.decorator';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return next.handle();

    const req = ctx.switchToHttp().getRequest() as Request & { requestId?: string };
    const requestId = req.requestId;
    return next.handle().pipe(map((data) => ({ success: true, data, requestId })));
  }
}
