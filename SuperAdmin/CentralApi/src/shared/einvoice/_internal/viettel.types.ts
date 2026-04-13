export interface ViettelCredentials {
  username: string;
  password: string;
  invoiceType: string;
  templateCode: string;
  invoiceSeries: string;
}

export interface ViettelLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  invoice_cluster?: string;
}

export interface ViettelGeneralInvoiceInfo {
  invoiceType: string;
  templateCode: string;
  invoiceSeries: string;
  currencyCode: string;
  adjustmentType?: string;
  paymentStatus: boolean;
  paymentType: string;
  paymentTypeName: string;
  transactionUuid: string;
}

export interface ViettelSellerInfo {
  sellerLegalName: string;
  sellerTaxCode: string;
  sellerAddressLine: string;
  sellerPhoneNumber?: string;
  sellerEmail?: string;
  sellerBankName?: string;
  sellerBankAccount?: string;
}

export interface ViettelBuyerInfo {
  buyerName: string;
  buyerLegalName?: string;
  buyerTaxCode?: string;
  buyerAddressLine?: string;
  buyerPhoneNumber?: string;
  buyerEmail?: string;
  buyerCode?: string;
  buyerNotGetInvoice?: number;
}

export interface ViettelItemInfo {
  lineNumber: number;
  itemCode?: string;
  itemName: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  itemTotalAmountWithoutTax: number;
  taxPercentage: number;
  taxAmount: number;
  discount?: number;
  discountPercentage?: number;
  isIncreaseItem?: boolean;
}

export interface ViettelTaxBreakdown {
  taxPercentage: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface ViettelInvoiceBody {
  generalInvoiceInfo: ViettelGeneralInvoiceInfo;
  sellerInfo: ViettelSellerInfo;
  buyerInfo: ViettelBuyerInfo;
  itemInfo: ViettelItemInfo[];
  summarizeInfo: {
    sumOfTotalLineAmountWithoutTax: number;
    totalAmountWithoutTax: number;
    totalTaxAmount: number;
    totalAmountWithTax: number;
    totalAmountWithTaxInWords?: string;
    discountAmount?: number;
  };
  taxBreakdowns: ViettelTaxBreakdown[];
  payments: Array<{
    paymentMethodName: string;
    paymentAmount: number;
  }>;
  metadata?: Array<{
    invoiceCustomFieldName: string;
    invoiceCustomFieldValue: string;
  }>;
}

export interface ViettelCreateInvoiceResponse {
  errorCode: string | null;
  description: string | null;
  fileName: string | null;
  result: {
    invoiceNo: string;
    transactionID: string;
    reservationCode?: string;
  } | null;
}
