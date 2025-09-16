/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from '@sample/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

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
