import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'language'})
export class LanguageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}