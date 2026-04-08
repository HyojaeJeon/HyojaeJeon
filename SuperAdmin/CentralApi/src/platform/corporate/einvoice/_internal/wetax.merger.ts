/**
 * 한국어: WeTax line merger — itemCode 단위로 라인을 합산하여 양수 결과만 남긴다.
 *
 *   ── 식권 플랫폼에서의 사용처 ──
 *   본 식권 플랫폼은 통합 모드(월별 합산) 만 사용한다. EInvoiceConsolidator 가 한달치
 *   MealTransaction 을 그룹화 전략(BY_MERCHANT 등) 으로 합산할 때 환불(Reversal)
 *   거래가 음수 amount 로 들어올 수 있으므로, 그 차감을 처리하기 위해 본 머저를 사용한다.
 *   결과 amount 가 0 이하인 그룹은 발급 라인에서 제외 (환불이 매출을 완전 상쇄).
 *
 *   원본: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `MergeItemsByCode`.
 *   원본은 단건 모드 (POS 영수증 1건 안의 환불/취소 라인) 용이지만, 동일 알고리즘이
 *   통합 모드의 월별 환불 차감에도 그대로 적용된다.
 *
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §4.0.3
 *
 *   동작:
 *     1. itemCode (없으면 itemName) 키로 그룹화
 *     2. 같은 키의 quantity / amount / vatAmount / payAmount / dcAmount 를 합산
 *     3. quantity ≤ 0 인 그룹은 발급 대상에서 제외 (환불로 완전 상쇄)
 *     4. seq 는 후처리 단계에서 1-based 로 다시 부여
 *
 * Tiếng Việt: Gộp dòng theo itemCode — chỉ giữ kết quả số lượng dương.
 */
import type { WeTaxInvoiceDetail } from './wetax.types';

export interface WeTaxLineInput extends Omit<WeTaxInvoiceDetail, 'seq'> {
  /** 입력 단계의 quantity 는 음수 허용. */
}

export function mergeWeTaxLinesByItemCode(lines: WeTaxLineInput[]): WeTaxInvoiceDetail[] {
  const grouped = new Map<string, WeTaxLineInput>();

  for (const line of lines) {
    const key = (line.itemCode ?? line.itemName).trim();
    if (!key) continue;

    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.amount += line.amount;
      existing.vatAmount += line.vatAmount;
      existing.payAmount += line.payAmount;
      if (line.dcAmount != null) {
        existing.dcAmount = (existing.dcAmount ?? 0) + line.dcAmount;
      }
    } else {
      grouped.set(key, { ...line });
    }
  }

  const survivors = Array.from(grouped.values()).filter((m) => m.quantity > 0);

  return survivors.map((line, index) => ({
    seq: index + 1,
    itemCode: line.itemCode,
    itemName: line.itemName,
    uom: line.uom,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    amount: line.amount,
    vatRate: line.vatRate,
    vatAmount: line.vatAmount,
    payAmount: line.payAmount,
    feature: line.feature,
    dcRate: line.dcRate,
    dcAmount: line.dcAmount,
  }));
}
