import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthNonce } from './auth-nonce.entity';
import { User } from './user.entity';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthNonce, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? ('7d' as any),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  //
  exports: [AuthService],
})
export class AuthModule {}
