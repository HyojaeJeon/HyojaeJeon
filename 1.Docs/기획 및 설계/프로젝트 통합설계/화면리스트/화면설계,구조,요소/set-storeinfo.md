# SET-STOREINFO: 매장 정보 설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-STOREINFO |
| 화면 ID | SetupScreen/StoreInfo |
| 레거시 다이얼로그 | IDD_STOREINFO (리소스 151) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

매장 기본 정보(상호, 사업자번호, 업태, 업종, 대표자, 연락처, 주소 등)를 관리하는 설정 화면이다. 좌측 매장 목록 그리드 + 우측 상세 폼의 마스터-디테일 구조로 구성된다. 매장 정보는 Outbox 동기화 대상으로, 저장 시 OutboxStore에 중앙 서버 업로드 레코드를 함께 기록한다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/StoreInfo/* |
| CLAUDE.md | Offline-First / Sync 규칙 | 매장 정보는 Outbox 동기화 대상 |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | i18n 규칙 | 대표매장 편집 불가 안내 msgKey 기반 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-STOR-001 | 매장 추가/저장 | 매장 정보 생성 및 저장, Outbox 동기화 레코드 생성 | P0 |
| F-STOR-002 | 매장 삭제 | 선택 매장 삭제 | P0 |
| F-STOR-003 | 매장 선택 | 그리드에서 매장 선택 시 상세 폼 로딩 | P0 |
| F-STOR-004 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|                    [삭제]  [추가/저장]  [닫기]                |
+--------------------------------------------------------------+
|                    |  매장번호: {storeNo}                     |
|  매장 목록 그리드  |                                          |
|  - 매장코드        |  상호명    [________________]            |
|  - 매장명          |  사업자번호 [________________]           |
|                    |  업태      [________________]            |
|                    |  업종      [________________]            |
|                    |  대표자    [________________]            |
|                    |  전화번호  [________________]            |
|                    |  휴대폰    [________________]            |
|                    |  주소      [________________________]    |
|                    |  본점선택  [_______________v]            |
|                    |                                          |
|                    |  ※ 대표매장은 사업자번호 변경 불가       |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 매장 목록 | D-STOR-001 |
| shared/ui/atoms/Text | 매장번호 표시, 안내 메시지 | D-STOR-002, D-STOR-014 |
| shared/ui/atoms/TextInput | 상호, 사업자번호, 업태, 업종, 대표자, 전화, 휴대폰, 주소 | D-STOR-003~010 |
| shared/ui/atoms/Select | 본점 선택 | D-STOR-011 |
| shared/ui/atoms/Button | 추가/저장, 삭제, 닫기 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:STORE:SAVE | UI → C++ | `{ storeData: {...} }` | `{ success, store }` | 매장 저장 + Outbox 기록 |
| SETUP:STORE:DELETE | UI → C++ | `{ storeId: string }` | `{ success }` | 매장 삭제 |
| SETUP:STORE:GET_INFO | UI → C++ | `{ storeId: string }` | `{ storeInfo }` | 매장 상세 조회 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:STORE:SAVE | VALIDATION_FAILED | 필수 필드(상호명, 사업자번호) 누락, 사업자번호 형식 오류 |
| SETUP:STORE:SAVE | DUPLICATE_KEY | 동일 매장코드 중복 |
| SETUP:STORE:SAVE | VALIDATION_FAILED | 대표매장의 사업자번호 변경 시도 |
| SETUP:STORE:DELETE | NOT_FOUND | 존재하지 않는 매장 |
| SETUP:STORE:DELETE | IN_USE | 대표매장 삭제 시도, 또는 현재 운영 중인 매장 삭제 시도 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupStoreApi.getStoreList | GET | `StoreList` | 매장 목록 조회 |
| setupStoreApi.getStoreInfo | GET | `StoreInfo:{storeId}` | 매장 상세 조회 |
| setupStoreApi.saveStore | MUTATION | invalidates `StoreList`, `StoreInfo:{storeId}` | 매장 저장 |
| setupStoreApi.deleteStore | MUTATION | invalidates `StoreList` | 매장 삭제 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveStoreInfoUseCase | 매장 저장/삭제 | SystemMgr | Tables/System/StoreInfoCrud + OutboxStore |
| GetStoreInfoUseCase | 매장 조회 | SystemMgr | Tables/System/StoreInfoCrud |

#### UseCase 실패 규칙

- **멱등성**: 매장 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 StoreInfo UPDATE + OutboxStore INSERT 원자적 (단일 TX)
- **참조 무결성**: 대표매장은 삭제 불가. 현재 운영 중인 매장 삭제 시 IN_USE 에러
- **Outbox**: 매장 정보 변경은 중앙 동기화 대상 (매장 설정 → CentralApi). 저장 시 OutboxStore에 동기화 레코드 함께 기록
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능. Outbox 레코드는 온라인 복구 시 자동 전송

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- TODO: 사업자번호 변경 시 추가 인증 절차 필요 여부 검토

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-STOR-001 | 매장 목록 | shared/ui/organisms/DataGrid | setupStoreApi.getStoreList |
| D-STOR-002 | 매장 번호 | shared/ui/atoms/Text | setupStoreApi.getStoreInfo → storeNo |
| D-STOR-003 | 매장명 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → name |
| D-STOR-004 | 사업자번호 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → bizNo |
| D-STOR-005 | 업태 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → condition |
| D-STOR-006 | 업종 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → type |
| D-STOR-007 | 대표자 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → president |
| D-STOR-008 | 전화번호 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → tel |
| D-STOR-009 | 휴대폰번호 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → phone |
| D-STOR-010 | 주소 | shared/ui/atoms/TextInput | setupStoreApi.getStoreInfo → addr |
| D-STOR-011 | 본점 선택 | shared/ui/atoms/Select | setupStoreApi.getStoreList → mainStore |
| D-STOR-014 | 안내 메시지 | shared/ui/atoms/Text | i18n msgKey |

### 5.5 상태 관리

- 선택된 매장: UI slice (setupStoreUiSlice.selectedStoreId)
- 매장 목록/상세: RTK Query 캐시
- 폼 편집 상태: 로컬 컴포넌트 상태

### 5.6 i18n

- 필드 라벨, 버튼: SharedAssets/i18n/locales/ 기반 msgKey
- 대표매장 편집 불가 안내: msgKey 기반 (하드코딩 금지)

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-STOR-001 | 매장 추가 → 저장 | 매장 목록 반영, DB 저장, Outbox 레코드 생성 |
| T-STOR-002 | 매장 선택 | 상세 폼에 매장 정보 로딩 |
| T-STOR-003 | 대표매장 사업자번호 수정 시도 | 편집 불가 안내 메시지 표시 |
| T-STOR-004 | 매장 삭제 | 목록에서 제거, DB 반영 |
| T-STOR-005 | Outbox 동기화 | 저장 시 OutboxStore에 동기화 레코드 생성 확인 |
| T-STOR-006 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/StoreInfo 화면 구현 완료
- [ ] 매장 CRUD (추가/저장/삭제)
- [ ] 마스터-디테일 레이아웃 (좌측 목록 + 우측 폼)
- [ ] 대표매장 사업자번호 편집 불가 처리
- [ ] 저장 시 Outbox 동기화 레코드 생성
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/StoreInfoDialog.tsx | 매장 정보 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/StoreInfo/StoreListPanel.tsx | 좌측 매장 목록 패널 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/StoreInfo/StoreDetailForm.tsx | 우측 매장 상세 폼 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/shared/ui/atoms/TextInput.tsx | 공용 텍스트 입력 | TODO |
| BrandPosApp/PosUi/src/shared/ui/atoms/Select.tsx | 공용 선택 콤보 | TODO |
| BrandPosApp/PosUi/src/store/api/setupStoreApi.ts | 매장 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupStoreUiSlice.ts | 매장 설정 UI 상태 | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupStoreCommands.ts | 매장 설정 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveStoreInfoUseCase.cpp | 매장 저장 UseCase | TODO |
| BrandPosApp/UseCases/System/GetStoreInfoUseCase.cpp | 매장 조회 UseCase | TODO |
| BrandPosApp/Domain/System/SystemMgr.cpp | 시스템 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/StoreInfoCrud.cpp | 매장 정보 CRUD | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Stores/OutboxStore.cpp | Outbox 동기화 저장소 | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_STOREINFO |
| 리소스 값 | 151 |
| 크기 (DLU) | 400 x 300 |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 33 (버튼 4, 라벨 17, 입력 11, 그리드 1) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID | 매장 목록 그리드 | 좌측 |
| IDC_STORE_NO | 매장 번호 (Static) | |
| IDC_STORE_NAME | 매장명 (EditText) | |
| IDC_STORE_BIZNO | 사업자번호 (EditText) | |
| IDC_STORE_CONDITION | 업태 (EditText) | |
| IDC_STORE_TYPE | 업종 (EditText) | |
| IDC_STORE_PRESIDENT | 대표자 (EditText) | |
| IDC_STORE_TEL | 전화번호 (EditText) | |
| IDC_STORE_HPHONE | 휴대폰 (EditText) | |
| IDC_STORE_ADDR | 주소 (EditText) | |
| IDC_STORE_MAIN | 본점 선택 (ComboBox) | |
| IDC_STA_INFO | 안내 메시지 (Static) | |

### 제외 대상 (숨김 컨트롤)

- IDC_CB_SELECT_CLIENT3: 클라이언트 선택 (NOT WS_VISIBLE)
- IDC_STORE_PAYTYPE: 결제방식 (NOT WS_VISIBLE)
- IDC_SETWEEK: 요일별 판매요금 (NOT WS_VISIBLE)

### 마이그레이션 노트

- 사업자번호 필드는 대표 매장일 경우 편집 불가 안내를 i18n msgKey로 처리한다.
- 매장 정보는 Outbox 동기화 대상으로, 저장 시 OutboxStore에 중앙 서버 업로드 레코드를 함께 기록한다.
