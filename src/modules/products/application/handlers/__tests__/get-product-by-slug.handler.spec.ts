import { Test, TestingModule } from '@nestjs/testing';
import { GetProductBySlugHandler } from '../get-product-by-slug.handler';
import { GetProductBySlugQuery } from '../../queries/get-product-by-slug.query';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { ProductSku } from '../../../domain/value-objects/product-sku.vo';
import { Money } from '../../../domain/value-objects/money.vo';

describe('GetProductBySlugHandler', () => {
  let handler: GetProductBySlugHandler;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    // Create mock repository with all required methods
    mockRepository = {
      findBySlug: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      permanentlyDelete: jest.fn(),
      restore: jest.fn(),
      exists: jest.fn(),
      existsBySku: jest.fn(),
      existsBySlug: jest.fn(),
      count: jest.fn(),
      findRelated: jest.fn(),
      findPopular: jest.fn(),
      findRecent: jest.fn(),
      findFeatured: jest.fn(),
      findOnSale: jest.fn(),
      updateStock: jest.fn(),
      bulkUpdateStock: jest.fn(),
      findLowStock: jest.fn(),
      findOutOfStock: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductBySlugHandler,
        {
          provide: 'ProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetProductBySlugHandler>(GetProductBySlugHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return product when found by slug', async () => {
      // Arrange
      const slug = 'test-product';
      const mockProduct = Product.create(
        'Test Product',
        slug,
        'Test description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );

      mockRepository.findBySlug.mockResolvedValue(mockProduct);

      const query = new GetProductBySlugQuery(slug);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockProduct);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(slug);
      expect(mockRepository.findBySlug).toHaveBeenCalledTimes(1);
    });

    it('should return null when product not found', async () => {
      // Arrange
      const slug = 'non-existent-product';
      mockRepository.findBySlug.mockResolvedValue(null);

      const query = new GetProductBySlugQuery(slug);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(slug);
      expect(mockRepository.findBySlug).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const slug = 'test-product';
      const error = new Error('Database connection failed');
      mockRepository.findBySlug.mockRejectedValue(error);

      const query = new GetProductBySlugQuery(slug);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(slug);
      expect(mockRepository.findBySlug).toHaveBeenCalledTimes(1);
    });

    it('should handle empty slug', async () => {
      // Arrange
      const slug = '';
      mockRepository.findBySlug.mockResolvedValue(null);

      const query = new GetProductBySlugQuery(slug);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(slug);
    });

    it('should handle special characters in slug', async () => {
      // Arrange
      const slug = 'product-with-special-chars';
      const mockProduct = Product.create(
        'Product with Special Chars',
        slug,
        'Test description',
        'Short desc',
        ProductSku.create('SPECIAL-001'),
        Money.create(1500, 'THB'),
      );

      mockRepository.findBySlug.mockResolvedValue(mockProduct);

      const query = new GetProductBySlugQuery(slug);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockProduct);
      expect(result?.slug).toBe(slug);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(slug);
    });
  });
});
