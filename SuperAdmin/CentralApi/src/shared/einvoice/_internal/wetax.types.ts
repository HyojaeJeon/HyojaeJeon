/**
 * 한국어: WeTax provider 전용 TypeScript 타입.
 *
 *   `HJ-POS-TEST/WeTax/WeTaxMgr.h` 의 C++ 구조체 (`t_wetax_seller`, `t_wetax_invoices`,
 *   `t_wetax_invoice_details`, `t_wetax_invoice_body`, `t_wetax_company`) 와 1:1 매핑된다.
 *   필드명은 camelCase 로 정규화되었지만, 직렬화 시 wetax 측 snake_case 로 변환은
 *   `wetax.serializer.ts` 가 책임진다.
 *
 *   본 파일은 leaf 외부에서 import 하지 않는다. (`_internal/` 규칙)
 *
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §2
 *
 * Tiếng Việt: Type TypeScript dành riêng cho provider WeTax.
 */

export type WeTaxVatType = 'INCLUDED' | 'SEPARATED' | 'EXEMPT';

export type WeTaxTransType = '1' | '2'; // 1=Sell, 2=Return

export interface WeTaxSeller {
  /** 사업자등록번호 (10/13 자리). */
  taxCode: string;
  /** 매장 코드. */
  storeCode: string;
  /** 매장 법인명 (BasicCode TypeCode='21' 의 sellerLegalName). */
  storeName: string;
  /** 발급 시각 — format YYYYMMDDHHmmss (현지 시간). */
  orderDate: string;
}

export interface WeTaxInvoiceDetail {
  /** 1-based 순번. */
  seq: number;
  itemCode?: string;
  itemName: string;
  /** unit of measure (예: '개', 'EA', 'KG'). */
  uom: string;
  /** 양수만. 음수 환불 항목은 merger 가 사전 처리. */
  quantity: number;
  unitPrice: number;
  /** 세전 합계 (quantity × unitPrice). */
  amount: number;
  /** '0.0%' / '5.0%' / '8.0%' / '10.0%' 형식 문자열. */
  vatRate: string;
  vatAmount: number;
  /** 세후 결제 금액. */
  payAmount: number;
  /** '1' (일반). WeTax 의 feature 필드. */
  feature: string;
  /** 할인율 (입력 메뉴 DC 의 양수화). */
  dcRate?: number;
  dcAmount?: number;
}

export interface WeTaxBuyer {
  /** 사업자명. 비어있으면 'Khách lẻ' 로 직렬화. */
  companyName?: string;
  taxCode?: string;
  name?: string;
  /** 베트남 시민증 (CCCD). */
  cccd?: string;
  passportNo?: string;
  budgetUnitCode?: string;
  tel?: string;
  email?: string;
  emailCc?: string;
  address?: string;
}

export interface WeTaxInvoice {
  /** 멱등성 키. 14자리 yyyyMMddHHmmss + 3자리 posNo + 5자리 daySequence. */
  refId: string;
  /** CQT 인증 코드 — 빈 문자열 가능. */
  cqtCode: string;
  billNo: string;
  posNo: string;
  /** '0' = Sales invoice. */
  invoiceType: string;
  /** '1'. */
  formNo: string;
  /** 'C25TKT' / 'K25TKT' 형식. */
  serialNo: string;
  transType: WeTaxTransType;
  currencyCode: 'VND';
  exchangeRate: number;
  /** 'TM/CK' (현금/계좌이체). */
  paymentMethod: string;
  totAmount: number;
  totDcAmount: number;
  totVatAmount: number;
  totPayAmount: number;
  invoiceDetails: WeTaxInvoiceDetail[];
  buyer: WeTaxBuyer;
}

export interface WeTaxInvoiceBody {
  seller: WeTaxSeller;
  invoices: WeTaxInvoice[];
  /** 1 = 개인 고객 ('Khách lẻ'), 0 = 사업자 buyer. */
  buyerNotGetInvoice: 0 | 1;
}

export interface WeTaxCompany {
  taxId: string;
  companyName: string;
  address: string;
  taxOfficeName: string;
  email: string;
  emailCc: string;
  status: string;
  companyStatus: string;
  lastUpdate: string;
}

export interface WeTaxPublishResponseItem {
  refId: string;
  lookupCode: string;
  cqtCode: string;
  serialNo: string;
  invoiceNo: string;
}

export interface WeTaxPublishResponse {
  status: { success: boolean; message?: string };
  data: WeTaxPublishResponseItem[];
}

export interface WeTaxLoginResponse {
  status: { success: boolean; message?: string };
  data: { accessToken: string; expiresIn?: number };
}
