import { IsEthereumAddress, IsString } from 'class-validator';

export class VerifyWalletLoginDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  message: string;

  @IsString()
  signature: string;
}
