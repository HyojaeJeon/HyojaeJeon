# ZALOOA_MGR 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ZALOOA_MGR` |
| 화면 ID | `IDD_ZALOOA_MGR` |
| 원본 파일 | `set-zalooa-mgr.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: Zalo OA(Official Account) 메신저 기반 고객 알림 서비스 연동 설정 화면이다. App ID, App Secret, 결제/예약 템플릿 ID를 관리한다.
- **해결하는 사용자 문제**: 매장 관리자가 Zalo OA 연동 활성화 여부, 인증 정보, 메시지 템플릿을 설정한다.
- **화면 진입 경로**: SetupScreen(설정 메인) → Zalo OA 설정 선택
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영
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
| F-001 | Zalo OA 설정 조회 | 화면 진입 시 설정값 로드 | 화면 진입 | P1 |
| F-002 | Zalo OA 사용 여부 토글 | Zalo OA 연동 활성화/비활성화 | 체크박스 변경 | P1 |
| F-003 | App ID 입력 | Zalo OA App ID 입력 | 텍스트 입력 | P1 |
| F-004 | App Secret 입력 | Zalo OA App Secret 입력 (마스킹) | 패스워드 입력 | P1 |
| F-005 | Payment Template ID 입력 | 결제 알림 템플릿 ID 입력 | 텍스트 입력 | P1 |
| F-006 | Appointment Template ID 입력 | 예약 알림 템플릿 ID 입력 | 텍스트 입력 | P1 |
| F-007 | Payment Template 변경 | 결제 템플릿 상세 설정 화면으로 이동 | Change 버튼 클릭 | P1 |
| F-008 | Appointment Template 변경 | 예약 템플릿 상세 설정 화면으로 이동 | Change 버튼 클릭 | P1 |
| F-009 | Zalo OA 설정 저장 | 설정을 저장한다 | 저장 버튼 클릭 | P1 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 타이틀, 저장 버튼
- **중앙 영역**: 사용 여부 토글, 설정 그룹(App ID, App Secret, Payment Template ID + Change 버튼, Appointment Template ID + Change 버튼)
- **좌측 숨김**: 레거시 공통 숨김 필드 7개 (지역별 조건부)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Toggle | shared/ui/atoms/Toggle | label, checked, onChange | 사용 여부 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange, type | App ID/Template ID |
| TextInput (password) | shared/ui/atoms/TextInput | type=password | App Secret 마스킹 |
| ConfigSection | shared/ui/molecules/ConfigSection | title, children | 설정 그룹 |
| PageTitle | shared/ui/atoms/PageTitle | title | 화면 타이틀 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| Zalo OA 설정 | RTK Query 캐시 | setupApi.getZaloOAConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:ZALO_OA:GET_CONFIG | `{}` | `{ enabled, appId, appSecret, payTemplateId, apptTemplateId }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:ZALO_OA:SAVE | `{ enabled, appId, appSecret, payTemplateId, apptTemplateId }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:ZALO_OA:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveZaloOAConfigUseCase | SETUP:ZALO_OA:SAVE | enabled, appId, appSecret, templates | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | Zalo OA 설정 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | Zalo OA 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.zaloOA.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 설정 로드 | SetupScreen/ZaloOAConfig + setupApi | 저장된 설정 표시 | integration |
| App Secret 마스킹 | SetupScreen/ZaloOAConfig | 입력값 마스킹 | unit |
| Template Change 버튼 → 하위 화면 이동 | SetupScreen/ZaloOAConfig | ZaloOAPayment/ZaloOAAppointment 이동 | unit |
| 설정 저장 | SetupScreen/ZaloOAConfig + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/ZaloOAConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:ZALO_OA:*)
- [ ] UseCase 연동 완료 (SaveZaloOAConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getZaloOAConfig)
- [ ] Template 하위 화면 네비게이션 연동
- [ ] App Secret 암호화 처리
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/ZaloOAConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getZaloOAConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| Toggle 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/Toggle.tsx` | TODO |
| C++ SaveZaloOAConfigUseCase | `BrandPosApp/UseCases/Setup/SaveZaloOAConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ZALOOA_MGR |
| 리소스 값 | 427 |
| 크기 (DLU) | 460 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 25 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 5 |
| 텍스트/라벨 | 7 |
| 입력 필드 | 12 |
| 기타 | 1 |
| **합계** | **25** |

### 마이그레이션 노트 (원본)

- Zalo OA는 베트남 Zalo 메신저 기반 고객 알림 서비스 연동 설정이다.
- Payment/Appointment Template은 각각 별도 하위 다이얼로그로 상세 설정한다.
- App Secret은 ES_PASSWORD 스타일이므로 password input으로 구현하고, 저장 시 암호화 처리한다.
- 카드리더기/QR결제와 동일한 숨김 필드 패턴을 공유하며, 이는 레거시 베이스 클래스 상속 흔적이다.
