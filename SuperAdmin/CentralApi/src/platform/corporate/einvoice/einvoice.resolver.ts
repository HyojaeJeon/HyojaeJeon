/**
 * 한국어: MealConsolidatedEInvoice GraphQL 리졸버 — 모든 핸들러가 MealCallerCtx 전파.
 * Tiếng Việt: GraphQL resolver MealConsolidatedEInvoice — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { MealEInvoiceService } from './einvoice.service';
import { MealConsolidatedEInvoiceModel } from './models/meal-consolidated-einvoice.model';
import { GenerateMealConsolidatedInvoiceInput } from './dto/generate-meal-consolidated-invoice.input';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealConsolidatedEInvoiceModel__ListResp = createListResponse(MealConsolidatedEInvoiceModel, 'MealConsolidatedEInvoiceModelListResponse');
const MealConsolidatedEInvoiceModel__Resp = createObjectResponse(MealConsolidatedEInvoiceModel, 'MealConsolidatedEInvoiceModelResponse');

@Resolver(() => MealConsolidatedEInvoiceModel)
export class MealEInvoiceResolver {
  constructor(private readonly service: MealEInvoiceService) {}

  @RequirePermission('corporate.invoice.read')
  @Query(() => MealConsolidatedEInvoiceModel__ListResp, {
    name: 'mealConsolidatedInvoicesByCorporate',
  })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(mealCtxFromUser(user), corporateId);
  }

  @RequirePermission('corporate.invoice.read')
  @Query(() => MealConsolidatedEInvoiceModel__Resp, { name: 'mealConsolidatedInvoice' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.invoice.write')
  @Mutation(() => MealConsolidatedEInvoiceModel__Resp)
  mealConsolidatedInvoiceGenerate(
    @Args('input') input: GenerateMealConsolidatedInvoiceInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.generate(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.invoice.write')
  @Mutation(() => MealConsolidatedEInvoiceModel__Resp)
  mealConsolidatedInvoiceSign(
    @Args('id', { type: () => ID }) id: string,
    @Args('xmlPayloadRef') xmlPayloadRef: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.sign(mealCtxFromUser(user), id, xmlPayloadRef);
  }
}
