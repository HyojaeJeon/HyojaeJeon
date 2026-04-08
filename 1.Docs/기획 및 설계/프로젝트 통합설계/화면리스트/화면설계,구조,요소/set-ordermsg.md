# SET-ORDERMSG: 주문 메시지 설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-ORDERMSG |
| 화면 ID | SetupScreen/OrderMessage |
| 레거시 다이얼로그 | IDD_ORDERMSG (리소스 136) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

주문 시 선택 가능한 부가 메시지(예: "맵게", "덜 달게", "얼음 빼고" 등)를 관리하는 설정 화면이다. 할인설정(SALEDC)과 동일한 단일 그리드 CRUD 패턴이며, 그리드 인라인 편집으로 메시지 텍스트를 직접 수정할 수 있다. 주문 화면에서도 참조하므로 캐시 태그를 세분화한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/OrderMessage/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, RTK Query 사용 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | 태그 세분화: OrderMsgList |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-OMSG-001 | 주문메시지 추가 | 새 주문 메시지 생성 | P0 |
| F-OMSG-002 | 주문메시지 저장 | 메시지 일괄 저장 | P0 |
| F-OMSG-003 | 선택삭제 | 선택된 메시지 삭제 | P0 |
| F-OMSG-004 | 닫기 | SetupScreen/index.tsx로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|        [추가] [저장] [선택삭제]                       [닫기]  |
+--------------------------------------------------------------+
|                                                              |
|  주문메시지 목록 그리드 (인라인 편집)                         |
|  - 순번, 메시지 텍스트, 사용여부 등                          |
|                                                              |
+--------------------------------------------------------------+
```

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/organisms/DataGrid | 주문메시지 목록 (인라인 편집) | D-OMSG-001 |
| shared/ui/atoms/Button | CRUD 버튼 | 전체 액션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:ORDER_MSG:SAVE | UI → C++ | `{ action: "add" \| "batch", data: {...} }` | `{ success, messages }` | 메시지 추가/저장 |
| SETUP:ORDER_MSG:DELETE | UI → C++ | `{ selected: true, ids: string[] }` | `{ success }` | 선택삭제 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:ORDER_MSG:SAVE | VALIDATION_FAILED | 메시지 텍스트 빈 값 |
| SETUP:ORDER_MSG:SAVE | DUPLICATE_KEY | 동일 메시지 텍스트 중복 |
| SETUP:ORDER_MSG:DELETE | NOT_FOUND | 존재하지 않는 메시지 |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupOrderMsgApi.getOrderMsgList | GET | `OrderMsgList` | 주문메시지 목록 조회 |
| setupOrderMsgApi.saveOrderMsg | MUTATION | invalidates `OrderMsgList` | 메시지 저장 |
| setupOrderMsgApi.deleteOrderMsg | MUTATION | invalidates `OrderMsgList` | 메시지 삭제 |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| SaveOrderMessageUseCase | 메시지 추가/저장/삭제 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 주문메시지 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 메시지 INSERT/UPDATE/DELETE 원자적. 일괄 저장 시 전체 batch를 단일 TX로 처리
- **참조 무결성**: 주문메시지는 주문 시 참조만 되므로 삭제 시 참조 무결성 제약 없음 (삭제된 메시지는 기존 주문에 텍스트로 이미 저장됨)
- **Outbox**: 주문메시지 변경은 중앙 동기화 대상 (매장 설정 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-OMSG-001 | 주문메시지 목록 | shared/ui/organisms/DataGrid | setupOrderMsgApi.getOrderMsgList |

### 5.5 상태 관리

- 메시지 목록: RTK Query 캐시 (태그: OrderMsgList)
- 그리드 편집 상태: 로컬 컴포넌트 상태

### 5.6 i18n

- 버튼 라벨, 그리드 컬럼 헤더: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey
- 주문메시지 내용 자체는 사용자 입력 데이터 (i18n 대상 아님)

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-OMSG-001 | 메시지 추가 → 저장 | 그리드에 새 메시지 반영 |
| T-OMSG-002 | 인라인 편집 → 저장 | 수정된 텍스트 DB 반영 |
| T-OMSG-003 | 선택삭제 | 선택 행 제거, DB 반영 |
| T-OMSG-004 | 주문 화면에서 참조 | 주문 화면에서 최신 메시지 목록 조회 가능 |
| T-OMSG-005 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/OrderMessage 화면 구현 완료
- [ ] 주문메시지 CRUD (추가/저장/삭제)
- [ ] 그리드 인라인 편집 지원
- [ ] RTK Query 캐시 태그 OrderMsgList 세분화
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/OrderMessageDialog.tsx | 주문메시지 설정 메인 화면 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 공용 데이터 그리드 | TODO |
| BrandPosApp/PosUi/src/store/api/setupOrderMsgApi.ts | 주문메시지 RTK Query API | TODO |
| BrandPosApp/PosUi/src/bridge/commands/setupOrderMsgCommands.ts | 주문메시지 Bridge Command | TODO |
| BrandPosApp/UseCases/System/SaveOrderMessageUseCase.cpp | 주문메시지 저장 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager (메시지 포함) | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품/메시지 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ORDERMSG |
| 리소스 값 | 136 |
| 크기 (DLU) | 450 x 337 |
| 스타일 | DS_SETFONT \| DS_MODALFRAME \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 8 (버튼 7, 그리드 1) |

### 레거시 주요 컨트롤

| 레거시 ID | 용도 | 비고 |
|---|---|---|
| IDC_GRID | 주문메시지 목록 그리드 | 단일 그리드 |
| ID_ORMSG_ADD | 추가 | |
| ID_ORMSG_ALLSAVE | 저장 | |
| ID_ORMSG_SELDEL | 선택삭제 | |

### 제외 대상 (숨김 버튼)

- ID_ORMSG_SELSAVE: 선택저장 (NOT WS_VISIBLE)
- ID_ORMSG_ALLDEL: 전체삭제 (NOT WS_VISIBLE)
- ID_ORMSG_ALLAPPLY: 일괄적용 (NOT WS_VISIBLE)

### 마이그레이션 노트

- 할인설정(SALEDC)과 동일한 단일 그리드 CRUD 패턴이다.
- 주문메시지는 주문 시 선택 가능한 부가 메시지로, 주문 화면에서도 참조하므로 RTK Query 캐시 태그를 OrderMsgList로 세분화한다.
