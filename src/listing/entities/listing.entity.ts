import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Auto } from '../../auto/entities/auto.entity';
import { Model } from '../../auto/entities/model.entity';
import { ListingStatusEnum } from '../../constants/listening-status.enum';
import { CurrencyEnum } from '../../constants/currency.enum';

@Entity('car_listings')
export class CarListing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  seller: User;

  @ManyToOne(() => Auto, { eager: true })
  auto: Auto;

  @ManyToOne(() => Model, { eager: true })
  model: Model;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int', unsigned: true })
  mileage: number;

  @Column({ type: 'varchar', length: 55 })
  city: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  // ✅ what user entered
  @Column({ type: 'enum', enum: CurrencyEnum })
  originalCurrency: CurrencyEnum;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  originalAmount: string;

  // ✅ calculated prices (cached)
  @Index()
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  priceUah: string;

  @Index()
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  priceUsd: string;

  @Index()
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  priceEur: string;

  @Column({ type: 'int', nullable: true })
  currentRateId?: number | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  currentRateSide?: 'BUY' | 'SALE' | null;

  @Column({ type: 'datetime', nullable: true })
  recalculatedAt?: Date | null;

  @Column({ type: 'int', nullable: true })
  createdRateId?: number | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  createdRateSide?: 'BUY' | 'SALE' | null;

  @Column({
    type: 'enum',
    enum: ListingStatusEnum,
    default: ListingStatusEnum.NEEDS_EDIT,
  })
  @Index()
  status: ListingStatusEnum;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  moderationFails: number;

  @Column({ type: 'json', nullable: true })
  flaggedWords?: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
