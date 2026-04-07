import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from './market.entity';
import { resolveObjectURL } from 'buffer';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Market)
    private readonly marketRepository: Repository<Market>, // 注入 Repository
  ) {}

  // 获取所有的市场
  async getMarkets(): Promise<Market[]> {
    return await this.marketRepository.find();
  }

  async findOne(id: number): Promise<Market | null> {
    return await this.marketRepository.findOneBy({ id });
  }
}
