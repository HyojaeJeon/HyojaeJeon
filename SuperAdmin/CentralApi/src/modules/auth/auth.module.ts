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
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PosAuthController } from './pos-auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        /**
         * 한국어: 운영 환경에서 안전하지 않은 기본 JWT 시크릿 사용을 차단한다.
         * Tiếng Việt: Chặn sử dụng JWT secret mặc định không an toàn trong môi trường sản xuất.
         */
        const secret = configService.get<string>('JWT_SECRET');
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        if (nodeEnv === 'production' && (!secret || secret === 'change-me-in-production')) {
          throw new Error('JWT_SECRET must be configured securely in production');
        }

        return {
          secret: secret || 'change-me-in-production',
          signOptions: {
            expiresIn: configService.get<number>('JWT_EXPIRES_SECONDS', 86400),
          },
        };
      },
    }),
  ],
  controllers: [PosAuthController],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
