# GETHOLD_DLG 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-GETHOLD-DLG |
| 화면 ID (레거시) | IDD_GETHOLD_DLG |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

GETHOLD_DLG는 보류(Hold) 주문 복원 모달이다. 보류된 주문을 선택하여 현재 테이블로 복원하는 기능을 제공한다. 마스터(보류 목록)-디테일(주문 상세) 패턴의 2개 그리드와 바코드 스캐너 검색을 지원한다.

- 신규 UI 위치: `shared/ui/organisms/HoldOrderModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 주문 계층 흐름 | 보류 주문 복원 |
| CLAUDE.md | shared/ui 규칙 | 공용 모달은 shared/ui/organisms |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| HOLD-F01 | 보류 주문 선택 (복원) | P0 | ORDER:RESTORE_HOLD | GetHoldOrdersUseCase | OrderMgr | Tables/Order/* (SQLite) |
| HOLD-F02 | 닫기 | P0 | 없음 (모달 닫기) | - | - | - |
| HOLD-F03 | 영수증/바코드 인쇄 | P1 | SYSTEM:GET_CONTENT | - | - | Device/Printer |
| HOLD-F04 | 보류 목록 스크롤 | P0 | 없음 (UI 로컬) | - | - | - |
| HOLD-F05 | 바코드 입력 (숨김) | P1 | ORDER:GET_HOLD_LIST | GetHoldOrdersUseCase | OrderMgr | Device/Scanner |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------+
| [영수증인쇄]  [선택]  [닫기]                              |
|                                                       |
| +--보류 주문 목록 그리드--+  +--선택된 주문 상세 그리드--+  |
| | 시간 | 테이블 | 금액    |  | 항목 | 수량 | 가격        |  |
| |                        |  |                          |  |
| |                        |  |                          |  |
| +------------------------+  +--------------------------+  |
+-------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/HoldOrderModal | 보류 주문 복원 모달 |
| 보류 목록 | shared/ui/molecules/DataTable | 마스터 테이블 |
| 주문 상세 | shared/ui/molecules/DataTable | 디테일 테이블 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| HOLD-D01 | 보류 주문 목록 | DataTable | orderApi.getHoldList |
| HOLD-D02 | 선택된 보류 주문 상세 | DataTable | orderApi.getHoldDetail |
| HOLD-D03 | 바코드 입력 (숨김) | 내부 (스캐너 수신) | Device/Scanner 이벤트 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| ORDER:GET_HOLD_LIST | `{}` | `{ holdOrders: [...] }` | (없음) | 보류 주문 목록 |
| ORDER:RESTORE_HOLD | `{ holdOrderId, tableId }` | `{ orderSlip }` | `HOLD_NOT_FOUND`, `TABLE_OCCUPIED` | 보류 주문 복원 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| GetHoldOrdersUseCase | 보류 주문 조회, 복원 | O (SQLite TX 원자적) | RECEIVED -> SUCCEEDED | 주문 복원 이력 동기화 |

> **UseCase 실패 규칙**: 멱등성 Ledger 기록 (requestId + idempotencyKey). SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 SQLite 기준). HOLD_NOT_FOUND, TABLE_OCCUPIED 시 Ledger에 FAILED 기록.

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| OrderMgr | GetHoldOrders() | 보류 주문 목록 조회 |
| OrderMgr | RestoreHoldOrder() | 보류 주문 복원 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Order/* | SQLite | 주문 데이터 |
| Device/Printer | - | 영수증 인쇄 |
| Device/Scanner | - | 바코드 스캐너 입력 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| orderApi.getHoldList | `HoldOrderList` | 보류 주문 목록 |
| orderApi.getHoldDetail | `HoldOrder:{id}` | 보류 주문 상세 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 방향 | 비고 |
|---|---|---|
| DEVICE:SCANNER_INPUT | C++ -> UI | 바코드 스캔 수신 |

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/order.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `HOLD_NOT_FOUND`, `TABLE_OCCUPIED` |
| Permission | **로그인 직원 전원**. 보류 주문 조회/복원은 특별한 권한 제한 없음. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| HOLD-T01 | 보류 주문 선택 후 복원 | 현재 테이블에 주문 복원 |
| HOLD-T02 | 보류 목록 클릭 | 상세 그리드 갱신 |
| HOLD-T03 | 바코드 스캔 | 해당 보류 주문 자동 선택 |
| HOLD-T04 | 영수증 인쇄 | 보류 영수증 출력 |

---

## 7. 완료 기준

- [ ] 2개의 MFCGridCtrl이 React 테이블(마스터-디테일 패턴)로 대체된다
- [ ] 선택(IDC_SELECT) 시 ORDER:RESTORE_HOLD를 통해 보류 주문이 복원된다
- [ ] 바코드 스캐너 입력이 Device 이벤트로 수신된다
- [ ] 레거시 스크롤 버튼이 네이티브 스크롤로 대체된다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/HoldOrderModal.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Order/OrderActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Order/GetHoldOrdersUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Order/OrderMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Order/` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/orderApi.ts` | TODO |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | HoldOrderDialog.tsx shell 구현 완료. Modal, Button 사용. 마스터-디테일 패턴(보류 목록 + 주문 상세) 2개 테이블 + 선택/영수증인쇄 버튼 stub. |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_GETHOLD_DLG |
| 리소스 값 | 110 |
| 크기 (DLU) | 512 x 384 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 8 (버튼 5, 입력 1, 그리드 2) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_SELECT | 선택(복원) 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_BTN_PRINT | 영수증 인쇄 버튼 |
| IDC_UP / IDC_DOWN | 네이티브 스크롤 |
| IDC_GRID (MFCGridCtrl) | DataTable (보류 목록) |
| IDC_GRID2 (MFCGridCtrl) | DataTable (주문 상세) |
| IDC_EDT_BARCODE (숨김) | 바코드 스캐너 수신 (Device 이벤트) |
