# ACCOUNT_BSELECT (결제수단 버튼 선택/설정)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ACCOUNT_BSELECT` |
| 화면 ID | `IDD_ACCOUNT_BSELECT` |
| 원본 파일 | `account-bselect.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

---

## 1. 화면 개요

ACCOUNT_DIALOG의 결제수단 그리드(ABTN 1~15) 배치를 관리하는 **결제수단 버튼 선택/설정 화면**. 65개 버튼 전부가 결제 관련 기능이며, 결제수단 버튼(BTN 1~15)은 동적 매핑 방식이다. KR/VN 별도 다이얼로그가 존재하나, 신규 아키텍처에서는 **국가별 결제수단 설정 기반 단일 PaymentMethodGrid**로 통합한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 결제 수단 관리 |
| CLAUDE.md | 카드/QR 결제 동기 대기, Outbox 재전송 불가 | QR 결제(PAYCO, 카카오, 제로페이) 해당 |
| account-dialog.md | 상위 결제 화면 | PaymentScreen 내부 서브 구성요소 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| ABS-F01 | 현금 결제 | P0 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud, Printer |
| ABS-F02 | 카드 결제 | P0 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud, CardReader, PaymentGateways/BCCard |
| ABS-F03 | 카드/소비 결제 | P1 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud, CardReader |
| ABS-F04 | 현금영수증 발행 | P1 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud, Printer |
| ABS-F05 | 쿠폰 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| ABS-F06 | 포인트 결제 | P0 | PAYMENT:APPLY_POINT | ApplyPointUseCase | SaleMgr, CustMgr | SellDetailCrud, CustomerCrud |
| ABS-F07 | 무현금 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F08 | 예치금 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr, CustMgr | SellSlipCrud, CustomerCrud |
| ABS-F09 | 할인 적용 | P0 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| ABS-F10 | 금액할인 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| ABS-F11 | %할인 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| ABS-F12 | 서비스 적용 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| ABS-F13 | 상품할인 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| ABS-F14 | 결제 완료 | P0 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, RequestLedgerStore, OutboxStore |
| ABS-F15 | 결제 초기화 | P1 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F16 | 결제 취소 | P0 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud, CardReader |
| ABS-F17 | 닫기 | P0 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F18 | 회원 등록 | P1 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| ABS-F19 | 회원 취소 | P1 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| ABS-F20 | 회원 검색 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| ABS-F21 | 시재함 열기 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | AccountingMgr | Device/Printer (캐시드로어) |
| ABS-F22 | 임시서명 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F23 | 테이블 담당자 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | StaffMgr | Tables/Staff/StaffCrud |
| ABS-F24 | 작업금액 표시 | P2 | - (표시 전용) | - | SaleMgr | SellSlipCrud |
| ABS-F25 | 출력/발급 | P1 | SALES:REPRINT | ExecutePaymentUseCase (후처리) | SaleMgr | Printer |
| ABS-F26 | PAYCO 결제 | P1 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F27 | 카카오페이 결제 | P1 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F28 | 제로페이 결제 | P1 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F29 | 알리페이 결제 | P2 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F30 | 캐시백 적립 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr, CustMgr | SellSlipCrud |
| ABS-F31 | 캐시백 사용 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr, CustMgr | SellSlipCrud |
| ABS-F32 | 캐시백 조회 | P2 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| ABS-F33 | 전표조회 | P2 | SALES:VIEW | - | SaleMgr | SellSlipCrud |
| ABS-F34 | 부가세전환 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F35 | 전자상품권 결제 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F36 | 복지상품권 결제 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F37 | 스탬프 적립 | P2 | PAYMENT:SAVE_POINT | SavePointUseCase | CustMgr | CustomerCrud |
| ABS-F38 | 기부처리 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F39 | 면세환급 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F40 | 면세한도조회 | P2 | SALES:SEARCH | - | SaleMgr | SellSlipCrud |
| ABS-F41 | 더치페이(상품별) | P1 | PAYMENT:SPLIT | SplitPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| ABS-F42 | 더치페이(금액별) | P1 | PAYMENT:SPLIT | SplitPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| ABS-F43 | 카드 내일배움카드 | P2 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud, CardReader |
| ABS-F44 | 통합간편결제 | P2 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| ABS-F45 | 회원연동 | P2 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| ABS-F46 | 컵보증금반환 | P2 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud |
| ABS-F47 | 설정 저장 | P1 | PAYMENT:EXECUTE | - | SystemMgr | - |
| ABS-F48 | 설정 초기화 | P2 | PAYMENT:EXECUTE | - | SystemMgr | - |
| ABS-F49 | 설정 삭제 | P2 | PAYMENT:EXECUTE | - | SystemMgr | - |
| ABS-F50 | 결제수단 버튼 (BTN 1~15) | P0 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |

---

## 4. UI 구조

### 4.1 화면 구성

이 화면은 독립 다이얼로그가 아닌 PaymentScreen 내부 구성요소로 통합된다.

```
screens/PaymentScreen/components/
  PaymentMethodGrid.tsx        -- BTN 1~15 동적 결제수단 그리드 (서버 설정 기반 배치)
  PaymentMethodPanel.tsx       -- 결제수단 버튼 (현금/카드/포인트/QR 등)
  DiscountPanel.tsx            -- 할인/서비스/상품할인
  CustomerPanel.tsx            -- 회원 등록/검색/취소/연동
  PaymentActionBar.tsx         -- 결제 완료/취소/초기화/출력/시재함
  PaymentSettingPanel.tsx      -- 결제수단 버튼 배치 설정 (저장/초기화/삭제)
  SplitPayPanel.tsx            -- 더치페이 (상품별/금액별)
  PaymentSummary.tsx           -- 작업금액 표시, 부가세전환
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| NumericKeypad | shared/ui/organisms/NumericKeypad | 숫자패드 (account-dialog과 공유) |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 결제수단 설정 | RTK Query 캐시 (systemApi: getPaymentMethods) | 서버 상태 |
| 결제수단 버튼 배치 | RTK Query 캐시 (systemApi: getPaymentButtonLayout) | 서버 상태 |
| 현재 선택 결제수단 | uiSlice (Redux) | UI 로컬 상태 |

### 5.2 Bridge 계약

**PAYMENT:QR:{gateway}** (동기 대기 -- synchronous-wait)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:QR:{sellSlipId}:{provider}:{amount}:{timestamp}",
  "command": "PAYMENT:QR:{gateway}",
  "params": {
    "tableId": "string",
    "amount": "number",
    "gateway": "ZALOPAY | NAPAS | INFOPLUS | PAYCO | KAKAO | ZEROPAY | ALIPAY"
  }
}
```
- **Response**: `{ sellSlip: { id, qrCode, transactionId, status } }`
- **Error**: `GATEWAY_UNAVAILABLE`, `QR_GENERATION_FAILED`, `PAYMENT_TIMEOUT`, `OFFLINE_BLOCKED`
> QR 결제는 **외부 PG 동기 대기** 패턴. 오프라인 진입 차단. **Outbox 재전송 대상이 아니다.**

**PAYMENT:SPLIT**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:SPLIT:{sellSlipId}:{splitType}:{timestamp}",
  "command": "PAYMENT:SPLIT",
  "params": {
    "sellSlipId": "string",
    "splitType": "BY_ITEM | BY_AMOUNT",
    "splits": "TODO: 분할 상세 구조 정의"
  }
}
```

기타 Bridge 계약은 `account-dialog.md` 섹션 5.2 참조.

### 5.3 UseCase 계약

| UseCase | 책임 | 비고 |
|---|---|---|
| ExecuteQRPaymentUseCase | QR 결제 실행, 외부 PG 동기 대기 후 DB 저장 | 동기 대기, Outbox 재전송 불가 |
| SplitPaymentUseCase | 더치페이 분할 결제 | 상품별/금액별 분할 |
| SavePointUseCase | 포인트/스탬프 적립 | CustMgr 경유 |

기타 UseCase는 `account-dialog.md` 섹션 5.3 참조.

### 5.4 Domain/Manager

`account-dialog.md` 섹션 5.4와 동일. 추가:
- SystemMgr: 결제수단 버튼 배치 설정 관리

### 5.5 DB / CentralApi / Sync / Realtime

`account-dialog.md` 섹션 5.5와 동일.

**추가 Sync 규칙:**
- QR 결제(PAYCO, 카카오, 제로페이, 알리페이) 승인 요청은 **Outbox 재전송 대상이 아니다**
- 카드 승인 요청도 **Outbox 재전송 대상이 아니다**

### 5.6 i18n / Error / Permission

**Permission**
- 결제 실행 (현금/카드/QR): 로그인 직원 전원
- 결제 취소: 관리자 또는 반품 권한 직원
- 할인 적용: 관리자 또는 할인 권한 직원
- 결제수단 설정 변경 (저장/초기화/삭제): 관리자 전용
- 숨김 처리된 버튼(캐시백, 전표조회, 알리페이, 컵보증금 등)은 국가/설정 기반 조건부 표시
- 결제수단 설정을 시스템 설정 API로 관리, 버튼 배치는 서버 설정 기반 동적 렌더링

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-ABS-01 | QR 결제 (PAYCO) 동기 대기 | PG 호출 -> 응답 대기 -> 승인 후 DB 저장 |
| T-ABS-02 | QR 결제 실패 | PG 거부 시 에러 코드 반환, Outbox 미적재 |
| T-ABS-03 | 더치페이 상품별 | 주문 항목별 분할 결제 정상 |
| T-ABS-04 | 더치페이 금액별 | 금액별 분할 결제 정상 |
| T-ABS-05 | 결제수단 동적 배치 | 서버 설정 변경 시 BTN 1~15 라벨/기능 갱신 |
| T-ABS-06 | 국가별 조건부 표시 | KR/VN 설정에 따른 버튼 표시/숨김 |

---

## 7. 완료 기준

- [ ] 결제수단 그리드(BTN 1~15) 동적 배치 구현
- [ ] QR 결제 동기 대기 패턴 구현 (Outbox 재전송 불가)
- [ ] 더치페이 상품별/금액별 분할 처리
- [ ] 국가/설정 기반 조건부 버튼 표시
- [ ] 결제수단 설정 관리 (저장/초기화/삭제)

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodGrid.tsx | 동적 결제수단 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentMethodPanel.tsx | 결제수단 버튼 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/PaymentSettingPanel.tsx | 결제수단 설정 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/SplitPayPanel.tsx | 더치페이 패널 |
| Store | BrandPosApp/PosUi/src/store/api/systemApi.ts | 시스템 설정 RTK Query |
| C++ UseCase | BrandPosApp/UseCases/Payment/ExecuteQRPaymentUseCase.cpp | QR 결제 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/SplitPaymentUseCase.cpp | 더치페이 유스케이스 |
| C++ UseCase | BrandPosApp/UseCases/Payment/SavePointUseCase.cpp | 포인트/스탬프 적립 |

기타 파일은 `account-dialog.md` 섹션 8 참조.

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ACCOUNT_BSELECT |
| 리소스 값 | 116 |
| 크기 (DLU) | 430 x 350 |
| 총 UI 요소 수 | 65 (버튼 65개) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 버튼 목록

| 레거시 ID | 용도 | 신규 위치 |
|---|---|---|
| IDC_A_CASH | 현금 결제 | PaymentMethodPanel |
| IDC_A_CARD | 카드 결제 | PaymentMethodPanel |
| IDC_A_CARD2 | 카드/소비 결제 | PaymentMethodPanel |
| IDC_A_CASHBILL | 현금영수증 | PaymentMethodPanel |
| IDC_A_COUPON | 쿠폰 결제 | PaymentMethodPanel |
| IDC_A_POINT | 포인트 결제 | PaymentMethodPanel |
| IDC_A_NOCASH | 무현금 결제 | PaymentMethodPanel |
| IDC_A_KEEP | 예치금 결제 | PaymentMethodPanel |
| IDC_A_PAYCO | PAYCO | PaymentMethodPanel |
| IDC_A_KAKAO | 카카오페이 | PaymentMethodPanel |
| IDC_A_ZEROPAY | 제로페이 | PaymentMethodPanel |
| IDC_A_ALIPAY | 알리페이 (숨김) | PaymentMethodPanel |
| IDC_A_DISCOUNT | 할인 | DiscountPanel |
| IDC_A_DISCOUNT2 | 금액할인 | DiscountPanel |
| IDC_A_DISCOUNT3 | %할인 | DiscountPanel |
| IDC_A_SERVICE | 서비스 | DiscountPanel |
| IDC_A_MEMUDC | 상품할인 | DiscountPanel |
| IDC_A_ACCOUNTCOM | 결제완료 | PaymentActionBar |
| IDC_A_ACCLEAR | 결제 초기화 | PaymentActionBar |
| IDC_A_ACCANCEL | 결제 취소 | PaymentActionBar |
| IDC_A_DUTCHPAY | 더치페이(상품별) | SplitPayPanel |
| IDC_A_DUTCHPAY2 | 더치페이(금액별) | SplitPayPanel |
| IDC_A_BTN1~15 | 결제수단 버튼 | PaymentMethodGrid |
| IDC_SAVE | 설정 저장 | PaymentSettingPanel |
| IDC_REDRAW | 설정 초기화 | PaymentSettingPanel |
| IDC_DEL | 설정 삭제 | PaymentSettingPanel |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PaymentQuickSelect.tsx shell 구현 완료. BTN 1~15 동적 그리드, 결제수단/할인/액션 버튼, 설정 관리 영역 포함 |
