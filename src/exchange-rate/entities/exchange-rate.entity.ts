import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  provider!: 'PRIVATBANK';

  @Column({ type: 'date' })
  asOfDate!: string;

  @Column({ type: 'timestamptz' })
  fetchedAt!: Date;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  usdBuy!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  usdSale!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  eurBuy!: string;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  eurSale!: string;

  @Column({ type: 'jsonb', nullable: true })
  raw?: unknown;
}
