import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EventListener } from './event.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../loan/loan.entity';
import { Market } from '../market/market.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Market])],
  providers: [BlockchainService, EventListener],
  exports: [BlockchainService],
})
export class BlockchainModule {}
