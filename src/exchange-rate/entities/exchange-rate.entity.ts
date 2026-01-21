import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('exchange_rates')
@Index(['provider', 'asOfDate'], { unique: true }) // опціонально, але бажано
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  provider!: 'PRIVATBANK';

  @Column({ type: 'date' })
  asOfDate!: string;

  @Column({ type: 'datetime' })
  @CreateDateColumn()
  fetchedAt!: Date;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  usdBuy!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  usdSale!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  eurBuy!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  eurSale!: string;

  @Column({ type: 'json', nullable: true })
  raw?: unknown;
}
