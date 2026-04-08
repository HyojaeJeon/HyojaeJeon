/**
 * PlatformPolicy 리졸버
 * 한국어: 플랫폼 정책의 조회 및 상속 해결 GraphQL 쿼리를 제공한다.
 *         effectivePolicy 쿼리는 스코프 체인을 사용하여 계층적 정책 상속을 해결한다.
 * Tiếng Việt: Cung cấp truy vấn GraphQL cho truy vấn và giải quyết kế thừa chính sách nền tảng.
 *             Truy vấn effectivePolicy sử dụng scope chain để giải quyết kế thừa chính sách theo cấp bậc.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PlatformPolicyService } from './platform-policy.service';
import { PlatformPolicyModel } from './models/platform-policy.model';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { sanitizePolicyScopeChain } from '@core/tenancy/tenant-scope';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const PlatformPolicyModel__ListResp = createListResponse(PlatformPolicyModel, 'PlatformPolicyModelListResponse');
const PlatformPolicyModel__Resp = createObjectResponse(PlatformPolicyModel, 'PlatformPolicyModelResponse');

@Resolver(() => PlatformPolicyModel)

export class PlatformPolicyResolver {
  constructor(private readonly service: PlatformPolicyService) {}

  /**
   * 한국어: 특정 스코프의 활성 정책 목록 페이지네이션 조회. scopeId가 null이면 Global 스코프.
   * Tiếng Việt: Truy vấn phân trang danh sách chính sách hoạt động của scope cụ thể. scopeId null = scope Global.
   */
  @Query(() => PlatformPolicyModel__ListResp)
  async policies(
    @Args('scopeType') scopeType: string,
    @Args('scopeId', { type: () => ID, nullable: true }) scopeId: string | null,
    @Args() pagination: PaginationArgs,
  ) {
    return this.service.findByScope(scopeType, scopeId, pagination.skip, pagination.take);
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
}
