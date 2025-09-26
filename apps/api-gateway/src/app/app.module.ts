import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './users/users.controller';
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
import { LoggerModule } from 'nestjs-pino';
import { Request } from 'express';
@Module({
  imports: [
    // Config for the API
    ConfigFor(process.cwd()),
    // Throttler for the API to prevent abuse
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>) => {
        const redis = new Redis({
          host: cfg.get('REDIS_THROTTLER_HOST', { infer: true }),
          port: cfg.get('REDIS_THROTTLER_PORT', { infer: true }),
          password: cfg.get('REDIS_THROTTLER_PASSWORD', { infer: true }),
          db: cfg.get('REDIS_THROTTLER_DB', { infer: true }),
          lazyConnect: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 1,
          retryStrategy: (attempt) => Math.min(attempt * 200, 2000), // backoff 0.2s -> 2s
          // tls: {}
        });
        return {
          // Rate limit for the API
          throttlers: [
            {
              ttl: cfg.get('RATE_LIMIT_TTL', { infer: true }),
              limit: cfg.get('RATE_LIMIT_LIMIT', { infer: true }),
            },
          ],
          // Storage for the rate limit
          storage: new ThrottlerStorageRedisService(redis),
        };
      },
    }),
    // Logging for the API
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>) => ({
        pinoHttp: {
          transport:
            cfg.get('NODE_ENV', { infer: true }) === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                    translateTime: 'SYS:standard',
                  },
                }
              : undefined,
          // add your requestId from middleware/ALS into every log line
          customProps: (req) => ({
            requestId: (req as Request as unknown as { requestId?: string })
              ?.requestId,
          }),
        },
      }),
    }),
    // Inject the microservices clients
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
