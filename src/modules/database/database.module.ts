import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserEntity,
  UserAddressEntity,
} from '../users/infrastructure/persistence/entities';

/**
 * Database module that configures TypeORM based on environment variables.
 * Only loads TypeORM when using PostgreSQL database.
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const databaseType = configService.get<string>(
              'database.type',
              'mock',
            );

            // Only configure TypeORM if we're using PostgreSQL
            if (databaseType !== 'postgresql') {
              throw new Error(
                'TypeORM should not be initialized when using mock database',
              );
            }

            return {
              type: 'postgres' as const,
              host: configService.get<string>('database.postgresql.host'),
              port: configService.get<number>('database.postgresql.port'),
              username: configService.get<string>(
                'database.postgresql.username',
              ),
              password: configService.get<string>(
                'database.postgresql.password',
              ),
              database: configService.get<string>(
                'database.postgresql.database',
              ),
              schema: configService.get<string>('database.postgresql.schema'),

              // Connection pool settings
              extra: {
                min: configService.get<number>('database.postgresql.poolMin'),
                max: configService.get<number>('database.postgresql.poolMax'),
                acquireTimeoutMillis: configService.get<number>(
                  'database.postgresql.acquireTimeout',
                ),
                idleTimeoutMillis: configService.get<number>(
                  'database.postgresql.idleTimeout',
                ),
              },

              // SSL Configuration
              ssl: configService.get<boolean>('database.postgresql.ssl')
                ? {
                    rejectUnauthorized: configService.get<boolean>(
                      'database.postgresql.sslRejectUnauthorized',
                    ),
                  }
                : false,

              // Development settings
              synchronize: configService.get<boolean>(
                'database.postgresql.synchronize',
              ),
              logging: configService.get<boolean>(
                'database.postgresql.logging',
              ),
              migrationsRun: configService.get<boolean>(
                'database.postgresql.migrationsRun',
              ),

              // Entities
              entities: [UserEntity, UserAddressEntity],
              autoLoadEntities: true,

              // Migrations
              migrations: ['dist/migrations/*.js'],
              migrationsTableName: 'migrations',

              // Subscribers
              subscribers: ['dist/subscribers/*.js'],

              // CLI settings for migrations
              cli: {
                migrationsDir: 'src/migrations',
                subscribersDir: 'src/subscribers',
              },
            };
          },
          inject: [ConfigService],
        }),

        // Feature modules for repositories
        TypeOrmModule.forFeature([UserEntity, UserAddressEntity]),
      ],
      exports: [TypeOrmModule],
    };
  }

  static forMock(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [],
      exports: [],
    };
  }
}
