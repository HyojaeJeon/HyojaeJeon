import type { EInvoicePublishContext } from './EinvoiceProvider.interface';
import type { ViettelInvoiceBody, ViettelCredentials } from './viettel.types';
import { ViettelConstants } from './viettel.constants';

export function buildViettelInvoiceBody(
  ctx: EInvoicePublishContext,
  credentials: ViettelCredentials,
): ViettelInvoiceBody {
  const lines = ctx.lines.map((line, i) => ({
    lineNumber: i + 1,
    itemCode: line.itemCode ?? '',
    itemName: line.itemName,
    unitName: line.uom,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    itemTotalAmountWithoutTax: line.amount,
    taxPercentage: parseFloat(line.vatRate) || 0,
    taxAmount: line.vatAmount,
    discount: line.dcAmount ?? 0,
    discountPercentage: line.dcRate ?? 0,
    isIncreaseItem: true,
  }));

  const totAmount = lines.reduce((s, l) => s + l.itemTotalAmountWithoutTax, 0);
  const totTax = lines.reduce((s, l) => s + l.taxAmount, 0);
  const totDiscount = lines.reduce((s, l) => s + (l.discount ?? 0), 0);

  // Group by tax percentage
  const taxMap = new Map<number, { taxable: number; tax: number }>();
  for (const l of lines) {
    const entry = taxMap.get(l.taxPercentage) ?? { taxable: 0, tax: 0 };
    entry.taxable += l.itemTotalAmountWithoutTax;
    entry.tax += l.taxAmount;
    taxMap.set(l.taxPercentage, entry);
  }

  return {
    generalInvoiceInfo: {
      invoiceType: credentials.invoiceType || ViettelConstants.DEFAULTS.INVOICE_TYPE,
      templateCode: credentials.templateCode,
      invoiceSeries: credentials.invoiceSeries,
      currencyCode: ViettelConstants.DEFAULTS.CURRENCY_CODE,
      paymentStatus: true,
      paymentType: ViettelConstants.DEFAULTS.PAYMENT_METHOD,
      paymentTypeName: ViettelConstants.DEFAULTS.PAYMENT_METHOD,
      transactionUuid: ctx.refId,
    },
    sellerInfo: {
      sellerLegalName: ctx.seller.storeName,
      sellerTaxCode: ctx.seller.taxCode,
      sellerAddressLine: '',
    },
    buyerInfo: {
      buyerName: ctx.buyer.name ?? ctx.buyer.companyName ?? '',
      buyerLegalName: ctx.buyer.companyName,
      buyerTaxCode: ctx.buyer.taxCode,
      buyerAddressLine: ctx.buyer.address,
      buyerEmail: ctx.buyer.email,
    },
    itemInfo: lines,
    summarizeInfo: {
      sumOfTotalLineAmountWithoutTax: totAmount,
      totalAmountWithoutTax: totAmount,
      totalTaxAmount: totTax,
      totalAmountWithTax: totAmount + totTax,
      discountAmount: totDiscount,
    },
    taxBreakdowns: Array.from(taxMap.entries()).map(([pct, val]) => ({
      taxPercentage: pct,
      taxableAmount: val.taxable,
      taxAmount: val.tax,
    })),
    payments: [
      {
        paymentMethodName: ViettelConstants.DEFAULTS.PAYMENT_METHOD,
        paymentAmount: totAmount + totTax,
      },
    ],
  };
}
