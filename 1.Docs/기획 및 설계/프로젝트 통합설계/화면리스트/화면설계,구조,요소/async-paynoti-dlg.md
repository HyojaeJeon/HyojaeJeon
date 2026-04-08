# 비동기 결제 알림 화면

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-PAY-ASYNC-PAYNOTI-DLG |
| 화면 경로 | `screens/PaymentScreen` (QRPaymentModal 내부 알림 또는 독립 토스트) |
| 레거시 다이얼로그 | `IDD_ASYNC_PAYNOTI_DLG` (리소스 452) |
| 상위 설계서 | `04-Edge-POS-아키텍처-설계서.md` / `05-Edge-POS-전체-흐름-AZ-가이드.md` |
| 작성일 | 2026-04-05 |
| 상태 | Draft |

## 1. 화면개요

비동기 결제 완료 알림 팝업이다. QR 결제 등 비동기 결제가 외부에서 승인 완료되었을 때, C++ UseCases가 PosRealTimeSender를 통해 UI에 결제 완료 이벤트를 방송하면 표시되는 알림 화면이다.

- **레거시 형태**: UI 요소가 0개인 매우 작은 팝업(345x47 DLU), Owner Draw 방식으로 알림 표시
- **신규 형태**: QRPaymentModal 내부 상태 변경 알림 배너 또는 독립 토스트 컴포넌트로 대체
- **데이터 흐름**: DB 저장 완료 후 발생하는 후처리 UI 피드백이다 ("DB 먼저, UI 다음" 원칙 부합)
- **Outbox 대상 여부**: 아니다. 이 알림은 이미 확정된 결제의 UI 피드백이며, QR 결제 승인 요청 자체가 Outbox 재전송 대상이 아니다

## 2. 상위기준연결

| 기준 | 연결 |
|------|------|
| 계층 흐름 | `UseCases -> PosRealTimeSender -> PosRealTimeReceiver -> UI` (C++ -> UI 단방향 방송) |
| 데이터 흐름 | 외부 결제 승인 완료 -> UseCases DB 저장 -> PosRealTimeSender 이벤트 방송 -> UI 알림 표시 |
| 동기/비동기 분류 | UI 알림 자체는 **비동기 후처리** -- DB 커밋 완료 후 발생 |
| PosRealTime 규칙 | UseCases만 PosRealTimeSender 호출 권한을 가진다 |
| UI 이벤트 중복 방지 | `isPendingRequest(requestId)`로 자기 요청 응답 이벤트 무시, 외부 변경만 처리 |
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,en,vi}` -- msgKey 기반 |

## 3. 기능목록

| ID | 기능명 | Bridge Command | UseCase | Domain/Manager | Infrastructure | 우선순위 |
|---|---|---|---|---|---|---|
| AP-F01 | 비동기 결제 완료 알림 표시 | -- (PosRealTime 수신) | -- (UseCase에서 이미 처리 완료) | -- | -- | P0 |
| AP-F02 | 알림 자동 닫기 (타이머) | -- (UI 내부 상태) | -- | -- | -- | P1 |
| AP-F03 | 결제 상태 갱신 반영 | -- (PosRealTime 수신) | -- | -- | -- | P0 |

## 4. UI 구조

### 4.1 컴포넌트 트리

```
PosRealTimeReceiver (전역 이벤트 리스너)
  └─ 방안 A: shared/ui/organisms/QRPaymentModal 내부 알림 배너
       └─ 결제 완료 상태 텍스트 + 금액 요약 + 자동 dismiss
  └─ 방안 B: shared/ui/atoms/Toast (독립 토스트 컴포넌트)
       └─ 결제 완료 알림 메시지 + 자동 dismiss
```

TODO: QRPaymentModal이 이미 열려 있을 때는 모달 내부 상태 갱신(방안 A), 열려 있지 않을 때는 독립 토스트(방안 B)로 분기할지 정책 확정 필요

### 4.2 데이터 바인딩

| ID | 표시 항목 | 신규 컴포넌트 위치 | 데이터 소스 |
|---|---|---|---|
| AP-D01 | 결제 완료 알림 메시지 | 알림 배너 또는 토스트 | PosRealTime `PAYMENT:QR:COMPLETED` 이벤트 payload |
| AP-D02 | 결제 금액/상태 요약 | 알림 배너 또는 토스트 | PosRealTime 이벤트 payload 내 `amount`, `status` |

## 5. 구현명세

### 5.1 Bridge Command 명세

이 화면은 PosRequest(UI -> C++) 방향 command를 사용하지 않는다. PosRealTime(C++ -> UI) 채널로만 동작한다.

#### 참조: QR Bridge Command 표준 shape (이 화면에서 수신하는 이벤트의 원본 command)

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

이 화면은 위 command를 직접 호출하지 않으며, UseCase가 처리 완료 후 발행하는 PosRealTime 이벤트만 수신한다.

### 5.2 RTK Query 엔드포인트

별도 엔드포인트 없음. PosRealTime 이벤트 수신 시 필요하면 `paymentApi` 캐시를 직접 패치(`updateQueryData`)한다.

### 5.3 PosRealTime 이벤트 수신 흐름

1. `PosRealTimeReceiver`가 `PAYMENT:QR:COMPLETED` 이벤트 수신
2. `isPendingRequest(requestId)` 체크 -- 자기가 보낸 요청의 응답이면 무시 (이미 mutation 결과로 처리됨)
3. 외부 변경(다른 POS, 배달앱 등)이면:
   - RTK Query 캐시 업데이트 (`updateQueryData`)
   - 알림 UI 트리거 (토스트 또는 모달 내부 배너)
4. 알림은 설정된 시간 후 자동 dismiss

### 5.4 PosRealTime 이벤트

| 이벤트 (수신) | 발행 주체 | Payload |
|---|---|---|
| `PAYMENT:QR:COMPLETED` | UseCases (C++) | `{ requestId, transactionId, sellSlipId, amount, gateway, status }` |
| `PAYMENT:QR:STATUS_CHANGED` | UseCases (C++) | `{ requestId, transactionId, status, amount, gateway }` |

### 5.5 오프라인/에러 처리

- 이 화면은 수신 전용이므로 오프라인 시 별도 처리 불필요 (이벤트 자체가 오지 않음)
- PosRealTime 이벤트 파싱 실패 시: 로그 기록, UI에는 영향 없음

#### UseCase 실패 규칙 (참조)

이 화면은 UseCase를 직접 호출하지 않으므로 실패 규칙의 직접 적용 대상이 아니다. 다만 수신하는 이벤트의 원본 UseCase에는 아래 규칙이 적용된다:

- **오프라인 진입 차단**: 모든 QR 결제 UseCase는 오프라인이면 진입 차단 -- 결과적으로 이 알림도 발생하지 않는다
- **폴링 타임아웃**: 기본 5분 -- 초과 시 `PAYMENT_TIMEOUT`, 이 경우 `STATUS_CHANGED` 이벤트로 수신
- **멱등성**: `transactionId` 기준
- **Outbox 재전송 대상 아님**: QR 결제 승인/취소 요청은 Outbox에 적재하지 않는다

### 5.6 Device Error 규칙

해당 없음 (이 화면은 디바이스를 직접 제어하지 않는다)

### 5.7 Permission

- **필요 권한**: 결제 실행 권한 (로그인 직원 전원)
- 이 알림은 PosRealTime 수신 전용이므로 별도 권한 체크 없이 표시된다. 단, 알림의 원인이 되는 QR 결제 자체는 로그인 직원 전원에게 허용된다

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| AP-T01 | 외부 결제 완료 이벤트 수신 | PosRealTime PAYMENT:QR:COMPLETED 수신 시 알림 표시 |
| AP-T02 | 자기 요청 응답 무시 | isPendingRequest 체크로 자기 요청 이벤트 무시 확인 |
| AP-T03 | 알림 자동 닫기 | 설정 시간 후 자동 dismiss 확인 |
| AP-T04 | RTK Query 캐시 갱신 | 외부 이벤트 수신 시 paymentApi 캐시 업데이트 확인 |
| AP-T05 | QRPaymentModal 열림 상태 분기 | 모달 열림/닫힘에 따른 알림 표시 방식 분기 확인 |
| AP-T06 | mockTransport 동작 | mock PosRealTime 이벤트로 알림 동작 확인 |

## 7. 완료기준

- [ ] PosRealTimeReceiver에서 `PAYMENT:QR:COMPLETED` / `PAYMENT:QR:STATUS_CHANGED` 이벤트 핸들러 구현
- [ ] `isPendingRequest(requestId)` 체크 로직 구현
- [ ] 알림 UI 컴포넌트 구현 (토스트 또는 모달 내부 배너)
- [ ] 알림 자동 dismiss 타이머 구현
- [ ] RTK Query 캐시 직접 패치 (`updateQueryData`) 구현
- [ ] mockTransport 기반 PosRealTime 이벤트 시뮬레이션 동작
- [ ] TODO: QRPaymentModal 열림/닫힘 상태에 따른 알림 분기 정책 확정

## 8. 작업명단

| 순서 | 작업 | 담당 계층 | 상태 |
|------|------|----------|------|
| 1 | PosRealTimeReceiver 결제 이벤트 핸들러 | BrandPosApp/PosUi/providers | TODO |
| 2 | 알림 UI 컴포넌트 (토스트 또는 배너) | BrandPosApp/PosUi/shared/ui | TODO |
| 3 | isPendingRequest 체크 로직 (PosRequestSender 연동) | BrandPosApp/PosUi/bridge | TODO |
| 4 | RTK Query 캐시 직접 패치 로직 | BrandPosApp/PosUi/store/api | TODO |
| 5 | mock PosRealTime 이벤트 fixture | BrandPosApp/PosUi/mocks | TODO |
| 6 | i18n 키 등록 (payment.notification.*) | BrandPosApp/PosUi/src/i18n/locales | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ASYNC_PAYNOTI_DLG |
| 리소스 값 | 452 |
| 크기 (DLU) | 345 x 47 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 0 |

### 레거시 특이사항

- UI 요소가 0개인 매우 작은 팝업(345x47 DLU)으로, Owner Draw 방식으로 비동기 결제 완료 알림을 그렸다
- WS_POPUP 스타일의 별도 다이얼로그로 화면 위에 떴다가 사라지는 방식
- 신규에서는 React 토스트/알림 컴포넌트로 대체하며, 별도 윈도우/다이얼로그가 필요 없다

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | AsyncPaymentNotification.tsx shell 구현 완료. 토스트 알림 UI, 자동 dismiss 타이머, PosRealTimeReceiver 구독 stub 포함 |
