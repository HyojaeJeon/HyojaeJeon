# AUTOWORK 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-AUTOWORK |
| 화면 ID (레거시) | IDD_AUTOWORK |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

AUTOWORK은 일일 마감/정산 화면이다. 영업 종료 시 매출 요약, 결제수단별 내역, 미정산 항목, 시재 현황을 확인하고, 권종별 시재 수량을 입력하여 정산을 확정한다. P0 핵심 기능이다.

- 신규 UI 위치: `screens/SystemScreen/AutoClose`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름 | 마감/정산 프로세스 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 영업 종료 흐름 | AutoClose 필수 |
| CLAUDE.md | Outbox 규칙 | 마감 데이터 중앙 서버 동기화 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| AUTO-F01 | 마감 저장 (정산 확정) | P0 | SYSTEM:AUTO_CLOSE | AutoCloseBusinessUseCase | AccountingMgr, SaleMgr | Tables/Accounting/*, Tables/System/ConfigCrud (SQLite) |
| AUTO-F02 | 마감 인쇄 | P1 | SYSTEM:GET_CONTENT | AutoCloseBusinessUseCase | AccountingMgr | Device/Printer |
| AUTO-F03 | 닫기 | P0 | 없음 (라우팅) | - | - | - |
| AUTO-F04 | 시재 입금 | P1 | ACCOUNTING:CASH_IN | CashInOutUseCase | AccountingMgr | Tables/Accounting/CashInOutCrud (SQLite) |
| AUTO-F05 | 정산 그리드 스크롤 | P1 | 없음 (UI 로컬) | - | - | - |
| AUTO-F06 | 인쇄 (숨김) | P2 | SYSTEM:GET_CONTENT | - | - | Device/Printer |
| AUTO-F07 | 권종별 수량 입력 (지폐 5종: 100원~5만원) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| AUTO-F08 | 주화별 수량 입력 (4종: 10원~500원) | P0 | 없음 (UI 로컬 상태) | - | - | - |
| AUTO-F09 | 합계 자동 계산 | P0 | 없음 (UI 계산) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------------+
| [담당자] [날짜] [시간] [정산번호]     [저장] [닫기]             |
|                                                             |
| +--매출요약--+  +--결제수단--+  +--시재현황--+                 |
| | 그리드      |  | 그리드     |  | 그리드     |                 |
| |            |  |           |  |           |                 |
| +--지폐 수량 입력--+  +--주화 수량 입력--+  [합계]              |
| | 5만원 [  ] |  | 500원 [  ] |                               |
| | 1만원 [  ] |  | 100원 [  ] |                               |
| | 5천원 [  ] |  |  50원 [  ] |                               |
| | 1천원 [  ] |  |  10원 [  ] |                               |
| | 100원 [  ] |  +------------+  [시재입금] [마감인쇄]          |
| +------------+                                              |
| +--미정산 내역 그리드-----------------------------------+       |
| |                                                    |       |
| +----------------------------------------------------+       |
+-------------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 매출요약/결제수단/미정산/시재 그리드 | shared/ui/molecules/DataTable | 4개 React 테이블 |
| 권종 수량 입력 | shared/ui/atoms/NumberInput | 지폐 5개 + 주화 4개 |
| 합계 표시 | shared/ui/atoms/AmountLabel | ReadOnly, 실시간 계산 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| AUTO-D01 | 담당자 | Label | systemApi.getConfig (로그인 직원) |
| AUTO-D02 | 영업일 | Label | systemApi.getConfig |
| AUTO-D03 | 마감 시간 | Label | systemApi.getConfig |
| AUTO-D04 | 정산 번호 | Label | accountingApi.getAdjustmentNo |
| AUTO-D05 | 매출 요약 그리드 | DataTable | accountingApi.getDailySummary |
| AUTO-D06 | 결제수단별 그리드 | DataTable | accountingApi.getPaymentBreakdown |
| AUTO-D07 | 미정산 내역 그리드 | DataTable | accountingApi.getPendingItems |
| AUTO-D08 | 시재 현황 그리드 | DataTable | accountingApi.getCashStatus |
| AUTO-D09 | 지폐 수량 입력 (5개) | NumberInput x 5 | UI 로컬 상태 |
| AUTO-D10 | 주화 수량 입력 (4개) | NumberInput x 4 | UI 로컬 상태 |
| AUTO-D11 | 합계 금액 | AmountLabel (ReadOnly) | UI 계산 결과 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| SYSTEM:AUTO_CLOSE | `{ closeDate, cashAmount, cardAmount }` | `{ summary: { ... } }` | `ALREADY_CLOSED` | 마감 확정 |
| ACCOUNTING:CASH_IN | `{ amount, reason, staffId }` | `{ record }` | `INVALID_AMOUNT` | 시재 입금 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| AutoCloseBusinessUseCase | 마감 저장, 정산 확정 | O | RECEIVED -> SUCCEEDED | 마감 데이터 중앙 서버 동기화 |
| CashInOutUseCase | 시재 입금 | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED | 입금 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준, 외부 연동 없음).

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| AccountingMgr | CloseBusiness() | 일일 마감 처리 |
| AccountingMgr | RecordCashIn() | 시재 입금 |
| SaleMgr | GetDailySummary() | 매출 요약 계산 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Accounting/* | SQLite | 정산/시재 기록 |
| Tables/System/ConfigCrud | SQLite | 영업일/설정 |
| Device/Printer | - | 마감 영수증 인쇄 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| accountingApi.getDailySummary | `DailySummary` | 매출 요약 |
| accountingApi.getPaymentBreakdown | `PaymentBreakdown` | 결제수단별 |
| accountingApi.getPendingItems | `PendingItems` | 미정산 |
| accountingApi.getCashStatus | `CashStatus` | 시재 현황 |
| accountingApi.getAdjustmentNo | `AdjustmentNo` | 정산 번호 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 방향 | 비고 |
|---|---|---|
| SYSTEM:BUSINESS_CLOSED | C++ -> UI | 마감 완료 후 로그인 화면 전환 |

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/accounting.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `ALREADY_CLOSED` 등 |
| Permission | **관리자 전용**. 일반 직원은 마감 화면 진입 불가. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| AUTO-T01 | 권종별 수량 입력 후 합계 확인 | 실시간 합계 계산 |
| AUTO-T02 | 마감 저장 | SQLite 커밋 + Outbox 적재 |
| AUTO-T03 | 시재 입금 후 현황 갱신 | 시재 그리드 반영 |
| AUTO-T04 | 마감 인쇄 | 영수증 출력 |

---

## 7. 완료 기준

- [ ] 4개의 MFCGridCtrl이 React 테이블로 대체된다
- [ ] 권종별 수량 입력이 NumberInput 컴포넌트로 전환된다
- [ ] 합계가 UI에서 실시간 계산된다
- [ ] AutoCloseBusinessUseCase가 마감 저장 후 Outbox를 통해 중앙 서버로 동기화한다
- [ ] 숨김 컨트롤(날짜/시간/직원명)이 React 상태로 흡수된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SystemScreen/AutoClose/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/System/AutoCloseBusinessUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Accounting/AccountingMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Accounting/` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/accountingApi.ts` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/EmployeeScreen/components/AutoWorkDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_AUTOWORK |
| 리소스 값 | 132 |
| 크기 (DLU) | 509 x 403 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 29 (버튼 7, 라벨 4, 입력 14, 그리드 4) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_ENDWORK_SAVE | 저장 버튼 |
| IDC_ENDWORK_PRINT | 마감 인쇄 버튼 |
| IDC_ENDWORK_END | 닫기 버튼 |
| IDC_ENDWORK_MONEYIN | 시재 입금 버튼 |
| IDC_EDT_HT~IDC_EDT_THOU (지폐 5개) | NumberInput x 5 |
| IDC_EDT_FH~IDC_EDT_TEN (주화 4개) | NumberInput x 4 |
| IDC_EDT_TOTALBOX (ReadOnly) | AmountLabel |
| IDC_GRID6/4/3/5 (MFCGridCtrl 4개) | DataTable x 4 |
| IDC_S_PERSON/DATE/TIME/ADJUSTNO | Label |
| IDC_DATE, IDC_DATETIMEPICKER1, IDC_EMPNAME (숨김) | React 상태 |
