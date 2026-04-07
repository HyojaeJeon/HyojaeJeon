# KIO_OPTITEM - 키오스크 옵션 선택

## 0. 문서정보

| 항목 | 값 |
|------|---|
| 문서 ID | SCR-KIO-OPTITEM |
| 레거시 다이얼로그 | IDD_KIO_OPTITEM (297) |
| 신규 화면 경로 | shared/ui/organisms/KioskOptionModal |
| 작성일 | 2026-04-05 |
| 상태 | 초안 |

## 1. 화면개요

키오스크 옵션 선택 모달이다. 키오스크 메인 화면(kiosk-dlg)에서 메뉴 항목 선택 시 팝업으로 표시된다. 최대 5개 옵션 그룹을 지원하며, 각 그룹 내에서 옵션을 가로 스크롤/페이지네이션으로 탐색하여 선택한다. 선택한 옵션에 따라 주문 금액이 실시간 재계산(기본가 + 옵션 추가금)된다. 키오스크 고객 대면 모달이므로 터치 최소 크기(44x44px)를 준수한다.

## 2. 상위기준연결

| 기준 문서 | 관련 섹션 |
|-----------|-----------|
| 04-Edge-POS-아키텍처-설계서 | 계층 흐름, CEF/UI 운영 규칙 (1024x768, 터치 사용성) |
| 05-Edge-POS-전체-흐름-AZ-가이드 | 키오스크 주문 흐름 (옵션 선택) |
| CLAUDE.md | shared/ui 컴포넌트 구조 규칙 (공용 UI는 shared/ui에 배치) |

## 3. 기능목록

| ID | 기능명 | 우선순위 | Bridge Command | UseCase | Domain/Manager | Infrastructure |
|---|---|---|---|---|---|---|
| KO-F01 | 옵션 선택 확인 | P0 | KIOSK:SELECT_OPTION | SelectKioskOptionUseCase | KioskMgr, ItemMgr | Tables/Stock/OrderCrud |
| KO-F02 | 다이얼로그 닫기 | P1 | - (모달 닫기) | - | - | - |
| KO-F03 | 옵션 그룹별 가로 스크롤 (1~5) | P2 | - | - | - | - |
| KO-F04 | 페이지네이션 (다음/이전) | P2 | - | - | - | - |
| KO-F05 | 선택 초기화 (조건부) | P2 | - | - | - | - |
| KO-F06 | 옵션 그룹별 선택 취소 (1~5) | P2 | - | - | - | - |

## 4. UI 구조

### 4.1 화면 레이아웃

```
+---------------------------------------------------------------+
| [선택 초기화 (조건부)]         [닫기]                           |
+---------------------------------------------------------------+
| 상품명: ITEMNAME                              금액: ₩0        |
+---------------------------------------------------------------+
| 옵션 그룹 1  [x취소]                                          |
| [옵션A] [옵션B] [옵션C] ...          (가로 스크롤/스와이프)   |
+---------------------------------------------------------------+
| 옵션 그룹 2  [x취소]                                          |
| [옵션D] [옵션E] [옵션F] ...          (가로 스크롤/스와이프)   |
+---------------------------------------------------------------+
| ... (최대 5개 그룹, 데이터 기반 동적 렌더링)                   |
+---------------------------------------------------------------+
| [이전 페이지 (조건부)] [다음 페이지 (조건부)]                  |
+---------------------------------------------------------------+
|              [ 선 택 완 료 ]                                   |
+---------------------------------------------------------------+
```

### 4.2 shared/ui 컴포넌트 매핑

| shared/ui 컴포넌트 | 용도 | 비고 |
|---|---|---|
| shared/ui/organisms/KioskOptionModal | 옵션 선택 모달 전체 | 이 화면 자체가 공용 모달 컴포넌트 |

**설계 노트**: 이 화면은 `screens/` 내부 화면이 아니라 `shared/ui/organisms/KioskOptionModal`로 배치한다. 키오스크 화면(kiosk-dlg)에서 호출하는 재사용 가능한 모달이다.

## 5. 구현명세

### 5.1 PosRequest 명세

| Command | Payload | 응답 | 비고 |
|---|---|---|---|
| KIOSK:SELECT_OPTION | `{ itemId, options: [{ optionGroupId, optionId }] }` | `{ item: { itemId, itemName, basePrice, selectedOptions: [...], totalPrice } }` | 옵션 선택 결과를 주문 항목에 반영. Error: `INVALID_OPTION` |

### 5.2 RTK Query endpoint

| endpoint | 태그 | 캐시 전략 |
|---|---|---|
| kioskApi.getItemOptions | `ItemOptions:{itemCode}` | 품목별 캐시, 메뉴 변경 시 무효화 |

### 5.3 UseCase 흐름

**SelectKioskOptionUseCase (P0)**
1. requestId + idempotencyKey 검사
2. ItemMgr.GetItemOptions() - 옵션 그룹/옵션 목록 조회
3. KioskMgr.ApplyOptionToOrder() - 옵션 선택 결과를 주문 항목에 반영
4. 금액 재계산: 기본가 + 옵션 추가금
5. 트랜잭션 내: 업무 데이터 + Ledger 기록
6. 커밋 후: PosRealTimeSender로 주문 갱신 이벤트 방송

### 5.4 Domain/Manager

| Manager | 메서드 | 책임 |
|---|---|---|
| KioskMgr | ApplyOptionToOrder() | 옵션 선택 결과를 주문 항목에 반영, 금액 재계산 |
| ItemMgr | GetItemOptions() | 품목별 옵션 그룹/옵션 목록 조회 |

### 5.5 Infrastructure

| 모듈 | 파일 | 책임 |
|---|---|---|
| Tables/Stock/OrderCrud | OrderCrud.h/cpp | 주문 항목 옵션 반영 |
| Tables/Item/ItemOptionCrud | TODO: 옵션 테이블 스키마 확정 필요 | 품목 옵션 조회 |
| RequestLedgerStore | RequestLedgerStore.h/cpp | 멱등성 기록 |

### 5.6 PosRealTime 이벤트

| 이벤트 | 발행 시점 | 수신 UI 처리 |
|---|---|---|
| KIOSK:OPTION_SELECTED | SelectKioskOptionUseCase 커밋 후 | 주문 목록/합계 갱신 (외부 변경만) |

### 5.7 Permission

| 대상 기능 | 권한 | 비고 |
|---|---|---|
| 옵션 선택 (KIOSK:SELECT_OPTION) | 고객 대면 (권한 없음) | 키오스크 고객 터치 UI에서 직접 조작 |

## 6. 테스트

| ID | 시나리오 | 검증 항목 |
|---|---|---|
| KO-T01 | 옵션 1개 그룹에서 선택 후 확인 | 금액 재계산 정확성, 주문 반영 |
| KO-T02 | 옵션 5개 그룹 모두 선택 후 확인 | 전체 옵션 반영, 금액 합산 정확성 |
| KO-T03 | 옵션 선택 후 초기화 | 모든 선택 해제, 금액 기본가 복원 |
| KO-T04 | 개별 그룹 선택 취소 | 해당 그룹만 해제, 금액 재계산 |
| KO-T05 | 가로 스크롤/페이지네이션 | 옵션 개수 초과 시 탐색 가능 확인 |
| KO-T06 | 터치 버튼 최소 크기 준수 | 옵션 버튼/선택완료 버튼 44x44px 이상 |
| KO-T07 | 동일 idempotencyKey 중복 요청 | 멱등성 보장 확인 |

## 7. 완료기준

- [ ] SelectKioskOptionUseCase 트랜잭션/멱등성 구현
- [ ] KioskMgr.ApplyOptionToOrder() 도메인 로직 구현
- [ ] shared/ui/organisms/KioskOptionModal 공용 컴포넌트 구현
- [ ] 데이터 기반 옵션 그룹 동적 렌더링 (최대 5개 그룹)
- [ ] CSS 기반 가로 스크롤 (`overflow-x: auto` 또는 Swiper) 구현
- [ ] 금액 실시간 재계산 (기본가 + 옵션 추가금) 구현
- [ ] 터치 최소 크기 44x44px 보장
- [ ] 선택 완료 버튼 큰 터치 영역 유지 (357x37 DLU 상당)

## 8. 작업명단

| 계층 | 파일 경로 |
|------|-----------|
| shared/ui | BrandPosApp/PosUi/src/shared/ui/organisms/KioskOptionModal.tsx |
| shared/hooks | BrandPosApp/PosUi/src/shared/hooks/useKioskOption.ts |
| RTK Query | BrandPosApp/PosUi/src/store/api/kioskApi.ts |
| Bridge Command | BrandPosApp/PosUi/src/bridge/commands/kioskCommands.ts |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Kiosk/KioskActions.cpp |
| PosRequestActions | BrandPosApp/Presentation/CEF/InternalBridge/PosRequestActions/Kiosk/KioskActions.h |
| UseCase | BrandPosApp/UseCases/Kiosk/SelectKioskOptionUseCase.cpp |
| UseCase | BrandPosApp/UseCases/Kiosk/SelectKioskOptionUseCase.h |
| Domain | BrandPosApp/Domain/Kiosk/KioskMgr.cpp |
| Domain | BrandPosApp/Domain/Kiosk/KioskMgr.h |
| Domain | BrandPosApp/Domain/Item/ItemMgr.cpp |
| Domain | BrandPosApp/Domain/Item/ItemMgr.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/OrderCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Stock/OrderCrud.h |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemOptionCrud.cpp |
| Infrastructure | BrandPosApp/Infrastructure/Persistence/SQLite/Tables/Item/ItemOptionCrud.h |

---

## Appendix: 레거시 참조

### 레거시 다이얼로그 정보

| 항목 | 값 |
|------|---|
| 다이얼로그 ID | IDD_KIO_OPTITEM |
| 리소스 값 | 297 |
| 크기 (DLU) | 400 x 384 |
| 다이얼로그 타입 | DIALOGEX |
| 스타일 | DS_SETFONT \| WS_POPUP |
| 폰트 | 10, "System", 0, 0, 0x0 |
| 소스 파일 | Restaurant.rc |
| 총 UI 요소 수 | 24 (버튼 21, 텍스트/라벨 3) |

### 레거시 UI 요소 → 신규 매핑

| 레거시 ID | 레거시 용도 | 신규 대응 |
|---|---|---|
| IDC_BTN_SELECT | 선택완료 버튼 (357x37 DLU) | KioskOptionModal > 선택완료 버튼 |
| IDCANCEL | 닫기 버튼 | 모달 닫기 |
| IDOK | 확인 (숨김) | 제거 |
| IDC_BTN_LEFT1~5, IDC_BTN_RIGHT1~5 | 옵션 그룹별 좌/우 스크롤 (10개, 숨김) | CSS 가로 스크롤/Swiper로 대체 |
| IDC_BTN_SELCAN1~5 | 옵션 그룹별 선택 취소 (5개, 숨김) | 그룹별 선택 해제 버튼 (데이터 기반 동적) |
| IDC_BTN_NEXTPAGE, IDC_BTN_PREVPAGE | 페이지네이션 (숨김) | 가로 스크롤/가상화로 대체 (조건부) |
| IDC_BTN_INIT | 선택 초기화 (숨김, 비활성) | 조건부 렌더링 초기화 버튼 |
| IDC_STA_ITEMNAME | 상품명 표시 | 상품명 텍스트 |
| IDC_STA_ORDERAMT | 주문 금액 표시 (오른쪽 정렬) | 금액 표시 (기본가 + 옵션가 실시간 계산) |
| IDC_FRM_MENU1 | 옵션 메뉴 컨테이너 (숨김) | 데이터 기반 옵션 그룹 동적 렌더링 |
