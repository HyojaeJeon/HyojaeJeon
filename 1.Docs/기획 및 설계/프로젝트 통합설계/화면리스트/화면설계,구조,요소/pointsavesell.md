# POINTSAVESELL (포인트 적립 매출 조회)

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-POINTSAVESELL |
| 레거시 다이얼로그 | IDD_POINTSAVESELL (리소스 158) |
| 신규 화면 경로 | screens/SalesScreen/components/PointHistoryPanel |
| 최종 수정일 | 2026-04-05 |
| 상태 | 설계 |

---

## 1. 화면 개요

**포인트 적립 매출 조회** 화면. 고객별 포인트 적립/사용 내역을 날짜 범위로 조회한다. 4개 그리드(적립내역/요약/상세/분류)로 구성된다. 포인트 내역 인쇄, 엑셀 내보내기, 회원 포인트 수동 저장 기능을 제공한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | 4.x 계층 책임 | 회원/포인트 조회 |
| sellview.md | 상위 매출 화면 | SalesScreen 내 서브 뷰 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| PSS-F01 | 포인트 적립 내역 조회 | P0 | CUSTOMER:SEARCH | SearchCustomerUseCase | CustMgr | CustomerCrud |
| PSS-F02 | 포인트 내역 인쇄 | P2 | SALES:EXPORT | - | CustMgr | CustomerCrud, Printer |
| PSS-F03 | 엑셀 내보내기 | P1 | SALES:EXPORT | - | CustMgr | CustomerCrud |
| PSS-F04 | 회원 포인트 저장 | P1 | PAYMENT:SAVE_POINT | SavePointUseCase | CustMgr | CustomerCrud |
| PSS-F05 | 닫기 | P0 | - (UI 로컬) | - | - | - |

---

## 4. UI 구조

### 4.1 화면 구성

```
screens/SalesScreen/components/
  PointHistoryPanel.tsx        -- 포인트 조회 메인 패널
  PointHistoryGrid.tsx         -- 포인트 적립 내역 그리드 (IDC_GRID 대체)
  PointSummaryGrid.tsx         -- 포인트 요약 그리드 (IDC_GRID2 대체)
  PointDetailGrid.tsx          -- 포인트 상세 그리드 (IDC_GRID4 대체)
  PointCategoryGrid.tsx        -- 포인트 분류 그리드 (IDC_GRID5 대체)
```

### 4.2 재사용 UI (shared/ui/)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| DatePicker | shared/ui/molecules/DatePicker | 시작일/종료일 선택 (SysDateTimePick32 대체) |

---

## 5. 구현 명세

### 5.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| 고객 정보 | RTK Query 캐시 (customerApi: getCustomer) | 서버 상태 |
| 포인트 내역 | RTK Query 캐시 (customerApi: getPointHistory) | 서버 상태 |
| 포인트 요약 | RTK Query 캐시 (customerApi: getPointSummary) | 서버 상태 |
| 조회 날짜 범위 | uiSlice (Redux) | UI 로컬 상태 |

### 5.2 Bridge 계약

**CUSTOMER:SEARCH** (포인트 내역 조회)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "CUSTOMER:SEARCH",
  "params": {
    "customerId": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "searchType": "POINT_HISTORY"
  }
}
```

**SALES:EXPORT** (엑셀/인쇄)
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "command": "SALES:EXPORT",
  "params": {
    "exportType": "EXCEL | PRINT",
    "dataType": "POINT_HISTORY",
    "customerId": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}
```

**PAYMENT:SAVE_POINT**
```json
{
  "v": 1,
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "idempotencyKey": "PAYMENT:SAVE_POINT:{customerId}:{amount}:{timestamp}",
  "command": "PAYMENT:SAVE_POINT",
  "params": {
    "customerId": "string",
    "pointAmount": "number"
  }
}
```

### 5.3 UseCase 계약

| UseCase | 책임 | 트랜잭션 | 멱등성 |
|---|---|---|---|
| SearchCustomerUseCase | 포인트 내역 조회 (읽기 전용) | 없음 | 없음. 조회 전용: 멱등성/락/Outbox 불필요. 오프라인: 로컬 DB만 사용하므로 동작 |
| SavePointUseCase | 회원 포인트 수동 저장 | 단일 트랜잭션 | requestId + idempotencyKey. 멱등성: 동일 requestId → Ledger 이전 결과 반환. 고객 미존재 → CUSTOMER_NOT_FOUND. 오프라인: 로컬 DB만 사용하므로 동작. 트랜잭션: SQLite TX 내에서 포인트 UPDATE + Ledger INSERT + Outbox INSERT 원자적 수행. 커밋 후: PosRealTimeSender로 POINT_SAVED 이벤트 |

### 5.4 Domain/Manager

| Manager | 역할 |
|---|---|
| CustMgr | 고객 포인트 내역 조회, 포인트 수동 저장 |

### 5.5 DB / CentralApi / Sync / Realtime

**DB (SQLite)**
- CustomerCrud: 고객 포인트 내역 조회/저장

엑셀 내보내기는 로컬 파일 저장, 비동기 후처리.
인쇄는 비동기 후처리 패턴.

### 5.6 i18n / Error / Permission

**Permission**
- 포인트 내역 조회 / 엑셀 내보내기: 로그인된 직원 전원
- 포인트 수동 저장(IDC_BTN_SAVE): 관리자 또는 권한 직원 전용. 숨김 처리, 관리자 로그인 시 조건부 활성화
- 인쇄(IDC_POINTPRINT): 로그인된 직원 전원. 숨김 처리, 설정 기반 조건부 표시

**i18n / Error**
- 인쇄 버튼(IDC_POINTPRINT)은 숨김 처리, 설정 기반 조건부 표시
- 회원 포인트 저장(IDC_BTN_SAVE)은 숨김 처리, 관리자 기능으로 조건부 활성화

---

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| T-PSS-01 | 포인트 내역 조회 | 날짜 범위 -> 4개 그리드 데이터 정상 |
| T-PSS-02 | 엑셀 내보내기 | 로컬 파일 저장 정상 |
| T-PSS-03 | 포인트 수동 저장 | DB 반영 + 멱등성 보장 |
| T-PSS-04 | 인쇄 조건부 | 설정에 따라 인쇄 버튼 표시/숨김 |

---

## 7. 완료 기준

- [ ] 4개 RTK Query 기반 포인트 그리드 구현
- [ ] DatePicker shared/ui/molecules/DatePicker 재사용
- [ ] 엑셀 내보내기 비동기 후처리
- [ ] 포인트 수동 저장 멱등성 보장
- [ ] 조건부 표시 (인쇄/저장 버튼)

---

## 8. 작업 명단

| 계층 | 파일 경로 | 설명 |
|---|---|---|
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PointHistoryPanel.tsx | 포인트 조회 패널 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PointHistoryGrid.tsx | 포인트 내역 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PointSummaryGrid.tsx | 포인트 요약 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PointDetailGrid.tsx | 포인트 상세 그리드 |
| UI Screen | BrandPosApp/PosUi/src/screens/SalesScreen/components/PointCategoryGrid.tsx | 포인트 분류 그리드 |
| Shared UI | BrandPosApp/PosUi/src/shared/ui/molecules/DatePicker.tsx | 날짜 선택 |
| Store | BrandPosApp/PosUi/src/store/api/customerApi.ts | 고객 RTK Query |
| C++ UseCase | BrandPosApp/UseCases/Payment/SavePointUseCase.cpp | 포인트 저장 유스케이스 |
| C++ Domain | BrandPosApp/Domain/Customer/CustMgr.cpp | 고객 매니저 |
| C++ Infra | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/CustomerCrud.cpp | 고객 CRUD |

---

## Appendix: 레거시 참조

### A.1 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_POINTSAVESELL |
| 리소스 값 | 158 |
| 크기 (DLU) | 512 x 384 |
| 총 UI 요소 수 | 13 (버튼 6, 텍스트 1, 입력 2, 그리드 4) |
| 소스 파일 | Restaurant.rc |

### A.2 주요 레거시 컨트롤 -> 신규 매핑

| 레거시 ID | 용도 | 신규 컴포넌트 |
|---|---|---|
| IDC_SEARCH | 조회 | PointHistoryPanel |
| IDC_POINTPRINT | 인쇄 (숨김) | PointHistoryPanel |
| IDC_BTN_EXCEL | 엑셀 | PointHistoryPanel |
| IDC_BTN_SAVE | 포인트 저장 (숨김) | PointHistoryPanel |
| IDC_CUSTNAME | 고객명 | PointHistoryPanel |
| IDC_STARTDATE | 시작일 | DatePicker |
| IDC_ENDDATE | 종료일 | DatePicker |
| IDC_GRID | 적립 내역 그리드 | PointHistoryGrid |
| IDC_GRID2 | 요약 그리드 | PointSummaryGrid |
| IDC_GRID4 | 상세 그리드 | PointDetailGrid |
| IDC_GRID5 | 분류 그리드 | PointCategoryGrid |

---

## 9. 작업 진행 기록
| 날짜 | 범위 | 상태 | 완료 범위 | 남은 범위 | 내용 |
|---|---|---|---|---|---|
| 2026-04-05 | Shell 구현 | 완료 | 레이아웃+로컬상태+stub | Bridge/UseCase 연동 | PointSaveSellDialog.tsx shell 구현 완료. 4탭 그리드(적립내역/요약/상세/분류), DatePicker, 인쇄/엑셀/포인트저장 stub 포함 |
