# EInvoice — WeTax Provider 사양서
# Tài liệu đặc tả Provider WeTax cho EInvoice

> 본 문서는 신규 Platform 의 베트남 전자세금계산서(e-Invoice) 발급 1차 구현체인 **WeTax provider** 의 사양 박제다.
>
> **재사용 원칙**: 기존 `HJ-POS-TEST/WeTax/WeTaxMgr.{h,cpp}` (1,842 lines, C++ MFC) 의 코드는 그대로 복제하지 않는다. 본 문서는 그 모듈에서 추출한 **API 계약 / 필드 / 플로우 / 엣지 케이스** 만을 한국어로 정리하여, 신규 NestJS + TypeScript 구현이 같은 동작을 100% 달성하도록 한다.
>
> **참조 자료**:
> - `HJ-POS-TEST/WeTax/WeTaxMgr.h` (구조체 정의)
> - `HJ-POS-TEST/WeTax/WeTaxMgr.cpp` (1,658 lines, 핵심 로직)
> - `1.Docs/기획 및 설계/프로젝트 통합설계/01-SuperAdmin-기능리스트.md` §13.1
> - `1.Docs/식권관리플랫폼/프로젝트 개요.md` (베트남 세무·규제 배경)
>
> **신규 구현 위치**: `SuperAdmin/CentralApi/src/platform/corporate/einvoice/_internal/`

---

## 0. 적용 범위와 위임 경계
## 0. Phạm vi áp dụng

### 0.1 본 사양이 정의하는 것

- WeTax SaaS (`apitest.wetax.com.vn` / 향후 `api.wetax.com.vn`) 와의 **HTTP 통합 계약**
- 인보이스 발급에 필요한 **요청/응답 JSON 스키마**
- 발급 전 데이터 빌드 단계 (seller / buyer / lines) 의 **변환 규칙**
- VAT / 통화 / 시리얼 / 음수 수량 / 개인고객 등 **엣지 케이스**
- 사업자번호 (Tax Code) **KYC 3-source fallback**
- 응답 → 내부 모델 (`MealConsolidatedEInvoice`) **매핑 규칙**

### 0.2 본 사양이 정의하지 않는 것 (위임)

- WeTax 외 다른 provider (Bizzi / Misa / GDT Direct) — 별도 사양으로
- 발급 큐 / 재시도 정책 / 회로 차단기 — `EInvoiceService` 책임
- 권한 / 감사 / realtime — 기존 `core/rbac`, `core/audit`, `core/realtime` 사용
- POS 영수증과의 통합 — `MealTransaction` ↔ `MealConsolidatedEInvoice` 의 service-layer 매핑 책임

---

## 1. WeTax SaaS 개요
## 1. Tổng quan WeTax SaaS

| 항목 | 값 |
|---|---|
| Provider | WebCash Vietnam (Korean fintech, vendor) |
| Sandbox | `https://apitest.wetax.com.vn` |
| Production | `https://api.wetax.com.vn` (운영 등록 후 활성) |
| 인증 방식 | Bearer token (JWT). `POST /api/wtx/pa/v1/auth/login` 으로 발급 |
| 컨텐츠 타입 | `application/json` |
| 문자 인코딩 | UTF-8 |
| 통화 | VND 고정 (확장 시 다른 통화 추가 가능) |
| GDT 연동 | WeTax 가 GDT 와 직접 통신하며, 우리 시스템은 WeTax 만 호출 |

### 1.1 핵심 endpoint

| Method | Path | 용도 |
|---|---|---|
| `POST` | `/api/wtx/pa/v1/auth/login` | Bearer token 발급 (username + password) |
| `POST` | `/api/wtx/pa/v1/pos/invoices-publish` | 인보이스 발급 (1건 이상) |
| `GET` | `/api/wtx/pa/v1/company/{taxId}` | 사업자번호 조회 (KYC) |

### 1.2 KYC fallback (사업자번호 조회)

WeTax 응답이 비정상이거나 미인증 사업자일 경우 다음 순서로 fallback:

1. **WeTax** `/api/wtx/pa/v1/company/{taxId}` (1차)
2. **VietQR** `https://api.vietqr.io/v2/business/{taxId}` (2차)
3. **eSGoo** `https://thongtindoanhnghiep.co/api/company/{taxId}` 또는 esgoo.net 엔드포인트 (3차)

세 출처 모두 실패 시 `KYC_LOOKUP_FAILED` 에러로 사용자에게 manual 입력을 유도한다.

---

## 2. 도메인 모델 (TypeScript interface 1:1 매핑)
## 2. Mô hình domain

WeTaxMgr 의 C++ 구조체를 신규 Platform 의 TypeScript interface 로 1:1 매핑한다. 위치: `_internal/wetax.types.ts`.

### 2.1 `WeTaxSeller` (← `t_wetax_seller`)

```typescript
export interface WeTaxSeller {
  taxCode: string;        // 사업자등록번호 (10/13 자리)
  storeCode: string;      // 매장 코드
  storeName: string;      // 매장 법인명 (BasicCode TypeCode='21' 의 sellerLegalName)
  orderDate: string;      // 발급 시각, format YYYYMMDDHHmmss (현지 시간)
}
```

### 2.2 `WeTaxInvoiceDetail` (← `t_wetax_invoice_details`)

```typescript
export interface WeTaxInvoiceDetail {
  // Required
  seq: number;             // 1-based
  itemName: string;
  uom: string;             // unit of measure (예: '개', 'EA', 'KG')
  quantity: number;        // 양수만 (음수 환불 항목은 merger 가 처리)
  unitPrice: number;
  amount: number;          // 세전 합계 (quantity * unitPrice)
  vatRate: string;         // '0.0%' / '5.0%' / '8.0%' / '10.0%'
  vatAmount: number;
  payAmount: number;       // 세후 결제 금액
  feature: string;         // '1' (일반)

  // Optional
  itemCode?: string;

  // Discount (not required by API but tracked)
  dcRate?: number;         // 할인율 (입력 메뉴 DC 양수화)
  dcAmount?: number;
}
```

### 2.3 `WeTaxBuyer` + `WeTaxInvoice` (← `t_wetax_invoices`)

```typescript
export interface WeTaxBuyer {
  // Optional — 비어있으면 'Khách lẻ' (개인 고객)
  companyName?: string;    // 사업자명
  taxCode?: string;        // buyer 사업자번호
  name?: string;           // 개인 이름
  cccd?: string;           // 시민증 (CCCD)
  passportNo?: string;
  budgetUnitCode?: string; // 예산 단위 코드 (정부)
  tel?: string;
  email?: string;
  emailCc?: string;
  address?: string;
}

export interface WeTaxInvoice {
  // Required
  refId: string;           // 멱등성 키. 14자리 sellDate + 3자리 posNo + 5자리 receiptNo
  cqtCode: string;         // CQT 인증 코드 ('' 가능)
  billNo: string;          // 영수증 번호
  posNo: string;           // POS 단말 번호
  invoiceType: string;     // '0' (Sales invoice)
  formNo: string;          // '1'
  serialNo: string;        // 자동 생성 (예: 'C25TKT')
  transType: '1' | '2';    // 1=Sell, 2=Return
  currencyCode: 'VND';
  exchangeRate: number;    // 1.0
  paymentMethod: string;   // 'TM/CK' (현금/계좌이체)
  totAmount: number;       // 세전 합계
  totDcAmount: number;     // 할인 합계
  totVatAmount: number;
  totPayAmount: number;
  invoiceDetails: WeTaxInvoiceDetail[];

  // Buyer 정보
  buyer: WeTaxBuyer;
}
```

### 2.4 `WeTaxInvoiceBody` (← `t_wetax_invoice_body`)

```typescript
export interface WeTaxInvoiceBody {
  seller: WeTaxSeller;
  invoices: WeTaxInvoice[];
  /** 1 = 개인 고객 ('Khách lẻ'), 0 = 사업자 buyer */
  buyerNotGetInvoice: 0 | 1;
}
```

### 2.5 `WeTaxCompany` (← `t_wetax_company`)

```typescript
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
```

### 2.6 `WeTaxPublishResponse`

```typescript
export interface WeTaxPublishResponseItem {
  refId: string;
  lookupCode: string;      // outReceipt.Notice
  cqtCode: string;         // outReceipt.SubCol1
  serialNo: string;        // outReceipt.PermitNo prefix
  invoiceNo: string;       // outReceipt.PermitNo suffix
}

export interface WeTaxPublishResponse {
  status: { success: boolean; message?: string };
  data: WeTaxPublishResponseItem[];
}
```

---

## 3. 상수 (constants)
## 3. Hằng số

`_internal/wetax.constants.ts` 에 정의:

```typescript
export const WeTaxConstants = {
  DATE_FORMAT: 'YYYYMMDDHHmmss',  // C++ '%Y%m%d%I%M%S'
  INVOICE_TYPE: '0',               // 0: Sales invoice
  FORM_NO: '1',
  TRANS_TYPE_SELL: '1',
  TRANS_TYPE_RETURN: '2',
  CURRENCY_CODE: 'VND',
  PAYMENT_METHOD: 'TM/CK',         // 현금/계좌이체
  SERIAL_TYPE: 'TKT',
  SERIAL_PREFIX_NO_CQT: 'K',       // CQT 코드 미인증 시
  SERIAL_PREFIX_CQT: 'C',          // CQT 코드 인증 시
  EXCHANGE_RATE: 1.0,
  FEATURE: '1',
  DEFAULT_BUYER_NAME: 'Khách lẻ',  // 개인 고객 표기

  VAT_TYPE_INCLUDED: '포함',       // VAT included in price
  VAT_TYPE_SEPARATED: '별도',      // VAT calculated separately
  VAT_TYPE_EXEMPT: '면세',         // VAT exempt

  // BasicCode TypeName 매핑
  CONFIG_BASIC_CODE: '34',
  TYPE_NAME_USERNAME: 'usernameWeTax',
  TYPE_NAME_PASSWORD: 'passwordWeTax',
  TYPE_NAME_TAX_CODE: 'taxCodeWeTax',
  TYPE_NAME_STORE_CODE: 'storeCodeWeTax',
  TYPE_NAME_SERIAL_NO: 'serialNoWeTax',

  API: {
    LOGIN: '/api/wtx/pa/v1/auth/login',
    PUBLISH_INVOICE: '/api/wtx/pa/v1/pos/invoices-publish',
    COMPANY: '/api/wtx/pa/v1/company/',
  },

  HEADERS: {
    CONTENT_TYPE_JSON: 'application/json',
    AUTH_BEARER_PREFIX: 'Bearer ',
    ACCEPT_JSON: 'application/json',
  },
} as const;
```

---

## 4. 핵심 플로우
## 4. Luồng phát hành

식권 플랫폼은 **단 하나의 발급 모드만** 사용한다 — `corporate 단위 월별 통합 인보이스 (Consolidated)`. 본 절은 그 시나리오를 정의한다.

### 4.0 발급 주체 매트릭스 (3 흐름) — 본 시스템 책임 1개

| # | Seller (발급자) | Buyer (수령자) | 발급 시점 | 본 시스템 책임 |
|---|---|---|---|---|
| ① | 가맹점 (식당) | 임직원 (개인) | — | **❌ 발급하지 않음** — 임직원은 비용 부담자가 아님 |
| ② | 가맹점 (식당) | 플랫폼 사업자 | 매월 정산 | **수령·검증·매칭** (가맹점 자체 발급) |
| ③ | **플랫폼 사업자** | **기업고객 (corporate)** | **매월 1일** | **✅ 본 사양의 핵심 (통합 모드)** |

### 4.0.1 왜 ①번 (개인 인보이스) 을 발급하지 않는가

베트남 적색 송장 (Red Invoice) 의 buyer 는 **비용을 부담하는 주체** 여야 한다. 임직원의 식대 결제는:

- **회사 비용** 이다 → buyer = 회사 (corporate)
- 임직원 본인은 단순 사용자 — 본인 사비 지출이 아님
- **Circular 003/2025 + Decree 44/2025** 로 식대는 임직원 PIT 비과세 → 개인 세무 처리 대상 자체가 아님
- Split Payment 의 개인 부담 부분 (회사 포인트 부족분) 도 임직원 본인의 식비 지출 → 개인이 손금 처리할 게 없음 → 본인 명의 인보이스 불필요

따라서 **식권 플랫폼은 임직원 본인 명의의 인보이스를 일체 발급하지 않는다.** 모든 식권 거래는 corporate 단위로 합산되어 ③번 흐름의 통합 인보이스 1장으로 처리된다.

> WeTaxMgr 원본의 `'Khách lẻ'` (개인고객), `buyerNotGetInvoice=1`, `transType='2'(Return)` 같은 단건 시나리오 처리는 본 식권 플랫폼에서 사용되지 않는다.

### 4.0.2 ②번 (가맹점 → 플랫폼 사업자) 책임 분리

가맹점이 자기 매출에 대해 발행하는 인보이스는 **가맹점 자체 책임** (가맹점의 POS 또는 가맹점이 사용하는 다른 e-Invoice provider). 본 식권 플랫폼은 그 인보이스를 **수령하여 3-Way Matching** (사양서 §13.6) 에 사용할 뿐 직접 발급하지 않는다.

### 4.0.3 WeTaxMgr 원본과 식권 플랫폼의 자산 재사용표

| 자산 | 식권 플랫폼에서의 사용 |
|---|---|
| WeTax API endpoint (`/invoices-publish`, `/company`) | ✅ 그대로 사용 (통합 모드 호출) |
| `WeTaxInvoiceBody` JSON 스키마 | ✅ 그대로 사용 (1 invoice 안에 N lines) |
| `wetax.serializer.ts` (snake_case 변환) | ✅ 그대로 사용 |
| `wetax.constants.ts` | ✅ 그대로 사용 (단, `DEFAULT_BUYER_NAME='Khách lẻ'` 는 본 플랫폼 미사용) |
| `wetax.client.ts` (HTTP) | ✅ 그대로 사용 |
| `wetax.merger.ts` (음수 수량 머지) | ⚠️ 통합 모드의 환불(Reversal) 거래 합산에만 활용 — 단건 모드 발급용 아님 |
| `IssuanceInvoice` orchestrator (단건 모드) | ❌ 재사용 안 함 — `EInvoiceConsolidator` + `WeTaxProvider.publish` 로 대체 |
| `'Khách lẻ'` / `buyerNotGetInvoice=1` 분기 | ❌ 사용 안 함 — buyer 는 항상 corporate (taxCode 필수) |
| `transType='2' (Return)` | ❌ 사용 안 함 — 환불은 통합 합산에서 차감 처리 |
| 단건 RefId (`yyyyMMddHHmmss + posNo + receiptNo`) | ❌ 사용 안 함 — 통합 RefId (`MC + yyyyMM + corporate12`) 사용 |

---

### 4.3 통합 모드 (Consolidated, 월별 closing) — 식권 플랫폼 핵심

식권 플랫폼이 **기업고객(corporate) 에게 매월 1회 발행** 하는 단일 통합 전자세금계산서. 한 corporate 의 한달간 모든 임직원 식대 결제를 합산하여 인보이스 1장으로 발급한다.

#### 4.3.1 베트남 법적 근거

- **Decree 123/2020**: 통합 인보이스(Consolidated E-Invoice) 발급 허용
- **Circular 32/2025**: 고빈도 소액 결제(B2B 플랫폼) 의 일/월 단위 합산 인보이스 발급 명시 허용
- **Decree 44/2025 + Circular 003/2025**: 식대 PIT 비과세 한도 폐지 → 기업이 무제한 비과세로 손금 처리하려면 **법적 효력 있는 단일 통합 인보이스** 가 반드시 필요

> 본 모드는 식권 플랫폼이 베트남 시장에서 차별화되는 결정적 기능이며, "재무팀 영수증 처리 99% 자동화" 의 기술적 구현이다.

#### 4.3.2 5단계 closing 흐름

```
[1] 매일: 임직원 결제
    → MealTransaction (status: APPROVED|SETTLED)
    → realtime topic: corporate.transaction.changed

[2] 매월 1일 00:00: SyncWorkers cron
    → EInvoiceConsolidationJob.runForAllActiveCorporates(period=prevMonth)
    → 각 corporate 별로 EInvoiceConsolidator.run() 호출

[3] EInvoiceConsolidator.run(corporateId, periodStart, periodEnd)
    a. 대상 거래 조회
       SELECT * FROM MealTransaction
       WHERE corporateId = X
         AND status IN ('APPROVED', 'SETTLED')
         AND createdAt >= periodStart AND createdAt < periodEnd + 1day
       ORDER BY createdAt
    b. consolidationStrategy 에 따라 그룹화
       ─ BY_MERCHANT (기본): 가맹점별 합산 1줄
       ─ BY_DAY: 일자별 합산 1줄
       ─ BY_DEPARTMENT: corporate 부서별 합산 1줄
       ─ BY_CATEGORY: 메뉴 카테고리별 합산 1줄
       ─ SINGLE_LINE: 전체 1줄 ('Meal services {YYYY-MM}')
    c. VAT 분리 계산 (베트남 표준 8% 또는 10% 또는 면세)
    d. MealConsolidatedEInvoice (status='DRAFT') + Lines 영속화
    e. seller snapshot = 플랫폼 사업자 (Hyojung Softtech 등)
    f. buyer  snapshot = corporate (companyName, taxCode, address, contactEmail)
    g. periodStart / periodEnd 박제
    h. refId = `MC{YYYYMM}{corporateId-12}` 형식 (멱등성)
    i. realtime topic: platform.einvoice.consolidation.created

[4] SuperAdmin 검수 (SA-EINV-003 큐)
    a. /governance/compliance/einvoice/queue?status=DRAFT
    b. 총액 / 거래수 / 라인 수 / 누락 건 검토
    c. SuperAdmin 이 submitConsolidatedInvoice(id) 호출
    d. EInvoiceService.publish(id):
       - WeTaxProvider.publish(ctx) 호출
       - ctx.seller = 플랫폼 사업자 정보 (corporate 의 가맹점이 아님!)
       - ctx.buyer  = corporate (companyName, taxCode 필수)
       - ctx.lines  = MealConsolidatedEInvoiceLine 들을 WeTaxInvoiceDetail 로 변환
       - ctx.buyerNotGetInvoice = 0 (사업자 buyer 이므로 항상 0)
       - ctx.transType = '1' (Sell)
       - WeTax → GDT → ACCEPTED
       - 응답을 invoice 모델에 기록

[5] 기업고객 다운로드
    a. SA-CORP-INV-001 (기존) 화면에서 corporate 별 인보이스 목록 표시
    b. PDF/XML 다운로드 (provider 가 제공한 lookup_code 로)
    c. corporate 의 재무팀이 단일 손금 증빙으로 회계 입력
```

#### 4.3.3 통합 모드 핵심 속성 (요약)

| 항목 | 통합 모드 |
|---|---|
| 트리거 | 매월 1일 SyncWorkers cron + SuperAdmin 검수 승인 |
| Seller | 플랫폼 사업자 (`PlatformLegalEntity.findActive()`) |
| Buyer | 기업고객 corporate (taxCode + companyName + addressFull 필수) |
| Lines 의미 | corporate 의 한달치 식권 거래를 그룹화 전략(consolidationStrategy) 으로 합산 |
| Period | half-open `[periodStart, periodEnd)` — 항상 월 단위 |
| invoice ↔ 거래 | 1 : N (수백~수천) |
| 멱등성 키 | `refId = MC + YYYYMM + corporateId-12` |
| RefId 충돌 시 | 같은 corporate × 같은 달 → 같은 refId → @@unique 로 dedupe → 재실행 안전 |
| 발급 단위 | 1 corporate × 1 month = 1 invoice |
| `buyerNotGetInvoice` | **항상 0** (사업자 buyer 만 허용 — 개인 buyer 케이스 없음) |
| `transType` | **항상 '1' (Sell)** — 환불은 별도 발급이 아니라 합산 차감 |

#### 4.3.4 라인 그룹화 전략 (consolidationStrategy)

베트남 재무부의 통합 인보이스 line 표시 규정상 다음 5 전략 모두 합법적이다. corporate 별로 선택 가능 (`MealCorporate.einvoiceConsolidationStrategy` 신규 필드).

| 전략 | 라인 1줄 = | itemName 예시 | 권장 사용처 |
|---|---|---|---|
| **BY_MERCHANT** ★ | 한 가맹점의 한달치 합산 | "Meal services - Phở 24 Hanoi" | 기본. 가맹점이 적고 정산 추적 명확 |
| **BY_DAY** | 한 날의 모든 결제 합산 | "Meal services - 2026-03-15" | 일별 분석이 필요한 corporate |
| **BY_DEPARTMENT** | 한 부서의 한달치 합산 | "Meal services - 개발팀 (3월)" | 부서별 손금 분리가 필요한 corporate |
| **BY_CATEGORY** | 메뉴 카테고리별 합산 | "Meal services - 한식 (3월)" | 거의 사용 안 함 |
| **SINGLE_LINE** | 전체 1줄 | "Meal services - 2026/03 (corporate name)" | 가장 단순. 최소 정보 노출 |

기본값 = `BY_MERCHANT`. corporate 는 SuperAdmin 화면에서 변경 가능 (SA-CORP-002 의 설정 탭).

#### 4.3.5 통합 모드 멱등성 (refId 정책)

```typescript
function generateConsolidatedRefId(corporateId: string, periodStart: Date): string {
  const yyyymm = format(periodStart, 'yyyyMM');
  const corp12 = corporateId.replace(/-/g, '').slice(0, 12).toUpperCase();
  return `MC${yyyymm}${corp12}`;
  // 예: 'MC202603A1B2C3D4E5F6'
}
```

같은 corporate 의 같은 달에 대해 cron 이 재실행되어도 같은 refId 가 생성되어 dedupe 된다 (`@@unique([refId])`).

#### 4.3.6 통합 모드 검증 단계

`EInvoiceConsolidator.validate(invoice)`:

- `corporate.taxCode` 비어있지 않음 (개인 buyer 불가)
- `corporate.companyName` 비어있지 않음
- `lines.length > 0`
- `lines.totalAmount > 0`
- `periodStart < periodEnd`
- `periodStart` 는 항상 월의 첫날, `periodEnd` 는 다음달 첫날
- 같은 (`corporateId`, `periodStart`, `periodEnd`) 의 ACCEPTED 상태 invoice 가 이미 존재하지 않음

위반 시 `DomainError({ code: 'EINVOICE_CONSOLIDATION_INVALID', params, details })`.

---

### 4.4 발급 단위 식별자 (Seller / Buyer 매트릭스)

#### Seller (플랫폼 사업자)

본 식권 플랫폼은 **베트남 전용** 이며, 통합 인보이스의 seller 는 항상 **베트남 법인 1곳** 이다. SuperAdmin 이 `PlatformLegalEntity` 모델에 등록하며, 한 시점에 `isActive=true` 인 row 가 정확히 1개여야 한다. 법인 변경 시 기존 row 를 `isActive=false` 로 두고 신규 row 를 추가 (이력 추적용).

| 필드 | 값 예시 | 비고 |
|---|---|---|
| code | `HYOJUNG_VN_HQ` | 식별 코드 (전역 unique) |
| taxCode | `0123456789` | 베트남 사업자등록번호 (Mã số thuế / GDT 등록 번호) |
| legalName | `Công ty Cổ phần Hyojung Softtech` | 베트남어 법적 명칭 |
| displayName | `Hyojung Softtech` | invoice 표시용 짧은 이름 |
| addressFull | 베트남 현지 주소 (예: `Tầng 12, Tòa nhà ...`, Hanoi) | buyer_address 가 아닌 seller_address 기재용 |
| representativeName | 대표자 베트남어 표기 | |
| contactEmail | finance@hyojung.vn | |
| defaultSerialPrefix | `C` | CQT 인증 사업자 |

> **다국가 확장은 본 사양 범위에 없다.** 향후 별도 국가의 식권 플랫폼이 필요할 경우 본 모델을 분리하거나 country 분기를 신설하는 별도 사양으로 처리한다.

#### Buyer (기업고객)

`MealCorporate` 의 다음 필드가 그대로 buyer 정보로 매핑된다:

| MealCorporate 필드 | WeTax buyer 필드 | 필수 |
|---|---|---|
| companyName | buyer_comp_name | ✅ |
| taxCode | buyer_tax_code | ✅ |
| (가칭) addressFull | buyer_address | ✅ |
| contactName | buyer_name | (대표 수령자) |
| contactEmail | buyer_email | |
| (가칭) emailCc | buyer_email_cc | |

> `MealCorporate` 모델에 `addressFull` (`@db.VarChar(500)`) 컬럼을 추가해야 한다 (Phase 1 후속 마이그레이션). 현재는 corporate 등록 시 주소를 입력받지 않는다.

---

### 4.5 통합 모드 시퀀스 (전체)

```
EInvoiceConsolidationJob (cron, 매월 1일 00:00 GMT+7)
   │
   ├─ 1. CorporateService.listActive() — solutionType ∈ {URBAN_OFFICE, HYBRID}
   │
   ├─ 2. for each corporate:
   │     ├─ EInvoiceConsolidator.run(corporateId, prevMonthRange)
   │     │     ├─ Transactions = MealTransactionService.findByCorporateInPeriod(...)
   │     │     ├─ groupingStrategy = corporate.einvoiceConsolidationStrategy
   │     │     ├─ groupedLines = LineGroupingFn(transactions, strategy)
   │     │     ├─ validate(...)
   │     │     ├─ refId = generateConsolidatedRefId(corporateId, periodStart)
   │     │     ├─ MealConsolidatedEInvoice.create({
   │     │     │     refId, corporateId, periodStart, periodEnd,
   │     │     │     consolidationStrategy, status='DRAFT',
   │     │     │     sellerSnapshot, buyerSnapshot,
   │     │     │     totalAmountVnd, vatAmountVnd
   │     │     │   })
   │     │     └─ MealConsolidatedEInvoiceLine.createMany(groupedLines)
   │     │
   │     └─ realtime publish: platform.einvoice.consolidation.created
   │
   └─ 종료: SuperAdmin 알림 (n건 DRAFT 생성)

──────────────── (수동 / 자동 승인 분기) ────────────────

EInvoiceService.publish(invoiceId)  ── SuperAdmin 또는 자동 승인 cron
   │
   ├─ 1. invoice = MealConsolidatedEInvoice.findById(id)
   │     status === 'DRAFT' 또는 'BUILT' 만 허용
   │
   ├─ 2. ctx = ConsolidatedPublishContextBuilder.build(invoice)
   │     ├─ ctx.seller = PlatformLegalEntity.getActive()
   │     ├─ ctx.buyer = invoice.buyerSnapshot
   │     ├─ ctx.lines = invoice.lines → WeTaxInvoiceDetail[] 변환
   │     ├─ ctx.buyerNotGetInvoice = 0 (always 0 for B2B consolidated)
   │     ├─ ctx.refId = invoice.refId
   │     └─ ctx.serialNo = generateSerialNo('C', 'TKT')
   │
   ├─ 3. WeTaxProvider.publish(ctx)
   │     → POST /api/wtx/pa/v1/pos/invoices-publish
   │     → WeTax 가 GDT 와 통신
   │     → response { lookup_code, cqt_code, invoice_no, ... }
   │
   ├─ 4. invoice.update({
   │       status: 'ACCEPTED',
   │       cqtCode, invoiceNo, lookupCode,
   │       providerResponseJson, gdtReceiptNo: serialNo + invoiceNo
   │     })
   │
   ├─ 5. EInvoiceSubmissionLog.create({ attempt, requestJson, responseJson })
   ├─ 6. AuditService.log(actionType='EINVOICE_PUBLISH', targetType='MealConsolidatedEInvoice')
   └─ 7. realtime publish: corporate.einvoice.changed + platform.einvoice.submission.accepted
```

---

## 5. RefId 생성 규칙
## 5. Quy tắc sinh RefId

식권 플랫폼은 **통합 모드 RefId 단 하나만** 사용한다. `MealConsolidatedEInvoice.refId` 컬럼에 저장되며 `@@unique` 제약으로 같은 corporate × 같은 달의 중복 발급을 dedupe 한다.

```typescript
function generateConsolidatedRefId(corporateId: string, periodStart: Date): string {
  // 6자리: yyyyMM
  const yyyy = periodStart.getUTCFullYear();
  const mm = String(periodStart.getUTCMonth() + 1).padStart(2, '0');
  // 12자리: corporate UUID 의 hex 12자 (대문자)
  const corp12 = corporateId.replace(/-/g, '').slice(0, 12).toUpperCase();
  // prefix 'MC' = Monthly Consolidated
  return `MC${yyyy}${mm}${corp12}`;
  // 예: 'MC202603A1B2C3D4E5F6'
}
```

- 길이: 2 + 6 + 12 = **20자**
- 단위: (corporate × 월) 별로 고유
- 멱등성: cron 이 같은 달에 재실행되어도 같은 refId 가 생성 → unique 충돌 → dedupe (안전한 재실행)
- 단건 모드 RefId 는 본 사양 범위 외 (사용하지 않음)

---

## 6. 시리얼 번호 생성 규칙
## 6. Quy tắc sinh Serial Number

WeTaxMgr.cpp:817-827 의 `GenerateSerialNo` 와 동일.

```typescript
function generateSerialNo(prefix: 'C' | 'K' = 'C', type: 'TKT' = 'TKT'): string {
  const yy = String(new Date().getFullYear() % 100).padStart(2, '0');
  return `${prefix}${yy}${type}`;
}
```

- `prefix='C'`: CQT 코드가 인증된 사업자
- `prefix='K'`: CQT 코드 미인증 (등록 직전 임시)
- 출력 예: `C25TKT`, `K25TKT`

---

## 7. VAT 처리 (3 분기)
## 7. Xử lý VAT 3 loại

WeTaxMgr.cpp:858~941 의 `GetInvoiceDetails` 분기:

| vatType | 의미 | 계산 |
|---|---|---|
| `포함` (INCLUDED) | 가격에 VAT 포함 | `vatAmount = payAmount * vatRate / (1+vatRate)` |
| `별도` (SEPARATED) | VAT 별도 | `vatAmount = amount * vatRate`, `payAmount = amount + vatAmount` |
| `면세` (EXEMPT) | 면세 | `vatRate = 0%`, `vatAmount = 0` |

`vatRate` 는 `'X.X%'` 문자열로 직렬화. 예: `'10.0%'`.

`NormalizeVatRate(input)` 로 입력을 표준화 (백분율 기호, 소수점 처리).

---

## 8. 음수 수량 머지 (LineMerger)
## 8. Gộp số lượng âm

WeTaxMgr.cpp 의 `MergeItemsByCode` 가 음수 환불 항목과 양수 판매 항목을 itemCode 단위로 합산해 **결과가 양수일 때만** WeTax 에 전송한다. 0 이하 결과는 발급 대상에서 제외.

신규 구현 (`_internal/wetax.merger.ts`):

```typescript
export function mergeLinesByItemCode(
  lines: MealConsolidatedEInvoiceLine[]
): MergedLine[] {
  const grouped = new Map<string, MergedLine>();

  for (const line of lines) {
    const key = line.itemCode || line.itemName;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.amount += line.amount;
      existing.vatAmount += line.vatAmount;
      existing.payAmount += line.payAmount;
      existing.dcAmount += line.dcAmount ?? 0;
    } else {
      grouped.set(key, { ...line });
    }
  }

  return Array.from(grouped.values()).filter((m) => m.quantity > 0);
}
```

> 양수와 음수의 합이 0 이하인 항목은 발급 대상에서 제외 (환불로 완전 상쇄).

---

## 9. KYC 3-source fallback
## 9. Tra cứu doanh nghiệp 3 nguồn

`_internal/kyc-lookup.ts`:

```typescript
async function lookupCompanyByTaxId(taxId: string): Promise<WeTaxCompany> {
  // 1차: WeTax
  try {
    const wetax = await wetaxClient.getCompany(taxId);
    if (wetax.status.success) return wetax.data;
  } catch (e) { /* fallback */ }

  // 2차: VietQR
  try {
    const vqr = await vietqrClient.getBusiness(taxId);
    if (vqr.code === '00') return mapVietqrToCompany(vqr.data);
  } catch (e) { /* fallback */ }

  // 3차: eSGoo
  try {
    const esgoo = await esgooClient.getCompany(taxId);
    if (esgoo.success) return mapEsgooToCompany(esgoo.data);
  } catch (e) { /* final */ }

  throw new DomainError({
    code: 'KYC_LOOKUP_FAILED',
    params: { taxId },
    details: { reason: 'All 3 KYC sources failed' },
  });
}
```

각 client 의 응답 매핑은 WeTaxMgr.cpp:471-505 (WeTax), 507-578 (VietQR), 580-642 (eSGoo) 의 parser 를 참조.

---

## 10. 응답 → 내부 모델 매핑
## 10. Mapping response

WeTaxMgr.cpp:280-327 의 `ProcessInvoiceResponse` 가 WeTax 응답을 `tCashReceipt` 에 매핑. 신규 구현은 `MealConsolidatedEInvoice` 모델을 갱신한다.

| WeTax 응답 필드 | 신규 Platform 필드 | 비고 |
|---|---|---|
| `data[0].lookup_code` | `MealConsolidatedEInvoice.lookupCode` | 검색 키 |
| `data[0].cqt_code` | `MealConsolidatedEInvoice.cqtCode` | CQT 인증 코드 |
| `data[0].ref_id` | `MealConsolidatedEInvoice.refId` | 멱등성 키 |
| `data[0].serial_no` | `MealConsolidatedEInvoice.serialNo` | 'C25TKT' |
| `data[0].invoice_no` | `MealConsolidatedEInvoice.invoiceNo` | 일련번호 |
| (조합) `serialNo + invoiceNo` | `gdtReceiptNo` | 조회 표시용 |
| 전체 응답 | `providerResponseJson` | raw JSON 박제 (감사) |
| 보낸 body | `providerRequestJson` | raw JSON 박제 (감사) |
| `status.success` | `MealConsolidatedEInvoice.status` | true → ACCEPTED, false → REJECTED |

---

## 11. 에러 처리
## 11. Xử lý lỗi

| WeTax 응답 / 상황 | DomainError code | HTTP status |
|---|---|---|
| Network timeout | `EINVOICE_NETWORK_TIMEOUT` | 504 |
| WeTax `status.success=false` | `EINVOICE_PROVIDER_REJECTED` (params.providerMessage) | 400 |
| HTTP 401/403 | `EINVOICE_AUTH_FAILED` | 401 |
| HTTP 5xx | `EINVOICE_PROVIDER_DOWN` | 503 |
| 응답 parse 실패 | `EINVOICE_PARSE_ERROR` | 502 |
| `data` 배열이 비어있음 | `EINVOICE_EMPTY_RESPONSE` | 502 |
| 입력 검증 실패 | `EINVOICE_VALIDATION_FAILED` | 400 |
| KYC 3 source 모두 실패 | `KYC_LOOKUP_FAILED` | 422 |
| Serializer 실패 | `EINVOICE_BUILD_FAILED` | 500 |
| Idempotency 충돌 (같은 refId 재발급) | `EINVOICE_DUPLICATE_REF_ID` | 409 |

모든 에러는 audit 자동 기록 (`actionType=EINVOICE_PUBLISH_FAILED`).

재시도 정책:
- `EINVOICE_NETWORK_TIMEOUT`, `EINVOICE_PROVIDER_DOWN`: exponential backoff (5s, 30s, 2m, 10m, 1h, 6h)
- `EINVOICE_AUTH_FAILED`: 토큰 재발급 후 1회 즉시 재시도
- `EINVOICE_PROVIDER_REJECTED`: 자동 재시도 금지 — manual 검수 큐
- `EINVOICE_VALIDATION_FAILED`: 자동 재시도 금지

---

## 12. provider 추상화 (interface)
## 12. Trừu tượng hóa provider

`_internal/einvoice-provider.interface.ts`:

```typescript
export interface EInvoicePublishContext {
  consolidatedInvoiceId: string;
  providerConfig: EInvoiceProviderConfig;
  // 빌더가 채울 데이터
  seller: WeTaxSeller;
  buyer: WeTaxBuyer;
  lines: MergedLine[];
  buyerNotGetInvoice: 0 | 1;
}

export interface EInvoicePublishResult {
  providerStatus: 'ACCEPTED' | 'REJECTED';
  refId: string;
  cqtCode?: string;
  serialNo?: string;
  invoiceNo?: string;
  lookupCode?: string;
  rawRequestJson: unknown;
  rawResponseJson: unknown;
  providerMessage?: string;
}

export interface EInvoiceProvider {
  /** Provider 식별자 */
  readonly type: 'WETAX' | 'BIZZI' | 'MISA' | 'DIRECT_GDT';

  /** 인증 + 토큰 캐시 관리 */
  authenticate(config: EInvoiceProviderConfig): Promise<void>;

  /** 인보이스 발급 */
  publish(ctx: EInvoicePublishContext): Promise<EInvoicePublishResult>;

  /** 인보이스 무효화 */
  void(invoiceId: string, reason: string, config: EInvoiceProviderConfig): Promise<void>;

  /** 사업자 KYC */
  lookupCompany(taxId: string, config: EInvoiceProviderConfig): Promise<WeTaxCompany>;
}
```

`WeTaxProvider implements EInvoiceProvider` — 1차 구현체. 향후 `BizziProvider`, `MisaProvider`, `GdtDirectProvider` 추가 시 동일 인터페이스만 따르면 된다.

---

## 13. 신규 Platform 디렉토리 매핑
## 13. Map thư mục dự án mới

| 신규 위치 | 책임 | WeTaxMgr 대응 / 신규 |
|---|---|---|
| `_internal/einvoice-provider.interface.ts` | provider 추상화 | 신규 |
| `_internal/wetax.types.ts` | WeTax TypeScript types | `t_wetax_seller / t_wetax_invoices / t_wetax_invoice_details / t_wetax_invoice_body / t_wetax_company` |
| `_internal/wetax.constants.ts` | 상수 | `namespace WeTaxConstants` |
| `_internal/wetax.client.ts` | HTTP client (login/postPublish/getCompany) | `Login / PostJson / GetJson` |
| `_internal/wetax.serializer.ts` | JSON build (snake_case 변환) | `BuildInvoiceBodyJson` |
| `_internal/wetax.merger.ts` | 음수 수량 머지 (단건 모드용) | `MergeItemsByCode` |
| `_internal/wetax.provider.ts` | `EInvoiceProvider` 구현체 (단건 + 통합 둘 다 발급 단계는 동일) | `IssuanceInvoice` orchestrator |
| `_internal/kyc-lookup.ts` | 3-source fallback | `GetCompanyByTaxId / Vietqr / Esgoo` |
| **`_internal/einvoice-consolidator.ts`** | **통합 모드 빌더 — MealTransaction → MealConsolidatedEInvoiceLine 그룹화** | **신규 (식권 플랫폼 핵심)** |
| **`_internal/consolidated-publish-context.builder.ts`** | **통합 모드 publish ctx 빌드 (seller=플랫폼, buyer=corporate)** | **신규** |
| `einvoice.service.ts` (기존 leaf) | publish/void/retry/runConsolidationCron orchestrator + audit + realtime | (분리됨) |
| `einvoice.resolver.ts` (기존 leaf) | GraphQL mutation 노출 (publish/void/retry/runConsolidationFor) | (분리됨) |
| `dto/publish-einvoice.input.ts` (기존 leaf) | DTO | (분리됨) |
| **`dto/run-consolidation.input.ts`** | **통합 모드 트리거 input (corporateId, period)** | **신규** |
| `models/meal-consolidated-einvoice.model.ts` (기존 leaf) | GraphQL ObjectType | (분리됨) |
| **`models/meal-consolidated-einvoice-line.model.ts`** | **라인 GraphQL ObjectType** | **신규** |

> **leaf 표준 준수**: `_internal/` 폴더는 leaf 외부에서 import 금지. 외부는 `EInvoiceService` / `EInvoiceResolver` 만 사용.

#### 통합 모드 cron 위치

월별 closing cron 은 `SuperAdmin/SyncWorkers` 가 호출한다 (BullMQ scheduled job):

| 위치 | 책임 |
|---|---|
| `SuperAdmin/SyncWorkers/src/jobs/einvoice-consolidation.job.ts` (Phase 2 신설) | 매월 1일 00:00 GMT+7 cron — 모든 active corporate 순회 → CentralApi 의 `runConsolidationForCorporate(corporateId, period)` mutation 호출 |

CentralApi 측 mutation:

```graphql
mutation runEInvoiceConsolidationForCorporate(
  $corporateId: ID!
  $periodStart: Date!
  $periodEnd: Date!
  $strategy: EInvoiceConsolidationStrategy
) {
  runEInvoiceConsolidationForCorporate(
    input: { corporateId: $corporateId, periodStart: $periodStart, periodEnd: $periodEnd, strategy: $strategy }
  ) {
    success { ... data { id refId status totalAmountVnd lineCount } }
    error { code message }
  }
}
```

---

## 14. Phase 1 구현 체크리스트
## 14. Checklist triển khai Phase 1

### Prisma 스키마 (CentralApi)

- [x] `MealConsolidatedEInvoice` 12 신규 필드 (cqtCode, formNo, serialNo, invoiceNo, refId, lookupCode, transType, currencyCode, exchangeRate, paymentMethod, providerType, buyerNotGetInvoice, providerRequestJson, providerResponseJson)
- [x] `MealConsolidatedEInvoiceLine` 신규 모델
- [x] `EInvoiceProvider` 신규 모델
- [x] `EInvoiceProviderConfig` 신규 모델
- [x] `EInvoiceSubmissionLog` 신규 모델
- [ ] **`MealConsolidatedEInvoice.consolidationStrategy` 필드 추가** (BY_MERCHANT/BY_DAY/BY_DEPARTMENT/BY_CATEGORY/SINGLE_LINE)
- [ ] **`MealConsolidatedEInvoice.sellerSnapshot` Json 필드 추가** (발급 시점의 플랫폼 사업자 정보 박제)
- [ ] **`MealConsolidatedEInvoice.buyerSnapshot` Json 필드 추가** (발급 시점의 corporate 정보 박제)
- [ ] **`MealCorporate.einvoiceConsolidationStrategy` 필드 추가** (기본 BY_MERCHANT)
- [ ] **`MealCorporate.addressFull` 필드 추가** (buyer_address 매핑)
- [ ] **`PlatformLegalEntity` 신규 모델** (플랫폼 사업자 법인 정보, country 별)
- [ ] 모든 새 relation 에 onDelete/onUpdate 명시 (P0-2 규칙)
- [ ] migration script 생성 + 검증

### CentralApi 코드

- [x] `_internal/einvoice-provider.interface.ts`
- [x] `_internal/wetax.types.ts`
- [x] `_internal/wetax.constants.ts`
- [x] `_internal/wetax.merger.ts` (단건 모드)
- [x] `_internal/wetax.serializer.ts`
- [ ] `_internal/wetax.client.ts` (axios 실제 구현)
- [ ] `_internal/wetax.provider.ts` (실제 호출)
- [ ] `_internal/kyc-lookup.ts` (vietqr/esgoo 실제 호출)
- [ ] **`_internal/einvoice-consolidator.ts`** (통합 모드 빌더 — MealTransaction → Line 그룹화)
- [ ] **`_internal/consolidated-publish-context.builder.ts`** (publish ctx 빌드)
- [ ] `einvoice.service.ts` 확장 (publish/void/retry/runConsolidation)
- [ ] `einvoice.resolver.ts` 확장 (5 mutation: publish/void/retry/runConsolidation/lookupBuyer)
- [ ] `dto/publish-einvoice.input.ts` 확장
- [ ] **`dto/run-consolidation.input.ts` 신규**
- [ ] `models/meal-consolidated-einvoice.model.ts` 확장 (12 필드 + lines + 전략)
- [ ] **`models/meal-consolidated-einvoice-line.model.ts` 신규**
- [ ] `einvoice.service.spec.ts` (provider mock + 8~12 test)
- [x] `_internal/wetax.merger.spec.ts` (8 케이스 통과)
- [x] `_internal/wetax.serializer.spec.ts` (7 케이스 통과)
- [ ] **`_internal/einvoice-consolidator.spec.ts` (5 그룹화 전략 × 엣지 케이스)**

### SyncWorkers (월별 cron)

- [ ] `SuperAdmin/SyncWorkers/src/jobs/einvoice-consolidation.job.ts` 신규
- [ ] BullMQ scheduled job: `0 0 1 * *` GMT+7 (매월 1일 00:00)
- [ ] CentralApi `runEInvoiceConsolidationForCorporate` mutation 호출 (loop)
- [ ] 실패 시 재시도 + alert

### 권한 + audit + realtime

- [ ] 신규 권한 키 `platform.einvoice.read / platform.einvoice.write` (CentralApi seed 추가)
- [ ] `RealtimeTopics.platform.einvoice.{submission.accepted,submission.rejected}` 신규 정의
- [ ] AuditService 의 actionType 에 `EINVOICE_PUBLISH / EINVOICE_VOID / EINVOICE_RETRY` 추가

### SharedContracts

- [ ] `SharedContracts/ApiSdk/src/operations/einvoice.ts` (publish, void, retry, lookupBuyer query)
- [ ] persisted query manifest 자동 생성 통과

### Portal 화면 (Phase 2 전반)

- [ ] `SA-EINV-001 ~ 006` 6 화면 구현
- [ ] 기존 `SA-CORP-INV-001` 갱신 (provider 응답 표시)

### 검증

- [ ] `tsc --noEmit` 통과
- [ ] `jest` 신규 test 포함 통과
- [ ] `prisma validate` 통과
- [ ] `lint:discriminators` 통과
- [ ] `SharedContracts validate-operations-vs-schema.mjs` 통과

---

## 15. 비기능 요구사항 (NFR)
## 15. NFR

| 항목 | 목표 |
|---|---|
| 발급 응답 시간 | p95 ≤ 5초 (WeTax 응답 + DB 업데이트 + audit) |
| 동시 발급 처리량 | 초당 10건 (Phase 1), 100건 (Phase 4) |
| 멱등성 | refId 기준 dedupe — 같은 refId 재요청 시 캐시된 결과 반환 |
| 토큰 캐시 | Redis TTL 50분 (login expiresIn 의 90%) |
| 로그 보관 | EInvoiceSubmissionLog 24개월 (감사 요건) |
| KYC 캐시 | 사업자번호 결과 Redis TTL 24h |
| WeTax 다운 시 | 자동 큐잉 + provider 다른 환경 (있으면) failover |

---

## 16. 보안
## 16. Bảo mật

- WeTax credentials 는 **vault** (예: HashiCorp Vault, AWS Secrets Manager) 에 저장. `EInvoiceProviderConfig.credentialsVaultRef` 는 vault 경로만 보유.
- DB 에 username/password 평문 저장 금지.
- 모든 outbound HTTPS 호출은 TLS 1.2 이상.
- Bearer token 은 메모리/Redis 에만 저장. DB 영속화 금지.
- audit log 의 `providerRequestJson` 은 buyer.email / buyer.cccd 등 PII 를 마스킹 (last 4 자리 외 *).
- WeTax 응답의 lookup_code 는 PII 가 아니므로 그대로 저장.

---

## 17. 향후 확장 (Phase 4+)
## 17. Mở rộng

- **Bizzi provider** — 동일 인터페이스, 별도 client/serializer/merger
- **Misa meInvoice provider** — 동일
- **GDT Direct provider** — 자체 HSM, X.509 인증서, XML signing
- **Auto-failover** — provider 다운 시 자동으로 다음 provider 로 전환
- **A/B routing** — corporate 별로 다른 provider 사용 가능
- **Reconciliation job** — 매일 새벽 GDT 와 일치 여부 cross-check

---

**문서 끝.**

본 사양은 `HJ-POS-TEST/WeTax/WeTaxMgr` 의 실제 프로덕션 동작을 기준으로 작성되었으며, 신규 NestJS 구현이 동일한 외부 동작(WeTax 호출 + GDT 결과)을 100% 달성하도록 설계되었다. 코드는 신규 작성하되 본 문서의 모든 항목이 1:1 매핑되어야 한다.
