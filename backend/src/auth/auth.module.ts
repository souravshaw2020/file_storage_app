import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Makes the JwtService available anywhere
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
      signOptions: { expiresIn: '1d' }, // Tokens expire in 1 day
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
