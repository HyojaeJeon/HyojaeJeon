# ACCETC_DIALIG (기타 결제수단 입력 팝업)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-ACCETC-DIALIG |
| 레거시 다이얼로그 | IDD_ACCETC_DIALIG (리소스 433) |
| 신규 화면 경로 | screens/PaymentScreen/components/EtcPaymentPanel (모달/패널) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

ACCOUNT_DIALOG에서 기타 결제 버튼 클릭 시 열리는 **기타 결제수단 입력 팝업**. 식권(외상), 포인트, 쿠폰, 예치금, 카드 미승인, 현금, OK캐시백 등 기타 결제수단의 금액 입력과 처리를 담당한다. 신규 구조에서는 독립 다이얼로그가 아닌 PaymentScreen 내부 패널/모달로 통합한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 결제 서브 플로우 |
| CLAUDE.md | Offline-First, 카드 미승인 오프라인 처리 | 카드 미승인은 오프라인 카드 결제 |
| account-dialog.md | 상위 결제 화면 | PaymentScreen 내부 서브 구성요소 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| AE-F01 | 기타결제 금액 입력 | P0 | - (UI 로컬) | - | - | - |
| AE-F02 | 식권(외상) 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AE-F03 | 포인트 결제 | P0 | PAYMENT:APPLY_POINT | ApplyPointUseCase | SaleMgr, CustMgr | SellDetailCrud, CustomerCrud |
| AE-F04 | 쿠폰 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AE-F05 | 예치금 결제 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr, CustMgr | SellSlipCrud, CustomerCrud |
| AE-F06 | 카드 미승인 결제 | P1 | PAYMENT:CARD | ExecuteCardPaymentUseCase | SaleMgr | SellSlipCrud |
| AE-F07 | 현금 결제 | P0 | PAYMENT:CASH | ExecuteCashPaymentUseCase | SaleMgr | SellSlipCrud, SellDetailCrud |
| AE-F08 | OK캐시백 적립 1~4 | P2 | PAYMENT:SAVE_POINT | SavePointUseCase | CustMgr | CustomerCrud |
| AE-F09 | 작업금액 표시 | P2 | - (표시 전용) | - | SaleMgr | SellSlipCrud |
| AE-F10 | PAYCO 결제 | P2 | PAYMENT:QR | ExecuteQRPaymentUseCase | SaleMgr | SellSlipCrud, PaymentGateways |
| AE-F11 | 원결제 완료 | P1 | PAYMENT:EXECUTE | ExecutePaymentUseCase | SaleMgr | SellSlipCrud, RequestLedgerStore |
| AE-F12 | 닫기 | P0 | PAYMENT:CANCEL | CancelPaymentUseCase | SaleMgr | SellSlipCrud |
| AE-F13 | 숫자패드 입력 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/PaymentScreen/components/
  EtcPaymentPanel.tsx          -- 기타 결제 모달/패널 (독립 다이얼로그 -> 내부 통합)
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| NumericKeypad | shared/ui/organisms/NumericKeypad | 숫자패드 (0~9, 00, 000, 0000, BS, CLR) |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 받은금액 | uiSlice (Redux) | UI 로컬 상태 |
| 기결제 내역 | RTK Query 캐시 (salesApi: getSellDetails) | 서버 상태 |
| 거스름돈 | uiSlice (Redux) | UI 로컬 상태 |
| 작업금액 | RTK Query 캐시 (salesApi: getSellSlip) | 서버 상태 |
| 숫자패드 입력값 | React 로컬 state | 컴포넌트 로컬 |

### 5.2 Bridge 계약

`account-dialog.md` 섹션 5.2의 PAYMENT:CASH, PAYMENT:CARD, PAYMENT:EXECUTE, PAYMENT:APPLY_POINT 참조.

**Bridge shape 참조 (이 화면 해당분)**:
- `PAYMENT:CASH` -> Response: `{ sellSlip: { id, tableId, totalAmount, payType: "CASH", status: "COMPLETED" } }`, Error: `TABLE_NOT_SELECTED`, `AMOUNT_MISMATCH`, `ORDER_EMPTY`
- `PAYMENT:APPLY_POINT` -> Response/Error: `account-dialog.md` 5.2 참조
- 카드 미승인 결제(AE-F06): `PAYMENT:CARD` shape 사용하되 CardReader 호출 없이 DB에만 저장 (오프라인 카드 결제용). TODO: 카드 미승인 전용 command 분리 여부 -- 확인 필요: PAYMENT:CARD와 동일 shape 사용 시 `unapproved: true` 파라미터 추가 또는 별도 `PAYMENT:CARD_UNAPPROVED` 신설

### 5.3 UseCase 계약

`account-dialog.md` 섹션 5.3 참조. 추가:

| UseCase | 책임 | 비고 |
|---|---|---|
| SavePointUseCase | OK캐시백 적립 | 한국 전용, 국가 설정 기반 조건부 |

### 5.4 Domain/Manager

`account-dialog.md` 섹션 5.4와 동일.

### 5.5 DB / CentralApi / Sync / Realtime

`account-dialog.md` 섹션 5.5와 동일.

### 5.6 i18n / Error / Permission

**Permission**
- 기타 결제 실행 (현금/포인트/쿠폰): 로그인 직원 전원
- 카드 미승인 결제: 관리자 또는 카드 미승인 권한 직원 (TODO: 카드 미승인 권한 코드 확정 -- 확인 필요: 레거시 권한 체계에서의 미승인 처리 기준)
- OK캐시백 적립 버튼(1~4)은 한국 전용 기능, 국가 설정 기반 조건부 표시
- 카드 미승인 결제(IDC_UNPER)는 오프라인 카드 결제용, Offline-First 패턴에서 별도 처리 필요

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-AE-01 | 현금 기타결제 | 숫자패드 금액 입력 -> 현금 결제 정상 |
| T-AE-02 | 카드 미승인 결제 | CardReader 미호출, DB 직접 저장 |
| T-AE-03 | 포인트 결제 | 포인트 차감 + 매출 상세 반영 |
| T-AE-04 | 식권/외상 결제 | SellSlip 외상 처리 |
| T-AE-05 | OK캐시백 국가 조건부 | KR: 표시, VN: 미표시 |

---

## 7. 완료 기준

- [ ] EtcPaymentPanel 구현 (독립 다이얼로그 -> 모달/패널)
- [ ] NumericKeypad 재사용
- [ ] 기타 결제수단별 Bridge Command 정상 동작
- [ ] 카드 미승인 오프라인 처리 구현
- [ ] 국가 기반 조건부 표시

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/EtcPaymentPanel.tsx | 기타 결제 패널 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/organisms/NumericKeypad.tsx | 숫자패드 (공유) |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query |
| C++ UseCase | BrandPosApp/UseCases/Payment/SavePointUseCase.cpp | 포인트 적립 유스케이스 |

기타 파일은 `account-dialog.md` 섹션 8 참조.

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ACCETC_DIALIG |
| 리소스 값 | 433 |
| 크기 (DLU) | 400 x 300 |
| 총 UI 요소 수 | 35 (버튼 30, 텍스트 4, 입력 1) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 위치 |
|---|---|---|
| IDC_ETC | 금액 입력 | EtcPaymentPanel (숫자패드 연동) |
| IDC_TICKBTN | 식권/외상 | EtcPaymentPanel |
| IDC_POINTBTN | 포인트 | EtcPaymentPanel |
| IDC_COUPONBTN | 쿠폰 | EtcPaymentPanel |
| IDC_KEEPBTN | 예치금 | EtcPaymentPanel |
| IDC_UNPER | 카드 미승인 | EtcPaymentPanel |
| IDC_CASH | 현금 | EtcPaymentPanel |
| IDC_OKCASHBACK~4 | OK캐시백 | EtcPaymentPanel (한국 전용) |
| IDC_N_NUM* | 숫자패드 | shared/ui/organisms/NumericKeypad |
| IDC_RECEIVE | 받은금액 | EtcPaymentPanel |
| IDC_RECASH | 기결제 내역 | EtcPaymentPanel |
| IDC_CHANGE | 거스름돈 | EtcPaymentPanel |
| IDC_WORKVIEW | 작업금액 | EtcPaymentPanel |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PaymentEtcDialog.tsx shell 구현 완료. 숫자패드+금액표시+결제수단버튼(식권/포인트/쿠폰/예치금/카드미승인/현금/OK캐시백) stub 포함 |
