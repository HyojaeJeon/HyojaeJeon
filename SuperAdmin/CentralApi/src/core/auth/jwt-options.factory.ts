import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export function createJwtModuleOptions(
  configService: ConfigService,
): JwtModuleOptions {
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
}
