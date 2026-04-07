# EdgePos 기능리스트

> 이 문서는 `/Users/hyojae/projects/Platform/Docs/Analysis/FeatureInventory.md`의 전체 기능 범주를 EdgePos 책임 관점으로 재정리한 최종본이다.
> 레거시 기능의 대부분은 이 문서에 들어가며, SuperAdmin / RegionalDistributor / BrandHQ 문서는 상위 운영 책임만 분리해서 다룬다.

> **분석 대상**: `/Users/hyojae/projects/fooding/HJ-POS-TEST` (MFC/C++ POS, ~55만 줄)
> **분석 일시**: 2026-04-03
> **분석 방법**: 5개 전문 에이전트 병렬 분석 (Manager 클래스 전수 조사, IDD_ 다이얼로그 전수 조사, resource.h 스캔)

> **검증 요약**: 현재 문서의 1~9장과 부록 흐름도는 모두 포함되었고, 별도 누락 카테고리는 확인되지 않았다.

---

## 목차

1. [전체 통계 요약](#1-전체-통계-요약)
2. [테이블/플로어 (Table & Floor)](#2-테이블플로어-table--floor)
3. [매출/결제 (Sales & Payment)](#3-매출결제-sales--payment)
4. [상품/메뉴/재고 (Inventory & Menu)](#4-상품메뉴재고-inventory--menu)
5. [고객 관리 (Customer)](#5-고객-관리-customer)
6. [시스템/관리 (System & Admin)](#6-시스템관리-system--admin)
7. [외부 연동 (External Bridge)](#7-외부-연동-external-bridge)
8. [키오스크 (Kiosk)](#8-키오스크-kiosk)
9. [다이얼로그 전수 목록](#9-다이얼로그-전수-목록)

---

## 1. 전체 통계 요약

| 구분 | 수량 |
|------|------|
| C++ 소스 파일 (.h/.cpp) | 941개 |
| Manager 클래스 | 22개 |
| 공개 메서드 (추출) | 610개+ |
| IDD_ 다이얼로그 정의 | 350개 (메인 243 + RestaurantSet 107) |
| 결제 게이트웨이 | 7개 (BCCard, Infoplus, ZaloPay, HJVietPay, NAPAS, BIDV, WeTax) |
| 지원 언어 | 3개 (한국어, 영어, 베트남어) |
| 배달 대행사 연동 | 6개 (요기요, 쿠팡이츠, PAYCO vORDER, BM_NEW, MConnect, 카카오톡) |

### 도메인별 기능 통계

| Domain | Manager | 메서드 | 다이얼로그 | P0 기능 | P1 기능 | P2 기능 |
|--------|---------|--------|-----------|---------|---------|---------|
| Table & Floor | 1 | ~40 | 12 | 8 | 10 | 6 |
| Sales & Payment | 2+6GW | ~150 | 30 | 22 | 18 | 12 |
| Inventory & Menu | 2 | ~170 | 25 | 12 | 15 | 10 |
| Customer | 1 | ~80 | 15 | 8 | 12 | 8 |
| System & Admin | 6+Print | ~120 | 120 | 10 | 15 | 20 |
| External Bridge | 4+MQTT+HTTP | ~50 | 6 | 8 | 6 | 4 |
| Kiosk | - | - | 22 | 5 | 8 | 6 |
| **합계** | **22** | **~610** | **~230** | **73** | **84** | **66** |

**중요도 기준:**
- **P0**: 핵심 매출 흐름에 직결. 전환 1차 대상 (테이블→주문→결제)
- **P1**: 운영 필수 기능. 전환 2차 대상
- **P2**: 보조/관리 기능. 전환 3차 대상

---

## 2. 테이블/플로어 (Table & Floor)

### Manager: `CTableMgr`
> 파일: `DB/TableMgr.h`, `DB/TableMgr.cpp`

### 2.1 테이블 초기화/조회 (Table Init & Query)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InitTable | 전체 테이블 DB 로드, 플로어/페이지 설정 초기화 | DB/TableMgr.cpp | P0 |
| GetTableFromTableCode | 테이블 코드로 tTable 객체 조회 | DB/TableMgr.h | P0 |
| GetTableFromID | UI 컨트롤 ID로 테이블 조회 | DB/TableMgr.h | P0 |
| GetTableFromID_V2 | V2 UI 컨트롤 ID로 테이블 조회 (2023+) | DB/TableMgr.h | P1 |
| GetTableNameFromTableCode | 테이블 코드 → 이름 반환 | DB/TableMgr.h | P1 |
| GetTableIDFromTableCardNo | 카드 번호로 테이블 조회 | DB/TableMgr.h | P2 |
| GetTableFromHandPhone | 고객 전화번호로 테이블 검색 | DB/TableMgr.h | P2 |
| GetTable_KizEmptyTable | 키오스크용 빈 테이블 조회 | DB/TableMgr.h | P1 |
| GetTableCodeFromMousePoint | 마우스 좌표 → 테이블 코드 변환 | DB/TableMgr.h | P1 |
| GetTableStoreIndex | 테이블의 매장 인덱스 조회 | DB/TableMgr.h | P2 |

### 2.2 테이블 상태 관리 (Table Status)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| ClearTableAll | 전체 테이블 리스트/리소스 해제 | DB/TableMgr.h | P0 |
| TableOrderClear | 전체 테이블 주문 상태 초기화 | DB/TableMgr.h | P0 |
| ClearOrderFromID | 특정 테이블 주문 클리어 | DB/TableMgr.h | P0 |
| CopyTable | 테이블 데이터 복사 | DB/TableMgr.h | P1 |
| ButtonClear | 테이블 버튼 UI 초기화 | DB/TableMgr.h | P1 |
| ButtonClear_V2 | V2 버튼 UI 초기화 (2023+) | DB/TableMgr.h | P1 |
| Table_RedButton_Flag | 테이블 빨간 플래그 표시 (Red 고객) | DB/TableMgr.h | P2 |

### 2.3 테이블 잠금/동기화 (Lock & Sync)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| UseSysnCheck | 테이블/티켓 시스템 잠금 상태 확인 | DB/TableMgr.h | P0 |
| SetUseSysn | 테이블/티켓 잠금 설정/해제 | DB/TableMgr.h | P0 |
| SetUseSysnToPosNoClear | POS 번호별 전체 잠금 해제 | DB/TableMgr.h | P1 |
| ChangeTableFromSock | 소켓(네트워크)에서 테이블 상태 갱신 | DB/TableMgr.h | P0 |
| ChangeMemoFromSock | 소켓에서 메모 갱신 | DB/TableMgr.h | P1 |
| OnOffViewFromSock | 서버 연결 상태 반영 | DB/TableMgr.h | P1 |

### 2.4 테이블 이동/합석 (Move & Merge)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| ChangeTable | 테이블 이동(빈 테이블) 또는 합석(주문 있는 테이블). 금액/수량 합산 | DB/TableMgr.cpp | P0 |
| ChangeTraceQRTable | QR 코드 기반 테이블 이동 (2025-01 추가) | DB/TableMgr.cpp | P1 |
| CheckGrpTable_More_than_two | 그룹 테이블 2개 이상 여부 확인 | DB/TableMgr.h | P1 |

### 2.5 테이블 그룹 관리 (Group)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SetGroupView | 그룹 테이블 표시 | DB/TableMgr.h | P1 |
| SetGroupViewFromTID | 특정 테이블 기준 그룹 설정 | DB/TableMgr.h | P1 |
| SetGroupViewClear | 그룹 표시 해제 | DB/TableMgr.h | P1 |
| ChangeGroupAlphabetFromSock | 네트워크에서 그룹 알파벳(A-D) 갱신 | DB/TableMgr.h | P1 |
| Set_DB_ClearTableGroupAlphabet | 그룹 알파벳 DB 초기화 | DB/TableMgr.h | P1 |
| Set_DB_IndividualTable | 개별 단체 테이블 생성 | DB/TableMgr.h | P2 |
| Get_DB_MAXIndividualTableCode | 최대 개별 단체 코드 조회 | DB/TableMgr.h | P2 |

### 2.6 테이블 메모 (Memo)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| UpdateTableMemo | 테이블 메모 저장 | DB/TableMgr.h | P1 |
| GetTableMsg | 테이블 메시지 목록 조회 | DB/TableMgr.h | P2 |

### 2.7 예약 관리 (Reservation)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CAppointTableviewDlg | 예약 테이블 뷰 다이얼로그 | Dlg/AppointTableviewDlg.h | P1 |
| TableAppointView | 특정 테이블 예약 상세 표시 | Dlg/AppointTableviewDlg.cpp | P1 |
| AppointClear | 예약 목록 클리어 | Dlg/AppointTableviewDlg.cpp | P1 |
| OnSerch (예약 검색) | 예약 검색 기능 | Dlg/AppointTableviewDlg.cpp | P1 |

### 2.8 Red Room (특수 구간 관리)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| RedInOutRoom_Insert | Red Room 입실 기록 | DB/TableMgr.h | P2 |
| RedInOutRoom_Update | Red Room 상태 업데이트 | DB/TableMgr.h | P2 |
| Red_InOutRoom_Check | Red Room 상태 검증 | DB/TableMgr.h | P2 |

### 2.9 포장/배달 테이블 코드 (Takeout/Delivery)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetTakeOutMaxTableCode | 다음 포장 테이블 코드 발번 | DB/TableMgr.h | P0 |
| GetDeliveryMaxTableCode | 다음 배달 테이블 코드 발번 | DB/TableMgr.h | P0 |

### 2.10 이미지 테이블 (Image Table)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetImgTable | 이미지 기반 테이블 로드 (2007+) | DB/TableMgr.h | P2 |
| ClearImgTable | 이미지 테이블 해제 | DB/TableMgr.h | P2 |

### 2.11 테이블 다이얼로그 (CTableDlg - 메인 UI)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| OnTOrder | 주문 화면 진입 | Dlg/TableDlg.cpp | P0 |
| OnTAccount | 결제 화면 진입 | Dlg/TableDlg.cpp | P0 |
| OnTMove | 테이블 이동/합석 | Dlg/TableDlg.cpp | P0 |
| OnTGroup | 그룹 테이블 관리 | Dlg/TableDlg.cpp | P1 |
| OnTAppointment | 예약 관리 진입 | Dlg/TableDlg.cpp | P1 |
| OnTTableMsg | 테이블 메모 편집 | Dlg/TableDlg.cpp | P1 |
| OnTTableSearch | 테이블 검색 | Dlg/TableDlg.cpp | P1 |
| OnTDelivery | 배달 관리 진입 | Dlg/TableDlg.cpp | P0 |
| OnTTakeout | 포장 주문 처리 | Dlg/TableDlg.cpp | P0 |
| OnTCash | 빠른 현금 결제 | Dlg/TableDlg.cpp | P0 |
| OnTCard | 빠른 카드 결제 | Dlg/TableDlg.cpp | P0 |
| OnT1f~OnT3f | 플로어 선택 | Dlg/TableDlg.cpp | P0 |
| OnTNext/OnTBack | 페이지 이동 | Dlg/TableDlg.cpp | P0 |
| OnTCallTable | 호출 테이블 (2021+) | Dlg/TableDlg.cpp | P1 |
| OnTWaitingCall | 대기 호출 (2023+) | Dlg/TableDlg.cpp | P1 |
| OnTOrderFulfilled | 주문 완료 표시 (2025+) | Dlg/TableDlg.cpp | P1 |

### 2.12 테이블 데이터 구조

```
tTable (테이블)
├── FloorNum, PageNum          // 플로어/페이지
├── LineNum, ColNum             // 매트릭스 위치
├── TableType, TableNo          // 유형, 번호
├── MatrixSize                  // 좌석 수
├── m_showhide, m_color, m_draw // 표시/색상/그리기
├── Ttop/Tbottom/Tleft/Tright   // 픽셀 좌표
├── pTableBtn, pBtn, pBtnV2     // UI 버튼 참조
├── strGroupAlphabet            // 그룹 알파벳 (A-D)
├── TableMsg, TableCardNo       // 메모, 카드번호
└── tTableOrder (현재 주문)
    ├── FirstOrderDate, CustNum
    ├── OrderAmt, TotalAmt, ReceiveAmt
    ├── OrderState, OrderType
    └── OrderNo

tAppointment (예약)
├── AppointCode, AppointDate
├── CustName, HandPhone, CustNum
├── MeetingType, AppointType
├── Alram, EndDateCount
└── tSelectTableLst             // 예약 테이블 목록

tTableDelivery (배달)
├── FirstOrderDate, CustCode, CustName, CustAddr
├── EmpCode, EmpName
├── DeliveryTime, DeliveryState
├── ReceiveAmt, DeliveryNo
└── pBtn (UI 버튼)
```

---

## 3. 매출/결제 (Sales & Payment)

### 3.1 매출 관리 (Sales)

#### Manager: `CSellSlipMgr`
> 파일: `DB/SaleMgr.h` (~253줄 헤더), `DB/SaleMgr.cpp` (~9,931줄)

##### 3.1.1 매출전표 초기화/클리어

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InitSellSlip | 매출전표 데이터 초기화 | DB/SaleMgr.h | P0 |
| SellSlipClear | 매출전표 클리어 (결제정보 제외) | DB/SaleMgr.h | P0 |
| OrderClear | 주문 데이터 클리어 | DB/SaleMgr.h | P0 |
| AllClear | 전체 매출/주문 데이터 클리어 | DB/SaleMgr.h | P0 |
| SellSlipClearExceptionAcc | 결제정보 유지하고 클리어 | DB/SaleMgr.h | P1 |

##### 3.1.2 매출 계산

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CalcSellSlip | 매출전표 금액 계산 (카드/현금 금액 입력) | DB/SaleMgr.cpp:448 | P0 |
| CalcSellSlip_QRPay | QR 결제용 매출전표 계산 | DB/SaleMgr.cpp:1830 | P0 |
| CalcSellTimeItem | 시간제 상품 요금 계산 | DB/SaleMgr.cpp:396 | P1 |
| CalcStoreSetWeek | 요일별 매장 설정 계산 | DB/SaleMgr.cpp:3152 | P2 |
| CutAmtManage | 절사 금액 관리 | DB/SaleMgr.h | P1 |
| UpAmtManage | 올림 금액 관리 | DB/SaleMgr.h | P1 |
| VatWorkCalc | 부가세/봉사료 계산 | DB/SaleMgr.h | P0 |
| TotalDetailQty_Sell | 동일 상품 수량 집계 | DB/SaleMgr.cpp:3352 | P1 |

##### 3.1.3 매출전표 CRUD

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| AddSellSlip | 매출전표 DB 저장 (INSERT) | DB/SaleMgr.cpp:3464 | P0 |
| GetSellSlip | 날짜/영수증 범위로 매출전표 조회 | DB/SaleMgr.cpp:5708 | P0 |
| GetSellSlipTotal | 매출전표 집계 | DB/SaleMgr.cpp:5903 | P0 |
| GetOnlySellSlip | 단건 매출전표 조회 | DB/SaleMgr.h | P0 |
| DeleteSell | 매출전표 삭제 | DB/SaleMgr.h | P0 |
| UpdateSellType | 매출 유형 변경 (반품/교환) | DB/SaleMgr.cpp:7039 | P0 |
| UpdateSellCust | 매출 고객정보 업데이트 | DB/SaleMgr.cpp:7160 | P1 |
| RefundUpdate | 환불정보 업데이트 | DB/SaleMgr.cpp:6848 | P0 |

##### 3.1.4 영수증 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetMaxReceipt | 최대 영수증 번호 조회 | DB/SaleMgr.h | P0 |
| GetSellReceiptNo | 다음 영수증 번호 발번 | DB/SaleMgr.h | P0 |
| UpReceiptNo | 영수증 번호 증가 | DB/SaleMgr.h | P0 |
| LastSell_ReceiptPrint | 마지막 영수증 재발행 | DB/SaleMgr.h | P1 |
| Checking_PaymentInformation | 환불 가능 여부 결제정보 확인 | DB/SaleMgr.h | P0 |

##### 3.1.5 매출 복사/변환

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CopySellFromOrder | 주문 → 매출전표 복사 | DB/SaleMgr.h | P0 |
| CopyOrderFromSell | 매출전표 → 주문 역복사 | DB/SaleMgr.h | P1 |
| CopySellSlip | 매출전표 간 복사 | DB/SaleMgr.h | P0 |
| CopySellDetail | 매출 상세 복사 | DB/SaleMgr.h | P0 |

##### 3.1.6 매출 집계/보고

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetEasyView | 간편 매출 뷰 (회계용) | DB/SaleMgr.cpp:6942 | P1 |
| GetCustOldSell | 고객 과거 매출 이력 | DB/SaleMgr.h | P2 |
| InsertDB_Sum_Sell | 매출 집계 DB 저장 | DB/SaleMgr.h | P1 |
| CheckDB_Sum_Sell | 매출 집계 존재 여부 확인 | DB/SaleMgr.h | P1 |
| GetSellSlip_RowCnt | 마감용 매출전표 건수 조회 | DB/SaleMgr.h | P1 |
| SetQuery_Sum_Sell | 매출 집계 SQL 생성 (로컬) | DB/SaleMgr.h | P1 |
| SetQuery_Sum_SellDetail | 매출 상세 집계 SQL 생성 | DB/SaleMgr.h | P1 |

##### 3.1.7 선결제

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetSellSlipReceived | 선결제 금액 조회 | DB/SaleMgr.h | P1 |

### 3.2 주문 관리 (Order)

#### Manager: `COrderMgr`
> 파일: `DB/OrderMgr.h` (~274줄 헤더), `DB/OrderMgr.cpp` (~6,952줄)

##### 3.2.1 주문 CRUD

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InitOrder | 주문 데이터 초기화 | DB/OrderMgr.h | P0 |
| GetOrder | 날짜/번호/테이블로 주문 조회 | DB/OrderMgr.h | P0 |
| GetBeforeOrder | 이전 주문 조회 (보류 포함) | DB/OrderMgr.h | P1 |
| GetOrderFromTableCode | 테이블 코드로 주문 조회 | DB/OrderMgr.h | P0 |
| AddOrder | 주문 DB 저장 | DB/OrderMgr.h | P0 |
| OrderClear | 주문 데이터 클리어 | DB/OrderMgr.h | P0 |
| DeleteOrder | 주문 삭제 | DB/OrderMgr.h | P0 |
| DeleteOrderAllCancel | 전체 주문 취소/삭제 | DB/OrderMgr.h | P0 |
| CopyOrderSlip | 주문전표 복사 | DB/OrderMgr.h | P0 |
| CopyOrderDetail | 주문 상세 복사 | DB/OrderMgr.h | P0 |

##### 3.2.2 주문 계산/검증

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| OrderCalc | 주문 금액 계산 (소계/부가세/봉사료) | DB/OrderMgr.h | P0 |
| OrderSlipCheck | 주문전표 데이터 유효성 검증 | DB/OrderMgr.h | P0 |
| CheckOrderCust | 주문 내 고객 확인 | DB/OrderMgr.h | P1 |
| CheckOrderData | 주문 데이터 DB 검증 | DB/OrderMgr.h | P1 |
| CheckOrderDetailDB | 주문 상세 DB 일치 확인 | DB/OrderMgr.h | P1 |
| CheckFirstOrderDate | 최초 주문일시 유효성 검증 | DB/OrderMgr.h | P0 |
| CheckOrderEndWork | 주문 완료 상태 확인 | DB/OrderMgr.h | P1 |
| Check_OrderPrint | 전체 항목 인쇄 여부 확인 | DB/OrderMgr.h | P1 |
| CheckOrder_Beforecalculating | 계산 전 주문 유효성 검증 | DB/OrderMgr.h | P0 |

##### 3.2.3 주문 메시지 (조리 메시지)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetOrderMsg | 주문 메시지 목록 조회 | DB/OrderMgr.h | P1 |
| AddOrderMsg | 주문 메시지 등록 | DB/OrderMgr.h | P1 |
| GetOrderMsgMaxCode | 주문 메시지 최대 코드 조회 | DB/OrderMgr.h | P2 |

##### 3.2.4 배달 주문

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetDeliveryOrder | 배달 주문 조회 (그리드) | DB/OrderMgr.h | P0 |
| GetDeliveryOrderList | 배달 주문 리스트 조회 | DB/OrderMgr.h | P0 |
| AddDelivery | 배달 정보 등록 | DB/OrderMgr.h | P0 |
| UpdateDelivery | 배달 상태 업데이트 | DB/OrderMgr.h | P0 |
| GetDelivery | 배달 정보 조회 | DB/OrderMgr.h | P0 |
| GetMaxDeliveryNo | 다음 배달 번호 발번 | DB/OrderMgr.h | P0 |
| GetDeliveryFromCidNum | CID 번호로 배달 조회 | DB/OrderMgr.h | P2 |
| GetDeliveryBarogo_Grid2 | 바로고 배달 주문 조회 | DB/OrderMgr.h | P1 |

##### 3.2.5 메뉴/즐겨찾기

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| MenuFavorInit | 즐겨찾기 메뉴 초기화 | DB/OrderMgr.h | P1 |
| MenuViewInit | 메뉴 뷰 초기화 | DB/OrderMgr.h | P0 |
| GetLanguageNameFromItem | 다국어 상품명 조회 | DB/OrderMgr.h | P1 |

##### 3.2.6 보류 주문/대기번호

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| HoldLstClear | 보류 주문 목록 클리어 | DB/OrderMgr.h | P1 |
| GetHoldCount | 보류 주문 건수 | DB/OrderMgr.h | P1 |
| GetTakeOrderNo | 포장 주문 번호 발번 | DB/OrderMgr.h | P0 |
| GetWaitNum | 대기 번호 발번 | DB/OrderMgr.h | P1 |
| InitWaitPrintNum | 대기번호 인쇄기 초기화 | DB/OrderMgr.h | P1 |

##### 3.2.7 주문 인쇄/주방 디스플레이

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| UpdateOrderPrn | 주문 인쇄 완료 표시 | DB/OrderMgr.h | P0 |
| AddPrnCheck | 인쇄 확인 기록 | DB/OrderMgr.h | P1 |
| InsertPrinting2 | 주방 디스플레이 레코드 등록 | DB/OrderMgr.h | P1 |
| InsertPrinting2_v2 | 주방 디스플레이 V2 등록 | DB/OrderMgr.h | P1 |
| GetKitchenView_v2 | 주방 디스플레이 V2 주문 조회 | DB/OrderMgr.h | P1 |
| LabelPrintOrderPrinting | 라벨 인쇄 | DB/OrderMgr.h | P2 |

##### 3.2.8 주문 이력/감사

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SetOrderDetailLog | 주문 상세 변경 로그 기록 | DB/OrderMgr.h | P1 |
| SetOrderDetailLog2 | 개별 항목 변경 로그 기록 | DB/OrderMgr.h | P1 |
| GetOrderSellList | 주문/매출 이력 조회 | DB/OrderMgr.h | P1 |

### 3.3 카드 결제 (Card Payment)

##### 3.3.1 BCCard 모듈

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SendDataToDeviceCheckScanCard | 카드 단말기 거래 전송 | BCCard/BCCardModule.h | P0 |
| ReceiveResponse | 단말기 응답 수신 | BCCard/BCCardModule.h | P0 |
| IsRegistered | 카드 모듈 등록 여부 | BCCard/BCCardModule.h | P0 |
| DES_Encrypt / DES_Decrypt | 카드 데이터 암/복호화 | BCCard/BCCardModule.h | P0 |
| Get_ConfigBasicCode_31/37 | BCCard 설정 로드 | BCCard/BCCardModule.h | P1 |

##### 3.3.2 카드 매출 관리 (SaleMgr 내)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CardPermission | 카드 승인 처리 | DB/SaleMgr.h:69 | P0 |
| GetCardData | 카드 매출 데이터 조회 | DB/SaleMgr.h:70 | P0 |
| GetDoubleCardQty | 다중 카드 승인 건수 조회 | DB/SaleMgr.h:71 | P1 |
| CheckCard_SellData | 카드 매출 데이터 검증 | DB/SaleMgr.h:73 | P0 |
| GetCardListGrid | 카드 매출 목록 (그리드) | DB/SaleMgr.h:75 | P1 |
| CardSellDelFlagSet | 카드 매출 취소/환불 처리 | DB/SaleMgr.h:77 | P0 |
| CardSellUpdate_PK | 카드 매출 PK 업데이트 (취소용) | DB/SaleMgr.h:79 | P0 |

### 3.4 QR 결제 (QR Payment)

##### 3.4.1 ZaloPay

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CreateOrderQR | ZaloPay QR 코드 생성 | ZaloPay/ZaloPayModule.h | P0 |
| CancelOrderQR | ZaloPay 주문 취소 | ZaloPay/ZaloPayModule.h | P0 |
| CheckQRPaymentStatus_API | 결제 상태 확인 (API) | ZaloPay/ZaloPayModule.h | P0 |
| IsConfigured | ZaloPay 설정 여부 | ZaloPay/ZaloPayModule.h | P1 |
| ComputeHmacSha256 | HMAC SHA256 서명 생성 | ZaloPay/ZaloPayModule.h | P0 |

##### 3.4.2 ZaloOA (고객 메시징)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SendZNSAppointment | Zalo 예약 알림 전송 | ZaloPay/ZaloOAModule.h | P1 |
| SendZNSPayment | Zalo 결제 확인 전송 | ZaloPay/ZaloOAModule.h | P1 |
| SendZNSPoint | Zalo 포인트 알림 전송 | ZaloPay/ZaloOAModule.h | P2 |
| Login / GetZaloOAToken | ZaloOA 인증 | ZaloPay/ZaloOAModule.h | P1 |

##### 3.4.3 Infoplus (신한/BIDV/우리 QR)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CreateOrderQR | QR 결제 요청 생성 | Infoplus/InfoplusModule.h | P0 |
| CheckQRPaymentStatus_API | 결제 상태 확인 | Infoplus/InfoplusModule.h | P0 |
| CancelQRCode | QR 결제 취소 | Infoplus/InfoplusModule.h | P0 |
| IsShinhanConfigured | 신한 설정 여부 | Infoplus/InfoplusModule.h | P1 |
| IsBIDVConfigured | BIDV 설정 여부 | Infoplus/InfoplusModule.h | P1 |
| IsWooriConfigured | 우리 설정 여부 | Infoplus/InfoplusModule.h | P1 |

##### 3.4.4 HJVietPay / NAPAS QR

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CreateHJVietPayOrder | HJVietPay QR 생성 | HJVietPay/HJVietPayQRModule.h | P0 |
| CreateNapasOrderQR | NAPAS QR 코드 생성 | HJVietPay/HJVietPayQRModule.h | P0 |
| CheckNapasQRPaymentStatus | NAPAS 결제 상태 확인 | HJVietPay/HJVietPayQRModule.h | P0 |
| CheckNapasQRPaymentStatus_API | NAPAS 결제 확인 (API) | HJVietPay/HJVietPayQRModule.h | P0 |
| IsNapasConfigured / IsHJVietPayConfigured | 설정 여부 | HJVietPay/HJVietPayQRModule.h | P1 |

### 3.5 BIDV 카드 리더

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| Init | BIDV 브릿지 초기화 (라이선스) | BIDV/BIDVMgr.h | P0 |
| ConnectDevice | BIDV 카드 리더 연결 | BIDV/BIDVMgr.h | P0 |
| StartScanAndCheckResult | 카드 스캔 + 결과 확인 | BIDV/BIDVMgr.h | P0 |
| StartSaleAsync | 비동기 매출 거래 | BIDV/BIDVMgr.h | P0 |

### 3.6 현금영수증 (CID)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CashPermission | 현금영수증 CID 장치 등록 | DB/SaleMgr.h:84 | P0 |
| GetCashReceipt | 발행된 현금영수증 조회 | DB/SaleMgr.h:85 | P0 |
| CashUpdate | 현금영수증 상태 업데이트 | DB/SaleMgr.h:86 | P0 |
| CashReceiptDelFlagSet | 현금영수증 취소 처리 | DB/SaleMgr.h:88 | P0 |
| CashSellUpdate_PK | 현금영수증 PK 업데이트 (환불용) | DB/SaleMgr.h:90 | P0 |
| CxCom (시리얼 통신) | CID 장치 시리얼 포트 통신 | CID/xCom.h | P0 |

### 3.7 전자세금계산서 (WeTax - 베트남 e-Invoice)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| IssuanceInvoice | 전자세금계산서 발행 | WeTax/WeTaxMgr.h:130 | P0 |
| Login | WeTax API 로그인 | WeTax/WeTaxMgr.h:125 | P0 |
| GenerateRefId | 참조 ID 생성 | WeTax/WeTaxMgr.h:135 | P0 |
| GetSellerInfor | 판매자 정보 조회 | WeTax/WeTaxMgr.h:138 | P1 |
| GetBuyerInfor | 구매자 정보 추출 | WeTax/WeTaxMgr.h:141 | P1 |
| GetInvoiceDetails | 송장 라인 아이템 추출 | WeTax/WeTaxMgr.h:147 | P0 |
| GetCompanyByTaxId | 세금 ID로 회사 조회 | WeTax/WeTaxMgr.h:159 | P1 |

### 3.8 전자상품권 (Edenred)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| EdenredPermission | Edenred 바우처 결제 등록 | DB/SaleMgr.h:168 | P1 |
| GetEdenredMgr | Edenred 바우처 조회 | DB/SaleMgr.h:171 | P1 |
| EdenredEndDateSet | Edenred 취소/만료 처리 | DB/SaleMgr.h:173 | P1 |
| EdenredUpdate_PK | Edenred PK 업데이트 (환불) | DB/SaleMgr.h:175 | P1 |

### 3.9 사용자 정의 결제 (UserPayment)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| UserPayPermission | 사용자 결제 등록 | DB/SaleMgr.h:179 | P1 |
| GetUserPayment | 사용자 결제 조회 | DB/SaleMgr.h:182 | P1 |
| UserPayment_SetDelFlag | 사용자 결제 취소 | DB/SaleMgr.h:184 | P1 |

### 3.10 더치페이 (Split Payment)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CAccDutchPayDlg | 더치페이(분할결제) 다이얼로그 | Dlg/AccDutchPayDlg.h (IDD=356) | P1 |

### 3.11 할인 관리 (Discount)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CSaleDc 다이얼로그 | 이벤트/금액 할인 관리 | Dlg/SaleDc.h (IDD=374) | P0 |
| GetSaleDcLst | 할인 목록 조회 | DB/ItemMgr.h:36 | P0 |
| GetSaleDcFormCode | 할인 코드로 할인 조회 | DB/ItemMgr.h:38 | P0 |

### 3.12 매출 데이터 구조

```
tSellSlip (매출전표)
├── SellDate, OrderNo, ReceiptNo, PosNo      // 식별자
├── EmpCode, OrderEmpCode                     // 직원
├── TotalAmt, DcAmt, ReceiveAmt              // 금액
├── VatAmt, WorkAmt, ServiceAmt, TickAmt     // 세금/봉사료
├── CashAmt, CardAmt, PointAmt, CouponAmt   // 결제 수단별 금액
├── TipAmt, EtcAmt, CashbagAmt, KeepAmt     // 기타 결제
├── EdenredAmt, SelfAmt                       // 전자상품권/셀프
├── OrderMsgCode1~3, OrderMsg1~3             // 주문 메시지
├── tSellDetailLst                            // 매출 상세 목록
├── tCardSellLst                              // 카드 매출 목록
├── tCashReceiptLst                           // 현금영수증 목록
└── tEdenredLst                               // Edenred 목록

tCardSell (카드 매출)
├── TranKind, TranDate, CardNo, Issuer       // 거래 정보
├── SubTotal, VAT, Service, TotalAmt         // 금액
├── PermitNo, Installment                     // 승인번호/할부
├── DelFlag (F=활성, T=취소)                  // 취소 플래그
└── Msg1~3, ControlFlag                       // 응답 메시지

tCashReceipt (현금영수증)
├── SellDate, ReceiptNo, PosNo, TranKind     // 식별자
├── UinNo, TerminalID                         // CID 장치
├── SubTotal, VAT, TotalAmt                  // 금액
├── PermitNo, DelFlag                         // 승인/취소
└── Msg1~4, Notice                            // 응답 메시지
```

---

## 4. 상품/메뉴/재고 (Inventory & Menu)

### Manager: `CItemMgr`
> 파일: `DB/ItemMgr.h` (~231줄 헤더), `DB/ItemMgr.cpp`

### 4.1 상품 CRUD

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetItem | 상품 코드로 단건 조회 | DB/ItemMgr.h:27 | P0 |
| CopyItem | 상품 데이터 복사 | DB/ItemMgr.h:28 | P0 |
| GetItemSaleAmt | 상품 판매가 조회 | DB/ItemMgr.h:30 | P0 |
| GetItem_FromOrderSlip | 주문전표에서 상품 추출 | DB/ItemMgr.h:32 | P0 |
| InsertSimpleItem | 상품 등록 (간편) | DB/ItemMgr.h:94 | P1 |
| UpdateSimpleItem | 상품 수정 | DB/ItemMgr.h:95 | P1 |
| UpdateSimpleItemAmt | 상품 가격 수정 | DB/ItemMgr.h:96 | P1 |
| GetSearchItem | 상품 다중 필터 검색 | DB/ItemMgr.h:101 | P1 |
| GetMaxItemCode | 다음 상품 코드 발번 | DB/ItemMgr.h:88 | P1 |
| CheckItemBarCode | 바코드 유일성 확인 | DB/ItemMgr.h:89 | P1 |
| CheckItemName | 상품명 유일성 확인 | DB/ItemMgr.h:90 | P1 |

### 4.2 바코드

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetItemFromBarcode | 바코드 → 상품 정보 조회 | DB/ItemMgr.h:79 | P0 |
| GetStockInputBarCodeItem | 입고용 바코드 상품 조회 | DB/ItemMgr.h:55 | P1 |
| SetBarcodePrnSet | 바코드 프린터 설정 | DB/ItemMgr.h:127 | P2 |
| GetNext290Barcode | 다음 290 바코드 생성 | DB/ItemMgr.h:134 | P2 |
| AddCheckbitToBarcode | 바코드 체크 비트 추가 | DB/ItemMgr.h:135 | P2 |

### 4.3 카테고리/그룹

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetMaxGrpCode | 다음 그룹 코드 발번 | DB/ItemMgr.h:87 | P1 |
| InsertSimpleGrp | 그룹 등록 | DB/ItemMgr.h:97 | P1 |
| CheckGrpName | 그룹명 유일성 확인 | DB/ItemMgr.h:91 | P1 |
| GetGroupFromItemCode | 상품 코드 → 카테고리 정보 | DB/ItemMgr.h:81 | P0 |
| GetGrpToCombo | 그룹 목록 → 콤보박스 로드 | DB/ItemMgr.h:103 | P1 |

### 4.4 세트/선택/코스 메뉴

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetMenuItem | 세트/선택/코스 메뉴 아이템 조회 | DB/ItemMgr.h:43 | P0 |
| CopyCSDetail | 선택/세트/코스 상세 복사 | DB/ItemMgr.h:44 | P0 |
| GetCSOrderDetail | 선택/세트 주문 상세 | DB/ItemMgr.h:45 | P0 |
| GetCSSellDetail | 선택/세트 매출 상세 | DB/ItemMgr.h:46 | P0 |
| Check_AllItemChoiceMenu | 선택 메뉴 필수 선택 확인 | DB/ItemMgr.h:173 | P0 |

### 4.5 시간제/사이즈별 상품

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetTimeItemUse | 시간제 상품 사용 여부 | DB/ItemMgr.h:23 | P1 |
| CalcSellTimeItem | 시간제 상품 요금 계산 | DB/SaleMgr.cpp:396 | P1 |
| CalcOrderTimeItem | 시간제 주문 요금 계산 | DB/OrderMgr.h | P1 |
| GetItemTypeInfo | 상품 사이즈별 정보 (SizeName/Price 1~3) | DB/ItemMgr.h:221 | P1 |

### 4.6 거래처/구매 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetSupply | 거래처 목록/단건 조회 | DB/ItemMgr.h:52-53 | P1 |
| InsertPurChase | 구매 기록 등록 | DB/ItemMgr.h:58 | P1 |
| DeletePurChase | 구매 기록 삭제 | DB/ItemMgr.h:59 | P1 |
| GetPurchase | 구매 목록 조회 | DB/ItemMgr.h:67 | P1 |
| SetPurAccount | 구매 회계 처리 | DB/ItemMgr.h:70 | P1 |
| AddPurchaseIn | 입고 기록 등록 | DB/ItemMgr.h:106 | P1 |
| DeletePurchaseIn | 입고 기록 삭제 | DB/ItemMgr.h:109 | P1 |
| CancelPurchaseIn | 입고 취소 | DB/ItemMgr.h:110 | P1 |
| AddItemChageLog | 상품 변경 로그 기록 | DB/ItemMgr.h:116 | P1 |

### 4.7 재고 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetStockCnt | 현재 재고 수량 조회 | DB/ItemMgr.h:60 | P1 |
| UpDateItemStock | 재고 수량 업데이트 | DB/ItemMgr.h:61 | P1 |
| UpdateItemStockFullDate | 재고 기준일 갱신 | DB/ItemMgr.h:63 | P1 |
| GetStockGrpView | 재고 그룹별 뷰 | DB/ItemMgr.h:65 | P1 |
| GetStock | 재고 조회 (그룹/기간) | DB/ItemMgr.h:66 | P1 |
| GetStockViewToGrid | 재고 뷰 (그리드 출력) | DB/ItemMgr.h:119 | P1 |

### 4.8 프리셋/보증금

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetPresetItemCode | 프리셋 상품 코드 조회 | DB/ItemMgr.h:139 | P2 |
| GetPresetData | 프리셋 데이터 조회 | DB/ItemMgr.h:140 | P2 |
| CheckGetDepositAmt | 보증금 금액 확인/조회 | DB/ItemMgr.h:223 | P2 |

### 4.9 배달 대행사 상품 파싱

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| Parsing_DeliAgencyItem | 배달 대행사 상품 파싱 (범용) | DB/ItemMgr.h:148 | P0 |
| Parsing_Yogiyo_DeliAgencyItem | 요기요 상품 파싱 | DB/ItemMgr.h:157 | P1 |
| Parsing_vORDER_DeliAgencyItem | vORDER/PAYCO 상품 파싱 | DB/ItemMgr.h:159 | P1 |
| Parsing_BMNEW_DeliAgencyItem | BM_NEW 상품 파싱 | DB/ItemMgr.h:161 | P1 |
| Parsing_Coupang_DeliAgencyItem | 쿠팡이츠 상품 파싱 | DB/ItemMgr.h:163 | P1 |
| Parsing_MConnect_DeliAgencyItem | 메이트 커넥트 상품 파싱 | DB/ItemMgr.h:165 | P1 |

### 4.10 키오스크 이미지/다국어 (LPPS DB)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| LPPS_DB_KioskImg_Insert/Select/Delete | 키오스크 이미지 CRUD | DB/ItemMgr.h:187-190 | P1 |
| LPPS_DB_ItemDescrip_Insert/Select/Delete | 상품 설명 다국어 CRUD | DB/ItemMgr.h:192-194 | P1 |
| LPPS_DB_KioskLang_Insert/Select | 키오스크 다국어 CRUD | DB/ItemMgr.h:197-198 | P1 |
| Get_Kiosk_GrpADUFlag | 키오스크 그룹 ADU 플래그 | DB/ItemMgr.h:212 | P2 |

### 4.11 할인 이벤트

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetSaleDcLst | 할인 이벤트 목록 조회 | DB/ItemMgr.h:36 | P0 |
| GetSaleDcFormCode | 할인 코드로 조회 | DB/ItemMgr.h:38 | P0 |
| GetSaleItemLst | 할인 대상 상품 목록 | DB/ItemMgr.h:84 | P0 |

### 4.12 상품 데이터 구조

```
tItem (상품)
├── ItemCode, ItemName, BarCode              // 식별자
├── SaleAmt, OrignalAmt, ProfitRate          // 가격
├── TaxRate, VatType (과세/면세/영세)          // 세금
├── GrpCode (→ tGrp)                         // 카테고리
├── MenuType (일반/선택/세트), MenuCode       // 메뉴 유형
├── SizeName1~3, SizePrice1~3               // 사이즈별 가격
├── Stock (T/F), StockType, StockAmt         // 재고
├── DCType, BDisCount, DCAmt, DcEventCode    // 할인
├── PointType, PointAmt, BPoint              // 포인트
├── Prn ("TIME" = 시간제)                     // 인쇄기
├── ADUFlag ("PE"/"FC"/"SO"/"KX")            // 상태 플래그
├── Com1~Com40, Lpt1                          // 프린터 포트 배정
├── tItemDetail (시간대/요일별 판매 가능 여부)  // 판매 제한
└── SubCol1 (동적상품), SubCol3 (애드온 카테고리)
```

---

## 5. 고객 관리 (Customer)

### Manager: `CCustMgr`
> 파일: `DB/CustMgr.h` (~249줄 헤더), `DB/CustMgr.cpp`

### 5.1 고객 CRUD

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetCustGrid | 고객 목록 그리드 조회 | DB/CustMgr.h:24 | P0 |
| GetCustFromWhere | WHERE 조건으로 고객 조회 | DB/CustMgr.h:25 | P0 |
| GetCustFromCode | 고객 코드로 단건 조회 | DB/CustMgr.h:27 | P0 |
| InsertCust | 고객 등록 | DB/CustMgr.h:31 | P0 |
| UpdateCustGrid | 고객 정보 수정 | DB/CustMgr.h:32 | P0 |
| InsertSimpleCust | 간편 고객 등록 | DB/CustMgr.h:33 | P0 |
| UpdateSimpleCust | 간편 고객 수정 | DB/CustMgr.h:34 | P0 |
| DeleteCust | 고객 삭제 | DB/CustMgr.h:35 | P1 |
| GetMaxCode | 다음 고객 코드 발번 | DB/CustMgr.h:37 | P0 |

### 5.2 중복 검사

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CheckCustCardNo | 카드번호 중복 확인 | DB/CustMgr.h:55 | P1 |
| CheckCustHPhone | 휴대폰 번호 중복 확인 | DB/CustMgr.h:56 | P1 |
| CheckCustTelPhone | 전화번호 중복 확인 | DB/CustMgr.h:57 | P1 |
| CheckCustAddr | 주소 중복 확인 | DB/CustMgr.h:58 | P2 |

### 5.3 포인트/적립

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SetCustPoint | 고객 포인트 설정 | DB/CustMgr.h:42 | P0 |
| CalcPointSell | 매출 기반 포인트 계산 | DB/CustMgr.h:46 | P0 |
| CalcPointOrder | 주문 기반 포인트 계산 | DB/CustMgr.h:47 | P0 |

### 5.4 티켓/외상

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetTickSearch | 티켓 검색 | DB/CustMgr.h:62 | P1 |
| GetTick | 티켓 목록 조회 | DB/CustMgr.h:63 | P1 |
| InsertTickMgr | 티켓 등록 | DB/CustMgr.h:64 | P1 |
| UpdateTickMgr | 티켓 상태 업데이트 | DB/CustMgr.h:65 | P1 |
| SetCustTick | 고객 티켓 금액 설정 | DB/CustMgr.h:73 | P1 |

### 5.5 예약 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetAppointMaxCode | 다음 예약 코드 발번 | DB/CustMgr.h:78 | P1 |
| GetAppointment | 예약 목록 조회 (기간/유형별) | DB/CustMgr.h:79 | P1 |
| SetAppointment | 예약 등록/수정 | DB/CustMgr.h:81 | P1 |
| CheckAppointCode | 예약 코드 확인 | DB/CustMgr.h:82 | P1 |

### 5.6 선불/충전 (Keep)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetMaxKeepReceiptNo | 다음 충전 영수증 번호 | DB/CustMgr.h:107 | P1 |
| InsertCustKeepReg | 충전 등록 | DB/CustMgr.h:108 | P1 |
| GetCustKeepReg | 충전 이력 조회 | DB/CustMgr.h:109 | P1 |
| GetCustKeepSell | 충전 사용 이력 조회 | DB/CustMgr.h:110 | P1 |
| GetCustKeep_per | 충전 할인율 조회 | DB/CustMgr.h:114 | P1 |

### 5.7 구독형 상품 (정기권/횟수권)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InsertCustItemSell | 구독형 상품 판매 등록 | DB/CustMgr.h:123 | P1 |
| GetCustItemSellFromCustCode | 고객 코드로 구독 조회 | DB/CustMgr.h:128 | P1 |
| GetCustItemSellFromCardNo | 카드번호로 구독 조회 | DB/CustMgr.h:130 | P1 |
| Udate_CustItemSell_ReaminCnt | 횟수권 잔여 횟수 차감 | DB/CustMgr.h:141 | P1 |
| InsertCustVisit | 고객 방문 기록 | DB/CustMgr.h:132 | P2 |

### 5.8 배달 주소

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SetDeliveryCID | 배달 CID(발신번호) 설정 | DB/CustMgr.h:92 | P1 |
| GetDeliAddrGrp | 배달 주소 그룹 조회 | DB/CustMgr.h:99 | P1 |
| GetDeliAddr | 배달 주소 조회 | DB/CustMgr.h:100 | P1 |
| GetCidNumVieCustAddr | 전화번호 → 주소 조회 | DB/CustMgr.h:101 | P1 |

### 5.9 배달 대행사 연동

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InsertDeliAgency | 배달 대행사 주문 등록 | DB/CustMgr.h:157 | P0 |
| CheckDeliAgencyOrderNumber | 대행사 주문번호 중복 확인 | DB/CustMgr.h:155 | P0 |
| Parsing_DeliAgencyCust | 범용 대행사 고객 파싱 | DB/CustMgr.h:153 | P0 |
| Parsing_Yogiyo_DeliAgencyCust | 요기요 고객 파싱 | DB/CustMgr.h:176 | P1 |
| Parsing_vORDER_DeliAgencyCust | vORDER 고객 파싱 | DB/CustMgr.h:179 | P1 |
| Parsing_BMNEW_DeliAgencyCust | BM_NEW 고객 파싱 | DB/CustMgr.h:173 | P1 |
| Parsing_Coupang_DeliAgencyCust | 쿠팡이츠 고객 파싱 | DB/CustMgr.h:188 | P1 |
| Parsing_MConnect_DeliAgencyCust | 메이트커넥트 고객 파싱 | DB/CustMgr.h:182 | P1 |
| DeleteDeliAgency | 대행사 주문 삭제 | DB/CustMgr.h:169 | P1 |

### 5.10 카카오톡 주문

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InsertDeliAgency_FromKakaoTalk | 카카오톡 주문 등록 | DB/CustMgr.h:201 | P1 |
| GetDeliAgency_KakaoTalkData | 카카오톡 주문 조회 | DB/CustMgr.h:203 | P1 |
| UpdateDeliAgency_KakaoTalkState | 카카오톡 주문 상태 변경 | DB/CustMgr.h:206 | P1 |

### 5.11 MConnect(메이트 커넥트)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| UpdateMateConnectAddrToDeliAgency | 메이트커넥트 주소 업데이트 | DB/CustMgr.h:232 | P1 |
| GetMateConnectDataFromDeliAgency | 메이트커넥트 데이터 조회 | DB/CustMgr.h:234 | P1 |
| UpdateMateConnectDeliveryTime_Delivery | 배달 시간 업데이트 | DB/CustMgr.h:238 | P1 |

---

## 6. 시스템/관리 (System & Admin)

### 6.1 업무 마감 (Daily Closing)

#### Manager: `CWorkMgr`
> 파일: `DB/WorkMgr.h`, `DB/WorkMgr.cpp`

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CalcEndWork | 마감 금액 계산 (매출/카드/현금/기프트 정산) | DB/WorkMgr.h | P0 |
| CalcCardBuyer | 카드사별 매출 정산 | DB/WorkMgr.h | P0 |
| GetEndWorkPeriod | 기간별 마감 금액 조회 | DB/WorkMgr.h | P0 |
| SetPosWorkAdjust | POS 업무 정산 기록 | DB/WorkMgr.h | P0 |
| SetPosWork2Adjust | 고급 업무 정산 기록 | DB/WorkMgr.h | P1 |
| SetSellAdjust | 매출 정산 설정 | DB/WorkMgr.h | P0 |
| GetAdjustDelivery | 배달 정산 조회 | DB/WorkMgr.h | P1 |
| CheckAdjust_GiftSell | 기프트 매출 정산 검증 | DB/WorkMgr.h | P1 |
| GetAdjust_Service | 봉사료 정산 조회 | DB/WorkMgr.h | P1 |
| GetAdjust_CosmoRefundCash | COSMO 환불 정산 | DB/WorkMgr.h | P2 |

### 6.2 직원 근태 관리

#### Manager: `CInOutMgr` (직원 관련 부분)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| InsertEmpWorkIn | 직원 출근 기록 | DB/InOutMgr.h:41 | P1 |
| UpdateEmpWorkOut | 직원 퇴근 기록 | DB/InOutMgr.h:42 | P1 |
| DeleteEmpWork | 직원 근무 기록 삭제 | DB/InOutMgr.h:43 | P1 |
| CheckEmpWorkIn | 출근 상태 확인 | DB/InOutMgr.h:44 | P1 |
| GetDilegence | 근태 기록 조회 | DB/InOutMgr.h:46 | P1 |
| GetEmpWorkday | 근무일/시간 집계 | DB/InOutMgr.h:48 | P1 |
| InsertEmpGiveAmt | 근태 수당 기록 | DB/InOutMgr.h:49 | P2 |

### 6.3 입출금 관리 (MIO)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetInOutComent | 입출금 사유 목록 조회 | DB/InOutMgr.h:23 | P1 |
| InsertInOut | 입출금 기록 등록 | DB/InOutMgr.h:25 | P1 |
| GetInOut | 입출금 기록 조회 | DB/InOutMgr.h:26 | P1 |
| UpdateDeleteInOut | 입출금 기록 삭제 | DB/InOutMgr.h:28 | P1 |

### 6.4 장부/거래처 (Jangbu)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetJangbuGrp | 거래처 그룹 조회 | DB/InOutMgr.h:34 | P1 |
| InsertJangbu | 거래처 발주 등록 | DB/InOutMgr.h:35 | P1 |
| GetJangbu | 거래처 발주 조회 (기간/그룹별) | DB/InOutMgr.h:36 | P1 |

### 6.5 기프트권 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CheckGiftMgr | 기프트권 관리 가능 여부 | DB/InOutMgr.h:67 | P1 |
| InsertGiftMgr | 기프트권 등록 | DB/InOutMgr.h:68 | P1 |
| UpdateGiftMgr_SaleDate | 기프트권 판매 처리 | DB/InOutMgr.h:69 | P1 |
| UpdateGiftMgr_SaleDateCancel | 기프트권 판매 취소 | DB/InOutMgr.h:70 | P1 |
| AddGift_Sell | 기프트 매출 등록 | DB/InOutMgr.h:85 | P1 |

### 6.6 인증/권한

#### CPosManiaAuthenticator
> 파일: `KeyLock/Authenticate/PosManiaAuthenticator.h`

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| Initialize | 인증 시스템 초기화 (프로그램 코드, 인증 모드) | KeyLock/Authenticate/PosManiaAuthenticator.h | P0 |
| VerifyAuthentication | 프로그램 인증 검증 | KeyLock/Authenticate/PosManiaAuthenticator.h | P0 |
| GetAuthStatus | 인증 상태 조회 (등록/미등록/만료/차단) | KeyLock/Authenticate/PosManiaAuthenticator.h | P0 |

### 6.7 ASP/웹 연동

#### Manager: `CAspDataMgr`, `CWebAspMgr`

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| ExecAspLoderFromCmd | ASP 로더 프로세스 실행 | DB/AspDataMgr.h | P1 |
| SendSqlMsgAspLoder | ASP 로더에 SQL 메시지 전송 | DB/AspDataMgr.h | P1 |
| ConnectWebDB | 웹 DB 연결 | DB/WebAspMgr.h | P1 |
| GetFranGrp / GetFranItem | 프랜차이즈 상품 그룹/아이템 동기화 | DB/WebAspMgr.h | P1 |
| ASP_SetfCust | 고객 변경사항 ASP 업로드 | DB/WebAspMgr.h | P1 |
| GetNotice | 공지사항 조회 | DB/WebAspMgr.h | P2 |
| NewAuthUp / ReAuthDown | 신규/재인증 업로드/다운로드 | DB/WebAspMgr.h | P0 |
| GetASP_CItem / GetASP_CItemStore | 서버 상품 업데이트 동기화 | DB/WebAspMgr.h | P1 |
| InsertOrPurchase | 발주 등록 | DB/WebAspMgr.h | P1 |
| GetOrPurChase | 발주 목록 조회 | DB/WebAspMgr.h | P1 |

### 6.8 다국어 (i18n)

#### Manager: `CLanguageMgr`
> 파일: `DB/LanguageMgr.h`

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| Lang | 한국어 → 대상 언어 번역 (다이얼로그 컨텍스트) | DB/LanguageMgr.h | P0 |
| GetLang | ID로 번역 문자열 조회 | DB/LanguageMgr.h | P0 |
| SetLangType / GetLangType | 현재 언어 설정/조회 (KR=0, EN=1, VN=2) | DB/LanguageMgr.h | P0 |
| ChangeLanguageComboBox | 콤보박스 동적 언어 변경 | DB/LanguageMgr.h | P1 |

### 6.9 인쇄 시스템

#### CThermalPrn (CPOSPrinter 상속)
> 파일: `Print/ThermalPrn.h`

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| **주문 인쇄** | | | |
| OrderPrint | 주문서 인쇄 | Print/ThermalPrn.h | P0 |
| OrderRePrint | 주문서 재인쇄 | Print/ThermalPrn.h | P1 |
| OrderPrint_Tran180 | 주문서 180도 회전 인쇄 | Print/ThermalPrn.h | P2 |
| OrderPrintDelivery | 배달 주문서 인쇄 | Print/ThermalPrn.h | P0 |
| **매출 영수증** | | | |
| SellPrint | 매출 영수증 인쇄 | Print/ThermalPrn.h | P0 |
| SellPrintL42 | 42칼럼 영수증 인쇄 | Print/ThermalPrn.h | P1 |
| SellReceiptChoicePrint | 영수증 선택 인쇄 (종이/모바일/없음) | Print/ThermalPrn.h | P0 |
| **카드 전표** | | | |
| CardPrint | 카드 전표 인쇄 | Print/ThermalPrn.h | P0 |
| CardCancelPrint | 카드 취소 전표 인쇄 | Print/ThermalPrn.h | P0 |
| CardDoublePrint | 다중 카드 전표 인쇄 | Print/ThermalPrn.h | P1 |
| **현금영수증** | | | |
| CashReceiptPrint | 현금영수증 인쇄 | Print/ThermalPrn.h | P0 |
| CashReceiptCancelPrint | 현금영수증 취소 인쇄 | Print/ThermalPrn.h | P0 |
| **중간정산** | | | |
| MidSellPrint | 중간정산 주방 인쇄 | Print/ThermalPrn.h | P1 |
| **마감 보고서** | | | |
| EndWork | 일일 마감 보고서 인쇄 | Print/ThermalPrn.h | P0 |
| EndWorkL42 | 42칼럼 마감 보고서 인쇄 | Print/ThermalPrn.h | P1 |
| **바코드/QR** | | | |
| BarCodePrint | 바코드 인쇄 | Print/ThermalPrn.h | P1 |
| QRPrint | QR 코드 인쇄 | Print/ThermalPrn.h | P1 |
| **예약/포인트** | | | |
| AppointmentPrint | 예약 확인서 인쇄 | Print/ThermalPrn.h | P1 |
| PointPrint | 포인트/티켓 정보 인쇄 | Print/ThermalPrn.h | P1 |
| **기타** | | | |
| OpenDrawer | 현금 서랍 열기 | Print/ThermalPrn.h | P0 |
| SimpleReceiptPrint | 간이 영수증 인쇄 | Print/ThermalPrn.h | P1 |
| ChangeTablePrint | 테이블 이동 확인 인쇄 | Print/ThermalPrn.h | P2 |
| KioskWaitingOrderNo | 키오스크 대기번호 인쇄 | Print/ThermalPrn.h | P1 |

#### 프린터 연결 타입

| 타입 | 클래스 | 설명 |
|------|--------|------|
| Serial | CSerPrn | RS-232 시리얼 포트 |
| Parallel | CParallelPrn | 병렬 포트 |
| Network | CSockClientPrinter | TCP/IP 소켓 |
| USB | (OPOS) | USB 연결 |

### 6.10 설정 앱 (RestaurantSet)

| 다이얼로그 | 설명 | 중요도 |
|-----------|------|--------|
| CBasicSet | 기본 시스템 설정 | P0 |
| CCompanyDlg | 회사/매장 정보 | P0 |
| CDevice | 디바이스 설정 (프린터/카드리더/포트) | P0 |
| CEmpInput / CEmpDetail | 직원 등록/수정 | P1 |
| CCustInput / CCustDetail | 고객 등록/수정 | P1 |
| CPayMgrDlg | 결제 관리 설정 | P0 |
| CCardMgrDlg | 카드 결제 설정 (CAT/CVR) | P0 |
| CQRPayMgrDlg | QR 결제 설정 | P1 |
| CPrintMgrDlg | 프린터 관리 (주문/영수증/라벨) | P0 |
| CEtcMgrDlg | 기타 설정 (이벤트/프로모션) | P1 |
| CKioMgrDlg | 키오스크 관리 | P1 |
| CKioItemMgrDlg | 키오스크 상품 관리 | P1 |
| CDataRestoreDlg | 데이터 백업/복원 | P1 |
| CBasicCodeDlg | 기본 코드 관리 | P2 |
| CIniSetDlg | INI 설정 | P2 |

---

## 7. 외부 연동 (External Bridge)

### 7.1 Fooding MQTT Publisher (POS → 외부)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| PublishTableStatus | 테이블 상태 변경 발행 | FoodingBridge/FoodingMQTTPublisher.cpp:55 | P0 |
| PublishCheckIn | 손님 입장 신호 발행 | FoodingBridge/FoodingMQTTPublisher.cpp:70 | P0 |
| PublishCheckOut | 결제 완료 신호 발행 | FoodingBridge/FoodingMQTTPublisher.cpp:85 | P0 |
| PublishOrderUpdate | 주문 상세 발행 (아이템 리스트 포함) | FoodingBridge/FoodingMQTTPublisher.cpp:96 | P0 |
| PublishOrderItemAdd | 단일 아이템 추가 이벤트 | FoodingBridge/FoodingMQTTPublisher.cpp:128 | P1 |
| PublishOrderItemQtyChange | 수량 변경 이벤트 | FoodingBridge/FoodingMQTTPublisher.cpp:144 | P1 |
| PublishOrderCancel | 주문 취소 발행 | FoodingBridge/FoodingMQTTPublisher.cpp:162 | P0 |
| PublishReservationUpdate | 예약 정보 동기화 | FoodingBridge/FoodingMQTTPublisher.cpp:177 | P1 |
| PublishReservationCancel | 예약 취소 알림 | FoodingBridge/FoodingMQTTPublisher.cpp:196 | P1 |
| PublishMenuChanged | 메뉴 변경 이벤트 | FoodingBridge/FoodingMQTTPublisher.cpp:207 | P1 |
| PublishDeliveryStatus | 배달 상태 업데이트 | FoodingBridge/FoodingMQTTPublisher.cpp:305 | P0 |
| PublishDeliveryAck | 배달 수락/거절 ACK | FoodingBridge/FoodingMQTTPublisher.cpp:327 | P0 |
| PublishActionResponse | 결제/액션 응답 발행 | FoodingBridge/FoodingMQTTPublisher.cpp:276 | P0 |
| PublishCompoundPaymentResponse | 복합 결제 응답 | FoodingBridge/FoodingMQTTPublisher.h:62 | P1 |

### 7.2 Fooding Event Hook (비즈니스 이벤트 → MQTT)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| OnSaleComplete | 결제 완료 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:11 | P0 |
| OnOrderCreated | 주문 생성 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:21 | P0 |
| OnOrderDeleted | 주문 취소 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:35 | P0 |
| OnOrderItemChanged | 주문 항목 변경 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:42 | P0 |
| OnReservationSaved | 예약 저장 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:52 | P1 |
| OnDeliveryStatusChanged | 배달 상태 변경 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:81 | P0 |
| OnTableStatusChanged | 테이블 상태 변경 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:90 | P0 |
| OnMenuChanged | 메뉴 변경 후 MQTT 발행 | FoodingBridge/FoodingEventHook.cpp:73 | P1 |

### 7.3 Fooding Incoming Handler (외부 → POS)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| DispatchMQTTMessage | MQTT 수신 메시지 분류/디스패치 | FoodingBridge/FoodingIncomingHandler.cpp:47 | P0 |
| HandleOrderUpdate | 주문 DB 로드 + 화면 갱신 | FoodingBridge/FoodingIncomingHandler.cpp:202 | P0 |
| HandleTableStatus | 테이블 화면 갱신 | FoodingBridge/FoodingIncomingHandler.cpp:249 | P0 |
| HandleOrderCancel | 주문 삭제 + DB 동기화 | FoodingBridge/FoodingIncomingHandler.cpp:267 | P0 |
| HandlePaymentRequest | 자동 결제 처리 (SellSlip 생성 + 인쇄) | FoodingBridge/FoodingIncomingHandler.cpp:297 | P0 |
| HandleDeliveryOrder | 배달 주문 수신 처리 | FoodingBridge/FoodingIncomingHandler.cpp:383 | P0 |
| HandleCompoundPayment | 복합 결제 순차 처리 | FoodingBridge/FoodingIncomingHandler.cpp | P0 |

### 7.4 MQTT 통신 인프라

#### CMQTTClient (Mosquitto C++ 래퍼)
> 파일: `HTTP/MQTTClient.h`, `HTTP/MQTTClient.cpp`

**구독 토픽:**

| 토픽 | 용도 |
|------|------|
| `fooding-dev/{storeCode}/#` | Fooding 플랫폼 전체 이벤트 |
| `unionpos/zalopay/qr/payment/{id}` | ZaloPay QR 결제 응답 |
| `unionpos/infoplus/qr/payment/{id}` | Infoplus QR 결제 응답 |
| `unionpos/napas/qr/payment/{id}` | NAPAS QR 결제 응답 |
| `unionpos/sellslip/update/bcashreceipt/{id}` | 현금영수증 업데이트 |
| `unionpos/cashreceipt/insert/{id}` | 현금영수증 데이터 수신 |

**발행 토픽:**

| 토픽 | 용도 |
|------|------|
| `fooding-dev/{storeCode}/table/status` | 테이블 상태 |
| `fooding-dev/{storeCode}/checkin` | 체크인 |
| `fooding-dev/{storeCode}/checkout` | 체크아웃 |
| `fooding-dev/{storeCode}/order/status` | 주문 상태 |
| `fooding-dev/{storeCode}/reservation/*` | 예약 |
| `fooding-dev/{storeCode}/menu/sync` | 메뉴 동기화 |
| `fooding-dev/{storeCode}/delivery/*` | 배달 상태/ACK |
| `fooding-dev/{storeCode}/action/response` | 액션 응답 |

### 7.5 HTTP/API

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| CHttpClientWinHttp::WinHttpRestRequest | WinHTTP GET 요청 (TLS 지원) | HTTP/HttpClientWinHttp.cpp:68 | P1 |
| HttpReq::SendRequest | HTTP GET/POST 요청 (JSON 응답) | HTTP/HttpReq.cpp:16 | P1 |

### 7.6 배달 UI (Sciter)

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| SciterDeliveryBridge | 배달 데이터 계층 (DB 조회 → Sciter UI) | Dlg/SciterDeliveryBridge.cpp | P0 |
| LoadDeliveryOrders | 금일 배달 주문 로드 | Dlg/SciterDeliveryBridge.cpp:24 | P0 |
| DeliveryStart | 배달 시작 (DB + MQTT) | Dlg/SciterDeliveryBridge.cpp:237 | P0 |
| DeliveryComplete | 배달 완료 (DB + MQTT) | Dlg/SciterDeliveryBridge.cpp:257 | P0 |
| DeliveryDishEnd | 배달 종료/그릇회수 | Dlg/SciterDeliveryBridge.cpp:274 | P1 |
| FoodingAccept | Fooding 주문 수락 | Dlg/SciterDeliveryBridge.cpp:322 | P0 |
| FoodingReject | Fooding 주문 거절 | Dlg/SciterDeliveryBridge.cpp | P0 |

### 7.7 DFS 관리

| 기능명 | 설명 | 소스 파일 | 중요도 |
|--------|------|-----------|--------|
| GetDFS_TeamSearch | DFS 팀 검색 | Dlg/DfsMgr.cpp | P2 |
| AddDFS_SellFee | 배달 수수료 등록 | Dlg/DfsMgr.cpp | P2 |
| GetDFS_ExchagneRate | 외화 환율 조회 (12개 통화) | Dlg/DfsMgr.cpp | P2 |

### 7.8 외부 주문 흐름 요약

```
[Fooding 배달 주문 수신]
MQTT(delivery.order_new) → CMQTTClient::on_message()
  → CFoodingIncomingHandler::DispatchMQTTMessage()
    → 정적 멤버에 배달 정보 캐시
    → PostMessage(WM_USER+104) → UI 스레드
      → RestaurantDlg::OnFoodingDeliveryOrder()
        → SciterDelivery2Dlg 팝업 → 사용자 수락/거절
          → SciterDeliveryBridge::FoodingAccept/Reject()
            → DB 업데이트 + PublishDeliveryAck()

[Fooding 결제 요청]
MQTT(action.payCash/payCard) → DispatchMQTTMessage()
  → PostMessage(WM_USER+103) → UI 스레드
    → HandlePaymentRequest()
      → CalcSellSlip() → AddSellSlip() → SellReceiptChoicePrint()
        → PublishActionResponse("SUCCESS")
```

---

## 8. 키오스크 (Kiosk)

### 8.1 키오스크 다이얼로그

| 다이얼로그 | IDD | 설명 | 중요도 |
|-----------|-----|------|--------|
| KioItemDlg | 305 | 상품 선택 (메인 메뉴) | P0 |
| KioItemDlg2 | 439 | 상품 선택 V2 | P1 |
| KioSetItemDlg | 279 | 세트메뉴 구성 | P0 |
| KioOptionItemDlg | 297 | 옵션 선택 | P0 |
| KioOptionItemV2 | 343 | 옵션 선택 V2 (스크롤, 필수 아이템 체크) | P1 |
| KioItemDescDlg | 351 | 상품 설명 표시 | P2 |
| KioCheckoutDlg | - | 결제 화면 | P0 |
| KioCompleteDlg | - | 주문 완료 화면 | P0 |
| KioCardAmtPadDlg | - | 카드 금액 입력 | P0 |
| KioNumPadDlg | - | 숫자 키패드 | P1 |
| KioTableViewDlg | - | 테이블 선택 (식당) | P1 |
| KioBtnChoiceDlg | - | 버튼 선택 | P1 |
| KioBtnChoiceV2Dlg | - | 버튼 선택 V2 | P1 |
| KioItemSearchDlg | - | 상품 검색 | P2 |
| KioMangrDlg | - | 키오스크 관리자 | P1 |
| KioScaleDlg | - | 저울 연동 | P2 |
| KioRfTagDlg | - | RFID 태그 | P2 |
| KioOrAccSelectDlg | - | 주문/결제 선택 | P1 |
| KioBottomImgDlg | - | 하단 이미지 | P2 |
| KioBellSelectDlg | - | 벨 선택 (알림) | P2 |
| KioWaitingDlg | 280 | 대기 화면 | P1 |
| KioPointChoiceDlg | 349 | 포인트 선택 | P2 |

### 8.2 키오스크 핵심 기능

| 기능 | 설명 | 중요도 |
|------|------|--------|
| 다국어 지원 | 한국어/영어/중국어/일본어 4개 언어 | P1 |
| 상품 이미지 | 그룹/상품별 이미지 표시 | P0 |
| 세트메뉴 구성 | 수량 제한, 필수/선택 옵션 | P0 |
| 저울 연동 | 중량 기반 가격 계산 | P2 |
| RFID 태그 | RFID 기반 상품 인식 | P2 |
| 브레이크타임 | 시간대별 판매 제한 | P1 |
| 품절 관리 | ADUFlag "SO" 기반 | P1 |
| 대기번호 인쇄 | KioskWaitingOrderNo() | P0 |
| 포인트 적립/사용 | 고객 포인트 연동 | P1 |

---

## 9. 다이얼로그 전수 목록

### 9.1 메인 resource.h (243개)

#### 테이블/플로어

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_TABLE_DIALOG | - | 메인 테이블/플로어 화면 |
| IDD_SELTABLE_DIALOG | 403 | 테이블 선택 (합석/이동) |
| IDD_TABLE_APPOINT | 111 | 예약 테이블 뷰 |
| IDD_TABLEGRP_CHECKOUT | 347 | 그룹 테이블 결제 |
| IDD_TABLEMSG_DLG | 112 | 테이블 메모 |
| IDD_TABLEVIEW_DLG | 366 | 테이블 뷰 |
| IDD_TABLE_BSELECT | 417 | 테이블 버튼 선택 |

#### 주문

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_ORDER_DIALOG | 174 | 주문 관리 |
| IDD_ORDER_BSELECT | 115 | 주문 버튼 선택 |
| IDD_ORDERITEM_DLG | 142 | 주문 상품 선택 |
| IDD_ORDERITEMDE | 157 | 주문 상품 상세 |
| IDD_ORDERMSG | 373 | 주문 메시지 (조리메모) |
| IDD_TORD_MANGR | 340 | 테이블 주문 관리자 |
| IDD_TORD_CONTROL | 341 | 테이블 주문 제어 |
| IDD_TORD_ORDERECEIVE | 355 | 주문 수신 |
| IDD_TORD_ORDERSTATE | 359 | 주문 상태 |

#### 결제/매출

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_ACCOUNT_DIALOG | 101 | 결제 관리 |
| IDD_ACCASH_DIALOG | 431 | 현금 결제 |
| IDD_ACCARD_DIALOG | 432 | 카드 결제 |
| IDD_ACCETC_DIALIG | 433 | 기타 결제 |
| IDD_ACC_DUTCHPAY | 356 | 더치페이 (분할) |
| IDD_SALEMANAGE | 408 | 매출 관리 |
| IDD_SELLVIEW | 389 | 매출 조회 |
| IDD_SELLLISTVIEW | 151 | 매출 목록 |
| IDD_SELLVOID_DLG | 146 | 매출 무효화 |
| IDD_SALEDC | 374 | 할인 관리 |
| IDD_CHECKOUT_DLG | 220 | 체크아웃 |
| IDD_CASH_RECEIPT | 228 | 현금영수증 |
| IDD_SIMPLE_RECEIPT | 113 | 간이영수증 조회 |

#### 카드/VAN

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_CATCARDMGR_DLG | 221 | CAT 카드 관리자 |
| IDD_CATCASHMGR_DLG | 222 | CAT 현금 관리자 |
| IDD_CARDLIST_DLG | 204 | 카드 매출 이력 |
| IDD_CAT_SPC | 223 | SPC CAT 설정 |
| IDD_CAT_KSNET | 225 | KSNET CAT 설정 |
| IDD_CAT_SMARTRO | 229 | Smartro CAT 설정 |
| IDD_CVR_KIS | 232 | KIS CVR |
| IDD_CVR_DAOU | 240 | Daou CVR |
| IDD_CVR_SMARTRO | 265 | Smartro CVR |
| IDD_CAT_KFTC | 235 | KFTC CAT |
| IDD_CAT_KFTCV2 | 325 | KFTC CAT V2 |

#### QR 결제

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_ZALOPAY_QR | 441 | ZaloPay QR |
| IDD_INFOPLUS_SHINHAN_QR | 444 | 신한 QR |
| IDD_NAPAS_QR | 445 | NAPAS QR |
| IDD_INFOPLUS_BIDV_QR | 446 | BIDV QR |
| IDD_INFOPLUS_WOORI_QR | 453 | 우리 QR |
| IDD_HJVIETPAY_DLG | 454 | HJVietPay QR |
| IDD_ASYNC_PAYNOTI_DLG | 452 | 비동기 결제 알림 |

#### 모바일 결제

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_PAYCO_DLG | 212 | PAYCO |
| IDD_KAKAOPAY_DLG | 285 | 카카오페이 |
| IDD_COSMOPAY_DLG | 326 | COSMO 결제 |
| IDD_COSMOREFUND | 327 | COSMO 환불 |
| IDD_OKCASHBAG | 236 | OK캐쉬백 |
| IDD_OKCASHBAGVAN | 155 | OK캐쉬백 VAN |
| IDD_OKCASHBAGNEW | 437 | OK캐쉬백 신규 |

#### 고객

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_CUSTINFO_DLG | 114 | 고객 정보 |
| IDD_CUST_DETAIL | 139 | 고객 상세 |
| IDD_CUSTINPUT | 138 | 고객 등록 |
| IDD_CUSTREGI | 409 | 고객 등록 |
| IDD_CUST_ALLREG | 205 | 고객 일괄 등록 |
| IDD_CUST_KEEP | 153 | 고객 충전/적립 |
| IDD_CUSTDELI | 123 | 배달 고객 |
| IDD_CUSTDELI2 | 169 | 배달 고객 V2 |
| IDD_CUSTDELI_ADDR | 149 | 배달 주소 |
| IDD_CUSTDELI_AGENCY | 269 | 대행사 배달 |
| IDD_CUST_CHAIN_MGR | 207 | 체인 고객 관리 |
| IDD_CUSTITEM_USE | 256 | 구독 상품 사용 |
| IDD_CUSTITEM_SELL | 257 | 구독 상품 판매 |
| IDD_CUSTITEM_IN | 258 | 구독 상품 등록 |

#### 상품/재고

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_ITEMREGI | 178 | 상품 등록 |
| IDD_ITEM_SEARCH | 191 | 상품 검색 |
| IDD_ITEM_PRESET_DLG | 231 | 상품 프리셋 |
| IDD_ITEMPLU_DLG | 180 | 상품 PLU |
| IDD_GROUPSEL_DLG | 179 | 그룹 선택 |
| IDD_SCALEITEM_DLG | 332 | 저울 상품 |
| IDD_MENUSET | 150 | 세트메뉴 구성 |
| IDD_STOCK_DLG | 104 | 재고 관리 |
| IDD_STOCK_INPUT | 105 | 재고 입고 |
| IDD_STOCK_SUPPLY | 106 | 거래처 |
| IDD_STOCK_VIEW | 107 | 재고 조회 |
| IDD_STOCK_DATEVIEW | 108 | 재고 일자별 |
| IDD_STOCK_ACCOUNT | 109 | 재고 회계 |
| IDD_PUR_STOCKVIEW | 192 | 구매 재고 조회 |

#### 기프트/쿠폰

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_GIFTMGR_DLG | 259 | 기프트 관리 |
| IDD_GIFTREG_DLG | 260 | 기프트 등록 |
| IDD_GIFTSELL_DLG | 261 | 기프트 판매 |
| IDD_COUPONUSE_DLG | 217 | 쿠폰 사용 |
| IDD_POINTSAVESELL | 158 | 포인트 적립 매출 |

#### 마감/정산

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_AUTOWORK | 132 | 자동 마감 |
| IDD_SALEMANAGE_INOUT | 1210 | 매출 입출금 |
| IDD_SALEMANAGE_SELVIEW | 1211 | 매출 조회 뷰 |
| IDD_SALEMANAGE_TICK | 1212 | 매출 집계 |
| IDD_SALEMANAGE_MONEY | 1213 | 현금 정산 |
| IDD_SALEMANAGE_RECEIPT | 1219 | 영수증 상태 |
| IDD_SALEMANAGE_APPOINT | 1220 | 예약 정보 |

#### 직원

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_EMP_DILIGENCE | 122 | 직원 근태 |
| IDD_EMP_DILI_SET | 161 | 출퇴근 설정 |
| IDD_EMP_DILI_MOD | 163 | 근태 수정 |
| IDD_EMPSEL_DLG | 301 | 직원 선택 |
| IDD_EMPCALL_DLG | 334 | 직원 호출 |
| IDD_EMPALIM_DLG | 335 | 직원 알림 |

#### 인증/보안

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_AUTH_DIALOG | 172 | 직원 인증/로그인 |
| IDD_SECURITY | 218 | 보안 설정 |
| IDD_UNPERMISSION | 399 | 권한 부족 |

#### 키오스크

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_KIOSK_DLG | 276 | 키오스크 메인 |
| IDD_KIO_WAITING | 280 | 키오스크 대기 |
| IDD_KIO_COMPLETE | 281 | 키오스크 완료 |
| IDD_KIO_ITEMDLG | 305 | 키오스크 상품 |
| IDD_KIO_ITEMDLG2 | 439 | 키오스크 상품 V2 |
| IDD_KIO_OPTITEM | 297 | 키오스크 옵션 |
| IDD_KIO_OPTITEMV2 | 343 | 키오스크 옵션 V2 |
| IDD_KIO_SETITEM | 279 | 키오스크 세트 |
| IDD_KIO_CHECKOUT | 312 | 키오스크 체크아웃 |
| IDD_KIO_NUMPAD | 314 | 키오스크 숫자패드 |
| IDD_KIO_CARDAMTPAD | 352 | 키오스크 카드 금액 |
| IDD_KIO_TABLEVIEW | 366 | 키오스크 테이블 뷰 |
| IDD_KIO_ORDERLIST | 308 | 키오스크 주문 목록 |
| IDD_KIO_POINT_CHOICE | 349 | 키오스크 포인트 선택 |
| IDD_KIO_POINT_USE | 350 | 키오스크 포인트 사용 |
| IDD_KIO_SCALE_DLG | 333 | 키오스크 저울 |

#### 주방 디스플레이

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_KITCHENVIEW_DLG | 206 | 주방 디스플레이 |
| IDD_KITCHEN_VIEW_SET | 353 | 주방 디스플레이 설정 |

#### 공통/유틸

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_NUMPAD | 424 | 숫자 키패드 |
| IDD_KEYBOARD | 418 | 키보드 |
| IDD_SIGN_TOUCHDLG | 213 | 서명 터치패드 |
| IDD_INOUT_DLG | 422 | 입출금 |
| IDD_APPOINTMENT_DIALOG | 400 | 예약 관리 |
| IDD_MESSAGE_DIALOG | 364 | 메시지 표시 |
| IDD_NOTICE | 159 | 공지사항 |
| IDD_RECEIPT_CHOICE | 337 | 영수증 선택 |
| IDD_TAX_EXCHANGE | 227 | 세금/환율 |

### 9.2 RestaurantSet resource.h (107개)

| IDD | 값 | 설명 |
|-----|---|------|
| IDD_TABLE_SET | 143 | 테이블 설정 |
| IDD_TABLESET_DETAIL | 160 | 테이블 상세 설정 |
| IDD_TABLE_CREATE | 164 | 테이블 생성 |
| IDD_TABLE_CRIMG | 179 | 테이블 이미지 |
| IDD_K_TABLEORDER | 253 | 테이블 주문 설정 |
| IDD_TABLEMSG | 174 | 테이블 메모 |
| IDD_BASICSET | 130 | 기본 설정 |
| IDD_COMPANY | 131 | 회사 정보 |
| IDD_DEVICE | 132 | 디바이스 설정 |
| IDD_EMP_INPUT | 137 | 직원 등록 |
| IDD_EMP_DETAIL | 165 | 직원 상세 |
| IDD_EMP_GRPDLG | 171 | 직원 그룹 |
| IDD_CUSTINPUT | 138 | 고객 등록 |
| IDD_CUST_DETAIL | 139 | 고객 상세 |
| IDD_PAY_MGR | - | 결제 관리 |
| IDD_CARD_MGR | - | 카드 관리 |
| IDD_PRINT_MGR | - | 프린터 관리 |
| IDD_ETC_MGR | - | 기타 관리 |
| IDD_KIO_MGR | - | 키오스크 관리 |
| IDD_KIO_ITEMMGR | - | 키오스크 상품 관리 |
| IDD_DATA_RESTORE | - | 데이터 복원 |
| IDD_BASICCODE | - | 기본 코드 관리 |
| IDD_INISET | 410 | INI 설정 |

---

## 부록: 핵심 데이터 흐름 다이어그램

```
[고객 주문 흐름]
테이블 선택 (CTableDlg)
  → 주문 입력 (OrderMgr::AddOrder)
    → 주방 인쇄 (ThermalPrn::OrderPrint)
      → 결제 (SaleMgr::CalcSellSlip → AddSellSlip)
        → 영수증 인쇄 (ThermalPrn::SellPrint)
          → 테이블 클리어 (TableMgr::ClearOrderFromID)

[배달 주문 흐름]
외부 MQTT 수신 (FoodingIncomingHandler)
  → 배달 화면 팝업 (SciterDelivery2Dlg)
    → 수락 (SciterDeliveryBridge::FoodingAccept)
      → 배달 테이블 생성 (TableMgr::GetDeliveryMaxTableCode)
        → 주문 생성 (OrderMgr::AddOrder)
          → 배달 시작/완료 (FoodingMQTTPublisher::PublishDeliveryStatus)

[마감 흐름]
마감 시작 (WorkMgr::CalcEndWork)
  → 카드사별 정산 (WorkMgr::CalcCardBuyer)
    → 마감 보고서 인쇄 (ThermalPrn::EndWork)
      → ASP 동기화 (AspDataMgr::SendSqlMsgAspLoder)
        → 정산 기록 (WorkMgr::SetPosWorkAdjust)
```

---

> **문서 작성**: Project Migration Lead Architect (5-Agent Parallel Analysis)
> **분석 완료**: 2026-04-03
> **다음 단계**: 이 명세서를 기반으로 P0 기능부터 CEF + Next.js 아키텍처로 점진 전환

## 최종 검증 메모

- 포함 범위: `Table/Floor`, `Sales/Payment`, `Inventory/Menu`, `Customer`, `System/Admin`, `External Bridge`, `Kiosk`, `Dialog inventory`, `Appendix`
- 검증 결과: 현재 원본 기능 목록에 있던 주요 카테고리와 세부 기능을 모두 유지했다
- 해석 범위: 이 문서는 레거시 기능을 신규 플랫폼 설계로 이식하기 위한 기준 목록이며, 구현 우선순위는 별도 설계 문서를 따른다
- 원본 참조: `/Users/hyojae/projects/Platform/Docs/Analysis/FeatureInventory.md`
