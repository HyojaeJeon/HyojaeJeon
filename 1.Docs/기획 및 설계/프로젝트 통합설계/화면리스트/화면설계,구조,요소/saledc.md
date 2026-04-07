# SALEDC (할인/세일 관리)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SALEDC |
| 레거시 다이얼로그 | IDD_SALEDC (리소스 374) |
| 신규 화면 경로 | screens/PaymentScreen/components/DiscountSettingPanel (모달/패널) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

**할인/세일 관리** 화면. 주문 항목에 할인을 적용/취소하는 팝업이다. 할인명, 상세내용, 타입, 상태, 금액을 표시하고, 주문 항목별 할인 적용 대상을 그리드로 관리한다. 신규 구조에서는 PaymentScreen 내부의 할인 설정 패널/모달로 통합한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 결제 서브 플로우 (할인) |
| account-dialog.md, account-bselect.md | 상위 결제 화면 | PaymentScreen 내부 서브 구성요소 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SDC-F01 | 할인 저장 | P0 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| SDC-F02 | 할인 등록 | P1 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| SDC-F03 | 할인 취소/삭제 | P0 | PAYMENT:APPLY_DISCOUNT | ExecutePaymentUseCase | SaleMgr | SellDetailCrud |
| SDC-F04 | 할인 목록 스크롤 | P2 | - (UI 로컬) | - | - | - |
| SDC-F05 | 닫기 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/PaymentScreen/components/
  DiscountSettingPanel.tsx     -- 할인 설정 모달/패널 (독립 다이얼로그 -> 내부 통합)
  DiscountTargetGrid.tsx       -- 할인 적용 대상 주문 항목 그리드
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| ScrollableList | shared/ui/organisms/ScrollableList | 할인 목록 스크롤 |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 할인 목록 | RTK Query 캐시 (salesApi: getDiscountList) | 서버 상태 |
| 주문 항목 (할인 대상) | RTK Query 캐시 (orderApi: getOrderItems) | 서버 상태 |
| 현재 선택 할인 | React 로컬 state | 컴포넌트 로컬 |

### 5.2 Bridge 계약

`account-dialog.md` 섹션 5.2의 `PAYMENT:APPLY_DISCOUNT` 참조.

**Bridge shape (DISCOUNT:APPLY 참조)**:
- **Request**: `{ tableId, discountType, discountRate?, discountAmount? }`
- **Response**: `{ orderSlip: { discountAmount, totalAmount } }`
- **Error**: `INVALID_DISCOUNT_VALUE`, `ORDER_EMPTY`

### 5.3 UseCase 계약

| UseCase | 책임 | 비고 |
|---|---|---|
| ExecutePaymentUseCase | 할인 적용/취소, SellDetail 갱신 | 할인 저장/취소 공통 |

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| SaleMgr | 할인 적용/취소 로직, 금액 재계산 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- SellDetailCrud: 매출 상세 할인 적용/취소

### 5.6 i18n / Error / Permission

**Permission**
- 할인 적용/저장: 관리자 또는 할인 권한 직원 -> `PERMISSION_DENIED` 시 UI 에러 표시
- 할인 취소/삭제: 관리자 또는 할인 권한 직원

- 할인 등록(IDC_SALEREGI)은 숨김 처리, 설정 기반 조건부 표시
- 할인 타입/상태 라벨은 i18n 키 기반

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-SDC-01 | 할인 적용 | 선택 항목에 할인 적용 -> DB 반영 |
| T-SDC-02 | 할인 취소 | 적용된 할인 제거 -> 금액 재계산 |
| T-SDC-03 | 할인 대상 그리드 | 주문 항목별 할인 적용 상태 표시 |

---

## 7. 완료 기준

- [ ] DiscountSettingPanel 구현 (독립 다이얼로그 -> 모달/패널)
- [ ] DiscountTargetGrid 구현 (주문 항목별 할인 대상)
- [ ] 할인 적용/취소 Bridge -> UseCase 연동
- [ ] 할인 등록 조건부 표시

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/DiscountSettingPanel.tsx | 할인 설정 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/PaymentScreen/components/DiscountTargetGrid.tsx | 할인 대상 그리드 |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query (할인 목록) |
| Store | BrandPosApp/PosUi/src/store/api/orderApi.ts | 주문 RTK Query (주문 항목) |

기타 파일은 `account-dialog.md` 섹션 8 참조.

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SALEDC |
| 리소스 값 | 374 |
| 크기 (DLU) | 450 x 337 |
| 총 UI 요소 수 | 13 (버튼 6, 텍스트 5, 그리드 2) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_SALEDC_SAVE | 할인 저장 | DiscountSettingPanel |
| IDC_SALEREGI | 할인 등록 (숨김) | DiscountSettingPanel |
| IDC_SALECANCEL | 할인 취소/삭제 | DiscountSettingPanel |
| IDC_SALEGRID_UP/DOWN | 스크롤 | ScrollableList |
| IDC_GRID | 할인 항목 선택 (숨김) | DiscountSettingPanel (내부) |
| IDC_GRID2 | 할인 적용 대상 그리드 | DiscountTargetGrid |
| IDC_SALENAME | 할인명 | DiscountSettingPanel |
| IDC_SALENAME2 | 할인 상세 | DiscountSettingPanel |
| IDC_SALETYPE | 할인 타입 | DiscountSettingPanel |
| IDC_SALESTATE | 할인 상태 | DiscountSettingPanel |
| IDC_SALEAMT | 할인 금액 | DiscountSettingPanel |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | DutchPayDialog.tsx shell 구현 완료. 할인 목록/대상 그리드, 할인 저장/등록/취소 stub, 항목별 할인 토글 포함 |
