import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Model } from './model.entity';

@Entity()
export class Auto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 55, unique: true })
  mark: string;

  @OneToMany(() => Model, (model) => model.auto)
  models: Model[];
}
