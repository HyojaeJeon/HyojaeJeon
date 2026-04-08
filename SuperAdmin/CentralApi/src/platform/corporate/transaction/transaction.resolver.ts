/**
 * 한국어: MealTransaction GraphQL 리졸버 — 모든 핸들러가 MealCallerCtx 전파.
 * Tiếng Việt: GraphQL resolver MealTransaction — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { MealTransactionService } from './transaction.service';
import { MealTransactionModel } from './models/meal-transaction.model';
import { AuthorizeMealTransactionInput } from './dto/authorize-meal-transaction.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealTransactionModel__ListResp = createListResponse(MealTransactionModel, 'MealTransactionModelListResponse');
const MealTransactionModel__Resp = createObjectResponse(MealTransactionModel, 'MealTransactionModelResponse');

@Resolver(() => MealTransactionModel)
export class MealTransactionResolver {
  constructor(private readonly service: MealTransactionService) {}

  @RequirePermission('corporate.transaction.read')
  @Query(() => MealTransactionModel__Resp, { name: 'mealTransaction' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.transaction.read')
  @Query(() => MealTransactionModel__ListResp, { name: 'mealTransactionsByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(
      mealCtxFromUser(user),
      corporateId,
      pagination.skip,
      pagination.take,
    );
  }

  @RequirePermission('corporate.transaction.read')
  @Query(() => MealTransactionModel__ListResp, { name: 'mealTransactionsByBrand' })
  listByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByBrand(
      mealCtxFromUser(user),
      brandHqId,
      pagination.skip,
      pagination.take,
    );
  }

  @RequirePermission('corporate.transaction.authorize')
  @Mutation(() => MealTransactionModel__Resp)
  mealTransactionAuthorize(
    @Args('input') input: AuthorizeMealTransactionInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.authorize(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.transaction.reverse')
  @Mutation(() => MealTransactionModel__Resp)
  mealTransactionReverse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.reverse(mealCtxFromUser(user), id);
  }
}
