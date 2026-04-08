/**
 * 한국어: MealMerchant GraphQL 리졸버 — 모든 핸들러가 MealCallerCtx 전파.
 * Tiếng Việt: GraphQL resolver MealMerchant — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { MealMerchantService } from './merchant.service';
import { MealMerchantCommissionRateModel } from './models/meal-merchant-commission-rate.model';
import { MealMerchantEnrollmentModel } from './models/meal-merchant-enrollment.model';
import { MealMerchantSettlementAccountModel } from './models/meal-merchant-settlement-account.model';
import { EnrollMealMerchantInput } from './dto/enroll-meal-merchant.input';
import { SetMealMerchantCommissionInput } from './dto/set-meal-merchant-commission.input';
import { SetMealMerchantSettlementAccountInput } from './dto/set-meal-merchant-settlement-account.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealMerchantCommissionRateModel__Resp = createObjectResponse(MealMerchantCommissionRateModel, 'MealMerchantCommissionRateModelResponse');
const MealMerchantEnrollmentModel__ListResp = createListResponse(MealMerchantEnrollmentModel, 'MealMerchantEnrollmentModelListResponse');
const MealMerchantEnrollmentModel__Resp = createObjectResponse(MealMerchantEnrollmentModel, 'MealMerchantEnrollmentModelResponse');
const MealMerchantSettlementAccountModel__Resp = createObjectResponse(MealMerchantSettlementAccountModel, 'MealMerchantSettlementAccountModelResponse');

@Resolver(() => MealMerchantEnrollmentModel)
export class MealMerchantResolver {
  constructor(private readonly service: MealMerchantService) {}

  @RequirePermission('corporate.merchant.read')
  @Query(() => MealMerchantEnrollmentModel__Resp, {
    name: 'mealMerchantEnrollment',
    nullable: true,
  })
  findByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findEnrollmentByBrand(mealCtxFromUser(user), brandHqId);
  }

  @RequirePermission('corporate.merchant.read')
  @Query(() => MealMerchantEnrollmentModel__ListResp, { name: 'mealMerchantEnrollments' })
  list(@Args() pagination: PaginationArgs, @CurrentUser() user: JwtPayload) {
    return this.service.listEnrollments(
      mealCtxFromUser(user),
      pagination.skip,
      pagination.take,
    );
  }

  @RequirePermission('corporate.merchant.enroll')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantEnroll(
    @Args('input') input: EnrollMealMerchantInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.enroll(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.merchant.activate')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantActivate(
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.activate(mealCtxFromUser(user), enrollmentId);
  }

  @RequirePermission('corporate.merchant.activate')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantDeactivate(
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.deactivate(mealCtxFromUser(user), enrollmentId);
  }

  @RequirePermission('corporate.merchant.commission.write')
  @Mutation(() => MealMerchantCommissionRateModel__Resp)
  mealMerchantSetCommission(
    @Args('input') input: SetMealMerchantCommissionInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setCommissionRate(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.merchant.account.write')
  @Mutation(() => MealMerchantSettlementAccountModel__Resp)
  mealMerchantSetSettlementAccount(
    @Args('input') input: SetMealMerchantSettlementAccountInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setSettlementAccount(mealCtxFromUser(user), input);
  }
}
