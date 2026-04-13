/**
 * 한국어: EInvoice GraphQL 리졸버 — generic.
 *   상세 query 는 1P1Q 원칙에 따라 lines + submissionLogs 를 nested 로 반환.
 * Tiếng Việt: GraphQL resolver hoá đơn điện tử — trả nested.
 */
import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { callerCtxFromUser } from '@core/tenancy/callerCtx';
import { EInvoiceService } from './Einvoice.service';
import { EInvoiceModel } from './models/Einvoice.model';
import { EInvoiceLineModel } from './models/EinvoiceLine.model';
import { EInvoiceSubmissionLogModel } from './models/EinvoiceSubmissionLog.model';
import { EInvoiceProviderModel } from './models/EinvoiceProvider.model';
import { EInvoiceProviderConfigModel } from './models/EinvoiceProviderConfig.model';
import { EInvoiceDownloadModel } from './models/EinvoiceDownload.model';
import { GenerateMealConsolidatedInvoiceInput } from './dto/GenerateMealConsolidatedInvoice.input';
import { UpdateEInvoiceProviderConfigInput } from './dto/UpdateEinvoiceProviderConfig.input';
import { createListResponse, createObjectResponse, BooleanResponse } from '@core/response/OperationResponse.factory';

const EInvoiceModel__ListResp = createListResponse(EInvoiceModel, 'EInvoiceModelListResponse');
const EInvoiceModel__Resp = createObjectResponse(EInvoiceModel, 'EInvoiceModelResponse');
const EInvoiceProviderModel__ListResp = createListResponse(EInvoiceProviderModel, 'EInvoiceProviderModelListResponse');
const EInvoiceProviderConfigModel__Resp = createObjectResponse(EInvoiceProviderConfigModel, 'EInvoiceProviderConfigModelResponse');
const EInvoiceDownloadModel__Resp = createObjectResponse(EInvoiceDownloadModel, 'EInvoiceDownloadModelResponse');

@Resolver(() => EInvoiceModel)
export class EInvoiceResolver {
  constructor(private readonly service: EInvoiceService) {}

  /** 한국어: corporate 편의 wrapper. 다른 subject 도메인용 list query 는 별도 추가. */
  @RequirePermission('einvoices:read')
  @Query(() => EInvoiceModel__ListResp, { name: 'eInvoicesByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
    @Args('status', { type: () => String, nullable: true }) status: string | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(callerCtxFromUser(user), corporateId, skip, take, status);
  }

  @RequirePermission('einvoices:read')
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

  @RequirePermission('einvoices:submit')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceGenerate(
    @Args('input') input: GenerateMealConsolidatedInvoiceInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.generate(callerCtxFromUser(user), input);
  }

  /** 한국어: [4-A] 발행 요청. DRAFT → REQUESTED. */
  @RequirePermission('einvoices:request')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceRequestIssuance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.requestIssuance(callerCtxFromUser(user), id);
  }

  /** 한국어: [4-B] 이의 제기. DRAFT → DISPUTED. */
  @RequirePermission('einvoices:read')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceDispute(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String }) reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.dispute(callerCtxFromUser(user), id, reason);
  }

  /** 한국어: [5] SuperAdmin 발급 승인. REQUESTED → SUBMITTING. */
  @RequirePermission('einvoices:submit')
  @Mutation(() => EInvoiceModel__Resp)
  eInvoiceSubmitForIssuance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.submitForIssuance(callerCtxFromUser(user), id);
  }

  // ── Download stubs ──

  /** PDF 다운로드 URL stub — TODO: 실제 PDF 생성 연동 */
  @RequirePermission('einvoices:read')
  @Query(() => EInvoiceDownloadModel__Resp, { name: 'eInvoiceDownloadPdf' })
  async downloadPdf(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const invoice = await this.service.findById(callerCtxFromUser(user), id);
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    return {
      url: `/api/einvoice/${id}/pdf`,
      fileName: `invoice-${invoice.invoiceNo ?? id}.pdf`,
      expiresAt,
    };
  }

  /** XML 다운로드 URL stub — TODO: 실제 XML 생성 연동 */
  @RequirePermission('einvoices:read')
  @Query(() => EInvoiceDownloadModel__Resp, { name: 'eInvoiceDownloadXml' })
  async downloadXml(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const invoice = await this.service.findById(callerCtxFromUser(user), id);
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    return {
      url: `/api/einvoice/${id}/xml`,
      fileName: `invoice-${invoice.invoiceNo ?? id}.xml`,
      expiresAt,
    };
  }

  // ── Provider / Config 관리 ──

  @RequirePermission('einvoice_providers:read')
  @Query(() => EInvoiceProviderModel__ListResp, { name: 'einvoiceProviders' })
  listProviders() {
    return this.service.listProviders();
  }

  @RequirePermission('einvoice_providers:read')
  @Query(() => EInvoiceProviderConfigModel__Resp, { name: 'einvoiceProviderConfig', nullable: true })
  findProviderConfig(@Args('id', { type: () => ID }) id: string) {
    return this.service.findProviderConfig(id);
  }

  @RequirePermission('einvoice_providers:update')
  @Mutation(() => EInvoiceProviderConfigModel__Resp)
  updateEinvoiceProviderConfig(
    @Args('input') input: UpdateEInvoiceProviderConfigInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateProviderConfig(input, callerCtxFromUser(user));
  }

  @RequirePermission('einvoice_providers:update')
  @Mutation(() => BooleanResponse)
  toggleEinvoiceProvider(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive') isActive: boolean,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.toggleProvider(id, isActive, callerCtxFromUser(user));
  }

  @RequirePermission('einvoice_providers:update')
  @Mutation(() => BooleanResponse)
  updateEinvoiceProviderCredentials(
    @Args('configId', { type: () => ID }) configId: string,
    @Args('credentials', { type: () => String }) credentialsJson: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateProviderCredentials(configId, credentialsJson, callerCtxFromUser(user));
  }
}
