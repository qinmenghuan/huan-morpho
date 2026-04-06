import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Market {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  @Column()
  network: string; // e.g. 'ethereum', 'polygon', etc.

  @Column()
  collateralTokenAddress: string; // 抵押物的token地址

  @Column()
  collateralTokenName: string; // 抵押物的token地址

  @Column()
  loanTokenAddress: string; // 贷款的token地址

  @Column()
  loanTokenName: string; // 贷款的token地址

  @Column()
  totalCollateralAmount: string; // 总抵押物的数量

  @Column()
  totalLoanAmount: string; // 总贷款数量

  @Column()
  totalDebtAmount: string; // 总债务数量

  @Column('bigint')
  ltvBps: number; // 贷款价值比，单位是基点（bps），例如7500表示75%

  // @Column()
  // amount: string;

  @Column()
  txHash: string; // 交易哈希

  // Date.now() 例如1775180942589 是毫秒级别，所有需要用bigint存储
  @Column('bigint')
  timestamp: number;
}
