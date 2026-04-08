/**
 * 한국어: EInvoiceProvider 인터페이스 — 모든 e-invoice provider 가 구현해야 하는 계약.
 *
 *   1차 구현: `WeTaxProvider` (`wetax.provider.ts`).
 *   향후 확장: BizziProvider, MisaProvider, GdtDirectProvider.
 *
 *   본 인터페이스는 leaf 외부에서 import 하지 않는다. 외부는 `EInvoiceService` 만 사용.
 *
 *   ── 식권 플랫폼 발급 모드 ──
 *   본 식권 플랫폼은 **단 하나의 발급 모드만** 사용한다 — corporate 단위 월별 통합 인보이스
 *   (사양서 §4.3 통합 모드). seller 는 항상 플랫폼 사업자, buyer 는 항상 기업고객 corporate.
 *   개인 buyer ('Khách lẻ') / 단건 발급 / 환불(Return) 단건 발급은 사용하지 않는다.
 *
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §4.0 / §12
 *
 * Tiếng Việt: Interface trừu tượng cho mọi provider e-invoice (chỉ chế độ tổng hợp).
 */
import type { WeTaxBuyer, WeTaxCompany, WeTaxInvoiceDetail, WeTaxSeller } from './wetax.types';

export type EInvoiceProviderType = 'WETAX' | 'BIZZI' | 'MISA' | 'DIRECT_GDT';

export interface EInvoiceProviderConfig {
  providerType: EInvoiceProviderType;
  environment: 'SANDBOX' | 'PRODUCTION';
  baseUrl: string;
  /** vault 경로 — credentials 평문 저장 금지. */
  credentialsVaultRef: string;
  defaultSerialPrefix: 'C' | 'K';
  defaultFormNo: string;
  defaultSerialType: string;
  defaultCurrencyCode: 'VND';
  defaultExchangeRate: number;
  defaultPaymentMethod: string;
}

/**
 * 한국어: 통합 인보이스 발급 컨텍스트.
 *
 *   `EInvoiceConsolidator` 가 한달치 MealTransaction 을 합산하여 생성하고,
 *   `EInvoiceService` 가 본 ctx 를 provider.publish 에 전달한다.
 *
 *   ── 본 식권 플랫폼의 불변 조건 ──
 *   - seller 는 항상 플랫폼 사업자 (`PlatformLegalEntity.findActive()`)
 *   - buyer 는 항상 사업자 corporate (taxCode/companyName/address 필수, 비어있으면 검증 실패)
 *   - 개인 buyer ('Khách lẻ') 케이스는 본 플랫폼에서 발생하지 않으므로 `buyerNotGetInvoice` 필드 없음
 *   - transType 은 항상 '1' (Sell). 환불은 합산 단계에서 차감 처리되어 별도 인보이스 발급 안 함.
 */
export interface EInvoicePublishContext {
  consolidatedInvoiceId: string;
  providerConfig: EInvoiceProviderConfig;
  /** 발급자 — 플랫폼 사업자 (PlatformLegalEntity). */
  seller: WeTaxSeller;
  /** 수령자 — 기업고객 corporate. taxCode/companyName/address 필수. */
  buyer: WeTaxBuyer;
  /** 합산된 라인. EInvoiceConsolidator 가 그룹화 전략 적용 후 생성. */
  lines: WeTaxInvoiceDetail[];
  /** 멱등성 키 (`MC` + yyyyMM + corporate12). EInvoiceConsolidator 가 사전 생성. */
  refId: string;
  /** 시리얼 번호 ('C25TKT' 등). 사전 생성. */
  serialNo: string;
}

export interface EInvoicePublishResult {
  providerStatus: 'ACCEPTED' | 'REJECTED';
  refId: string;
  cqtCode?: string;
  serialNo?: string;
  invoiceNo?: string;
  lookupCode?: string;
  rawRequestJson: unknown;
  rawResponseJson: unknown;
  providerMessage?: string;
}

export interface EInvoiceProvider {
  readonly type: EInvoiceProviderType;

  /** 인증 (token 발급/캐시). 멱등. */
  authenticate(config: EInvoiceProviderConfig): Promise<void>;

  /** 인보이스 발급. */
  publish(ctx: EInvoicePublishContext): Promise<EInvoicePublishResult>;

  /** 인보이스 무효화 (Phase 2). */
  void(invoiceId: string, reason: string, config: EInvoiceProviderConfig): Promise<void>;

  /** 사업자 KYC (3-source fallback 은 provider 외부 책임). */
  lookupCompany(taxId: string, config: EInvoiceProviderConfig): Promise<WeTaxCompany>;
}
