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
 * Factory for creating database adapters based on configuration.
 * This allows easy switching between different database implementations
 * without changing application code.
 */
@Injectable()
export class DatabaseAdapterFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockAdapter: MockDatabaseAdapter,
    private readonly postgresAdapter: PostgreSQLDatabaseAdapter,
  ) {}

  /**
   * Creates a database adapter based on the configured database type.
   * Falls back to mock adapter if configuration is invalid.
   */
  createAdapter(): DatabaseAdapter {
    const databaseType = this.getDatabaseType();

    switch (databaseType) {
      case DatabaseType.MOCK:
        console.log('🔧 Using Mock Database Adapter');
        return this.mockAdapter;

      case DatabaseType.POSTGRESQL:
        console.log('🗃️  Using PostgreSQL Database Adapter');
        return this.postgresAdapter;

      default:
        console.warn(
          `⚠️  Unknown database type: ${databaseType}. Falling back to Mock Database`,
        );
        return this.mockAdapter;
    }
  }

  /**
   * Gets the database type from configuration with fallback to mock.
   */
  private getDatabaseType(): DatabaseType {
    const configValue = this.configService.get<string>(
      'DATABASE_TYPE',
      DatabaseType.MOCK,
    );

    // Validate that the config value is a valid DatabaseType
    if (Object.values(DatabaseType).includes(configValue as DatabaseType)) {
      return configValue as DatabaseType;
    }

    console.warn(
      `⚠️  Invalid DATABASE_TYPE: ${configValue}. Using mock database.`,
    );
    return DatabaseType.MOCK;
  }

  /**
   * Gets information about the current database configuration.
   */
  getDatabaseInfo(): {
    type: DatabaseType;
    description: string;
    features: string[];
  } {
    const type = this.getDatabaseType();

    switch (type) {
      case DatabaseType.MOCK:
        return {
          type,
          description: 'In-memory mock database for development and testing',
          features: [
            'Fast startup',
            'No external dependencies',
            'Perfect for testing',
            'Data cleared on restart',
          ],
        };

      case DatabaseType.POSTGRESQL:
        return {
          type,
          description: 'PostgreSQL relational database for production',
          features: [
            'ACID compliance',
            'Persistent storage',
            'Advanced querying',
            'Scalable performance',
            'Backup and recovery',
          ],
        };

      default:
        return {
          type: DatabaseType.MOCK,
          description: 'Fallback to mock database',
          features: ['Safe fallback'],
        };
    }
  }

  /**
   * Validates if the current database configuration is production-ready.
   */
  isProductionReady(): boolean {
    const type = this.getDatabaseType();
    return type !== DatabaseType.MOCK;
  }

  /**
   * Gets recommended database type based on environment.
   */
  getRecommendedType(): DatabaseType {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

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
