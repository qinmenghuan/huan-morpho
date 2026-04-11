import { IsEthereumAddress } from 'class-validator';

export class RequestWalletLoginDto {
  @IsEthereumAddress()
  walletAddress: string; // 钱包地址
}
