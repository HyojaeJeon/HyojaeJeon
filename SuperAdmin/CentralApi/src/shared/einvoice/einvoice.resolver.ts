/**
 * 한국어: EInvoice GraphQL 리졸버 — generic.
 *   상세 query 는 1P1Q 원칙에 따라 lines + submissionLogs 를 nested 로 반환.
 * Tiếng Việt: GraphQL resolver hoá đơn điện tử — trả nested.
 */
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { callerCtxFromUser } from '@core/tenancy/caller-ctx';
import { EInvoiceService } from './einvoice.service';
import { EInvoiceModel } from './models/einvoice.model';
import { EInvoiceLineModel } from './models/einvoice-line.model';
import { EInvoiceSubmissionLogModel } from './models/einvoice-submission-log.model';
import { GenerateMealConsolidatedInvoiceInput } from './dto/generate-meal-consolidated-invoice.input';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const EInvoiceModel__ListResp = createListResponse(EInvoiceModel, 'EInvoiceModelListResponse');
const EInvoiceModel__Resp = createObjectResponse(EInvoiceModel, 'EInvoiceModelResponse');

@Resolver(() => EInvoiceModel)
export class EInvoiceResolver {
  constructor(private readonly service: EInvoiceService) {}

  /** 한국어: corporate 편의 wrapper. 다른 subject 도메인용 list query 는 별도 추가. */
  @RequirePermission('corporate.invoice.read')
  @Query(() => EInvoiceModel__ListResp, { name: 'eInvoicesByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(callerCtxFromUser(user), corporateId);
  }

  @RequirePermission('corporate.invoice.read')
  @Query(() => EInvoiceModel__Resp, { name: 'eInvoice' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(callerCtxFromUser(user), id);
  }

  @ResolveField(() => [EInvoiceLineModel])
  lines(@Parent() invoice: EInvoiceModel & { lines?: unknown[] }) {
    const raw = (invoice.lines ?? []) as Array<Record<string, unknown>>;
    return raw.map((l) => ({
      ...l,
      quantity: l.quantity?.toString() ?? '0',
      unitPriceVnd: l.unitPriceVnd?.toString() ?? '0',
      vatRatePct: l.vatRatePct?.toString() ?? '0',
      dcRate: l.dcRate != null ? String(l.dcRate) : null,
    }));
  }

  @ResolveField(() => [EInvoiceSubmissionLogModel])
  submissionLogs(@Parent() invoice: EInvoiceModel & { submissionLogs?: unknown[] }) {
    return invoice.submissionLogs ?? [];
  }

  @RequirePermission('corporate.invoice.write')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceGenerate(
    @Args('input') input: GenerateMealConsolidatedInvoiceInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.generate(callerCtxFromUser(user), input);
  }

  /** 한국어: [4-A] 발행 요청. DRAFT → REQUESTED. */
  @RequirePermission('corporate.invoice.request')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceRequestIssuance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.requestIssuance(callerCtxFromUser(user), id);
  }

  /** 한국어: [4-B] 이의 제기. DRAFT → DISPUTED. */
  @RequirePermission('corporate.invoice.dispute')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceDispute(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String }) reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.dispute(callerCtxFromUser(user), id, reason);
  }

  /** 한국어: [5] SuperAdmin 발급 승인. REQUESTED → SUBMITTING. */
  @RequirePermission('corporate.invoice.write')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceSubmitForIssuance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.submitForIssuance(callerCtxFromUser(user), id);
  }
}
