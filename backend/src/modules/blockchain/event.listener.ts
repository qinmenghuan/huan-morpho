import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import {
  getLoanContract,
  getMarketFactoryContract,
  getNewContract,
} from './contract';
import { Repository } from 'typeorm';
import { Loan } from '../loan/loan.entity';
import { Market } from '../market/market.entity';
import { InjectRepository } from '@nestjs/typeorm';
import ERC20ABI from './ERC20ABI.json';

@Injectable()
export class EventListener implements OnModuleInit {
  constructor(
    private blockchain: BlockchainService,
    @InjectRepository(Loan)
    private loanRepo: Repository<Loan>,
    @InjectRepository(Market)
    private marketRepo: Repository<Market>,
  ) {}

  onModuleInit() {
    // 借贷市场监听
    const contract = getLoanContract(this.blockchain.getProvider());
    contract.on('Deposited', async (user, amount, event) => {
      console.log(
        `Detected deposit: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        user,
        type: 'deposit',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
    });

    // 市场工厂合约监听
    const factoryContract = getMarketFactoryContract(
      this.blockchain.getProvider(),
    );
    factoryContract.on(
      'createMarket',
      async (market, collateralToken, loanToken, ltvBps) => {
        console.log(
          `Detected market creation: market=${market} collateralToken=${collateralToken} loanToken=${loanToken} ltvBps=${ltvBps.toString()} `,
        );

        // TODO: collateralTokenAddress 查询合约代币的名称
        const collateralTokenName = getNewContract(
          this.blockchain.getProvider(),
          collateralToken,
          ERC20ABI,
        ).name() as Promise<string>;
        // await this.blockchain.getTokenName(collateralToken);
        // TODO: loanTokenAddress 查询合约代币的名称
        const loanTokenName = getNewContract(
          this.blockchain.getProvider(),
          loanToken,
          ERC20ABI,
        ).name() as Promise<string>;

        await this.marketRepo.save({
          network: 'ethereum', // TODO: 需要根据实际情况设置
          collateralTokenAddress: collateralToken,
          collateralTokenName: collateralTokenName, // TODO: 需要根据实际情况设置
          loanTokenAddress: loanToken,
          loanTokenName: loanTokenName, // TODO: 需要根据实际情况设置
          totalCollateralAmount: '0',
          totalLoanAmount: '0',
          totalDebtAmount: '0',
          ltvBps: ltvBps.toNumber(),
          timestamp: Date.now(),
        });
      },
    );
  }
}
