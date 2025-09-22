import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './users/users.controller';
import path from 'path';
import { ConfigFor, Env } from '@sample/config';  
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Redis from 'ioredis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import {
  MICROSERVICES_CLIENTS,
  ResponseEnvelopeInterceptor,
} from '@sample/common';
@Module({
  imports: [
    ConfigFor(path.join(__dirname, '..', '..')),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>) => {
        const redis = new Redis({
          host: cfg.get('REDIS_HOST', { infer: true }),
          port: cfg.get('REDIS_PORT', { infer: true }),
          password: cfg.get('REDIS_PASSWORD', { infer: true }),
          db: cfg.get('REDIS_DB', { infer: true }),
          // tls: {}
        });

        return {
          throttlers: [
            {
              ttl: cfg.get('RATE_LIMIT_TTL', { infer: true }),
              limit: cfg.get('RATE_LIMIT_LIMIT', { infer: true }),
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
        };
      },
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          inject: [ConfigService],
          name: MICROSERVICES_CLIENTS.USERS_SERVICE,
          useFactory: (cfg: ConfigService<Env, true>) => ({
            name: MICROSERVICES_CLIENTS.USERS_SERVICE,
            transport: Transport.TCP,
            options: {
              host: cfg.get('USERS_TCP_HOST', { infer: true }),
              port: cfg.get('USERS_TCP_PORT', { infer: true }),
            },
          }),
        },
      ],
    }),
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
})
export class AppModule {}
