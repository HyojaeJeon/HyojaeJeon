# INISET 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-INISET |
| 화면 ID (레거시) | IDD_INISET |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

INISET은 POS 초기 설정 화면이다. POS 타입, 번호, 매장PC 이름, 서버 연결 정보 등을 설정한다. 설치/유지보수 시에만 사용하며, feature flag로 활성화되는 유지보수 모드에서만 접근 가능해야 한다. MSSQL -> SQLite 전환에 따라 서버 관련 필드는 중앙 서버 동기화 설정으로 용도가 변경된다.

- 신규 UI 위치: `screens/SetupScreen/IniConfig`
- 화면 유형: 전체 화면 (Screen, 유지보수 모드)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | INI feature flag | 유지보수 모드 접근 제어 |
| CLAUDE.md | DB 엔진 전환 | MSSQL -> SQLite, INI -> Config 테이블 |
| CLAUDE.md | 디렉토리 구조 | screens/SetupScreen 배치 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| INI-F01 | 설정 저장 | P0 | SYSTEM:UPDATE_CONFIG | UpdateSystemConfigUseCase | SystemMgr | Tables/System/ConfigCrud, Tables/System/StoreInfoCrud (SQLite) |
| INI-F02 | 닫기 | P0 | 없음 (라우팅) | - | - | - |
| INI-F03 | POS 타입 선택 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| INI-F04 | POS 번호 입력 | P0 | 없음 (UI 로컬 상태) | - | - | - |
| INI-F05 | POS 이름 입력 (숨김) | P2 | 없음 (UI 로컬 상태) | - | - | - |
| INI-F06 | 매장PC 이름 입력 | P1 | 없음 (UI 로컬 상태) | - | - | - |
| INI-F07 | 매장PC IP/포트 입력 (숨김) | P2 | 없음 (UI 로컬 상태) | - | - | - |
| INI-F08 | 서버 타입/이름/IP/포트 입력 (숨김) | P2 | 없음 (UI 로컬 상태) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+------------------------------------------+
| [저장] [닫기]                              |
|                                          |
| POS 타입    [드롭다운]                     |
| POS 번호    [텍스트 입력]                   |
| 매장PC 이름  [텍스트 입력]                   |
|                                          |
| (조건부) 서버 연결 설정                      |
| 서버 타입    [드롭다운]                     |
| 서버 이름    [텍스트 입력]                   |
| 서버 IP      [텍스트 입력]                   |
| 서버 포트    [텍스트 입력]                   |
+------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 드롭다운 | shared/ui/atoms/Select | POS 타입, 서버 타입 |
| 텍스트 입력 | shared/ui/atoms/TextInput | POS 번호, 이름, IP, 포트 |
| 라벨 | shared/ui/atoms/Label | 폼 라벨 (i18n 기반) |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| INI-D01 | POS 타입 | Select | systemApi.getConfig |
| INI-D02 | POS 번호 | TextInput | systemApi.getConfig |
| INI-D03 | POS 이름 (숨김) | TextInput | systemApi.getConfig |
| INI-D04 | 매장PC 이름 | TextInput | systemApi.getConfig |
| INI-D05~D10 | 서버 관련 필드 (숨김) | TextInput / Select | systemApi.getConfig |
| INI-D11 | 라벨 10개 (숨김) | Label | i18n 기반 |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| SYSTEM:GET_CONFIG | `{}` | `{ config: { ... } }` | (없음) | 설정 로드 |
| SYSTEM:UPDATE_CONFIG | `{ posType, posNo, posName, saleName, serverConfig }` | `{ success }` | (없음) | 설정 저장 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| UpdateSystemConfigUseCase | Config/StoreInfo 테이블 갱신 | O (SQLite TX 원자적) | - | - |

> **UseCase 실패 규칙**: SQLite TX 원자적 — 실패 시 전체 롤백. 오프라인 동작 가능 (로컬 설정 변경만, 외부 연동 없음).

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| SystemMgr | UpdateConfig() | 설정 값 갱신 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/System/ConfigCrud | SQLite | 설정 저장/조회 |
| Tables/System/StoreInfoCrud | SQLite | 매장 정보 저장/조회 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| systemApi.getConfig | `SystemConfig` | 설정 로드 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `SharedAssets/i18n/locales/{ko,vi,en}/system.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | |
| Permission | **관리자 전용**. feature flag로 유지보수 모드에서만 접근 가능. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| INI-T01 | POS 타입 변경 후 저장 | Config 테이블 갱신 |
| INI-T02 | 유지보수 모드 외 접근 시도 | 접근 차단 |
| INI-T03 | 서버 연결 정보 저장 | 중앙 서버 동기화 설정 반영 |

---

## 7. 완료 기준

- [ ] INI 파일 기반 설정이 SQLite Config 테이블로 통합된다
- [ ] feature flag로 유지보수 모드 접근 제어가 적용된다
- [ ] 서버 관련 필드가 중앙 서버 동기화 설정으로 용도 변경된다
- [ ] UpdateSystemConfigUseCase가 저장을 처리한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Screen 구현 | `BrandPosApp/PosUi/src/screens/SetupScreen/IniConfig/index.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SystemActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/System/UpdateSystemConfigUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/StoreInfoCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/systemApi.ts` | TODO |
| Screen Shell | `BrandPosApp/PosUi/src/screens/EmployeeScreen/components/IniSettingsDialog.tsx` | DONE (shell) |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_INISET |
| 리소스 값 | 410 |
| 크기 (DLU) | 400 x 300 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 24 (버튼 4, 라벨 10, 입력 10) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_SAVE | 저장 버튼 |
| IDC_EXIT | 닫기 버튼 |
| IDC_POSTYPE (ComboBox) | Select (POS 타입) |
| IDC_POSNO (EditText) | TextInput (POS 번호) |
| IDC_POSNAME (숨김) | TextInput (조건부) |
| IDC_SALENAME | TextInput (매장PC 이름) |
| IDC_SALEIP/PORT (숨김) | TextInput (조건부) |
| IDC_SERVERTYPE~PORT (숨김) | TextInput / Select (조건부) |
| IDC_STATIC x 10 (숨김) | i18n Label |
