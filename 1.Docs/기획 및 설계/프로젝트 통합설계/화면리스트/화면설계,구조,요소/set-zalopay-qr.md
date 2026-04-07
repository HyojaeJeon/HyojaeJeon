# ZALOPAY_QR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ZALOPAY_QR` |
| 화면 ID | `IDD_ZALOPAY_QR` |
| 원본 파일 | `set-zalopay-qr.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: ZaloPay QR 결제 실행/대기 화면이다. **설정 화면이 아닌 실시간 결제 실행 화면**이며, QR 코드를 생성하여 고객이 스캔/결제를 완료할 때까지 대기한다. **온라인 필수** — 오프라인 시 진입 차단.
- **해결하는 사용자 문제**: 직원이 결제 시점에 ZaloPay QR 코드를 생성하고, 고객 결제 완료를 확인하며, 필요 시 QR 코드를 인쇄하거나 결제를 취소한다.
- **화면 진입 경로**: PaymentScreen → ZaloPay QR 결제 선택 시 (결제 플로우 내 진입)
- **화면 종료 경로**: 결제 완료 → 자동 닫힘, 대기종료(IDC_CLOSE_WAIT) → 결제 대기 취소, 닫기(IDCANCEL) → 화면 종료
- **관련 운영 주체**: 직원 (카운터)
- **운영 모드**: 운영 모드 (실시간 결제 실행) — **Setup/Maintenance가 아님**
- **네트워크 요구사항**: **온라인 필수** — 외부 결제 게이트웨이(ZaloPay) API 호출 필요. Outbox 재전송 대상 아님.

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 전체 흐름 | `05-Edge-POS-전체-흐름-AZ-가이드.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | QR 코드 생성 | 결제 금액 기반 ZaloPay QR 코드 자동 생성 (화면 진입 시) | 화면 진입 | P0 |
| F-002 | QR 코드 취소 | 생성된 QR 코드를 무효화한다 | QR 코드 취소 버튼 클릭 | P0 |
| F-003 | 결제 확인 (매표 확인) | ZaloPay 서버에 결제 완료 여부를 수동 확인한다 | 매표 확인 버튼 클릭 | P0 |
| F-004 | QR 코드 인쇄 | QR 코드를 프린터로 출력한다 | QR 코드 인쇄 버튼 클릭 | P1 |
| F-005 | 대기 종료 | 결제 대기 상태를 종료하고 화면을 닫는다 | 대기종료 버튼 클릭 | P0 |
| F-006 | 결제 상태 자동 업데이트 | 폴링/콜백으로 결제 완료를 자동 감지한다 (숨김) | 자동 | P1 |
| F-007 | 닫기 | 화면 종료 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 결제 대기 안내 타이틀 ("ZaloPay 결제를 기다리고 있습니다"), 닫기 버튼
- **중앙 영역**: QR 코드 이미지 영역 (동적 생성)
- **하단 영역**: QR 코드 취소 / 매표 확인 / QR 코드 인쇄 / 대기종료 버튼
- **숨김 영역**: 언어 선택 버튼(KR/EN/VN — 전역 i18n으로 대체), 결제 업데이트 버튼(내부 폴링)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| QRCodeDisplay | shared/ui/organisms/QRCodeDisplay | data, size, status | QR 코드 표시 + 상태 오버레이 |
| PageTitle | shared/ui/atoms/PageTitle | title | 결제 대기 안내 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| QR 코드 데이터 | RTK Query 캐시 | paymentApi.createZaloPayQR | 서버 상태 (외부 API) |
| 결제 상태 | RTK Query 캐시 | paymentApi.checkZaloPayStatus | 서버 상태 (폴링) |
| 대기 중 여부 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| PAYMENT:ZALOPAY_QR:CREATE | `{ tableId, amount }` | `{ qrData, transactionId }` | `NETWORK_OFFLINE`, `ZALOPAY_ERROR` | `PAYMENT:ZALOPAY_QR:CREATE:{tableId}:{timestamp}` | P0, **온라인 필수** |
| PAYMENT:ZALOPAY_QR:CANCEL | `{ transactionId }` | `{ success: true }` | `ZALOPAY_ERROR` | `PAYMENT:ZALOPAY_QR:CANCEL:{transactionId}` | P0, **온라인 필수** |
| PAYMENT:ZALOPAY_QR:CHECK | `{ transactionId }` | `{ status, paidAt? }` | `ZALOPAY_ERROR` | -- (조회) | P0, **온라인 필수** |
| PAYMENT:ZALOPAY_QR:PRINT | `{ transactionId }` | `{ success: true }` | `PRINTER_ERROR` | -- | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| ExecuteZaloPayQRUseCase | PAYMENT:ZALOPAY_QR:CREATE | tableId, amount | SQLite TX | PAYMENT:{tableId} | QR data, transactionId | 오프라인 시 진입 차단. Outbox 재전송 금지. |
| CancelZaloPayQRUseCase | PAYMENT:ZALOPAY_QR:CANCEL | transactionId | SQLite TX | -- | success | 오프라인 시 진입 차단 |
| CheckZaloPayStatusUseCase | PAYMENT:ZALOPAY_QR:CHECK | transactionId | -- | -- | status | 폴링 조회 |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| PaymentManager | 결제 상태 관리 | Domain/Payment/PaymentManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| ExternalBridge/PaymentGateways/ZaloPay | QR 생성/취소/확인 API | UseCase -> ExternalBridge -> ZaloPay API | **동기 대기** — 결과 후 DB 저장 |
| SQLite Tables/Payment/* | 결제 데이터 저장 | UseCase -> PaymentManager -> Crud -> SQLite | 결제 확정 후 로컬 저장 |
| Device/Printer | QR 코드 인쇄 | UseCase 커밋 후 -> Device/Printer | **비동기** — 커밋 후 후처리 |
| Outbox | 결제 완료 동기화 | 결제 확정 후 Outbox 적재 | QR 생성/취소 자체는 Outbox 대상 아님 |
| PosRealTimeSender | 결제 완료 시 UI 갱신 | UseCase 커밋 후 -> PosRealTimeSender -> UI | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/payment.json` | msgKey: payment.zalopayQR.* |
| Error | 코드 기반 (type, device, code, msgKey) | NETWORK_OFFLINE, ZALOPAY_ERROR 등 |
| Permission | TODO: 결제 실행 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| QR 코드 생성 | PaymentScreen/ZaloPayQR + paymentApi | QR 이미지 표시 | integration |
| QR 코드 취소 | PaymentScreen/ZaloPayQR + paymentApi | QR 무효화 확인 | integration |
| 결제 확인 폴링 | PaymentScreen/ZaloPayQR + paymentApi | 결제 완료 시 자동 감지 | integration |
| 오프라인 시 진입 차단 | PaymentScreen/ZaloPayQR | 네트워크 미연결 시 화면 진입 불가 | unit |
| QR 인쇄 | PaymentScreen/ZaloPayQR | 프린터 출력 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/PaymentScreen/ZaloPayQR 또는 별도 라우트)
- [ ] Bridge 계약 구현 완료 (PAYMENT:ZALOPAY_QR:*)
- [ ] UseCase 연동 완료 (ExecuteZaloPayQR, CancelZaloPayQR, CheckZaloPayStatus)
- [ ] ExternalBridge/PaymentGateways/ZaloPay API 연동
- [ ] 오프라인 진입 차단 구현
- [ ] 결제 상태 폴링/콜백 구현
- [ ] QR 인쇄 (Device/Printer) 연동
- [ ] RTK Query 엔드포인트 구현 완료 (paymentApi.createZaloPayQR, checkZaloPayStatus)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/PaymentScreen/ZaloPayQR/index.tsx` | TODO |
| RTK Query endpoint (결제) | `BrandPosApp/PosUi/src/store/api/paymentApi.ts` (createZaloPayQR, checkZaloPayStatus) | TODO |
| Bridge command (결제) | `BrandPosApp/PosUi/src/bridge/commands/payment.ts` | TODO |
| QRCodeDisplay 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/QRCodeDisplay.tsx` | TODO |
| C++ ExecuteZaloPayQRUseCase | `BrandPosApp/UseCases/Payment/ExecuteZaloPayQRUseCase.cpp` | TODO |
| C++ CancelZaloPayQRUseCase | `BrandPosApp/UseCases/Payment/CancelZaloPayQRUseCase.cpp` | TODO |
| C++ CheckZaloPayStatusUseCase | `BrandPosApp/UseCases/Payment/CheckZaloPayStatusUseCase.cpp` | TODO |
| C++ PaymentManager | `BrandPosApp/Domain/Payment/PaymentManager.cpp` | TODO |
| C++ PosRequestActions/Payment | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Payment/PaymentActions.cpp` | TODO |
| ExternalBridge ZaloPay | `BrandPosApp/Infrastructure/ExternalBridge/PaymentGateways/ZaloPay/ZaloPayGateway.cpp` | TODO |
| Device/Printer QR 인쇄 | `BrandPosApp/Infrastructure/Device/Printer/PrinterService.cpp` | TODO |
| SQLite Tables/Payment/* | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ZALOPAY_QR |
| 리소스 값 | 441 |
| 크기 (DLU) | 414 x 327 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 11 |

### 버튼 (10개)

| ID | 라벨 | 숨김 | 용도 추정 |
|---|---|---|---|
| IDOK | OK | **TRUE** | 레거시 호환 |
| IDCANCEL | Cancel | FALSE | 닫기 |
| IDC_PAYMENT_UPDATE | 결제 업데이트 | **TRUE** | 내부 폴링/상태 확인 |
| IDC_BTN_KR / EN / VN | KR/EN/VN | **TRUE** | 언어 선택 (전역 i18n으로 대체) |
| IDC_CLOSE_WAIT | 대기종료 | FALSE | 결제 대기 종료 |
| IDC_QRCANCEL | QR 코드 취소 | FALSE | QR 무효화 |
| IDC_PAYMENT_CHECK | 매표 확인 | FALSE | 수동 결제 확인 |
| IDC_PRINT | QR 코드 인쇄 | FALSE | QR 프린터 출력 |

### 텍스트/라벨 (1개)

| ID | 텍스트 | 용도 추정 |
|---|---|---|
| IDC_TITLE | ZaloPay 결제를 기다리고 있습니다 | 대기 안내 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 10 |
| 텍스트/라벨 | 1 |
| **합계** | **11** |

### 마이그레이션 노트 (원본)

- **설정 화면이 아닌 ZaloPay QR 결제 실행/대기 화면**이다.
- QR 코드 생성/취소/확인은 외부 결제 게이트웨이(ZaloPay) API를 호출하므로, Offline-First 규칙에 따라 오프라인 시 진입 차단이 필요하다. **Outbox 재전송 대상이 아니다.**
- IDC_PAYMENT_UPDATE(결제 업데이트)는 숨김 상태이며 내부적으로 폴링 또는 웹소켓으로 결제 상태를 확인하는 데 사용될 수 있다. 신규 아키텍처에서는 ExternalBridge/PaymentGateways/ZaloPay의 콜백 또는 폴링으로 구현한다.
- 언어 선택 버튼(KR/EN/VN)은 숨김 상태이며, 전역 i18n 설정을 따르므로 별도 언어 선택 UI가 불필요하다.
- QR 코드 인쇄(IDC_PRINT)는 커밋 후 비동기 후처리로, Device/Printer를 통해 처리한다.
