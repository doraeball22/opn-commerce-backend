import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract update(user: User): Promise<void>;
  abstract delete(userId: string): Promise<void>; // Soft delete
  abstract permanentlyDelete(userId: string): Promise<void>; // Hard delete
  abstract exists(email: string): Promise<boolean>;
}
