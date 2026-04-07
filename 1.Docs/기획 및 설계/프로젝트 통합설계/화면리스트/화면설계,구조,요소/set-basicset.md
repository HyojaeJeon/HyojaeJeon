# SET-BASICSET: 기초 설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-BASICSET |
| 화면 ID | SetupScreen/BasicConfig |
| 레거시 다이얼로그 | IDD_BASICSET (리소스 157) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

POS 운영의 기초 설정 항목(환경, 테이블, 추가기능, 주문판매, 프린터, 마감 등)을 관리하는 화면이다. 7개 탭(전체/환경(A)/테이블(B)/추가기능(C)/주문판매(D)/프린터(E)/마감(F))으로 분류된 수십~수백 개의 설정 항목을 좌측 항목 목록 + 우측 설정값 편집 그리드의 2패널 구조로 표시한다. 일부 설정 변경은 POS 운영에 즉시 영향을 주므로 저장 시 확인 다이얼로그를 표시한다.

- **운영 모드**: Setup mode

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/BasicConfig/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | 탭 전환은 RTK Query 캐시 내 필터링으로 처리 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-BSET-001 | 기초설정 저장 | 변경된 설정 항목 일괄 저장. 확인 다이얼로그 표시 | P0 |
| F-BSET-002 | 전체 탭 표시 | 모든 설정 항목 표시 | P0 |
| F-BSET-003 | 환경(A) 탭 선택 | 환경 관련 설정 항목만 필터 | P0 |
| F-BSET-004 | 테이블(B) 탭 선택 | 테이블 관련 설정 항목만 필터 | P0 |
| F-BSET-005 | 추가기능(C) 탭 선택 | 추가기능 설정 항목만 필터 | P1 |
| F-BSET-006 | 주문판매(D) 탭 선택 | 주문판매 관련 설정 항목만 필터 | P0 |
| F-BSET-007 | 프린터(E) 탭 선택 | 프린터 관련 설정 항목만 필터 | P1 |
| F-BSET-008 | 마감(F) 탭 선택 | 마감 관련 설정 항목만 필터 | P1 |
| F-BSET-009 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  [전체][환경(A)][테이블(B)][추가기능(C)][주문판매(D)]         |
|  [프린터(E)][마감(F)]                   [저장]  [닫기]       |
+--------------------------------------------------------------+
|                                        |                     |
|  설정 항목 목록 그리드                  | 설정값 편집 그리드   |
|  - 항목명                              | - 값 (인라인 편집)   |
|  - 카테고리                            | - 콤보/텍스트/체크   |
|  - 현재값 미리보기                     |                     |
|  (가상화 스크롤 적용)                   |                     |
|                                        |                     |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 설정 항목 목록, 설정값 편집 | D-BSET-001, D-BSET-002 |
| shared/ui/molecules/TabGroup | 7개 카테고리 탭 | F-BSET-002~008 |
| shared/ui/atoms/Button | 저장, 닫기, 탭 버튼 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:BASIC:SAVE | UI → C++ | `{ configs: [{key, value}...] }` | `{ success, requireRestart?: boolean }` | 기초설정 저장 |
| SETUP:BASIC:GET_CONFIG | UI → C++ | `{ category?: "all" \| "env" \| "table" \| "additional" \| "orderSale" \| "printer" \| "closing" }` | `{ configs }` | 설정 조회 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupBasicApi.getBasicConfig | GET | `BasicConfig`, `BasicConfig:{category}` | 기초설정 조회. 탭 전환은 캐시 내 필터링 |
| setupBasicApi.saveBasicConfig | MUTATION | invalidates `BasicConfig` | 기초설정 저장 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveBasicConfigUseCase | 기초설정 저장 | SystemMgr | Tables/System/ConfigCrud |
| GetBasicConfigUseCase | 기초설정 조회 | SystemMgr | Tables/System/ConfigCrud |

#### UseCase 실패 규칙

- **멱등성**: 기초설정 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 Config UPDATE 원자적
- **참조 무결성**: 해당 없음 (key-value 설정)
- **Outbox**: 기초설정 변경 → 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup/Maintenance mode 접근 권한 필요)
- TODO: Setup mode 진입 시 관리자 인증 절차 상세 정의 필요

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-BSET-001 | 설정 항목 목록 | shared/ui/organisms/DataGrid (가상화) | setupBasicApi.getBasicConfig |
| D-BSET-002 | 설정값 편집 | shared/ui/organisms/DataGrid (인라인 편집) | setupBasicApi.getBasicConfig → values |

### 5.5 상태 관리

- 선택된 탭: UI slice (setupBasicUiSlice.selectedTab)
- 설정 데이터: RTK Query 캐시
- 편집 상태: 로컬 컴포넌트 상태 (저장 전까지)

### 5.6 i18n

- 탭 라벨, 설정 항목명, 버튼: SharedAssets/i18n/locales/ 기반 msgKey
- 저장 확인 다이얼로그: msgKey 기반

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-BSET-001 | 탭 전환 (전체/환경/테이블 등) | 해당 카테고리 설정 항목만 필터링 |
| T-BSET-002 | 설정값 인라인 편집 → 저장 | 변경된 값 DB 반영 |
| T-BSET-003 | 운영 영향 설정 변경 시 | 확인 다이얼로그 표시 |
| T-BSET-004 | 수백 개 항목 스크롤 | 가상화 스크롤 정상 동작 |
| T-BSET-005 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/BasicConfig 화면 구현 완료
- [ ] 7개 탭 전환 동작
- [ ] 설정값 인라인 편집 + 일괄 저장
- [ ] 가상화 스크롤 적용 (수백 개 항목)
- [ ] 운영 영향 설정 변경 시 확인 다이얼로그
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/BasicSettingsDialog.tsx | 기초설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/BasicConfig/TabPanel.tsx | 카테고리 탭 패널 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/BasicConfig/ConfigGrid.tsx | 설정 항목/값 그리드 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 (가상화) | TODO |
| BrandPosApp/PosUi/src/shared/ui/molecules/TabGroup.tsx | 공용 탭 그룹 | TODO |
| BrandPosApp/PosUi/src/store/api/setupBasicApi.ts | 기초설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/store/slices/setupBasicUiSlice.ts | 기초설정 UI 상태 | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupBasicCommands.ts | 기초설정 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveBasicConfigUseCase.cpp | 기초설정 저장 UseCase | TODO |
| BrandPosApp/UseCases/System/GetBasicConfigUseCase.cpp | 기초설정 조회 UseCase | TODO |
| BrandPosApp/Domain/System/SystemMgr.cpp | 시스템 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/System/ConfigCrud.cpp | 설정 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_BASICSET |
| 리소스 값 | 157 |
| 크기 (DLU) | 512 x 384 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 11 (버튼 9, 그리드 2) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID | 설정 항목 목록 그리드 | 좌측 |
| IDC_GRID2 | 설정값 편집 그리드 | 우측 |
| IDOK | 저장 | |
| IDC_SET_ALL | 전체 탭 | |
| IDC_SET_SET | 환경(A) 탭 | |
| IDC_SET_TABLE | 테이블(B) 탭 | |
| IDC_SET_ADD | 추가기능(C) 탭 | |
| IDC_SET_SALE | 주문판매(D) 탭 | |
| IDC_SET_PRN | 프린터(E) 탭 | |
| IDC_SET_END | 마감(F) 탭 | |

### 마이그레이션 노트

- 좌측 설정 항목 목록 + 우측 설정값 2패널 구조를 유지하되, 탭별 폼 섹션 + 개별 설정 카드 UI로 전환 가능.
- 7개 탭은 React 탭 컴포넌트로 대체하며, 탭 전환 시 RTK Query 캐시 내 필터링으로 처리한다.
- 설정 항목이 매우 많으므로(수십~수백 개) 가상화 스크롤을 적용한다.
- 일부 설정 변경(테이블 수, 주문 방식 등)은 POS 운영에 즉시 영향을 주므로, 저장 시 확인 다이얼로그를 표시한다.
