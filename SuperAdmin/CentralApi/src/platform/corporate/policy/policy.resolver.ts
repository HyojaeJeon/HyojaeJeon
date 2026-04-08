/**
 * 한국어: MealPolicy GraphQL 리졸버 — 모든 핸들러가 MealCallerCtx 를 전파한다.
 * Tiếng Việt: GraphQL resolver MealPolicy — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { MealPolicyService } from './policy.service';
import { MealPolicyModel } from './models/meal-policy.model';
import { CreateMealPolicyInput } from './dto/create-meal-policy.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealPolicyModel__ListResp = createListResponse(MealPolicyModel, 'MealPolicyModelListResponse');
const MealPolicyModel__Resp = createObjectResponse(MealPolicyModel, 'MealPolicyModelResponse');

@Resolver(() => MealPolicyModel)
export class MealPolicyResolver {
  constructor(private readonly service: MealPolicyService) {}

  @RequirePermission('corporate.policy.read')
  @Query(() => MealPolicyModel__ListResp, { name: 'mealPoliciesByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(mealCtxFromUser(user), corporateId);
  }

  @RequirePermission('corporate.policy.read')
  @Query(() => MealPolicyModel__Resp, { name: 'mealPolicy' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.policy.write')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyCreate(
    @Args('input') input: CreateMealPolicyInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.policy.write')
  @Mutation(() => BooleanResponse)
  mealPolicyDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(mealCtxFromUser(user), id);
  }
}
