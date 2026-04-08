# HJ VietPay 결제 화면

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-PAY-HJVIETPAY-DLG |
| 화면 경로 | `screens/PaymentScreen` (QRPaymentModal 오픈) |
| 레거시 다이얼로그 | `IDD_HJVIETPAY_DLG` (리소스 454) |
| 상위 설계서 | `04-Edge-POS-아키텍처-설계서.md` / `05-Edge-POS-전체-흐름-AZ-가이드.md` |
| 작성일 | 2026-04-05 |
| 상태 | Draft |

## 1. 화면개요

HJ VietPay QR 결제 모달이다. QR 코드를 생성하여 고객이 HJ VietPay 앱으로 스캔/결제하고, POS 직원이 수동으로 결제 완료를 확정하는 동기 대기(synchronous-wait) 방식 결제 화면이다.

- **결제 방식**: 동기 대기 -- 외부 승인 결과를 받은 후에만 DB에 저장한다
- **Outbox 대상 여부**: 아니다. QR 결제 승인 요청은 Outbox 재전송 대상이 아니다
- **온라인 필수**: 오프라인 시 UseCases 진입을 차단한다
- **공통 컴포넌트**: `shared/ui/organisms/QRPaymentModal` (gateway adapter: `hjvietpay`)
- **레거시 특이사항**: 다른 QR 화면과 달리 자동 폴링(IDC_PAYMENT_UPDATE)과 수동 결제 확인(IDC_PAYMENT_CHECK) 버튼이 없다. 대신 IDC_PAYMENT_OK(결제 확인) 버튼으로 수동 확정하는 방식이다

## 2. 상위기준연결

| 기준 | 연결 |
|------|------|
| 계층 흐름 | `UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure` 단방향 |
| 데이터 흐름 | QR 생성 요청 -> C++ ExternalBridge/HJVietPay -> 수동 확정 -> DB 저장 -> PosRealTimeSender -> UI 갱신 |
| 동기/비동기 분류 | 외부 API (QR 승인) = **동기 대기**, 영수증 인쇄 = **비동기 후처리** |
| Offline-First 정책 | QR 결제는 온라인 필수이므로 예외 -- 오프라인 감지 시 UseCase 진입 차단 |
| 멱등성 | `requestId` + `idempotencyKey` 기반, `PAYMENT:QR:GENERATE` / `PAYMENT:QR:CONFIRM` |
| UI 컴포넌트 원본 | `shared/ui/organisms/QRPaymentModal` |
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,en,vi}` -- msgKey 기반, 완성 문장 하드코딩 금지 |

## 3. 기능목록

| ID | 기능명 | Bridge Command | UseCase | Domain/Manager | Infrastructure | 우선순위 |
|---|---|---|---|---|---|---|
| HV-F01 | QR 코드 생성/표시 | `PAYMENT:QR:GENERATE` | `ExecuteQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/HJVietPay` | P0 |
| HV-F02 | 결제 확인 (수동 확정) | `PAYMENT:QR:CONFIRM` | `ExecuteQRPaymentUseCase` | `SaleMgr` | `SQLite/Tables/Payment/WaitPaymentCrud`, `SellSlipCrud` | P0 |
| HV-F03 | 닫기 (결제 취소) | `PAYMENT:QR:CANCEL` | `CancelQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/HJVietPay` | P0 |
| HV-F04 | 대기 후 닫기 | `PAYMENT:QR:CANCEL` | `CancelQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/HJVietPay` | P1 |
| HV-F05 | QR 코드 인쇄 | `DEVICE:PRINT` | TODO: 인쇄 UseCase 확정 필요 | `SaleMgr` | `Infrastructure/Device/Printer` | P1 |
| HV-F06 | 모달 닫기/취소 | -- (UI 내부 상태) | -- | -- | -- | P0 |
| HV-F07 | 언어 전환 (KR/EN/VN) | -- (i18n 전환) | -- | -- | `BrandPosApp/PosUi/src/i18n/locales/*` | P2 |

**레거시 대비 차이점**: HJVietPay는 자동 폴링(`CHECK_STATUS`)이 없다. 결제 완료를 POS 직원이 IDC_PAYMENT_OK 버튼으로 수동 확정한다. 신규 QRPaymentModal에서는 gateway adapter 설정으로 폴링 비활성화 + 수동 확정 버튼 표시를 제어한다.

## 4. UI 구조

### 4.1 컴포넌트 트리

```
screens/PaymentScreen
  └─ shared/ui/organisms/QRPaymentModal (gateway="hjvietpay", pollingEnabled=false)
       ├─ 헤더 영역: 타이틀 (i18n msgKey), 언어 전환 버튼, 닫기 버튼
       ├─ QR 이미지 영역: QR 코드 렌더링 + 결제 금액 표시
       ├─ 상태 표시 영역: 결제 진행 상태 텍스트
       └─ 하단 액션 바: [닫기] [대기 후 닫기] [결제 확인]
```

### 4.2 데이터 바인딩

| ID | 표시 항목 | 신규 컴포넌트 위치 | 데이터 소스 |
|---|---|---|---|
| HV-D01 | QR 결제 안내 타이틀 | QRPaymentModal 헤더 | i18n msgKey (`payment.qr.title`, params: `{gateway: "hjvietpay"}`) |
| HV-D02 | QR 코드 이미지 | QRPaymentModal QR 영역 | `paymentApi.generateQR` mutation 응답 |
| HV-D03 | 결제 상태 텍스트 | QRPaymentModal 상태 영역 | UI 내부 상태 (수동 확정 방식이므로 폴링 없음) |
| HV-D04 | 결제 금액 | QRPaymentModal 금액 영역 | `paymentApi.generateQR` 응답 내 금액 |

## 5. 구현명세

### 5.1 Bridge Command 명세

| Command | 방향 | Payload | 응답 |
|---|---|---|---|
| `PAYMENT:QR:GENERATE` | UI -> C++ | `{ gateway: "hjvietpay", amount, tableCode, idempotencyKey }` | `{ qrImageUrl, transactionId, expiresAt }` |
| `PAYMENT:QR:CONFIRM` | UI -> C++ | `{ gateway: "hjvietpay", transactionId, idempotencyKey }` | `{ confirmed: boolean, sellSlipId }` |
| `PAYMENT:QR:CANCEL` | UI -> C++ | `{ gateway: "hjvietpay", transactionId }` | `{ cancelled: boolean }` |

#### Bridge Command 표준 shape

```
PAYMENT:QR:GENERATE
  Request:  { tableId, amount, gateway }
  Response: { qrCode, transactionId, expiresAt }
  Error:    GATEWAY_UNAVAILABLE, OFFLINE_BLOCKED

PAYMENT:QR:CHECK_STATUS
  TODO: HJVietPay는 수동 확정 방식(IDC_PAYMENT_OK)이므로 자동 폴링 없음. CHECK_STATUS 미사용.

PAYMENT:QR:CANCEL
  Request:  { transactionId }
  Response: { status: "CANCELLED" }
  Error:    ALREADY_COMPLETED, CANCEL_FAILED

PAYMENT:QR:REFRESH
  TODO: HJVietPay는 수동 확정 방식이므로 QR 갱신(REFRESH) 흐름 미확정. 자동 폴링이 없어 만료 감지가 UI 타이머에 의존하며, REFRESH 지원 여부는 HJVietPay API 스펙 확인 후 결정 필요.
```

### 5.2 RTK Query 엔드포인트

| 엔드포인트 | 타입 | 태그 | 비고 |
|---|---|---|---|
| `paymentApi.generateQR` | mutation | -- | gateway param으로 HJVietPay 분기 |
| `paymentApi.confirmQR` | mutation | -- | HJVietPay 전용 수동 확정 |
| `paymentApi.cancelQR` | mutation | -- | |

**주의**: HJVietPay는 `checkQRStatus` (폴링)를 사용하지 않는다. 대신 `confirmQR` mutation으로 수동 확정한다.

### 5.3 UseCase 흐름

1. `ExecuteQRPaymentUseCase` (생성): 오프라인 체크 -> Ledger `RECEIVED` 기록 -> ExternalBridge/HJVietPay QR 생성 API 호출 -> Ledger `PROCESSING` -> 응답 반환
2. `ExecuteQRPaymentUseCase` (확정): 직원 수동 확정 -> ExternalBridge/HJVietPay 승인 확인 API 호출 -> 성공 시 DB 저장 (WaitPayment, SellSlip, SellDetail) -> Ledger `SUCCEEDED` -> PosRealTimeSender로 UI 갱신 이벤트 방송
3. `CancelQRPaymentUseCase`: HJVietPay 취소 API 호출 -> Ledger `COMPENSATED` 기록

### 5.4 PosRealTime 이벤트

| 이벤트 | 발행 시점 | Payload |
|---|---|---|
| `PAYMENT:QR:COMPLETED` | 결제 확정 후 DB 커밋 완료 시 | `{ transactionId, sellSlipId, amount, gateway: "hjvietpay" }` |

### 5.5 오프라인/에러 처리

- 오프라인 감지 시: QR 생성 mutation 진입 차단, 사용자에게 네트워크 필요 안내 (msgKey 기반)
- QR 만료: `expiresAt` 체크하여 만료 시 재생성 안내
- 수동 확정 실패: Ledger `FAILED` 기록, 사용자에게 재시도 안내
- TODO: 수동 확정 시 ExternalBridge 측 실제 승인 상태 검증 로직 확정 필요

#### UseCase 실패 규칙

- **오프라인 진입 차단**: 모든 QR 결제 UseCase는 네트워크 연결 상태를 진입 시점에 검사하며, 오프라인이면 즉시 차단한다
- **폴링 타임아웃**: 해당 없음 -- HJVietPay는 수동 확정(IDC_PAYMENT_OK) 방식이므로 자동 폴링이 없다
- **멱등성**: `transactionId` 기준으로 중복 요청을 판별한다
- **Outbox 재전송 대상 아님**: QR 결제 승인/취소 요청은 Outbox에 적재하지 않는다. 오프라인 복구 후 과거 요청 자동 재실행 금지
- **수동 확정 특이사항**: 직원이 IDC_PAYMENT_OK로 수동 완료 처리한다. TODO: ExternalBridge 측에서 실제 승인 상태를 사후 검증하는 로직이 없으면, 미승인 건이 확정될 위험이 있다. 사후 검증 API 또는 대사(reconciliation) 방안 확정 필요

### 5.6 Device Error 규칙

디바이스 에러(QR 인쇄 실패 등)는 코드 기반 필드로 전달한다. 완성 문장 `msg`를 싣지 않는다.

```
{ type, device: "PRINTER", code, msgKey, msgParams, severity, recoverable, retryable, action }
```

### 5.7 Permission

- **필요 권한**: 결제 실행 권한 (로그인 직원 전원)
- 별도 관리자 권한 불필요. POS에 로그인한 직원이면 QR 결제 생성/수동 확정/취소 모두 가능하다

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| HV-T01 | QR 생성 성공 | QR 이미지 렌더링, 금액 표시, 폴링 미시작 확인 |
| HV-T02 | 결제 수동 확정 성공 | DB 저장 확인 (WaitPayment, SellSlip), Ledger SUCCEEDED, UI 완료 표시 |
| HV-T03 | QR 취소 | HJVietPay 취소 API 호출, Ledger COMPENSATED, 모달 닫기 |
| HV-T04 | 오프라인 진입 차단 | 네트워크 미연결 시 QR 생성 mutation 차단, 안내 메시지 |
| HV-T05 | QR 만료 | expiresAt 경과 후 재생성 안내 |
| HV-T06 | 수동 확정 실패 | Ledger FAILED, 사용자 재시도 안내 |
| HV-T07 | 폴링 비활성화 검증 | pollingEnabled=false일 때 CHECK_STATUS 호출 없음 확인 |
| HV-T08 | 언어 전환 | KR/EN/VN 전환 시 모달 내 모든 텍스트 i18n 반영 |
| HV-T09 | mockTransport 동작 | `next dev` + mockTransport 조합으로 C++ 없이 QR 모달 동작 확인 |

## 7. 완료기준

- [ ] `shared/ui/organisms/QRPaymentModal` 공통 컴포넌트에서 `gateway="hjvietpay"` + `pollingEnabled=false` 분기 동작
- [ ] `paymentApi.generateQR` / `confirmQR` / `cancelQR` RTK Query 엔드포인트 구현
- [ ] `ExecuteQRPaymentUseCase` (생성 + 수동 확정), `CancelQRPaymentUseCase` C++ 구현
- [ ] `ExternalBridge/PaymentGateways/HJVietPay` 어댑터 구현
- [ ] Ledger 상태 전이 (`RECEIVED` -> `PROCESSING` -> `SUCCEEDED` / `FAILED` / `COMPENSATED`) 검증
- [ ] 오프라인 진입 차단 검증
- [ ] mockTransport 기반 디자인 시스템 프리뷰 동작
- [ ] i18n msgKey 기반 다국어 (ko/en/vi) 검증

## 8. 작업명단

| 순서 | 작업 | 담당 계층 | 상태 |
|------|------|----------|------|
| 1 | QRPaymentModal 공통 컴포넌트 (pollingEnabled 옵션 지원) | BrandPosApp/PosUi/shared/ui/organisms | TODO |
| 2 | paymentApi RTK Query 엔드포인트 (confirmQR 추가) | BrandPosApp/PosUi/store/api | TODO |
| 3 | PosRequestActions/Payment QR thin router | BrandPosApp/Presentation/CEF/InternalBridge | TODO |
| 4 | ExecuteQRPaymentUseCase (수동 확정 분기) / CancelQRPaymentUseCase | BrandPosApp/UseCases/Payment | TODO |
| 5 | ExternalBridge/PaymentGateways/HJVietPay 어댑터 | BrandPosApp/Infrastructure/ExternalBridge | TODO |
| 6 | WaitPaymentCrud / SellSlipCrud / SellDetailCrud SQLite 영속화 | BrandPosApp/Infrastructure/Persistence/SQLite | TODO |
| 7 | mockTransport QR 결제 fixture (HJVietPay) | BrandPosApp/PosUi/mocks | TODO |
| 8 | i18n 키 등록 (payment.qr.*) | BrandPosApp/PosUi/src/i18n/locales | TODO |
| 9 | Screen Shell | BrandPosApp/PosUi/src/screens/PaymentScreen/components/HJVietPayDialog.tsx | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_HJVIETPAY_DLG |
| 리소스 값 | 454 |
| 크기 (DLU) | 414 x 327 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 10 |

### 레거시 UI 요소 매핑

| 레거시 ID | 용도 | 신규 대응 |
|---|---|---|
| IDOK (숨김) | 프로그래밍적 결제 완료 트리거 | 수동 확정 CONFIRM 흐름으로 통합 |
| IDCANCEL | 닫기/취소 | QRPaymentModal 닫기 버튼 |
| IDC_BTN_KR / IDC_BTN_EN / IDC_BTN_VN | 언어 전환 | i18n 시스템 통합 (BrandPosApp/PosUi/src/i18n/locales/) |
| IDC_PRINT (숨김) | QR 코드 인쇄 (현재 미사용) | QRPaymentModal 공통 인쇄 기능으로 통합 시 활성화 여부 결정 |
| IDC_PAYMENT_OK | 결제 확인 (수동 확정) | QRPaymentModal 결제 확인 버튼 |
| IDC_CLOSE | 닫기 | QRPaymentModal 닫기 + 취소 플로우로 통합 |
| IDC_CLOSE_WAIT | 대기 후 닫기 | QRPaymentModal 대기 후 닫기 액션 |
| IDC_TITLE | 안내 타이틀 | QRPaymentModal 헤더 (i18n msgKey) |

### 레거시 특이사항

- HJVietPay는 다른 QR 화면(ZaloPay, Infoplus, NAPAS)과 달리 `IDC_PAYMENT_CHECK`(수표 조회)와 `IDC_PAYMENT_UPDATE`(자동 폴링) 버튼이 없다
- `IDC_PRINT`는 숨김 + 비활성 상태(NOT WS_VISIBLE + WS_DISABLED)이므로 레거시에서도 미사용 기능이다
- `IDC_CLOSE`는 `IDCANCEL`과 별도의 닫기 버튼이다. 신규에서는 모달 닫기 + 취소 플로우로 통합한다
