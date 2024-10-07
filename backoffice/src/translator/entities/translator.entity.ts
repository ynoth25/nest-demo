import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TranslatorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}