# ACCOUNT_BSELECT_VN (결제수단 버튼 선택/설정 - 베트남 로케일)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-ACCOUNT-BSELECT-VN |
| 레거시 다이얼로그 | IDD_ACCOUNT_BSELECT_VN (리소스 442) |
| 신규 화면 경로 | screens/PaymentScreen (KR 버전과 통합) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

> **통합 안내**: 이 화면은 `account-bselect.md`(SCR-ACCOUNT-BSELECT)와 **단일 PaymentMethodGrid로 통합**된다. 본 문서는 VN 로케일 고유 차이점만 기술하며, 전체 기능/구현 명세는 `account-bselect.md`를 참조한다.

---

## 1. 화면 개요

IDD_ACCOUNT_BSELECT_VN은 KR 버전(IDD_ACCOUNT_BSELECT)의 베트남 로케일 변형이다. 신규 아키텍처에서는 **국가별 결제수단 설정 기반 단일 PaymentMethodGrid**로 통합한다.

**KR 버전 대비 차이점:**
- ZALOPAY, NAPAS, UserPayment1~4 버튼 추가
- 언어 선택 버튼(KR/EN/VN) 추가
- 한국 전용 결제수단(카드 IDC_A_CARD, 현금영수증 IDC_A_CASHBILL, 무현금 IDC_A_NOCASH 등) 숨김 처리

---

## 2. 상위 기준 연결

`account-bselect.md` 섹션 2와 동일.

---

## 3. 기능 목록 (VN 고유 추가분)

KR 버전 기능(ABS-F01~F50)에 아래를 추가:

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| ABVN-F19 | ZALOPAY 결제 | P0 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways/ZaloPay |
| ABVN-F20 | NAPAS 결제 | P0 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud, CardReader |
| ABVN-F21 | UserPayment 1~4 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, UserPaymentCrud |
| ABVN-F22 | 언어 선택 (KR/EN/VN) | P1 | - (UI 로컬) | - | - | - |

> ZALOPAY는 **외부 PG 동기 대기** 패턴 (QR 결제). **Outbox 재전송 대상이 아니다.**
> NAPAS는 카드 결제 경로 (동기 대기).

---

## 4. UI 구조

### 4.1 화면 구성

`account-bselect.md` 섹션 4.1과 동일. 국가별 결제수단 설정 기반 동적 렌더링.

### 4.2 재사용 UI

`account-bselect.md` 섹션 4.2와 동일.

---

## 5. 구현 명세

### 5.1~5.4

`account-bselect.md` 섹션 5.1~5.4와 동일.

### 5.5 DB / CentralApi / Sync / Realtime (VN 고유)

**추가 Infrastructure:**
- PaymentGateways/ZaloPay: ZALOPAY QR 결제 PG 연동
- UserPaymentCrud: 사용자 정의 결제수단 CRUD

### 5.6 i18n / Error / Permission (VN 고유)

- 번역 원본: `BrandPosApp/PosUi/src/i18n/locales/vi/`
- 언어 선택 버튼(KR/EN/VN)은 글로벌 i18n 전환으로 통합, 결제 화면 전용이 아닌 앱 전역 설정
- UserPayment1~4는 사용자 정의 결제수단으로 라벨/기능 동적 설정

**Bridge shape / UseCase 실패 규칙 / Permission**: `account-bselect.md` 섹션 5.2, 5.3, 5.6 참조. ZALOPAY/NAPAS는 `PAYMENT:QR:{gateway}` shape에 `gateway: "ZALOPAY"|"NAPAS"` 포함.

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-ABVN-01 | ZALOPAY QR 결제 동기 대기 | PG 호출 -> 응답 대기 -> 승인 후 DB 저장 |
| T-ABVN-02 | NAPAS 카드 결제 | CardReader 호출 -> 승인 후 DB 저장 |
| T-ABVN-03 | UserPayment 동적 결제 | 사용자 정의 결제수단 정상 동작 |
| T-ABVN-04 | 언어 전환 | KR/EN/VN 전환 시 라벨 갱신 |
| T-ABVN-05 | 한국 전용 결제수단 숨김 | VN 설정 시 카드/현금영수증/무현금 미표시 |

---

## 7. 완료 기준

- [ ] ZALOPAY QR 결제 동기 대기 구현
- [ ] NAPAS 카드 결제 구현
- [ ] UserPayment 1~4 동적 결제수단 구현
- [ ] 국가 설정 기반 결제수단 표시/숨김 통합
- [ ] VN 로케일 번역 완료

---

## 8. 작업 명단

`account-bselect.md` 섹션 8의 작업 명단을 공유한다. VN 고유 추가 파일:

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| C++ Infra | BrandPosApp/Infrastructure/ExternalBridge/PaymentGateways/ZaloPay/ | ZALOPAY PG 연동 |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/UserPaymentCrud.cpp | 사용자 정의 결제수단 CRUD |
| i18n | BrandPosApp/PosUi/src/i18n/locales/vi/payment.json | 베트남어 결제 번역 |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ACCOUNT_BSELECT_VN |
| 리소스 값 | 442 |
| 크기 (DLU) | 430 x 350 |
| 총 UI 요소 수 | 74 (버튼 74개) |
| 소스 파일 | Restaurant.rc |

### A.2 KR 버전 대비 차이

| 변경 유형 | 항목 |
|---|---|
| 추가 | IDC_A_ZALOPAY, IDC_A_NAPAS, IDC_A_USERPAY1~4, IDC_BTN_KR/EN/VN |
| 숨김 변경 | IDC_A_CARD, IDC_A_CASHBILL, IDC_A_NOCASH, IDC_A_COUPON, IDC_A_KEEP 등 숨김 처리 |
| 위치 변경 | IDC_A_MONEYBOX, IDC_A_POINT 등 일부 위치 조정 |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PaymentQuickSelectVN.tsx shell 구현 완료. ZALOPAY/NAPAS/UserPayment1~4, 언어선택(KR/EN/VN) 포함 |
