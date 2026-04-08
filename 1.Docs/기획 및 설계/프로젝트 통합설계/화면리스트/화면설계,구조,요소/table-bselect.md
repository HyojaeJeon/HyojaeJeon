# TABLE_BSELECT 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `TABLE_BSELECT` |
| 화면 ID | `IDD_TABLE_BSELECT` |
| 원본 파일 | `table-bselect.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 테이블 화면에서 "기능" 버튼을 눌렀을 때 열리는 기능 선택 팝업으로, 테이블 이동/합석/포장/외상/예약/정산 등 다양한 업무 기능의 진입점 역할을 한다.
- **해결하는 사용자 문제**: 직원이 현재 선택된 테이블에 대해 이동, 합석, 포장, 결제, 리포트 등 다양한 부가 기능을 선택하여 실행한다.
- **화면 진입 경로**: TableScreen(TABLE_DIALOG) → 기능 버튼(IDC_T_BSELECT) 클릭
- **화면 종료 경로**: 닫기(IDCANCEL) → TableScreen, 기능 선택 → 해당 모달/화면으로 전환
- **관련 운영 주체**: 직원 (홀 서빙, 카운터, 관리자)

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
| F-001 | 닫기/취소 | 기능 패널 닫기, TableScreen 복귀 | 닫기 버튼 클릭 | P0 |
| F-002 | 테이블 이동 | 선택 테이블의 주문을 다른 테이블로 이동 | 이동 버튼 클릭 | P0 |
| F-003 | 주문서 재전송 | 주문서를 주방 프린터에 재전송 | 주문서재전송 버튼 클릭 | P1 |
| F-004 | 빌지출력 (영수증 미리보기) | 영수증 미리보기/출력 | 빌지출력 버튼 클릭 | P1 |
| F-005 | 합석 (테이블 합치기) | 여러 테이블을 하나로 합침 | 합석 버튼 클릭 | P0 |
| F-006 | 예약 | 테이블 예약 설정 | 예약 버튼 클릭 | P1 |
| F-007 | 외상매출 | 외상 결제 처리 | 외상매출 버튼 클릭 | P1 |
| F-008 | 선불금내역 | 선불금 내역 조회 | 선불금내역 버튼 클릭 | P2 |
| F-009 | 매출참고 | 매출 참고 데이터 조회 | 매출참고 버튼 클릭 | P1 |
| F-010 | 서랍열기 (금전함) | 금전함 서랍 열기 | 서랍열기 버튼 클릭 | P1 |
| F-011 | 포장 (Take Out) | 포장 테이블 선택/주문 | TAKE OUT 버튼 클릭 | P0 |
| F-012 | 배달복사 | 배달 주문 복사/관리 | 배달복사 버튼 클릭 | P1 |
| F-013 | 선수금 (선불 수납) | 선불 수납 처리 | 선수금 버튼 클릭 | P2 |
| F-014 | 테이블 메시지 | 테이블에 메시지 설정 (TABLEMSG_DLG 열기) | 테이블메시지 버튼 클릭 | P1 |
| F-015 | 삭제 | 설정 기반 동적 버튼 설정 삭제 | 삭제 버튼 클릭 | P1 |
| F-016 | 초기화 | 동적 버튼 바 설정 초기화 | 초기화 버튼 클릭 | P1 |
| F-017 | 저장 | 동적 버튼 바 설정 저장 | 저장 버튼 클릭 | P1 |
| F-018 | 간이영수증 | 간이영수증 출력 | 간이영수증 버튼 클릭 | P1 |
| F-019 | 판매현황 | 판매 현황 조회 | 판매현황 버튼 클릭 | P1 |
| F-020 | 일표 (일일 매출표) | 일일 매출표 출력 | 일표 버튼 클릭 | P1 |
| F-021 | 주문상품내역 | 주문된 상품 내역 조회 | 주문상품내역 버튼 클릭 | P1 |
| F-022 | 정산 | 일일 정산 처리 | 정산 버튼 클릭 | P1 |
| F-023 | 일표 초기화 | 일표 데이터 초기화 | 일표초기화 버튼 클릭 | P2 |
| F-024 | 영수증 재발행 | 영수증 재발행 | 영수증재발행 버튼 클릭 | P1 |
| F-025 | 카카오톡 알림톡 호출 | 카카오 알림톡 발송 | 알림톡호출 버튼 클릭 | P2 |
| F-026 | 주문 처리 완료 | 주문 처리 완료 상태 전환 | 주문처리완료 버튼 클릭 | P0 |
| F-027 | 언어 선택 (KR/EN/VN) | UI 언어 변경 | 언어 버튼 클릭 | P1 |
| F-028 | 하단 기능 버튼 1~8 (동적 할당) | 설정 기반 동적 기능 버튼 설정 | 기능 버튼 클릭 | P0 |
| F-029 | 입출금 | 입출금 관리 (숨김) | 입출금 버튼 클릭 | P1 |
| F-030 | 숨김 기능 (29~48) | 매장/국가 설정에 따라 조건부 표시되는 기능들 | 설정 기반 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 닫기 버튼(IDCANCEL), 언어 선택(KR/EN/VN)
- **본문 영역**: 기능 버튼 그리드 (3~4열 x 6~7행) — 이동, 합석, 예약, 외상, 포장, 정산, 영수증, 리포트 등 업무 기능 버튼 배치. 숨김/활성 상태는 매장 설정/국가 설정/INI feature flag 기반.
- **하단 영역**: 동적 기능 버튼 바(IDC_BTN1~8), 삭제/초기화/저장 버튼 (동적 버튼 바 설정용)
- **모달/팝업**: 각 기능 버튼 클릭 시 해당 모달 또는 화면으로 전환
- **사이드 패널**: 없음

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| DynamicFunctionBar | shared/ui/organisms/DynamicFunctionBar | buttons (라벨/액션 배열), onButtonClick | TABLE_DIALOG와 동일 컴포넌트 재사용 |
| LanguageSelector | shared/ui/molecules/LanguageSelector | currentLang, onSelect | RESTAURANT_DIALOG와 동일 컴포넌트 재사용 |
| FunctionMenu | shared/ui/organisms/FunctionMenu | menuItems (라벨/액션/visible 배열), onSelect | 기능 버튼 그리드 — 설정 기반 동적 표시 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 기능 메뉴 항목 목록 | RTK Query 캐시 | systemApi.getConfig (동적 버튼 설정) | 서버 상태 |
| 현재 언어 | RTK Query 캐시 | systemApi.getConfig | 서버 상태 |
| 동적 버튼 바 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 선택된 테이블 정보 | RTK Query 캐시 | tableApi.getTableDetail | 부모에서 전달 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| TABLE:MOVE | `{ sourceTableId: number, targetTableId: number, items: [{ orderItemId: number, qty: number }] }` | `{ sourceTable: { id, code, name, status, floorId, personCount, totalAmount }, targetTable: { id, code, name, status, floorId, personCount, totalAmount } }` | `TARGET_TABLE_OCCUPIED`, `SOURCE_TABLE_EMPTY`, `SAME_TABLE`, `TABLE_NOT_FOUND` | `TABLE:MOVE:{sourceTableId}:{targetTableId}` | P0 |
| TABLE:MERGE | `{ sourceTableId: number, targetTableId: number }` | `{ mergedTable: { id, code, name, status, floorId, personCount, totalAmount } }` | `TARGET_TABLE_EMPTY`, `SOURCE_TABLE_EMPTY`, `SAME_TABLE`, `TABLE_NOT_FOUND` | `TABLE:MERGE:{sourceTableId}:{targetTableId}` | P0 |
| TABLE:SELECT (포장) | `{ tableId: number, floorId: number }` | `{ table: { id, code, name, status, floorId, personCount, firstOrderDate, totalAmount } }` | `TABLE_OCCUPIED`, `TABLE_NOT_FOUND`, `TABLE_ALREADY_SELECTED` | `TABLE:SELECT:{tableId}` | P0 (포장 테이블) |
| TABLE:SET_RESERVATION | TODO: 예약 설계 미확정 — 확인 필요: 예약 데이터 구조, 예약 상태 전이 규칙 | TODO | TODO | TODO | P1 |
| TABLE:SET_MESSAGE | `{ tableId: number, message: string }` | `{ table: { id, message } }` | `TABLE_NOT_FOUND` | `TABLE:SET_MESSAGE:{tableId}` | P1 |
| TABLE:REFRESH | `{ floorId?: number, page?: number }` | `{ tables: [{ id, code, name, status, floorId, personCount, totalAmount }], totalPages: number, currentPage: number }` | — (조회 실패 시 빈 배열) | — (조회) | P1 |
| ORDER:PRINT | `{ orderId: number, printTarget: string }` | `{ success: boolean }` | `ORDER_NOT_FOUND`, `PRINTER_ERROR` | — (장치 I/O, 멱등성 불필요) | P1 |
| ORDER:COMPLETE | `{ orderId: number }` | `{ order: { id, status, completedAt } }` | `ORDER_NOT_FOUND`, `ORDER_ALREADY_COMPLETED`, `ORDER_EMPTY` | `ORDER:COMPLETE:{orderId}` | P0 |
| PAYMENT:CREDIT | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| PAYMENT:PRINT_BILL | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| PAYMENT:PRINT_SIMPLE | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| PAYMENT:REPRINT | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| PAYMENT:SETTLE | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P1 |
| PAYMENT:PREPAID | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P2 |
| PAYMENT:PREPAID_LIST | → handoff: `account-dialog.md` (PaymentScreen 소유) | → handoff | → handoff | → handoff | P2 |
| SYSTEM:OPEN_DRAWER | `{}` | `{}` | `DEVICE_NOT_FOUND`, `DRAWER_OPEN_FAILED` | — (장치 I/O, 멱등성 불필요) | P1 |
| SYSTEM:SET_LANG | `{ lang: string }` | `{ config: { lang } }` | — | — | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| MoveTableUseCase | TABLE:MOVE | sourceTableId, targetTableId, items | SQLite TX | TABLE:{sourceTableId}, TABLE:{targetTableId} | TableRow, TableRow | 멱등성: 동일 requestId → 이전 결과 반환. 대상 테이블 점유 → TARGET_TABLE_OCCUPIED 에러. 원본 테이블 비어있음 → SOURCE_TABLE_EMPTY 에러. 동일 테이블 → SAME_TABLE 에러. 트랜잭션: 원본 OrderSlip의 tableId를 대상으로 UPDATE + 양쪽 테이블 상태 UPDATE + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 TABLE_MOVED 이벤트 |
| MergeTableUseCase | TABLE:MERGE | sourceTableId, targetTableId | SQLite TX | TABLE:{sourceTableId}, TABLE:{targetTableId} | TableRow | 멱등성: 동일 requestId → 이전 결과 반환. 원본/대상 비어있음 → SOURCE_TABLE_EMPTY / TARGET_TABLE_EMPTY 에러. 동일 테이블 → SAME_TABLE 에러. 트랜잭션: 원본 OrderSlip/OrderItem을 대상으로 이관 + 원본 테이블 EMPTY로 전환 + Ledger INSERT + Outbox INSERT. 커밋 후: PosRealTimeSender로 TABLE_MERGED 이벤트 |
| CompleteOrderUseCase | ORDER:COMPLETE | orderId | SQLite TX | ORDER:{orderId} | OrderSlipRow | 멱등성: 동일 requestId → 이전 결과 반환. 주문 없음 → ORDER_NOT_FOUND 에러. 이미 완료 → ORDER_ALREADY_COMPLETED (성공 반환). 빈 주문 → ORDER_EMPTY 에러. 트랜잭션: OrderSlip 상태 COMPLETED로 UPDATE + Ledger INSERT + Outbox INSERT. 커밋 후: PosRealTimeSender로 ORDER_COMPLETED 이벤트 |
| ExecutePaymentUseCase | PAYMENT:CREDIT | → handoff: `account-dialog.md` (PaymentScreen 소유) | — | — | — | → handoff: `account-dialog.md` |
| SelectTableUseCase | TABLE:SELECT (포장) | tableId, floorId | SQLite TX | TABLE:{tableId} | TableRow | 멱등성: 동일 requestId → 이전 결과 반환 (Ledger 확인). 점유 충돌: 다른 POS가 이미 OCCUPIED → TABLE_OCCUPIED 에러, 롤백. 자기 재선택: 성공 (상태 유지). 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 트랜잭션: 테이블 상태 UPDATE + Ledger INSERT + Outbox INSERT. 커밋 후: PosRealTimeSender로 TABLE_STATUS_CHANGED 이벤트 |
| UpdateConfigUseCase | SYSTEM:SET_LANG | lang | SQLite TX | — | ConfigRow | 조회/설정 변경이므로 멱등성 불필요. 트랜잭션: ConfigRow UPDATE. 커밋 후: PosRealTimeSender로 CONFIG_CHANGED 이벤트 |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| TableManager | 테이블 이동/합석/예약/메시지 규칙 | Domain/Table/TableManager | |
| OrderMgr | 주문서 재전송/주문 완료/주문상품 조회 | Domain/Order/OrderMgr | |
| SaleMgr | 외상/선불/정산/영수증 규칙 | Domain/Payment/SaleMgr | |
| AccountingMgr | 일표/판매현황/입출금 | Domain/Accounting/AccountingMgr | |
| SystemMgr | 언어 설정/금전함/시스템 설정 | Domain/System/SystemMgr | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Table/TableCrud | 테이블 이동/합석/예약/메시지 | UseCase → Manager → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Order/OrderSlipCrud, OrderItemCrud | 주문 데이터 | UseCase → OrderMgr → Crud → SQLite | 로컬 원본 |
| SQLite Tables/Payment/SellSlipCrud | 결제/외상/선불 데이터 | UseCase → SaleMgr → Crud → SQLite | 로컬 원본 |
| Device/Printer | 영수증/주문서/일표 출력 | UseCase 커밋 후 → 비동기 출력 | 장치 I/O |
| Outbox | 상태 변경 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 다른 화면/POS 갱신 | UseCase 커밋 후 → PosRealTimeSender → UI | |
| ExternalBridge/Kakao | 알림톡 발송 | TODO: 카카오 알림톡 연동 상세 미정 — 확인 필요: API 계약, 발송 조건 | P2 |
| CentralApi | 테이블 이동/합석/주문완료 동기화 | 테이블 상태 변경 → Outbox → Sync Worker → CentralApi `mutation syncTableStatus`. 주문 완료 → Outbox → CentralApi `mutation syncOrderStatus`. 조회 전용(Refresh)은 Sync 대상 아님 | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/table.json`, `payment.json`, `order.json` | msgKey 기반 |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 테이블 이동, 포장, 테이블 메시지, 주문서 재전송, 주문 처리 완료, 언어 전환. 관리자 또는 권한 보유 직원: 합석, 정산, 일표 초기화, 동적 버튼 바 삭제/저장, 외상매출. 결제/정산 관련 → handoff: account-dialog.md에서 권한 검사 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 테이블 이동 후 양쪽 테이블 상태 갱신 | TableScreen + MoveTableModal | 원본 빈 테이블, 대상 점유 | integration |
| 테이블 합석 후 합산 데이터 정합성 | TableScreen + MergeTableModal | 합석 테이블 주문 합산 | integration |
| 포장 선택 시 포장 테이블 생성 | TableScreen | 포장 테이블 OCCUPIED | integration |
| 숨김 기능 설정 기반 표시/숨김 | FunctionMenu | 설정에 따라 버튼 visible 변경 | unit |
| 언어 전환 | LanguageSelector | UI 텍스트 변경 | integration |
| 동적 버튼 바 설정 저장 | DynamicFunctionBar | 설정 저장 후 버튼 라벨/액션 변경 | integration |
| 결제 관련 기능 → PaymentScreen 전환 | FunctionMenu | 결제 관련 버튼 클릭 시 React 라우팅으로 PaymentScreen 전환 | integration |

## 7. 완료 기준

- [ ] 기능 메뉴 UI 구현 완료 (FunctionMenu 또는 사이드 패널)
- [ ] P0 기능 (이동/합석/포장/주문완료) Bridge 계약 구현 완료
- [ ] P0 UseCase 연동 완료 (MoveTable, MergeTable, CompleteOrder)
- [ ] 결제 관련 기능 → PaymentScreen 라우팅 완료
- [ ] 주문 관련 기능 → OrderScreen 라우팅 완료
- [ ] 동적 버튼 바 설정 저장/초기화 구현 완료
- [ ] 언어 선택 공용 컴포넌트 연동 완료
- [ ] 숨김 기능 INI feature flag 기반 동적 표시 구현 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| FunctionMenu 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/FunctionMenu.tsx` | TODO |
| LanguageSelector 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/LanguageSelector.tsx` | TODO |
| DynamicFunctionBar 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DynamicFunctionBar.tsx` | TODO (TABLE_DIALOG과 공유) |
| TableScreen 기능 패널 통합 | `BrandPosApp/PosUi/src/screens/TableScreen/components/FunctionPanel.tsx` | TODO |
| MoveTableModal | `BrandPosApp/PosUi/src/screens/TableScreen/components/MoveTableModal.tsx` | TODO |
| MergeTableModal | `BrandPosApp/PosUi/src/screens/TableScreen/components/MergeTableModal.tsx` | TODO |
| ReservationModal | `BrandPosApp/PosUi/src/screens/TableScreen/components/ReservationModal.tsx` | TODO |
| Bridge command (테이블 이동/합석) | `BrandPosApp/PosUi/src/bridge/commands/table.ts` | TODO |
| Bridge command (주문) | `BrandPosApp/PosUi/src/bridge/commands/order.ts` | TODO |
| Bridge command (결제) | `BrandPosApp/PosUi/src/bridge/commands/payment.ts` | TODO |
| Bridge command (시스템) | `BrandPosApp/PosUi/src/bridge/commands/system.ts` | TODO |
| RTK Query endpoint (시스템 설정) | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| C++ MoveTableUseCase | `BrandPosApp/UseCases/Table/MoveTableUseCase.cpp` | TODO |
| C++ MergeTableUseCase | `BrandPosApp/UseCases/Table/MergeTableUseCase.cpp` | TODO |
| C++ CompleteOrderUseCase | `BrandPosApp/UseCases/Order/CompleteOrderUseCase.cpp` | TODO |
| C++ PosRequestActions/Table (이동/합석) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_TABLE_BSELECT |
| 리소스 값 | 417 |
| 크기 (DLU) | 441 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x1 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 58 |

### 버튼 (58개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDOK | OK | (155,7) | 50 x 14 | **TRUE** | NOT WS_VISIBLE \| WS_DISABLED | 확인/완료 버튼 |
| IDCANCEL | 닫기 | (375,11) | 50 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |
| IDC_BTN1 | 1 | (11,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP \| WS_EX_TRANSPARENT | 기능 버튼 |
| IDC_BTN2 | 2 | (63,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_BTN3 | 3 | (115,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_BTN4 | 4 | (167,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_BTN5 | 5 | (219,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_REDRAW | 초기화 | (264,214) | 55 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 초기화 버튼 |
| IDC_SAVE | 저장 | (322,214) | 55 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 저장 버튼 |
| IDC_ORDER | 주문 | (7,7) | 26 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 주문 버튼 |
| IDC_ACCOUNT | 입출금 | (12,49) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 입출금 버튼 |
| IDC_MOVE | 이동 | (82,49) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 이동 버튼 |
| IDC_RESEND | 주문서재전송 | (152,49) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문서재전송 버튼 |
| IDC_BILL | 빌지출력 | (222,49) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 빌지출력 버튼 |
| IDC_GROUP | 합석 | (292,49) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 합석 버튼 |
| IDC_APPOINTMENT | 예약 | (82,72) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 예약 버튼 |
| IDC_TICK | 외상매출 | (152,72) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 외상매출 버튼 |
| IDC_BREAKDOWN | 선불금내역 | (222,72) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선불금내역 버튼 |
| IDC_REFERENCE | 매출참고 | (12,72) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 매출참고 버튼 |
| IDC_MONEYBOX | 서랍열기 | (12,95) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 서랍열기 버튼 |
| IDC_BTN6 | 6 | (271,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_TAKEOUT | TAKE OUT | (82,95) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | TAKE OUT 버튼 |
| IDC_DELIVERY | 배달복사 | (292,141) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 배달복사 버튼 |
| IDC_FIRSTRECEIVED | 선수금입금 | (222,95) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 선수금입금 버튼 |
| IDC_GETHOLD | 선수금 | (152,95) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 선수금 버튼 |
| IDC_TABLEMSG | 테이블메시지 | (362,49) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 테이블메시지 버튼 |
| IDC_DEL | 삭제 | (206,214) | 55 x 24 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 삭제 버튼 |
| IDC_SIMPLERECEIPT | 간이영수증 | (362,95) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 간이영수증 버튼 |
| IDC_CAMERA | 카메라보기 | (34,7) | 42 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 카메라보기 버튼 |
| IDC_JANGBU | 장부내역 | (292,72) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 장부내역 버튼 |
| IDC_SELLLIST | 판매현황 | (12,164) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 판매현황 버튼 |
| IDC_PRINTOUT | 일표 | (222,118) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 일표 버튼 |
| IDC_ORDERITEM | 주문상품내역 | (82,141) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문상품내역 버튼 |
| IDC_MONEYBOX2 | 환전 | (12,189) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 환전 버튼 |
| IDC_PRINTPARKING | 주차권 | (362,118) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 주차권 버튼 |
| IDC_CHECKOUT | 정산 | (152,118) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 정산 버튼 |
| IDC_PRINTOUT2 | 일표 초기화 | (292,118) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 일표 초기화 버튼 |
| IDC_CUSTITEMSELL | 기간상품매출 | (12,141) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 기간상품매출 버튼 |
| IDC_BTN_GIFTMGR | 상품권현황 | (82,118) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 상품권현황 버튼 |
| IDC_DELIAGENCY | (배달앱)관리 | (222,141) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | (배달앱)관리 버튼 |
| IDC_REPRINT | 영수증재발행 | (292,95) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 영수증재발행 버튼 |
| IDC_CUSTSEARCH | 테이블검색 | (362,72) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 테이블검색 버튼 |
| IDC_BTN_STOCKSER | 재고조회 | (152,141) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 재고조회 버튼 |
| IDC_CALLTABLE | 호출 | (77,7) | 27 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 호출 버튼 |
| IDC_COSMOREFUND | 1회용컵 회수 | (105,7) | 49 x 11 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 1회용컵 회수 버튼 |
| IDC_BTN_EMPCALL | 직원호출내역 | (152,164) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 직원호출내역 버튼 |
| IDC_BTN_TORD_SOLDOUT | 테이블오더 품절관리 | (222,164) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 테이블오더 품절관리 버튼 |
| IDC_BTN_TORD_MANGR | 테이블오더 현황관리 | (292,164) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 테이블오더 현황관리 버튼 |
| IDC_BTN_WAITINGCALL | 대기손님호출 | (82,164) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 대기손님호출 버튼 |
| IDC_KAKAOTALK | 알림톡호출 | (362,141) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 알림톡호출 버튼 |
| IDC_BTN_TABLEORLIST | 외부주문 수동접수 | (362,189) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 외부주문 수동접수 버튼 |
| IDC_BTN7 | 7 | (329,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_BTN8 | 8 | (381,251) | 50 x 35 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 기능 버튼 |
| IDC_BTN_KR | KR | (265,14) | 30 x 15 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 한국어 선택 버튼 |
| IDC_BTN_EN | EN | (296,14) | 30 x 15 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 영어 선택 버튼 |
| IDC_BTN_VN | VN | (327,14) | 30 x 15 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 베트남어 선택 버튼 |
| IDC_ORDER_FULFILLED | 주문 처리 완료 | (362,164) | 61 x 20 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 주문 처리 완료 버튼 |
| IDC_ACCOUNT_VN | 자세한입출금 | (12,118) | 61 x 20 | **TRUE** | BS_OWNERDRAW \| NOT WS_VISIBLE \| WS_DISABLED \| WS_TABSTOP | 자세한입출금 버튼 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 58 |
| 텍스트/라벨 | 0 |
| 입력 필드 | 0 |
| 그리드/리스트 | 0 |
| 기타 | 0 |
| **합계** | **58** |

### 마이그레이션 노트 (원본)

- TABLE_BSELECT는 테이블 화면의 "기능 선택" 팝업으로, 58개 버튼 중 약 20개가 숨김/비활성 상태이다. 신규 UI에서는 활성 기능만 노출하는 컨텍스트 메뉴 또는 사이드 패널로 통합한다.
- 숨김 버튼(IDC_ORDER, IDC_CAMERA, IDC_JANGBU, IDC_CUSTSEARCH 등)은 매장 설정/국가 설정에 따라 조건부 표시되는 기능이다. INI feature flag 또는 시스템 설정 기반으로 동적 표시를 구현한다.
- 결제 관련 기능(외상, 선불금, 선수금, 정산, 입출금)은 TABLE_BSELECT에서 직접 처리하지 않고 PaymentScreen으로 라우팅하여 처리한다.
- 주문 관련 기능(주문서 재전송, 주문상품내역, 주문처리완료)은 OrderScreen 진입 후 처리하는 흐름으로 변경한다.
- 동적 하단 기능 버튼(IDC_BTN1~8)은 TABLE_DIALOG의 IDC_T_BTN1~8과 동일한 설정 기반 동적 버튼 바이므로, 하나의 `shared/ui/organisms/DynamicFunctionBar` 컴포넌트로 통합한다.
- 언어 선택(KR/EN/VN) 버튼은 `shared/ui/molecules/LanguageSelector`로 공통 컴포넌트화한다. RESTAURANT_DIALOG에도 동일 컴포넌트가 존재하므로 재사용한다.
- 배달 관련 기능(배달복사, 배달앱 관리)은 배달 모드 전용 UI 영역으로 분리한다.
- 일표/일표초기화, 판매현황 등 리포트 기능은 별도 리포트 화면 또는 모달로 분리하는 것을 검토한다.

## 9. 작업 진행 기록

| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동, RTK Query 연동, MoveTableModal/MergeTableModal 구현, INI feature flag 동적 표시, i18n | TableBtnSelectDialog shell 구현 완료. 23개 기능 버튼 그리드(P0/P1/P2 우선순위별 스타일), 동적 하단 버튼 바 8개(삭제/초기화/저장), 언어 선택(KR/EN/VN), 닫기, 모든 기능에 대한 stub handler 구현. |
