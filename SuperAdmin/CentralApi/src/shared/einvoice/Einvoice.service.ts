/**
 * 한국어: EInvoice Service — generic 전자세금계산서 도메인.
 *   subjectType polymorphic ('CORPORATE' | 'BRAND_HQ' | 'BRANCH' | 'EDGE_POS') 으로
 *   발급 주체를 구분한다. 1차 구현은 식권(CORPORATE) 통합 모드 단독.
 *   사양서: 1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md §4.3
 *   상태: DRAFT → DISPUTED | REQUESTED → SUBMITTING → ACCEPTED | REJECTED → VOIDED | REPLACED | ADJUSTED
 * Tiếng Việt: Service hoá đơn điện tử dùng chung cho mọi subject type.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/Prisma.service';
import { PermissionService } from '@core/rbac/Permission.service';
import { CallerCtx, withTargetCorporate, withTargetBrand } from '@core/tenancy/callerCtx';
import { AuditService } from '@core/audit/Audit.service';
import { DomainError } from '@core/errors/DomainError';
import { EInvoiceProviderRegistry } from './_internal/providerRegistry';
import { decryptCredentials } from '@core/crypto/credentialCipher';
import type {
  EInvoicePublishContext,
  EInvoiceProviderConfig,
} from './_internal/EinvoiceProvider.interface';

const VAT_RATE_BPS = 1000n; // 10.00%
const REVIEW_WINDOW_DAYS = 7;

export type EInvoiceSubjectType = 'CORPORATE' | 'BRAND_HQ' | 'BRANCH' | 'EDGE_POS';

interface GenerateMealConsolidatedInvoiceCommand {
  corporateId: string;
  periodStart: Date;
  periodEnd: Date;
}

interface UpdateEInvoiceProviderConfigCommand {
  id: string;
  baseUrl?: string | null;
  credentialsVaultRef?: string | null;
  defaultSerialPrefix?: string | null;
  defaultFormNo?: string | null;
  defaultSerialType?: string | null;
  defaultCurrencyCode?: string | null;
  defaultPaymentMethod?: string | null;
  failoverProviderId?: string | null;
  isActive?: boolean | null;
}

@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
    private readonly audit: AuditService,
    private readonly registry: EInvoiceProviderRegistry,
  ) {}

  /**
   * DB에서 활성 provider config를 로드하고, 암호화된 credentials를 복호화한다.
   * environment 매개변수가 없으면 활성 config 중 첫 번째를 사용한다.
   */
  private async loadProviderConfig(environment?: 'SANDBOX' | 'PRODUCTION'): Promise<EInvoiceProviderConfig> {
    const dbConfig = await this.prisma.eInvoiceProviderConfig.findFirst({
      where: {
        isActive: true,
        ...(environment ? { environment } : {}),
        provider: { isActive: true },
      },
      include: { provider: true },
      orderBy: { environment: 'desc' }, // PRODUCTION 우선
    });

    if (!dbConfig) {
      throw new DomainError({
        code: 'EINVOICE_NO_ACTIVE_PROVIDER',
        params: { reason: 'No active e-invoice provider config found' },
      });
    }

    let credentials: Record<string, unknown> | undefined;
    if (dbConfig.credentialsEncrypted) {
      try {
        credentials = decryptCredentials(dbConfig.credentialsEncrypted);
      } catch (err) {
        this.logger.error(`Failed to decrypt credentials for config ${dbConfig.id}`, err);
        throw new DomainError({ code: 'EINVOICE_CREDENTIALS_DECRYPT_FAILED' });
      }
    }

    return {
      providerType: dbConfig.provider.providerType as EInvoiceProviderConfig['providerType'],
      environment: dbConfig.environment as 'SANDBOX' | 'PRODUCTION',
      baseUrl: dbConfig.baseUrl,
      credentialsVaultRef: dbConfig.credentialsVaultRef,
      credentials,
      defaultSerialPrefix: dbConfig.defaultSerialPrefix as 'C' | 'K',
      defaultFormNo: dbConfig.defaultFormNo,
      defaultSerialType: dbConfig.defaultSerialType,
      defaultCurrencyCode: dbConfig.defaultCurrencyCode as 'VND',
      defaultExchangeRate: Number(dbConfig.defaultExchangeRate),
      defaultPaymentMethod: dbConfig.defaultPaymentMethod,
    };
  }

  private toNullableJson(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) return undefined;
    if (value === null) return Prisma.JsonNull;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  /**
   * 한국어: polymorphic scope 검증.
   *   - SUPER_ADMIN: 우회
   *   - CORPORATE: ctx.corporateId === subjectId
   *   - BRAND_HQ:  ctx.brandHqId === subjectId
   *   - 기타: 미지원 (TODO BRANCH/EDGE_POS)
   */
  private assertSubjectScope(ctx: CallerCtx, subjectType: string, subjectId: string): void {
    if (ctx.userType === 'SUPER_ADMIN') return;

    if (subjectType === 'CORPORATE') {
      if (!ctx.corporateId) {
        throw new DomainError({
          code: 'CORPORATE_CONTEXT_MISSING',
          params: { userType: ctx.userType },
        });
      }
      if (ctx.corporateId !== subjectId) {
        throw new DomainError({
          code: 'CROSS_CORPORATE_ACCESS_DENIED',
          params: { callerCorporateId: ctx.corporateId, targetCorporateId: subjectId },
        });
      }
      return;
    }

    if (subjectType === 'BRAND_HQ') {
      if (!ctx.brandHqId) {
        throw new DomainError({
          code: 'BRAND_CONTEXT_MISSING',
          params: { userType: ctx.userType },
        });
      }
      if (ctx.brandHqId !== subjectId) {
        throw new DomainError({
          code: 'CROSS_BRAND_ACCESS_DENIED',
          params: { callerBrandHqId: ctx.brandHqId, targetBrandHqId: subjectId },
        });
      }
      return;
    }

    throw new DomainError({
      code: 'EINVOICE_SUBJECT_TYPE_NOT_SUPPORTED',
      params: { subjectType },
    });
  }

  private withTargetSubject(ctx: CallerCtx, subjectType: string, subjectId: string): CallerCtx {
    if (subjectType === 'CORPORATE') return withTargetCorporate(ctx, subjectId);
    if (subjectType === 'BRAND_HQ') return withTargetBrand(ctx, subjectId);
    return ctx;
  }

  async listBySubject(
    ctx: CallerCtx,
    subjectType: string,
    subjectId: string,
    skip = 0,
    take = 20,
    status?: string | null,
  ) {
    this.assertSubjectScope(ctx, subjectType, subjectId);
    const where = {
      subjectType,
      subjectId,
      ...(status ? { status } : {}),
    };
    const [data, totalCount] = await Promise.all([
      this.prisma.eInvoice.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip,
        take,
      }),
      this.prisma.eInvoice.count({ where }),
    ]);
    return { data, totalCount };
  }

  /** 한국어: 편의 wrapper — 식권 도메인용. */
  listByCorporate(ctx: CallerCtx, corporateId: string, skip = 0, take = 20, status?: string | null) {
    return this.listBySubject(ctx, 'CORPORATE', corporateId, skip, take, status);
  }

  async findById(ctx: CallerCtx, id: string) {
    const i = await this.prisma.eInvoice.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { seq: 'asc' } },
        submissionLogs: { orderBy: { attempt: 'desc' } },
      },
    });
    if (!i) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'EInvoice' },
      });
    }
    this.assertSubjectScope(ctx, i.subjectType, i.subjectId);
    return i;
  }

  /**
   * 한국어: 통합 인보이스 DRAFT 생성 (CORPORATE subject 한정).
   *   - 식권 거래 합산 → totAmountVnd / totVatAmountVnd / totPayableVnd
   *   - buyer/seller 정형 컬럼 박제
   *   - reviewDueAt = periodStart + 7일
   *   - refId = `MC{YYYYMM}{corp12}` (멱등)
   */
  async generate(ctx: CallerCtx, input: GenerateMealConsolidatedInvoiceCommand) {
    this.assertSubjectScope(ctx, 'CORPORATE', input.corporateId);
    const targetCtx = withTargetCorporate(ctx, input.corporateId);
    await this.permission.require(targetCtx, 'corporate.invoice.write');

    const corporate = await this.prisma.mealCorporate.findUnique({
      where: { id: input.corporateId },
    });
    if (!corporate) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Corporate' },
      });
    }

    const txList = await this.prisma.mealTransaction.findMany({
      where: {
        corporateId: input.corporateId,
        status: { in: ['APPROVED', 'SETTLED'] },
        createdAt: { gte: input.periodStart, lt: input.periodEnd },
      },
    });

    const totPayableVnd = txList.reduce((acc, t) => acc + t.approvedAmountVnd, 0n);
    const totVatAmountVnd = (totPayableVnd * VAT_RATE_BPS) / (10000n + VAT_RATE_BPS);
    const totAmountVnd = totPayableVnd - totVatAmountVnd;

    const refId = `MC${input.periodStart
      .toISOString()
      .slice(0, 7)
      .replace('-', '')}${input.corporateId.replace(/-/g, '').slice(0, 12)}`;
    const reviewDueAt = new Date(input.periodStart);
    reviewDueAt.setDate(reviewDueAt.getDate() + REVIEW_WINDOW_DAYS);

    return this.prisma.eInvoice.upsert({
      where: {
        uq_einvoice_subject_period: {
          subjectType: 'CORPORATE',
          subjectId: input.corporateId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        },
      },
      update: {
        totAmountVnd,
        totVatAmountVnd,
        totPayableVnd,
        sourceTransactionCount: txList.length,
        status: 'DRAFT',
        reviewDueAt,
        buyerTaxCode: corporate.taxCode,
        buyerCompanyName: corporate.companyName,
        buyerAddress: corporate.addressFull ?? null,
        buyerEmail: corporate.contactEmail ?? null,
      },
      create: {
        subjectType: 'CORPORATE',
        subjectId: input.corporateId,
        issuanceMode: 'CONSOLIDATED',
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        totAmountVnd,
        totVatAmountVnd,
        totPayableVnd,
        sourceTransactionCount: txList.length,
        status: 'DRAFT',
        refId,
        reviewDueAt,
        buyerTaxCode: corporate.taxCode,
        buyerCompanyName: corporate.companyName,
        buyerAddress: corporate.addressFull ?? null,
        buyerEmail: corporate.contactEmail ?? null,
      },
    });
  }

  /** 한국어: [4-A] 발급 요청. DRAFT → REQUESTED. */
  async requestIssuance(ctx: CallerCtx, invoiceId: string) {
    const inv = await this.prisma.eInvoice.findUnique({ where: { id: invoiceId } });
    if (!inv) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'EInvoice' } });
    }
    this.assertSubjectScope(ctx, inv.subjectType, inv.subjectId);
    await this.permission.require(
      this.withTargetSubject(ctx, inv.subjectType, inv.subjectId),
      'corporate.invoice.request',
    );
    if (inv.status !== 'DRAFT') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { currentStatus: inv.status },
      });
    }
    return this.prisma.eInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'REQUESTED',
        requestedByAdminId: ctx.userId,
        requestedAt: new Date(),
      },
    });
  }

  /** 한국어: [4-B] 이의 제기. DRAFT → DISPUTED + 사유. */
  async dispute(ctx: CallerCtx, invoiceId: string, reason: string) {
    const inv = await this.prisma.eInvoice.findUnique({ where: { id: invoiceId } });
    if (!inv) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'EInvoice' } });
    }
    this.assertSubjectScope(ctx, inv.subjectType, inv.subjectId);
    await this.permission.require(
      this.withTargetSubject(ctx, inv.subjectType, inv.subjectId),
      'corporate.invoice.dispute',
    );
    if (inv.status !== 'DRAFT') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { currentStatus: inv.status },
      });
    }
    return this.prisma.eInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'DISPUTED',
        disputedByAdminId: ctx.userId,
        disputedAt: new Date(),
        disputeReason: reason,
      },
    });
  }

  /**
   * 한국어: [5] SuperAdmin 발급 승인. REQUESTED → SUBMITTING → (publish attempt) → ACCEPTED|REJECTED.
   *   상태 전이 후 즉시 provider.publish 를 시도한다. 성공/실패 모두 EInvoiceSubmissionLog 박제.
   *   provider 가 미구현(stub) 인 경우 REJECTED 로 전이 + 예외 메시지 로그에 박제.
   */
  async submitForIssuance(ctx: CallerCtx, invoiceId: string) {
    const inv = await this.prisma.eInvoice.findUnique({ where: { id: invoiceId } });
    if (!inv) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'EInvoice' } });
    }
    this.assertSubjectScope(ctx, inv.subjectType, inv.subjectId);
    await this.permission.require(
      this.withTargetSubject(ctx, inv.subjectType, inv.subjectId),
      'corporate.invoice.write',
    );
    if (inv.status !== 'REQUESTED') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { currentStatus: inv.status },
      });
    }
    const providerConfig = await this.loadProviderConfig();
    await this.prisma.eInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SUBMITTING',
        submittedByAdminId: ctx.userId,
        submittedAt: new Date(),
      },
    });
    return this.runPublishAttempt(invoiceId);
  }

  /**
   * 한국어: provider publish 시도 — submission log 박제 + 결과 status 전이.
   *   cron 의 retry 경로에서도 직접 호출 가능. 멱등성은 provider 가 refId 로 보장.
   *   - 성공: ACCEPTED + invoiceIssuedAt/acceptedAt 기록
   *   - 거부: REJECTED + rejectionReason 기록
   *   - provider 미구현/예외: REJECTED + errorMessage 박제 (cron 이 재시도)
   */
  async runPublishAttempt(invoiceId: string) {
    const inv = await this.prisma.eInvoice.findUnique({
      where: { id: invoiceId },
      include: { lines: { orderBy: { seq: 'asc' } } },
    });
    if (!inv) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'EInvoice' } });
    }
    if (inv.status !== 'SUBMITTING') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { currentStatus: inv.status, expected: 'SUBMITTING' },
      });
    }

    // attempt # = 기존 log count + 1
    const previousAttempts = await this.prisma.eInvoiceSubmissionLog.count({
      where: { invoiceId },
    });
    const attempt = previousAttempts + 1;

    const providerConfig = await this.loadProviderConfig();

    const ctx: EInvoicePublishContext = {
      consolidatedInvoiceId: inv.id,
      providerConfig,
      seller: {
        taxCode: inv.sellerTaxCode ?? '',
        storeCode: 'PLATFORM',
        storeName: inv.sellerCompanyName ?? '',
        orderDate: new Date().toISOString().slice(0, 10).replace(/-/g, '') + '000000',
      },
      buyer: {
        companyName: inv.buyerCompanyName ?? undefined,
        taxCode: inv.buyerTaxCode ?? undefined,
        address: inv.buyerAddress ?? undefined,
        email: inv.buyerEmail ?? undefined,
      },
      lines: inv.lines.map((l) => ({
        seq: l.seq,
        itemName: l.itemName,
        uom: l.uom,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPriceVnd),
        amount: Number(l.amountVnd),
        vatRate: `${Number(l.vatRatePct).toFixed(1)}%`,
        vatAmount: Number(l.vatAmountVnd),
        payAmount: Number(l.payAmountVnd),
        feature: l.feature,
        itemCode: l.itemCode ?? undefined,
        dcRate: l.dcRate != null ? Number(l.dcRate) : undefined,
        dcAmount: l.dcAmountVnd != null ? Number(l.dcAmountVnd) : undefined,
      })),
      refId: inv.refId ?? '',
      serialNo: inv.serialNo ?? `${providerConfig.defaultSerialPrefix}25${providerConfig.defaultSerialType}`,
    };

    const startedAt = Date.now();
    let logRequest: unknown = ctx;
    let logResponse: unknown = null;
    let logStatus: 'ACCEPTED' | 'REJECTED' | 'PROVIDER_DOWN' = 'PROVIDER_DOWN';
    let logErrorCode: string | null = null;
    let logErrorMessage: string | null = null;
    let outcome: 'ACCEPTED' | 'REJECTED' = 'REJECTED';
    let acceptedReceiptNo: string | null = null;
    let providerResponseForRow: unknown = undefined;

    try {
      const provider = this.registry.resolve(providerConfig.providerType);
      const result = await provider.publish(ctx);
      logResponse = result.providerResponse;
      providerResponseForRow = result.providerResponse;
      if (result.success) {
        logStatus = 'ACCEPTED';
        outcome = 'ACCEPTED';
        acceptedReceiptNo = result.lookupCode ?? result.transactionId ?? ctx.refId;
        await this.prisma.eInvoice.update({
          where: { id: invoiceId },
          data: {
            cqtCode: result.cqtCode ?? undefined,
            serialNo: result.serialNo ?? undefined,
            invoiceNo: result.invoiceNo ?? undefined,
            lookupCode: result.lookupCode ?? undefined,
            isCqtCertified: !!result.cqtCode,
          },
        });
      } else {
        logStatus = 'REJECTED';
        outcome = 'REJECTED';
        logErrorCode = result.errorCode ?? null;
        logErrorMessage = result.errorMessage ?? 'Provider returned REJECTED';
      }
    } catch (e) {
      const err = e as Error & { code?: string; details?: unknown };
      logStatus = err.code === 'EINVOICE_PROVIDER_DOWN' ? 'PROVIDER_DOWN' : 'REJECTED';
      outcome = 'REJECTED';
      logErrorCode = err.code ?? 'UNKNOWN';
      logErrorMessage = err.message;
      logResponse = err.details ?? null;
      this.logger.warn(`Publish attempt #${attempt} for ${invoiceId} failed: ${err.message}`);
    }

    const durationMs = Date.now() - startedAt;

    await this.prisma.eInvoiceSubmissionLog.create({
      data: {
        invoiceId,
        attempt,
        providerType: providerConfig.providerType,
        environment: providerConfig.environment,
        requestJson: this.toNullableJson(logRequest),
        responseJson: this.toNullableJson(logResponse),
        status: logStatus,
        errorCode: logErrorCode,
        errorMessage: logErrorMessage,
        durationMs,
      },
    });

    if (outcome === 'ACCEPTED') {
      return this.markAccepted(invoiceId, acceptedReceiptNo ?? inv.refId ?? '', providerResponseForRow);
    }
    return this.markRejected(invoiceId, logErrorMessage ?? 'Publish attempt failed', logResponse);
  }

  /** 한국어: provider 어댑터 콜백 — SUBMITTING → ACCEPTED. */
  async markAccepted(invoiceId: string, gdtReceiptNo: string, providerResponse?: unknown) {
    const now = new Date();
    return this.prisma.eInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'ACCEPTED',
        gdtReceiptNo,
        invoiceIssuedAt: now,
        acceptedAt: now,
        providerResponseJson: (providerResponse ?? undefined) as object | undefined,
      },
    });
  }

  /** 한국어: provider 어댑터 콜백 — SUBMITTING → REJECTED. */
  async markRejected(invoiceId: string, reason: string, providerResponse?: unknown) {
    return this.prisma.eInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
        providerResponseJson: (providerResponse ?? undefined) as object | undefined,
      },
    });
  }

  // ── Provider / Config 관리 ──

  async listProviders() {
    const rows = await this.prisma.eInvoiceProvider.findMany({
      include: { configs: true },
      orderBy: { createdAt: 'asc' },
    });
    // Decimal → number 변환 + 민감 필드 제거
    return rows.map((r) => ({
      ...r,
      configs: r.configs.map((c) => ({
        ...c,
        defaultExchangeRate: Number(c.defaultExchangeRate),
        credentialsVaultRef: '***',
        credentialsEncrypted: undefined,
      })),
    }));
  }

  async findProviderConfig(id: string) {
    return this.prisma.eInvoiceProviderConfig.findUnique({
      where: { id },
    });
  }

  async updateProviderConfig(input: UpdateEInvoiceProviderConfigCommand, caller: CallerCtx) {
    const before = await this.prisma.eInvoiceProviderConfig.findUnique({ where: { id: input.id } });
    if (!before) throw new DomainError({ code: 'NOT_FOUND', params: { resource: 'EInvoiceProviderConfig' } });

    const data: Record<string, unknown> = {};
    if (input.baseUrl !== undefined) data.baseUrl = input.baseUrl;
    if (input.credentialsVaultRef !== undefined) data.credentialsVaultRef = input.credentialsVaultRef;
    if (input.defaultSerialPrefix !== undefined) data.defaultSerialPrefix = input.defaultSerialPrefix;
    if (input.defaultFormNo !== undefined) data.defaultFormNo = input.defaultFormNo;
    if (input.defaultSerialType !== undefined) data.defaultSerialType = input.defaultSerialType;
    if (input.defaultCurrencyCode !== undefined) data.defaultCurrencyCode = input.defaultCurrencyCode;
    if (input.defaultPaymentMethod !== undefined) data.defaultPaymentMethod = input.defaultPaymentMethod;
    if (input.failoverProviderId !== undefined) data.failoverProviderId = input.failoverProviderId;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updated = await this.prisma.eInvoiceProviderConfig.update({
      where: { id: input.id },
      data,
    });

    await this.audit.log({
      actorType: caller.userType,
      actorId: caller.userId,
      actionType: 'EINVOICE_PROVIDER_CONFIG_UPDATE',
      targetType: 'EInvoiceProviderConfig',
      targetId: input.id,
      beforeDataJson: before as unknown as Record<string, unknown>,
      afterDataJson: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  async toggleProvider(id: string, isActive: boolean, caller: CallerCtx) {
    await this.prisma.eInvoiceProvider.update({
      where: { id },
      data: { isActive },
    });

    await this.audit.log({
      actorType: caller.userType,
      actorId: caller.userId,
      actionType: isActive ? 'EINVOICE_PROVIDER_ACTIVATE' : 'EINVOICE_PROVIDER_DEACTIVATE',
      targetType: 'EInvoiceProvider',
      targetId: id,
    });

    return true;
  }

  async updateProviderCredentials(configId: string, credentialsJson: string, caller: CallerCtx) {
    const config = await this.prisma.eInvoiceProviderConfig.findUnique({ where: { id: configId } });
    if (!config) throw new DomainError({ code: 'NOT_FOUND', params: { resource: 'EInvoiceProviderConfig' } });

    const { encryptCredentials } = await import('@core/crypto/credentialCipher');
    const plainCredentials = JSON.parse(credentialsJson) as Record<string, unknown>;
    const encrypted = encryptCredentials(plainCredentials);

    await this.prisma.eInvoiceProviderConfig.update({
      where: { id: configId },
      data: { credentialsEncrypted: encrypted },
    });

    await this.audit.log({
      actorType: caller.userType,
      actorId: caller.userId,
      actionType: 'EINVOICE_PROVIDER_CREDENTIALS_UPDATE',
      targetType: 'EInvoiceProviderConfig',
      targetId: configId,
    });

    return true;
  }
}
