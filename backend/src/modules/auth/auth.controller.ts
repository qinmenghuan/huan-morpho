import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RequestWalletLoginDto } from './dto/request-wallet-login.dto';
import { VerifyWalletLoginDto } from './dto/verify-wallet-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wallet/request')
  requestWalletLogin(@Body() dto: RequestWalletLoginDto) {
    this.authService.requestWalletLogin(dto.walletAddress);
  }

  @Post('wallet/verify')
  verifyWalletLogin(@Body() dto: VerifyWalletLoginDto) {
    return this.authService.verifyWalletLogin(
      dto.walletAddress,
      dto.message,
      dto.signature,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req) {
    return this.authService.getMe(req.user.userId);
  }
}
