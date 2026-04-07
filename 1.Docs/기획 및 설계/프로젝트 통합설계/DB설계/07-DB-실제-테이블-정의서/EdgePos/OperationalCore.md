# EdgePos Operational Core
# EdgePos Operational Core / Lõi vận hành EdgePos

> 이 문서는 매장 Edge POS의 실제 로컬 DB 테이블 정의서다.
> Edge는 SQLite를 사용하며, 오프라인 원본, 주문/결제/테이블, 장치, 동기화, 복구를 담당한다.
> Tài liệu này định nghĩa bảng DB cục bộ thực tế cho Edge POS tại cửa hàng.
> Edge dùng SQLite và chịu trách nhiệm nguồn gốc offline, order/payment/table, device, đồng bộ và phục hồi.

---

## 1. Korean

### 1.1 EdgePosTerminal

| 항목 | 값 |
|---|---|
| 테이블명 | `EdgePosTerminal` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp`, `BrandHQPortal`(동기화 후 조회) |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream / Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 단말 식별자 |
| `BranchId` | `TEXT` | No | - | 소속 지점 |
| `TerminalCode` | `TEXT` | No | - | 단말 코드 |
| `TerminalName` | `TEXT` | No | - | 단말명 |
| `TerminalRole` | `TEXT` | No | `'Main'` | 단말 역할 |
| `AppVersion` | `TEXT` | No | - | 앱 버전 |
| `DbVersion` | `TEXT` | No | - | DB 버전 |
| `Status` | `TEXT` | No | `'Active'` | 상태 |
| `LastSyncAt` | `TEXT` | Yes | `null` | 마지막 동기화 시각 |
| `LastHeartbeatAt` | `TEXT` | Yes | `null` | 마지막 heartbeat |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `TerminalCode`

#### 인덱스

- `idx_terminal_branch_status` on `(BranchId, Status)`

#### 사용 시나리오

- Edge 단말 식별
- 버전/헬스 상태 관리
- 동기화 기준점

### 1.2 Device

| 항목 | 값 |
|---|---|
| 테이블명 | `Device` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream / Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 장치 식별자 |
| `EdgePosId` | `TEXT` | No | - | 소속 Edge 단말 |
| `DeviceCode` | `TEXT` | No | - | 장치 코드 |
| `DeviceType` | `TEXT` | No | - | 장치 유형 |
| `VendorName` | `TEXT` | Yes | `null` | 제조사 |
| `ModelName` | `TEXT` | Yes | `null` | 모델명 |
| `ConnectionType` | `TEXT` | No | - | 연결 방식 |
| `PortName` | `TEXT` | Yes | `null` | 포트명 |
| `ConfigJson` | `TEXT` | No | `'{}'` | 설정 값 |
| `Status` | `TEXT` | No | `'Inactive'` | 상태 |
| `LastCheckedAt` | `TEXT` | Yes | `null` | 마지막 점검 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(EdgePosId, DeviceCode)`

#### 인덱스

- `idx_device_edge_type` on `(EdgePosId, DeviceType, Status)`

#### 사용 시나리오

- 프린터/카드단말기/스캐너/저울 관리
- 장치 연결 상태 관리

### 1.3 DeviceBinding

| 항목 | 값 |
|---|---|
| 테이블명 | `DeviceBinding` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Local-only / Upstream snapshot |
| 보존 정책 | 이력 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 바인딩 식별자 |
| `EdgePosId` | `TEXT` | No | - | 소속 Edge 단말 |
| `DeviceId` | `TEXT` | No | - | 장치 |
| `BindingRole` | `TEXT` | No | - | 출력/결제/스캐너 등 역할 |
| `BindingOrder` | `INTEGER` | No | `0` | 우선순위 |
| `IsPrimary` | `INTEGER` | No | `0` | 주 장치 여부 |
| `BoundAt` | `TEXT` | No | - | 연결 시각 |
| `UnboundAt` | `TEXT` | Yes | `null` | 해제 시각 |
| `Status` | `TEXT` | No | `'Active'` | 상태 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `DeviceId -> Device.Id`

#### 인덱스

- `idx_device_binding_edge_role` on `(EdgePosId, BindingRole, Status)`

#### 사용 시나리오

- 프린터/결제단말/스캐너 바인딩
- 장치 교체/재배치 이력

### 1.4 LocalSetting

| 항목 | 값 |
|---|---|
| 테이블명 | `LocalSetting` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Local-only / 일부 Upstream |
| 보존 정책 | 버전 이력 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 설정 식별자 |
| `EdgePosId` | `TEXT` | No | - | 소속 Edge 단말 |
| `SettingKey` | `TEXT` | No | - | 설정 키 |
| `SettingValue` | `TEXT` | No | - | 설정 값 |
| `ValueType` | `TEXT` | No | - | 값 타입 |
| `ScopeType` | `TEXT` | No | - | `Terminal`, `Branch`, `Device` |
| `ScopeId` | `TEXT` | Yes | `null` | 범위 식별자 |
| `Version` | `INTEGER` | No | `1` | 버전 |
| `UpdatedSource` | `TEXT` | No | `'Local'` | 수정 출처 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(EdgePosId, SettingKey, ScopeType, ScopeId, Version)`

#### 인덱스

- `idx_local_setting_edge_key` on `(EdgePosId, SettingKey, ScopeType)`

#### 사용 시나리오

- 로컬 프린터/장치/결제 설정
- 설치 모드와 유지보수 모드 설정

### 1.5 MenuCategorySnapshot

| 항목 | 값 |
|---|---|
| 테이블명 | `MenuCategorySnapshot` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | BrandHQ Central |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Downstream |
| 보존 정책 | 스냅샷 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 스냅샷 식별자 |
| `BrandHQId` | `TEXT` | No | - | 브랜드 본사 |
| `CategoryCode` | `TEXT` | No | - | 카테고리 코드 |
| `CategoryName` | `TEXT` | No | - | 카테고리명 |
| `ParentCategoryCode` | `TEXT` | Yes | `null` | 상위 코드 |
| `DisplayOrder` | `INTEGER` | No | `0` | 표시 순서 |
| `IsActive` | `INTEGER` | No | `1` | 사용 가능 여부 |
| `SnapshotVersion` | `INTEGER` | No | `1` | 스냅샷 버전 |
| `SyncedAt` | `TEXT` | No | - | 동기화 시각 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, CategoryCode, SnapshotVersion)`

#### 인덱스

- `idx_menu_category_snapshot` on `(BrandHQId, ParentCategoryCode, DisplayOrder)`

#### 사용 시나리오

- Edge 메뉴 렌더링
- 카테고리 트리 구성

### 1.6 MenuItemSnapshot

| 항목 | 값 |
|---|---|
| 테이블명 | `MenuItemSnapshot` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | BrandHQ Central |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Downstream |
| 보존 정책 | 스냅샷 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 스냅샷 식별자 |
| `BrandHQId` | `TEXT` | No | - | 브랜드 본사 |
| `ItemCode` | `TEXT` | No | - | 아이템 코드 |
| `ItemName` | `TEXT` | No | - | 아이템명 |
| `CategoryCode` | `TEXT` | No | - | 카테고리 코드 |
| `BasePrice` | `NUMERIC` | No | `0` | 기본 가격 |
| `TaxRate` | `NUMERIC` | No | `0` | 세율 |
| `UnitType` | `TEXT` | No | `'EA'` | 단위 |
| `DisplayOrder` | `INTEGER` | No | `0` | 표시 순서 |
| `SoldOutFlag` | `INTEGER` | No | `0` | 품절 여부 |
| `SearchKeywords` | `TEXT` | Yes | `null` | 검색 키워드 |
| `SnapshotVersion` | `INTEGER` | No | `1` | 스냅샷 버전 |
| `SyncedAt` | `TEXT` | No | - | 동기화 시각 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, ItemCode, SnapshotVersion)`

#### 인덱스

- `idx_menu_item_snapshot` on `(BrandHQId, CategoryCode, DisplayOrder)`

#### 사용 시나리오

- Edge 주문 화면
- 품절/가격 반영

### 1.7 PriceSnapshot

| 항목 | 값 |
|---|---|
| 테이블명 | `PriceSnapshot` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | BrandHQ Central |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Downstream |
| 보존 정책 | 스냅샷 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 스냅샷 식별자 |
| `BrandHQId` | `TEXT` | No | - | 브랜드 본사 |
| `PolicyCode` | `TEXT` | No | - | 정책 코드 |
| `ItemCode` | `TEXT` | No | - | 아이템 코드 |
| `Price` | `NUMERIC` | No | `0` | 가격 |
| `CurrencyCode` | `TEXT` | No | - | 통화 |
| `EffectiveFrom` | `TEXT` | No | - | 시작 시각 |
| `EffectiveTo` | `TEXT` | Yes | `null` | 종료 시각 |
| `SnapshotVersion` | `INTEGER` | No | `1` | 버전 |
| `SyncedAt` | `TEXT` | No | - | 동기화 시각 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, PolicyCode, ItemCode, SnapshotVersion)`

#### 인덱스

- `idx_price_snapshot` on `(BrandHQId, ItemCode, EffectiveFrom DESC)`

#### 사용 시나리오

- Edge 가격 계산
- 시간대별 가격 적용

### 1.8 PromotionSnapshot

| 항목 | 값 |
|---|---|
| 테이블명 | `PromotionSnapshot` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | BrandHQ Central |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Downstream |
| 보존 정책 | 스냅샷 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 스냅샷 식별자 |
| `BrandHQId` | `TEXT` | No | - | 브랜드 본사 |
| `PromotionCode` | `TEXT` | No | - | 프로모션 코드 |
| `PromotionName` | `TEXT` | No | - | 프로모션명 |
| `PromotionType` | `TEXT` | No | - | 타입 |
| `RuleJson` | `TEXT` | No | `'{}'` | 적용 규칙 |
| `StartAt` | `TEXT` | No | - | 시작 시각 |
| `EndAt` | `TEXT` | Yes | `null` | 종료 시각 |
| `SnapshotVersion` | `INTEGER` | No | `1` | 버전 |
| `SyncedAt` | `TEXT` | No | - | 동기화 시각 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, PromotionCode, SnapshotVersion)`

#### 인덱스

- `idx_promotion_snapshot` on `(BrandHQId, PromotionType, StartAt DESC)`

#### 사용 시나리오

- Edge 프로모션 판정
- 기간/조건별 할인

### 1.9 Customer

| 항목 | 값 |
|---|---|
| 테이블명 | `Customer` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge + Sync target |
| 읽는 주체 | `BrandPosApp`, `BrandHQPortal`(동기화 후) |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 고객 식별자 |
| `CustomerCode` | `TEXT` | Yes | `null` | 고객 코드 |
| `CustomerName` | `TEXT` | No | - | 고객명 |
| `PhoneNumber` | `TEXT` | Yes | `null` | 전화번호 |
| `Email` | `TEXT` | Yes | `null` | 이메일 |
| `Birthday` | `TEXT` | Yes | `null` | 생년월일 |
| `Gender` | `TEXT` | Yes | `null` | 성별 |
| `TierCode` | `TEXT` | Yes | `null` | 등급 코드 |
| `PointBalance` | `INTEGER` | No | `0` | 포인트 |
| `Memo` | `TEXT` | Yes | `null` | 메모 |
| `IsActive` | `INTEGER` | No | `1` | 사용 여부 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `CustomerCode`

#### 인덱스

- `idx_customer_phone` on `(PhoneNumber, CustomerName)`

#### 사용 시나리오

- 고객 조회/적립/정산
- 주문자 식별

### 1.10 Table

| 항목 | 값 |
|---|---|
| 테이블명 | `Table` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream / Downstream snapshot |
| 보존 정책 | 영구 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 테이블 식별자 |
| `BranchId` | `TEXT` | No | - | 지점 |
| `TableCode` | `TEXT` | No | - | 테이블 코드 |
| `TableName` | `TEXT` | No | - | 테이블명 |
| `FloorNo` | `INTEGER` | No | `0` | 층 번호 |
| `SortOrder` | `INTEGER` | No | `0` | 정렬 순서 |
| `TableType` | `TEXT` | No | `'Normal'` | 유형 |
| `SeatCount` | `INTEGER` | No | `0` | 좌석 수 |
| `Status` | `TEXT` | No | `'Empty'` | 상태 |
| `IsActive` | `INTEGER` | No | `1` | 사용 가능 여부 |
| `Memo` | `TEXT` | Yes | `null` | 메모 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BranchId, TableCode)`

#### 인덱스

- `idx_table_branch_status` on `(BranchId, FloorNo, Status, SortOrder)`

#### 사용 시나리오

- 매장 테이블 운영
- 테이블 상태/합석/이동

### 1.11 TableStatusHistory

| 항목 | 값 |
|---|---|
| 테이블명 | `TableStatusHistory` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp`, Sync downstream |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Hard delete 금지 |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 이력 식별자 |
| `TableId` | `TEXT` | No | - | 테이블 |
| `BeforeStatus` | `TEXT` | No | - | 변경 전 상태 |
| `AfterStatus` | `TEXT` | No | - | 변경 후 상태 |
| `ReasonCode` | `TEXT` | Yes | `null` | 사유 코드 |
| `ReasonMemo` | `TEXT` | Yes | `null` | 사유 메모 |
| `OrderSlipId` | `TEXT` | Yes | `null` | 관련 주문 |
| `ChangedByUserId` | `TEXT` | Yes | `null` | 변경자 |
| `ChangedAt` | `TEXT` | No | - | 변경 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `TableId -> Table.Id`

#### 인덱스

- `idx_table_history_table` on `(TableId, ChangedAt DESC)`

#### 사용 시나리오

- 테이블 상태 추적
- 운영 감사/장애 분석

### 1.12 OrderSlip

| 항목 | 값 |
|---|---|
| 테이블명 | `OrderSlip` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp`, `BrandHQPortal`(동기화 후) |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 주문 식별자 |
| `OrderNo` | `TEXT` | No | - | 주문 번호 |
| `BranchId` | `TEXT` | No | - | 지점 |
| `EdgePosId` | `TEXT` | No | - | Edge 단말 |
| `TableId` | `TEXT` | Yes | `null` | 테이블 |
| `OrderType` | `TEXT` | No | - | 주문 유형 |
| `OrderStatus` | `TEXT` | No | `'Open'` | 주문 상태 |
| `GuestCount` | `INTEGER` | No | `0` | 인원 수 |
| `GrossAmount` | `NUMERIC` | No | `0` | 총액 |
| `DiscountAmount` | `NUMERIC` | No | `0` | 할인액 |
| `TaxAmount` | `NUMERIC` | No | `0` | 세금 |
| `ServiceChargeAmount` | `NUMERIC` | No | `0` | 봉사료 |
| `NetAmount` | `NUMERIC` | No | `0` | 순액 |
| `OpenedAt` | `TEXT` | No | - | 주문 시작 |
| `ClosedAt` | `TEXT` | Yes | `null` | 주문 종료 |
| `OperatorId` | `TEXT` | Yes | `null` | 오퍼레이터 |
| `SyncState` | `TEXT` | No | `'Pending'` | 동기 상태 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `OrderNo`
- Foreign Key: `TableId -> Table.Id`

#### 인덱스

- `idx_order_branch_status` on `(BranchId, OrderStatus, OpenedAt DESC)`
- `idx_order_table` on `(TableId, OrderStatus)`

#### 사용 시나리오

- 주문 생성/수정/마감
- 결제/동기화 기준 엔티티

### 1.13 OrderItem

| 항목 | 값 |
|---|---|
| 테이블명 | `OrderItem` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 주문 항목 식별자 |
| `OrderSlipId` | `TEXT` | No | - | 주문 |
| `ItemCode` | `TEXT` | No | - | 아이템 코드 |
| `ItemName` | `TEXT` | No | - | 아이템명 |
| `Qty` | `NUMERIC` | No | `1` | 수량 |
| `UnitPrice` | `NUMERIC` | No | `0` | 단가 |
| `Amount` | `NUMERIC` | No | `0` | 금액 |
| `DiscountAmount` | `NUMERIC` | No | `0` | 할인액 |
| `TaxAmount` | `NUMERIC` | No | `0` | 세금 |
| `CookingMemo` | `TEXT` | Yes | `null` | 주방 메모 |
| `ParentItemId` | `TEXT` | Yes | `null` | 부모 항목 |
| `ItemStatus` | `TEXT` | No | `'Normal'` | 상태 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### 인덱스

- `idx_order_item_order` on `(OrderSlipId, ItemCode)`

#### 사용 시나리오

- 주문 상세
- 수량/가격/할인 계산

### 1.14 PaymentSlip

| 항목 | 값 |
|---|---|
| 테이블명 | `PaymentSlip` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp`, sync worker |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 결제 식별자 |
| `PaymentNo` | `TEXT` | No | - | 결제 번호 |
| `OrderSlipId` | `TEXT` | No | - | 주문 |
| `PaymentMethod` | `TEXT` | No | - | 결제수단 |
| `PaymentStatus` | `TEXT` | No | `'Pending'` | 상태 |
| `RequestedAmount` | `NUMERIC` | No | `0` | 요청 금액 |
| `ApprovedAmount` | `NUMERIC` | No | `0` | 승인 금액 |
| `ChangeAmount` | `NUMERIC` | No | `0` | 거스름돈 |
| `PaidAt` | `TEXT` | Yes | `null` | 결제 시각 |
| `GatewayTxnId` | `TEXT` | Yes | `null` | 외부 거래 ID |
| `OperatorId` | `TEXT` | Yes | `null` | 오퍼레이터 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |
| `DeletedAt` | `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `PaymentNo`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### 인덱스

- `idx_payment_order_status` on `(OrderSlipId, PaymentStatus, PaidAt DESC)`

#### 사용 시나리오

- 현금/카드/QR 결제 기록
- 승인/실패/취소 추적

### 1.15 Receipt

| 항목 | 값 |
|---|---|
| 테이블명 | `Receipt` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Local-only |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 영수증 식별자 |
| `OrderSlipId` | `TEXT` | No | - | 주문 |
| `ReceiptNo` | `TEXT` | No | - | 영수증 번호 |
| `PrintedAt` | `TEXT` | No | - | 출력 시각 |
| `PrintType` | `TEXT` | No | - | 출력 유형 |
| `PrinterName` | `TEXT` | Yes | `null` | 프린터명 |
| `CopyNo` | `INTEGER` | No | `1` | 복사본 번호 |
| `PayloadHash` | `TEXT` | No | - | 출력 페이로드 해시 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `ReceiptNo`

#### 인덱스

- `idx_receipt_order` on `(OrderSlipId, PrintedAt DESC)`

#### 사용 시나리오

- 결제 후 영수증 출력 기록
- 재출력 추적

### 1.16 WaitPayment

| 항목 | 값 |
|---|---|
| 테이블명 | `WaitPayment` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream snapshot |
| 보존 정책 | 중간 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 대기 결제 식별자 |
| `OrderSlipId` | `TEXT` | No | - | 주문 |
| `PaymentMethod` | `TEXT` | No | - | 결제수단 |
| `RequestedAmount` | `NUMERIC` | No | `0` | 요청 금액 |
| `WaitingState` | `TEXT` | No | `'Waiting'` | 대기 상태 |
| `RequestedAt` | `TEXT` | No | - | 요청 시각 |
| `ExpiresAt` | `TEXT` | Yes | `null` | 만료 시각 |
| `GatewayRefNo` | `TEXT` | Yes | `null` | 외부 참조번호 |
| `ResponsePayloadJson` | `TEXT` | Yes | `null` | 응답 데이터 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### 인덱스

- `idx_wait_payment_state` on `(WaitingState, ExpiresAt)`

#### 사용 시나리오

- 승인 대기 중 결제 상태 보관
- 외부 게이트웨이 재시도 전 상태

### 1.17 Outbox

| 항목 | 값 |
|---|---|
| 테이블명 | `Outbox` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `SyncWorkers`, `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream |
| 보존 정책 | 처리 완료 후 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | outbox 식별자 |
| `AggregateType` | `TEXT` | No | - | 집계 루트 유형 |
| `AggregateId` | `TEXT` | No | - | 집계 식별자 |
| `EventType` | `TEXT` | No | - | 이벤트 타입 |
| `PayloadJson` | `TEXT` | No | `'{}'` | 이벤트 payload |
| `TargetScope` | `TEXT` | No | - | 대상 범위 |
| `RetryCount` | `INTEGER` | No | `0` | 재시도 횟수 |
| `NextRetryAt` | `TEXT` | Yes | `null` | 다음 재시도 시각 |
| `Status` | `TEXT` | No | `'Pending'` | 상태 |
| `LastErrorMessage` | `TEXT` | Yes | `null` | 마지막 오류 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`

#### 인덱스

- `idx_outbox_status_next_retry` on `(Status, NextRetryAt)`
- `idx_outbox_aggregate` on `(AggregateType, AggregateId)`

#### 사용 시나리오

- 중앙 동기화 큐
- 재시도/유실 복구

### 1.18 SyncCursor

| 항목 | 값 |
|---|---|
| 테이블명 | `SyncCursor` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp`, `SyncWorkers` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Upstream / Downstream |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 커서 식별자 |
| `StreamName` | `TEXT` | No | - | 스트림명 |
| `LastCursor` | `TEXT` | Yes | `null` | 마지막 커서 |
| `LastEventId` | `TEXT` | Yes | `null` | 마지막 이벤트 ID |
| `LastSyncedAt` | `TEXT` | Yes | `null` | 마지막 동기화 시각 |
| `Checksum` | `TEXT` | Yes | `null` | 무결성 체크섬 |
| `Version` | `INTEGER` | No | `1` | 버전 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `StreamName`

#### 인덱스

- `idx_sync_cursor_stream` on `(StreamName, Version)`

#### 사용 시나리오

- 증분 동기화 위치 추적
- 재개 가능한 sync

### 1.19 RecoveryState

| 항목 | 값 |
|---|---|
| 테이블명 | `RecoveryState` |
| 소유 주체 | `BrandPosApp` |
| 저장 위치 | Edge SQLite |
| 원본 | Edge |
| 읽는 주체 | `BrandPosApp` |
| 쓰는 주체 | `BrandPosApp` |
| 동기화 방향 | Local-only |
| 보존 정책 | 짧은 TTL |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | 복구 상태 식별자 |
| `SessionId` | `TEXT` | No | - | 세션 ID |
| `ScreenName` | `TEXT` | No | - | 화면명 |
| `RequestId` | `TEXT` | Yes | `null` | 요청 ID |
| `OperatorId` | `TEXT` | Yes | `null` | 오퍼레이터 |
| `PendingAction` | `TEXT` | No | - | 보류 작업 |
| `SnapshotJson` | `TEXT` | No | `'{}'` | 복구 스냅샷 |
| `ExpiresAt` | `TEXT` | No | - | 만료 시각 |
| `RestoredAt` | `TEXT` | Yes | `null` | 복구 시각 |
| `State` | `TEXT` | No | `'Pending'` | 상태 |
| `CreatedAt` | `TEXT` | No | - | 생성 시각 |
| `UpdatedAt` | `TEXT` | No | - | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `SessionId`

#### 인덱스

- `idx_recovery_state_expires` on `(State, ExpiresAt)`

#### 사용 시나리오

- CEF/브라우저 crash 후 복구
- 진행 중 주문/결제 화면 재수화

---

## 2. Tiếng Việt

### 2.1 EdgePosTerminal

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `EdgePosTerminal` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp`, `BrandHQPortal` (sau sync) |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream / Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh terminal |
| `BranchId` | `TEXT` | No | - | Chi nhánh |
| `TerminalCode` | `TEXT` | No | - | Mã terminal |
| `TerminalName` | `TEXT` | No | - | Tên terminal |
| `TerminalRole` | `TEXT` | No | `'Main'` | Vai trò |
| `AppVersion` | `TEXT` | No | - | Phiên bản app |
| `DbVersion` | `TEXT` | No | - | Phiên bản DB |
| `Status` | `TEXT` | No | `'Active'` | Trạng thái |
| `LastSyncAt` | `TEXT` | Yes | `null` | Lần sync gần nhất |
| `LastHeartbeatAt` | `TEXT` | Yes | `null` | Heartbeat gần nhất |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `TerminalCode`

#### Index

- `idx_terminal_branch_status` on `(BranchId, Status)`

#### Kịch bản sử dụng

- Xác định terminal Edge
- Quản lý version/health
- Điểm neo sync

### 2.2 Device

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Device` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream / Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh thiết bị |
| `EdgePosId` | `TEXT` | No | - | Terminal sở hữu |
| `DeviceCode` | `TEXT` | No | - | Mã thiết bị |
| `DeviceType` | `TEXT` | No | - | Loại thiết bị |
| `VendorName` | `TEXT` | Yes | `null` | Nhà cung cấp |
| `ModelName` | `TEXT` | Yes | `null` | Model |
| `ConnectionType` | `TEXT` | No | - | Kiểu kết nối |
| `PortName` | `TEXT` | Yes | `null` | Tên cổng |
| `ConfigJson` | `TEXT` | No | `'{}'` | Cấu hình |
| `Status` | `TEXT` | No | `'Inactive'` | Trạng thái |
| `LastCheckedAt` | `TEXT` | Yes | `null` | Lần kiểm tra gần nhất |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(EdgePosId, DeviceCode)`

#### Index

- `idx_device_edge_type` on `(EdgePosId, DeviceType, Status)`

#### Kịch bản sử dụng

- Quản lý máy in/card reader/scanner/cân
- Quản lý trạng thái thiết bị

### 2.3 DeviceBinding

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DeviceBinding` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Local-only / Upstream snapshot |
| Chính sách lưu giữ | Lưu lịch sử |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh binding |
| `EdgePosId` | `TEXT` | No | - | Terminal |
| `DeviceId` | `TEXT` | No | - | Thiết bị |
| `BindingRole` | `TEXT` | No | - | Vai trò binding |
| `BindingOrder` | `INTEGER` | No | `0` | Thứ tự ưu tiên |
| `IsPrimary` | `INTEGER` | No | `0` | Thiết bị chính |
| `BoundAt` | `TEXT` | No | - | Thời điểm gắn |
| `UnboundAt` | `TEXT` | Yes | `null` | Thời điểm gỡ |
| `Status` | `TEXT` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `DeviceId -> Device.Id`

#### Index

- `idx_device_binding_edge_role` on `(EdgePosId, BindingRole, Status)`

#### Kịch bản sử dụng

- Gắn máy in/card reader/scanner
- Ghi lịch sử thay thiết bị

### 2.4 LocalSetting

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `LocalSetting` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Local-only / một phần Upstream |
| Chính sách lưu giữ | Lưu theo version |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh setting |
| `EdgePosId` | `TEXT` | No | - | Terminal |
| `SettingKey` | `TEXT` | No | - | Khóa setting |
| `SettingValue` | `TEXT` | No | - | Giá trị setting |
| `ValueType` | `TEXT` | No | - | Kiểu giá trị |
| `ScopeType` | `TEXT` | No | - | `Terminal`, `Branch`, `Device` |
| `ScopeId` | `TEXT` | Yes | `null` | Định danh phạm vi |
| `Version` | `INTEGER` | No | `1` | Phiên bản |
| `UpdatedSource` | `TEXT` | No | `'Local'` | Nguồn cập nhật |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(EdgePosId, SettingKey, ScopeType, ScopeId, Version)`

#### Index

- `idx_local_setting_edge_key` on `(EdgePosId, SettingKey, ScopeType)`

#### Kịch bản sử dụng

- Cấu hình máy in/thiết bị/thanh toán cục bộ
- Cấu hình chế độ setup/maintenance

### 2.5 MenuCategorySnapshot

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `MenuCategorySnapshot` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | BrandHQ Central |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu snapshot |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh snapshot |
| `BrandHQId` | `TEXT` | No | - | Brand HQ |
| `CategoryCode` | `TEXT` | No | - | Mã category |
| `CategoryName` | `TEXT` | No | - | Tên category |
| `ParentCategoryCode` | `TEXT` | Yes | `null` | Mã category cha |
| `DisplayOrder` | `INTEGER` | No | `0` | Thứ tự hiển thị |
| `IsActive` | `INTEGER` | No | `1` | Có sử dụng không |
| `SnapshotVersion` | `INTEGER` | No | `1` | Phiên bản snapshot |
| `SyncedAt` | `TEXT` | No | - | Thời điểm sync |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, CategoryCode, SnapshotVersion)`

#### Index

- `idx_menu_category_snapshot` on `(BrandHQId, ParentCategoryCode, DisplayOrder)`

#### Kịch bản sử dụng

- Hiển thị cây menu Edge
- Cấu trúc category

### 2.6 MenuItemSnapshot

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `MenuItemSnapshot` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | BrandHQ Central |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu snapshot |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh snapshot |
| `BrandHQId` | `TEXT` | No | - | Brand HQ |
| `ItemCode` | `TEXT` | No | - | Mã item |
| `ItemName` | `TEXT` | No | - | Tên item |
| `CategoryCode` | `TEXT` | No | - | Mã category |
| `BasePrice` | `NUMERIC` | No | `0` | Giá cơ bản |
| `TaxRate` | `NUMERIC` | No | `0` | Thuế suất |
| `UnitType` | `TEXT` | No | `'EA'` | Đơn vị |
| `DisplayOrder` | `INTEGER` | No | `0` | Thứ tự hiển thị |
| `SoldOutFlag` | `INTEGER` | No | `0` | Hết hàng không |
| `SearchKeywords` | `TEXT` | Yes | `null` | Từ khóa tìm kiếm |
| `SnapshotVersion` | `INTEGER` | No | `1` | Phiên bản snapshot |
| `SyncedAt` | `TEXT` | No | - | Thời điểm sync |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, ItemCode, SnapshotVersion)`

#### Index

- `idx_menu_item_snapshot` on `(BrandHQId, CategoryCode, DisplayOrder)`

#### Kịch bản sử dụng

- Màn hình order Edge
- Đồng bộ giá/trạng thái bán

### 2.7 PriceSnapshot

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PriceSnapshot` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | BrandHQ Central |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu snapshot |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh snapshot |
| `BrandHQId` | `TEXT` | No | - | Brand HQ |
| `PolicyCode` | `TEXT` | No | - | Mã policy |
| `ItemCode` | `TEXT` | No | - | Mã item |
| `Price` | `NUMERIC` | No | `0` | Giá |
| `CurrencyCode` | `TEXT` | No | - | Tiền tệ |
| `EffectiveFrom` | `TEXT` | No | - | Bắt đầu |
| `EffectiveTo` | `TEXT` | Yes | `null` | Kết thúc |
| `SnapshotVersion` | `INTEGER` | No | `1` | Phiên bản |
| `SyncedAt` | `TEXT` | No | - | Thời điểm sync |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, PolicyCode, ItemCode, SnapshotVersion)`

#### Index

- `idx_price_snapshot` on `(BrandHQId, ItemCode, EffectiveFrom DESC)`

#### Kịch bản sử dụng

- Tính giá Edge
- Áp dụng giá theo thời điểm

### 2.8 PromotionSnapshot

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PromotionSnapshot` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | BrandHQ Central |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu snapshot |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh snapshot |
| `BrandHQId` | `TEXT` | No | - | Brand HQ |
| `PromotionCode` | `TEXT` | No | - | Mã promotion |
| `PromotionName` | `TEXT` | No | - | Tên promotion |
| `PromotionType` | `TEXT` | No | - | Loại |
| `RuleJson` | `TEXT` | No | `'{}'` | Rule |
| `StartAt` | `TEXT` | No | - | Bắt đầu |
| `EndAt` | `TEXT` | Yes | `null` | Kết thúc |
| `SnapshotVersion` | `INTEGER` | No | `1` | Phiên bản |
| `SyncedAt` | `TEXT` | No | - | Thời điểm sync |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, PromotionCode, SnapshotVersion)`

#### Index

- `idx_promotion_snapshot` on `(BrandHQId, PromotionType, StartAt DESC)`

#### Kịch bản sử dụng

- Áp dụng promotion tại Edge
- Rule theo thời gian

### 2.9 Customer

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Customer` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge + Sync target |
| Bên đọc | `BrandPosApp`, `BrandHQPortal` (sau sync) |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh khách hàng |
| `CustomerCode` | `TEXT` | Yes | `null` | Mã khách hàng |
| `CustomerName` | `TEXT` | No | - | Tên khách hàng |
| `PhoneNumber` | `TEXT` | Yes | `null` | Số điện thoại |
| `Email` | `TEXT` | Yes | `null` | Email |
| `Birthday` | `TEXT` | Yes | `null` | Ngày sinh |
| `Gender` | `TEXT` | Yes | `null` | Giới tính |
| `TierCode` | `TEXT` | Yes | `null` | Mã hạng |
| `PointBalance` | `INTEGER` | No | `0` | Điểm |
| `Memo` | `TEXT` | Yes | `null` | Ghi chú |
| `IsActive` | `INTEGER` | No | `1` | Có sử dụng không |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `CustomerCode`

#### Index

- `idx_customer_phone` on `(PhoneNumber, CustomerName)`

#### Kịch bản sử dụng

- Tra cứu khách hàng
- Tích điểm / định danh chủ order

### 2.10 Table

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Table` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream / Downstream snapshot |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh bàn |
| `BranchId` | `TEXT` | No | - | Chi nhánh |
| `TableCode` | `TEXT` | No | - | Mã bàn |
| `TableName` | `TEXT` | No | - | Tên bàn |
| `FloorNo` | `INTEGER` | No | `0` | Tầng |
| `SortOrder` | `INTEGER` | No | `0` | Thứ tự |
| `TableType` | `TEXT` | No | `'Normal'` | Loại bàn |
| `SeatCount` | `INTEGER` | No | `0` | Số ghế |
| `Status` | `TEXT` | No | `'Empty'` | Trạng thái |
| `IsActive` | `INTEGER` | No | `1` | Có sử dụng không |
| `Memo` | `TEXT` | Yes | `null` | Ghi chú |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BranchId, TableCode)`

#### Index

- `idx_table_branch_status` on `(BranchId, FloorNo, Status, SortOrder)`

#### Kịch bản sử dụng

- Vận hành bàn
- Chuyển bàn / gộp bàn / đổi bàn

### 2.11 TableStatusHistory

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `TableStatusHistory` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Không cho phép hard delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh history |
| `TableId` | `TEXT` | No | - | Bàn |
| `BeforeStatus` | `TEXT` | No | - | Trạng thái trước |
| `AfterStatus` | `TEXT` | No | - | Trạng thái sau |
| `ReasonCode` | `TEXT` | Yes | `null` | Mã lý do |
| `ReasonMemo` | `TEXT` | Yes | `null` | Ghi chú lý do |
| `OrderSlipId` | `TEXT` | Yes | `null` | Đơn liên quan |
| `ChangedByUserId` | `TEXT` | Yes | `null` | Người đổi |
| `ChangedAt` | `TEXT` | No | - | Thời điểm đổi |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `TableId -> Table.Id`

#### Index

- `idx_table_history_table` on `(TableId, ChangedAt DESC)`

#### Kịch bản sử dụng

- Theo dõi thay đổi trạng thái bàn
- Audit vận hành

### 2.12 OrderSlip

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `OrderSlip` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp`, `BrandHQPortal` (sau sync) |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh đơn |
| `OrderNo` | `TEXT` | No | - | Số đơn |
| `BranchId` | `TEXT` | No | - | Chi nhánh |
| `EdgePosId` | `TEXT` | No | - | Terminal |
| `TableId` | `TEXT` | Yes | `null` | Bàn |
| `OrderType` | `TEXT` | No | - | Loại đơn |
| `OrderStatus` | `TEXT` | No | `'Open'` | Trạng thái |
| `GuestCount` | `INTEGER` | No | `0` | Số khách |
| `GrossAmount` | `NUMERIC` | No | `0` | Tổng tiền |
| `DiscountAmount` | `NUMERIC` | No | `0` | Giảm giá |
| `TaxAmount` | `NUMERIC` | No | `0` | Thuế |
| `ServiceChargeAmount` | `NUMERIC` | No | `0` | Phí dịch vụ |
| `NetAmount` | `NUMERIC` | No | `0` | Thành tiền |
| `OpenedAt` | `TEXT` | No | - | Thời điểm mở |
| `ClosedAt` | `TEXT` | Yes | `null` | Thời điểm đóng |
| `OperatorId` | `TEXT` | Yes | `null` | Người thao tác |
| `SyncState` | `TEXT` | No | `'Pending'` | Trạng thái sync |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `OrderNo`
- Foreign Key: `TableId -> Table.Id`

#### Index

- `idx_order_branch_status` on `(BranchId, OrderStatus, OpenedAt DESC)`
- `idx_order_table` on `(TableId, OrderStatus)`

#### Kịch bản sử dụng

- Tạo/sửa/đóng đơn
- Căn cứ cho thanh toán và sync

### 2.13 OrderItem

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `OrderItem` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh item của đơn |
| `OrderSlipId` | `TEXT` | No | - | Đơn |
| `ItemCode` | `TEXT` | No | - | Mã item |
| `ItemName` | `TEXT` | No | - | Tên item |
| `Qty` | `NUMERIC` | No | `1` | Số lượng |
| `UnitPrice` | `NUMERIC` | No | `0` | Đơn giá |
| `Amount` | `NUMERIC` | No | `0` | Thành tiền |
| `DiscountAmount` | `NUMERIC` | No | `0` | Giảm giá |
| `TaxAmount` | `NUMERIC` | No | `0` | Thuế |
| `CookingMemo` | `TEXT` | Yes | `null` | Ghi chú bếp |
| `ParentItemId` | `TEXT` | Yes | `null` | Item cha |
| `ItemStatus` | `TEXT` | No | `'Normal'` | Trạng thái |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### Index

- `idx_order_item_order` on `(OrderSlipId, ItemCode)`

#### Kịch bản sử dụng

- Chi tiết đơn hàng
- Tính số lượng/giá/giảm giá

### 2.14 PaymentSlip

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PaymentSlip` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp`, sync worker |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh thanh toán |
| `PaymentNo` | `TEXT` | No | - | Số thanh toán |
| `OrderSlipId` | `TEXT` | No | - | Đơn |
| `PaymentMethod` | `TEXT` | No | - | Phương thức |
| `PaymentStatus` | `TEXT` | No | `'Pending'` | Trạng thái |
| `RequestedAmount` | `NUMERIC` | No | `0` | Số tiền yêu cầu |
| `ApprovedAmount` | `NUMERIC` | No | `0` | Số tiền duyệt |
| `ChangeAmount` | `NUMERIC` | No | `0` | Tiền thối |
| `PaidAt` | `TEXT` | Yes | `null` | Thời điểm thanh toán |
| `GatewayTxnId` | `TEXT` | Yes | `null` | ID giao dịch ngoài |
| `OperatorId` | `TEXT` | Yes | `null` | Người thao tác |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |
| `DeletedAt` | `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `PaymentNo`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### Index

- `idx_payment_order_status` on `(OrderSlipId, PaymentStatus, PaidAt DESC)`

#### Kịch bản sử dụng

- Ghi nhận thanh toán tiền mặt/card/QR
- Theo dõi duyệt/huỷ/hoàn tiền

### 2.15 Receipt

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Receipt` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh receipt |
| `OrderSlipId` | `TEXT` | No | - | Đơn |
| `ReceiptNo` | `TEXT` | No | - | Số receipt |
| `PrintedAt` | `TEXT` | No | - | Thời điểm in |
| `PrintType` | `TEXT` | No | - | Loại in |
| `PrinterName` | `TEXT` | Yes | `null` | Tên máy in |
| `CopyNo` | `INTEGER` | No | `1` | Bản sao |
| `PayloadHash` | `TEXT` | No | - | Hash nội dung in |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `ReceiptNo`

#### Index

- `idx_receipt_order` on `(OrderSlipId, PrintedAt DESC)`

#### Kịch bản sử dụng

- Lưu lịch sử in hóa đơn
- Phục vụ in lại

### 2.16 WaitPayment

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `WaitPayment` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream snapshot |
| Chính sách lưu giữ | Tạm thời |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh chờ thanh toán |
| `OrderSlipId` | `TEXT` | No | - | Đơn |
| `PaymentMethod` | `TEXT` | No | - | Phương thức |
| `RequestedAmount` | `NUMERIC` | No | `0` | Số tiền yêu cầu |
| `WaitingState` | `TEXT` | No | `'Waiting'` | Trạng thái chờ |
| `RequestedAt` | `TEXT` | No | - | Thời điểm yêu cầu |
| `ExpiresAt` | `TEXT` | Yes | `null` | Thời điểm hết hạn |
| `GatewayRefNo` | `TEXT` | Yes | `null` | Mã tham chiếu |
| `ResponsePayloadJson` | `TEXT` | Yes | `null` | Dữ liệu phản hồi |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `OrderSlipId -> OrderSlip.Id`

#### Index

- `idx_wait_payment_state` on `(WaitingState, ExpiresAt)`

#### Kịch bản sử dụng

- Lưu trạng thái chờ duyệt từ gateway
- Cho phép retry an toàn

### 2.17 Outbox

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Outbox` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `SyncWorkers`, `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream |
| Chính sách lưu giữ | Lưu sau khi xử lý |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh outbox |
| `AggregateType` | `TEXT` | No | - | Loại aggregate |
| `AggregateId` | `TEXT` | No | - | ID aggregate |
| `EventType` | `TEXT` | No | - | Loại event |
| `PayloadJson` | `TEXT` | No | `'{}'` | Payload |
| `TargetScope` | `TEXT` | No | - | Phạm vi đích |
| `RetryCount` | `INTEGER` | No | `0` | Số lần retry |
| `NextRetryAt` | `TEXT` | Yes | `null` | Lần retry tiếp theo |
| `Status` | `TEXT` | No | `'Pending'` | Trạng thái |
| `LastErrorMessage` | `TEXT` | Yes | `null` | Lỗi gần nhất |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`

#### Index

- `idx_outbox_status_next_retry` on `(Status, NextRetryAt)`
- `idx_outbox_aggregate` on `(AggregateType, AggregateId)`

#### Kịch bản sử dụng

- Đưa event sang Central
- Retry và phục hồi mất kết nối

### 2.18 SyncCursor

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `SyncCursor` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp`, `SyncWorkers` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Upstream / Downstream |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh cursor |
| `StreamName` | `TEXT` | No | - | Tên stream |
| `LastCursor` | `TEXT` | Yes | `null` | Cursor gần nhất |
| `LastEventId` | `TEXT` | Yes | `null` | Event gần nhất |
| `LastSyncedAt` | `TEXT` | Yes | `null` | Thời điểm sync gần nhất |
| `Checksum` | `TEXT` | Yes | `null` | Checksum |
| `Version` | `INTEGER` | No | `1` | Phiên bản |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `StreamName`

#### Index

- `idx_sync_cursor_stream` on `(StreamName, Version)`

#### Kịch bản sử dụng

- Đồng bộ gia tăng
- Resume sau khi gián đoạn

### 2.19 RecoveryState

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `RecoveryState` |
| Chủ thể sở hữu | `BrandPosApp` |
| Nơi lưu | Edge SQLite |
| Nguồn gốc | Edge |
| Bên đọc | `BrandPosApp` |
| Bên ghi | `BrandPosApp` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | TTL ngắn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `TEXT` | No | - | Định danh trạng thái phục hồi |
| `SessionId` | `TEXT` | No | - | Session ID |
| `ScreenName` | `TEXT` | No | - | Tên màn hình |
| `RequestId` | `TEXT` | Yes | `null` | Request ID |
| `OperatorId` | `TEXT` | Yes | `null` | Người thao tác |
| `PendingAction` | `TEXT` | No | - | Hành động đang chờ |
| `SnapshotJson` | `TEXT` | No | `'{}'` | Snapshot phục hồi |
| `ExpiresAt` | `TEXT` | No | - | Thời điểm hết hạn |
| `RestoredAt` | `TEXT` | Yes | `null` | Thời điểm phục hồi |
| `State` | `TEXT` | No | `'Pending'` | Trạng thái |
| `CreatedAt` | `TEXT` | No | - | Thời điểm tạo |
| `UpdatedAt` | `TEXT` | No | - | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `SessionId`

#### Index

- `idx_recovery_state_expires` on `(State, ExpiresAt)`

#### Kịch bản sử dụng

- Khôi phục sau khi CEF/Browser crash
- Hồi phục màn hình/luồng đang làm dở
