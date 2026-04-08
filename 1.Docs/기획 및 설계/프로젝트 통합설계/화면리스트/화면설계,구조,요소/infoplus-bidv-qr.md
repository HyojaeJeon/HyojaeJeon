# Infoplus BIDV QR 결제 화면

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-PAY-INFOPLUS-BIDV-QR |
| 화면 경로 | `screens/PaymentScreen` (QRPaymentModal 오픈) |
| 레거시 다이얼로그 | `IDD_INFOPLUS_BIDV_QR` (리소스 446) |
| 상위 설계서 | `04-Edge-POS-아키텍처-설계서.md` / `05-Edge-POS-전체-흐름-AZ-가이드.md` |
| 작성일 | 2026-04-05 |
| 상태 | Draft |

## 1. 화면개요

Infoplus 게이트웨이를 통한 BIDV 은행 QR 결제 모달이다. QR 코드를 생성하여 고객이 BIDV 뱅킹 앱으로 스캔/결제하고, POS가 Infoplus API를 통해 승인 결과를 확인하는 동기 대기(synchronous-wait) 방식 결제 화면이다.

- **결제 방식**: 동기 대기 -- 외부 승인 결과를 받은 후에만 DB에 저장한다
- **Outbox 대상 여부**: 아니다. QR 결제 승인 요청은 Outbox 재전송 대상이 아니다
- **온라인 필수**: 오프라인 시 UseCases 진입을 차단한다
- **공통 컴포넌트**: `shared/ui/organisms/QRPaymentModal` (gateway adapter: `infoplus`, bankCode: `BIDV`)
- **Infoplus 통합**: Shinhan/BIDV/Woori 은행은 동일 Infoplus 프로토콜을 공유하며, `bankCode` 파라미터로 분기한다

## 2. 상위기준연결

| 기준 | 연결 |
|------|------|
| 계층 흐름 | `UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure` 단방향 |
| 데이터 흐름 | QR 생성 요청 -> C++ ExternalBridge/Infoplus (bankCode=BIDV) -> 승인 대기 -> DB 저장 -> PosRealTimeSender -> UI 갱신 |
| 동기/비동기 분류 | 외부 API (QR 승인) = **동기 대기**, 영수증 인쇄 = **비동기 후처리** |
| Offline-First 정책 | QR 결제는 온라인 필수이므로 예외 -- 오프라인 감지 시 UseCase 진입 차단 |
| 멱등성 | `requestId` + `idempotencyKey` 기반, `PAYMENT:QR:GENERATE` / `PAYMENT:QR:CONFIRM` |
| UI 컴포넌트 원본 | `shared/ui/organisms/QRPaymentModal` |
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,en,vi}` -- msgKey 기반, 완성 문장 하드코딩 금지 |

## 3. 기능목록

| ID | 기능명 | Bridge Command | UseCase | Domain/Manager | Infrastructure | 우선순위 |
|---|---|---|---|---|---|---|
| IB-F01 | QR 코드 생성/표시 | `PAYMENT:QR:GENERATE` | `ExecuteQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/Infoplus` (bankCode=BIDV) | P0 |
| IB-F02 | 결제 상태 수동 확인 | `PAYMENT:QR:CHECK_STATUS` | `CheckQRPaymentStatusUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/Infoplus` (bankCode=BIDV) | P0 |
| IB-F03 | QR 코드 취소 | `PAYMENT:QR:CANCEL` | `CancelQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/Infoplus` (bankCode=BIDV) | P0 |
| IB-F04 | 결제 완료 확정 (자동) | `PAYMENT:QR:CONFIRM` | `ExecuteQRPaymentUseCase` | `SaleMgr` | `SQLite/Tables/Payment/WaitPaymentCrud`, `SellSlipCrud` | P0 |
| IB-F05 | 결제 상태 자동 폴링 | `PAYMENT:QR:CHECK_STATUS` | `CheckQRPaymentStatusUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/Infoplus` (bankCode=BIDV) | P0 |
| IB-F06 | QR 코드 인쇄 | `DEVICE:PRINT` | TODO: 인쇄 UseCase 확정 필요 | `SaleMgr` | `Infrastructure/Device/Printer` | P1 |
| IB-F07 | 대기 후 닫기 | `PAYMENT:QR:CANCEL` | `CancelQRPaymentUseCase` | `SaleMgr` | `ExternalBridge/PaymentGateways/Infoplus` (bankCode=BIDV) | P1 |
| IB-F08 | 모달 닫기/취소 | -- (UI 내부 상태) | -- | -- | -- | P0 |
| IB-F09 | 언어 전환 (KR/EN/VN) | -- (i18n 전환) | -- | -- | `BrandPosApp/PosUi/src/i18n/locales/*` | P2 |

## 4. UI 구조

### 4.1 컴포넌트 트리

```
screens/PaymentScreen
  └─ shared/ui/organisms/QRPaymentModal (gateway="infoplus", bankCode="BIDV")
       ├─ 헤더 영역: 타이틀 (i18n msgKey), 언어 전환 버튼, 닫기 버튼
       ├─ QR 이미지 영역: QR 코드 렌더링 + 결제 금액 표시
       ├─ 상태 표시 영역: 결제 진행 상태 텍스트 (폴링 결과 반영)
       └─ 하단 액션 바: [QR 취소] [결제 확인] [QR 인쇄] [대기 후 닫기]
```

### 4.2 데이터 바인딩

| ID | 표시 항목 | 신규 컴포넌트 위치 | 데이터 소스 |
|---|---|---|---|
| IB-D01 | QR 결제 안내 타이틀 | QRPaymentModal 헤더 | i18n msgKey (`payment.qr.title`, params: `{gateway: "infoplus", bank: "bidv"}`) |
| IB-D02 | QR 코드 이미지 | QRPaymentModal QR 영역 | `paymentApi.generateQR` mutation 응답 |
| IB-D03 | 결제 상태 텍스트 | QRPaymentModal 상태 영역 | `paymentApi.checkQRStatus` polling 응답 |
| IB-D04 | 결제 금액 | QRPaymentModal 금액 영역 | `paymentApi.generateQR` 응답 내 금액 |

## 5. 구현명세

### 5.1 Bridge Command 명세

| Command | 방향 | Payload | 응답 |
|---|---|---|---|
| `PAYMENT:QR:GENERATE` | UI -> C++ | `{ gateway: "infoplus", bankCode: "BIDV", amount, tableCode, idempotencyKey }` | `{ qrImageUrl, transactionId, expiresAt }` |
| `PAYMENT:QR:CHECK_STATUS` | UI -> C++ | `{ gateway: "infoplus", bankCode: "BIDV", transactionId }` | `{ status: "PENDING"\|"SUCCEEDED"\|"FAILED", amount }` |
| `PAYMENT:QR:CANCEL` | UI -> C++ | `{ gateway: "infoplus", bankCode: "BIDV", transactionId }` | `{ cancelled: boolean }` |
| `PAYMENT:QR:REFRESH` | UI -> C++ | `{ gateway: "infoplus", bankCode: "BIDV", transactionId }` | `{ qrCode, newExpiresAt }` |
| `PAYMENT:QR:CONFIRM` | C++ 내부 | -- (CHECK_STATUS 성공 시 자동 트리거) | -- |

#### Bridge Command 표준 shape

```
PAYMENT:QR:GENERATE
  Request:  { tableId, amount, gateway }
  Response: { qrCode, transactionId, expiresAt }
  Error:    GATEWAY_UNAVAILABLE, OFFLINE_BLOCKED

PAYMENT:QR:CHECK_STATUS
  Request:  { transactionId }
  Response: { status: "PENDING"|"COMPLETED"|"FAILED"|"EXPIRED" }
  Error:    TRANSACTION_NOT_FOUND

PAYMENT:QR:CANCEL
  Request:  { transactionId }
  Response: { status: "CANCELLED" }
  Error:    ALREADY_COMPLETED, CANCEL_FAILED

PAYMENT:QR:REFRESH
  Request:  { transactionId }
  Response: { qrCode, newExpiresAt }
  Error:    TRANSACTION_EXPIRED
```

### 5.2 RTK Query 엔드포인트

| 엔드포인트 | 타입 | 태그 | 비고 |
|---|---|---|---|
| `paymentApi.generateQR` | mutation | -- | gateway + bankCode param으로 Infoplus/BIDV 분기 |
| `paymentApi.checkQRStatus` | query (polling) | -- | `pollingInterval` 설정으로 자동 폴링 |
| `paymentApi.cancelQR` | mutation | -- | |

### 5.3 UseCase 흐름

1. `ExecuteQRPaymentUseCase`: 오프라인 체크 -> Ledger `RECEIVED` 기록 -> ExternalBridge/Infoplus QR 생성 API 호출 (bankCode=BIDV) -> Ledger `PROCESSING` -> 응답 반환
2. `CheckQRPaymentStatusUseCase`: Infoplus 상태 조회 (bankCode=BIDV) -> 성공 시 DB 저장 (WaitPayment, SellSlip, SellDetail) -> Ledger `SUCCEEDED` -> PosRealTimeSender로 UI 갱신 이벤트 방송
3. `CancelQRPaymentUseCase`: Infoplus 취소 API 호출 (bankCode=BIDV) -> Ledger `COMPENSATED` 기록

### 5.4 PosRealTime 이벤트

| 이벤트 | 발행 시점 | Payload |
|---|---|---|
| `PAYMENT:QR:STATUS_CHANGED` | 결제 상태 변경 시 (UseCase에서 발행) | `{ transactionId, status, amount, gateway: "infoplus", bankCode: "BIDV" }` |
| `PAYMENT:QR:COMPLETED` | 결제 확정 후 DB 커밋 완료 시 | `{ transactionId, sellSlipId, amount, gateway: "infoplus", bankCode: "BIDV" }` |

### 5.5 오프라인/에러 처리

- 오프라인 감지 시: QR 생성 mutation 진입 차단, 사용자에게 네트워크 필요 안내 (msgKey 기반)
- QR 만료: `expiresAt` 체크하여 만료 시 자동 취소 + 재생성 안내
- 승인 실패: Ledger `FAILED` 기록, 사용자에게 재시도 또는 다른 결제 수단 안내
- 폴링 타임아웃: 5분 (기본) -- 초과 시 `PAYMENT_TIMEOUT` 에러 반환, Ledger `FAILED` 기록

#### UseCase 실패 규칙

- **오프라인 진입 차단**: 모든 QR 결제 UseCase는 네트워크 연결 상태를 진입 시점에 검사하며, 오프라인이면 즉시 차단한다
- **폴링 타임아웃**: 기본 5분 -- 초과 시 `PAYMENT_TIMEOUT` 에러, Ledger `FAILED` 기록
- **멱등성**: `transactionId` 기준으로 중복 요청을 판별한다
- **Outbox 재전송 대상 아님**: QR 결제 승인/취소 요청은 Outbox에 적재하지 않는다. 오프라인 복구 후 과거 요청 자동 재실행 금지

### 5.6 Device Error 규칙

디바이스 에러(QR 인쇄 실패 등)는 코드 기반 필드로 전달한다. 완성 문장 `msg`를 싣지 않는다.

```
{ type, device: "PRINTER", code, msgKey, msgParams, severity, recoverable, retryable, action }
```

### 5.7 Permission

- **필요 권한**: 결제 실행 권한 (로그인 직원 전원)
- 별도 관리자 권한 불필요. POS에 로그인한 직원이면 QR 결제 생성/확인/취소 모두 가능하다

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| IB-T01 | QR 생성 성공 | QR 이미지 렌더링, 금액 표시, 폴링 시작 |
| IB-T02 | 결제 승인 성공 (폴링 자동 확정) | DB 저장 확인 (WaitPayment, SellSlip), Ledger SUCCEEDED, UI 완료 표시 |
| IB-T03 | QR 취소 | Infoplus 취소 API 호출 (bankCode=BIDV), Ledger COMPENSATED, 모달 닫기 |
| IB-T04 | 오프라인 진입 차단 | 네트워크 미연결 시 QR 생성 mutation 차단, 안내 메시지 |
| IB-T05 | QR 만료 | expiresAt 경과 후 자동 취소 처리 |
| IB-T06 | bankCode 파라미터 전달 검증 | Infoplus API 호출 시 bankCode=BIDV 정확히 전달 |
| IB-T07 | 언어 전환 | KR/EN/VN 전환 시 모달 내 모든 텍스트 i18n 반영 |
| IB-T08 | mockTransport 동작 | `next dev` + mockTransport 조합으로 C++ 없이 QR 모달 동작 확인 |

## 7. 완료기준

- [ ] `shared/ui/organisms/QRPaymentModal` 공통 컴포넌트에서 `gateway="infoplus"` + `bankCode="BIDV"` 분기 동작
- [ ] `paymentApi.generateQR` / `checkQRStatus` / `cancelQR` RTK Query 엔드포인트에서 bankCode 파라미터 지원
- [ ] `ExecuteQRPaymentUseCase`, `CheckQRPaymentStatusUseCase`, `CancelQRPaymentUseCase` C++ 구현 (Infoplus bankCode 분기)
- [ ] `ExternalBridge/PaymentGateways/Infoplus` 어댑터에서 bankCode=BIDV 분기 구현
- [ ] Ledger 상태 전이 검증
- [ ] 오프라인 진입 차단 검증
- [ ] mockTransport 기반 디자인 시스템 프리뷰 동작
- [ ] i18n msgKey 기반 다국어 (ko/en/vi) 검증

## 8. 작업명단

| 순서 | 작업 | 담당 계층 | 상태 |
|------|------|----------|------|
| 1 | QRPaymentModal 공통 컴포넌트 (gateway adapter 구조) | BrandPosApp/PosUi/shared/ui/organisms | TODO |
| 2 | paymentApi RTK Query 엔드포인트 (bankCode 파라미터 지원) | BrandPosApp/PosUi/store/api | TODO |
| 3 | PosRequestActions/Payment QR thin router | BrandPosApp/Presentation/CEF/InternalBridge | TODO |
| 4 | ExecuteQRPaymentUseCase / CheckQRPaymentStatusUseCase / CancelQRPaymentUseCase (Infoplus 분기) | BrandPosApp/UseCases/Payment | TODO |
| 5 | ExternalBridge/PaymentGateways/Infoplus 어댑터 (bankCode 파라미터 분기) | BrandPosApp/Infrastructure/ExternalBridge | TODO |
| 6 | WaitPaymentCrud / SellSlipCrud / SellDetailCrud SQLite 영속화 | BrandPosApp/Infrastructure/Persistence/SQLite | TODO |
| 7 | mockTransport QR 결제 fixture (Infoplus/BIDV) | BrandPosApp/PosUi/mocks | TODO |
| 8 | i18n 키 등록 (payment.qr.*) | BrandPosApp/PosUi/src/i18n/locales | TODO |
| 9 | Screen Shell | BrandPosApp/PosUi/src/screens/PaymentScreen/components/InfoplusBIDVQRDialog.tsx | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_INFOPLUS_BIDV_QR |
| 리소스 값 | 446 |
| 크기 (DLU) | 414 x 327 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 11 |

### 레거시 UI 요소 매핑

| 레거시 ID | 용도 | 신규 대응 |
|---|---|---|
| IDOK (숨김) | 프로그래밍적 결제 완료 트리거 | CheckQRStatus 성공 시 자동 확정 흐름으로 대체 |
| IDCANCEL | 닫기/취소 | QRPaymentModal 닫기 버튼 |
| IDC_PAYMENT_UPDATE (숨김) | 타이머 기반 자동 폴링 트리거 | React useEffect + RTK Query polling으로 대체 |
| IDC_BTN_KR / IDC_BTN_EN / IDC_BTN_VN | 언어 전환 | i18n 시스템 통합 (BrandPosApp/PosUi/src/i18n/locales/) |
| IDC_CLOSE_WAIT | 대기 후 닫기 | QRPaymentModal 대기 후 닫기 액션 |
| IDC_QRCANCEL | QR 코드 취소 | QRPaymentModal QR 취소 액션 |
| IDC_PAYMENT_CHECK | 수표 조회 (결제 확인) | QRPaymentModal 결제 확인 액션 |
| IDC_PRINT | QR 코드 인쇄 | QRPaymentModal 인쇄 액션 |
| IDC_TITLE | 안내 타이틀 | QRPaymentModal 헤더 (i18n msgKey) |

### Infoplus 통합 참고

Infoplus 게이트웨이는 Shinhan/BIDV/Woori 은행별로 동일 프로토콜을 공유한다. `ExternalBridge/PaymentGateways/Infoplus` 어댑터 하나에서 `bankCode` 파라미터로 분기한다. 은행별 별도 어댑터를 만들지 않는다.
