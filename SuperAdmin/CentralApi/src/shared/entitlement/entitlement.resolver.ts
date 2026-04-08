/**
 * 한국어: BrandHQ Entitlement GraphQL 리졸버.
 *   기준서 §100 의 단일 관리 진입점.
 *   PLATFORM_SUPER_ADMIN 만 grant/suspend/resume/revoke 가능.
 *   PLATFORM_SUPER_ADMIN / REGIONAL_DISTRIBUTOR_ADMIN / BRAND_HQ_ADMIN 은 조회 가능.
 *
 * Tiếng Việt: Resolver GraphQL cho BrandHQ Entitlement.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import {
  BrandHqCapability,
  EntitlementService,
} from './entitlement.service';
import { BrandHqEntitlementModel } from './models/brand-hq-entitlement.model';
import { GrantBrandHqCapabilityInput } from './dto/grant-brand-hq-capability.input';
import { StringListResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const BrandHqEntitlementModel__ListResp = createListResponse(BrandHqEntitlementModel, 'BrandHqEntitlementModelListResponse');
const BrandHqEntitlementModel__Resp = createObjectResponse(BrandHqEntitlementModel, 'BrandHqEntitlementModelResponse');

@Resolver(() => BrandHqEntitlementModel)

export class EntitlementResolver {
  constructor(private readonly entitlement: EntitlementService) {}

  @Query(() => BrandHqEntitlementModel__ListResp, { name: 'brandHqEntitlements' })
  async list(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
  ): Promise<BrandHqEntitlementModel[]> {
    const rows = await this.entitlement.listForBrand(brandHqId);
    return rows as unknown as BrandHqEntitlementModel[];
  }

  @Query(() => StringListResponse, { name: 'brandHqActiveCapabilities' })
  async activeCapabilities(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
  ): Promise<string[]> {
    const set = await this.entitlement.getActiveCapabilities(brandHqId);
    return Array.from(set);
  }

  @Mutation(() => BrandHqEntitlementModel__Resp)
  async grantBrandHqCapability(
    @Args('input') input: GrantBrandHqCapabilityInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandHqEntitlementModel> {
    const row = await this.entitlement.grant({
      brandHqId: input.brandHqId,
      capability: input.capability as BrandHqCapability,
      expiresAt: input.expiresAt ?? null,
      contractRef: input.contractRef ?? null,
      licenseId: input.licenseId ?? null,
      startAsTrial: input.startAsTrial ?? false,
      grantedBySuperAdminId: user.sub,
      actorUserType: user.userType,
    });
    return row as unknown as BrandHqEntitlementModel;
  }

  @Mutation(() => BrandHqEntitlementModel__Resp)
  async suspendBrandHqCapability(
    @Args('entitlementId', { type: () => ID }) entitlementId: string,
    @Args('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandHqEntitlementModel> {
    const row = await this.entitlement.suspend(entitlementId, reason, {
      userType: user.userType,
      userId: user.sub,
    });
    return row as unknown as BrandHqEntitlementModel;
  }

  @Mutation(() => BrandHqEntitlementModel__Resp)
  async resumeBrandHqCapability(
    @Args('entitlementId', { type: () => ID }) entitlementId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandHqEntitlementModel> {
    const row = await this.entitlement.resume(entitlementId, {
      userType: user.userType,
      userId: user.sub,
    });
    return row as unknown as BrandHqEntitlementModel;
  }

  @Mutation(() => BrandHqEntitlementModel__Resp)
  async revokeBrandHqCapability(
    @Args('entitlementId', { type: () => ID }) entitlementId: string,
    @Args('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandHqEntitlementModel> {
    const row = await this.entitlement.revoke(entitlementId, reason, {
      userType: user.userType,
      userId: user.sub,
    });
    return row as unknown as BrandHqEntitlementModel;
  }
}
