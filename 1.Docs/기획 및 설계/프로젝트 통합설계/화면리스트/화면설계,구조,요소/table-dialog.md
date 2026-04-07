# TABLE_DIALOG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `TABLE_DIALOG` |
| 화면 ID | `IDD_TABLE_DIALOG` |
| 원본 파일 | `table-dialog.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 테이블 현황을 그리드 형태로 표시하고, 테이블 선택/결제/기능 실행 등 POS 핵심 업무의 진입점 역할을 하는 메인 운영 화면이다.
- **해결하는 사용자 문제**: 직원이 현재 층의 테이블 상태(빈 테이블, 주문 중, 결제 대기 등)를 한눈에 파악하고, 테이블을 선택하여 주문/결제 흐름으로 진입한다.
- **화면 진입 경로**: MainScreen(RESTAURANT_DIALOG) → 영업 시작 후 자동 전환 또는 테이블 화면 진입
- **화면 종료 경로**: 테이블 선택 → OrderScreen, 닫기(IDCANCEL) → MainScreen
- **관련 운영 주체**: 직원 (홀 서빙, 카운터)

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
| F-001 | 층 선택 (1F/2F/3F) | 1층/2층/3층 버튼으로 해당 층 테이블 그리드를 전환 | 층 버튼 클릭 | P0 |
| F-002 | 층 위/아래 이동 | 화살표 버튼으로 층 이동 | 위/아래 버튼 클릭 | P0 |
| F-003 | 테이블 페이지 이전/다음 | 테이블 수가 한 화면에 넘칠 때 페이지 전환 | 이전/다음 버튼 클릭 | P0 |
| F-004 | 테이블 선택 (그리드 클릭) | 테이블 카드를 클릭하여 해당 테이블 점유/주문 화면 진입 | TableCard 클릭 | P0 |
| F-005 | 현금 결제 | 선택 테이블의 현금 결제 진행 | 현금 버튼 클릭 | P0 |
| F-006 | 카드 결제 | 선택 테이블의 카드 결제 진행 | 카드 버튼 클릭 | P0 |
| F-007 | 현금영수증 발행 | 현금영수증 발행 | 현금영수증 버튼 클릭 | P1 |
| F-008 | 기능 선택 패널 열기 | TABLE_BSELECT 기능 팝업을 여는 토글 | 기능 버튼 클릭 | P0 |
| F-009 | 테이블 기능 버튼 1~6 (동적 할당) | 설정에 따라 라벨/기능이 변하는 동적 기능 버튼 바 | 기능 버튼 클릭 | P0 |
| F-010 | 테이블 기능 버튼 7~8 (숨김/확장) | 확장 기능 버튼 (기본 숨김) | 기능 버튼 클릭 | P2 |
| F-011 | 닫기/취소 | TableScreen 종료, MainScreen 복귀 | 닫기 버튼 클릭 | P0 |
| F-012 | 중간 연결 (POS 간 연결) | 다른 POS 기기와의 연결 상태 표시/제어 | 연결 버튼 클릭 | P1 |
| F-013 | 서버 연결 | 중앙 서버 연결 상태 표시 | 연결 버튼 클릭 | P1 |
| F-014 | 최소화 | POS 화면 최소화 | 최소화 버튼 클릭 | P1 |
| F-015 | 근태 관리 | 직원 출퇴근 기록 | 근태 버튼 클릭 | P1 |
| F-016 | 고객 배달 | 배달 관리 화면 진입 | 배달 버튼 클릭 | P1 |
| F-017 | 직원 설정 | 직원 로그인/전환 | 직원 설정 버튼 클릭 | P1 |
| F-018 | 배달 시작 | 배달 주문 출발 처리 | 배달 시작 버튼 클릭 | P1 |
| F-019 | 배달 완료 | 배달 주문 완료 처리 | 배달 완료 버튼 클릭 | P1 |
| F-020 | 배달 관리 | 배달 주문 목록 관리 | 배달 관리 버튼 클릭 | P1 |
| F-021 | 키오스크 입장하기 | 키오스크 모드 진입 (숨김) | 버튼 클릭 | P2 |
| F-022 | 키오스크 호출 | 키오스크 호출 (숨김) | 버튼 클릭 | P2 |
| F-023 | 확인/완료 | 프로그래밍용 숨김 버튼 | — | P2 |
| F-024 | 날짜 선택 (배달) | 배달 모드 날짜 필터 | 날짜 선택 | P1 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 날짜(IDC_S_DATE), 시간(IDC_S_TIME), 담당자명(IDC_S_PERSON), 중간연결 상태(IDC_T_MIDDLECONNECT), 최소화(IDC_T_MINIMIZE), 근태(IDC_T_DILIGENCE), 고객배달(IDC_T_CUSTDELI), 닫기(IDCANCEL), 매출 요약(건수/합계/현금/카드/기타)
- **본문 영역**: 테이블 그리드(IDC_GRIDCID2) — 층별 테이블 카드 배치, CID 사이드 패널(IDC_GRIDCID) — 고객표시기 정보
- **하단 영역**: 층 선택 버튼(1F/2F/3F, 위/아래), 페이지 이동(이전/다음), 기능 선택(IDC_T_BSELECT), 동적 기능 버튼 바(IDC_T_BTN1~6), 결제 버튼(현금/카드), 배달 관련 버튼(조건부), 상태 표시(IDC_STA_LBSTATE)
- **모달/팝업**: TABLE_BSELECT(기능 선택), TABLEMSG_DLG(테이블 메시지), MENUMOVE(메뉴 이동)
- **사이드 패널**: CID 그리드 (고객표시기 정보, 우측)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TableCard | shared/ui/organisms/TableCard | tableId, status, tableName, orderCount, totalAmount | 테이블 상태 카드 |
| FloorSelector | shared/ui/molecules/FloorSelector | floors, selectedFloor, onSelect | 층 선택 컴포넌트 |
| DynamicFunctionBar | shared/ui/organisms/DynamicFunctionBar | buttons (라벨/액션 배열), onButtonClick | 설정 기반 동적 기능 버튼 바 |
| DateDisplay | shared/ui/atoms/DateDisplay | date | 날짜 표시 |
| TimeDisplay | shared/ui/atoms/TimeDisplay | — | 실시간 시간 표시 |
| StaffBadge | shared/ui/atoms/StaffBadge | staffName | 담당자 표시 |
| StatusBar | shared/ui/molecules/StatusBar | message, type | 하단 상태 표시 |
| DailySummary | shared/ui/organisms/DailySummary | orderCount, salesCount, cashTotal, cardTotal, etcTotal | 일간 매출 요약 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 테이블 목록 | RTK Query 캐시 | tableApi.getTables | 서버 상태 |
| 일간 매출 요약 | RTK Query 캐시 | tableApi.getDailySummary | 서버 상태 |
| CID 정보 | RTK Query 캐시 | tableApi.getActiveCID | 서버 상태 |
| 선택된 층 | uiSlice | Redux slice | UI 상태 |
| 현재 페이지 | uiSlice | Redux slice | UI 상태 |
| 기능 패널 열림 여부 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 매장/POS 설정 | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |
| 하단 상태 메시지 | uiSlice | Redux slice | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| TABLE:CHANGE_FLOOR | `{ floorId: number }` | `{ tables: [{ id, code, name, status, floorId, personCount, totalAmount }], floor: { id, name } }` | `FLOOR_NOT_FOUND` | — (조회) | P0 |
| TABLE:REFRESH | `{ floorId?: number, page?: number }` | `{ tables: [{ id, code, name, status, floorId, personCount, totalAmount }], totalPages: number, currentPage: number }` | — (조회 실패 시 빈 배열) | — (조회) | P0 |
| TABLE:SELECT | `{ tableId: number, floorId: number }` | `{ table: { id, code, name, status, floorId, personCount, firstOrderDate, totalAmount } }` | `TABLE_OCCUPIED`, `TABLE_NOT_FOUND`, `TABLE_ALREADY_SELECTED` | `TABLE:SELECT:{tableId}` | P0 |
| PAYMENT:CASH | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P0 |
| PAYMENT:CARD | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P0 |
| PAYMENT:CASH_RECEIPT | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| SYSTEM:MINIMIZE | `{}` | `{}` | — | — | P1 |
| STAFF:CLOCK_IN_OUT | → handoff: `emp-diligence.md` (StaffScreen 소유) | → handoff | → handoff | → handoff | P1 |
| DELIVERY:MANAGE | → handoff: `custdeli.md` (DeliveryScreen 소유) | → handoff | → handoff | → handoff | P1 |
| DELIVERY:START | → handoff: `custdeli.md` (DeliveryScreen 소유) | → handoff | → handoff | → handoff | P1 |
| DELIVERY:COMPLETE | → handoff: `custdeli.md` (DeliveryScreen 소유) | → handoff | → handoff | → handoff | P1 |
| STAFF:LOGIN | → handoff: `login.md` (LoginScreen 소유) | → handoff | → handoff | → handoff | P1 |
| SYSTEM:GET_CONFIG | `{}` | `{ config: { storeId, posNo, staffName, adjustNo, businessStartTime, lang, version } }` | — | — | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| ChangeFloorUseCase | TABLE:CHANGE_FLOOR | floorId | SQLite TX (조회) | — | TableRow[] | 조회 전용이므로 멱등성/락/Outbox 불필요. 존재하지 않는 층 → FLOOR_NOT_FOUND 에러 |
| RefreshTablesUseCase | TABLE:REFRESH | floorId?, page? | SQLite TX (조회) | — | TableRow[] | 조회 전용이므로 멱등성/락/Outbox 불필요. 항상 성공 (빈 배열 가능) |
| SelectTableUseCase | TABLE:SELECT | tableId, floorId | SQLite TX | TABLE:{tableId} | TableRow | 멱등성: 동일 requestId → 이전 결과 반환 (Ledger 확인). 점유 충돌: 다른 POS가 이미 OCCUPIED → TABLE_OCCUPIED 에러, 롤백. 자기 재선택: 이미 자기가 선택한 테이블 → 성공 (상태 유지). 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 트랜잭션: SQLite TX 내에서 테이블 상태 UPDATE + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 TABLE_STATUS_CHANGED 이벤트 브로드캐스트 |
| ExecutePaymentUseCase | PAYMENT:CASH, PAYMENT:CARD | → handoff: `account-dialog.md` (PaymentScreen 소유) | — | — | — | → handoff: `account-dialog.md` |
| ClockInOutUseCase | STAFF:CLOCK_IN_OUT | → handoff: `emp-diligence.md` (StaffScreen 소유) | — | — | — | → handoff: `emp-diligence.md` |
| StartDeliveryUseCase | DELIVERY:START | → handoff: `custdeli.md` (DeliveryScreen 소유) | — | — | — | → handoff: `custdeli.md` |
| CompleteDeliveryUseCase | DELIVERY:COMPLETE | → handoff: `custdeli.md` (DeliveryScreen 소유) | — | — | — | → handoff: `custdeli.md` |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| TableManager | 테이블 점유/해제/층별 조회 규칙 | Domain/Table/TableManager | |
| SaleMgr | 결제 처리 (현금/카드/현금영수증) | Domain/Payment/SaleMgr | |
| OrderMgr | 배달 주문 시작/완료 | Domain/Order/OrderMgr | |
| StaffMgr | 직원 출퇴근/로그인 | Domain/Staff/StaffMgr | |
| SystemMgr | 시스템 설정 조회 | Domain/System/SystemMgr | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Table/TableCrud | 테이블 CRUD | UseCase → Manager → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Payment/SellSlipCrud, SellDetailCrud | 결제 데이터 | UseCase → SaleMgr → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Order/OrderSlipCrud | 배달 주문 데이터 | UseCase → OrderMgr → Crud → SQLite | 로컬 원본 |
| Outbox | 테이블/결제/주문 상태 변경 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 다른 화면/POS 갱신 | UseCase 커밋 후 → PosRealTimeSender → UI | |
| CentralApi | 테이블 상태 동기화 | 테이블 점유/해제 → Outbox → Sync Worker → CentralApi `mutation syncTableStatus` | 조회 전용(ChangeFloor, Refresh)은 Sync 대상 아님. SELECT만 Outbox 적재 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/table.json` | msgKey 기반 |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 테이블 선택, 층 이동, 페이지 전환. 결제 버튼은 PaymentScreen으로 handoff되므로 이 화면에서는 권한 검사 불필요 | 배달/근태/직원설정은 각 소유 화면에서 권한 검사 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 층 선택 시 테이블 목록 갱신 | TableScreen + tableApi | 선택 층의 테이블만 표시 | integration |
| 테이블 선택 시 상태 변경 | TableScreen + tableApi | 선택 후 OCCUPIED 상태 | integration |
| 페이지 전환 | TableScreen | 다음 페이지 테이블 표시 | unit |
| 동적 기능 버튼 렌더링 | DynamicFunctionBar | 설정에 따라 라벨/액션 변경 | unit |
| 결제 버튼 → PaymentScreen 전환 | TableScreen | 결제 버튼 클릭 시 React 라우팅으로 PaymentScreen 전환 | integration |
| PosRealTime 이벤트 수신 시 테이블 갱신 | TableScreen + PosRealTimeReceiver | 외부 변경만 반영, 자기 요청 무시 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/TableScreen)
- [ ] Bridge 계약 구현 완료
- [ ] UseCase 연동 완료 (SelectTable, ChangeFloor, RefreshTables)
- [ ] RTK Query 엔드포인트 구현 완료 (tableApi.getTables, getDailySummary, getActiveCID)
- [ ] PosRealTime 이벤트 연동 완료
- [ ] 동적 기능 버튼 바 구현 완료
- [ ] 결제 버튼 → PaymentScreen 라우팅 연동
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/TableScreen/index.tsx` | TODO |
| RTK Query endpoint (테이블) | `BrandPosApp/PosUi/src/store/api/tableApi.ts` | TODO |
| RTK Query endpoint (매출요약) | `BrandPosApp/PosUi/src/store/api/tableApi.ts` (getDailySummary) | TODO |
| Bridge command (테이블) | `BrandPosApp/PosUi/src/bridge/commands/table.ts` | TODO |
| TableCard 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/TableCard.tsx` | TODO |
| FloorSelector 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/FloorSelector.tsx` | TODO |
| DynamicFunctionBar 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DynamicFunctionBar.tsx` | TODO |
| DailySummary 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DailySummary.tsx` | TODO |
| StatusBar 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/StatusBar.tsx` | TODO |
| DateDisplay / TimeDisplay 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/DateDisplay.tsx`, `TimeDisplay.tsx` | TODO |
| StaffBadge 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/StaffBadge.tsx` | TODO |
| uiSlice (층/페이지 상태) | `BrandPosApp/PosUi/src/store/slices/uiSlice.ts` | TODO |
| PosRealTimeReceiver 연동 | `BrandPosApp/PosUi/src/providers/PosRealTimeReceiver.ts` | TODO |
| C++ PosRequestActions/Table | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.cpp` | TODO |
| C++ SelectTableUseCase | `BrandPosApp/UseCases/Table/SelectTableUseCase.cpp` | TODO |
| C++ ChangeFloorUseCase | `BrandPosApp/UseCases/Table/ChangeFloorUseCase.cpp` | TODO |
| C++ RefreshTablesUseCase | `BrandPosApp/UseCases/Table/RefreshTablesUseCase.cpp` | TODO |
| C++ TableManager | `BrandPosApp/Domain/Table/TableManager.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_TABLE_DIALOG |
| 리소스 값 | 144 |
| 크기 (DLU) | 528 x 394 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 52 |

### 버튼 (34개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_T_1F | T_1F | (226,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 1층 선택 버튼 |
| IDC_T_2F | T_2F | (258,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 2층 선택 버튼 |
| IDC_T_3F | T_3F | (290,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 3층 선택 버튼 |
| IDC_T_DOWN | 아래층 | (322,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 아래층 이동 버튼 |
| IDC_T_UP | 위층 | (354,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 위층 이동 버튼 |
| IDC_T_BACK | 이전 | (443,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 이전 페이지 버튼 |
| IDC_T_NEXT | 다음 | (475,305) | 29 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 다음 페이지 버튼 |
| IDC_T_CASH | 현금 | (9,322) | 46 x 21 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 현금 결제 버튼 |
| IDC_T_CASHBILL | 현금영수증(X) | (62,322) | 46 x 21 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 현금영수증 버튼 |
| IDC_T_CARD | 카드(X) | (62,350) | 46 x 21 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 카드 결제 버튼 |
| IDC_T_TEMPSIGN | 카드 | (9,350) | 46 x 21 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 카드 결제 버튼 |
| IDC_T_BSELECT | 기능 | (119,307) | 36 x 28 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 선택 버튼 |
| IDC_T_BTN1 | 1 | (119,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN2 | 2 | (184,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN3 | 3 | (249,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN4 | 4 | (314,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN5 | 5 | (379,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN6 | 6 | (444,341) | 61 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블 기능 버튼 |
| IDCANCEL | 닫기 | (454,10) | 40 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_T_MIDDLECONNECT |  | (11,6) | 77 x 17 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 중간 연결 버튼 |
| IDC_T_SERVERCONNECT | 서버연결 | (478,381) | 29 x 13 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 서버 연결 버튼 |
| IDOK | IDOK | (506,381) | 22 x 13 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 확인/완료 버튼 |
| IDC_T_MINIMIZE |  | (105,11) | 22 x 22 | FALSE |  | 최소화 버튼 |
| IDC_T_DILIGENCE |  | (200,10) | 22 x 22 | FALSE |  | 근태 관리 버튼 |
| IDC_T_CUSTDELI |  | (273,11) | 22 x 22 | FALSE |  | 고객 배달 버튼 |
| IDC_T_TESTBTN | 테스트버튼 | (437,381) | 41 x 13 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 테스트 버튼 |
| IDC_T_EMPSET | 직원설정 | (9,322) | 50 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 직원 설정 버튼 |
| IDC_T_DELISTART | 배달시작 | (62,322) | 50 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 배달 시작 버튼 |
| IDC_T_DELICOMP | 배달미수 | (9,350) | 50 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 배달 완료 버튼 |
| IDC_T_CUSTDELI2 | 배달관리 | (62,350) | 50 x 25 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 배달 관리 버튼 |
| IDC_BTN_KIZ_ENTER | 입장하기 | (0,383) | 33 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 키오스크 입장 버튼 |
| IDC_BTN_KIZ_CALL | 호출하기 | (33,383) | 33 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 키오스크 호출 버튼 |
| IDC_T_BTN7 | 7 | (340,380) | 42 x 14 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 테이블 기능 버튼 |
| IDC_T_BTN8 | 8 | (382,380) | 42 x 14 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_TABSTOP | 테이블 기능 버튼 |

### 텍스트/라벨 (15개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_S_DATE | DATE | (128,9) | 71 x 14 | FALSE | 가운데 | 날짜 표시 |
| IDC_S_TIME | TIME | (128,24) | 71 x 11 | FALSE | 가운데 | 시간 표시 |
| IDC_S_PERSON | PERSON | (224,15) | 44 x 14 | FALSE | 가운데 | 담당자 표시 |
| IDC_S_FLOOR | FLOOR | (175,312) | 45 x 14 | FALSE | 가운데 | 층 표시 |
| IDC_S_PAGE | PAGE | (396,312) | 37 x 14 | FALSE | 가운데 | 페이지 표시 |
| IDC_S_COUNT | 0 | (324,19) | 26 x 8 | FALSE | 가운데 | 건수 표시 |
| IDC_S_ORCOUNT | 0 | (324,10) | 26 x 8 | FALSE | 가운데 | 주문 건수 표시 |
| IDC_S_SUMRECEIVE | 0 | (364,19) | 36 x 8 | FALSE | 오른쪽 | 수납 합계 표시 |
| IDC_S_SUMORDER | 0 | (364,10) | 36 x 8 | FALSE | 오른쪽 | 주문 합계 표시 |
| IDC_S_SUMCASH | 0 | (314,27) | 36 x 8 | FALSE | 오른쪽 | 현금 합계 표시 |
| IDC_S_SUMCARD | 0 | (364,27) | 36 x 8 | FALSE | 오른쪽 | 카드 합계 표시 |
| IDC_S_SUMETC | 0 | (414,27) | 32 x 8 | FALSE | 오른쪽 | 기타 합계 표시 |
| IDC_S_SUMSUM | 0 | (488,119) | 32 x 8 | **TRUE** | 오른쪽 | 총 합계 표시 |
| IDC_S_HIDE |  | (301,11) | 145 x 24 | FALSE | 가운데 | 숨김 영역 |
| IDC_STA_LBSTATE | 상태표시 | (11,308) | 98 x 11 | FALSE | 가운데 | 상태 표시 |

### 입력 필드 (1개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_DTP_DELIDATE | SysDateTimePick32 | (59,34) | 6 x 6 | FALSE | DTS_RIGHTALIGN \| WS_TABSTOP | 날짜 선택 컨트롤 |

### 그리드/리스트 (2개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_GRIDCID | MFCGridCtrl | (386,40) | 124 x 254 | FALSE | CID 그리드 |
| IDC_GRIDCID2 | MFCGridCtrl | (2,40) | 380 x 254 | FALSE | 테이블 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 34 |
| 텍스트/라벨 | 15 |
| 입력 필드 | 1 |
| 그리드/리스트 | 2 |
| 기타 | 0 |
| **합계** | **52** |

### 마이그레이션 노트 (원본)

- 테이블 그리드(IDC_GRIDCID2)는 MFCGridCtrl에서 React 기반 TableCard 그리드로 전환한다. `shared/ui/organisms/TableCard`를 재사용한다.
- CID 그리드(IDC_GRIDCID)는 고객 표시기 정보를 보여주는 사이드 패널로, 별도 organisms 컴포넌트로 분리한다.
- 층 선택(1F/2F/3F)과 위/아래 이동은 하나의 FloorSelector 컴포넌트로 통합한다.
- 결제 버튼(현금/카드/현금영수증)은 TableScreen에서 직접 처리하지 않고, PaymentScreen으로 화면 전환 후 처리하는 방식으로 변경을 검토한다.
- 배달 관련 버튼(IDC_T_DELISTART, IDC_T_DELICOMP, IDC_T_CUSTDELI2)은 배달 모드에서만 표시되는 조건부 UI로 구현한다.
- 키오스크 버튼(IDC_BTN_KIZ_ENTER, IDC_BTN_KIZ_CALL)은 숨김 상태이며 키오스크 모드 설정 시에만 활성화한다.
- 동적 기능 버튼(IDC_T_BTN1~8)은 설정에 따라 라벨/기능이 변경되므로, 설정 기반 동적 버튼 바 컴포넌트로 구현한다.
- 일간 매출 요약(건수, 합계)은 RTK Query의 `tableApi.getDailySummary` 엔드포인트로 통합 조회한다.
- 숨김/비활성 버튼(IDOK, IDC_T_TESTBTN, IDC_T_SERVERCONNECT)은 개발/디버그 용도이므로 신규 UI에서는 제거하거나 개발 모드 전용으로 분리한다.

## 9. 작업 진행 기록

| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동, RTK Query 연동, PosRealTime 이벤트 연동, i18n | TableScreen shell 구현 완료. FloorSelector 연동, 층 위/아래 이동, 페이지 이전/다음, 테이블 그리드(TableCard with isSelected), CID 사이드 패널, 일간 매출 요약(DailySummary), 동적 기능 버튼 바 6개, 결제 버튼(현금/카드/현금영수증), 기능 선택 토글(TableBtnSelectDialog), 테이블 메시지 모달(TableMessageDialog), 상태 표시 바, 날짜/시간 표시, 담당자명, 중간연결 상태, 최소화/근태/배달 버튼, Processing Overlay 구현. |
