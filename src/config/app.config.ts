import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsEnabled: boolean;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  logLevel: string;
  logFormat: string;
  rateLimitTtl: number;
  rateLimitLimit: number;
  apiDocs: {
    enabled: boolean;
    path: string;
  };
}

export default registerAs('app', (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8091', 10),
  apiPrefix: process.env.API_PREFIX || 'v1',
  corsEnabled: process.env.CORS_ENABLED === 'true',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  logLevel: process.env.LOG_LEVEL || 'debug',
  logFormat: process.env.LOG_FORMAT || 'dev',
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  apiDocs: {
    enabled: process.env.API_DOCS_ENABLED === 'true',
    path: process.env.API_DOCS_PATH || 'api',
  },
}));