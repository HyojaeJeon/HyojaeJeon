# CATCASHMGR_DLG - 현금영수증 카테고리 관리

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-CATCASHMGR |
| 레거시 다이얼로그 | IDD_CATCASHMGR_DLG (222) |
| 신규 화면 경로 | screens/AccountingScreen/CashCategory |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

현금영수증 카테고리 관리 화면이다. 카드 결제 금액 표시, 현금영수증 유형(소비자 소득공제/사업자 지출증빙) 선택, 카드번호 입력, 사인패드/승인번호 직접 입력 등의 기능을 포함한다. 현금영수증 발행과 카드 결제 장치 연동이 혼합된 복합 화면이다. 카드 승인은 외부 API 동기 대기 패턴을 따르며, Outbox 재전송 대상이 아니다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름, 동기/비동기 구분 (카드 승인 = 동기 대기) |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 결제 업무 흐름 |
| CLAUDE.md | Outbox 규칙 (카드 승인 요청은 Outbox 재전송 대상 아님), Device Error 규칙 |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CC-F01 | 현금 카테고리 저장/확인 | P0 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr | Tables/Accounting/CashCategoryCrud, OutboxStore |
| CC-F02 | 소비자 소득공제 | P0 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr | Tables/Accounting/CashCategoryCrud |
| CC-F03 | 사업자 지출증빙 | P0 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr | Tables/Accounting/CashCategoryCrud |
| CC-F04 | 카드번호 입력 | P0 | - | - | - | - |
| CC-F05 | 품목별 인쇄 체크 | P1 | - | - | - | - |
| CC-F06 | 자진발급 (조건부) | P1 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr | Tables/Accounting/CashCategoryCrud |
| CC-F07 | 사인패드 연동 (조건부) | P2 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr, SystemMgr | 장치 I/O (비동기) |
| CC-F08 | 승인번호 직접 입력 (조건부) | P2 | CASH:UPDATE_CATEGORY | UpdateCashCategoryUseCase | AccountingMgr | Tables/Accounting/CashCategoryCrud |
| CC-F09 | 고객번호 저장 체크 (조건부) | P2 | - | - | - | - |
| CC-F10 | 다이얼로그 닫기 | P2 | - (React 라우팅) | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [v] 품목별 인쇄                          [저장] [닫기]         |
+---------------------------------------------------------------+
| [항목 DataGrid (조건부)]                                       |
|                                                                |
+-------------------------------+-------------------------------+
| 받은금액: ₩0                  | 거스름돈: ₩0                  |
|                               | 카드금액: ₩0                  |
+-------------------------------+-------------------------------+
| 카드번호: [________________]                                   |
| [사인패드 (조건부)] [승인번호 직접입력 (조건부)]               |
| [자진발급 (조건부)]                                            |
+---------------------------------------------------------------+
| [소비자 소득공제]                                              |
| [사업자 지출증빙]                                              |
| [v] 고객번호 저장 (조건부)                                     |
+---------------------------------------------------------------+
| 원카드번호: ...    승인내역: ...    승인번호: ...              |
| 장치 상태: ...                                                 |
+---------------------------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/DataGrid | 항목 그리드 (조건부) | 숨김 상태, 특정 모드에서만 표시 |
| shared/ui/atoms/TextInput | 카드번호 입력 | IDC_EDT_CARDNO 대체 |
| shared/ui/atoms/Checkbox | 품목별 인쇄 체크 | IDC_ITEMLSTPRN 대체 |
| shared/ui/atoms/Checkbox | 고객번호 저장 체크 (조건부) | IDC_CUST_SAVENUM 대체 |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| CASH:GET_CATEGORIES | `{}` | `{ categories: [...] }` | 카테고리 목록 조회. Error: (없음) |
| CASH:UPDATE_CATEGORY | `{ categoryId, name, type }` | `{ category: { categoryId, name, type, updatedAt } }` | 카테고리 수정. Error: `DUPLICATE_NAME` |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| cashApi.getCashCategoryDetail | `CashCategory:{id}` | mutation 성공 시 updateQueryData |
| cashApi.getCashCategories | `CashCategoryList` | TODO: 태그 세분화 확정 필요 |
| systemApi.getDeviceStatus | `DeviceStatus` | PosRealTime 이벤트 또는 폴링으로 갱신 |

### 5.3 UseCase 흐름

**UpdateCashCategoryUseCase (P0)**
1. requestId + idempotencyKey 검사 (RequestLedgerStore)
2. 카드 승인이 필요한 경우: **동기 대기** - 외부 API 호출 후 결과 수신
3. 승인 결과 후 AccountingMgr.UpdateCashCategory() - 업무 데이터 저장
4. 트랜잭션 내: 업무 데이터 + Ledger(SUCCEEDED) + Outbox(PENDING) 기록
5. 커밋 후: PosRealTimeSender로 UI 갱신 이벤트 방송
6. 커밋 후: 인쇄 필요 시 비동기 후처리

**중요**: 카드 승인 요청은 Outbox 재전송 대상이 아니다. 오프라인이면 UseCases가 진입을 차단한다.

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| AccountingMgr | UpdateCashCategory() | 현금영수증 카테고리 데이터 생성/수정, 유형별 분기 |
| SystemMgr | GetDeviceStatus() | 장치 상태 조회 (사인패드 등) |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Accounting/CashCategoryCrud | CashCategoryCrud.h/cpp | 현금영수증 카테고리 CRUD |
| OutboxStore | OutboxStore.h/cpp | 중앙 서버 동기화 큐 (카드 승인 제외) |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |
| Device/CardReader | TODO: 장치 연동 인터페이스 확정 필요 | 카드 리더 장치 I/O |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| CASH:CATEGORY_UPDATED | UpdateCashCategoryUseCase 커밋 후 | 카테고리 상세 갱신 (외부 변경만) |
| DEVICE:STATUS_CHANGED | 장치 상태 변경 시 | 장치 상태 표시 갱신 |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 현금 카테고리 조회 (CASH:GET_CATEGORIES) | 관리자 전용 | TODO: 회계/현금 권한 코드(CASH_MGMT 등) 확정 필요 |
| 현금 카테고리 수정 (CASH:UPDATE_CATEGORY) | 관리자 전용 | 화면 진입 자체에 관리자 권한 필요 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| CC-T01 | 소비자 소득공제 선택 후 저장 | 유형 정확성, DB 저장 확인 |
| CC-T02 | 사업자 지출증빙 선택 후 저장 | 유형 정확성, DB 저장 확인 |
| CC-T03 | 카드 승인 동기 대기 | 승인 결과 후 DB 저장 순서 확인 |
| CC-T04 | 오프라인 상태에서 카드 승인 시도 | 진입 차단 확인 (Outbox 미적재) |
| CC-T05 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 |
| CC-T06 | 사인패드 장치 에러 | Device Error 규칙 준수 (코드 기반 필드) |

## 7. 완료기준

- [ ] UpdateCashCategoryUseCase 트랜잭션/멱등성 구현
- [ ] 카드 승인 동기 대기 패턴 구현 (Outbox 제외)
- [ ] AccountingMgr.UpdateCashCategory() 도메인 로직 구현
- [ ] screens/AccountingScreen/CashCategory 화면 구현
- [ ] 조건부 렌더링 (사인패드/승인번호/자진발급/고객번호 저장) 구현
- [ ] 장치 상태 실시간 갱신 (PosRealTime 또는 폴링)
- [ ] Device Error 코드 기반 에러 처리 구현

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/AccountingScreen/CashCategory/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/AccountingScreen/CashCategory/hooks/useCashCategory.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx |
| RTK Query | BrandPosApp/PosUi/src/store/api/cashApi.ts |
| RTK Query | BrandPosApp/PosUi/src/store/api/systemApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/cashCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Cash/CashActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Cash/CashActions.h |
| UseCase | BrandPosApp/UseCases/Accounting/UpdateCashCategoryUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Accounting/UpdateCashCategoryUseCase.h |
| Domain | BrandPosApp/Domain/Accounting/AccountingMgr.cpp |
| Domain | BrandPosApp/Domain/Accounting/AccountingMgr.h |
| Domain | BrandPosApp/Domain/System/SystemMgr.cpp |
| Domain | BrandPosApp/Domain/System/SystemMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Accounting/CashCategoryCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Accounting/CashCategoryCrud.h |
| Screen Shell | BrandPosApp/PosUi/src/screens/PaymentScreen/components/CashManagementDialog.tsx | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_CATCASHMGR_DLG |
| 리소스 값 | 222 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x1 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 18 (버튼 7, 텍스트/라벨 7, 입력 필드 3, 그리드/리스트 1) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDOK | 저장/확인 버튼 | screens/AccountingScreen/CashCategory > 저장 버튼 |
| IDCANCEL | 닫기 버튼 | React 라우팅으로 대체 |
| IDC_BTN_CONSUMER | 소비자 소득공제 버튼 | 소비자 소득공제 버튼 |
| IDC_BTN_BUSINESS | 사업자 지출증빙 버튼 | 사업자 지출증빙 버튼 |
| IDC_BTN_PINPAD | 사인패드 버튼 (숨김) | 조건부 렌더링 |
| IDC_BTN_PINPAD2 | 승인번호 직접 입력 버튼 (숨김) | 조건부 렌더링 (수동 입력 모달) |
| IDC_BTN_SELFAUTH | 자진발급 버튼 (숨김) | 조건부 렌더링 |
| IDC_EDT_CARDNO | 카드번호 입력 | shared/ui/atoms/TextInput |
| IDC_ITEMLSTPRN | 품목별 인쇄 체크 | shared/ui/atoms/Checkbox |
| IDC_CUST_SAVENUM | 고객번호 저장 체크 (숨김) | shared/ui/atoms/Checkbox (조건부) |
| IDC_STA_CARD | 카드금액 표시 | 금액 표시 |
| IDC_STA_RECEAMT | 받은금액 표시 | 금액 표시 |
| IDC_STA_CHANGE | 거스름돈 표시 | 금액 표시 |
| IDC_STA_CANCEL1 | 원카드번호 표시 | 텍스트 표시 |
| IDC_STA_CANCEL3 | 승인내역 표시 | 텍스트 표시 |
| IDC_STA_CANCEL4 | 승인번호 표시 | 텍스트 표시 |
| IDC_STA_DEVICE2 | 장치 상태 표시 | 장치 상태 컴포넌트 |
| IDC_GRID | 항목 그리드 (MFCGridCtrl, 숨김) | shared/ui/organisms/DataGrid (조건부) |
