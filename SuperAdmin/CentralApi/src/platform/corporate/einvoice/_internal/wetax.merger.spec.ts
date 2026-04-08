/**
 * 한국어: WeTax line merger 단위 테스트.
 *   `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `MergeItemsByCode` 와 동일한 동작을 검증한다.
 */
import { mergeWeTaxLinesByItemCode, type WeTaxLineInput } from './wetax.merger';

function makeLine(overrides: Partial<WeTaxLineInput>): WeTaxLineInput {
  return {
    itemCode: 'ITEM-1',
    itemName: 'Item 1',
    uom: 'EA',
    quantity: 1,
    unitPrice: 1000,
    amount: 1000,
    vatRate: '10.0%',
    vatAmount: 100,
    payAmount: 1100,
    feature: '1',
    ...overrides,
  };
}

describe('mergeWeTaxLinesByItemCode', () => {
  it('returns empty array for empty input', () => {
    expect(mergeWeTaxLinesByItemCode([])).toEqual([]);
  });

  it('keeps a single positive line and assigns seq=1', () => {
    const result = mergeWeTaxLinesByItemCode([makeLine({})]);
    expect(result).toHaveLength(1);
    expect(result[0].seq).toBe(1);
    expect(result[0].quantity).toBe(1);
  });

  it('groups multiple positive lines by itemCode', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: 'A', quantity: 2, amount: 2000, payAmount: 2200, vatAmount: 200 }),
      makeLine({ itemCode: 'A', quantity: 3, amount: 3000, payAmount: 3300, vatAmount: 300 }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
    expect(result[0].amount).toBe(5000);
    expect(result[0].payAmount).toBe(5500);
    expect(result[0].vatAmount).toBe(500);
  });

  it('cancels positive and negative quantities of same itemCode', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: 'B', quantity: 2 }),
      makeLine({ itemCode: 'B', quantity: -2 }),
    ]);
    expect(result).toEqual([]);
  });

  it('drops items where merged quantity becomes 0 but keeps positives', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: 'A', quantity: 3 }),
      makeLine({ itemCode: 'B', quantity: -1 }),
      makeLine({ itemCode: 'B', quantity: 1 }),
      makeLine({ itemCode: 'C', quantity: 5 }),
    ]);
    expect(result.map((r) => r.itemCode).sort()).toEqual(['A', 'C']);
  });

  it('treats missing itemCode by falling back to itemName', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: undefined, itemName: 'Phở', quantity: 1 }),
      makeLine({ itemCode: undefined, itemName: 'Phở', quantity: 2 }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it('renumbers seq starting from 1 after filtering', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: 'A' }),
      makeLine({ itemCode: 'B', quantity: -1 }),
      makeLine({ itemCode: 'B', quantity: 1 }),
      makeLine({ itemCode: 'C' }),
    ]);
    expect(result.map((r) => r.seq)).toEqual([1, 2]);
  });

  it('aggregates dcAmount across merged lines', () => {
    const result = mergeWeTaxLinesByItemCode([
      makeLine({ itemCode: 'A', dcAmount: 50 }),
      makeLine({ itemCode: 'A', dcAmount: 30 }),
    ]);
    expect(result[0].dcAmount).toBe(80);
  });
});
