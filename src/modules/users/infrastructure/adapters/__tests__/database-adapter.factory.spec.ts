import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseAdapterFactory,
  DatabaseType,
} from '../database-adapter.factory';
import { MockDatabaseAdapter } from '../mock-database.adapter';
import { PostgreSQLDatabaseAdapter } from '../postgresql-database.adapter';

describe('DatabaseAdapterFactory', () => {
  let factory: DatabaseAdapterFactory;
  let configService: ConfigService;
  let mockAdapter: MockDatabaseAdapter;
  let postgresAdapter: PostgreSQLDatabaseAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseAdapterFactory,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MockDatabaseAdapter,
          useValue: {
            connect: jest.fn(),
            disconnect: jest.fn(),
            isConnected: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PostgreSQLDatabaseAdapter,
          useValue: {
            connect: jest.fn(),
            disconnect: jest.fn(),
            isConnected: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    factory = module.get<DatabaseAdapterFactory>(DatabaseAdapterFactory);
    configService = module.get<ConfigService>(ConfigService);
    mockAdapter = module.get<MockDatabaseAdapter>(MockDatabaseAdapter);
    postgresAdapter = module.get<PostgreSQLDatabaseAdapter>(
      PostgreSQLDatabaseAdapter,
    );
  });

  describe('createAdapter', () => {
    it('should create mock adapter when configured for mock', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.MOCK);

      const adapter = factory.createAdapter();

      expect(adapter).toBe(mockAdapter);
    });

    it('should create PostgreSQL adapter when configured for postgresql', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.POSTGRESQL);

      const adapter = factory.createAdapter();

      expect(adapter).toBe(postgresAdapter);
    });

    it('should fallback to mock adapter for invalid configuration', () => {
      jest.spyOn(configService, 'get').mockReturnValue('invalid-type');

      const adapter = factory.createAdapter();

      expect(adapter).toBe(mockAdapter);
    });

    it('should fallback to mock adapter when no configuration provided', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const adapter = factory.createAdapter();

      expect(adapter).toBe(mockAdapter);
    });
  });

  describe('getDatabaseInfo', () => {
    it('should return mock database info', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.MOCK);

      const info = factory.getDatabaseInfo();

      expect(info.type).toBe(DatabaseType.MOCK);
      expect(info.description).toContain('mock database');
      expect(info.features).toContain('Fast startup');
    });

    it('should return PostgreSQL database info', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.POSTGRESQL);

      const info = factory.getDatabaseInfo();

      expect(info.type).toBe(DatabaseType.POSTGRESQL);
      expect(info.description).toContain('PostgreSQL');
      expect(info.features).toContain('ACID compliance');
    });
  });

  describe('isProductionReady', () => {
    it('should return false for mock database', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.MOCK);

      const isReady = factory.isProductionReady();

      expect(isReady).toBe(false);
    });

    it('should return true for PostgreSQL database', () => {
      jest.spyOn(configService, 'get').mockReturnValue(DatabaseType.POSTGRESQL);

      const isReady = factory.isProductionReady();

      expect(isReady).toBe(true);
    });
  });

  describe('getRecommendedType', () => {
    it('should recommend PostgreSQL for production environment', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return DatabaseType.MOCK;
      });

      const recommended = factory.getRecommendedType();

      expect(recommended).toBe(DatabaseType.POSTGRESQL);
    });

    it('should recommend PostgreSQL for staging environment', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'staging';
        return DatabaseType.MOCK;
      });

      const recommended = factory.getRecommendedType();

      expect(recommended).toBe(DatabaseType.POSTGRESQL);
    });

    it('should recommend mock for test environment', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        return DatabaseType.MOCK;
      });

      const recommended = factory.getRecommendedType();

      expect(recommended).toBe(DatabaseType.MOCK);
    });

    it('should recommend mock for development environment', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return DatabaseType.MOCK;
      });

      const recommended = factory.getRecommendedType();

      expect(recommended).toBe(DatabaseType.MOCK);
    });
  });
});
