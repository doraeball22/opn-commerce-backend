import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserAddressEntity } from './user-address.entity';

/**
 * TypeORM User Entity for PostgreSQL persistence.
 * Maps domain User aggregate to database table.
 */
@Entity('users')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('date')
  date_of_birth: Date;

  @Column('varchar', { length: 20 })
  gender: string;

  @Column('boolean', { default: false })
  subscribed_to_newsletter: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  // Relationships
  @OneToMany(() => UserAddressEntity, (address) => address.user, {
    cascade: true,
  })
  addresses: UserAddressEntity[];
}
