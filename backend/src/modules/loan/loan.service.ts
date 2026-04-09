import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async getLoans(marketAddress: string, page = 1, pageSize = 10) {
    // 确保分页参数合理
    const safePage = Math.max(page, 1);
    // 限制每页最大数量，防止过大请求
    const safePageSize = Math.min(Math.max(pageSize, 1), 100);

    // 查询分页
    const [items, total] = await this.loanRepository.findAndCount({
      where: {
        marketAddress,
      },
      order: {
        timestamp: 'DESC',
      },
      // 计算跳过的记录数和获取的记录数
      skip: (safePage - 1) * safePageSize,
      // 获取的记录数
      take: safePageSize,
    });

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      // 计算总页数,向上取整
      totalPages: Math.ceil(total / safePageSize),
    };
  }
}
