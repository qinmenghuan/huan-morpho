import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './blockchain.service';
import {
  getLoanContract,
  getMarketFactoryContract,
  getNewContract,
} from './contract';
import { Loan } from '../loan/loan.entity';
import { Market } from '../market/market.entity';
import ERC20ABI from './ERC20ABI.json';

@Injectable()
export class EventListener implements OnModuleInit {
  // 监听的市场地址集合，避免重复监听同一市场
  private readonly listenedMarkets = new Set<string>();
  // 待执行的市场数据刷新定时器，key为市场地址，value为定时器ID
  private readonly pendingMarketRefresh = new Map<string, NodeJS.Timeout>();
  // 正在执行数据刷新的市场地址集合，避免重复刷新同一市场
  private readonly runningMarketRefresh = new Set<string>();

  constructor(
    private blockchain: BlockchainService,
    @InjectRepository(Loan)
    private loanRepo: Repository<Loan>,
    @InjectRepository(Market)
    private marketRepo: Repository<Market>,
  ) {}

  onModuleInit() {
    this.addLoanContractListener();

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

          this.addLoanContractListener(market);
          this.scheduleMarketDataUpdate(market);
        } catch (error) {
          console.error('Failed to handle MarketCreated event', error);
        }
      },
    );
  }

  // 添加借贷市场相关的事件监听
  addLoanContractListener(loanContractAddress = process.env.LOAN_CONTRACT!) {
    // 防止重复监听
    if (this.listenedMarkets.has(loanContractAddress)) {
      return;
    }
    this.listenedMarkets.add(loanContractAddress);

    const contract = getLoanContract(
      this.blockchain.getProvider(),
      loanContractAddress,
    );

    contract.on('Deposited', async (user, amount, event) => {
      console.log(
        `Detected deposit: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'deposit',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });

    contract.on('WithDrawn', async (user, amount, event) => {
      console.log(
        `Detected withdraw: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'withdraw',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });

    contract.on('CollateralSupplied', async (user, amount, event) => {
      console.log(
        `Detected collateral supplied: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'collateral_supplied',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });

    contract.on('CollateralWithdrawn', async (user, amount, event) => {
      console.log(
        `Detected collateral withdrawn: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'collateral_withdrawn',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });

    contract.on('Borrowed', async (user, amount, event) => {
      console.log(`Detected borrow: user=${user}, amount=${amount.toString()}`);
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'borrowed',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });

    contract.on('Repaid', async (user, amount, event) => {
      console.log(`Detected repay: user=${user}, amount=${amount.toString()}`);
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'repaid',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      this.scheduleMarketDataUpdate(loanContractAddress);
    });
  }

  scheduleMarketDataUpdate(marketAddress: string, delayMs = 3000) {
    // 判断是否存在相同的市场地址，如果存在则清除
    const existingTimer = this.pendingMarketRefresh.get(marketAddress);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 定义计时器
    const timer = setTimeout(async () => {
      this.pendingMarketRefresh.delete(marketAddress);
      await this.updateMarketData(marketAddress);
    }, delayMs);

    // 存储待更新的键值对
    this.pendingMarketRefresh.set(marketAddress, timer);
  }

  // 更新市场数据
  async updateMarketData(marketAddress: string) {
    // 检查执行中是否有相同的市场，如果有则不要重复更新
    if (this.runningMarketRefresh.has(marketAddress)) {
      return;
    }

    this.runningMarketRefresh.add(marketAddress);

    try {
      const contract = getLoanContract(
        this.blockchain.getProvider(),
        marketAddress,
      );
      const market = await this.marketRepo.findOneBy({ marketAddress });

      if (!market) {
        return;
      }

      const stats = (await contract.stats()) as {
        totalDeposits: bigint;
        totalCollateral: bigint;
        totalDebt: bigint;
      };

      await this.marketRepo.update(
        { id: market.id },
        {
          totalLoanAmount: stats.totalDeposits.toString(),
          totalCollateralAmount: stats.totalCollateral.toString(),
          totalDebtAmount: stats.totalDebt.toString(),
          timestamp: Date.now(),
        },
      );
    } catch (error) {
      console.error(`Failed to update market data for ${marketAddress}`, error);
    } finally {
      this.runningMarketRefresh.delete(marketAddress);
    }
  }
}
