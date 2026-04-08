/**
 * 한국어: MealWallet GraphQL 리졸버.
 *   read/write 모든 경로에 caller MealCallerCtx 를 전달하여 service 가 corporate scope 를 강제하도록 한다.
 * Tiếng Việt: GraphQL resolver MealWallet — luôn truyền MealCallerCtx để service kiểm scope corporate.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { MealWalletService } from './wallet.service';
import { MealWalletModel } from './models/meal-wallet.model';
import { MealWalletFundingEntryModel } from './models/meal-wallet-funding-entry.model';
import { CreateMealWalletInput } from './dto/create-meal-wallet.input';
import { FundMealWalletInput } from './dto/fund-meal-wallet.input';
import { TopUpMealWalletInput } from './dto/top-up-meal-wallet.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealWalletModel__ListResp = createListResponse(MealWalletModel, 'MealWalletModelListResponse');
const MealWalletModel__Resp = createObjectResponse(MealWalletModel, 'MealWalletModelResponse');
const MealWalletFundingEntryModel__ListResp = createListResponse(MealWalletFundingEntryModel, 'MealWalletFundingEntryModelListResponse');

@Resolver(() => MealWalletModel)
export class MealWalletResolver {
  constructor(private readonly service: MealWalletService) {}

  @RequirePermission('corporate.wallet.read')
  @Query(() => MealWalletModel__Resp, { name: 'mealWallet', nullable: true })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.wallet.read')
  @Query(() => MealWalletModel__ListResp, { name: 'mealWalletsByCorporate' })
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

  @RequirePermission('corporate.wallet.write')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletCreate(
    @Args('input') input: CreateMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.wallet.fund')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletFund(
    @Args('input') input: FundMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.fund(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.wallet.topup')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletTopUp(
    @Args('input') input: TopUpMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.topUp(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.wallet.read')
  @Query(() => MealWalletFundingEntryModel__ListResp, { name: 'mealWalletFundingEntriesByWallet' })
  listFundingEntriesByWallet(
    @Args('walletId', { type: () => ID }) walletId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listFundingEntriesByWallet(
      mealCtxFromUser(user),
      walletId,
      pagination.skip,
      pagination.take,
    );
  }
}
