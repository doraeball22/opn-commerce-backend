import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'OPN Commerce Backend - Opn.Pro Engineering Challenge';
  }

  async getHealth() {
    const databaseConfig = this.configService.get('database');
    const appConfig = this.configService.get('app');

    // Define a flexible object for the database health information.
    // This allows us to add different properties based on the database type
    // without causing TypeScript errors.
    let databaseHealth: { [key: string]: any } = {
      type: databaseConfig?.type || 'unknown',
      status: 'unknown',
    };

    // Add database-specific health info based on the configuration type.
    if (databaseConfig?.type === 'postgresql') {
      databaseHealth = {
        type: 'postgresql',
        status: 'connected', // TODO: Add actual connection test
        host: databaseConfig.postgresql?.host
          ? databaseConfig.postgresql.host.split('.')[0] + '...'
          : 'unknown',
        ssl: databaseConfig.postgresql?.ssl ? 'enabled' : 'disabled',
      };
    } else if (databaseConfig?.type === 'mock') {
      databaseHealth = {
        type: 'mock',
        status: 'active',
        verbose: databaseConfig.mock?.verbose || false,
        seedData: databaseConfig.mock?.seedData || false,
      };
    }

    // Construct the final health object.
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: appConfig?.nodeEnv || process.env.NODE_ENV,
      // Assign the dynamically created database health object here.
      database: databaseHealth,
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };

    return health;
  }
}
