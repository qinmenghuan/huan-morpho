import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  provider: ethers.JsonRpcApiProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    (this.provider as any).pollingInterval = 15000;
  }

  getProvider() {
    return this.provider;
  }
}
