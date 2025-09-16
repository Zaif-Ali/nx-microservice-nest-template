import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  console.log(process.env.PORT) // 4001
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST || '127.0.0.1',
        port: Number(process.env.PORT) || 3001,
      },
    }
  );

  await app.listen();
  Logger.log(
    `🚀 User Service is running on: http://${process.env.HOST}:${process.env.PORT}`
  );
}

bootstrap();
