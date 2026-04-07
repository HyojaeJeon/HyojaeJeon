# SET-SELECTSELLDEL-DLG: 매출매입 선택 삭제 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-SELECTSELLDEL-DLG |
| 화면명 | 매출매입 선택 삭제 |
| 레거시 다이얼로그 | IDD_SELECTSELLDEL_DLG (리소스 182) |
| 신규 라우트 | `/pos/maintenance/sales-delete` |
| 신규 Screen 경로 | `screens/MaintenanceScreen/SalesDelete` |
| 모드 | Maintenance mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

매출/매입 데이터를 날짜 기간 기준으로 검색하고 선택/일괄 삭제하는 유지보수 화면이다. 3개 그리드로 구성된 마스터-디테일 화면으로, 매출 목록(마스터) 선택 시 매출 상세와 결제 내역이 연동 표시된다. set-datadel 화면의 매출매입 삭제(IDC_SERVER_SELECTSELLDEL) 버튼에서 호출되는 하위 다이얼로그이다. 매출 데이터 삭제는 복구 불가능한 작업이므로 이중 확인(날짜 범위 + 건수 표시) 필수.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/MaintenanceScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| CLAUDE.md | DB 엔진 전환 | SQLite 매출/결제 테이블 대상 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SDEL-F01 | 매출 목록 조회 (초기 로드) | P1 | `SETUP:SALES:GET_LIST` | `DeleteSalesRecordUseCase` (조회 경로) | `SystemMgr` | SQLite (매출 테이블) |
| SDEL-F02 | 시작일 선택 | P0 | - | - | - | - |
| SDEL-F03 | 종료일 선택 | P0 | - | - | - | - |
| SDEL-F04 | 기간 검색 | P0 | `SETUP:SALES:GET_LIST` | `DeleteSalesRecordUseCase` (조회 경로) | `SystemMgr` | SQLite (매출 테이블) |
| SDEL-F05 | 선택 삭제 | P0 | `SETUP:SALES:DELETE` | `DeleteSalesRecordUseCase` | `SystemMgr` | SQLite (매출 테이블) |
| SDEL-F06 | 일괄 삭제 | P1 | `SETUP:SALES:DELETE` | `DeleteSalesRecordUseCase` | `SystemMgr` | SQLite (매출 테이블) |
| SDEL-F07 | 닫기 (React 라우팅) | P1 | - | - | - | - |
| SDEL-F08~F11 | 스크롤/페이지 버튼 (숨김) | P2 | - | - | - | - |
| SDEL-F12 | 매출 목록 행 선택 (마스터-디테일 연동) | P0 | - | - | - | - |
| SDEL-F13 | 매출 상세 그리드 표시 | P0 | `SETUP:SALES:GET_LIST` | `DeleteSalesRecordUseCase` (조회 경로) | `SystemMgr` | SQLite (매출 상세 테이블) |
| SDEL-F14 | 결제 내역 그리드 표시 | P1 | `SETUP:SALES:GET_LIST` | `DeleteSalesRecordUseCase` (조회 경로) | `SystemMgr` | SQLite (결제 테이블) |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [닫기]                                             헤더 영역   |
+---------------------------------------------------------------+
| 시작일: [DatePicker]  종료일: [DatePicker]                     |
| [검색]  [삭제]  [일괄삭제]                                     |
+-------------------------------+-------------------------------+
|                               |                               |
|  매출 목록 (DataGrid)         |  매출 상세 (DataGrid)         |
|  - 마스터 그리드              |  - 디테일 그리드 1            |
|  - 행 선택 시 우측 연동       |                               |
|                               +-------------------------------+
|                               |                               |
|                               |  결제 내역 (DataGrid)         |
|                               |  - 디테일 그리드 2            |
|                               |                               |
+-------------------------------+-------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `DataGrid` | `shared/ui/organisms/DataGrid` | 매출 목록 / 매출 상세 / 결제 내역 (3개 그리드) |
| `DatePicker` | `shared/ui/atoms/DatePicker` | 시작일, 종료일 선택 |
| `Button` | `shared/ui/atoms/Button` | 검색, 삭제, 일괄삭제, 닫기 |
| `ConfirmModal` | `shared/ui/organisms/ConfirmModal` | 삭제 전 확인 모달 <!-- TODO: ConfirmModal 컴포넌트 존재 여부 확인 --> |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetSalesListQuery` | GET | 매출 목록/상세/결제 내역 조회 (기간 기준) |
| `setupApi.useDeleteSalesRecordMutation` | POST | 매출 레코드 삭제 (선택/일괄) |

### 5.2 Bridge Commands

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:SALES:GET_LIST` | UI -> C++ | `{ v, requestId, timestamp, data: { startDate, endDate } }` | 기간 기준 매출 조회 |
| `SETUP:SALES:DELETE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { deleteType, ids, dateRange } }` | 매출 삭제 |

### 5.3 UseCase 흐름

**DeleteSalesRecordUseCase (삭제)**
1. `idempotencyKey` 검사 (Ledger)
2. 삭제 대상 검증 (선택된 레코드 또는 기간 범위)
3. SQLite 트랜잭션: 매출/매출상세/결제 테이블 DELETE + Ledger 갱신
4. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateSalesDeleteRequest()` | 매출 삭제 요청 유효성 검증 |
| `SystemMgr` | `getSalesList()` | 매출 목록/상세/결제 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | 매출 테이블 | 매출 마스터 CRUD |
| SQLite | 매출 상세 테이블 | 매출 상세 CRUD |
| SQLite | 결제 테이블 | 결제 내역 CRUD |

### 5.6 주의사항

- 삭제 전 확인 모달 필수. 매출 데이터 삭제는 복구 불가능한 작업이므로 이중 확인(날짜 범위 표시 + 건수 표시) 권장. <!-- TODO: 삭제 확인 UX 상세 설계 -->
- 숨김 스크롤/페이지 버튼(SDEL-F08~F11)은 레거시 터치 환경용 커스텀 스크롤 버튼으로 추정. 신규에서는 DataGrid 자체 스크롤로 대체.
- 이 화면은 MaintenanceScreen 경로에 배치. set-datadel 화면의 매출매입 삭제 버튼에서 진입하는 하위 화면.
- 레거시 DateTimePicker는 DTS_RIGHTALIGN 스타일. 신규 DatePicker에서도 동일한 정렬 유지. <!-- TODO: DatePicker 정렬 옵션 확인 -->

### 5.7 UseCase 실패 규칙

- **멱등성**: 매출 데이터 삭제는 마지막 값 덮어쓰기가 아닌 파괴적 작업 (idempotencyKey 불필요하나 Ledger 기록 필수)
- **트랜잭션**: SQLite TX 내에서 매출/매출상세/결제 DELETE 원자적
- **참조 무결성**: 해당 없음 (삭제 대상 전체를 TX 안에서 일괄 처리)
- **Outbox**: 매출 삭제 이력 → 중앙 동기화 대상 (감사 로그 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.8 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- **관리자 비밀번호 재확인 필수**: 매출 데이터 삭제는 복구 불가능한 위험 작업이므로 이중 인증
- TODO: 관리자 비밀번호 재확인 방식 확정 -- UI 모달에서 비밀번호 입력 후 Bridge payload에 포함하여 UseCase에서 검증하는 흐름 권장

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| SDEL-T01 | 시작일/종료일 선택 후 검색 | 매출 목록 그리드에 기간 내 데이터 표시 | P0 |
| SDEL-T02 | 매출 행 선택 시 디테일 연동 | 매출 상세 + 결제 내역 그리드에 선택 건 표시 | P0 |
| SDEL-T03 | 선택 삭제 실행 | 확인 모달 -> 선택된 매출 레코드 삭제 -> 그리드 갱신 | P0 |
| SDEL-T04 | 일괄 삭제 실행 | 확인 모달 -> 기간 내 전체 매출 삭제 -> 그리드 갱신 | P1 |
| SDEL-T05 | 삭제 멱등성 확인 | 동일 idempotencyKey로 중복 삭제 시 1회만 실행 | P0 |
| SDEL-T06 | 삭제 취소 | 확인 모달에서 취소 -> 데이터 변경 없음 | P0 |

---

## 7. 완료 기준

- [ ] P0: 기간 검색 정상 동작 (SDEL-F04)
- [ ] P0: 마스터-디테일 연동 (행 선택 -> 상세/결제 표시)
- [ ] P0: 선택 삭제 정상 동작 (SDEL-F05)
- [ ] P0: 삭제 전 확인 모달 구현
- [ ] P1: 일괄 삭제 정상 동작 (SDEL-F06)
- [ ] P1: 결제 내역 그리드 표시
- [ ] P2: 스크롤/페이지 버튼 (DataGrid 자체 스크롤로 대체)
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/MaintenanceScreen/SalesDelete/index.tsx` | 매출매입 삭제 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/MaintenanceScreen/SalesDelete/hooks/useSalesDelete.ts` | UI 전용 훅 (마스터-디테일 연동) |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getSalesList`, `deleteSalesRecord` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid` | 데이터 그리드 (공용, 3개 인스턴스) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/DatePicker` | 날짜 선택 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Button` | 버튼 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/ConfirmModal` | 삭제 확인 모달 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:SALES:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 매출 삭제 thin router |
| UseCase | `BrandPosApp/UseCases/System/DeleteSalesRecordUseCase.cpp` | 매출 삭제 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 매출 삭제 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellSlipCrud.cpp` | 매출 마스터 CRUD |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Payment/SellDetailCrud.cpp` | 매출 상세 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SELECTSELLDEL_DLG |
| 리소스 값 | 182 |
| 크기 (DLU) | 513 x 383 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 13 (버튼 8, 입력 필드 2, 그리드 3) |

### A.2 레거시 UI 요소

**버튼 (8개):** IDCANCEL (닫기), IDC_SELECTSELLDEL_UP/DOWN (스크롤, 숨김), IDC_SELECTSELLDEL_SEARCH (검색), IDC_SELECTSELLDEL_DEL (삭제), IDC_SELECTSELLDEL_PAGEUP/PAGEDOWN (페이지, 숨김), IDC_SELECTSELLDEL_DELALL (일괄삭제)

**입력 필드 (2개):** IDC_STARTDATE (DateTimePicker) - 시작일, IDC_ENDDATE (DateTimePicker) - 종료일

**그리드 (3개):**
- IDC_GRID (MFCGridCtrl, 313x299 DLU) - 매출 목록 (마스터)
- IDC_GRID2 (MFCGridCtrl, 170x197 DLU) - 매출 상세 (디테일 1)
- IDC_GRID4 (MFCGridCtrl, 169x92 DLU) - 결제 내역 (디테일 2)

### A.3 마이그레이션 노트

- 3개 그리드로 구성된 마스터-디테일 화면: 매출 목록 -> 매출 상세 + 결제 내역.
- 숨김 스크롤/페이지 버튼은 터치 환경용 커스텀 스크롤 버튼으로 추정. 신규에서는 DataGrid 자체 스크롤로 대체.
- set-datadel 화면의 매출매입 삭제 버튼에서 호출되는 하위 다이얼로그.
- 삭제 전 확인 모달 필수. 매출 데이터 삭제는 복구 불가능한 작업.
- DateTimePicker는 DTS_RIGHTALIGN 스타일.
