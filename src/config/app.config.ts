import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsEnabled: boolean;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  logLevel: string;
  logFormat: string;
  apiDocs: {
    enabled: boolean;
    path: string;
  };
}

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8091', 10),
    corsEnabled: process.env.CORS_ENABLED === 'true',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    logLevel: process.env.LOG_LEVEL || 'debug',
    logFormat: process.env.LOG_FORMAT || 'dev',
    apiDocs: {
      enabled: process.env.API_DOCS_ENABLED === 'true',
      path: process.env.API_DOCS_PATH || 'api',
    },
  }),
);
