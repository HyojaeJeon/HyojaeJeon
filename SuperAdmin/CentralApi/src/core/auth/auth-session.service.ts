/**
 * 한국어: AuthSessionService — JWT payload 에 대한 서버 권위 검증/재계산 진입점.
 *
 *   JwtStrategy 와 realtime socket handshake 가 공통으로 사용한다.
 *   - 계정 ACTIVE/deletedAt 검증
 *   - tenantContext 재계산
 *
 * Tiếng Việt: AuthSessionService — điểm vào cho xác thực/tính lại JWT payload.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { TenantContextService } from '@core/tenancy/tenant-context.service';
import { AuthUserType, isAuthUserType } from '@core/auth/constants/user-types.constant';
import { JwtPayload } from './decorators/current-user.decorator';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async resolveJwtPayload(payload: JwtPayload): Promise<JwtPayload> {
    if (!isAuthUserType(payload.userType)) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Invalid token user type' } });
    }

    const active = await this.isAccountActive(payload.userType, payload.sub);
    if (!active) {
      throw new DomainError({
        code: 'VALIDATION_ERROR',
        details: { reason: 'Account is inactive or deleted' },
      });
    }

    // JWT tenantContext 는 신뢰하지 않고 DB 기준으로 매 요청 재계산한다.
    const tenantContext = await this.tenantContext.resolve(payload.userType, payload.sub);
    return { ...payload, tenantContext };
  }

  private async isAccountActive(userType: AuthUserType, id: string): Promise<boolean> {
    const where = { id, status: 'ACTIVE', deletedAt: null } as const;
    switch (userType) {
      case 'SUPER_ADMIN':
        return !!(await this.prisma.superAdminUser.findFirst({ where, select: { id: true } }));
      case 'DISTRIBUTOR_USER':
        return !!(await this.prisma.distributorUser.findFirst({ where, select: { id: true } }));
      case 'BRAND_ADMIN':
        return !!(await this.prisma.brandAdminUser.findFirst({ where, select: { id: true } }));
      case 'CORPORATE_ADMIN':
        return !!(await this.prisma.corporateAdminUser.findFirst({ where, select: { id: true } }));
      default:
        return false;
    }
  }
}
