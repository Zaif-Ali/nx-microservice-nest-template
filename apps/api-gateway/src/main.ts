import {
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from '@sample/config';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from '@sample/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.useGlobalFilters(new AllExceptionsFilter());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: true, // reflect request origin
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['x-request-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
      forbidNonWhitelisted: true,
    })
  );

  const cfg = app.get<ConfigService<Env, true>>(ConfigService);

  const trustProxy = cfg.get('TRUST_PROXY', { infer: true });

  if (trustProxy) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  const port = cfg.get('PORT', { infer: true }) || 3000;

  await app.listen(port);
  Logger.log(
    `🚀 API Gateway is running on: http://${process.env.HOST}:${process.env.PORT}`
  );
}

bootstrap();
