# ETCSETV2_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ETCSETV2_DLG` |
| 화면 ID | `IDD_ETCSETV2_DLG` |
| 원본 파일 | `set-etcsetv2-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: Kitchen Display(KDS) 전송, M Connect 연동, 애드온 KDS 등 부가 서비스 연동 설정을 관리하는 기타 설정 화면이다. 다수 항목이 조건부 숨김 상태이다.
- **해결하는 사용자 문제**: 매장 관리자가 KDS 전송 방식, 외부 연동(M Connect) 등 부가 기능 설정을 관리한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → 기타 설정 선택
- **화면 종료 경로**: 저장(IDOK) → 설정 반영, 닫기 → SetupScreen 복귀
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
| F-001 | 기타 설정 조회 | 화면 진입 시 설정값 로드 | 화면 진입 | P1 |
| F-002 | 기타 설정 저장 | 모든 설정을 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | Kitchen Display(Android KDS) 전송 설정 변경 | KDS 전송 방식 선택 | 콤보박스 선택 | P1 |
| F-004 | M Connect 설치하기 (숨김) | 외부 프로그램 설치 (조건부) | 설치 버튼 클릭 | P2 |
| F-005 | M Connect 커넥트관리 (숨김) | 외부 프로그램 관리 (조건부) | 관리 버튼 클릭 | P2 |
| F-006 | M Connect 연결 설정 변경 (숨김) | 연결 방식 선택 (조건부) | 콤보박스 선택 | P2 |
| F-007 | 대기시간 설정 변경 (숨김) | 대기 시간 선택 (조건부) | 콤보박스 선택 | P2 |
| F-008 | 애드온 KDS 설정 변경 (숨김) | KDS 애드온 선택 (조건부) | 콤보박스 선택 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼
- **섹션 1**: Union Add-on Usage Status — Kitchen Display(Android KDS) 전송 드롭다운 (활성)
- **섹션 2**: 푸드테크 M Connect (숨김/조건부) — 연결 드롭다운, 설치/관리 버튼
- **섹션 3**: 애드온 KDS (숨김/조건부) — KDS 드롭다운, 추가매장코드

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| ConfigSection | shared/ui/molecules/ConfigSection | title, children, visible | 설정 그룹 섹션 |
| Select | shared/ui/atoms/Select | options, value, onChange | 드롭다운 선택 |
| ReadOnlyField | shared/ui/atoms/ReadOnlyField | label, value | 읽기전용 필드 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 기타 설정 | RTK Query 캐시 | setupApi.getEtcConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:ETC:GET_CONFIG | `{}` | `{ kdsConfig, mConnectConfig, addonConfig }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:ETC:SAVE | `{ kdsConfig, mConnectConfig, addonConfig }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:ETC:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveEtcConfigUseCase | SETUP:ETC:SAVE | kdsConfig, mConnectConfig, addonConfig | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | 기타 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 기타 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.etc.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| KDS 전송 설정 저장 | SetupScreen/EtcConfig + setupApi | DB에 반영 | integration |
| 조건부 섹션 표시 | SetupScreen/EtcConfig | feature flag에 따라 M Connect/애드온 섹션 표시/숨김 | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/EtcConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:ETC:*)
- [ ] UseCase 연동 완료 (SaveEtcConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getEtcConfig)
- [ ] 조건부 렌더링 (feature flag/국가/라이선스)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/EtcConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getEtcConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| ConfigSection 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/ConfigSection.tsx` | TODO |
| Select 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx` | TODO |
| ReadOnlyField 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/ReadOnlyField.tsx` | TODO |
| C++ SaveEtcConfigUseCase | `BrandPosApp/UseCases/Setup/SaveEtcConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ETCSETV2_DLG |
| 리소스 값 | 254 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 17 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 4 |
| 텍스트/라벨 | 5 |
| 입력 필드 | 5 |
| 기타 | 3 |
| **합계** | **17** |

### 마이그레이션 노트 (원본)

- 다수의 UI 요소가 숨김 상태로, 런타임 조건(국가, 라이선스 등)에 따라 동적으로 표시된다. feature flag 기반 조건부 렌더링으로 처리한다.
- M Connect 관련 기능은 외부 프로그램 설치/관리로, 별도 ExternalBridge 또는 Device 계층 연동이 필요할 수 있다.
- Kitchen Display(Android KDS) 전송 설정은 현재 유일하게 활성화된 핵심 설정 항목이다.
- 3개의 GroupBox가 설정 섹션을 구분하므로, ConfigSection 컴포넌트로 그룹핑한다.
