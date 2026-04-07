# STOCK_VIEW - 재고 조회

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-STOCK-VIEW |
| 레거시 다이얼로그 | IDD_STOCK_VIEW (107) |
| 신규 화면 경로 | screens/StockScreen/View |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

재고 조회 화면이다. 기간(시작일~종료일)과 입고/판매 필터를 설정하여 재고 현황을 조회한다. 카테고리별 품목 재고를 그리드로 표시하며, 엑셀 내보내기 기능을 제공한다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름: UI/Bridge -> UseCases -> Domain/Manager -> Infrastructure |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 재고/발주 업무 흐름 |
| CLAUDE.md | RTK Query 캐시 갱신 전략, 태그 세분화 규칙 |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SV-F01 | 재고 조회 | P0 | STOCK:VIEW | ViewStockUseCase | StockMgr | Tables/Stock/StockViewCrud |
| SV-F02 | 시작일 선택 | P1 | - | - | - | - |
| SV-F03 | 종료일 선택 | P1 | - | - | - | - |
| SV-F04 | 입고 필터 체크 | P1 | - | - | - | - |
| SV-F05 | 판매 필터 체크 | P1 | - | - | - | - |
| SV-F06 | 재고 체크 토글 | P1 | STOCK:VIEW | ViewStockUseCase | StockMgr | Tables/Stock/StockViewCrud |
| SV-F07 | 엑셀 내보내기 | P1 | STOCK:GET_HISTORY | ViewStockUseCase | StockMgr | Tables/Stock/StockViewCrud |
| SV-F08 | 카테고리 그리드 스크롤 | P2 | - | - | - | - |
| SV-F09 | 상세 그리드 스크롤 | P2 | - | - | - | - |
| SV-F10 | 다이얼로그 닫기 | P2 | - (React 라우팅) | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
|                                                    [닫기]      |
| [시작일 DatePicker] ~ [종료일 DatePicker]                      |
| [v] 입고  [v] 판매                   [조회] [엑셀]            |
+---------------+-----------------------------------------------+
| 카테고리       | 재고 상세 DataGrid                             |
| DataGrid       |                                               |
|                |                                               |
|                |                                               |
|                |                                               |
+---------------+-----------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/DataGrid | 카테고리 그리드 | 가상 스크롤 적용 |
| shared/ui/organisms/DataGrid | 재고 상세 그리드 | 가상 스크롤 적용 |
| shared/ui/molecules/DatePicker | 시작일/종료일 선택 | 레거시 SysDateTimePick32 대체 |
| shared/ui/atoms/Checkbox | 입고 필터 | IDC_CHKPUR 대체 |
| shared/ui/atoms/Checkbox | 판매 필터 | IDC_CHKSALE 대체 |

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| STOCK:VIEW | `{ startDate, endDate, itemId? }` | `{ records: [...], summary }` | 기간별 재고 조회. Error: (없음) |
| STOCK:GET_HISTORY | `{ startDate, endDate, format: "excel" }` | `{ filePath }` | 엑셀 파일 생성 후 경로 반환 |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| stockApi.getCategories | `StockCategoryList` | 조회 시 갱신 |
| stockApi.getStockView | `StockView:{startDate}-{endDate}` | 기간별 태그, 부분 갱신 |

### 5.3 UseCase 흐름

**ViewStockUseCase (P0)**
1. 조회 파라미터 검증 (날짜 범위, 필터 조건)
2. StockMgr.GetStockView() - 재고 현황 조회
3. 결과 반환 (읽기 전용, 트랜잭션/Outbox 불필요)

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| StockMgr | GetStockView() | 기간별 재고 현황 집계, 입고/판매 필터 적용 |
| StockMgr | ExportStockToExcel() | 재고 데이터 엑셀 형식 변환 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Stock/StockViewCrud | StockViewCrud.h/cpp | 재고 조회 쿼리 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| STOCK:INPUT_COMPLETED | 다른 POS에서 입고 처리 시 | 조회 중인 기간에 해당하면 캐시 무효화 |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 재고 조회 (STOCK:VIEW) | 관리자 또는 재고 권한 직원 | TODO: 재고 권한 코드(STOCK_READ 등) 확정 필요 |
| 엑셀 내보내기 (STOCK:GET_HISTORY) | 관리자 또는 재고 권한 직원 | 조회 화면 진입과 동일 권한 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| SV-T01 | 기간 설정 후 조회 | 해당 기간 재고 데이터 표시 확인 |
| SV-T02 | 입고 필터만 체크 후 조회 | 입고 데이터만 표시 확인 |
| SV-T03 | 판매 필터만 체크 후 조회 | 판매 데이터만 표시 확인 |
| SV-T04 | 엑셀 내보내기 | 파일 생성 및 다운로드 확인 |
| SV-T05 | 카테고리 선택 시 상세 그리드 갱신 | 선택 카테고리 품목만 표시 |

## 7. 완료기준

- [ ] ViewStockUseCase 조회 로직 구현
- [ ] StockMgr.GetStockView() 도메인 로직 구현
- [ ] screens/StockScreen/View 화면 구현 (shared/ui 컴포넌트 활용)
- [ ] RTK Query stockApi.getStockView endpoint 구현 및 기간별 태그 적용
- [ ] 엑셀 내보내기 기능 구현 (Bridge 경유 파일 저장)
- [ ] 필터 바 (날짜 + 체크박스) 컴포넌트 구성

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| Screen | BrandPosApp/PosUi/src/screens/StockScreen/View/index.tsx |
| Screen hooks | BrandPosApp/PosUi/src/screens/StockScreen/View/hooks/useStockView.ts |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx |
| shared/ui | BrandPosApp/PosUi/src/shared/ui/atoms/Checkbox.tsx |
| RTK Query | BrandPosApp/PosUi/src/store/api/stockApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/stockCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Stock/StockActions.h |
| UseCase | BrandPosApp/UseCases/Stock/ViewStockUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Stock/ViewStockUseCase.h |
| Domain | BrandPosApp/Domain/Stock/StockMgr.cpp |
| Domain | BrandPosApp/Domain/Stock/StockMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockViewCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/StockViewCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_STOCK_VIEW |
| 리소스 값 | 107 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 14 (버튼 8, 입력 필드 4, 그리드/리스트 2) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_SEARCH | 조회 버튼 | screens/StockScreen/View > 조회 버튼 |
| IDCANCEL | 닫기 버튼 | React 라우팅으로 대체 |
| IDC_BTN_EXCEL | 엑셀 내보내기 | 엑셀 다운로드 버튼 |
| IDC_STARTDATE | 시작일 (SysDateTimePick32) | shared/ui/molecules/DatePicker |
| IDC_ENDDATE | 종료일 (SysDateTimePick32) | shared/ui/molecules/DatePicker |
| IDC_CHKPUR | 입고 필터 체크박스 | shared/ui/atoms/Checkbox |
| IDC_CHKSALE | 판매 필터 체크박스 | shared/ui/atoms/Checkbox |
| IDC_STOCKCHECK | 재고 체크 토글 | 토글 컴포넌트 |
| IDC_GRID | 카테고리 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_GRID2 | 재고 상세 그리드 (MFCGridCtrl) | shared/ui/organisms/DataGrid |
| IDC_UP/DOWN, IDC_UP2/DOWN2 | 스크롤 버튼 (4개) | 가상 스크롤로 대체 |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/StockViewDialog.tsx` | DONE |
