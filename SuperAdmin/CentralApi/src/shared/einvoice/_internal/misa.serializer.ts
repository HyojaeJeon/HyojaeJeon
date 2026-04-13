import type { EInvoicePublishContext } from './EinvoiceProvider.interface';
import type { MisaInvoiceBody, MisaCredentials } from './misa.types';
import { MisaConstants } from './misa.constants';

export function buildMisaInvoiceBody(
  ctx: EInvoicePublishContext,
  credentials: MisaCredentials,
): MisaInvoiceBody {
  const details = ctx.lines.map((line) => ({
    ItemName: line.itemName,
    UnitName: line.uom,
    Quantity: line.quantity,
    UnitPrice: line.unitPrice,
    Amount: line.amount,
    TaxRate: parseFloat(line.vatRate) || 0,
    TaxAmount: line.vatAmount,
    IsDiscount: (line.dcAmount ?? 0) > 0,
    DiscountRate: line.dcRate ?? 0,
    DiscountAmount: line.dcAmount ?? 0,
  }));

  const totAmount = details.reduce((s, d) => s + d.Amount, 0);
  const totTax = details.reduce((s, d) => s + d.TaxAmount, 0);

  // Group by tax rate
  const taxMap = new Map<number, { amount: number; tax: number }>();
  for (const d of details) {
    const entry = taxMap.get(d.TaxRate) ?? { amount: 0, tax: 0 };
    entry.amount += d.Amount;
    entry.tax += d.TaxAmount;
    taxMap.set(d.TaxRate, entry);
  }

  return {
    RefID: ctx.refId,
    InvSeries: credentials.invoiceSeries,
    InvoiceName: MisaConstants.DEFAULTS.INVOICE_NAME,
    InvDate: new Date().toISOString(),
    CurrencyCode: MisaConstants.DEFAULTS.CURRENCY_CODE,
    ExchangeRate: MisaConstants.DEFAULTS.EXCHANGE_RATE,
    PaymentMethodName: MisaConstants.DEFAULTS.PAYMENT_METHOD,
    SellerTaxCode: credentials.sellerTaxCode,
    SellerLegalName: ctx.seller.storeName,
    SellerAddress: '',
    BuyerTaxCode: ctx.buyer.taxCode,
    BuyerLegalName: ctx.buyer.companyName,
    BuyerAddress: ctx.buyer.address,
    BuyerEmail: ctx.buyer.email,
    InvoiceDetails: details,
    TaxRateInfo: Array.from(taxMap.entries()).map(([rate, val]) => ({
      TaxRate: rate,
      TaxRateAmount: val.amount,
      TaxAmount: val.tax,
    })),
    TotalAmount: totAmount,
    TotalTaxAmount: totTax,
    TotalPaymentAmount: totAmount + totTax,
  };
}
