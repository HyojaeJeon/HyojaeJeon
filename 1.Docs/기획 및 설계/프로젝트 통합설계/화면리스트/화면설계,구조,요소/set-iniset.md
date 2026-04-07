# SET-INISET: INI 설정 화면

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SET-INISET |
| 화면명 | INI 설정 (POS 초기 설정) |
| 레거시 다이얼로그 | IDD_INISET (리소스 410) |
| 신규 라우트 | `/pos/setup/ini-config` |
| 신규 Screen 경로 | `screens/SetupScreen/IniConfig` |
| 모드 | Setup mode |
| 작성일 | 2026-04-05 |
| 상태 | Shell 구현 완료 |

---

## 1. 화면 개요

POS 기기의 초기 환경을 설정하는 화면이다. POS 타입(메인/서브), POS 번호, POS 이름, 판매처 이름, 서버 접속 정보 등을 관리한다. 멀티 POS 환경에서 POS 목록을 그리드로 표시하고, 선택된 POS의 상세 설정을 편집/저장한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | `screens/SetupScreen/*` 배치 |
| 04-Edge-POS-아키텍처-설계서 | 4.x InternalBridge | `PosRequestActions/System/` thin router |
| 05-Edge-POS-전체-흐름-AZ-가이드 | Setup 모드 진입 흐름 | INI feature flag 기반 |
| CLAUDE.md | DB 엔진 전환 | MSSQL -> SQLite, 서버 접속 필드 재설계 필요 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| INI-F01 | INI 설정 조회 (화면 진입 시 전체 설정 로드) | P1 | `SETUP:INI:GET_CONFIG` | `SaveIniConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INI-F02 | POS 타입 선택 | P1 | - | - | - | - |
| INI-F03 | POS 번호 표시 (읽기 전용) | P1 | `SETUP:INI:GET_CONFIG` | `SaveIniConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INI-F04 | POS 이름 입력 | P1 | - | - | - | - |
| INI-F05 | 판매처 이름 입력 | P1 | - | - | - | - |
| INI-F06 | 판매처 IP 입력 | P2 | - | - | - | - |
| INI-F07 | 판매처 포트 입력 | P2 | - | - | - | - |
| INI-F08 | 서버 타입 선택 | P2 | - | - | - | - |
| INI-F09 | 서버 이름 입력 | P2 | - | - | - | - |
| INI-F10 | 서버 IP 입력 | P2 | - | - | - | - |
| INI-F11 | 서버 포트 입력 | P2 | - | - | - | - |
| INI-F12 | POS 목록 그리드 표시 | P1 | `SETUP:INI:GET_CONFIG` | `SaveIniConfigUseCase` (조회 경로) | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INI-F13 | 설정 저장 | P0 | `SETUP:INI:SAVE` | `SaveIniConfigUseCase` | `SystemMgr` | SQLite `Tables/System/ConfigCrud` |
| INI-F14 | 닫기 (React 라우팅) | P1 | - | - | - | - |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [저장]  [닫기]                                     헤더 영역   |
+---------------+-----------------------------------------------+
|               |  POS 타입:     [Select ▼]                     |
|  POS 목록     |  POS 번호:     [readOnly TextField]            |
|  (DataGrid)   |  POS 이름:     [TextField]                     |
|               |  판매처이름:   [TextField]                     |
|               |  ------ P2 서버 설정 (숨김) ------             |
|               |  판매처 IP:    [TextField]                     |
|               |  판매처 포트:  [TextField]                     |
|               |  서버 타입:    [Select ▼]                     |
|               |  서버 이름:    [TextField]                     |
|               |  서버 IP:      [TextField]                     |
|               |  서버 포트:    [TextField]                     |
+---------------+-----------------------------------------------+
```

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `DataGrid` | `shared/ui/organisms/DataGrid` | POS 목록 표시 (읽기 전용 그리드) |
| `Select` | `shared/ui/atoms/Select` | POS 타입, 서버 타입 드롭다운 |
| `TextField` | `shared/ui/atoms/TextField` | POS 이름, 판매처 이름 등 텍스트 입력 |
| `TextField` (readOnly) | `shared/ui/atoms/TextField` | POS 번호 (읽기 전용) |
| `Button` | `shared/ui/atoms/Button` | 저장, 닫기 |

---

## 5. 구현 명세

### 5.1 RTK Query Endpoints

| Endpoint | 메서드 | 설명 |
|---|---|---|
| `setupApi.useGetIniConfigQuery` | GET | INI 설정 전체 조회 (POS 목록 + 상세 설정) |
| `setupApi.useSaveIniConfigMutation` | POST | INI 설정 저장 |

### 5.2 Bridge Commands

> **설정 Bridge 패턴**: `SETUP:{DOMAIN}:GET_CONFIG` / `SETUP:{DOMAIN}:SAVE` 형태를 따른다. 설정 조회는 `GET_CONFIG`, 설정 저장은 `SAVE`로 통일한다.

| Command | 방향 | Payload | 비고 |
|---|---|---|---|
| `SETUP:INI:GET_CONFIG` | UI -> C++ | `{ v, requestId, timestamp }` | 전체 설정 조회 |
| `SETUP:INI:SAVE` | UI -> C++ | `{ v, requestId, timestamp, idempotencyKey, data: { posType, posName, saleName, ... } }` | 설정 저장, 멱등성 보장 |

### 5.3 UseCase 흐름

**SaveIniConfigUseCase (저장)**
1. **Permission 검사**: 관리자 권한 확인 <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 구체적인 검사 방식 결정 -->
2. `idempotencyKey` 검사 (Ledger)
3. `SystemMgr.validateIniConfig()` 호출
4. SQLite 트랜잭션 (원자적): `ConfigCrud.saveIniConfig()` (마지막 값 덮어쓰기) + Ledger 갱신 + Outbox 레코드 적재 (중앙 서버 동기화용) <!-- TODO: INI 설정 변경이 중앙 서버 동기화 대상인지 확정 필요 -->
5. 커밋 후 `PosRealTimeSender` -> UI 갱신 이벤트

> **설정 UseCase 공통 패턴**: 설정 저장은 마지막 값 덮어쓰기(upsert) 방식이다. 단일 TX로 원자적 커밋하며, 참조 무결성 위반 시 롤백한다. Outbox에 동기화 레코드를 함께 적재한다.

#### UseCase 실패 규칙

- **멱등성**: INI 설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **참조 무결성**: 해당 없음 (key-value 설정)
- **Outbox**: INI 설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.4 Domain/Manager

| Manager | 메서드 | 설명 |
|---|---|---|
| `SystemMgr` | `validateIniConfig()` | INI 설정 유효성 검증 |
| `SystemMgr` | `getIniConfig()` | INI 설정 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 설명 |
|---|---|---|
| SQLite | `Tables/System/ConfigCrud` | INI 설정 CRUD |

### 5.6 Permission

- **관리자 전용 화면**. 일반 직원은 접근 불가. <!-- TODO: 관리자 권한 체계(역할/토큰) 확정 후 UI 진입 차단 + UseCase 검사 이중 적용 -->

### 5.7 주의사항

- 서버/판매처 관련 필드(INI-F06~F11)는 레거시 MSSQL 연결 설정용이며, SQLite 전환 후 대부분 불필요하다. P2로 분류하되, 중앙 서버 연결 설정으로 재설계 필요. <!-- TODO: SQLite 전환 후 서버 설정 필드 재설계 범위 확정 -->
- 레거시 10개 텍스트/라벨이 모두 숨김 상태(TRUE)로 되어 있어, 실제 사용 여부 확인 후 정리 필요. <!-- TODO: 레거시 숨김 라벨 실제 사용 여부 확인 -->

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 | 우선순위 |
|---|---|---|---|
| INI-T01 | 화면 진입 시 POS 목록과 현재 설정이 로드된다 | 그리드에 POS 목록 표시, 상세 필드에 현재값 바인딩 | P1 |
| INI-T02 | POS 타입 변경 후 저장 | DB에 변경된 POS 타입 반영, UI 갱신 | P0 |
| INI-T03 | POS 이름 수정 후 저장 | DB에 변경된 POS 이름 반영 | P0 |
| INI-T04 | 저장 멱등성 확인 | 동일 idempotencyKey로 중복 저장 시 1회만 반영 | P0 |
| INI-T05 | 닫기 버튼 클릭 | Setup 메인 화면으로 라우팅 | P1 |

---

## 7. 완료 기준

- [ ] P0: 설정 저장/조회 정상 동작 (INI-F13, INI-F01)
- [ ] P1: POS 목록 그리드 표시, POS 타입/이름/판매처 입력 동작
- [ ] P1: 닫기 시 React 라우팅 정상 동작
- [ ] P2: 서버 접속 설정 필드 재설계 및 구현 <!-- TODO -->
- [ ] 멱등성 테스트 통과

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| Screen | `BrandPosApp/PosUi/src/screens/SetupScreen/IniConfig/index.tsx` | INI 설정 화면 구현 |
| Screen Hook | `BrandPosApp/PosUi/src/screens/SetupScreen/IniConfig/hooks/useIniConfig.ts` | UI 전용 훅 |
| RTK Query | `BrandPosApp/PosUi/src/store/api/setupApi.ts` | `getIniConfig`, `saveIniConfig` endpoint |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid` | POS 목록 그리드 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/Select` | 드롭다운 (공용) |
| shared/ui | `BrandPosApp/PosUi/src/shared/ui/atoms/TextField` | 텍스트 입력 (공용) |
| Bridge | `BrandPosApp/PosUi/src/bridge/commands/setupCommands.ts` | `SETUP:INI:*` 커맨드 정의 |
| PosRequestActions | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/System/SetupActions.cpp` | INI 설정 thin router |
| UseCase | `BrandPosApp/UseCases/System/SaveIniConfigUseCase.cpp` | INI 설정 저장 UseCase |
| Domain | `BrandPosApp/Domain/System/SystemMgr.cpp` | INI 설정 검증/조회 |
| Infrastructure | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp` | INI 설정 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_INISET |
| 리소스 값 | 410 |
| 크기 (DLU) | 400 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 23 (버튼 2, 텍스트/라벨 10, 입력 필드 10, 그리드 1) |

### A.2 레거시 UI 요소

**버튼 (2개):** IDC_SAVE (저장), IDC_EXIT (닫기)

**텍스트/라벨 (10개):** 모두 숨김 상태(TRUE). 데이터타입, 포스번호, 포스이름, 판매처이름, 판매처컴퓨터이름, 판매처IP, 판매처포트, 서버타입, 서버이름, 서버IP/포트 라벨.

**입력 필드 (10개):**
- IDC_POSTYPE (ComboBox) - POS 타입 선택
- IDC_INIPOSNO (EditText, Disabled) - POS 번호
- IDC_INIPOSNAME (EditText) - POS 이름
- IDC_SALENAME (EditText) - 판매처 이름
- IDC_SALEIP (EditText, 숨김) - 판매처 IP
- IDC_SALEPORT (EditText, 숨김) - 판매처 포트
- IDC_SERVERTYPE (ComboBox, 숨김) - 서버 타입
- IDC_SERVERNAME (EditText, 숨김) - 서버 이름
- IDC_SERVERIP (EditText, 숨김) - 서버 IP
- IDC_SERVERPORT (EditText, 숨김) - 서버 포트

**그리드 (1개):** IDC_GRID (MFCGridCtrl) - POS 목록 그리드

### A.3 마이그레이션 노트

- 숨김 처리된 서버/판매처 관련 필드(INI-F06~F11)는 레거시 MSSQL 연결 설정용이며, SQLite 전환 후 대부분 불필요. P2로 분류하되, 중앙 서버 연결 설정으로 재설계 검토 필요.
- IDC_GRID의 POS 목록은 멀티 POS 환경 설정 그리드로, 신규에서는 DataGrid 컴포넌트로 대체.
- IDC_POSTYPE ComboBox는 POS 유형(메인/서브 등) 선택이며, 신규에서는 Select 컴포넌트로 대체.
- 레거시 10개 텍스트/라벨이 모두 숨김 상태(TRUE)로 되어 있어, 실제 사용 여부 확인 후 정리 필요.
