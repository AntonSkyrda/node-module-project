import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Auto } from './auto.entity';

@Entity()
@Unique(['auto', 'name'])
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 55 })
  name: string;

  @ManyToOne(() => Auto, (auto) => auto.models, { onDelete: 'CASCADE' })
  auto: Auto;
}
