import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * TypeORM UserAddress Entity for PostgreSQL persistence.
 * Maps domain UserAddress entity to database table.
 */
@Entity('user_addresses')
@Index(['user_id', 'is_default'], {
  where: 'deleted_at IS NULL AND is_default = true',
})
@Index(['user_id'], { where: 'deleted_at IS NULL' })
export class UserAddressEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  // Address components
  @Column('varchar', { length: 255 })
  street: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  state: string;

  @Column('varchar', { length: 20 })
  postal_code: string;

  @Column('varchar', { length: 100 })
  country: string;

  // Address metadata
  @Column('varchar', { length: 50 })
  type: string; // HOME, WORK, BILLING, SHIPPING, OTHER

  @Column('varchar', { length: 100 })
  label: string;

  @Column('boolean', { default: false })
  is_default: boolean;

  // Geolocation (optional)
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Delivery instructions
  @Column('text', { nullable: true })
  delivery_instructions?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  // Relationships
  @ManyToOne(() => UserEntity, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
