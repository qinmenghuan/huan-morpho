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

    const factoryContract = getMarketFactoryContract(
      this.blockchain.getProvider(),
    );
    factoryContract.on(
      'MarketCreated',
      async (market, collateralToken, loanToken, ltvBps, event) => {
        try {
          console.log(
            `Detected market creation: market=${market} collateralToken=${collateralToken} loanToken=${loanToken} ltvBps=${ltvBps.toString()}`,
          );

          // 多个合约一起请求,获取代币的名称
          const [collateralTokenName, loanTokenName] = await Promise.all([
            getNewContract(
              this.blockchain.getProvider(),
              collateralToken,
              ERC20ABI,
            ).name() as Promise<string>,
            getNewContract(
              this.blockchain.getProvider(),
              loanToken,
              ERC20ABI,
            ).name() as Promise<string>,
          ]);

          await this.marketRepo.save({
            marketAddress: market,
            network: 'ethereum',
            collateralTokenAddress: collateralToken,
            collateralTokenName,
            loanTokenAddress: loanToken,
            loanTokenName,
            totalCollateralAmount: '0',
            totalLoanAmount: '0',
            totalDebtAmount: '0',
            ltvBps: Number(ltvBps),
            txHash: event.log.transactionHash,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error('Failed to handle MarketCreated event', error);
        }
      },
    );
  }
}
