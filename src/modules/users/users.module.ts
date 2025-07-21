import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/controllers/users.controller';
import { UserAddressesController } from './presentation/controllers/user-addresses.controller';
import { AuthGuard } from './presentation/guards/auth.guard';
import { BearerTokenGuard } from './presentation/guards/bearer-token.guard';
import { UserRepository } from './domain/repositories/user.repository';
import { UserAddressRepository } from './domain/repositories/user-address.repository';
import { AdapterUserRepository } from './infrastructure/repositories/adapter-user.repository';
import { AdapterUserAddressRepository } from './infrastructure/repositories/adapter-user-address.repository';
import { DatabaseAdapter } from './infrastructure/adapters/database.adapter';
import { MockDatabaseAdapter } from './infrastructure/adapters/mock-database.adapter';
import { PostgreSQLDatabaseAdapter } from './infrastructure/adapters/postgresql-database.adapter';
import {
  DatabaseAdapterFactory,
  PostgreSQLDatabaseAdapterFactory,
} from './infrastructure/adapters/database-adapter.factory';
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';
import { UseCases } from './application/use-cases';
import { ApplicationServices } from './application/services';
import { AddUserAddressHandler } from './application/handlers/add-user-address.handler';
import { UpdateUserAddressHandler } from './application/handlers/update-user-address.handler';
import { DeleteUserAddressHandler } from './application/handlers/delete-user-address.handler';
import { SetDefaultAddressHandler } from './application/handlers/set-default-address.handler';
import { GetUserAddressesHandler } from './application/handlers/get-user-addresses.handler';
import { AddressValidationService } from './application/validators/address-validation.service';
import {
  UserEntity,
  UserAddressEntity,
} from './infrastructure/persistence/entities';

@Module({
  imports: [
    CqrsModule,
    ...(process.env.DATABASE_TYPE === 'postgresql'
      ? [TypeOrmModule.forFeature([UserEntity, UserAddressEntity])]
      : []),
  ],
  controllers: [UsersController, UserAddressesController],
  providers: [
    // Database Adapters
    MockDatabaseAdapter,
    ...(process.env.DATABASE_TYPE === 'postgresql'
      ? [PostgreSQLDatabaseAdapter, PostgreSQLDatabaseAdapterFactory]
      : []),
    DatabaseAdapterFactory,

    // Database Adapter Provider
    {
      provide: 'DatabaseAdapter',
      useFactory: (
        mockFactory: DatabaseAdapterFactory,
        postgresFactory?: PostgreSQLDatabaseAdapterFactory,
      ) => {
        const databaseType = process.env.DATABASE_TYPE || 'mock';
        let adapter: DatabaseAdapter;

        if (databaseType === 'postgresql' && postgresFactory) {
          adapter = postgresFactory.createAdapter();
        } else {
          adapter = mockFactory.createAdapter();
        }

        // Initialize connection if supported
        if (adapter.connect) {
          adapter.connect().catch(console.error);
        }
        return adapter;
      },
      inject: [
        DatabaseAdapterFactory,
        ...(process.env.DATABASE_TYPE === 'postgresql'
          ? [PostgreSQLDatabaseAdapterFactory]
          : []),
      ],
    },

    // Repository Implementations using Adapter Pattern
    {
      provide: 'UserRepository',
      useClass: AdapterUserRepository,
    },
    {
      provide: 'UserAddressRepository',
      useClass: AdapterUserAddressRepository,
    },

    // Repository Classes
    AdapterUserRepository,
    AdapterUserAddressRepository,

    // Application
    ...CommandHandlers,
    ...QueryHandlers,
    ...UseCases,
    ...ApplicationServices,

    // Address handlers
    AddUserAddressHandler,
    UpdateUserAddressHandler,
    DeleteUserAddressHandler,
    SetDefaultAddressHandler,
    GetUserAddressesHandler,

    // Validators
    AddressValidationService,

    // Presentation
    AuthGuard,
    BearerTokenGuard,
  ],
  exports: [
    'UserRepository',
    'UserAddressRepository',
    'DatabaseAdapter',
    DatabaseAdapterFactory,
  ],
})
export class UsersModule {}
