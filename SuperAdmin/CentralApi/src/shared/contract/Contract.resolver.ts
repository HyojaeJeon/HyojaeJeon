/**
 * 한국어: Contract GraphQL 리졸버 — 계약 관리 진입점.
 *   목록, 상세, 생성, 본문/조건 수정, 상태 전이, 파일 업로드, 리비전 확인, 템플릿 CRUD, 활동 로그.
 *
 * Tiếng Việt: Resolver GraphQL hợp đồng — điểm vào quản lý hợp đồng.
 */
import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import {
  createListResponse,
  createObjectResponse,
} from '@core/response/OperationResponse.factory';
import type { CentralGraphQLContext } from '@core/graphql/loaders/graphqlContext';
import { resolveLocalizedRows, resolveLocalizedRow, CONTRACT_FIELDS, CONTRACT_ACTIVITY_FIELDS } from '@core/i18n/resolveLocalizedFields';
import type { SupportedLocale } from '@core/i18n/locale.util';
import { DEFAULT_LOCALE } from '@core/i18n/locale.util';
import { ContractService } from './Contract.service';
import { ContractModel } from './models/Contract.model';
import { ContractActivityModel } from './models/ContractActivity.model';
import { ContractTemplateModel } from './models/ContractTemplate.model';
import { ContractRevisionModel } from './models/ContractRevision.model';
import { ContractFileModel } from './models/ContractFile.model';
import { CreateContractInput } from './dto/CreateContract.input';
import { CreateContractTemplateInput } from './dto/CreateContractTemplate.input';
import { GraphQLJSON } from 'graphql-scalars';

const ContractModel__ListResp = createListResponse(ContractModel, 'ContractModelListResponse');
const ContractModel__Resp = createObjectResponse(ContractModel, 'ContractModelResponse');
const ContractActivityModel__ListResp = createListResponse(ContractActivityModel, 'ContractActivityModelListResponse');
const ContractTemplateModel__ListResp = createListResponse(ContractTemplateModel, 'ContractTemplateModelListResponse');
const ContractTemplateModel__Resp = createObjectResponse(ContractTemplateModel, 'ContractTemplateModelResponse');
const ContractRevisionModel__Resp = createObjectResponse(ContractRevisionModel, 'ContractRevisionModelResponse');
const ContractFileModel__Resp = createObjectResponse(ContractFileModel, 'ContractFileModelResponse');

@Resolver(() => ContractModel)
export class ContractResolver {
  constructor(private readonly service: ContractService) {}

  // ───────────────────────────────────────── Query

  @RequirePermission('contracts:read')
  @Query(() => ContractModel__ListResp, { name: 'contracts' })
  async contracts(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
    @Args('contractType', { type: () => String, nullable: true }) contractType: string | null,
    @Args('status', { type: () => String, nullable: true }) status: string | null,
    @Args('partyBType', { type: () => String, nullable: true }) partyBType: string | null,
    @Args('partyBId', { type: () => ID, nullable: true }) partyBId: string | null,
    @Context() ctx: CentralGraphQLContext,
  ) {
    const locale = (ctx.locale ?? DEFAULT_LOCALE) as SupportedLocale;
    const result = await this.service.listContracts(skip, take, { contractType, status, partyBType, partyBId });
    return { ...result, data: resolveLocalizedRows(result.data as unknown as Record<string, unknown>[], locale, CONTRACT_FIELDS) };
  }

  @RequirePermission('contracts:read')
  @Query(() => ContractModel__Resp, { name: 'contract' })
  async contract(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: CentralGraphQLContext,
  ) {
    const locale = (ctx.locale ?? DEFAULT_LOCALE) as SupportedLocale;
    const data = await this.service.findById(id);
    return resolveLocalizedRow(data as unknown as Record<string, unknown>, locale, CONTRACT_FIELDS);
  }

  @RequirePermission('contracts:read')
  @Query(() => ContractActivityModel__ListResp, { name: 'contractActivities' })
  async contractActivities(
    @Args('contractId', { type: () => ID }) contractId: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
    @Context() ctx: CentralGraphQLContext,
  ) {
    const locale = (ctx.locale ?? DEFAULT_LOCALE) as SupportedLocale;
    const result = await this.service.getActivities(contractId, skip, take);
    return { ...result, data: resolveLocalizedRows(result.data as unknown as Record<string, unknown>[], locale, CONTRACT_ACTIVITY_FIELDS) };
  }

  @RequirePermission('contracts:read')
  @Query(() => ContractTemplateModel__ListResp, { name: 'contractTemplates' })
  async contractTemplates(
    @Args('contractType', { type: () => String, nullable: true }) contractType: string | null,
    @Context() ctx: CentralGraphQLContext,
  ) {
    const locale = (ctx.locale ?? DEFAULT_LOCALE) as SupportedLocale;
    const rows = await this.service.listTemplates(contractType);
    return resolveLocalizedRows(rows as unknown as Record<string, unknown>[], locale, CONTRACT_FIELDS);
  }

  // ───────────────────────────────────────── Mutation

  @RequirePermission('contracts:create')
  @Mutation(() => ContractModel__Resp)
  contractCreate(
    @Args('input') input: CreateContractInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(input, user.sub, user.userType);
  }

  @RequirePermission('contracts:update')
  @Mutation(() => ContractModel__Resp)
  contractUpdateBody(
    @Args('id', { type: () => ID }) id: string,
    @Args('locale', { type: () => String }) locale: string,
    @Args('html', { type: () => String }) html: string,
    @Args('text', { type: () => String }) text: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateBody(id, locale, html, text, user.sub, user.userType);
  }

  @RequirePermission('contracts:update')
  @Mutation(() => ContractModel__Resp)
  contractUpdateTerms(
    @Args('id', { type: () => ID }) id: string,
    @Args('termsJson', { type: () => GraphQLJSON }) termsJson: unknown,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateTerms(id, termsJson, user.sub, user.userType);
  }

  @RequirePermission('contracts:update')
  @Mutation(() => ContractModel__Resp)
  contractTransitionStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('toStatus', { type: () => String }) toStatus: string,
    @Args('memo', { type: () => String, nullable: true }) memo: string | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.transitionStatus(id, toStatus, user.sub, user.userType, memo);
  }

  @RequirePermission('contracts:update')
  @Mutation(() => ContractFileModel__Resp)
  contractUploadFile(
    @Args('id', { type: () => ID }) id: string,
    @Args('fileType', { type: () => String }) fileType: string,
    @Args('locale') locale: string,
    @Args('filePath', { type: () => String }) filePath: string,
    @Args('fileName', { type: () => String }) fileName: string,
    @Args('fileSize', { type: () => Int }) fileSize: number,
    @Args('mimeType', { type: () => String }) mimeType: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.uploadFile(
      id, fileType, locale, filePath, fileName, fileSize, mimeType, user.sub, user.userType,
    );
  }

  @RequirePermission('contracts:update')
  @Mutation(() => ContractRevisionModel__Resp)
  contractAckRevision(
    @Args('revisionId', { type: () => ID }) revisionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.ackRevision(revisionId, user.sub);
  }

  @RequirePermission('contracts:create')
  @Mutation(() => ContractTemplateModel__Resp)
  contractTemplateCreate(
    @Args('input') input: CreateContractTemplateInput,
  ) {
    return this.service.createTemplate(input);
  }
}
