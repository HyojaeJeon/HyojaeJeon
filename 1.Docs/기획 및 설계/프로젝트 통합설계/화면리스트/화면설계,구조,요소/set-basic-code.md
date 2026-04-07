# BASIC_CODE 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `BASIC_CODE` |
| 화면 ID | `IDD_BASIC_CODE` |
| 원본 파일 | `set-basic-code.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 저울코드, 회원코드, 할인금액, 카드사 구간, 주문프린터층 등 POS 운영에 필요한 기본 코드 데이터를 유형별로 관리하는 설정 화면이다.
- **해결하는 사용자 문제**: 매장 관리자가 5가지 코드 유형의 항목을 탭으로 전환하며 조회/추가/삭제할 수 있다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 기본코드 설정 선택
- **화면 종료 경로**: 저장 → 설정 반영, 닫기(IDCANCEL) → SetupScreen 복귀
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
| F-001 | 저울코드 목록 조회 | 저울코드 탭 선택 시 해당 코드 목록 표시 | 저울코드 탭 클릭 | P1 |
| F-002 | 회원코드 목록 조회 | 회원코드 탭 선택 시 해당 코드 목록 표시 | 회원코드 탭 클릭 | P1 |
| F-003 | 할인금액 목록 조회 | 할인금액 탭 선택 시 해당 코드 목록 표시 | 할인금액 탭 클릭 | P1 |
| F-004 | 카드사 구간 목록 조회 | 카드사 구간 탭 선택 시 해당 코드 목록 표시 | 카드사 구간 탭 클릭 | P2 |
| F-005 | 주문프린터층 목록 조회 | 주문프린터층 탭 선택 시 해당 코드 목록 표시 | 프린터층 탭 클릭 | P1 |
| F-006 | 코드 저장 | 그리드에서 편집한 코드 데이터를 저장한다 | 저장 버튼 클릭 | P1 |
| F-007 | 코드 삭제 | 선택된 코드 항목을 삭제한다 | 삭제 버튼 클릭 | P1 |
| F-008 | 닫기 | 설정 화면을 종료한다 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 코드 유형 탭 버튼 5개(저울코드/회원코드/할인금액/카드사 구간/프린터층), 저장/삭제 버튼, 닫기 버튼
- **중앙 영역**: 현재 코드 유형 라벨 + 편집 가능 데이터 그리드(IDC_GRID)
- **하단 영역**: 안내 텍스트 (프린터층 탭 선택 시 조건부 표시)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| DataGrid | shared/ui/organisms/DataGrid | columns, rows, editable, onRowChange | 편집 가능 코드 그리드 |
| TabGroup | shared/ui/molecules/TabGroup | tabs, selectedTab, onSelect | 코드 유형 탭 |
| Label | shared/ui/atoms/Label | text | 현재 코드 유형 표시 |
| HelpText | shared/ui/atoms/HelpText | text, visible | 조건부 안내 텍스트 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 코드 목록 | RTK Query 캐시 | setupApi.getBasicCodeList | 서버 상태 |
| 선택된 코드 유형 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:BASIC_CODE:GET_LIST | `{ type }` | `{ codes: [...] }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:BASIC_CODE:SAVE | `{ type, codes: [...], deleteIds? }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:BASIC_CODE:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveBasicCodeUseCase | SETUP:BASIC_CODE:SAVE | type, codes[], deleteIds? | SQLite TX | -- | ConfigRow[] | 덮어쓰기 저장. TX 원자적 커밋. 삭제 시 참조 무결성 확인 필요 (TODO: 참조 테이블 목록 확정). 실패 시 롤백, UI 에러 코드 반환. 커밋 후 Outbox 적재. |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 기본코드 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 코드 데이터 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.basicCode.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 관리자 전용 — Setup/Maintenance 모드 접근 권한 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 탭 전환 시 코드 목록 갱신 | SetupScreen/BasicCode + setupApi | 선택 유형의 코드만 표시 | integration |
| 그리드 편집 후 저장 | SetupScreen/BasicCode + setupApi | DB에 변경 반영 | integration |
| 코드 삭제 | SetupScreen/BasicCode + setupApi | 삭제된 항목 제거 | integration |
| 프린터층 탭 선택 시 안내 텍스트 표시 | SetupScreen/BasicCode | 안내 텍스트 조건부 노출 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/BasicCode)
- [ ] Bridge 계약 구현 완료 (SETUP:BASIC_CODE:*)
- [ ] UseCase 연동 완료 (SaveBasicCodeUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getBasicCodeList)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/BasicCode/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getBasicCodeList) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| DataGrid 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx` | TODO |
| TabGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx` | TODO |
| HelpText 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/HelpText.tsx` | TODO |
| C++ PosRequestActions/Setup | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Setup/SetupActions.cpp` | TODO |
| C++ SaveBasicCodeUseCase | `BrandPosApp/UseCases/Setup/SaveBasicCodeUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_BASIC_CODE |
| 리소스 값 | 198 |
| 크기 (DLU) | 450 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 12 |

### 버튼 (9개)

| ID | 라벨 | 용도 추정 |
|---|---|---|
| IDOK | OK (숨김) | 레거시 호환 |
| IDCANCEL | 닫기 | 닫기/취소 |
| IDC_BTN_SAVE | 저장 | 저장 |
| IDC_BTN_DEL | 삭제 | 삭제 |
| IDC_BTN_SCALE | 저울코드 | 코드 유형 탭 |
| IDC_BTN_CUST | 회원코드 | 코드 유형 탭 |
| IDC_BTN_COUPON | 할인금액 | 코드 유형 탭 |
| IDC_BTN_BUYER | 카드사 구간 | 코드 유형 탭 |
| IDC_BTN_PRNFLOOR | 주문프린터층 | 코드 유형 탭 |

### 텍스트/라벨 (2개), 그리드 (1개)

- IDC_STA_TYPENAME: 현재 코드 유형 표시
- IDC_STATIC: 프린터층 입력 안내 (숨김)
- IDC_GRID: MFCGridCtrl 데이터 그리드

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 9 |
| 텍스트/라벨 | 2 |
| 그리드/리스트 | 1 |
| **합계** | **12** |

### 마이그레이션 노트 (원본)

- 5개 코드 유형(저울코드, 회원코드, 할인금액, 카드사 구간, 주문프린터층)을 탭으로 전환하는 구조는 유지한다.
- 레거시 MFCGridCtrl은 편집 가능한 DataGrid 컴포넌트로 전환한다.
- IDC_STATIC 안내 텍스트는 프린터층 탭 선택 시에만 조건부 표시하는 패턴으로 구현한다.
- IDOK 숨김 버튼은 레거시 호환용이므로 신규 UI에서 제거한다.
