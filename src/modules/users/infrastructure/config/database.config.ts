import { registerAs } from '@nestjs/config';
import { DatabaseType } from '../adapters/database-adapter.factory';

export default registerAs('database', () => ({
  // Database adapter type - determines which database implementation to use
  type: process.env.DATABASE_TYPE || DatabaseType.MOCK,

  // PostgreSQL configuration (when using PostgreSQL adapter)
  postgresql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'opn_commerce',

    // Connection pool settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10) || 10,
      acquireTimeoutMillis:
        parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000', 10) || 30000,
      idleTimeoutMillis:
        parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10) || 30000,
    },

    // SSL configuration
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,

    // Schema and synchronization
    schema: process.env.DB_SCHEMA || 'public',
    synchronize: process.env.NODE_ENV !== 'production', // Never auto-sync in production
    logging: process.env.DB_LOGGING === 'true',

    // Migration settings
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
    migrationsTableName: 'migrations',
  },

  // Mock database configuration (for development/testing)
  mock: {
    // Enable additional logging for mock database operations
    verbose: process.env.MOCK_DB_VERBOSE === 'true',

    // Simulate database latency for testing
    simulateLatency: process.env.MOCK_DB_SIMULATE_LATENCY === 'true',
    latencyMs: parseInt(process.env.MOCK_DB_LATENCY_MS || '10', 10) || 10,

    // Pre-populate with test data
    seedData: process.env.MOCK_DB_SEED === 'true',
  },

  // Health check configuration
  healthCheck: {
    timeout: parseInt(process.env.DB_HEALTH_TIMEOUT || '5000', 10) || 5000,
    interval: parseInt(process.env.DB_HEALTH_INTERVAL || '30000', 10) || 30000,
  },

  // Connection retry configuration
  retry: {
    attempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10) || 3,
    delay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10) || 1000,
  },
}));
