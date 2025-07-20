import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(8091),
  API_PREFIX: Joi.string().default('v1'),

  // Database Configuration
  DATABASE_TYPE: Joi.string()
    .valid('mock', 'postgresql')
    .default('mock'),

  // PostgreSQL Configuration
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('password'),
  DB_NAME: Joi.string().default('opn_commerce'),
  DB_SCHEMA: Joi.string().default('public'),

  // Database Pool
  DB_POOL_MIN: Joi.number().min(1).default(2),
  DB_POOL_MAX: Joi.number().min(1).default(10),
  DB_ACQUIRE_TIMEOUT: Joi.number().min(1000).default(30000),
  DB_IDLE_TIMEOUT: Joi.number().min(1000).default(30000),

  // Database Flags
  DB_SSL: Joi.boolean().default(false),
  DB_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(true),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  DB_LOGGING: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(false),

  // Mock Database
  MOCK_DB_VERBOSE: Joi.boolean().default(false),
  MOCK_DB_SIMULATE_LATENCY: Joi.boolean().default(false),
  MOCK_DB_LATENCY_MS: Joi.number().min(0).default(10),
  MOCK_DB_SEED: Joi.boolean().default(true),

  // Health Check
  DB_HEALTH_TIMEOUT: Joi.number().min(1000).default(5000),
  DB_HEALTH_INTERVAL: Joi.number().min(1000).default(30000),

  // Retry Configuration
  DB_RETRY_ATTEMPTS: Joi.number().min(1).default(3),
  DB_RETRY_DELAY: Joi.number().min(100).default(1000),

  // Security
  JWT_SECRET: Joi.string().min(32).default('change-me-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  BCRYPT_ROUNDS: Joi.number().min(4).max(20).default(12),

  // API Documentation
  API_DOCS_ENABLED: Joi.boolean().default(true),
  API_DOCS_PATH: Joi.string().default('api'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('debug'),
  LOG_FORMAT: Joi.string()
    .valid('dev', 'combined', 'common', 'short', 'tiny')
    .default('dev'),

  // CORS
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().min(1).default(60),
  RATE_LIMIT_LIMIT: Joi.number().min(1).default(100),
});