import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { LoanService } from './loan.service';

@Controller('loans')
export class LoanController {
  constructor(private service: LoanService) {}

  @Get()
  getLoans(
    @Query('id') marketAddress: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.service.getLoans(marketAddress, page, pageSize);
  }
}
