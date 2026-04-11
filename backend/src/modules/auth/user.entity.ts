import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  walletAddress: string;

  @Column('bigint')
  createdAt: number;

  @Column('bigint')
  updatedAt: number;
}
