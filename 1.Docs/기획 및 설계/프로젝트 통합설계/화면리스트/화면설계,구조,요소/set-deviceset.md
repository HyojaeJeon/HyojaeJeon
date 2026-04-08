# SET-DEVICESET: 장비 설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-DEVICESET |
| 화면 ID | SetupScreen/DeviceConfig |
| 레거시 다이얼로그 | IDD_DEVICESET (리소스 155) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

POS 장비(프린터, 카드리더기, 바코드스캐너 등) 설정을 관리하는 화면이다. 섹션별(정산프린터/주문프린터/주변기기) 그룹화된 폼 레이아웃으로 구성된다. COM 포트 및 프린터 드라이버 목록은 C++ 측 시스템 API를 통해 동적으로 조회한다. 일부 설정 변경은 POS 재시작을 요구할 수 있다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/DeviceConfig/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | i18n 규칙 | 재시작 안내 메시지 msgKey 기반 |
| CLAUDE.md | Bridge 규칙 | COM 포트/프린터 목록은 Bridge 경유 조회 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-DEV-001 | 장비설정 저장 | 모든 장비 설정 일괄 저장 | P0 |
| F-DEV-002 | 정산영수증 프린터 설정 | 정산 프린터 이름/드라이버/포트 설정 | P0 |
| F-DEV-003 | 정산프린터 사용여부 | 정산 프린터 사용/미사용 전환 | P0 |
| F-DEV-004 | 주문영수증 프린터 설정 | 인쇄방식/프린터/COM명 설정 | P0 |
| F-DEV-005 | 주문벨 프린터 설정 | 주문벨 프린터 선택 | P1 |
| F-DEV-006 | U-Chef 설정 | U-Chef 장비 설정 | P2 |
| F-DEV-007 | 카드리더기/바코드 설정 | 카드리더기 이름/포트 설정 | P1 |
| F-DEV-008 | 바코드스캐너 포트 설정 | 스캐너 포트 설정 | P1 |
| F-DEV-009 | 주문프린터 데이터속도 | 프린터 전송 속도 설정 | P2 |
| F-DEV-010 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  POS번호: {posNo}  POS이름: {posName}  [저장]  [닫기]        |
+--------------------------------------------------------------+
|                                                              |
|  [섹션: 정산영수증 프린터]                                    |
|   프린터이름  [___________v]  드라이버  [___________v]       |
|   포트        [___________v]  사용여부  [___________v]       |
|                                                              |
|  [섹션: 주문영수증 프린터]                                    |
|   인쇄방식   (O)상품별 (O)전체    프린터  [___________v]     |
|   COM명      [___________]        데이터속도 [________v]     |
|                                                              |
|  [섹션: 주변기기]                                            |
|   주문벨     [___________v]   U-Chef  [___________v]         |
|   카드리더기 [___________v]   포트    [___________v]         |
|   바코드스캐너 [_________v]                                  |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/atoms/Text | POS 번호, POS 이름 | D-DEV-001, D-DEV-002 |
| shared/ui/atoms/Select | 프린터/포트/드라이버 콤보박스 | D-DEV-003~013 |
| shared/ui/atoms/TextInput | COM명 입력 | D-DEV-009 |
| shared/ui/atoms/RadioGroup | 주문프린터 인쇄방식 | D-DEV-007 |
| shared/ui/atoms/Button | 저장, 닫기 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:DEVICE:SAVE | UI → C++ | `{ section: string, data: {...} }` | `{ success, requireRestart?: boolean }` | 장비 설정 저장. 재시작 필요 시 플래그 반환 |
| SETUP:DEVICE:GET_COM_PORTS | UI → C++ | `{}` | `{ ports: string[] }` | 시스템 COM 포트 목록 조회 |
| SETUP:DEVICE:GET_PRINTERS | UI → C++ | `{}` | `{ printers: string[] }` | 시스템 프린터 목록 조회 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupDeviceApi.getDeviceConfig | GET | `DeviceConfig` | 장비 설정 전체 조회 |
| setupDeviceApi.saveDeviceConfig | MUTATION | invalidates `DeviceConfig` | 장비 설정 저장 |
| setupDeviceApi.getComPorts | GET | `ComPorts` | COM 포트 목록 (C++ 시스템 API) |
| setupDeviceApi.getPrinters | GET | `Printers` | 프린터 목록 (C++ 시스템 API) |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveDeviceConfigUseCase | 장비 설정 저장 | SystemMgr | Tables/System/ConfigCrud |

#### UseCase 실패 규칙

- **멱등성**: 장비설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **참조 무결성**: 해당 없음 (key-value 설정)
- **Outbox**: 장비설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-DEV-001 | POS 번호 | shared/ui/atoms/Text | setupDeviceApi.getDeviceConfig → posNo |
| D-DEV-002 | POS 이름 | shared/ui/atoms/Text | setupDeviceApi.getDeviceConfig → posName |
| D-DEV-003 | 정산프린터 이름 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → calcPrinterName |
| D-DEV-004 | 정산프린터 드라이버 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → calcPrinterDriver |
| D-DEV-005 | 정산프린터 포트 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → calcPrinterPort |
| D-DEV-006 | 정산프린터 사용여부 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → calcPrinterUse |
| D-DEV-007 | 주문프린터 인쇄방식 | shared/ui/atoms/RadioGroup | setupDeviceApi.getDeviceConfig → orderPrintMode |
| D-DEV-008 | 주문프린터 포트 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → orderPrinterPort |
| D-DEV-009 | 주문프린터 COM명 | shared/ui/atoms/TextInput | setupDeviceApi.getDeviceConfig → orderPrinterComName |
| D-DEV-010 | 주문벨 프린터 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → bellPrinter |
| D-DEV-011 | U-Chef | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → uChef |
| D-DEV-012 | 카드리더기 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → cardReader |
| D-DEV-013 | 바코드스캐너 포트 | shared/ui/atoms/Select | setupDeviceApi.getDeviceConfig → scannerPort |

### 5.5 상태 관리

- 장비 설정: RTK Query 캐시
- 폼 편집 상태: 로컬 컴포넌트 상태
- COM 포트/프린터 목록: RTK Query 캐시 (C++ 시스템 API 결과)

### 5.6 i18n

- 섹션 타이틀, 필드 라벨, 버튼: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey
- 재시작 안내 메시지: msgKey 기반 (하드코딩 금지)

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-DEV-001 | 정산프린터 설정 → 저장 | DB 반영, 프린터 설정 적용 |
| T-DEV-002 | 주문프린터 인쇄방식 변경 | 라디오 선택 반영 |
| T-DEV-003 | COM 포트 목록 조회 | C++ 시스템 API 경유 동적 목록 |
| T-DEV-004 | 재시작 필요 설정 변경 | 재시작 안내 메시지 표시 |
| T-DEV-005 | mockTransport 환경 | C++ 없이 독립 동작 (mock COM/프린터 목록) |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/DeviceConfig 화면 구현 완료
- [ ] 섹션별 폼 레이아웃 (정산프린터/주문프린터/주변기기)
- [ ] COM 포트/프린터 목록 동적 조회 (Bridge 경유)
- [ ] 저장 시 재시작 필요 여부 안내
- [ ] mockTransport 독립 개발 가능 (mock 장비 목록)
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/DeviceSettingsDialog.tsx | 장비 설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/DeviceConfig/CalcPrinterSection.tsx | 정산프린터 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/DeviceConfig/OrderPrinterSection.tsx | 주문프린터 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/DeviceConfig/PeripheralSection.tsx | 주변기기 섹션 | TODO |
| BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx | 공용 셀렉트 콤보 | TODO |
| BrandPosApp/PosUi/src/shared/ui/atoms/RadioGroup.tsx | 공용 라디오 그룹 | TODO |
| BrandPosApp/PosUi/src/store/api/setupDeviceApi.ts | 장비 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupDeviceCommands.ts | 장비 설정 Bridge Command | TODO |
| BrandPosApp/PosUi/src/bridge/mocks/deviceMock.ts | mock COM 포트/프린터 목록 | TODO |
| BrandPosApp/UseCases/System/SaveDeviceConfigUseCase.cpp | 장비 설정 저장 UseCase | TODO |
| BrandPosApp/Domain/System/SystemMgr.cpp | 시스템 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp | 설정 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_DEVICESET |
| 리소스 값 | 155 |
| 크기 (DLU) | 450 x 337 |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 39 (버튼 4, 라벨 13, 입력 22) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_DEVICE_SAVE | 저장 버튼 | |
| IDC_POSNO | POS 번호 (Static) | |
| IDC_POSNAME | POS 이름 (Static) | |
| IDC_CALCPRNNAME | 정산프린터 이름 (ComboBox) | |
| IDC_CB_PRNREG | 정산프린터 드라이버 (ComboBox) | |
| IDC_CALCPRN | 정산프린터 포트 (ComboBox) | |
| IDC_CALCPRNUSE | 정산프린터 사용여부 (ComboBox) | |
| IDC_KIPRN_ITEM / IDC_KIPRN_ALL | 주문프린터 인쇄방식 (Radio) | |
| IDC_KIPRN | 주문프린터 포트 (ComboBox) | |
| IDC_PRNCOMNAME | 주문프린터 COM명 (EditText) | |
| IDC_BELLPRN | 주문벨 프린터 (ComboBox) | |
| IDC_UCHEF | U-Chef (ComboBox) | |
| IDC_CBNAME / IDC_CBPORT | 카드리더기 (ComboBox) | |
| IDC_SCANPORT | 바코드스캐너 (ComboBox) | |

### 제외 대상 (숨김 컨트롤)

- IDC_DISPLAY / IDC_DISPLAYNAME: 고객표시기 (NOT WS_VISIBLE)
- IDC_CIDNAME / IDC_CIDPORT: 발신자표시CID (NOT WS_VISIBLE)
- IDC_RFNAME / IDC_RFPORT: RF카드리더 (NOT WS_VISIBLE)
- IDC_BTN_MOBILEPOS: 모바일POS (NOT WS_VISIBLE)
- IDC_STARGATE~3: Stargate (NOT WS_VISIBLE)
- IDOK: 확인 (NOT WS_VISIBLE)

### 마이그레이션 노트

- COM 포트 목록은 Bridge Command로 C++ 측에서 시스템 COM 포트를 조회하여 동적으로 제공한다.
- 프린터 드라이버 목록도 마찬가지로 C++ 측 시스템 API를 통해 조회한다.
- 장비설정 변경은 로컬 DB 저장 후 즉시 적용되며, 일부 설정은 POS 재시작을 요구할 수 있다.
