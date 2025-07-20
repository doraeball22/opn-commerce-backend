import { UserAddress } from '../entities/user-address.entity';

export interface UserAddressRepository {
  save(userAddress: UserAddress): Promise<UserAddress>;
  findById(id: string): Promise<UserAddress | null>;
  findByUserId(userId: string): Promise<UserAddress[]>;
  findByUserIdAndType(userId: string, type: string): Promise<UserAddress[]>;
  findDefaultByUserId(userId: string): Promise<UserAddress | null>;
  update(userAddress: UserAddress): Promise<UserAddress>;
  delete(id: string): Promise<void>;
  setAsDefault(id: string, userId: string): Promise<void>;
  unsetDefault(userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
