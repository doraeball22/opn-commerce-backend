import { registerAs } from '@nestjs/config';
import { DatabaseType } from '../modules/users/infrastructure/adapters/database-adapter.factory';

export interface DatabaseConfig {
  type: DatabaseType;
  postgresql: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
    synchronize: boolean;
    logging: boolean;
    migrationsRun: boolean;
    migrationsTableName: string;
    pool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      idleTimeoutMillis: number;
    };
    ssl: boolean | {
      rejectUnauthorized: boolean;
    };
  };
  mock: {
    verbose: boolean;
    simulateLatency: boolean;
    latencyMs: number;
    seedData: boolean;
  };
  healthCheck: {
    timeout: number;
    interval: number;
  };
  retry: {
    attempts: number;
    delay: number;
  };
}

export default registerAs('database', (): DatabaseConfig => ({
  // Database adapter type - determines which database implementation to use
  type: (process.env.DATABASE_TYPE as DatabaseType) || DatabaseType.MOCK,
  
  // PostgreSQL configuration (when using PostgreSQL adapter)
  postgresql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'opn_commerce',
    schema: process.env.DB_SCHEMA || 'public',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
    migrationsTableName: 'migrations',
    
    // Connection pool settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    },
    
    // SSL configuration
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    } : false,
  },
  
  // Mock database configuration (for development/testing)
  mock: {
    // Enable additional logging for mock database operations
    verbose: process.env.MOCK_DB_VERBOSE === 'true',
    
    // Simulate database latency for testing
    simulateLatency: process.env.MOCK_DB_SIMULATE_LATENCY === 'true',
    latencyMs: parseInt(process.env.MOCK_DB_LATENCY_MS || '10', 10),
    
    // Pre-populate with test data
    seedData: process.env.MOCK_DB_SEED === 'true',
  },
  
  // Health check configuration
  healthCheck: {
    timeout: parseInt(process.env.DB_HEALTH_TIMEOUT || '5000', 10),
    interval: parseInt(process.env.DB_HEALTH_INTERVAL || '30000', 10),
  },
  
  // Connection retry configuration
  retry: {
    attempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
    delay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
  },
}));