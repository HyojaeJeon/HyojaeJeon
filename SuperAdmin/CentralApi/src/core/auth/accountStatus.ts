/**
 * 한국어: isAccountActive — 사용자 계정이 DB에서 활성(ACTIVE) 상태인지 확인하는 공용 함수.
 *   userType에 따라 해당 테이블(superAdminUser, distributorUser 등)을 조회합니다.
 *   AuthSessionService와 PermissionService 양쪽에서 사용됩니다.
 *
 * Tiếng Việt: isAccountActive — Hàm dùng chung kiểm tra tài khoản có trạng thái ACTIVE trong DB.
 *   Tùy userType mà truy vấn bảng tương ứng (superAdminUser, distributorUser, v.v.).
 *   Được sử dụng bởi cả AuthSessionService và PermissionService.
 */
import type { PrismaService } from '@core/prisma/Prisma.service';
import type { AuthUserType } from '@core/auth/constants/UserTypes.constant';

export async function isAccountActive(
  prisma: PrismaService,
  userType: AuthUserType,
  userId: string,
): Promise<boolean> {
  const where = { id: userId, status: 'ACTIVE', deletedAt: null } as const;
  switch (userType) {
    case 'SUPER_ADMIN':
      return !!(await prisma.superAdminUser.findFirst({ where, select: { id: true } }));
    case 'DISTRIBUTOR_USER':
      return !!(await prisma.distributorUser.findFirst({ where, select: { id: true } }));
    case 'BRAND_ADMIN':
      return !!(await prisma.brandAdminUser.findFirst({ where, select: { id: true } }));
    case 'CORPORATE_ADMIN':
      return !!(await prisma.corporateAdminUser.findFirst({ where, select: { id: true } }));
    default:
      return false;
  }
}
