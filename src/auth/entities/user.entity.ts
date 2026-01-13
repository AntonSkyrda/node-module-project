import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { UserRoleEnum } from '../../constants/user-role.enum';
import { Token } from './token.entity';
import { Account } from './account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 55, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 55 })
  firstName: string;

  @Column({ type: 'varchar', length: 55 })
  lastName: string;

  @Column({ type: 'enum', enum: UserRoleEnum })
  role: UserRoleEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  isActive: boolean;

  @Column()
  isBlocked: boolean;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToOne(() => Account, (account) => account.user, { nullable: true })
  account?: Account;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) return;

    if (this.password.startsWith('$argon2')) return;

    this.password = await argon2.hash(this.password);
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!password) return false;
    if (!this.password) return false;

    try {
      return await argon2.verify(this.password, password);
    } catch {
      return false;
    }
  }
}
