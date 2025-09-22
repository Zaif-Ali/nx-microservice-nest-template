import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Error');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException
        ? (exception.getResponse() as string | { message?: string | string[] })
        : null;

    let message = 'Internal Server Error';

    if (typeof responseBody === 'string') {
      message = responseBody;
    } else if (typeof responseBody === 'object' && responseBody?.message) {
      message = Array.isArray(responseBody.message)
        ? responseBody.message.join(', ') // Handle multiple error messages
        : responseBody.message;
    }

    const requestId = (req as Request & { requestId?: string }).requestId;

    const body = {
      success: false,
      status,
      error: HttpStatus[status] ?? 'Error',
      message,
      path: req.url,
      method: req.method,
      requestId,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(JSON.stringify(body));
    res.status(status).json(body);
  }
}
