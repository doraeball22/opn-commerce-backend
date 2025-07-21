import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, IsNull } from 'typeorm';
import { DatabaseAdapter } from './database.adapter';
import { User } from '../../domain/entities/user.entity';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { Gender } from '../../domain/value-objects/gender.vo';
import { Address } from '../../domain/value-objects/address.vo';
import { Location } from '../../domain/value-objects/location.vo';
import { UserEntity, UserAddressEntity } from '../persistence/entities';

/**
 * PostgreSQL database adapter implementation.
 * Integrates with TypeORM to provide persistent storage using PostgreSQL database.
 */
@Injectable()
export class PostgreSQLDatabaseAdapter implements DatabaseAdapter {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserAddressEntity)
    private readonly addressRepo: Repository<UserAddressEntity>,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  // Connection management
  async connect(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }
      console.log('🗃️  PostgreSQL Database: Connected');
    } catch (error) {
      console.error('❌ PostgreSQL Database: Connection failed', error);
      throw new Error(
        `Failed to connect to PostgreSQL database: ${error.message}`,
      );
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
      console.log('🔌 PostgreSQL Database: Disconnected');
    } catch (error) {
      console.error('❌ PostgreSQL Database: Disconnection failed', error);
    }
  }

  isConnected(): boolean {
    return this.dataSource.isInitialized;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
      return false;
    }
  }

  // Transaction support
  async beginTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  // User operations
  async saveUser(user: User): Promise<User> {
    try {
      const userEntity = this.mapDomainToEntity(user);
      const savedEntity = await this.userRepo.save(userEntity);
      return this.mapEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const entity = await this.userRepo.findOne({
        where: { id, deleted_at: IsNull() },
      });
      return entity ? this.mapEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const entity = await this.userRepo.findOne({
        where: { email, deleted_at: IsNull() },
      });
      return entity ? this.mapEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      const userEntity = this.mapDomainToEntity(user);
      const savedEntity = await this.userRepo.save(userEntity);
      return this.mapEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepo.softDelete(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async permanentlyDeleteUser(id: string): Promise<void> {
    try {
      await this.dataSource.manager.transaction(async (manager) => {
        // Delete all user addresses first (foreign key constraint)
        await manager.delete(UserAddressEntity, { userId: id });

        // Then delete the user
        await manager.delete(UserEntity, { id });
      });
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      throw new Error(`Failed to permanently delete user: ${error.message}`);
    }
  }

  // User Address operations
  async saveUserAddress(address: UserAddress): Promise<UserAddress> {
    try {
      const addressEntity = this.mapAddressDomainToEntity(address);
      const savedEntity = await this.addressRepo.save(addressEntity);
      return this.mapAddressEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error saving user address:', error);
      throw new Error(`Failed to save user address: ${error.message}`);
    }
  }

  async findUserAddressById(id: string): Promise<UserAddress | null> {
    try {
      const entity = await this.addressRepo.findOne({
        where: { id, deleted_at: IsNull() },
      });
      return entity ? this.mapAddressEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding user address by ID:', error);
      throw new Error(`Failed to find user address by ID: ${error.message}`);
    }
  }

  async findUserAddressesByUserId(userId: string): Promise<UserAddress[]> {
    try {
      const entities = await this.addressRepo.find({
        where: { user_id: userId, deleted_at: IsNull() },
        order: { created_at: 'DESC' },
      });
      return entities.map((entity) => this.mapAddressEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding user addresses by user ID:', error);
      throw new Error(
        `Failed to find user addresses by user ID: ${error.message}`,
      );
    }
  }

  async findUserAddressesByUserIdAndType(
    userId: string,
    type: string,
  ): Promise<UserAddress[]> {
    try {
      const entities = await this.addressRepo.find({
        where: { user_id: userId, type, deleted_at: IsNull() },
        order: { created_at: 'DESC' },
      });
      return entities.map((entity) => this.mapAddressEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding user addresses by user ID and type:', error);
      throw new Error(
        `Failed to find user addresses by user ID and type: ${error.message}`,
      );
    }
  }

  async findDefaultUserAddressByUserId(
    userId: string,
  ): Promise<UserAddress | null> {
    try {
      const entity = await this.addressRepo.findOne({
        where: { user_id: userId, is_default: true, deleted_at: IsNull() },
      });
      return entity ? this.mapAddressEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding default user address:', error);
      throw new Error(`Failed to find default user address: ${error.message}`);
    }
  }

  async updateUserAddress(address: UserAddress): Promise<UserAddress> {
    try {
      const addressEntity = this.mapAddressDomainToEntity(address);
      const savedEntity = await this.addressRepo.save(addressEntity);
      return this.mapAddressEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error updating user address:', error);
      throw new Error(`Failed to update user address: ${error.message}`);
    }
  }

  async deleteUserAddress(id: string): Promise<void> {
    try {
      await this.addressRepo.softDelete(id);
    } catch (error) {
      console.error('Error deleting user address:', error);
      throw new Error(`Failed to delete user address: ${error.message}`);
    }
  }

  async setUserAddressAsDefault(id: string, userId: string): Promise<void> {
    const queryRunner = await this.beginTransaction();

    try {
      // First, unset all default addresses for the user
      await queryRunner.manager.update(
        UserAddressEntity,
        { user_id: userId, deleted_at: IsNull() },
        { is_default: false },
      );

      // Then, set the specified address as default
      await queryRunner.manager.update(
        UserAddressEntity,
        { id, user_id: userId, deleted_at: IsNull() },
        { is_default: true },
      );

      await this.commitTransaction(queryRunner);
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      console.error('Error setting user address as default:', error);
      throw new Error(
        `Failed to set user address as default: ${error.message}`,
      );
    }
  }

  async unsetUserAddressDefaults(userId: string): Promise<void> {
    try {
      await this.addressRepo.update(
        { user_id: userId, deleted_at: IsNull() },
        { is_default: false },
      );
    } catch (error) {
      console.error('Error unsetting user address defaults:', error);
      throw new Error(
        `Failed to unset user address defaults: ${error.message}`,
      );
    }
  }

  async countUserAddressesByUserId(userId: string): Promise<number> {
    try {
      return await this.addressRepo.count({
        where: { user_id: userId, deleted_at: IsNull() },
      });
    } catch (error) {
      console.error('Error counting user addresses:', error);
      throw new Error(`Failed to count user addresses: ${error.message}`);
    }
  }

  // Private mapping methods
  private mapDomainToEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email.value;
    entity.password = user.password.value;
    entity.name = user.name;
    entity.date_of_birth = user.dateOfBirth;
    entity.gender = user.gender.value;
    entity.subscribed_to_newsletter = user.subscribedToNewsletter;
    entity.created_at = user.createdAt;
    entity.updated_at = user.updatedAt;
    entity.deleted_at = user.deletedAt;
    return entity;
  }

  private mapEntityToDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      new Email(entity.email),
      new Password(entity.password, true), // Already hashed
      entity.name,
      entity.date_of_birth,
      new Gender(entity.gender),
      entity.subscribed_to_newsletter,
      entity.created_at,
      entity.updated_at,
      entity.deleted_at,
    );
  }

  private mapAddressDomainToEntity(address: UserAddress): UserAddressEntity {
    const entity = new UserAddressEntity();
    entity.id = address.id;
    entity.user_id = address.userId;
    entity.street = address.address.getStreet();
    entity.city = address.address.getCity();
    entity.state = address.address.getState();
    entity.postal_code = address.address.getPostalCode();
    entity.country = address.address.getCountry();
    entity.type = address.type;
    entity.label = address.label;
    entity.is_default = address.isDefault;
    entity.latitude = address.location?.latitude;
    entity.longitude = address.location?.longitude;
    entity.delivery_instructions = address.deliveryInstructions;
    entity.created_at = address.createdAt;
    entity.updated_at = address.updatedAt;
    entity.deleted_at = address.deletedAt;
    return entity;
  }

  private mapAddressEntityToDomain(entity: UserAddressEntity): UserAddress {
    const addressVO = new Address(
      entity.street,
      entity.city,
      entity.state,
      entity.postal_code,
      entity.country,
    );

    const locationVO =
      entity.latitude && entity.longitude
        ? new Location(entity.latitude, entity.longitude)
        : undefined;

    return new UserAddress(
      entity.id,
      entity.user_id,
      addressVO,
      entity.type as AddressType,
      entity.label,
      entity.is_default,
      locationVO,
      entity.delivery_instructions,
      entity.created_at,
      entity.updated_at,
      entity.deleted_at,
    );
  }
}
