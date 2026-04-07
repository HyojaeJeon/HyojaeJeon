# SET-DATADEL: 데이터 삭제 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-DATADEL |
| 화면명 | 데이터 삭제 |
| 레거시 다이얼로그 | IDD_DATADEL (리소스 163) |
| 신규 라우트 | `/pos/maintenance/data-delete` |
| 신규 Screen 경로 | `screens/MaintenanceScreen/DataDelete` |
| 모드 | Maintenance mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

운영 데이터(판매, 주문, 카드설정, 거치장소설정, 키오스크 이미지 등)를 삭제하거나 초기화하는 유지보수 화면이다. 날짜 기준 삭제, 선택 삭제, 전체 초기화 등 다양한 삭제 옵션을 제공한다. 데이터 무결성에 직접 영향하는 위험 작업이므로 삭제 전 확인 모달이 필수다. MaintenanceScreen 경로에 배치되며 SetupScreen이 아닌 유지보수 모드 전용이다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/MaintenanceScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| CLAUDE.md | DB 엔진 전환 | SQLite 다수 테이블 대상 삭제 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| DATA-F01 | 데이터 삭제 현황 조회 | P1 | `SETUP:DATA:GET_STATUS` | `DeleteDataUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| DATA-F02 | 판매데이터 삭제 (날짜 기준) | P0 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (다수 테이블) |
| DATA-F03 | 선택데이터 삭제 | P1 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (다수 테이블) |
| DATA-F04 | 닫기 (React 라우팅) | P1 | - | - | - | - |
| DATA-F05 | 전체데이터 삭제 | P2 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (전체 테이블) |
| DATA-F06 | 초기화 | P0 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (전체 초기화) |
| DATA-F07 | 매출매입 삭제 | P2 | `SETUP:SALES:DELETE` | `DeleteSalesRecordUseCase` | `SystemMgr` | SQLite (매출 테이블) |
| DATA-F08 | 주문데이터 삭제 | P1 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (주문 테이블) |
| DATA-F09 | 카드설정 삭제 | P1 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (카드설정 테이블) |
| DATA-F10 | 거치장소설정 삭제 | P2 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite (거치장소 테이블) |
| DATA-F11 | 키오스크 이미지 삭제 | P2 | `SETUP:DATA:DELETE` | `DeleteDataUseCase` | `SystemMgr` | SQLite + 파일시스템 |
| DATA-F12~F15 | 삭제 기간 선택 (라디오 1~4) | P0 | - | - | - | - |
| DATA-F16~F36 | 삭제 대상 체크박스 (다수, 대부분 숨김) | P1~P2 | - | - | - | - |
| DATA-F37 | 달력 날짜 선택 | P0 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [닫기]                                             헤더 영역   |
+---------------------------------------------------------------+
| 안내 문구 (삭제 경고 메시지)                                   |
+-------------------------------+-------------------------------+
| 본건 데이터 삭제               |                               |
| [ ] 판매데이터 체크박스 그룹   |     달력 (MonthCalendar)      |
+-------------------------------+                               |
| 데이터설정 섹션 1~4            |  ○ 기간옵션 1                |
| [ ] 체크박스 그룹들            |  ○ 기간옵션 2                |
+-------------------------------+  ○ 기간옵션 3                |
| 데이터설정 섹션 5              |  ○ 기간옵션 4                |
| [ ] 체크박스 그룹들            |  [판매데이터 삭제]            |
| [주문데이터삭제] [매출매입삭제] |  [초기화]                    |
| [선택데이터 삭제]              |                               |
+-------------------------------+-------------------------------+
| [삭제 로그 목록 ListBox]                                       |
+---------------------------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `Calendar` | `shared/ui/molecules/Calendar` | 삭제 기준 날짜 선택 |
| `RadioGroup` | `shared/ui/atoms/RadioGroup` | 삭제 기간 옵션 선택 |
| `CheckboxGroup` | `shared/ui/atoms/CheckboxGroup` | 삭제 대상 데이터 선택 |
| `DataGrid` | `shared/ui/organisms/DataGrid` | 삭제 로그 목록 |
| `Button` | `shared/ui/atoms/Button` | 각종 삭제/닫기 버튼 |
| `ConfirmModal` | `shared/ui/organisms/ConfirmModal` | 삭제 전 확인 모달 <!-- TODO: ConfirmModal 컴포넌트 존재 여부 확인 --> |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetDataDeleteStatusQuery` | GET | 데이터 삭제 현황 조회 |
| `setupApi.useDeleteDataMutation` | POST | 데이터 삭제 실행 |
| `setupApi.useDeleteSalesRecordMutation` | POST | 매출매입 삭제 실행 |

### 5.2 Bridge Commands

> **설정 Bridge 패턴**: `SETUP:{DOMAIN}:GET_STATUS` / `SETUP:{DOMAIN}:DELETE` 형태를 따른다. 삭제 작업은 `DELETE` 커맨드로 분리한다.

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:DATA:GET_STATUS` | UI -> C++ | `{ v, requestId, timestamp }` | 삭제 현황 조회 |
| `SETUP:DATA:DELETE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { deleteType, dateRange, targets } }` | 데이터 삭제 |
| `SETUP:SALES:DELETE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { dateRange } }` | 매출매입 삭제 |

### 5.3 UseCase 흐름

**DeleteDataUseCase (삭제)**
1. **Permission 검사**: 관리자 권한 확인 + **관리자 비밀번호 재확인** (데이터 삭제는 복구 불가능한 위험 작업이므로 이중 인증 필수) <!-- TODO: 관리자 비밀번호 재확인 방식 확정 — UI 모달에서 비밀번호 입력 후 Bridge payload에 포함하여 UseCase에서 검증하는 흐름 권장 -->
2. `idempotencyKey` 검사 (Ledger)
3. 삭제 대상 검증 (날짜 범위, 대상 테이블, 참조 무결성 체크)
4. SQLite 트랜잭션 (원자적): 대상 테이블 DELETE + Ledger 갱신 + Outbox 레코드 적재 (중앙 서버에 삭제 이력 동기화)
5. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

> **데이터 삭제 UseCase 패턴**: 설정 저장과 달리 삭제는 복구 불가능하다. UI에서 **확인 모달 + 관리자 비밀번호 재입력**을 거쳐야 하며, UseCase에서도 비밀번호를 재검증한다. TX 내에서 참조 무결성 위반 시 롤백한다. Outbox에 삭제 이력을 적재하여 중앙 서버에 동기화한다.

#### UseCase 실패 규칙

- **멱등성**: 데이터 삭제는 파괴적 작업 (idempotencyKey 불필요하나 Ledger 기록 필수)
- **트랜잭션**: SQLite TX 내에서 대상 테이블 DELETE 원자적
- **참조 무결성**: TX 내에서 참조 무결성 위반 시 롤백
- **Outbox**: 데이터 삭제 이력 → 중앙 동기화 대상 (감사 로그 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

**DeleteSalesRecordUseCase (매출매입 삭제)**
- set-selectselldel-dlg 화면과 연계하여 선택된 매출 레코드를 삭제

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateDeleteRequest()` | 삭제 요청 유효성 검증 |
| `SystemMgr` | `getDataDeleteStatus()` | 삭제 현황 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | 설정 데이터 삭제 |
| SQLite | 다수 도메인 테이블 | 판매/주문/카드/거치장소 등 삭제 대상 |
| 파일시스템 | - | 키오스크 이미지 삭제 (P2) |

### 5.6 Permission

- **관리자 전용 화면**. 일반 직원은 접근 불가. <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 UI 진입 차단 + UseCase 검사 이중 적용 -->
- **삭제 실행 시 관리자 비밀번호 재확인 필수**. 확인 모달에서 비밀번호 입력 -> Bridge payload에 포함 -> UseCase에서 검증. <!-- TODO: 비밀번호 재확인 payload 필드명 및 검증 로직 확정 -->

### 5.7 주의사항

- 판매데이터 삭제(DATA-F02)와 초기화(DATA-F06)는 운영 데이터 무결성에 직접 영향. 삭제 전 **확인 모달 + 관리자 비밀번호 재입력** 필수 구현.
- 52개 레거시 UI 요소 중 25개 체크박스의 대부분(16개)이 숨김 상태. 실제 활성 삭제 옵션만 신규에서 노출하고, 숨김 항목은 P2.
- 매출매입 삭제(DATA-F07)는 별도 UseCase(`DeleteSalesRecordUseCase`)를 사용하며, set-selectselldel-dlg 화면과 연계.
- 삭제는 복구 불가능한 작업이므로 이중 확인(날짜 범위 + 건수 표시) 권장. <!-- TODO: 삭제 확인 UX 상세 설계 -->

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| DATA-T01 | 화면 진입 시 삭제 현황 로드 | 삭제 로그 목록 표시, 체크박스/라디오 초기 상태 | P1 |
| DATA-T02 | 날짜 선택 후 판매데이터 삭제 | 확인 모달 표시 -> 확인 -> DB에서 해당 기간 데이터 삭제 | P0 |
| DATA-T03 | 초기화 실행 | 확인 모달 표시 -> 확인 -> 전체 운영 데이터 초기화 | P0 |
| DATA-T04 | 삭제 멱등성 확인 | 동일 idempotencyKey로 중복 삭제 시 1회만 실행 | P0 |
| DATA-T05 | 삭제 취소 | 확인 모달에서 취소 -> 데이터 변경 없음 | P0 |

---

## 7. 완료 기준

- [ ] P0: 판매데이터 날짜 기준 삭제 동작 (DATA-F02)
- [ ] P0: 초기화 동작 (DATA-F06)
- [ ] P0: 삭제 전 확인 모달 구현
- [ ] P0: 날짜 선택 및 기간 라디오 동작
- [ ] P1: 선택데이터 삭제, 주문데이터 삭제, 카드설정 삭제
- [ ] P2: 전체데이터 삭제, 매출매입 삭제, 거치장소/키오스크 이미지 삭제
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/MaintenanceScreen/DataDelete/index.tsx` | 데이터 삭제 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/MaintenanceScreen/DataDelete/hooks/useDataDelete.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getDataDeleteStatus`, `deleteData`, `deleteSalesRecord` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/molecules/Calendar` | 달력 컴포넌트 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup` | 라디오 그룹 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/CheckboxGroup` | 체크박스 그룹 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid` | 삭제 로그 그리드 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/ConfirmModal` | 삭제 확인 모달 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:DATA:*`, `SETUP:SALES:*` 커맨드 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | 데이터 삭제 thin router |
| UseCase | `BrandPosApp/UseCases/System/DeleteDataUseCase.cpp` | 데이터 삭제 UseCase |
| UseCase | `BrandPosApp/UseCases/System/DeleteSalesRecordUseCase.cpp` | 매출매입 삭제 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | 삭제 요청 검증 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | 설정 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_DATADEL |
| 리소스 값 | 163 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 52 (버튼 10, 텍스트/라벨 9, 입력 필드 25, 그리드 1, 기타 7) |

### A.2 레거시 UI 요소

**버튼 (10개):** IDC_SERVER_SELLDEL (판매데이터 삭제), IDC_SERVER_SELECTDEL (선택데이터 삭제), IDC_SERVER_EXIT (닫기), IDC_SERVER_ALLDEL (전체데이터 삭제, 숨김), IDC_SERVER_INIT (초기화), IDC_SERVER_SELECTSELLDEL (매출매입 삭제, 숨김), IDC_SERVER_ORDERDEL (주문데이터삭제), IDC_BTN_CARDSETDEL (카드설정 삭제), IDC_BTN_COMPANYDEL (거치장소설정 삭제), IDC_BTN_KIOIMAGEDEL (키오스크 이미지 삭제)

**입력 필드 (25개):** IDC_SERVER_RADIO1~4 (삭제 기간 라디오), IDC_SERVER_CHECK* (다수 체크박스, 대부분 숨김)

**그리드 (1개):** IDC_SERVER_LIST1 (ListBox) - 삭제 로그

**기타 (7개):** IDC_SERVER_MONTHCALENDAR1 (MonthCalendar), GroupBox x6 (섹션 구분)

### A.3 마이그레이션 노트

- 52개 UI 요소 중 25개 체크박스의 대부분(16개)이 숨김 상태. 실제 활성 삭제 옵션만 신규에서 노출.
- 7개 GroupBox는 섹션 구분용이며, 신규에서는 CSS 레이아웃 + 카드/섹션 컴포넌트로 대체.
- 레거시 MonthCalendar(SysMonthCal32)는 신규에서 Calendar 컴포넌트로 대체.
- 이 화면은 MaintenanceScreen 경로에 배치. SetupScreen이 아닌 유지보수 모드 전용.
