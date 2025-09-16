import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { EnvSchema, type Env } from './env.schema';

function envFilePathsFor(appRootAbsPath: string) {
  const nodeEnv = process.env['NODE_ENV'] || 'development';
  return [
    path.join(appRootAbsPath, `.env.${nodeEnv}.local`),
    path.join(appRootAbsPath, `.env.${nodeEnv}`),
    path.join(appRootAbsPath, `.env.local`),
    path.join(appRootAbsPath, `.env`),
  ];
}

export function ConfigFor(appRootAbsPath: string) {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: envFilePathsFor(appRootAbsPath),
    validate: (raw: Record<string, unknown>) => {
      const parsed = EnvSchema.safeParse(raw);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
        throw new Error(`Invalid environment variables:\n${issues}`);
      }
      return parsed.data as Env;
    },
  });
}

export type { Env };
