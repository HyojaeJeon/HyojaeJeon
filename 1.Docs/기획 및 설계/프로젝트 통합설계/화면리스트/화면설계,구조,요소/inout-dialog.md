# INOUT_DIALOG 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-INOUT-DIALOG |
| 화면 ID (레거시) | IDD_INOUT_DIALOG |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

INOUT_DIALOG는 현금 입출금 관리 화면이다. 기간별 입출금 조회, 등록, 삭제, 인쇄 기능을 제공한다. 삭제 시 물리 삭제가 아닌 논리 삭제(상태 변경)로 처리하며, Outbox를 통해 중앙 서버에 동기화한다.

- 신규 UI 위치: `screens/AccountingScreen/CashInOut`
- 화면 유형: 전체 화면 (Screen)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 회계 계층 흐름 | 현금 입출금 |
| CLAUDE.md | 멱등성 / Ledger 규칙 | CashInOutUseCase에 idempotencyKey 필요 |
| CLAUDE.md | Outbox 규칙 | 입출금 이력 동기화 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| INOUT-F01 | 입출금 조회 (기간별) | P0 | ACCOUNTING:GET_HISTORY | GetCashInOutHistoryUseCase | AccountingMgr | Tables/Accounting/CashInOutCrud (SQLite) |
| INOUT-F02 | 입출금 등록 | P0 | ACCOUNTING:CASH_IN / ACCOUNTING:CASH_OUT | CashInOutUseCase | AccountingMgr | Tables/Accounting/CashInOutCrud (SQLite) |
| INOUT-F03 | 입출금 인쇄 | P1 | SYSTEM:GET_CONTENT | - | - | Device/Printer |
| INOUT-F04 | 입출금 삭제 | P1 | ACCOUNTING:CASH_OUT | CashInOutUseCase | AccountingMgr | Tables/Accounting/CashInOutCrud (SQLite) |
| INOUT-F05 | 닫기 | P0 | 없음 (라우팅) | - | - | - |
| INOUT-F06 | 그리드 스크롤 | P0 | 없음 (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------+
| [영업일] [담당자]                  [입출금] [닫기]        |
|                                                       |
| [분석기준]                                              |
| [시작일 ~ 종료일] [조회] [인쇄] [삭제]                    |
|                                                       |
| +--입출금 내역 그리드---------------------------------+  |
| | 날짜 | 구분 | 금액 | 적요 | ...                      |  |
| |                                                    |  |
| +----------------------------------------------------+  |
|                                                       |
| 입금합계: [____]  출금합계: [____]  전체합계: [____]      |
+-------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 입출금 내역 | shared/ui/molecules/DataTable | React 테이블 |
| 날짜 선택 | shared/ui/atoms/DatePicker | 조회 기간 |
| 합계 표시 | shared/ui/atoms/AmountLabel | 입금/출금/전체 합계 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| INOUT-D01 | 영업일 | Label | systemApi.getConfig |
| INOUT-D02 | 담당자 | Label | systemApi.getConfig |
| INOUT-D03 | 분석 기준 | Label | systemApi.getConfig |
| INOUT-D04 | 조회 시작일 | DatePicker | UI 로컬 상태 |
| INOUT-D05 | 조회 종료일 | DatePicker | UI 로컬 상태 |
| INOUT-D06 | 입금 합계 | AmountLabel | accountingApi.getCashInOutHistory (계산) |
| INOUT-D07 | 출금 합계 | AmountLabel | accountingApi.getCashInOutHistory (계산) |
| INOUT-D08 | 전체 합계 | AmountLabel | accountingApi.getCashInOutHistory (계산) |
| INOUT-D09 | 입출금 내역 그리드 | DataTable | accountingApi.getCashInOutHistory |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| ACCOUNTING:GET_HISTORY | `{ startDate, endDate }` | `{ records[], inTotal, outTotal }` | (없음) | 기간별 조회 |
| ACCOUNTING:CASH_IN | `{ amount, reason, staffId }` | `{ record }` | `INVALID_AMOUNT` | 입금 등록 |
| ACCOUNTING:CASH_OUT | `{ amount, reason, staffId }` | `{ record }` | `INVALID_AMOUNT`, `INSUFFICIENT_CASH` | 출금 등록/삭제 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| GetCashInOutHistoryUseCase | 입출금 이력 조회 | X (읽기 전용) | - | - |
| CashInOutUseCase | 입금/출금 등록, 논리 삭제 | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED | 입출금 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준). INVALID_AMOUNT, INSUFFICIENT_CASH 시 Ledger에 FAILED 기록.

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| AccountingMgr | RecordCashIn() | 입금 기록 |
| AccountingMgr | RecordCashOut() | 출금 기록 |
| AccountingMgr | SoftDeleteCashRecord() | 논리 삭제 |
| AccountingMgr | GetCashHistory() | 이력 조회 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Accounting/CashInOutCrud | SQLite | 입출금 CRUD |
| Device/Printer | - | 인쇄 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| accountingApi.getCashInOutHistory | `CashInOutHistory` | 입출금 이력 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/accounting.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `INVALID_AMOUNT`, `INSUFFICIENT_CASH` |
| Permission | **관리자 또는 입출금 권한 직원**. 일반 직원은 입출금 권한이 부여된 경우에만 접근 가능. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| INOUT-T01 | 기간별 입출금 조회 | 내역 표시 + 합계 계산 |
| INOUT-T02 | 입금 등록 | 그리드 갱신 + 합계 갱신 |
| INOUT-T03 | 출금 삭제 | 논리 삭제 + 그리드 갱신 |
| INOUT-T04 | 인쇄 | 입출금 내역 출력 |
| INOUT-T05 | 동일 idempotencyKey 재전송 | 중복 등록 방지 |

---

## 7. 완료 기준

- [ ] CashInOutUseCase에 idempotencyKey가 적용된다
- [ ] 삭제가 물리 삭제가 아닌 논리 삭제로 처리된다
- [ ] Outbox를 통해 중앙 서버에 동기화된다
- [ ] MFCGridCtrl 1개가 React 테이블로 대체된다
- [ ] 합계가 클라이언트 측에서 조회 결과를 합산하여 표시된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/AccountingScreen/CashInOut/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Accounting/AccountingActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Accounting/CashInOutUseCase.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Accounting/GetCashInOutHistoryUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Accounting/AccountingMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Accounting/CashInOutCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/accountingApi.ts` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_INOUT_DIALOG |
| 리소스 값 | 422 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 16 (버튼 7, 라벨 3, 입력 5, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_INOUT_SERCH | 조회 버튼 |
| IDC_INOUT_INPUT | 입출금 등록 버튼 |
| IDC_INOUT_PRINT | 인쇄 버튼 |
| IDC_INOUT_DEL | 삭제 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_INOUT_UP / DOWN | 네이티브 스크롤 |
| IDC_INOUT_GRID (MFCGridCtrl) | DataTable (입출금 내역) |
| IDC_INOUT_STARTDATE / ENDDATE | DatePicker |
| IDC_JANG_INTOTAL / OUTTOTAL / ALLTOTAL | AmountLabel (합계) |
| IDC_INOUT_DATE / EMP | Label |
| IDC_STA_ANALYBASE | Label (분석기준) |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/common/InOutDialog.tsx` | DONE |
