# CARDREADER_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `CARDREADER_MGR` |
| 화면 ID | `IDD_CARDREADER_MGR` |
| 원본 파일 | `set-cardreader-mgr.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 카드리더기 연동 설정(뱅크 선택, IP/PORT/KEY)을 관리하는 화면이다. 카드 결제 없이는 매장 운영이 불가능하므로 P0이다.
- **해결하는 사용자 문제**: 매장 관리자가 카드 결제 단말기의 뱅크(결제사), 네트워크 정보, 인증 키를 설정한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 카드리더기 설정 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영 (PAY_MGR 하위 탭 또는 독립 진입)
- **관련 운영 주체**: 매장 관리자
- **운영 모드**: Setup/Maintenance mode

## 2. 상위 기준 연결

| 기준 | 연결 문서 | 비고 |
|---|---|---|
| 전체 아키텍처 | `00-Platform-최종-아키텍처-기준서.md` | 필수 |
| Edge POS 설계 | `04-Edge-POS-아키텍처-설계서.md` | 필수 |
| DB 설계 | `DB설계/` | 해당 |
| 화면 인벤토리 | `_index.md` | 필수 |

## 3. 화면 기능 목록

| ID | 기능명 | 설명 | 사용자 액션 | 우선순위 |
|---|---|---|---|---|
| F-001 | 카드리더기 설정 조회 | 화면 진입 시 설정값 로드 | 화면 진입 | P0 |
| F-002 | 카드결제 뱅크 선택 | 결제 뱅크(은행/PG사) 선택 | 콤보박스 선택 | P0 |
| F-003 | 카드리더기 IP 입력 | 단말기 IP 주소 설정 | 텍스트 입력 | P0 |
| F-004 | 카드리더기 PORT 입력 | 단말기 포트 설정 | 텍스트 입력 | P0 |
| F-005 | 카드리더기 KEY 입력 | 인증 키 입력 (마스킹) | 패스워드 입력 | P0 |
| F-006 | 카드리더기 설정 저장 | 설정을 저장한다 | 저장 버튼 클릭 | P0 |
| F-007 | 한국 전용 설정 (숨김 7개) | 참조구분, 코드, 매장번호, 패스리더, 포트, 자동환불, 팀체크 | 콤보/텍스트 변경 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 뱅크 선택 콤보박스, 타이틀, 저장 버튼
- **중앙 영역**: 설정 그룹(GroupBox) — IP, PORT, KEY 입력 필드
- **좌측 숨김**: 한국 전용 결제 설정 7개 필드 (지역별 조건부 표시)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Select | shared/ui/atoms/Select | options, value, onChange | 뱅크 선택 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange, type | IP/PORT 입력 |
| TextInput (password) | shared/ui/atoms/TextInput | label, value, onChange, type=password | KEY 마스킹 입력 |
| ConfigSection | shared/ui/molecules/ConfigSection | title, children | 설정 그룹 |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 카드리더기 설정 | RTK Query 캐시 | setupApi.getCardReaderConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:CARD_READER:GET_CONFIG | `{}` | `{ bank, ip, port, key, legacyConfig }` | `CONFIG_NOT_FOUND` | -- (조회) | P0 |
| SETUP:CARD_READER:SAVE | `{ bank, ip, port, key, legacyConfig }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:CARD_READER:SAVE:{timestamp}` | P0 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveCardReaderConfigUseCase | SETUP:CARD_READER:SAVE | bank, ip, port, key | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | 카드리더기 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 카드리더기 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Device/CardReader | 뱅크별 설정 스키마 | UseCase -> Infrastructure/Device/CardReader | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.cardReader.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 설정 로드 | SetupScreen/CardReaderConfig + setupApi | 저장된 설정 표시 | integration |
| 뱅크 변경 후 저장 | SetupScreen/CardReaderConfig + setupApi | DB에 반영 | integration |
| KEY 마스킹 | SetupScreen/CardReaderConfig | 입력값 마스킹 표시 | unit |
| 지역별 조건부 표시 | SetupScreen/CardReaderConfig | 한국/베트남에 따라 숨김 필드 표시 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/CardReaderConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:CARD_READER:*)
- [ ] UseCase 연동 완료 (SaveCardReaderConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getCardReaderConfig)
- [ ] 지역별 feature flag 조건부 렌더링
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/CardReaderConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getCardReaderConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| ConfigSection 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/ConfigSection.tsx` | TODO |
| C++ SaveCardReaderConfigUseCase | `BrandPosApp/UseCases/Setup/SaveCardReaderConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_CARDREADER_MGR |
| 리소스 값 | 425 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 21 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 6 |
| 입력 필드 | 11 |
| 기타 | 1 |
| **합계** | **21** |

### 마이그레이션 노트 (원본)

- 카드리더기 설정은 결제 처리의 핵심 인프라이므로 P0이다.
- 숨김 7개 컨트롤은 한국 전용 결제 게이트웨이 설정으로, 국가별 조건부 렌더링이 필요하다.
- IDC_EDT_KEY는 ES_PASSWORD 스타일로 인증 키를 마스킹한다.
- 뱅크 선택에 따라 하위 설정 필드 구성이 동적으로 변경될 수 있다.
