# SELLLISTVIEW (매출 현황 목록)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-SELLLISTVIEW |
| 레거시 다이얼로그 | IDD_SELLLISTVIEW (리소스 151) |
| 신규 화면 경로 | screens/SalesScreen (탭 기반 뷰) |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

**매출 현황 목록** 화면. 탭 전환(판매현황/상품별/취소내역/테이블현황/담당자별)으로 다양한 매출 뷰를 제공한다. 2개 그리드(목록 + 요약)로 구성된다. 신규 구조에서는 SalesScreen 내부의 탭 기반 목록 뷰로 구현한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| sellview.md | 상위 매출 조회 화면 | SalesScreen 내 탭 뷰 |
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 매출 조회 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| SLV-F01 | 판매현황 탭 | P0 | SALES:SEARCH | - | SaleMgr | SellSlipCrud |
| SLV-F02 | 상품별 탭 | P1 | SALES:SEARCH | - | SaleMgr, ItemMgr | SellDetailCrud |
| SLV-F03 | 취소내역 탭 | P1 | SALES:SEARCH | - | SaleMgr | SellSlipCrud |
| SLV-F04 | 테이블현황 탭 | P1 | SALES:SEARCH | - | SaleMgr, TableManager | SellSlipCrud |
| SLV-F05 | 담당자별 탭 | P2 | SALES:SEARCH | - | SaleMgr, StaffMgr | SellSlipCrud |
| SLV-F06 | 인쇄 | P1 | SALES:EXPORT | - | SaleMgr | SellSlipCrud, Printer |
| SLV-F07 | 닫기 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/SalesScreen/components/
  SalesListTabs.tsx            -- 탭 전환 (판매현황/상품별/취소/테이블/담당자)
  SalesListGrid.tsx            -- 매출 목록 그리드 (IDC_GRID 대체)
  SalesSummaryGrid.tsx         -- 매출 요약 그리드 (IDC_GRID2 대체)
  SalesListHeader.tsx          -- 분석 기준 텍스트, 닫기
  SalesListActionBar.tsx       -- 인쇄
```

### 4.2 재사용 UI (shared/ui/)

해당 없음 (화면 전용 컴포넌트).

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 매출 목록 | RTK Query 캐시 (salesApi: getSellSlips) | 서버 상태 |
| 매출 요약 | RTK Query 캐시 (salesApi: getSalesSummary) | 서버 상태 |
| 분석 기준 텍스트 | uiSlice (Redux) | UI 로컬 상태 |
| 현재 활성 탭 | React 로컬 state | 컴포넌트 로컬 |

### 5.2 Bridge 계약

`sellview.md` 섹션 5.2의 `SALES:SEARCH`, `SALES:EXPORT` 참조. 탭별로 검색 파라미터에 `viewType` 추가:

```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "SALES:SEARCH",
  "params": {
    "viewType": "SELL_LIST | ITEM_LIST | CANCEL_LIST | TABLE_LIST | EMP_LIST",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}
```

### 5.3 UseCase 계약

읽기 전용이므로 별도 UseCase 없음.

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| SaleMgr | 매출 목록/요약 조회 |
| ItemMgr | 상품별 집계 |
| TableManager | 테이블현황 집계 |
| StaffMgr | 담당자별 집계 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- SellSlipCrud: 매출 전표 조회 (탭별 필터)

인쇄는 비동기 후처리 패턴.

### 5.6 i18n / Error / Permission

**Permission**
- 매출 현황 조회: 로그인 직원 전원
- 인쇄: 로그인 직원 전원

- 담당자별 탭(IDC_BTN_EMP)은 숨김 처리, 설정 기반 조건부 표시
- 인쇄는 현재 탭 데이터의 프린터 출력, 비동기 후처리

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-SLV-01 | 판매현황 탭 데이터 | 목록+요약 그리드 정상 표시 |
| T-SLV-02 | 탭 전환 | 상품별/취소/테이블/담당자 탭 데이터 갱신 |
| T-SLV-03 | 인쇄 | 현재 탭 데이터 프린터 출력 |
| T-SLV-04 | 담당자별 조건부 | 설정에 따라 탭 표시/숨김 |

---

## 7. 완료 기준

- [ ] 탭 기반 매출 목록 뷰 구현
- [ ] 2개 RTK Query 기반 그리드 (목록 + 요약)
- [ ] 탭별 검색 파라미터 연동
- [ ] 인쇄 비동기 후처리
- [ ] 담당자별 탭 조건부 표시

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesListTabs.tsx | 매출 목록 탭 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesListGrid.tsx | 매출 목록 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesSummaryGrid.tsx | 매출 요약 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesListHeader.tsx | 목록 헤더 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/SalesListActionBar.tsx | 목록 액션바 |
| Store | BrandPosApp/PosUi/src/store/api/salesApi.ts | 매출 RTK Query |
| Screen Shell | BrandPosApp/PosUi/src/screens/EmployeeScreen/components/SalesListViewDialog.tsx | DONE (shell) |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_SELLLISTVIEW |
| 리소스 값 | 151 |
| 크기 (DLU) | 450 x 337 |
| 총 UI 요소 수 | 11 (버튼 8, 텍스트 1, 그리드 2) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_BTN_SELLLIST | 판매현황 탭 | SalesListTabs |
| IDC_BTN_ITEMLIST | 상품별 탭 | SalesListTabs |
| IDC_BTN_CANCELLIST | 취소내역 탭 | SalesListTabs |
| IDC_BTN_TABLELIST | 테이블현황 탭 | SalesListTabs |
| IDC_BTN_EMP | 담당자별 탭 (숨김) | SalesListTabs |
| IDC_PRINT | 인쇄 | SalesListActionBar |
| IDC_GRID | 매출 목록 그리드 | SalesListGrid |
| IDC_GRID2 | 매출 요약 그리드 | SalesSummaryGrid |
| IDC_SELLVIEW_ANALYBASE | 분석 기준 | SalesListHeader |
