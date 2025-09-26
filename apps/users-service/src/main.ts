import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Env } from '@sample/config';

async function bootstrap() {
  // Resolve configuration using a short-lived application context
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const cfg = appContext.get<ConfigService<Env, true>>(ConfigService);
  const host = cfg.get('HOST', { infer: true });
  const port = cfg.get('PORT', { infer: true });
  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host, port },
  });

  await app.listen();
  Logger.log(`🚀 User Service is running on: http://${host}:${port}`);
}

bootstrap();
