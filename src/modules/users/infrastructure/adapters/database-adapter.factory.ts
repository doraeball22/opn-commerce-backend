import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseAdapter } from './database.adapter';
import { MockDatabaseAdapter } from './mock-database.adapter';
import { PostgreSQLDatabaseAdapter } from './postgresql-database.adapter';

export enum DatabaseType {
  MOCK = 'mock',
  POSTGRESQL = 'postgresql',
  // Future database types can be added here
  // MONGODB = 'mongodb',
  // MYSQL = 'mysql',
}

/**
 * Factory for creating mock database adapters.
 * Used when DATABASE_TYPE=mock in environment configuration.
 */
@Injectable()
export class DatabaseAdapterFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockAdapter: MockDatabaseAdapter,
  ) {}

  /**
   * Creates a mock database adapter.
   */
  createAdapter(): DatabaseAdapter {
    console.log('🔧 Using Mock Database Adapter');
    return this.mockAdapter;
  }

  /**
   * Gets information about the current database configuration.
   */
  getDatabaseInfo(): {
    type: DatabaseType;
    description: string;
    features: string[];
  } {
    return {
      type: DatabaseType.MOCK,
      description: 'In-memory mock database for development and testing',
      features: [
        'Fast startup',
        'No external dependencies',
        'Perfect for testing',
        'Data cleared on restart',
      ],
    };
  }

  /**
   * Validates if the current database configuration is production-ready.
   */
  isProductionReady(): boolean {
    return false;
  }
}

/**
 * Factory for creating PostgreSQL database adapters.
 * Used when DATABASE_TYPE=postgresql in environment configuration.
 */
@Injectable()
export class PostgreSQLDatabaseAdapterFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly postgresAdapter: PostgreSQLDatabaseAdapter,
  ) {}

  /**
   * Creates a PostgreSQL database adapter.
   */
  createAdapter(): DatabaseAdapter {
    console.log('🗃️  Using PostgreSQL Database Adapter');
    return this.postgresAdapter;
  }

  /**
   * Gets information about the current database configuration.
   */
  getDatabaseInfo(): {
    type: DatabaseType;
    description: string;
    features: string[];
  } {
    return {
      type: DatabaseType.POSTGRESQL,
      description: 'PostgreSQL relational database for production',
      features: [
        'ACID compliance',
        'Persistent storage',
        'Advanced querying',
        'Scalable performance',
        'Backup and recovery',
      ],
    };
  }

  /**
   * Validates if the current database configuration is production-ready.
   */
  isProductionReady(): boolean {
    return true;
  }

  /**
   * Gets recommended database type based on environment.
   */
  getRecommendedType(): DatabaseType {
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );

    switch (nodeEnv) {
      case 'production':
        return DatabaseType.POSTGRESQL;
      case 'staging':
        return DatabaseType.POSTGRESQL;
      case 'test':
        return DatabaseType.MOCK;
      case 'development':
      default:
        return DatabaseType.MOCK;
    }
  }
}
