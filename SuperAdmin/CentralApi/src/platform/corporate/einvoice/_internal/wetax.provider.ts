/**
 * 한국어: WeTaxProvider — `EInvoiceProvider` 의 1차 구현체.
 *
 *   원본 orchestrator: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `IssuanceInvoice` (line 559~647).
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §4 (단계별 시퀀스)
 *
 *   본 provider 는 다음을 책임진다:
 *     1. 인증 (Bearer token 발급 + Redis 캐시 — TODO Phase 1)
 *     2. 이미 빌드된 ctx (seller/buyer/lines) 를 직렬화
 *     3. WeTaxClient.publishInvoice 호출
 *     4. 응답을 EInvoicePublishResult 로 매핑
 *     5. raw req/res 박제 (감사용)
 *
 *   본 provider 는 다음을 하지 않는다:
 *     - line merger (호출자가 사전 처리)
 *     - 멱등성 검증 (EInvoiceService 가 refId 기준 dedupe)
 *     - 큐잉 / 재시도 (EInvoiceService 책임)
 *     - audit 기록 (EInvoiceService 책임)
 *
 * Tiếng Việt: Triển khai provider WeTax — bước phát hành chính.
 */
import { Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@core/errors/domain-error';
import { WeTaxClient } from './wetax.client';
import { KycLookupService } from './kyc-lookup';
import { buildWeTaxBodyJson, serializeWeTaxBody } from './wetax.serializer';
import { WeTaxConstants } from './wetax.constants';
import type {
  EInvoiceProvider,
  EInvoiceProviderConfig,
  EInvoiceProviderType,
  EInvoicePublishContext,
  EInvoicePublishResult,
} from './einvoice-provider.interface';
import type { WeTaxCompany, WeTaxInvoiceBody } from './wetax.types';

@Injectable()
export class WeTaxProvider implements EInvoiceProvider {
  readonly type: EInvoiceProviderType = 'WETAX';
  private readonly logger = new Logger(WeTaxProvider.name);

  constructor(
    private readonly client: WeTaxClient,
    private readonly kyc: KycLookupService,
  ) {}

  async authenticate(_config: EInvoiceProviderConfig): Promise<void> {
    // TODO Phase 1:
    //   1. credentialsVaultRef 로 username/password 조회
    //   2. Redis 캐시 키 'einvoice:wetax:token:{providerId}' 확인
    //   3. miss 시 client.login() 호출, 응답 토큰을 Redis 에 저장 (TTL = expiresIn * 0.9)
    //   4. 캐시 hit 시 그대로 반환
    throw new Error('WeTaxProvider.authenticate not yet implemented');
  }

  async publish(ctx: EInvoicePublishContext): Promise<EInvoicePublishResult> {
    // 식권 플랫폼은 항상 corporate 단위 통합 인보이스 → buyer 는 사업자 corporate.
    // 'Khách lẻ' / 개인 buyer 케이스는 본 플랫폼에서 발생하지 않는다.
    if (!ctx.buyer.taxCode || !ctx.buyer.companyName) {
      throw new DomainError({
        code: 'EINVOICE_VALIDATION_FAILED',
        params: { reason: 'corporate buyer must have taxCode and companyName' },
      });
    }

    // 1. invoice body 조립 (단일 통합 인보이스)
    const body: WeTaxInvoiceBody = {
      seller: ctx.seller,
      invoices: [
        {
          refId: ctx.refId,
          cqtCode: '',
          billNo: ctx.refId,
          posNo: ctx.seller.storeCode,
          invoiceType: WeTaxConstants.INVOICE_TYPE,
          formNo: ctx.providerConfig.defaultFormNo,
          serialNo: ctx.serialNo,
          // 식권 플랫폼은 환불 단건 발급 없음 — 항상 Sell. 환불은 합산 차감으로 처리.
          transType: WeTaxConstants.TRANS_TYPE_SELL,
          currencyCode: WeTaxConstants.CURRENCY_CODE,
          exchangeRate: ctx.providerConfig.defaultExchangeRate,
          paymentMethod: ctx.providerConfig.defaultPaymentMethod,
          totAmount: ctx.lines.reduce((sum, l) => sum + l.amount, 0),
          totDcAmount: ctx.lines.reduce((sum, l) => sum + (l.dcAmount ?? 0), 0),
          totVatAmount: ctx.lines.reduce((sum, l) => sum + l.vatAmount, 0),
          totPayAmount: ctx.lines.reduce((sum, l) => sum + l.payAmount, 0),
          invoiceDetails: ctx.lines,
          buyer: ctx.buyer,
        },
      ],
      // 본 플랫폼은 항상 사업자 buyer (corporate). 0 고정.
      buyerNotGetInvoice: 0,
    };

    const serialized = serializeWeTaxBody(body);
    const bodyJson = buildWeTaxBodyJson(body);

    // 2. token 확보 (멱등 — 캐시 hit 시 즉시 반환)
    await this.authenticate(ctx.providerConfig);

    // 3. 발급 호출
    // TODO Phase 1:
    //   - Redis 에서 토큰 조회
    //   - this.client.publishInvoice(config, token, bodyJson)
    //   - 응답이 status.success=false 면 REJECTED
    //   - 응답이 success=true 이고 data[0] 존재 시 ACCEPTED
    //   - data[0] 이 비어있으면 throw EINVOICE_EMPTY_RESPONSE

    throw new DomainError({
      code: 'EINVOICE_PROVIDER_DOWN',
      params: { reason: 'WeTaxProvider.publish not yet implemented' },
      details: {
        rawRequest: serialized,
        bodyJson,
      },
    });
  }

  async void(_invoiceId: string, _reason: string, _config: EInvoiceProviderConfig): Promise<void> {
    // TODO Phase 2: WeTax 의 무효화 endpoint 가 별도 존재 (계약 확인 필요)
    throw new Error('WeTaxProvider.void not yet implemented');
  }

  async lookupCompany(taxId: string, config: EInvoiceProviderConfig): Promise<WeTaxCompany> {
    // KYC 는 3-source fallback 이라 KycLookupService 에 위임
    // 토큰은 authenticate 후 캐시에서 가져와야 하지만, 1차 lookup 만 WeTax 라
    // 일단 빈 토큰으로 호출 (구현 시 캐시에서 조회)
    return this.kyc.lookupByTaxId(taxId, config, '');
  }
}
