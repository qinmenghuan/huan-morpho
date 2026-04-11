import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class AuthNonce {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletAddress: string;

  @Column()
  nonce: string; // 随机字符串作为签名

  @Column('text')
  message: string; // 展示给用户看并要求其签名的完整文本内容

  @Column({ default: false })
  used: boolean; // 标记这个 Nonce 是否已经被验证过

  @Column('bigint')
  expiredAt: number;

  @Column('bigint')
  createdAt: number;
}
