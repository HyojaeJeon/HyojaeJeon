export interface MisaCredentials {
  appId: string;
  sellerTaxCode: string;
  username: string;
  password: string;
  invoiceSeries: string;
  useDigitalSign?: boolean;
}

export interface MisaLoginResponse {
  Success: boolean;
  Data: string; // accessToken
  ErrorCode: string | null;
  ErrorMessage: string | null;
}

export interface MisaInvoiceDetail {
  ItemName: string;
  UnitName: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
  TaxRate: number;
  TaxAmount: number;
  IsDiscount?: boolean;
  DiscountRate?: number;
  DiscountAmount?: number;
}

export interface MisaTaxRateInfo {
  TaxRate: number;
  TaxRateAmount: number;
  TaxAmount: number;
}

export interface MisaInvoiceBody {
  RefID: string;
  InvSeries: string;
  InvoiceName: string;
  InvDate: string; // ISO8601
  CurrencyCode: string;
  ExchangeRate: number;
  PaymentMethodName: string;
  SellerTaxCode: string;
  SellerLegalName: string;
  SellerAddress: string;
  BuyerTaxCode?: string;
  BuyerLegalName?: string;
  BuyerAddress?: string;
  BuyerEmail?: string;
  InvoiceDetails: MisaInvoiceDetail[];
  TaxRateInfo: MisaTaxRateInfo[];
  TotalAmount: number;
  TotalTaxAmount: number;
  TotalPaymentAmount: number;
}

export interface MisaCreateInvoiceResponse {
  Success: boolean;
  Data: {
    InvoiceNo: string;
    RefID: string;
    TransactionID: string;
  } | null;
  ErrorCode: string | null;
  ErrorMessage: string | null;
}
