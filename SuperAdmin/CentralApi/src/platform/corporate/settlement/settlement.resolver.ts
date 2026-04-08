/**
 * 한국어: MealSettlement GraphQL 리졸버 — 모든 핸들러가 MealCallerCtx 전파.
 * Tiếng Việt: GraphQL resolver MealSettlement — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { MealSettlementService } from './settlement.service';
import { MealSettlementBatchModel } from './models/meal-settlement-batch.model';
import { RunMealSettlementBatchInput } from './dto/run-meal-settlement-batch.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealSettlementBatchModel__ListResp = createListResponse(MealSettlementBatchModel, 'MealSettlementBatchModelListResponse');
const MealSettlementBatchModel__Resp = createObjectResponse(MealSettlementBatchModel, 'MealSettlementBatchModelResponse');

@Resolver(() => MealSettlementBatchModel)
export class MealSettlementResolver {
  constructor(private readonly service: MealSettlementService) {}

  @RequirePermission('corporate.settlement.read')
  @Query(() => MealSettlementBatchModel__ListResp, { name: 'mealSettlementBatchesByBrand' })
  listByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByBrand(mealCtxFromUser(user), brandHqId);
  }

  @RequirePermission('corporate.settlement.read')
  @Query(() => MealSettlementBatchModel__Resp, { name: 'mealSettlementBatch' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.settlement.run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementRunBatch(
    @Args('input') input: RunMealSettlementBatchInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.runBatch(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.settlement.run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementMarkPaid(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.markPaid(mealCtxFromUser(user), id);
  }
}
