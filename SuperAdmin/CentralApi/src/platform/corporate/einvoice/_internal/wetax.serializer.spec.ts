/**
 * 한국어: WeTax serializer golden 테스트. snake_case 변환과 'Khách lẻ' 기본값을 검증.
 */
import { serializeWeTaxBody } from './wetax.serializer';
import type { WeTaxInvoiceBody } from './wetax.types';

function baseBody(): WeTaxInvoiceBody {
  return {
    seller: {
      taxCode: '0123456789',
      storeCode: 'ST01',
      storeName: 'Hyojung Store',
      orderDate: '20260408120000',
    },
    invoices: [
      {
        refId: '20260408120000ST0100001',
        cqtCode: '',
        billNo: '1',
        posNo: 'ST01',
        invoiceType: '0',
        formNo: '1',
        serialNo: 'C26TKT',
        transType: '1',
        currencyCode: 'VND',
        exchangeRate: 1,
        paymentMethod: 'TM/CK',
        totAmount: 1000,
        totDcAmount: 0,
        totVatAmount: 100,
        totPayAmount: 1100,
        invoiceDetails: [
          {
            seq: 1,
            itemCode: 'PHO',
            itemName: 'Phở bò',
            uom: 'EA',
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
            vatRate: '10.0%',
            vatAmount: 100,
            payAmount: 1100,
            feature: '1',
          },
        ],
        buyer: {},
      },
    ],
    buyerNotGetInvoice: 1,
  };
}

describe('serializeWeTaxBody', () => {
  it('converts camelCase to snake_case at top level', () => {
    const result = serializeWeTaxBody(baseBody());
    expect(result.seller.tax_code).toBe('0123456789');
    expect(result.seller.store_code).toBe('ST01');
    expect(result.seller.store_name).toBe('Hyojung Store');
  });

  it('fills buyer.name with "Khách lẻ" when name is empty', () => {
    const result = serializeWeTaxBody(baseBody());
    expect(result.invoices[0].buyer_name).toBe('Khách lẻ');
  });

  it('keeps explicit buyer name', () => {
    const body = baseBody();
    body.invoices[0].buyer.name = 'Nguyễn Văn A';
    const result = serializeWeTaxBody(body);
    expect(result.invoices[0].buyer_name).toBe('Nguyễn Văn A');
  });

  it('passes order_date from seller to each invoice', () => {
    const result = serializeWeTaxBody(baseBody());
    expect(result.invoices[0].order_date).toBe('20260408120000');
  });

  it('normalizes optional buyer fields to empty strings', () => {
    const result = serializeWeTaxBody(baseBody());
    const inv = result.invoices[0];
    expect(inv.buyer_comp_name).toBe('');
    expect(inv.buyer_tax_code).toBe('');
    expect(inv.buyer_cccd).toBe('');
    expect(inv.buyer_passport_no).toBe('');
    expect(inv.buyer_email).toBe('');
  });

  it('serializes invoice_details with snake_case keys and zero defaults for dc', () => {
    const result = serializeWeTaxBody(baseBody());
    const detail = result.invoices[0].invoice_details[0];
    expect(detail.item_code).toBe('PHO');
    expect(detail.item_name).toBe('Phở bò');
    expect(detail.unit_price).toBe(1000);
    expect(detail.vat_rate).toBe('10.0%');
    expect(detail.vat_amount).toBe(100);
    expect(detail.pay_amount).toBe(1100);
    expect(detail.dc_rate).toBe(0);
    expect(detail.dc_amount).toBe(0);
  });

  it('preserves buyerNotGetInvoice flag', () => {
    const body = baseBody();
    body.buyerNotGetInvoice = 0;
    const result = serializeWeTaxBody(body);
    expect(result.buyerNotGetInvoice).toBe(0);
  });
});
