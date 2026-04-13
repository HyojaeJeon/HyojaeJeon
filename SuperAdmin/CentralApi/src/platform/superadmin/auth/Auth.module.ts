/**
 * Auth 모듈
 * 한국어: JWT 기반 인증, Passport 전략, RBAC 역할 계층을 등록한다.
 *         JWT_SECRET은 운영 환경에서 반드시 안전한 값으로 설정해야 한다.
 * Tiếng Việt: Đăng ký xác thực dựa trên JWT, chiến lược Passport, và hệ thống phân cấp vai trò RBAC.
 *             JWT_SECRET phải được cấu hình giá trị an toàn trong môi trường sản xuất.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './Auth.service';
import { AuthResolver } from './Auth.resolver';
import { JwtStrategy } from '@core/auth/strategies/Jwt.strategy';
import { AuthSessionModule } from '@core/auth/AuthSession.module';
import { createJwtModuleOptions } from '@core/auth/JwtOptions.factory';
import { PlatformPolicyModule } from '../platformPolicy/PlatformPolicy.module';

@Module({
  imports: [
    PlatformPolicyModule,
    AuthSessionModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createJwtModuleOptions,
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
