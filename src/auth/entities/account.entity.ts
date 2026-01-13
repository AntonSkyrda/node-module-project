import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AccountTypeEnum } from '../../constants/account-type.enum';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.account, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: AccountTypeEnum,
    default: AccountTypeEnum.BASIC,
  })
  type: AccountTypeEnum;
}
