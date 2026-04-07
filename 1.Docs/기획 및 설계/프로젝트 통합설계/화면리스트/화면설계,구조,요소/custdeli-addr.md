# CUSTDELI_ADDR — 배달 주소 등록/관리 모달

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | CUSTDELI_ADDR |
| 레거시 다이얼로그 | IDD_CUSTDELI_ADDR (149) |
| 신규 위치 | screens/DeliveryScreen/AddressManageModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

배달 주소를 그룹(동/지역) 단위로 등록하고 관리하는 모달 화면이다.
좌측 주소 그룹 목록 + 우측 선택 그룹의 상세 주소 목록으로 구성된 마스터-디테일 패턴이다.
CUSTDELI, CUSTDELI2에서 주소 선택 시 호출되며, 선택한 주소를 부모 화면에 반환한다.

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | UseCases, Persistence | 로컬 SQLite 기준 주소 관리 |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 배달 주소 관리 | 온라인 주소 검색 API와 별도 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| CUSTDELIADDR-F01 | 주소 그룹 추가 | P0 | DELIVERY:SEARCH_ADDRESS | SearchDeliveryAddressUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F02 | 주소 그룹 저장 | P0 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F03 | 주소 그룹 선택삭제 | P1 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F04 | 주소 항목 추가 | P0 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F05 | 주소 항목 저장 | P0 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F06 | 주소 항목 선택삭제 | P1 | CUSTOMER:UPDATE | UpdateCustomerUseCase | CustMgr | Tables/Customer/DeliveryCrud |
| CUSTDELIADDR-F07 | 주소 선택 확정 | P0 | N/A (UI 로컬, 부모에 반환) | N/A | N/A | N/A |
| CUSTDELIADDR-F08 | 닫기/취소 | P0 | N/A (UI 로컬) | N/A | N/A | N/A |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+--------------------------------------------------------------+
| 주소등록 및 관리                          [선택]  [닫기]       |
+--------------------------------------------------------------+
| [그룹추가] [그룹저장] [그룹삭제] | [주소추가] [주소저장] [주소삭제] |
+-----------------------------+--------------------------------+
| 주소 그룹 DataGrid           | 주소 항목 DataGrid              |
| (그룹명/지역명)              | (주소, 상세주소, 비고 등)       |
|                              |                                |
|                              |                                |
|                              |                                |
+-----------------------------+--------------------------------+
```

- 풀스크린(512x384 DLU 기반) 모달
- 마스터-디테일: 좌측 그룹 선택 → 우측 해당 그룹 주소 목록
- 그룹/주소 각각 추가/저장/삭제 버튼 쌍
- 신규에서는 인라인 편집 + 단일 저장으로 간소화 가능

### 4.2 사용 컴포넌트 (shared/ui)

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| DataGrid | shared/ui/organisms/DataGrid | 주소 그룹 목록, 주소 항목 목록 (2개) |

---

## 5. 구현 명세

### 5.1 Bridge Command

**DELIVERY:SEARCH_ADDRESS**

```jsonc
// Request
{
  "v": 1,
  "requestId": "<uuid>",
  "timestamp": "<ISO8601>",
  "command": "DELIVERY:SEARCH_ADDRESS",
  "params": {
    "groupId": "string"       // optional, 없으면 전체 그룹 조회
  }
}

// Response
{
  "v": 1,
  "requestId": "<echo>",
  "timestamp": "<ISO8601>",
  "status": "OK",
  "data": {
    "groups": [
      { "groupId": "string", "groupName": "string" }
    ],
    "addresses": [
      { "addressId": "string", "groupId": "string", "addr": "string", "addrDetail": "string", "memo": "string" }
    ]
  }
}
```

> TODO: 주소 그룹/항목 추가/수정/삭제용 별도 커맨드 필요 여부 확정 — 확인 필요: CUSTOMER:UPDATE로 통합할지, DELIVERY:MANAGE_ADDRESS 등 별도 커맨드를 도입할지

> Error: DELIVERY:SEARCH_ADDRESS에 정의된 에러 코드 없음. 검색 결과가 없으면 빈 배열 반환.

#### UseCase 실패 규칙

| 실패 조건 | 에러 코드 | Ledger 상태 | UI 처리 |
|---|---|---|---|
| 주소 그룹/항목 저장 실패 (CUSTOMER:UPDATE) | CUSTOMER_NOT_FOUND | FAILED | 에러 메시지 표시 |
| 동일 idempotencyKey 재전송 | N/A (기존 결과 반환) | 기존 상태 유지 | 성공 응답 그대로 처리 |

#### Permission

| 기능 | 권한 |
|---|---|
| 주소 조회/등록/수정/삭제 | 로그인 직원 전원 |

### 5.2 RTK Query Endpoint

| Endpoint | 파일 | 메서드 | Tags |
|---|---|---|---|
| useGetAddressGroupsQuery | store/api/deliveryApi.tsx | DELIVERY:SEARCH_ADDRESS | `AddressGroups` |
| useGetAddressItemsQuery | store/api/deliveryApi.tsx | DELIVERY:SEARCH_ADDRESS (groupId) | `AddressItems:{groupId}` |

### 5.3 UseCases

| UseCase | 역할 | 멱등성 |
|---|---|---|
| SearchDeliveryAddressUseCase | 주소 그룹/항목 조회 | 조회 전용 |
| UpdateCustomerUseCase | 주소 그룹/항목 추가/수정/삭제 | idempotencyKey 필수 |

### 5.4 Domain / Manager

| Manager | 메서드 | 역할 |
|---|---|---|
| CustMgr | GetAddressGroups() | 주소 그룹 조회 |
| CustMgr | GetAddressItems() | 그룹별 주소 조회 |
| CustMgr | SaveAddressGroup() | 그룹 추가/수정 |
| CustMgr | SaveAddressItem() | 주소 추가/수정 |
| CustMgr | DeleteAddressGroup() | 그룹 삭제 |
| CustMgr | DeleteAddressItem() | 주소 삭제 |

### 5.5 Infrastructure

| 모듈 | 파일 | 역할 |
|---|---|---|
| Tables/Customer/DeliveryCrud | Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 주소 그룹/항목 CRUD |

### 5.6 PosRealTime 이벤트

해당 없음 (주소 데이터는 로컬 관리).

---

## 6. 테스트

| ID | 시나리오 | 예상 결과 |
|---|---|---|
| CUSTDELIADDR-T01 | 그룹 목록 조회 | 주소 그룹 DataGrid 표시 |
| CUSTDELIADDR-T02 | 그룹 선택 | 우측 주소 항목 DataGrid 갱신 |
| CUSTDELIADDR-T03 | 그룹 추가 + 저장 | 새 그룹 생성 |
| CUSTDELIADDR-T04 | 주소 추가 + 저장 | 새 주소 생성 |
| CUSTDELIADDR-T05 | 그룹 삭제 | 선택 그룹 삭제 |
| CUSTDELIADDR-T06 | 주소 선택 확정 | 선택 주소가 부모 화면에 반환 |
| CUSTDELIADDR-T07 | 닫기 | 모달 닫힘, 부모 상태 변경 없음 |

---

## 7. 완료 기준

- [ ] 마스터-디테일 DataGrid 연동 (그룹 선택 → 주소 목록)
- [ ] 그룹/주소 CRUD 동작
- [ ] 주소 선택 확정 시 부모 화면에 결과 반환
- [ ] 인라인 편집 + 저장 패턴
- [ ] 1024x768 해상도, 터치 사용성 검증

---

## 8. 작업 명단

| 계층 | 파일 경로 | 작업 내용 |
|---|---|---|
| PosUi Screen | BrandPosApp/PosUi/src/screens/DeliveryScreen/AddressManageModal.tsx | 주소 관리 모달 |
| PosUi Store | BrandPosApp/PosUi/src/store/api/deliveryApi.ts | useGetAddressGroupsQuery, useGetAddressItemsQuery |
| PosUi Shared | BrandPosApp/PosUi/src/shared/ui/organisms/DataGrid.tsx | 2개 그리드 |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/deliveryCommands.ts | DELIVERY:SEARCH_ADDRESS |
| C++ Actions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Delivery/DeliveryActions.cpp | thin router |
| C++ UseCase | BrandPosApp/UseCases/Delivery/SearchDeliveryAddressUseCase.cpp | 주소 조회 |
| C++ UseCase | BrandPosApp/UseCases/Customer/UpdateCustomerUseCase.cpp | 주소 저장/삭제 |
| C++ Manager | BrandPosApp/Domain/Customer/CustMgr.cpp | 주소 관련 메서드 |
| C++ Persistence | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Customer/DeliveryCrud.cpp | 주소 CRUD |

---

## Appendix: 레거시 UI 참조

### A.1 기본 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_CUSTDELI_ADDR |
| 리소스 값 | 149 |
| 크기 (DLU) | 512 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 12 |

### A.2 레거시 UI 요소 목록

**버튼 (9개)**: ID_JANG_GRPADD(그룹추가), ID_JANG_GRPALLSAVE(그룹저장), ID_JANG_GRPSELDEL(그룹삭제), ID_JANG_ADD(주소추가), ID_JANG_ALLSAVE(주소저장), ID_JANG_SELDEL(주소삭제), IDC_SELECT(선택), IDCANCEL(닫기), IDOK(숨김)

**텍스트/라벨 (1개)**: IDC_STA_TITLE (주소등록 및 관리)

**그리드 (2개)**: IDC_GRID(주소 그룹), IDC_GRID2(주소 항목)

### A.3 마이그레이션 노트

- 마스터-디테일 패턴: 좌측 그룹, 우측 상세 주소
- 그룹과 주소 각각에 추가/저장/삭제 버튼 쌍. 신규에서는 인라인 편집 + 단일 저장으로 간소화 가능
- IDC_SELECT(선택)은 모달 반환값으로 선택 주소를 부모 화면에 전달
- 주소 데이터는 로컬 SQLite 기준 관리. 온라인 주소 검색 API와 별도

---

## Progress Record

| 날짜 | 작업 | 상태 |
|---|---|---|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/CustomerScreen/components/DeliveryAddressDialog.tsx` | Shell 완료 (master-detail, inline edit, stub handlers). Backend 미연결. |
