# TABLEMSG_DLG 화면 문서

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 화면명 | `TABLEMSG_DLG` |
| 화면 ID | `IDD_TABLEMSG_DLG` |
| 원본 파일 | `tablemsg-dlg.md` |
| 전환 우선순위 | `P1` |
| 담당 계층 | `PosUi / Presentation / UseCases / Domain / Infrastructure` |
| 상태 | `TODO` |

## 1. 화면 개요

- **화면 목적**: 선택된 테이블에 메시지(메모)를 설정/편집하는 모달 다이얼로그이다. 테이블별 특이사항이나 고객 요청을 기록한다.
- **해결하는 사용자 문제**: 직원이 특정 테이블에 메모(예: "알러지 주의", "VIP 고객", "생일 이벤트")를 남겨 다른 직원/POS에서도 확인할 수 있게 한다.
- **화면 진입 경로**: TableScreen → 기능 선택(TABLE_BSELECT) → 테이블메시지(IDC_TABLEMSG) 클릭
- **화면 종료 경로**: 저장(IDOK) → TableScreen (메시지 저장 후 닫기), 취소(IDCANCEL) → TableScreen
- **관련 운영 주체**: 직원 (홀 서빙, 카운터)

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
| F-001 | 테이블 메시지 저장 | 입력/편집한 메시지를 DB에 저장 | 저장 버튼 클릭 | P1 |
| F-002 | 테이블 메시지 취소 | 편집 내용 폐기, 모달 닫기 | 취소 버튼 클릭 | P1 |
| F-003 | 메시지 그리드 행 선택/편집 | 메시지 목록에서 행을 선택하여 인라인 편집 | 그리드 셀 클릭/입력 | P1 |

## 4. UI 구조

### 4.1 화면 구성

- **상단 영역**: 테이블명(IDC_TABLENAME) 표시, 저장(IDOK) 버튼, 취소(IDCANCEL) 버튼
- **본문 영역**: 메시지 목록 그리드(IDC_GRID) — 편집 가능한 메시지 행 리스트
- **하단 영역**: 없음
- **모달/팝업**: 본 화면 자체가 모달 (TableMessageModal)
- **사이드 패널**: 없음

### 4.2 재사용 UI

| 컴포넌트 | 위치 | props로 바뀌는 값 | 비고 |
|---|---|---|---|
| Label | shared/ui/atoms/Label | text | 테이블명 표시 |
| EditableGrid 또는 MessageList | shared/ui/organisms/EditableGrid 또는 shared/ui/molecules/MessageList | items, onEdit, onDelete | 편집 가능 메시지 리스트. 항목 수가 소수이므로 간단한 입력 폼 + 리스트 조합으로 충분 |

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유 계층 | 원본 | 비고 |
|---|---|---|---|
| 테이블 메시지 목록 | RTK Query 캐시 | tableApi.getTableMessages | 서버 상태 |
| 선택된 테이블 정보 | RTK Query 캐시 | tableApi.getTableDetail | 부모 TableScreen에서 props 전달 |
| 편집 중 메시지 (로컬) | 로컬 컴포넌트 상태 | useState | 저장 전 편집 상태 |

### 5.2 Bridge 계약

| Command | Request | Response | Error | Idempotency | 비고 |
|---|---|---|---|---|---|
| TABLE:SET_MESSAGE | `{ tableId: number, message: string }` | `{ table: { id, message } }` | `TABLE_NOT_FOUND` | `TABLE:SET_MESSAGE:{tableId}` | P1 |

### 5.3 UseCase 계약

| UseCase | Trigger | Input | Transaction | Lock | Output | 실패 규칙 |
|---|---|---|---|---|---|---|
| SetTableMessageUseCase | TABLE:SET_MESSAGE | tableId, message | SQLite TX | TABLE:{tableId} | TableRow | 멱등성: 동일 requestId → 이전 결과 반환 (Ledger 확인). 테이블 없음 → TABLE_NOT_FOUND 에러. 오프라인: 로컬 DB만 사용하므로 오프라인에서도 동작. 트랜잭션: SQLite TX 내에서 테이블 메시지 UPDATE + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 TABLE_MESSAGE_CHANGED 이벤트 브로드캐스트 |

### 5.4 Domain / Manager / Store

| 항목 | 책임 | 파일 / 모듈 | 비고 |
|---|---|---|---|
| TableManager | 테이블 메시지 저장/조회 규칙 | Domain/Table/TableManager | |

### 5.5 DB / CentralApi / Sync / Realtime

| 연동 대상 | 역할 | 데이터 흐름 | 비고 |
|---|---|---|---|
| SQLite Tables/Table/TableCrud | 테이블 메시지 CRUD | UseCase → Manager → Crud → SQLite | 로컬 원본 |
| Outbox | 테이블 메시지 변경 동기화 | 커밋 후 Outbox 적재 → Sync Worker → CentralApi | |
| PosRealTimeSender | 다른 POS에 메시지 변경 브로드캐스트 | UseCase 커밋 후 → PosRealTimeSender → UI | |
| CentralApi | 테이블 메시지 동기화 | 테이블 메시지 변경 → Outbox → Sync Worker → CentralApi `mutation syncTableMessage` | |

### 5.6 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/table.json` | msgKey 기반 |
| Error | 코드 기반 (type, device, code, msgKey) | 완성 문장 금지 |
| Permission | 로그인된 직원 전원: 테이블 메시지 설정/편집 가능 | 메시지는 운영 메모 성격이므로 관리자 권한 불필요 |

## 6. 테스트

| 테스트 항목 | 범위 | 기대 결과 | 유형 |
|---|---|---|---|
| 메시지 저장 후 DB 반영 | TableMessageModal + tableApi | 저장 후 메시지 조회 시 반영 | integration |
| 메시지 취소 시 변경 폐기 | TableMessageModal | 닫기 후 기존 메시지 유지 | unit |
| PosRealTime 수신 시 다른 POS 메시지 갱신 | PosRealTimeReceiver + tableApi | 외부 변경 반영 | integration |
| 빈 메시지 저장 시 기존 메시지 삭제 | TableMessageModal + TABLE:SET_MESSAGE | 빈 문자열 저장 → 기존 메시지 제거, 테이블 메시지 null/빈 문자열 | integration |

## 7. 완료 기준

- [ ] TableMessageModal UI 구현 완료
- [ ] TABLE:SET_MESSAGE Bridge 계약 구현 완료
- [ ] UseCase 연동 완료
- [ ] RTK Query 엔드포인트 구현 완료 (tableApi.getTableMessages)
- [ ] PosRealTime 이벤트 연동 완료
- [ ] i18n 적용 완료
- [ ] 테스트 완료
- [ ] 문서 상태 `DONE`

## 8. 작업 명단

| 작업 | 파일 | 상태 |
|---|---|---|
| TableMessageModal 컴포넌트 | `PosUi/src/screens/TableScreen/components/TableMessageModal.tsx` | TODO |
| EditableGrid 또는 MessageList 컴포넌트 | `PosUi/src/shared/ui/organisms/EditableGrid.tsx` 또는 `shared/ui/molecules/MessageList.tsx` | TODO |
| RTK Query endpoint (테이블 메시지) | `PosUi/src/store/api/tableApi.ts` (getTableMessages, setTableMessage) | TODO |
| Bridge command (테이블 메시지) | `PosUi/src/bridge/commands/table.ts` (SET_MESSAGE) | TODO |
| C++ PosRequestActions/Table (메시지) | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.cpp` | TODO |
| C++ SetTableMessageUseCase | `BrandPosApp/UseCases/Table/SetTableMessageUseCase.cpp` | TODO |
| C++ TableManager (메시지 처리) | `BrandPosApp/Domain/Table/TableManager.cpp` | TODO |

---

## Appendix: 레거시 UI 요소 참조

### 기본 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_TABLEMSG_DLG |
| 리소스 값 | 112 |
| 크기 (DLU) | 400 x 300 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 4 |

### 버튼 (2개)

| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDOK | 저장 | (279,9) | 33 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 확인/완료 버튼 |
| IDCANCEL |  | (334,9) | 33 x 22 | FALSE | BS_OWNERDRAW \| WS_TABSTOP | 닫기/취소 버튼 |

### 텍스트/라벨 (1개)

| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |
|---|---|---|---|---|---|---|
| IDC_TABLENAME | 테이블명 | (92,57) | 84 x 13 | FALSE | 왼쪽 | 테이블명 표시 |

### 그리드/리스트 (1개)

| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |
|---|---|---|---|---|---|
| IDC_GRID | MFCGridCtrl | (30,81) | 341 x 189 | FALSE | 데이터 그리드 |

### 요소 통계

| 유형 | 개수 |
|------|------|
| 버튼 | 2 |
| 텍스트/라벨 | 1 |
| 입력 필드 | 0 |
| 그리드/리스트 | 1 |
| 기타 | 0 |
| **합계** | **4** |

### 마이그레이션 노트 (원본)

- TABLEMSG_DLG는 단순한 4개 요소 구성의 모달이다. 신규 UI에서는 TableScreen 내 모달 컴포넌트(TableMessageModal)로 구현한다.
- MFCGridCtrl 기반 메시지 그리드는 React 기반 편집 가능 리스트 컴포넌트로 대체한다. 메시지 항목이 소수이므로 간단한 입력 폼 + 리스트 조합으로 충분하다.
- 메시지 저장 시 TABLE:SET_MESSAGE Bridge Command를 통해 C++ 측 TableManager에서 로컬 DB에 저장하고, PosRealTimeSender로 다른 POS에 브로드캐스트한다.
- 테이블명(IDC_TABLENAME)은 모달 헤더에 표시하며, 부모 TableScreen에서 선택된 테이블 정보를 props로 전달한다.

## 9. 작업 진행 기록

| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동, RTK Query 연동, PosRealTime 이벤트 연동, i18n | TableMessageDialog shell 구현 완료. Modal 컴포넌트 재사용, 테이블명 헤더 표시, 편집 가능 메시지 리스트(추가/수정/삭제), TextInput 활용, 저장/취소 버튼, 빈 메시지 저장 시 삭제 지원 구현. |
