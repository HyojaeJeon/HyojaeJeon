# PRINTBILL_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINTBILL_DLG` |
| 화면 ID | `IDD_PRINTBILL_DLG` |
| 원본 파일 | `set-printbill-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 계산서(간이주문서) 인쇄 시 각 항목(여백, 타이틀, 전표번호, 테이블명, 판매시간, 상품메뉴, 합계 등)의 표시 방식을 설정하는 화면이다.
- **해결하는 사용자 문제**: 매장 관리자가 계산서 인쇄 양식의 12개 항목별 표시/숨김/형식을 콤보박스로 선택하고, POS별 프린터 설정을 구성한다.
- **화면 진입 경로**: SetupScreen/PrintManager → 계산서(간이주문서) 탭 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영 (PRINT_MGR의 하위 탭 페이지)
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

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
| F-001 | 계산서 인쇄 설정 조회 | 화면 진입 시 12개 항목의 현재 설정값을 로드한다 | 화면 진입 | P1 |
| F-002 | 계산서 인쇄 설정 저장 | 모든 항목의 설정을 일괄 저장한다 | 저장 버튼 클릭 | P1 |
| F-003 | 인쇄 항목별 설정 변경 | 12개 항목(여백/상단여백/타이틀/전표번호/테이블명/판매시간/주문번호/상품메뉴/구분선/합계금액/결제수단별/하단여백)의 표시 형식 변경 | 콤보박스 선택 | P1~P2 |
| F-004 | POS별 프린터 설정 | POS별 체크 활성화, POS 번호, COM 포트 선택 | 체크박스/콤보박스 변경 | P2 |
| F-005 | 수량 두 배 인쇄 | 수량을 2배로 인쇄하는 옵션 토글 | 체크박스 변경 | P2 |
| F-006 | 등록 프린터 사용 | 등록된 프린터로 출력 여부 설정 | 체크박스/콤보박스 변경 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼
- **좌측 영역**: 12개 인쇄 항목 라벨 + 콤보박스 쌍 (세로 배치)
- **우측 영역**: POS별 설정 그룹(체크/POS번호/포트), 수량 두 배 체크, 등록 프린터 체크/선택
- **안내 텍스트**: 매장정보/추가주문 표시 안내

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| SelectField | shared/ui/molecules/SelectField | label, options, value, onChange | 인쇄 항목 설정 (x12) |
| FormGroup | shared/ui/molecules/FormGroup | title, children, visible | POS별 설정 그룹 |
| Checkbox | shared/ui/atoms/Checkbox | label, checked, onChange | 체크박스 옵션 |
| Label | shared/ui/atoms/Label | text | 항목 라벨 |
| HelpText | shared/ui/atoms/HelpText | text | 안내 텍스트 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 계산서 인쇄 설정 | RTK Query 캐시 | setupApi.getBillPrintConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState / useReducer | UI 상태 (저장 전 임시) |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PRINT_BILL:GET_CONFIG | `{}` | `{ items: [...], posConfig: {...} }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:PRINT_BILL:SAVE | `{ items: [...], posConfig: {...} }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PRINT_BILL:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveBillPrintConfigUseCase | SETUP:PRINT_BILL:SAVE | items[], posConfig | SQLite TX | -- | ConfigRow[] | 덮어쓰기 저장. TX 원자적 커밋. 실패 시 롤백, UI 에러 코드 반환. 커밋 후 Outbox 적재. |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 인쇄 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 인쇄 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printBill.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 설정 로드 시 12개 콤보박스 값 반영 | SetupScreen/PrintBillConfig | 저장된 설정값 표시 | integration |
| 설정 변경 후 저장 | SetupScreen/PrintBillConfig + setupApi | DB에 반영 | integration |
| POS별 체크 활성화 시 하위 필드 활성 | SetupScreen/PrintBillConfig | POS번호/포트 콤보박스 활성화 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintBillConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:PRINT_BILL:*)
- [ ] UseCase 연동 완료 (SaveBillPrintConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getBillPrintConfig)
- [ ] PrintManager 탭 통합 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintBillConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getBillPrintConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| SelectField 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/SelectField.tsx` | TODO |
| FormGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/FormGroup.tsx` | TODO |
| Checkbox 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx` | TODO |
| C++ SaveBillPrintConfigUseCase | `BrandPosApp/UseCases/Setup/SaveBillPrintConfigUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINTBILL_DLG |
| 리소스 값 | 211 |
| 크기 (DLU) | 485 x 285 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_CHILD |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 39 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 17 |
| 입력 필드 | 18 |
| 기타 | 1 |
| **합계** | **39** |

### 마이그레이션 노트 (원본)

- 12개 인쇄 항목 설정은 폼 기반 UI로 전환하며, 각 항목의 콤보박스 옵션은 서버/DB에서 조회한다.
- POS별 설정 그룹(GroupBox)은 조건부 표시 섹션으로 구현한다 (IDC_CHK_POSCHK 체크 시 활성화).
- IDOK/IDCANCEL 숨김 버튼은 WS_CHILD 스타일의 탭 페이지 특성상 존재하며, 신규 UI에서 제거한다.
- 이 화면은 PRINT_MGR의 하위 탭 페이지로 동작하므로, 신규 구조에서도 PrintManager 내 탭으로 배치한다.
