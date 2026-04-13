/**
 * PlatformPolicy 리졸버
 * 한국어: 플랫폼 정책의 조회 및 상속 해결 GraphQL 쿼리를 제공한다.
 *         effectivePolicy 쿼리는 스코프 체인을 사용하여 계층적 정책 상속을 해결한다.
 * Tiếng Việt: Cung cấp truy vấn GraphQL cho truy vấn và giải quyết kế thừa chính sách nền tảng.
 *             Truy vấn effectivePolicy sử dụng scope chain để giải quyết kế thừa chính sách theo cấp bậc.
 */
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PlatformPolicyService } from './PlatformPolicy.service';
import { PlatformPolicyModel } from './models/PlatformPolicy.model';
import { PlatformInfoModel } from './models/PlatformInfo.model';
import { CreatePlatformPolicyInput } from './dto/CreatePlatformPolicy.input';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { sanitizePolicyScopeChain } from '@core/tenancy/tenantScope';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';
import { PrismaService } from '@core/prisma/Prisma.service';
import { RedisService } from '@core/redis/Redis.service';

const PlatformPolicyModel__ListResp = createListResponse(PlatformPolicyModel, 'PlatformPolicyModelListResponse');
const PlatformPolicyModel__Resp = createObjectResponse(PlatformPolicyModel, 'PlatformPolicyModelResponse');
const PlatformInfoModel__Resp = createObjectResponse(PlatformInfoModel, 'PlatformInfoModelResponse');

@Resolver(() => PlatformPolicyModel)

export class PlatformPolicyResolver {
  constructor(
    private readonly service: PlatformPolicyService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 한국어: 플랫폼 메타데이터 — version, uptime, DB/Redis 상태.
   * Tiếng Việt: Metadata nền tảng — phiên bản, uptime, trạng thái DB/Redis.
   */
  @Query(() => PlatformInfoModel__Resp, { name: 'platformInfo' })
  async platformInfo(): Promise<PlatformInfoModel> {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }
    const redisHealth = await this.redis.healthSnapshot();

    return {
      version: process.env.npm_package_version ?? '0.0.0',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisHealth.status,
      },
    };
  }

  /**
   * 한국어: 특정 스코프의 활성 정책 목록 페이지네이션 조회. scopeId가 null이면 Global 스코프.
   * Tiếng Việt: Truy vấn phân trang danh sách chính sách hoạt động của scope cụ thể. scopeId null = scope Global.
   */
  @Query(() => PlatformPolicyModel__ListResp)
  async policies(
    @Args('scopeType') scopeType: string,
    @Args('scopeId', { type: () => ID, nullable: true }) scopeId: string | null,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
  ) {
    return this.service.findByScope(scopeType, scopeId, skip, take);
  }

  /**
   * 한국어: 정책 단건 조회 (ID 기준). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ chính sách (theo ID). Trả về null nếu không tồn tại.
   */
  @Query(() => PlatformPolicyModel__Resp, { nullable: true })
  async policy(@Args('id', { type: () => ID }) id: string) {
    return this.service.findById(id);
  }

  /**
   * 한국어: 유효 정책 해결 쿼리. scopeChain JSON 문자열로 계층별 ID를 전달받아
   *         EDGE_POS → BRANCH → BRAND_HQ → REGIONAL_DISTRIBUTOR → GLOBAL 순서로 탐색한다.
   *         예: scopeChain = '{"EDGE_POS":"id1","BRANCH":"id2","BRAND_HQ":"id3","REGIONAL_DISTRIBUTOR":"id4"}'
   * Tiếng Việt: Truy vấn giải quyết chính sách hiệu lực. Nhận ID theo cấp bậc qua chuỗi JSON scopeChain,
   *             tìm kiếm theo thứ tự: EdgePos → Branch → BrandHQ → RegionalDistributor → Global.
   *             Ví dụ: scopeChain = '{"EdgePos":"id1","Branch":"id2","BrandHQ":"id3","RegionalDistributor":"id4"}'
   */
  @Query(() => PlatformPolicyModel__Resp, { nullable: true })
  async effectivePolicy(
    @Args('policyKey') policyKey: string,
    @Args('startScope') startScope: string,
    @Args('scopeChainJson', { nullable: true, defaultValue: '{}' }) scopeChainJson: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const requestedScopeChain: Record<string, string | null> = JSON.parse(scopeChainJson || '{}');
    const scopeChain = sanitizePolicyScopeChain(user, startScope, requestedScopeChain);
    return this.service.resolveEffectivePolicy(policyKey, startScope, scopeChain);
  }

  /**
   * 한국어: 새 정책 버전 생성 — 기존 활성 버전을 비활성화하고 새 버전을 생성한다.
   * Tiếng Việt: Tạo phiên bản chính sách mới — vô hiệu hóa phiên bản hoạt động hiện tại và tạo phiên bản mới.
   */
  @Mutation(() => PlatformPolicyModel__Resp)
  async createPlatformPolicy(
    @Args('input') input: CreatePlatformPolicyInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(input, { userType: user.userType, userId: user.sub });
  }
}
