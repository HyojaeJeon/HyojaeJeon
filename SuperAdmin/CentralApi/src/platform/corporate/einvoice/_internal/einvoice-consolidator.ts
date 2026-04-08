/**
 * 한국어: EInvoiceConsolidator — 통합 모드 빌더 (식권 플랫폼 핵심).
 *
 *   책임: 한 corporate 의 한달치 MealTransaction 들을 합산하여 단일
 *   `MealConsolidatedEInvoice` + `MealConsolidatedEInvoiceLine[]` 로 변환한다.
 *
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §4.3 통합 모드
 *
 *   입력:
 *     - corporateId
 *     - periodStart (월 시작일, 예: 2026-03-01)
 *     - periodEnd   (다음달 시작일, 예: 2026-04-01) — half-open interval
 *     - strategy    (BY_MERCHANT | BY_DAY | BY_DEPARTMENT | BY_CATEGORY | SINGLE_LINE)
 *
 *   출력:
 *     - status='DRAFT' 인 MealConsolidatedEInvoice 1건
 *     - 합산된 MealConsolidatedEInvoiceLine N건 (그룹화 전략에 따라 1~수십건)
 *     - sellerSnapshot / buyerSnapshot / refId / totalAmountVnd / vatAmountVnd
 *
 *   본 모듈은 leaf 외부에서 import 하지 않는다 (`_internal/`).
 *   외부는 `EInvoiceService.runConsolidationForCorporate(...)` 를 사용.
 *
 *   TODO Phase 1 후속:
 *     - PrismaService 주입 + 트랜잭션 (모든 line 생성을 1 트랜잭션)
 *     - 그룹화 함수 5개 구현
 *     - 멱등성: 같은 (corporateId, periodStart) 의 ACCEPTED 가 이미 존재하면 throw
 *     - sellerSnapshot 은 PlatformLegalEntity.findActive(countryCode='VN') 에서 로드
 *     - buyerSnapshot 은 MealCorporate.findById 에서 PII 마스킹 후 박제
 *     - VAT 분리: MealTransaction.vatAmountVnd 가 이미 분리됐다고 가정. 그대로 합산
 *     - SyncWorkers 의 cron 이 본 service 의 GraphQL mutation 을 호출
 *
 * Tiếng Việt: EInvoiceConsolidator — bộ tổng hợp tháng cho hoá đơn điện tử.
 */
import { Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@core/errors/domain-error';

export type EInvoiceConsolidationStrategy =
  | 'BY_MERCHANT'
  | 'BY_DAY'
  | 'BY_DEPARTMENT'
  | 'BY_CATEGORY'
  | 'SINGLE_LINE';

export interface ConsolidationInput {
  corporateId: string;
  /** 월 시작일 (YYYY-MM-01 00:00:00). */
  periodStart: Date;
  /** 다음달 시작일 (half-open, exclusive). */
  periodEnd: Date;
  /** undefined 면 corporate.einvoiceConsolidationStrategy 사용. */
  strategy?: EInvoiceConsolidationStrategy;
}

export interface ConsolidationLine {
  seq: number;
  itemCode?: string;
  itemName: string;
  uom: string;
  quantity: number;
  unitPriceVnd: bigint;
  amountVnd: bigint;
  vatRate: string;
  vatAmountVnd: bigint;
  payAmountVnd: bigint;
  feature: string;
}

export interface ConsolidationResult {
  invoiceId: string;
  refId: string;
  status: 'DRAFT';
  sourceTransactionCount: number;
  totalAmountVnd: bigint;
  vatAmountVnd: bigint;
  consolidationStrategy: EInvoiceConsolidationStrategy;
  lines: ConsolidationLine[];
}

@Injectable()
export class EInvoiceConsolidator {
  private readonly logger = new Logger(EInvoiceConsolidator.name);

  /**
   * 한국어: 통합 인보이스 생성 진입점.
   *
   *   1. 멱등성 검사 — 같은 (corporateId, periodStart, periodEnd) 의 ACCEPTED 존재 시 에러
   *   2. corporate 조회 + buyer snapshot 박제
   *   3. PlatformLegalEntity 조회 + seller snapshot 박제
   *   4. MealTransaction 조회 (period 내 APPROVED|SETTLED)
   *   5. strategy 별 그룹화
   *   6. refId 생성
   *   7. MealConsolidatedEInvoice + Lines 영속화 (1 transaction)
   *   8. realtime topic publish
   *
   *   본 메서드는 idempotent. 같은 input 으로 재호출 시 같은 refId → unique 충돌 → 에러.
   *   대신 cron 이 같은 달에 재실행되면 status=DRAFT 인 기존 row 를 반환.
   */
  async run(_input: ConsolidationInput): Promise<ConsolidationResult> {
    // TODO Phase 1: 위 1~8 단계 실제 구현
    throw new DomainError({
      code: 'EINVOICE_CONSOLIDATION_NOT_IMPLEMENTED',
      params: { reason: 'EInvoiceConsolidator.run not yet implemented' },
    });
  }

  /**
   * 한국어: refId 생성 — `MC` + `yyyyMM` + `corporateId-12`.
   *
   *   사양서 §5.2 통합 모드 RefId.
   *   같은 corporate 의 같은 달 → 같은 refId → @@unique 로 dedupe.
   */
  static generateRefId(corporateId: string, periodStart: Date): string {
    const yyyy = periodStart.getUTCFullYear();
    const mm = String(periodStart.getUTCMonth() + 1).padStart(2, '0');
    const corp12 = corporateId.replace(/-/g, '').slice(0, 12).toUpperCase();
    return `MC${yyyy}${mm}${corp12}`;
  }

  /**
   * 한국어: BY_MERCHANT 전략 — 가맹점별 합산 1줄.
   *   라인 itemName = "Meal services - {merchantName}".
   *
   *   TODO: tx 들을 brandHqId (= merchant 의 enrollment) 로 그룹화.
   */
  static groupByMerchant(_transactions: unknown[]): ConsolidationLine[] {
    return [];
  }

  /**
   * 한국어: BY_DAY 전략 — 일자별 합산 1줄. itemName = "Meal services - {YYYY-MM-DD}".
   */
  static groupByDay(_transactions: unknown[]): ConsolidationLine[] {
    return [];
  }

  /**
   * 한국어: BY_DEPARTMENT 전략 — corporate 부서별 합산 1줄.
   *   itemName = "Meal services - {departmentName} ({YYYY-MM})".
   */
  static groupByDepartment(_transactions: unknown[]): ConsolidationLine[] {
    return [];
  }

  /**
   * 한국어: BY_CATEGORY 전략 — 메뉴 카테고리별 합산 1줄.
   */
  static groupByCategory(_transactions: unknown[]): ConsolidationLine[] {
    return [];
  }

  /**
   * 한국어: SINGLE_LINE 전략 — 전체 1줄.
   *   itemName = "Meal services - {YYYY-MM} ({corporateName})".
   */
  static groupSingleLine(_transactions: unknown[]): ConsolidationLine[] {
    return [];
  }
}
