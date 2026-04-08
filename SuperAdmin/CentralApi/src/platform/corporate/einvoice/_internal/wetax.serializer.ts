/**
 * 한국어: WeTax JSON serializer — `WeTaxInvoiceBody` (camelCase) → WeTax API 가 요구하는
 *   snake_case JSON 으로 변환한다.
 *
 *   원본: `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` 의 `BuildInvoiceBodyJson`.
 *   상세 사양: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §2 / §10
 *
 *   주요 변환 규칙:
 *     - buyer.name 이 비어있으면 'Khách lẻ' 로 채운다.
 *     - currency_code, exchange_rate, payment_method 는 invoice.* 에서 직접 가져온다 (constant 아님).
 *     - 모든 amount 는 정수 (VND 통화는 소수점 없음).
 *     - serial_no 는 invoice.serialNo (사전 생성됨) 사용.
 *     - 미설정 optional 필드는 빈 문자열로 직렬화 (WeTax 가 null 비허용).
 *
 * Tiếng Việt: Serializer JSON cho WeTax — chuyển đổi camelCase sang snake_case.
 */
import { WeTaxConstants } from './wetax.constants';
import type {
  WeTaxBuyer,
  WeTaxInvoice,
  WeTaxInvoiceBody,
  WeTaxInvoiceDetail,
  WeTaxSeller,
} from './wetax.types';

interface SerializedDetail {
  seq: number;
  item_code: string;
  item_name: string;
  uom: string;
  quantity: number;
  unit_price: number;
  amount: number;
  vat_rate: string;
  vat_amount: number;
  pay_amount: number;
  feature: string;
  dc_rate: number;
  dc_amount: number;
}

interface SerializedInvoice {
  order_date: string;
  ref_id: string;
  cqt_code: string;
  bill_no: string;
  pos_no: string;
  invoice_type: string;
  form_no: string;
  serial_no: string;
  trans_type: string;
  currency_code: string;
  exchange_rate: number;
  payment_method: string;
  buyer_address: string;
  tot_amount: number;
  tot_dc_amount: number;
  tot_vat_amount: number;
  tot_pay_amount: number;
  buyer_comp_name: string;
  buyer_tax_code: string;
  buyer_name: string;
  buyer_cccd: string;
  buyer_passport_no: string;
  buyer_budget_unit_code: string;
  buyer_tel: string;
  buyer_email: string;
  buyer_email_cc: string;
  invoice_details: SerializedDetail[];
}

interface SerializedSeller {
  tax_code: string;
  store_code: string;
  store_name: string;
}

export interface SerializedWeTaxBody {
  seller: SerializedSeller;
  invoices: SerializedInvoice[];
  buyerNotGetInvoice: 0 | 1;
}

function serializeSeller(seller: WeTaxSeller): SerializedSeller {
  return {
    tax_code: seller.taxCode,
    store_code: seller.storeCode,
    store_name: seller.storeName,
  };
}

function serializeDetail(detail: WeTaxInvoiceDetail): SerializedDetail {
  return {
    seq: detail.seq,
    item_code: detail.itemCode ?? '',
    item_name: detail.itemName,
    uom: detail.uom,
    quantity: detail.quantity,
    unit_price: detail.unitPrice,
    amount: detail.amount,
    vat_rate: detail.vatRate,
    vat_amount: detail.vatAmount,
    pay_amount: detail.payAmount,
    feature: detail.feature || WeTaxConstants.FEATURE,
    dc_rate: detail.dcRate ?? 0,
    dc_amount: detail.dcAmount ?? 0,
  };
}

function buyerName(buyer: WeTaxBuyer): string {
  return buyer.name && buyer.name.trim().length > 0
    ? buyer.name
    : WeTaxConstants.DEFAULT_BUYER_NAME;
}

function serializeInvoice(invoice: WeTaxInvoice, orderDate: string): SerializedInvoice {
  const buyer = invoice.buyer;
  return {
    order_date: orderDate,
    ref_id: invoice.refId,
    cqt_code: invoice.cqtCode,
    bill_no: invoice.billNo,
    pos_no: invoice.posNo,
    invoice_type: invoice.invoiceType,
    form_no: invoice.formNo,
    serial_no: invoice.serialNo,
    trans_type: invoice.transType,
    currency_code: invoice.currencyCode,
    exchange_rate: invoice.exchangeRate,
    payment_method: invoice.paymentMethod,
    buyer_address: buyer.address ?? '',
    tot_amount: invoice.totAmount,
    tot_dc_amount: invoice.totDcAmount,
    tot_vat_amount: invoice.totVatAmount,
    tot_pay_amount: invoice.totPayAmount,
    buyer_comp_name: buyer.companyName ?? '',
    buyer_tax_code: buyer.taxCode ?? '',
    buyer_name: buyerName(buyer),
    buyer_cccd: buyer.cccd ?? '',
    buyer_passport_no: buyer.passportNo ?? '',
    buyer_budget_unit_code: buyer.budgetUnitCode ?? '',
    buyer_tel: buyer.tel ?? '',
    buyer_email: buyer.email ?? '',
    buyer_email_cc: buyer.emailCc ?? '',
    invoice_details: invoice.invoiceDetails.map(serializeDetail),
  };
}

export function serializeWeTaxBody(body: WeTaxInvoiceBody): SerializedWeTaxBody {
  return {
    seller: serializeSeller(body.seller),
    invoices: body.invoices.map((inv) => serializeInvoice(inv, body.seller.orderDate)),
    buyerNotGetInvoice: body.buyerNotGetInvoice,
  };
}

export function buildWeTaxBodyJson(body: WeTaxInvoiceBody): string {
  return JSON.stringify(serializeWeTaxBody(body));
}
