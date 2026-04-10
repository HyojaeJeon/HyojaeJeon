/**
 * 한국어: 통합 인증 서비스.
 *   SuperAdmin / DistributorUser / BrandAdminUser / CorporateAdminUser 의 로그인,
 *   계정 CRUD, 비밀번호 변경, JWT 발급을 중앙에서 처리한다.
 *
 * Tiếng Việt: Service xác thực hợp nhất.
 *   Xử lý login, CRUD tài khoản, đổi mật khẩu và phát hành JWT cho mọi loại tài khoản.
 */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/prisma/prisma.service';
import { RedisService } from '@core/redis/redis.service';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { PermissionService } from '@core/rbac/permission.service';
import { TenantContextService } from '@core/tenancy/tenant-context.service';
import { AuditService } from '@core/audit/audit.service';
import { CachePolicies } from '@core/cache/cache-policies';
import { PlatformPolicyService } from '@platform/superadmin/platform-policy/platform-policy.service';
import { AuthUserType, DEFAULT_AUTH_USER_TYPE, isAuthUserType } from '@core/auth/constants/user-types.constant';
import { CreateAuthAccountInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { UpdateAuthAccountInput } from './dto/update-user.input';
import { AuthAccountModel } from './models/auth-account.model';
import { DomainError } from '@core/errors/domain-error';

export interface AuthActor {
  userType: AuthUserType;
  userId: string;
  tenantContext?: {
    distributorId?: string;
    brandHQId?: string;
    branchId?: string;
    corporateId?: string;
  };
}

interface AuthTenantContext {
  distributorId?: string;
  brandHQId?: string;
  branchId?: string;
  corporateId?: string;
}

interface AuthAccountRow {
  id: string;
  loginId: string;
  passwordHash: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: string;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  distributorId?: string | null;
  brandHQId?: string | null;
  corporateId?: string | null;
}

type AuthAccountRecord = AuthAccountModel & {
  passwordHash: string;
  deletedAt?: Date | null;
};

type AuthAccountListRow = AuthAccountRow & {
  userType: AuthUserType;
};

@Injectable()
export class AuthService {
  // 한국어: 로그인 rate limit 기본값 — PlatformPolicy 키 'auth.max_login_attempts' / 'auth.login_window_seconds'
  //   가 없으면 fallback 으로 사용된다. 운영 시 PlatformPolicy 로 동적 조정 가능.
  // Tiếng Việt: Giá trị mặc định cho rate limit đăng nhập.
  private readonly defaultLoginAttemptLimit = 10;
  private readonly defaultLoginWindowSeconds = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly permission: PermissionService,
    private readonly tenantContextService: TenantContextService,
    private readonly audit: AuditService,
    private readonly platformPolicy: PlatformPolicyService,
  ) {}

  private normalizeUserType(userType?: string): AuthUserType {
    if (!userType) return DEFAULT_AUTH_USER_TYPE;
    if (!isAuthUserType(userType)) {
      throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }
    return userType;
  }

  private requireScopeForUserType(
    userType: AuthUserType,
    scope: {
      distributorId?: string | null;
      brandHqId?: string | null;
      corporateId?: string | null;
    },
  ) {
    switch (userType) {
      case 'SUPER_ADMIN':
        return;
      case 'DISTRIBUTOR_USER':
        if (!scope.distributorId) {
          throw new DomainError({ code: 'SCOPE_REQUIRED', params: { userType, scope: 'distributorId' } });
        }
        return;
      case 'BRAND_ADMIN':
        if (!scope.brandHqId) {
          throw new DomainError({ code: 'SCOPE_REQUIRED', params: { userType, scope: 'brandHqId' } });
        }
        return;
      case 'CORPORATE_ADMIN':
        if (!scope.corporateId) {
          throw new DomainError({ code: 'SCOPE_REQUIRED', params: { userType, scope: 'corporateId' } });
        }
        return;
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }
  }

  private async resolveBrandDistributorId(brandHQId: string): Promise<string | null> {
    const brand = await this.prisma.brandProfile.findFirst({
      where: { id: brandHQId, deletedAt: null },
      select: { distributorId: true },
    });
    return brand?.distributorId ?? null;
  }

  private accountScopeFromRow(
    userType: AuthUserType,
    row: Pick<AuthAccountRow, 'distributorId' | 'brandHQId' | 'corporateId'>,
  ): AuthTenantContext | undefined {
    switch (userType) {
      case 'SUPER_ADMIN':
        return undefined;
      case 'DISTRIBUTOR_USER':
        return row.distributorId ? { distributorId: row.distributorId } : undefined;
      case 'BRAND_ADMIN':
        return {
          ...(row.distributorId ? { distributorId: row.distributorId } : {}),
          ...(row.brandHQId ? { brandHQId: row.brandHQId } : {}),
        };
      case 'CORPORATE_ADMIN':
        return row.corporateId ? { corporateId: row.corporateId } : undefined;
      default:
        return undefined;
    }
  }

  private async enrichAccount(userType: AuthUserType, row: AuthAccountRow): Promise<AuthAccountRecord> {
    const account: AuthAccountRecord = {
      id: row.id,
      loginId: row.loginId,
      displayName: row.displayName,
      email: row.email,
      phone: row.phone,
      userType,
      status: row.status,
      distributorId: row.distributorId ?? null,
      brandHQId: row.brandHQId ?? null,
      corporateId: row.corporateId ?? null,
      lastLoginAt: row.lastLoginAt,
      passwordChangedAt: row.passwordChangedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
      passwordHash: row.passwordHash,
    };

    if (userType === 'BRAND_ADMIN' && account.brandHQId && !account.distributorId) {
      account.distributorId = await this.resolveBrandDistributorId(account.brandHQId);
    }

    return account;
  }

  private async buildJwtTenantContext(account: AuthAccountRecord): Promise<AuthTenantContext | undefined> {
    switch (account.userType) {
      case 'SUPER_ADMIN':
        return undefined;
      case 'DISTRIBUTOR_USER':
        if (!account.distributorId) {
          throw new DomainError({ code: 'SCOPE_NOT_FOUND', params: { userType: account.userType, scope: 'distributorId' } });
        }
        return { distributorId: account.distributorId };
      case 'BRAND_ADMIN': {
        if (!account.brandHQId) {
          throw new DomainError({ code: 'SCOPE_NOT_FOUND', params: { userType: account.userType, scope: 'brandHqId' } });
        }
        const distributorId = account.distributorId ?? (await this.resolveBrandDistributorId(account.brandHQId));
        return {
          ...(distributorId ? { distributorId } : {}),
          brandHQId: account.brandHQId,
        };
      }
      case 'CORPORATE_ADMIN':
        if (!account.corporateId) {
          throw new DomainError({ code: 'SCOPE_NOT_FOUND', params: { userType: account.userType, scope: 'corporateId' } });
        }
        return { corporateId: account.corporateId };
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType: account.userType } });
    }
  }

  private async signAccountToken(account: AuthAccountRecord): Promise<{ accessToken: string; expiresIn: string }> {
    const payload: JwtPayload = {
      sub: account.id,
      loginId: account.loginId,
      userType: account.userType,
      tenantContext: await this.buildJwtTenantContext(account),
    };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, expiresIn };
  }

  private async findAccountByLogin(
    userType: AuthUserType,
    loginId: string,
    scope: {
      distributorId?: string | null;
      brandHqId?: string | null;
      corporateId?: string | null;
    },
  ): Promise<AuthAccountRow | null> {
    switch (userType) {
      case 'SUPER_ADMIN':
        return this.prisma.superAdminUser.findFirst({
          where: { loginId, deletedAt: null },
        });
      case 'DISTRIBUTOR_USER':
        return this.prisma.distributorUser.findFirst({
          where: { loginId, distributorId: scope.distributorId ?? undefined, deletedAt: null },
        });
      case 'BRAND_ADMIN':
        return this.prisma.brandAdminUser.findFirst({
          where: { loginId, brandHQId: scope.brandHqId ?? undefined, deletedAt: null },
        });
      case 'CORPORATE_ADMIN':
        return this.prisma.corporateAdminUser.findFirst({
          where: { loginId, corporateId: scope.corporateId ?? undefined, deletedAt: null },
        });
      default:
        return null;
    }
  }

  private async findAccountById(userType: AuthUserType, id: string): Promise<AuthAccountRow | null> {
    switch (userType) {
      case 'SUPER_ADMIN':
        return this.prisma.superAdminUser.findFirst({ where: { id, deletedAt: null } });
      case 'DISTRIBUTOR_USER':
        return this.prisma.distributorUser.findFirst({ where: { id, deletedAt: null } });
      case 'BRAND_ADMIN':
        return this.prisma.brandAdminUser.findFirst({ where: { id, deletedAt: null } });
      case 'CORPORATE_ADMIN':
        return this.prisma.corporateAdminUser.findFirst({ where: { id, deletedAt: null } });
      default:
        return null;
    }
  }

  /**
   * 한국어: actor 가 target 계정에 대한 관리 권한을 가지는지 scope 기준으로 검증한다.
   *   - SUPER_ADMIN 은 모든 계정 관리 가능.
   *   - DISTRIBUTOR_USER 는 자기 distributorId 소속 계정만.
   *   - BRAND_ADMIN 은 자기 brandHQId 소속 계정만.
   *   - CORPORATE_ADMIN 은 자기 corporateId 소속 계정만.
   * Tiếng Việt: Kiểm tra actor có thuộc cùng tenant với target không.
   */
  private assertActorCanManage(
    actor: AuthActor,
    actorTenant: AuthTenantContext | undefined,
    target: { distributorId?: string | null; brandHQId?: string | null; corporateId?: string | null },
  ): void {
    if (actor.userType === 'SUPER_ADMIN') return;

    const mismatch = () => {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', params: { actorType: actor.userType } });
    };

    switch (actor.userType) {
      case 'DISTRIBUTOR_USER':
        if (!actorTenant?.distributorId || actorTenant.distributorId !== target.distributorId) mismatch();
        return;
      case 'BRAND_ADMIN':
        if (!actorTenant?.brandHQId || actorTenant.brandHQId !== target.brandHQId) mismatch();
        return;
      case 'CORPORATE_ADMIN':
        if (!actorTenant?.corporateId || actorTenant.corporateId !== target.corporateId) mismatch();
        return;
      default:
        mismatch();
    }
  }

  private async findAccountByIdAsModel(userType: AuthUserType, id: string): Promise<AuthAccountRecord | null> {
    const row = await this.findAccountById(userType, id);
    return row ? this.enrichAccount(userType, row) : null;
  }

  private async listAccountsByType(
    userType: AuthUserType,
    skip: number,
    take: number,
  ): Promise<AuthAccountRecord[]> {
    const rows = await this.listRawAccountsByType(userType, skip, take);
    return Promise.all(rows.map((row) => this.enrichAccount(userType, row)));
  }

  private async listRawAccountsByType(
    userType: AuthUserType,
    skip: number,
    take: number,
  ): Promise<AuthAccountRow[]> {
    switch (userType) {
      case 'SUPER_ADMIN':
        return this.prisma.superAdminUser.findMany({
          skip,
          take,
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      case 'DISTRIBUTOR_USER':
        return this.prisma.distributorUser.findMany({
          skip,
          take,
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      case 'BRAND_ADMIN':
        return this.prisma.brandAdminUser.findMany({
          skip,
          take,
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      case 'CORPORATE_ADMIN':
        return this.prisma.corporateAdminUser.findMany({
          skip,
          take,
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      default:
        return [];
    }
  }

  private async listAllAccounts(skip: number, take: number): Promise<AuthAccountRecord[]> {
    const rows = await this.prisma.$queryRaw<AuthAccountListRow[]>(Prisma.sql`
      SELECT *
      FROM (
        SELECT
          sa.id,
          sa."loginId",
          sa."passwordHash",
          sa."displayName",
          sa.email,
          sa.phone,
          sa.status,
          sa."lastLoginAt",
          sa."passwordChangedAt",
          sa."createdAt",
          sa."updatedAt",
          sa."deletedAt",
          NULL::uuid AS "distributorId",
          NULL::uuid AS "brandHQId",
          NULL::uuid AS "corporateId",
          'SUPER_ADMIN'::text AS "userType"
        FROM "SuperAdminUser" sa
        WHERE sa."deletedAt" IS NULL

        UNION ALL

        SELECT
          du.id,
          du."loginId",
          du."passwordHash",
          du."displayName",
          du.email,
          du.phone,
          du.status,
          du."lastLoginAt",
          du."passwordChangedAt",
          du."createdAt",
          du."updatedAt",
          du."deletedAt",
          du."distributorId",
          NULL::uuid AS "brandHQId",
          NULL::uuid AS "corporateId",
          'DISTRIBUTOR_USER'::text AS "userType"
        FROM "DistributorUser" du
        WHERE du."deletedAt" IS NULL

        UNION ALL

        SELECT
          bu.id,
          bu."loginId",
          bu."passwordHash",
          bu."displayName",
          bu.email,
          bu.phone,
          bu.status,
          bu."lastLoginAt",
          bu."passwordChangedAt",
          bu."createdAt",
          bu."updatedAt",
          bu."deletedAt",
          bp."distributorId",
          bu."brandHQId",
          NULL::uuid AS "corporateId",
          'BRAND_ADMIN'::text AS "userType"
        FROM "BrandAdminUser" bu
        LEFT JOIN "BrandProfile" bp ON bp.id = bu."brandHQId"
        WHERE bu."deletedAt" IS NULL

        UNION ALL

        SELECT
          cu.id,
          cu."loginId",
          cu."passwordHash",
          cu."displayName",
          cu.email,
          cu.phone,
          cu.status,
          cu."lastLoginAt",
          cu."passwordChangedAt",
          cu."createdAt",
          cu."updatedAt",
          cu."deletedAt",
          NULL::uuid AS "distributorId",
          NULL::uuid AS "brandHQId",
          cu."corporateId",
          'CORPORATE_ADMIN'::text AS "userType"
        FROM "CorporateAdminUser" cu
        WHERE cu."deletedAt" IS NULL
      ) merged_accounts
      ORDER BY "createdAt" DESC, id DESC
      OFFSET ${skip}
      LIMIT ${take}
    `);

    return Promise.all(rows.map((row) => this.enrichAccount(row.userType, row)));
  }

  private async createAccountRow(
    tx: any,
    userType: AuthUserType,
    input: CreateAuthAccountInput,
    passwordHash: string,
  ): Promise<AuthAccountRow> {
    switch (userType) {
      case 'SUPER_ADMIN': {
        const user = await tx.superAdminUser.create({
          data: {
            loginId: input.loginId,
            passwordHash,
            displayName: input.displayName,
            email: input.email,
            phone: input.phone,
          },
        });
        return user as AuthAccountRow;
      }
      case 'DISTRIBUTOR_USER': {
        const user = await tx.distributorUser.create({
          data: {
            distributorId: input.distributorId!,
            loginId: input.loginId,
            passwordHash,
            displayName: input.displayName,
            email: input.email,
            phone: input.phone,
          },
        });
        return user as AuthAccountRow;
      }
      case 'BRAND_ADMIN': {
        const user = await tx.brandAdminUser.create({
          data: {
            brandHQId: input.brandHqId!,
            loginId: input.loginId,
            passwordHash,
            displayName: input.displayName,
            email: input.email,
            phone: input.phone,
          },
        });
        return user as AuthAccountRow;
      }
      case 'CORPORATE_ADMIN': {
        const user = await tx.corporateAdminUser.create({
          data: {
            corporateId: input.corporateId!,
            loginId: input.loginId,
            passwordHash,
            displayName: input.displayName,
            email: input.email,
            phone: input.phone,
          },
        });
        return user as AuthAccountRow;
      }
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }
  }
  /**
   * 한국어: PlatformPolicy 에서 글로벌 rate limit 설정을 조회한다. 없으면 default.
   * Tiếng Việt: Lấy cấu hình rate limit từ PlatformPolicy, fallback nếu không có.
   */
  private async resolveLoginRateLimit(): Promise<{ limit: number; windowSeconds: number }> {
    const limitPolicy = await this.platformPolicy.findEffective(
      'auth.max_login_attempts',
      'GLOBAL',
      null,
    );
    const windowPolicy = await this.platformPolicy.findEffective(
      'auth.login_window_seconds',
      'GLOBAL',
      null,
    );
    const readNumber = (p: { policyValueJson: unknown } | null, fallback: number) => {
      if (!p) return fallback;
      const v = (p.policyValueJson as { value?: unknown })?.value;
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    };
    return {
      limit: readNumber(limitPolicy, this.defaultLoginAttemptLimit),
      windowSeconds: readNumber(windowPolicy, this.defaultLoginWindowSeconds),
    };
  }

  /**
   * 한국어: 로그인 ID와 비밀번호로 사용자를 검증한다.
   *   userType 과 tenant scope 를 반영해 올바른 계정 테이블에서 조회한다.
   */
  async validateUser(input: LoginInput): Promise<AuthAccountRecord> {
    const userType = this.normalizeUserType(input.userType);
    const scope = {
      distributorId: input.distributorId ?? null,
      brandHqId: input.brandHqId ?? null,
      corporateId: input.corporateId ?? null,
    };
    this.requireScopeForUserType(userType, scope);

    const user = await this.findAccountByLogin(userType, input.loginId, scope);
    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Invalid credentials or account disabled' } });
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Invalid credentials' } });
    }

    const model = await this.enrichAccount(userType, user);
    const updatedAt = new Date();
    switch (userType) {
      case 'SUPER_ADMIN':
        await this.prisma.superAdminUser.update({ where: { id: user.id }, data: { lastLoginAt: updatedAt } });
        break;
      case 'DISTRIBUTOR_USER':
        await this.prisma.distributorUser.update({ where: { id: user.id }, data: { lastLoginAt: updatedAt } });
        break;
      case 'BRAND_ADMIN':
        await this.prisma.brandAdminUser.update({ where: { id: user.id }, data: { lastLoginAt: updatedAt } });
        break;
      case 'CORPORATE_ADMIN':
        await this.prisma.corporateAdminUser.update({ where: { id: user.id }, data: { lastLoginAt: updatedAt } });
        break;
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }

    model.lastLoginAt = updatedAt;
    return model;
  }

  /**
   * 한국어: 사용자 정보를 기반으로 JWT 액세스 토큰을 생성한다.
   */
  async generateToken(user: AuthAccountRecord): Promise<{ accessToken: string; expiresIn: string }> {
    return this.signAccountToken(user);
  }

  /**
   * 한국어: 로그인 전체 흐름을 수행한다.
   */
  async login(inputOrLoginId: LoginInput | string, password?: string) {
    const input: LoginInput =
      typeof inputOrLoginId === 'string'
        ? ({ loginId: inputOrLoginId, password: password ?? '', userType: DEFAULT_AUTH_USER_TYPE } as LoginInput)
        : inputOrLoginId;

    const userType = this.normalizeUserType(input.userType);
    const scopeKey =
      userType === 'SUPER_ADMIN'
        ? 'platform'
        : userType === 'DISTRIBUTOR_USER'
          ? input.distributorId ?? 'missing'
          : userType === 'BRAND_ADMIN'
            ? input.brandHqId ?? 'missing'
            : input.corporateId ?? 'missing';
    const rateLimitKey = CachePolicies.authLoginAttempts(
      userType,
      scopeKey,
      input.loginId,
      this.defaultLoginWindowSeconds,
    ).key;

    try {
      const user = await this.validateUser(input);
      await this.redis.del(rateLimitKey);
      const { accessToken, expiresIn } = await this.generateToken(user);
      return { accessToken, expiresIn, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const { limit, windowSeconds } = await this.resolveLoginRateLimit();
        const rateLimit = await this.redis.consumeRateLimit(rateLimitKey, limit, windowSeconds);
        if (!rateLimit.allowed) {
          throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Too many login attempts. Please try again later.' } });
        }
      }
      throw error;
    }
  }

  /**
   * 한국어: ID와 userType 으로 사용자를 조회한다. 소프트삭제된 사용자는 제외한다.
   */
  async findById(id: string, userType?: string): Promise<AuthAccountRecord | null> {
    const type = this.normalizeUserType(userType);
    const row = await this.findAccountById(type, id);
    return row ? this.enrichAccount(type, row) : null;
  }

  /**
   * 한국어: 사용자 목록을 조회한다.
   *   userType 이 주어지면 해당 테이블만 페이지네이션하고, 없으면 모든 테이블을 합쳐 정렬한다.
   */
  async findAll(skip: number, take: number, userType?: string): Promise<AuthAccountRecord[]> {
    if (userType) {
      const type = this.normalizeUserType(userType);
      return this.listAccountsByType(type, skip, take);
    }
    return this.listAllAccounts(skip, take);
  }

  /**
   * 한국어: 계정을 생성한다.
   *   userType 에 따라 대상 테이블이 달라지며, Role assignment 를 atomic 하게 함께 생성한다.
   */
  async create(input: CreateAuthAccountInput, actor: AuthActor): Promise<AuthAccountRecord> {
    const userType = this.normalizeUserType(input.userType);
    const scope = {
      distributorId: input.distributorId ?? null,
      brandHqId: input.brandHqId ?? null,
      corporateId: input.corporateId ?? null,
    };
    this.requireScopeForUserType(userType, scope);

    if (userType === 'DISTRIBUTOR_USER') {
      const distributor = await this.prisma.distributorProfile.findFirst({
        where: { id: scope.distributorId ?? undefined, deletedAt: null },
      });
      if (!distributor) throw new DomainError({ code: 'TENANT_NOT_FOUND', params: { userType, scope } });
    }
    if (userType === 'BRAND_ADMIN') {
      const brand = await this.prisma.brandProfile.findFirst({
        where: { id: scope.brandHqId ?? undefined, deletedAt: null },
      });
      if (!brand) throw new DomainError({ code: 'TENANT_NOT_FOUND', params: { userType, scope } });
    }
    if (userType === 'CORPORATE_ADMIN') {
      const corporate = await this.prisma.mealCorporate.findFirst({
        where: { id: scope.corporateId ?? undefined, deletedAt: null },
      });
      if (!corporate) throw new DomainError({ code: 'TENANT_NOT_FOUND', params: { userType, scope } });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const role = await this.prisma.role.findUnique({ where: { roleCode: input.roleCode } });
    if (!role) {
      throw new DomainError({ code: 'ROLE_NOT_FOUND', params: { roleCode: input.roleCode } });
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const row = await this.createAccountRow(tx as any, userType, input, passwordHash);
      await tx.userRoleAssignment.create({
        data: {
          userType,
          userId: row.id,
          roleId: role.id,
          scopeBrandHqId: userType === 'BRAND_ADMIN' ? row.brandHQId ?? null : null,
          scopeCorporateId: userType === 'CORPORATE_ADMIN' ? row.corporateId ?? null : null,
          scopeBranchId: null,
          grantedBy: actor.userId,
        },
      });
      return row;
    });

    const account = await this.enrichAccount(userType, created);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'USER_CREATE',
      targetType:
        userType === 'SUPER_ADMIN'
          ? 'SuperAdminUser'
          : userType === 'DISTRIBUTOR_USER'
            ? 'DistributorUser'
            : userType === 'BRAND_ADMIN'
              ? 'BrandAdminUser'
              : 'CorporateAdminUser',
      targetId: account.id,
      afterDataJson: { ...account, passwordHash: undefined } as unknown as Record<string, unknown>,
    });
    return account;
  }

  /**
   * 한국어: 계정을 부분 수정한다.
   *   roleCode 가 변경되면 기존 ACTIVE assignment 를 회수하고 새 assignment 를 생성한다.
   */
  async update(
    userType: AuthUserType,
    id: string,
    input: UpdateAuthAccountInput,
    actor: AuthActor,
  ): Promise<AuthAccountRecord> {
    const before = await this.findAccountById(userType, id);
    if (!before) {
      throw new DomainError({ code: 'USER_NOT_FOUND', params: { userId: id, userType } });
    }

    // 2차 권한 검증: target 계정이 actor 의 tenant scope 안에 있는지 확인 (cross-tenant 공격 방어).
    this.assertActorCanManage(actor, actor.tenantContext, {
      distributorId: before.distributorId ?? null,
      brandHQId: before.brandHQId ?? null,
      corporateId: before.corporateId ?? null,
    });

    let nextRoleId: string | null = null;
    if (input.roleCode !== undefined) {
      const role = await this.prisma.role.findUnique({ where: { roleCode: input.roleCode } });
      if (!role) {
        throw new DomainError({ code: 'ROLE_NOT_FOUND', params: { roleCode: input.roleCode } });
      }
      nextRoleId = role.id;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};
      if (input.displayName !== undefined) data.displayName = input.displayName;
      if (input.email !== undefined) data.email = input.email;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.status !== undefined) data.status = input.status;

      let row: AuthAccountRow;
      switch (userType) {
        case 'SUPER_ADMIN':
          row = (await tx.superAdminUser.update({ where: { id }, data })) as AuthAccountRow;
          break;
        case 'DISTRIBUTOR_USER':
          row = (await tx.distributorUser.update({ where: { id }, data })) as AuthAccountRow;
          break;
        case 'BRAND_ADMIN':
          row = (await tx.brandAdminUser.update({ where: { id }, data })) as AuthAccountRow;
          break;
        case 'CORPORATE_ADMIN':
          row = (await tx.corporateAdminUser.update({ where: { id }, data })) as AuthAccountRow;
          break;
        default:
          throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
      }

      if (nextRoleId) {
        await tx.userRoleAssignment.updateMany({
          where: {
            userType,
            userId: id,
            status: 'ACTIVE',
            scopeBrandHqId: userType === 'BRAND_ADMIN' ? row.brandHQId ?? null : null,
            scopeCorporateId: userType === 'CORPORATE_ADMIN' ? row.corporateId ?? null : null,
            scopeBranchId: null,
          },
          data: {
            status: 'REVOKED',
            revokedAt: new Date(),
            revokeReason: 'ROLE_CHANGED',
          },
        });
        await tx.userRoleAssignment.create({
          data: {
            userType,
            userId: id,
            roleId: nextRoleId,
            scopeBrandHqId: userType === 'BRAND_ADMIN' ? row.brandHQId ?? null : null,
            scopeCorporateId: userType === 'CORPORATE_ADMIN' ? row.corporateId ?? null : null,
            scopeBranchId: null,
            grantedBy: actor.userId,
          },
        });
      }

      return row;
    });

    await this.permission.invalidate(userType, id);
    await this.tenantContextService.invalidate(userType, id);

    const account = await this.enrichAccount(userType, updated);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'USER_UPDATE',
      targetType:
        userType === 'SUPER_ADMIN'
          ? 'SuperAdminUser'
          : userType === 'DISTRIBUTOR_USER'
            ? 'DistributorUser'
            : userType === 'BRAND_ADMIN'
              ? 'BrandAdminUser'
              : 'CorporateAdminUser',
      targetId: id,
      beforeDataJson: { ...before, passwordHash: undefined } as unknown as Record<string, unknown>,
      afterDataJson: { ...account, passwordHash: undefined } as unknown as Record<string, unknown>,
    });
    return account;
  }

  /**
   * 한국어: 계정을 소프트 삭제한다.
   */
  async softDelete(userType: AuthUserType, id: string, actor: AuthActor) {
    const before = await this.findAccountById(userType, id);
    if (!before) {
      throw new DomainError({ code: 'USER_NOT_FOUND', params: { userId: id, userType } });
    }

    this.assertActorCanManage(actor, actor.tenantContext, {
      distributorId: before.distributorId ?? null,
      brandHQId: before.brandHQId ?? null,
      corporateId: before.corporateId ?? null,
    });

    await this.prisma.$transaction(async (tx) => {
      switch (userType) {
        case 'SUPER_ADMIN':
          await tx.superAdminUser.update({ where: { id }, data: { deletedAt: new Date() } });
          break;
        case 'DISTRIBUTOR_USER':
          await tx.distributorUser.update({ where: { id }, data: { deletedAt: new Date() } });
          break;
        case 'BRAND_ADMIN':
          await tx.brandAdminUser.update({ where: { id }, data: { deletedAt: new Date() } });
          break;
        case 'CORPORATE_ADMIN':
          await tx.corporateAdminUser.update({ where: { id }, data: { deletedAt: new Date() } });
          break;
        default:
          throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
      }

      await tx.userRoleAssignment.updateMany({
        where: {
          userType,
          userId: id,
          status: 'ACTIVE',
          scopeBrandHqId: userType === 'BRAND_ADMIN' ? before.brandHQId ?? null : null,
          scopeCorporateId: userType === 'CORPORATE_ADMIN' ? before.corporateId ?? null : null,
          scopeBranchId: null,
        },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokeReason: 'USER_DELETED',
        },
      });
    });

    await this.permission.invalidate(userType, id);
    await this.tenantContextService.invalidate(userType, id);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'USER_DELETE',
      targetType:
        userType === 'SUPER_ADMIN'
          ? 'SuperAdminUser'
          : userType === 'DISTRIBUTOR_USER'
            ? 'DistributorUser'
            : userType === 'BRAND_ADMIN'
              ? 'BrandAdminUser'
              : 'CorporateAdminUser',
      targetId: id,
      beforeDataJson: { ...before, passwordHash: undefined } as unknown as Record<string, unknown>,
    });
    return true;
  }

  /**
   * 한국어: 비밀번호를 변경한다.
   */
  async changePassword(
    userType: AuthUserType,
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findAccountById(userType, userId);
    if (!user) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'User' }, details: { reason: 'User not found' } });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Current password is incorrect' } });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    switch (userType) {
      case 'SUPER_ADMIN':
        await this.prisma.superAdminUser.update({
          where: { id: userId },
          data: { passwordHash, passwordChangedAt: new Date() },
        });
        break;
      case 'DISTRIBUTOR_USER':
        await this.prisma.distributorUser.update({
          where: { id: userId },
          data: { passwordHash, passwordChangedAt: new Date() },
        });
        break;
      case 'BRAND_ADMIN':
        await this.prisma.brandAdminUser.update({
          where: { id: userId },
          data: { passwordHash, passwordChangedAt: new Date() },
        });
        break;
      case 'CORPORATE_ADMIN':
        await this.prisma.corporateAdminUser.update({
          where: { id: userId },
          data: { passwordHash, passwordChangedAt: new Date() },
        });
        break;
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }
    return true;
  }

  /**
   * 한국어: 관리자가 타계정 상태를 전환한다 (SUSPENDED / ACTIVE 등).
   *   - 트랜잭션 내에서 상태 변경 + 해당 계정의 모든 ACTIVE UserRoleAssignment 를 SUSPENDED 로 직접 바꾸지 않고
   *     status 필드만 바꾼다 (role 은 살려둠). 실제 소프트 삭제 경로는 softDelete 를 사용.
   *   - AuditLog 는 targetType 에 Prisma 모델 명(PascalCase 예외) 을 기록한다.
   * Tiếng Việt: Đình chỉ hoặc kích hoạt lại tài khoản người thuê bởi quản trị viên.
   */
  async suspendAccount(
    userType: AuthUserType,
    id: string,
    nextStatus: 'ACTIVE' | 'SUSPENDED',
    reason: string | null,
    actor: AuthActor,
  ): Promise<AuthAccountRecord> {
    const before = await this.findAccountById(userType, id);
    if (!before) {
      throw new DomainError({ code: 'USER_NOT_FOUND', params: { userId: id, userType } });
    }
    this.assertActorCanManage(actor, actor.tenantContext, {
      distributorId: before.distributorId ?? null,
      brandHQId: before.brandHQId ?? null,
      corporateId: before.corporateId ?? null,
    });

    const data = { status: nextStatus };
    let row: AuthAccountRow;
    switch (userType) {
      case 'SUPER_ADMIN':
        row = (await this.prisma.superAdminUser.update({ where: { id }, data })) as AuthAccountRow;
        break;
      case 'DISTRIBUTOR_USER':
        row = (await this.prisma.distributorUser.update({ where: { id }, data })) as AuthAccountRow;
        break;
      case 'BRAND_ADMIN':
        row = (await this.prisma.brandAdminUser.update({ where: { id }, data })) as AuthAccountRow;
        break;
      case 'CORPORATE_ADMIN':
        row = (await this.prisma.corporateAdminUser.update({ where: { id }, data })) as AuthAccountRow;
        break;
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }

    await this.permission.invalidate(userType, id);
    await this.tenantContextService.invalidate(userType, id);

    const account = await this.enrichAccount(userType, row);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: nextStatus === 'SUSPENDED' ? 'USER_SUSPEND' : 'USER_REACTIVATE',
      targetType:
        userType === 'SUPER_ADMIN'
          ? 'SuperAdminUser'
          : userType === 'DISTRIBUTOR_USER'
            ? 'DistributorUser'
            : userType === 'BRAND_ADMIN'
              ? 'BrandAdminUser'
              : 'CorporateAdminUser',
      targetId: id,
      beforeDataJson: { status: before.status, reason } as unknown as Record<string, unknown>,
      afterDataJson: { status: nextStatus, reason } as unknown as Record<string, unknown>,
    });
    return account;
  }

  /**
   * 한국어: 관리자가 타계정의 비밀번호를 강제 재설정한다.
   *   - 현재 비밀번호 검증 없이 새 임시 비밀번호 해시로 교체한다.
   *   - 호출 actor 가 대상 계정의 tenant scope 안에 있는지 assertActorCanManage 로 방어.
   *   - AuditLog 에 이전/이후 해시는 기록하지 않는다 (비밀번호 평문/해시 유출 금지).
   * Tiếng Việt: Quản trị viên đặt lại mật khẩu cho một tài khoản khác.
   */
  async resetAccountPassword(
    userType: AuthUserType,
    id: string,
    newPassword: string,
    actor: AuthActor,
  ): Promise<boolean> {
    const before = await this.findAccountById(userType, id);
    if (!before) {
      throw new DomainError({ code: 'USER_NOT_FOUND', params: { userId: id, userType } });
    }
    this.assertActorCanManage(actor, actor.tenantContext, {
      distributorId: before.distributorId ?? null,
      brandHQId: before.brandHQId ?? null,
      corporateId: before.corporateId ?? null,
    });

    if (!newPassword || newPassword.length < 8) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'New password too short' } });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const data = { passwordHash, passwordChangedAt: new Date() };
    switch (userType) {
      case 'SUPER_ADMIN':
        await this.prisma.superAdminUser.update({ where: { id }, data });
        break;
      case 'DISTRIBUTOR_USER':
        await this.prisma.distributorUser.update({ where: { id }, data });
        break;
      case 'BRAND_ADMIN':
        await this.prisma.brandAdminUser.update({ where: { id }, data });
        break;
      case 'CORPORATE_ADMIN':
        await this.prisma.corporateAdminUser.update({ where: { id }, data });
        break;
      default:
        throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }

    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'USER_PASSWORD_RESET',
      targetType:
        userType === 'SUPER_ADMIN'
          ? 'SuperAdminUser'
          : userType === 'DISTRIBUTOR_USER'
            ? 'DistributorUser'
            : userType === 'BRAND_ADMIN'
              ? 'BrandAdminUser'
              : 'CorporateAdminUser',
      targetId: id,
      // 한국어: 비밀번호 평문/해시는 감사 로그에 기록하지 않는다.
      beforeDataJson: { action: 'PASSWORD_RESET' } as unknown as Record<string, unknown>,
    });
    return true;
  }
}
