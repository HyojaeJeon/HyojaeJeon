# KIO_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `KIO_MGR` |
| 화면 ID | `IDD_KIO_MGR` |
| 원본 파일 | `set-kio-mgr.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 키오스크/테이블오더 설정의 네비게이션 허브이며, 2개 하위 탭(키오스크주문/Table Order)으로 구성된다. 탭 내부 콘텐츠는 C++에서 동적으로 생성되는 자식 다이얼로그이다.
- **해결하는 사용자 문제**: 매장 관리자가 키오스크 모드 및 테이블 오더 모드의 설정에 접근한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 키오스크 관리 선택
- **화면 종료 경로**: 닫기(IDCANCEL) → SetupScreen 복귀
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | 키오스크 설정 화면 열기 | 화면 진입 시 설정 로드 | 화면 진입 | P1 |
| F-002 | 키오스크 모드 탭 전환 | 키오스크주문 설정 화면 표시 | 키오스크주문 탭 클릭 | P1 |
| F-003 | Table Order 모드 탭 전환 | 테이블오더 설정 화면 표시 | Table Order 탭 클릭 | P1 |
| F-004 | 키오스크 설정 저장 | 설정을 저장한다 | 저장 버튼 클릭 | P1 |
| F-005 | 닫기 | 설정 화면 종료 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 타이틀(키오스크 관리), 닫기 버튼
- **탭 영역**: 2개 탭 버튼(키오스크주문/Table Order) + 상태 표시
- **본문 영역**: 선택된 탭에 따른 하위 화면 렌더링
- **저장 버튼**: TODO — 레거시에서 IDOK 숨김으로 처리. 신규에서는 명시적 저장 버튼 배치 필요

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TabGroup | shared/ui/molecules/TabGroup | tabs, selectedTab, onSelect | 키오스크/테이블오더 탭 |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |
| StatusBadge | shared/ui/atoms/StatusBadge | status, label | 현재 설정 상태 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 키오스크 설정 | RTK Query 캐시 | setupApi.getKioskConfig | 서버 상태 |
| 선택된 탭 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:KIOSK:GET_CONFIG | `{}` | `{ kioskConfig: {...}, tableOrderConfig: {...} }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:KIOSK:SAVE | `{ kioskConfig: {...}, tableOrderConfig: {...} }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:KIOSK:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveKioskConfigUseCase | SETUP:KIOSK:SAVE | kioskConfig, tableOrderConfig | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | 키오스크 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 키오스크 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.kiosk.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 탭 전환 시 하위 화면 렌더링 | SetupScreen/KioskManager | 선택 탭의 하위 화면 표시 | unit |
| 설정 저장 | SetupScreen/KioskManager + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/KioskManager)
- [ ] Bridge 계약 구현 완료 (SETUP:KIOSK:*)
- [ ] UseCase 연동 완료 (SaveKioskConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getKioskConfig)
- [ ] 탭 내부 콘텐츠 구조 확인 (TODO: 레거시 C++ 동적 자식 다이얼로그 분석 필요)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/KioskManager/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getKioskConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| TabGroup 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx` | TODO |
| C++ SaveKioskConfigUseCase | `BrandPosApp/UseCases/Setup/SaveKioskConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_KIO_MGR |
| 리소스 값 | 252 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 6 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 4 |
| 텍스트/라벨 | 2 |
| **합계** | **6** |

### 마이그레이션 노트 (원본)

- 키오스크 관리 화면은 두 개의 탭으로 구성된 설정 매니저로, 탭 전환은 React 상태로 처리한다.
- IDOK 버튼이 숨김 처리되어 있으므로 신규 UI에서는 명시적 저장 버튼을 배치한다.
- 탭 내부 콘텐츠는 레거시 리소스에 포함되지 않으므로, 실제 C++ 코드에서 동적으로 생성되는 자식 다이얼로그를 추가 분석해야 한다.
- 키오스크/테이블오더 설정은 INI 또는 DB Config 테이블 기반이므로, SQLite ConfigCrud로 통합한다.
