# PRINTMSG_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINTMSG_DLG` |
| 화면 ID | `IDD_PRINTMSG_DLG` |
| 원본 파일 | `set-printmsg-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 영수증 하단에 인쇄되는 커스텀 메시지 5개를 편집하는 모달 화면이다. 메시지 1~3은 소형, 4~5는 대형(광고/프로모션용) 멀티라인 입력이다.
- **해결하는 사용자 문제**: 매장 관리자가 영수증 하단에 인쇄할 안내 문구, 광고, 프로모션 메시지를 자유롭게 작성한다.
- **화면 진입 경로**: SetupScreen/PrintReceiptConfig → 하단 메시지 설정 버튼 클릭
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
| F-001 | 인쇄 메시지 설정 조회 | 화면 진입 시 5개 메시지 내용 로드 | 화면 진입 | P1 |
| F-002 | 인쇄 메시지 설정 저장 | 5개 메시지를 일괄 저장 | 저장 버튼 클릭 | P1 |
| F-003 | 영수증 메시지 1~3 편집 | 소형 멀티라인 메시지 입력 | 텍스트 입력 | P1 |
| F-004 | 영수증 메시지 4 편집 | 대형 멀티라인 메시지 입력 | 텍스트 입력 | P1 |
| F-005 | 영수증 메시지 5 편집 (광고/프로모션) | 대형 멀티라인 광고 메시지 입력 | 텍스트 입력 | P2 |
| F-006 | 닫기 | 모달 닫기 | 닫기 버튼 클릭 | P2 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 저장 버튼, 닫기 버튼
- **중앙 영역**: 메시지 1~3 라벨 + 소형 TextArea (3개)
- **하단 영역**: 메시지 4~5 라벨 + 대형 TextArea (2개, 좌우 배치)

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| TextArea | shared/ui/atoms/TextArea | label, value, onChange, rows | 멀티라인 텍스트 입력 |
| Label | shared/ui/atoms/Label | text | 메시지 라벨 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 인쇄 메시지 설정 | RTK Query 캐시 | setupApi.getPrintMessageConfig | 서버 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PRINT_MSG:GET_CONFIG | `{}` | `{ messages: [msg1..msg5] }` | `CONFIG_NOT_FOUND` | -- (조회) | P1 |
| SETUP:PRINT_MSG:SAVE | `{ messages: [msg1..msg5] }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PRINT_MSG:SAVE:{timestamp}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SavePrintMessageUseCase | SETUP:PRINT_MSG:SAVE | messages[] | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| ConfigManager | 인쇄 메시지 설정 읽기/쓰기 | Domain/System/ConfigManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 메시지 설정 CRUD | UseCase -> ConfigManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Outbox | 설정 변경 동기화 | 커밋 후 Outbox 적재 -> Sync Worker -> CentralApi | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printMsg.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 메시지 로드 | SetupScreen/PrintMessageConfig + setupApi | 5개 메시지 표시 | integration |
| 메시지 저장 | SetupScreen/PrintMessageConfig + setupApi | DB에 반영 | integration |
| 터치 키보드 높이 | SetupScreen/PrintMessageConfig | 충분한 입력 영역 확보 | visual |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintMessageConfig — 모달)
- [ ] Bridge 계약 구현 완료 (SETUP:PRINT_MSG:*)
- [ ] UseCase 연동 완료 (SavePrintMessageUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getPrintMessageConfig)
- [ ] PrintReceiptConfig 모달 연동 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Modal 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintMessageConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getPrintMessageConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| TextArea 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/atoms/TextArea.tsx` | TODO |
| C++ SavePrintMessageUseCase | `BrandPosApp/UseCases/Setup/SavePrintMessageUseCase.cpp` | TODO |
| C++ ConfigManager | `BrandPosApp/Domain/System/ConfigManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINTMSG_DLG |
| 리소스 값 | 248 |
| 크기 (DLU) | 379 x 337 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 13 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 3 |
| 텍스트/라벨 | 5 |
| 입력 필드 | 5 |
| **합계** | **13** |

### 마이그레이션 노트 (원본)

- IDC_EDT_MSG1~3은 소형 멀티라인, IDC_EDT_MSG4~5는 대형 멀티라인으로 크기가 다르다.
- 메시지 5(IDC_EDT_MSG5)는 라벨에 "광고/프로모션용"으로 표시되어 있으므로 용도 구분 안내를 UI에 반영한다.
- PRINTRECE_DLG의 IDC_BTN_MSGSET에서 호출되는 모달이므로, 신규 UI에서도 PrintReceiptConfig 내 모달로 유지한다.
- 멀티라인 입력은 터치 키보드 대응을 고려하여 충분한 높이를 확보한다.
