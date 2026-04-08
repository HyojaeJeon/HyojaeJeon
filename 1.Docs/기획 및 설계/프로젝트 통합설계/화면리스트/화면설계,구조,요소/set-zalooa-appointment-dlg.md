# ZALOOA_APPOINTMENT_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `ZALOOA_APPOINTMENT_DLG` |
| 화면 ID | `IDD_ZALOOA_APPOINTMENT_DLG` |
| 원본 파일 | `set-zalooa-appointment-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: Zalo OA 예약 알림 템플릿의 필드 매핑을 설정하는 모달 화면이다. 4개의 텍스트 입력 필드(예약코드, 주소, 예약시간, 고객이름)로 POS 데이터와 Zalo 템플릿 변수를 매핑한다.
- **해결하는 사용자 문제**: 매장 관리자가 예약 확정 시 고객에게 발송되는 Zalo OA 메시지의 필드 매핑을 설정한다.
- **화면 진입 경로**: SetupScreen/ZaloOAConfig → Appointment Template Change 버튼 클릭
- **화면 종료 경로**: 저장(IDC_BTN_SAVE) → 설정 반영, 닫기(IDCANCEL) → 모달 닫기
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
| F-001 | 예약 템플릿 설정 조회 | 화면 진입 시 4개 필드 매핑값 로드 | 화면 진입 | P1 |
| F-002 | 필드 매핑 편집 | 예약코드/주소/예약시간/고객이름 매핑값 입력 | 텍스트 입력 | P1 |
| F-003 | 예약 템플릿 설정 저장 | 4개 필드를 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-004 | 닫기 | 모달 닫기 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼, 닫기 버튼
- **본문 영역**: 4개 라벨 + 텍스트 입력 쌍 (세로 배치)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TextInput | shared/ui/atoms/TextInput | label, value, onChange | 필드 매핑 입력 (x4) |
| Label | shared/ui/atoms/Label | text | 필드 라벨 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 예약 템플릿 설정 | RTK Query 캐시 | setupApi.getZaloOAApptConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:ZALO_OA_APPT:GET_CONFIG | `{}` | `{ fields: {...} }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:ZALO_OA_APPT:SAVE | `{ fields: {...} }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:ZALO_OA_APPT:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SaveZaloOAAppointmentConfigUseCase | SETUP:ZALO_OA_APPT:SAVE | fields | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | Zalo OA 템플릿 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 템플릿 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.zaloOAAppt.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 템플릿 필드 로드 | SetupScreen/ZaloOAAppointment + setupApi | 4개 필드 값 표시 | integration |
| 필드 저장 | SetupScreen/ZaloOAAppointment + setupApi | DB에 반영 | integration |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/ZaloOAAppointment — 모달)
- [ ] Bridge 계약 구현 완료 (SETUP:ZALO_OA_APPT:*)
- [ ] UseCase 연동 완료 (SaveZaloOAAppointmentConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getZaloOAApptConfig)
- [ ] ZaloOAConfig에서의 모달/네비게이션 연동
- [ ] 공통 TemplateConfig 레이아웃 추출 검토 (ZaloOAPayment과 공유)
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Modal 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/ZaloOAAppointment/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getZaloOAApptConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| TextInput 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx` | TODO |
| C++ SaveZaloOAAppointmentConfigUseCase | `BrandPosApp/UseCases/Setup/SaveZaloOAAppointmentConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_ZALOOA_APPOINTMENT_DLG |
| 리소스 값 | 429 |
| 크기 (DLU) | 476 x 348 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP \| WS_SYSMENU |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 11 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 4 |
| 입력 필드 | 4 |
| **합계** | **11** |

### 마이그레이션 노트 (원본)

- 4개 텍스트 입력 필드로 구성된 단순 폼이다.
- set-zalooa-mgr의 IDC_BTN_APPOINT_TMP에서 진입하는 하위 설정 화면이다.
- 결제 템플릿(set-zalooa-payment-dlg)과 동일한 레이아웃 구조를 가지므로, 공통 TemplateConfig 레이아웃 컴포넌트를 shared/ui/에서 추출하여 재사용할 수 있다.
