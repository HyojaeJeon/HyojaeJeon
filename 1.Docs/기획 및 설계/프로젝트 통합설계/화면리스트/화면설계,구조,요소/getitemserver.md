# GETITEMSERVER 화면 설계서

---

## 0. 문서 정보

| 항목 | 값 |
|---|---|
| 문서 ID | SCR-GETITEMSERVER |
| 화면 ID (레거시) | IDD_GETITEMSERVER |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

---

## 1. 화면 개요

GETITEMSERVER는 중앙 서버에서 상품 데이터를 POS 로컬 DB로 동기화하는 화면이다. 바코드/상품명으로 검색하고, 서버 상품을 로컬에 저장하며, 분류(대/중)를 가져온다. 온라인 필수 기능이므로 Offline-First 예외에 해당하며, 오프라인 시 진입을 차단해야 한다.

- 신규 UI 위치: `shared/ui/organisms/ServerItemSyncModal`
- 화면 유형: 모달 (Organism)
- 우선순위: **P0**

---

## 2. 상위 기준 연결

| 기준 문서 | 관련 섹션 | 비고 |
|---|---|---|
| 04-Edge-POS-아키텍처-설계서 | Sync 규칙 | 서버 -> 로컬 동기화 |
| CLAUDE.md | Offline-First 규칙 | 온라인 필수 예외 |

---

## 3. 기능 목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| GITEM-F01 | 서버 상품 저장 (동기화) | P0 | ITEM:SYNC_FROM_SERVER | SyncItemFromServerUseCase | ItemMgr | Tables/Item/ItemCrud (SQLite), Network/HTTP |
| GITEM-F02 | 닫기 | P0 | 없음 (모달 닫기) | - | - | - |
| GITEM-F03 | 분류 가져오기 | P1 | ITEM:SYNC_FROM_SERVER | SyncItemFromServerUseCase | ItemMgr | Tables/Item/ItemCrud (SQLite), Network/HTTP |
| GITEM-F04 | 바코드로 검색 | P1 | ITEM:SEARCH | - | ItemMgr | Tables/Item/ItemCrud (SQLite) |
| GITEM-F05 | 상품명으로 검색 | P1 | ITEM:SEARCH | - | ItemMgr | Tables/Item/ItemCrud (SQLite) |

---

## 4. UI 구조

### 4.1 화면 레이아웃

```
+-------------------------------------------------------+
|                               [저장] [닫기]              |
|                                                       |
| 바코드   [입력]        대분류  [표시]                     |
| 상품명   [입력]        중분류  [표시]  [분류가져오기]       |
| 판매가   [입력]                                         |
| 원가     [입력]        [검색]                            |
|                                                       |
| +--서버 상품 목록 그리드-----------------------------+    |
| | 바코드 | 상품명 | 판매가 | 원가 | 분류 | ...        |    |
| |                                                  |    |
| +--------------------------------------------------+    |
+-------------------------------------------------------+
```

### 4.2 컴포넌트 매핑 (shared/ui 기준)

| 영역 | 컴포넌트 경로 | 비고 |
|---|---|---|
| 모달 전체 | shared/ui/organisms/ServerItemSyncModal | 상품 동기화 모달 |
| 상품 목록 | shared/ui/molecules/DataTable | React 테이블 |
| 입력 필드 | shared/ui/atoms/TextInput, shared/ui/atoms/AmountInput | 바코드/상품명/금액 |

### 4.3 데이터 바인딩

| ID | 표시 항목 | 신규 UI 컴포넌트 | 데이터 소스 |
|---|---|---|---|
| GITEM-D01 | 바코드 입력 | TextInput | UI 로컬 상태 |
| GITEM-D02 | 상품명 입력 | TextInput | UI 로컬 상태 |
| GITEM-D03 | 판매가 입력 | AmountInput | UI 로컬 상태 |
| GITEM-D04 | 원가 입력 | AmountInput | UI 로컬 상태 |
| GITEM-D05 | 대분류 표시 | Label | itemApi.getCategories |
| GITEM-D06 | 중분류 표시 | Label | itemApi.getCategories |
| GITEM-D07 | 서버 상품 목록 그리드 | DataTable | itemApi.getServerItems |

---

## 5. 구현 명세

### 5.1 Bridge Command

| Command | 요청 payload | 응답 payload | Error | 비고 |
|---|---|---|---|---|
| ITEM:SYNC_FROM_SERVER | `{}` | `{ syncedCount, failedCount }` | `OFFLINE_BLOCKED`, `SYNC_FAILED` | 서버 -> 로컬 동기화 |
| ITEM:SEARCH | `{ barcode?, itemName? }` | `{ items: [...] }` | (없음) | 검색 |

### 5.2 UseCase

| UseCase | 책임 | 트랜잭션 | Ledger | Outbox |
|---|---|---|---|---|
| SyncItemFromServerUseCase | 서버 API 호출 -> 로컬 SQLite 저장 | O (SQLite TX 원자적) | - | - |

> **UseCase 실패 규칙**: SQLite TX 원자적 — 실패 시 전체 롤백. **온라인 필수** — 오프라인 시 `OFFLINE_BLOCKED`로 진입 차단. 서버 통신 실패 시 `SYNC_FAILED` 반환, Outbox 재전송 대상 아님.

### 5.3 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| ItemMgr | SyncFromServer() | 서버 상품 동기화 |
| ItemMgr | SearchItems() | 상품 검색 |

### 5.4 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Item/ItemCrud | SQLite | 상품 저장/검색 |
| Network/HTTP | - | 서버 API 호출 |

### 5.5 RTK Query 연동

| Endpoint | 태그 | 비고 |
|---|---|---|
| itemApi.getServerItems | `ServerItems` | 서버 상품 목록 |
| itemApi.getCategories | `ItemCategories` | 상품 분류 |

### 5.6 PosRealTime 이벤트

해당 없음.

### 5.7 i18n / Error / Permission

| 항목 | 규칙 | 비고 |
|---|---|---|
| i18n | `BrandPosApp/PosUi/src/i18n/locales/{ko,vi,en}/item.json` | msgKey 기반 |
| Error | 코드 기반: `{ type, code, msgKey, severity, recoverable }` | `OFFLINE_BLOCKED`, `SYNC_FAILED` |
| Permission | **관리자 전용**. 서버 상품 동기화는 관리자만 실행 가능. | |

---

## 6. 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| GITEM-T01 | 서버 상품 저장 | 로컬 SQLite에 상품 동기화 |
| GITEM-T02 | 오프라인 상태에서 진입 | 진입 차단 |
| GITEM-T03 | 바코드로 검색 | 매칭 상품 표시 |
| GITEM-T04 | 분류 가져오기 | 대/중분류 갱신 |

---

## 7. 완료 기준

- [ ] SyncItemFromServerUseCase가 서버 API -> 로컬 SQLite 저장을 처리한다
- [ ] 오프라인 시 진입이 차단된다
- [ ] MFCGridCtrl 1개가 React 테이블로 대체된다
- [ ] 분류 가져오기가 서버에서 카테고리를 동기화한다

---

## 8. 작업 명단

| 작업 | 대상 파일 경로 | 상태 |
|---|---|---|
| Organism 구현 | `BrandPosApp/PosUi/src/shared/ui/organisms/ServerItemSyncModal.tsx` | TODO |
| Bridge Command | `BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Item/ItemActions.cpp` | TODO |
| UseCase | `BrandPosApp/UseCases/Item/SyncItemFromServerUseCase.cpp` | TODO |
| Domain | `BrandPosApp/Domain/Item/ItemMgr.cpp` | TODO |
| Persistence | `BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemCrud.cpp` | TODO |
| RTK Query | `BrandPosApp/PosUi/src/store/api/itemApi.ts` | TODO |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|---|---|
| 다이얼로그 ID | IDD_GETITEMSERVER |
| 리소스 값 | 181 |
| 크기 (DLU) | 512 x 383 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 11 (버튼 4, 라벨 2, 입력 4, 그리드 1) |

### 레거시 컨트롤 -> 신규 매핑

| 레거시 컨트롤 | 신규 대응 |
|---|---|
| IDC_BTN_SAVE | 저장 버튼 |
| IDCANCEL | 닫기 버튼 |
| IDC_BTN_GRP | 분류가져오기 버튼 |
| IDC_EDT_BARCODE | TextInput (바코드) |
| IDC_EDT_ITEMNAME | TextInput (상품명) |
| IDC_EDT_SALEAMT | AmountInput (판매가) |
| IDC_EDT_ORIAMT | AmountInput (원가) |
| IDC_STC_BIG / IDC_STC_MID | Label (대/중분류) |
| IDC_GRID (MFCGridCtrl) | DataTable (서버 상품 목록) |

---

## Progress

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-04-05 | UI Shell 구현: `BrandPosApp/PosUi/src/screens/StockScreen/components/GetItemServerDialog.tsx` | DONE |
