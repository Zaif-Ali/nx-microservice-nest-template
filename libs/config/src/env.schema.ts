import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('127.0.0.1'),
  USERS_TCP_HOST: z.string().default('127.0.0.1'),
  USERS_TCP_PORT: z.coerce.number().default(3001),
  RATE_LIMIT_TTL: z.coerce.number().default(60), // seconds
  RATE_LIMIT_LIMIT: z.coerce.number().default(100),
  TRUST_PROXY: z.coerce.boolean().default(false),
  // Redis setup for the throttler 
  REDIS_THROTTLER_HOST: z.string().default('127.0.0.1'),
  REDIS_THROTTLER_PORT: z.coerce.number().default(6379),
  REDIS_THROTTLER_PASSWORD: z.string().optional(),
  REDIS_THROTTLER_DB: z.coerce.number().default(0),
});

export type Env = z.infer<typeof EnvSchema>;
