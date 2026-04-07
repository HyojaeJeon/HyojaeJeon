# SET-SALEDC: 할인매출설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-SALEDC |
| 화면 ID | SetupScreen/DiscountConfig |
| 레거시 다이얼로그 | IDD_SALEDC (리소스 135) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

할인 규칙을 관리하는 설정 화면이다. 단일 그리드 기반의 단순 CRUD 구조로, 할인 규칙 추가/저장/삭제와 적용 상품 선택 기능을 제공한다. 그리드 인라인 편집으로 할인율/금액 등을 직접 수정할 수 있다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/DiscountConfig/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | mutation 성공 시 updateQueryData |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-SLDC-001 | 할인규칙 추가 | 새 할인 규칙 생성 | P0 |
| F-SLDC-002 | 할인규칙 저장 | 할인 규칙 일괄 저장 | P0 |
| F-SLDC-003 | 선택삭제 | 선택된 할인 규칙 삭제 | P0 |
| F-SLDC-004 | 상품선택 | 할인 적용 대상 상품 선택 다이얼로그 | P1 |
| F-SLDC-005 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  [추가] [저장]  [선택삭제]       [상품선택]          [닫기]   |
+--------------------------------------------------------------+
|                                                              |
|  할인규칙 목록 그리드 (인라인 편집)                           |
|  - 할인명, 할인타입(정액/정률), 할인율/금액,                 |
|    적용시간, 적용요일 등                                     |
|                                                              |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 할인규칙 목록 (인라인 편집) | D-SLDC-001 |
| shared/ui/atoms/Button | CRUD 버튼, 상품선택 버튼 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:DISCOUNT:SAVE | UI → C++ | `{ action: "add" \| "batch", data: {...} }` | `{ success, discounts }` | 할인 추가/저장 |
| SETUP:DISCOUNT:DELETE | UI → C++ | `{ selected: true, ids: string[] }` | `{ success }` | 선택삭제 |
| SETUP:DISCOUNT:GET_LIST | UI → C++ | `{ itemSelect?: boolean }` | `{ discounts, items? }` | 목록/상품선택 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:DISCOUNT:SAVE | VALIDATION_FAILED | 필수 필드(할인명, 할인타입, 할인율/금액) 누락, 할인율 범위 초과 |
| SETUP:DISCOUNT:SAVE | DUPLICATE_KEY | 동일 할인규칙명 중복 |
| SETUP:DISCOUNT:DELETE | NOT_FOUND | 존재하지 않는 할인규칙 |
| SETUP:DISCOUNT:DELETE | IN_USE | TODO: 적용 중인 할인규칙 삭제 시 정책 결정 필요 (적용 해제 후 삭제 vs 삭제 차단) |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupDiscountApi.getDiscountList | GET | `DiscountList` | 할인규칙 목록 조회 |
| setupDiscountApi.saveDiscount | MUTATION | invalidates `DiscountList` | 할인 저장 |
| setupDiscountApi.deleteDiscount | MUTATION | invalidates `DiscountList` | 할인 삭제 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveDiscountRuleUseCase | 할인 추가/저장/삭제 | ItemMgr | Tables/Item/ItemCrud |
| GetItemListUseCase | 상품 선택 다이얼로그 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 할인규칙 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 할인규칙 INSERT/UPDATE/DELETE 원자적. 일괄 저장 시 전체 batch를 단일 TX로 처리
- **참조 무결성**: TODO: 적용 중인 할인규칙 삭제 시 상품 측 할인 연결 해제 정책 결정 필요
- **Outbox**: 할인규칙 변경은 중앙 동기화 대상 (매장 할인 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-SLDC-001 | 할인규칙 목록 | shared/ui/organisms/DataGrid | setupDiscountApi.getDiscountList |

### 5.5 상태 관리

- 할인규칙 목록: RTK Query 캐시
- 그리드 편집 상태: 로컬 컴포넌트 상태

### 5.6 i18n

- 버튼 라벨, 그리드 컬럼 헤더: SharedAssets/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-SLDC-001 | 할인규칙 추가 → 저장 | 그리드에 새 규칙 반영 |
| T-SLDC-002 | 인라인 편집 → 저장 | 수정된 값 DB 반영 |
| T-SLDC-003 | 선택삭제 | 선택 행 제거, DB 반영 |
| T-SLDC-004 | 상품선택 다이얼로그 | 상품 목록 모달 표시, 선택 반영 |
| T-SLDC-005 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/DiscountConfig 화면 구현 완료
- [ ] 할인규칙 CRUD (추가/저장/삭제)
- [ ] 그리드 인라인 편집 지원
- [ ] 상품선택 다이얼로그 (setupItemApi.getItemList 재사용)
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/SaleDiscountDialog.tsx | 할인설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/DiscountConfig/ItemSelectDialog.tsx | 상품선택 다이얼로그 | TODO |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/store/api/setupDiscountApi.ts | 할인 설정 RTK Query API | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupDiscountCommands.ts | 할인 설정 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveDiscountRuleUseCase.cpp | 할인규칙 저장 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager (할인 포함) | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품/할인 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SALEDC |
| 리소스 값 | 135 |
| 크기 (DLU) | 450 x 337 |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 9 (버튼 8, 그리드 1) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID | 할인규칙 목록 그리드 | 단일 그리드 |
| ID_SALEDC_ADD | 추가 | |
| ID_SALEDC_ALLSAVE | 저장 | |
| ID_SALEDC_SELDEL | 선택삭제 | |
| ID_SALEDC_SELITEM | 상품선택 | |

### 제외 대상 (숨김 버튼)

- ID_SALEDC_SELSAVE: 선택저장 (NOT WS_VISIBLE)
- ID_SALEDC_ALLDEL: 전체삭제 (NOT WS_VISIBLE)
- ID_SALEDC_ALLAPPLY: 일괄적용 (NOT WS_VISIBLE)

### 마이그레이션 노트

- 단일 그리드 기반의 단순 CRUD 화면으로, 신규에서도 동일한 단일 테이블 구조를 유지한다.
- 상품선택 기능은 별도 모달/다이얼로그로 구현하며, 상품 목록은 setupItemApi.getItemList를 재사용한다.
