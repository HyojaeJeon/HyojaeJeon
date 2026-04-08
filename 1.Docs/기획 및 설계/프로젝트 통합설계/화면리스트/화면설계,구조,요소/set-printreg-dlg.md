# PRINTREG_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `PRINTREG_DLG` |
| 화면 ID | `IDD_PRINTREG_DLG` |
| 원본 파일 | `set-printreg-dlg.md` |
| 전환 우선순위 | `P0` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `Shell 구현 완료` |

## 1. 화면 개요

- **화면 목적**: 프린터 등록/삭제/설정을 관리하는 화면이다. 프린터명, 연결타입(시리얼/네트워크), COM포트/IP, Baudrate, 드라이버, POS별 출력 등을 설정한다. 프린터 없이는 주문서/영수증 출력이 불가능하므로 P0이다.
- **해결하는 사용자 문제**: 매장 관리자가 POS에 연결된 프린터를 등록/삭제하고 연결 방식을 설정한다.
- **화면 진입 경로**: SetupScreen/PrintManager → 프린터등록 탭 선택
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
| F-001 | 프린터 목록 조회 | 화면 진입 시 등록된 프린터 목록 로드 | 화면 진입 | P0 |
| F-002 | 프린터 추가 | 새 프린터를 등록한다 | 추가 버튼 클릭 | P0 |
| F-003 | 프린터 삭제 | 선택된 프린터를 삭제한다 | 삭제 버튼 클릭 | P0 |
| F-004 | 프린터 설정 저장 | 프린터 설정을 저장한다 | 저장 버튼 클릭 | P0 |
| F-005 | 프린터명 입력 | 프린터 이름 설정 | 텍스트 입력 | P0 |
| F-006 | 연결타입 선택 | 시리얼/네트워크 선택 (하위 필드 토글) | 콤보박스 선택 | P0 |
| F-007 | COM포트/Baudrate 선택 | 시리얼 연결 시 포트/속도 설정 | 콤보박스 선택 | P1 |
| F-008 | 네트워크 IP/포트 입력 | 네트워크 프린터 IP/포트 (조건부 표시) | 텍스트 입력 | P1 |
| F-009 | 프린터 드라이버 선택 | 설치된 드라이버 목록에서 선택 | 콤보박스 선택 | P1 |
| F-010 | 주문프린터 자동출력 토글 | 자동 출력 설정 | 체크박스 변경 | P1 |
| F-011 | POS번호별 출력 선택 | 특정 POS에서만 출력하도록 설정 | 리스트 선택 | P1 |
| F-012 | 그리드에서 프린터 행 선택 | 프린터 선택 시 상세 설정 표시 | 그리드 행 클릭 | P0 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 주문프린터 자동출력 체크, 주문서 저장 버튼
- **좌측 영역**: 프린터 목록 그리드(DataTable) — 등록된 프린터 리스트
- **우측 영역**: 프린터 상세 설정 폼 — 코드, 프린터명, 연결타입, 연결위치, COM포트/IP, Baudrate, 주문프린터, POS번호 리스트
- **하단 영역**: 추가/삭제/저장 버튼

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| DataTable | shared/ui/organisms/DataTable | columns, rows, selectedRow, onRowSelect | 프린터 목록 |
| TextInput | shared/ui/atoms/TextInput | label, value, onChange | 프린터명/IP/포트 입력 |
| Select | shared/ui/atoms/Select | options, value, onChange | 연결타입/COM포트/Baudrate/드라이버 |
| CheckboxList | shared/ui/molecules/CheckboxList | items, selectedItems, onChange | POS번호 선택 |
| Checkbox | shared/ui/atoms/Checkbox | label, checked, onChange | 자동출력/주문번호별 체크 |
| ReadOnlyField | shared/ui/atoms/ReadOnlyField | label, value | 프린터코드 표시 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 프린터 등록 설정 | RTK Query 캐시 | setupApi.getPrintRegConfig | 서버 상태 |
| 선택된 프린터 | 로컬 컴포넌트 상태 | useState | UI 상태 |
| 폼 편집 상태 | 로컬 컴포넌트 상태 | useState | UI 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| SETUP:PRINT_REG:GET_CONFIG | `{}` | `{ printers: [...], autoOrder, drivers: [...] }` | `CONFIG_NOT_FOUND` | -- (조회) | P0 |
| SETUP:PRINT_REG:SAVE | `{ printers: [...], autoOrder }` | `{ success: true }` | `SAVE_FAILED` | `SETUP:PRINT_REG:SAVE:{timestamp}` | P0 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SavePrintRegConfigUseCase | SETUP:PRINT_REG:SAVE | printers[], autoOrder | SQLite TX | -- | ConfigRow[] | TODO |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| SystemManager | 프린터 등록 관리 | Domain/System/SystemManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/System/ConfigCrud | 프린터 설정 CRUD | UseCase -> SystemManager -> ConfigCrud -> SQLite | 로컬 원본 |
| Device/Printer | 드라이버 목록 조회 | UseCase -> Infrastructure/Device/Printer | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/setup.json` | msgKey: setup.printReg.* |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | TODO: 관리자 권한 레벨 확인 필요 | |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 프린터 목록 로드 | SetupScreen/PrintRegConfig + setupApi | 등록 프린터 그리드 표시 | integration |
| 프린터 추가/삭제 | SetupScreen/PrintRegConfig + setupApi | 그리드에 추가/제거 반영 | integration |
| 연결타입 변경 시 필드 토글 | SetupScreen/PrintRegConfig | 시리얼→COM/Baudrate, 네트워크→IP/Port | unit |

## 7. 완료 기준

- [ ] UI 구현 완료 (screens/SetupScreen/PrintRegConfig)
- [ ] Bridge 계약 구현 완료 (SETUP:PRINT_REG:*)
- [ ] UseCase 연동 완료 (SavePrintRegConfigUseCase)
- [ ] RTK Query 엔드포인트 구현 완료 (setupApi.getPrintRegConfig)
- [ ] PrintManager 탭 통합 완료
- [ ] 연결타입별 조건부 렌더링
- [ ] Device/Printer 드라이버 목록 연동
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/PrintRegConfig/index.tsx` | TODO |
| RTK Query endpoint | `BrandPosApp/PosUi/src/store/api/setupApi.ts` (getPrintRegConfig) | TODO |
| Bridge command | `BrandPosApp/PosUi/src/bridge/commands/setup.ts` | TODO |
| DataTable 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/organisms/DataTable.tsx` | TODO |
| CheckboxList 컴포넌트 | `BrandPosApp/PosUi/src/shared/ui/molecules/CheckboxList.tsx` | TODO |
| C++ SavePrintRegConfigUseCase | `BrandPosApp/UseCases/Setup/SavePrintRegConfigUseCase.cpp` | TODO |
| C++ SystemManager | `BrandPosApp/Domain/System/SystemManager.cpp` | TODO |
| SQLite Tables/System/ConfigCrud | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_PRINTREG_DLG |
| 리소스 값 | 256 |
| 크기 (DLU) | 476 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 27 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 6 |
| 텍스트/라벨 | 9 |
| 입력 필드 | 10 |
| 그리드/리스트 | 2 |
| **합계** | **27** |

### 마이그레이션 노트 (원본)

- 프린터 등록은 POS 운영의 핵심 설정이므로 P0이다.
- 연결타입 선택에 따라 시리얼(COM포트/Baudrate) 또는 네트워크(IP/Port) 입력 필드가 토글되는 조건부 렌더링이 필요하다.
- IDC_EDT_PRNIP, IDC_EDT_PRNPORT는 숨김 상태이며 네트워크 프린터 선택 시에만 표시된다.
- 프린터 드라이버 목록은 Device/Printer 인프라에서 조회한다.
