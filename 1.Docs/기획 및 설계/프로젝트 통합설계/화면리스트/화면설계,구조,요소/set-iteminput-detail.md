# SET-ITEMINPUT-DETAIL: 상품 상세설정 화면

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SET-ITEMDETAIL |
| 화면 ID | SetupScreen/ItemDetail |
| 레거시 다이얼로그 | IDD_ITEMINPUT_DETAIL (리소스 130) |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

개별 상품의 세부 속성을 설정하는 화면이다. 레거시에서 121개 UI 요소를 가진 가장 복잡한 설정 화면으로, 색상/메뉴할인/금액변경/재고/사이즈별가격/매장별설정/포인트/부가세/주문프린터/상품유형/이미지 등 다수의 섹션으로 구성된다. 각 섹션에는 "그룹적용/전체상품적용" 일괄 반영 패턴이 공통으로 존재한다. 신규에서는 섹션별 아코디언/탭 UI로 분리한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 2.3 통합 목표 디렉토리 구조 | screens/SetupScreen/ItemDetail/* |
| CLAUDE.md | PosUi 개발 규칙 | shared/ui import, 공용 컴포넌트 우선 |
| CLAUDE.md | RTK Query 캐시 갱신 전략 | mutation 성공 시 updateQueryData 직접 패치 |
| CLAUDE.md | Bridge 규칙 | PosRequestSender 경유 |

---

## 3. 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|---|---|---|---|
| F-IDET-001 | 배경색 선택 | 메뉴 버튼 배경색 설정 | P1 |
| F-IDET-002 | 글자색 선택 | 메뉴 버튼 글자색 설정 | P1 |
| F-IDET-003 | 색상 그룹적용 | 색상 설정을 그룹 전체에 적용 | P1 |
| F-IDET-004 | 색상 전체상품적용 | 색상 설정을 전체 상품에 적용 | P1 |
| F-IDET-005 | 메뉴할인 설정 | 할인여부/타입/금액 설정 | P1 |
| F-IDET-006 | 메뉴할인 그룹적용 | 할인 설정을 그룹 전체에 적용 | P1 |
| F-IDET-007 | 메뉴할인 전체상품적용 | 할인 설정을 전체 상품에 적용 | P1 |
| F-IDET-008 | 금액변경 설정 | 주문 시 금액 고정/변경 선택 | P1 |
| F-IDET-009 | 금액변경 그룹적용 | 금액변경 설정을 그룹 전체에 적용 | P1 |
| F-IDET-010 | 금액변경 전체상품적용 | 금액변경 설정을 전체 상품에 적용 | P1 |
| F-IDET-011 | 재고관리 설정 | 재고 사용여부/단위 설정 | P1 |
| F-IDET-012 | 재고 그룹적용 | 재고 설정을 그룹 전체에 적용 | P1 |
| F-IDET-013 | 재고 전체상품적용 | 재고 설정을 전체 상품에 적용 | P1 |
| F-IDET-014 | 사이즈별 가격 설정 | SIZE1~3 이름/가격 설정 | P1 |
| F-IDET-015 | 매장별 설정 | 매장별 개별 상품 설정 | P2 |
| F-IDET-016 | 매장별 그룹적용 | 매장 설정을 그룹 전체에 적용 | P2 |
| F-IDET-017 | 매장별 전체상품적용 | 매장 설정을 전체 상품에 적용 | P2 |
| F-IDET-018 | 포인트 설정 | 사용여부/타입/등급별 적립률 설정 | P1 |
| F-IDET-019 | 포인트 그룹적용 | 포인트 설정을 그룹 전체에 적용 | P1 |
| F-IDET-020 | 포인트 전체상품적용 | 포인트 설정을 전체 상품에 적용 | P1 |
| F-IDET-021 | 부가세 설정 | 부가세 타입/금액 설정 | P0 |
| F-IDET-022 | 부가세 그룹적용 | 부가세 설정을 그룹 전체에 적용 | P1 |
| F-IDET-023 | 부가세 전체상품적용 | 부가세 설정을 전체 상품에 적용 | P1 |
| F-IDET-024 | 주문프린터 설정 | POS번호/COM포트/인쇄횟수 x7 설정 | P1 |
| F-IDET-025 | 주문프린터 그룹적용 | 프린터 설정을 그룹 전체에 적용 | P1 |
| F-IDET-026 | 주문프린터 전체상품적용 | 프린터 설정을 전체 상품에 적용 | P1 |
| F-IDET-027 | 상품유형 설정 | 상품 유형 콤보 선택 | P1 |
| F-IDET-028 | 상품유형 그룹적용 | 유형 설정을 그룹 전체에 적용 | P1 |
| F-IDET-029 | 상품유형 전체상품적용 | 유형 설정을 전체 상품에 적용 | P1 |
| F-IDET-030 | 메뉴폰트 설정 | 메뉴 버튼 폰트 크기 설정 | P2 |
| F-IDET-031 | 메뉴 이미지 설정 | 메뉴 이미지 라디오 + base64 | P2 |
| F-IDET-032 | 시간별 가격 설정 | 기본시간/연장시간/초과금액 | P2 |
| F-IDET-033 | 전체 저장 | 모든 섹션 변경사항 일괄 저장 | P0 |
| F-IDET-034 | 닫기 | ItemInput 화면으로 복귀 | P0 |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
|  상품명: {name}    판매가: {saleAmt}     [저장]  [닫기]      |
+--------------------------------------------------------------+
|                                                              |
|  [섹션: 색상]          [섹션: 주문프린터]                     |
|   배경색 [__] [선택]     POS1: [__] COM:[__] 횟수:[__]      |
|   글자색 [__] [선택]     POS2: [__] COM:[__] 횟수:[__]      |
|   폰트   [__]           ...x7열                              |
|   [그룹적용] [전체적용]   [그룹적용] [전체적용]               |
|                                                              |
|  [섹션: 메뉴할인]       [섹션: 포인트]                       |
|   할인여부 (O)(X)        사용여부 (O)(X)                     |
|   할인타입 (정액)(정률)   적립타입 (정액)(정률)               |
|   할인금액 [____]        VIP [__] / 우수 [__] / 일반 [__]    |
|   [그룹적용] [전체적용]   [그룹적용] [전체적용]               |
|                                                              |
|  [섹션: 금액변경]       [섹션: 부가세]                       |
|  [섹션: 재고관리]       [섹션: 상품유형]                     |
|  [섹션: 사이즈별가격]   [섹션: 시간별가격]                   |
|  [섹션: 매장별설정]     [섹션: 이미지]                       |
+--------------------------------------------------------------+
```

- 섹션별 아코디언 또는 탭 UI로 분리
- 각 섹션에 공통 "그룹적용/전체상품적용" 버튼 패턴

### 4.2 공용 UI 컴포넌트 매핑

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| shared/ui/atoms/Text | 상품명, 판매가 표시 | D-IDET-001, D-IDET-002 |
| shared/ui/atoms/TextInput | 각 섹션 입력 필드 | 색상값, 금액, 단위 등 |
| shared/ui/atoms/NumberInput | 숫자 입력 (금액, 수량, 비율) | 할인금액, 적립률 등 |
| shared/ui/atoms/Select | 콤보박스 (폰트, 매장, VAT타입, 상품유형, COM포트) | 전체 콤보 |
| shared/ui/atoms/RadioGroup | 라디오 버튼 그룹 | 할인여부, 재고사용, 포인트 등 |
| shared/ui/molecules/BatchApplyAction | TODO: 그룹적용/전체적용 공용 버튼 쌍 | 전 섹션 공통 |
| shared/ui/molecules/ColorPicker | TODO: 색상 선택기 (Win32 색상 피커 대체) | 색상 섹션 |

---

## 5. 구현 명세

### 5.1 Bridge Commands

| Command | 방향 | Payload | 응답 | 비고 |
|---|---|---|---|---|
| SETUP:ITEM:UPDATE_DETAIL | UI → C++ | `{ itemCode, section, scope: "single" \| "group" \| "all", data: {...} }` | `{ success }` | 모든 섹션/배치 적용 통합 |
| SETUP:ITEM:UPDATE_DETAIL (saveAll) | UI → C++ | `{ itemCode, allSections: {...} }` | `{ success }` | 전체 저장 |

#### Bridge Error 규칙

| Command | Error Code | 조건 |
|---|---|---|
| SETUP:ITEM:UPDATE_DETAIL | VALIDATION_FAILED | 필수 필드 누락, 금액/비율 범위 초과 |
| SETUP:ITEM:UPDATE_DETAIL | NOT_FOUND | 존재하지 않는 itemCode |
| SETUP:ITEM:UPDATE_DETAIL (scope: "group") | TODO: 그룹 내 일부 상품 실패 시 부분 적용 vs 전체 롤백 정책 결정 필요 | |

### 5.2 RTK Query Endpoints

| Endpoint | 메서드 | 태그 | 비고 |
|---|---|---|---|
| setupItemApi.getItemDetail | GET | `ItemDetail:{itemCode}` | 상품 상세 정보 조회 |
| setupItemApi.updateItemDetail | MUTATION | invalidates `ItemDetail:{itemCode}`, `ItemList` | onQueryStarted + updateQueryData |

### 5.3 UseCase 매핑

| UseCase | 트리거 | Domain/Manager | Infrastructure |
|---|---|---|---|
| UpdateItemDetailUseCase | 모든 섹션 저장/배치적용 | ItemMgr | Tables/Item/ItemCrud |

#### UseCase 실패 규칙

- **멱등성**: 상품 상세 저장은 마지막 값 덮어쓰기 (idempotencyKey 불필요)
- **트랜잭션**: SQLite TX 내에서 섹션별/전체 UPDATE 원자적. 배치 적용(그룹/전체) 시 전체를 단일 TX로 처리
- **참조 무결성**: 해당 없음 (상품 상세 속성은 다른 테이블에서 참조하지 않음)
- **Outbox**: 상품 상세 변경은 중앙 동기화 대상 (매장 상품 → CentralApi)
- **오프라인**: 로컬 DB만 사용, 오프라인 동작 가능

### 5.7 Permission

- 설정 화면은 관리자 전용 (Setup mode 자체가 관리자 접근)
- TODO: "전체상품적용" 배치 작업 시 추가 확인 절차 필요 여부 검토

### 5.4 데이터 표시 요소

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| D-IDET-001 | 상품명 | shared/ui/atoms/Text | setupItemApi.getItemDetail → name |
| D-IDET-002 | 판매가 | shared/ui/atoms/Text | setupItemApi.getItemDetail → saleAmt |
| D-IDET-003 | 상품코드 (내부) | 내부 상태 | setupItemApi.getItemDetail → code |
| D-IDET-004 | 원가 (내부) | 내부 상태 | setupItemApi.getItemDetail → originalAmt |
| D-IDET-005 | 이익금 (내부) | 내부 상태 | setupItemApi.getItemDetail → profit |
| D-IDET-006 | 기본시간/연장시간/초과금액 | shared/ui/atoms/Text | setupItemApi.getItemDetail → timePrice |

### 5.5 상태 관리

- 현재 편집 중인 상품코드: 라우트 파라미터 또는 부모 전달
- 각 섹션 편집 상태: 로컬 컴포넌트 상태 (저장 전까지)
- 저장된 상세 데이터: RTK Query 캐시

### 5.6 i18n

- 섹션 타이틀, 라벨, 버튼: BrandPosApp/PosUi/src/i18n/locales/ 기반 msgKey

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| T-IDET-001 | 상품 상세 진입 | 상품명, 판매가 정상 표시, 각 섹션 데이터 로딩 |
| T-IDET-002 | 색상 변경 → 저장 | 배경색/글자색 DB 반영 |
| T-IDET-003 | 메뉴할인 그룹적용 | 같은 그룹 전체 상품에 할인 설정 반영 |
| T-IDET-004 | 부가세 전체상품적용 | 전체 상품에 부가세 설정 반영 |
| T-IDET-005 | 주문프린터 설정 (7열) | 각 POS별 프린터 설정 정상 저장 |
| T-IDET-006 | 전체 저장 | 모든 섹션 변경사항 일괄 DB 반영 |
| T-IDET-007 | mockTransport 환경 | C++ 없이 독립 동작 |

---

## 7. 완료 기준

- [ ] screens/SetupScreen/ItemDetail 화면 구현 완료
- [ ] 모든 섹션(색상, 메뉴할인, 금액변경, 재고, 사이즈, 매장, 포인트, VAT, 프린터, 유형, 이미지, 시간가격) 구현
- [ ] 그룹적용/전체적용 공통 패턴 BatchApplyAction 컴포넌트 추출
- [ ] 색상 선택기(ColorPicker) 구현 (Win32 피커 대체)
- [ ] 주문프린터 7열 동적 렌더링
- [ ] mockTransport 독립 개발 가능
- [ ] 1024x768 해상도 + 터치 사용성 검증

---

## 8. 작업 명단

| 파일 경로 | 역할 | 상태 |
|---|---|---|
| BrandPosApp/PosUi/src/screens/SettingsScreen/components/ItemInputDetailDialog.tsx | 상품 상세설정 메인 (shell) | SHELL 완료 (2026-04-05) |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/ColorSection.tsx | 색상 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/MenuDiscountSection.tsx | 메뉴할인 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/PriceChangeSection.tsx | 금액변경 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/StockSection.tsx | 재고관리 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/SizeSection.tsx | 사이즈별 가격 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/StoreSection.tsx | 매장별 설정 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/PointSection.tsx | 포인트 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/VatSection.tsx | 부가세 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/PrinterSection.tsx | 주문프린터 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/ItemTypeSection.tsx | 상품유형 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/ImageSection.tsx | 이미지 섹션 | TODO |
| BrandPosApp/PosUi/src/screens/SetupScreen/ItemDetail/TimePriceSection.tsx | 시간별 가격 섹션 | TODO |
| BrandPosApp/PosUi/src/shared/ui/molecules/BatchApplyAction.tsx | 그룹적용/전체적용 공용 컴포넌트 | TODO |
| BrandPosApp/PosUi/src/shared/ui/molecules/ColorPicker.tsx | 색상 선택기 | TODO |
| BrandPosApp/PosUi/src/store/api/setupItemApi.ts | getItemDetail, updateItemDetail | TODO |
| BrandPosApp/UseCases/System/UpdateItemDetailUseCase.cpp | 상품 상세 수정 UseCase | TODO |
| BrandPosApp/Domain/Item/ItemMgr.cpp | 상품 Manager | TODO |
| BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp | 상품 CRUD | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_ITEMINPUT_DETAIL |
| 리소스 값 | 130 |
| 크기 (DLU) | 512 x 384 |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | RestaurantSet.rc |
| 총 UI 요소 수 | 121 (버튼 22, 라벨 11, 입력 87, 기타 1) |

### 레거시 섹션별 컨트롤 구성

**색상 섹션**: IDC_DETAIL_COLOR, IDC_DETAIL_COLOR2, IDC_COLORSELECT, IDC_COLORSELECT2, IDC_CB_MEMUFONT, IDC_COLOR_GRP, IDC_COLOR_APPLY

**메뉴할인 섹션**: IDC_MENUDCO, IDC_MENUDCX, IDC_MENUDCTYPE1, IDC_MENUDCTYPE2, IDC_MENUDC_AMT, IDC_MEUNUDC_GRP, IDC_MEUNUDC_APPLY

**금액변경 섹션**: IDC_ORDERAMT_FIX, IDC_ORDERAMT_CHANGE, IDC_AMTCHANGE_GRP, IDC_AMTCHANGE_APPLY

**재고 섹션**: IDC_STOCKO, IDC_STOCKX, IDC_STOCK_USEUNIT, IDC_STOCK_UNIT, IDC_STOCK_GRP, IDC_STOCK_APPLY

**사이즈 섹션**: IDC_SIZE1_NAME~IDC_SIZE3_PRICE (6개)

**매장별 섹션**: IDC_STORELIST, IDC_STORE_GRP, IDC_STORE_APPLY

**포인트 섹션**: IDC_POINTO~IDC_POINTCASH2, IDC_POINTAMT_* (등급별 적립 x3), IDC_POINT_GRP, IDC_POINT_APPLY

**부가세 섹션**: IDC_VATTYPE, IDC_VATAMT, IDC_VAT_GRP, IDC_VAT_APPLY

**주문프린터 섹션**: IDC_POSNO1~7, IDC_COM1~7, IDC_PRNCNT1~7 (x7열), IDC_COM_GRP, IDC_COM_APPLY

**상품유형 섹션**: IDC_CB_ITEMTYPE, IDC_ITEMTYPE_GRP, IDC_ITEMTYPE_APPLY

**이미지 섹션**: IDC_MENU_IMAGE1, IDC_MENU_IMAGE2, IDC_IMAGE_BASE64

### 제외/숨김 대상

- IDC_CHK_ITEMNEW: 신상품 체크 (NOT WS_VISIBLE)
- IDC_STOCK_QTY, IDC_STOCK_AMT: 재고 수량/금액 (NOT WS_VISIBLE)
- IDC_STOCK_ORIGNALO, IDC_STOCK_ORIGNALX: 원가 관련 (NOT WS_VISIBLE)
- IDC_WORKO, IDC_WORKX, IDC_WORKTYPE, IDC_WORKAMT: 작업 관련 (NOT WS_VISIBLE)
- IDC_CHK_FLOORPRN: 층별인쇄 (NOT WS_VISIBLE)
- IDC_CHK_DCPACK: 할인팩 (NOT WS_VISIBLE)
- IDC_CB_PRNREG1~7: 프린터 드라이버 (NOT WS_VISIBLE)
- IDC_DETAIL_CODE, IDC_DETAIL_ORGIAMT, IDC_DETAIL_PROFIT, IDC_DETAIL_ITEMSET, IDC_DETAIL_PRN, IDC_DETAIL_NAME: 숨김 데이터 필드

### 마이그레이션 노트

- "그룹적용/전체상품적용" 패턴이 반복되므로 공용 `BatchApplyAction` 컴포넌트를 `shared/ui/molecules/`에 추출한다.
- 주문프린터 섹션(POS번호/COM/인쇄횟수 x7열)은 반복 구조로 동적 렌더링 처리한다.
- 색상 선택은 레거시 Win32 색상 피커 대신 React 기반 ColorPicker 컴포넌트로 대체한다.
- 모든 배치 적용(그룹/전체)은 단일 Bridge Command에 scope 파라미터로 구분한다.
