# BrandHQ Master Data
# BrandHQ Master Data / Dữ liệu chủ của BrandHQ

> 이 문서는 브랜드 본사와 지점 운영의 실제 중앙 마스터 데이터 정의서다.
> 브랜드 메뉴/가격/프로모션/지점 정책은 중앙에서 관리하고 Edge로 내려보낸다.
> Tài liệu này định nghĩa dữ liệu chủ thực tế cho brand HQ và chi nhánh.
> Menu/giá/promotion/chính sách chi nhánh được quản lý ở Central rồi đồng bộ xuống Edge.

---

## 1. Korean

### 1.1 BrandProfile

| 항목 | 값 |
|---|---|
| 테이블명 | `BrandProfile` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `SuperAdmin/CentralApi`, `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 브랜드 식별자 |
| `DistributorId` | `uuid` | No | - | 소속 대리점 |
| `BrandCode` | `varchar(50)` | No | - | 브랜드 코드 |
| `BrandName` | `varchar(200)` | No | - | 브랜드명 |
| `CountryCode` | `varchar(10)` | No | - | 기준 국가 |
| `DefaultLanguageCode` | `varchar(10)` | No | - | 기본 언어 |
| `BusinessNumber` | `varchar(50)` | Yes | `null` | 사업자 번호 |
| `ContactName` | `varchar(120)` | Yes | `null` | 담당자명 |
| `ContactEmail` | `varchar(200)` | Yes | `null` | 이메일 |
| `ContactPhone` | `varchar(30)` | Yes | `null` | 전화번호 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `BrandCode`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### 인덱스

- `idx_brand_distributor_status` on `(DistributorId, Status)`

#### 사용 시나리오

- 브랜드 온보딩
- 기본 언어/국가 정책
- 중앙 기준정보의 루트 엔티티

### 1.2 Branch

| 항목 | 값 |
|---|---|
| 테이블명 | `Branch` |
| 소유 주체 | `BrandHQPortal` / `CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp`, `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `BrandHQPortal`, `CentralApi` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 지점 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `DistributorId` | `uuid` | No | - | 담당 대리점 |
| `BranchCode` | `varchar(50)` | No | - | 지점 코드 |
| `BranchName` | `varchar(200)` | No | - | 지점명 |
| `BranchType` | `varchar(30)` | No | `'Store'` | 지점 유형 |
| `CountryCode` | `varchar(10)` | No | - | 국가 코드 |
| `RegionCode` | `varchar(20)` | Yes | `null` | 지역 코드 |
| `AddressLine1` | `varchar(255)` | Yes | `null` | 주소 1 |
| `AddressLine2` | `varchar(255)` | Yes | `null` | 주소 2 |
| `PostalCode` | `varchar(20)` | Yes | `null` | 우편번호 |
| `TimeZoneCode` | `varchar(50)` | No | - | 타임존 |
| `DefaultLanguageCode` | `varchar(10)` | No | - | 기본 언어 |
| `BusinessHoursJson` | `jsonb` | No | `'{}'` | 영업 시간 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `OpeningDate` | `date` | Yes | `null` | 개점일 |
| `ClosingDate` | `date` | Yes | `null` | 폐점일 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `BranchCode`
- Foreign Key: `BrandHQId -> BrandProfile.Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### 인덱스

- `idx_branch_brand_status` on `(BrandHQId, Status)`
- `idx_branch_distributor` on `(DistributorId, RegionCode)`

#### 사용 시나리오

- 지점 운영
- 단말 설치/배포 대상 관리
- 지역별/국가별 지점 분류

### 1.3 BrandMenuCategory

| 항목 | 값 |
|---|---|
| 테이블명 | `BrandMenuCategory` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 카테고리 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `CategoryCode` | `varchar(60)` | No | - | 카테고리 코드 |
| `CategoryName` | `varchar(200)` | No | - | 카테고리명 |
| `ParentCategoryId` | `uuid` | Yes | `null` | 상위 카테고리 |
| `DisplayOrder` | `integer` | No | `0` | 표시 순서 |
| `IsActive` | `boolean` | No | `true` | 사용 가능 여부 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, CategoryCode)`

#### 인덱스

- `idx_menu_category_brand` on `(BrandHQId, ParentCategoryId, DisplayOrder)`

#### 사용 시나리오

- 메뉴 카테고리 구조 관리
- Edge 메뉴 동기화

### 1.4 BrandMenuItem

| 항목 | 값 |
|---|---|
| 테이블명 | `BrandMenuItem` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 아이템 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `ItemCode` | `varchar(60)` | No | - | 아이템 코드 |
| `ItemName` | `varchar(200)` | No | - | 아이템명 |
| `CategoryId` | `uuid` | No | - | 카테고리 |
| `ItemType` | `varchar(30)` | No | `'Standard'` | 상품 타입 |
| `BasePrice` | `numeric(14,2)` | No | `0` | 기본 가격 |
| `TaxRate` | `numeric(5,2)` | No | `0` | 세율 |
| `UnitType` | `varchar(20)` | No | `'EA'` | 단위 |
| `IsSoldOut` | `boolean` | No | `false` | 품절 여부 |
| `DisplayOrder` | `integer` | No | `0` | 표시 순서 |
| `SearchKeywords` | `text` | Yes | `null` | 검색 키워드 |
| `IsActive` | `boolean` | No | `true` | 사용 가능 여부 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, ItemCode)`
- Foreign Key: `CategoryId -> BrandMenuCategory.Id`

#### 인덱스

- `idx_menu_item_brand_category` on `(BrandHQId, CategoryId, DisplayOrder)`

#### 사용 시나리오

- 메뉴/상품 관리
- Edge 메뉴 동기화
- 가격 정책의 기준값

### 1.5 PricePolicy

| 항목 | 값 |
|---|---|
| 테이블명 | `PricePolicy` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 계약/정책 이력 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 정책 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `PolicyCode` | `varchar(60)` | No | - | 정책 코드 |
| `PolicyName` | `varchar(200)` | No | - | 정책명 |
| `PolicyType` | `varchar(30)` | No | - | 정책 유형 |
| `RuleJson` | `jsonb` | No | `'{}'` | 가격 규칙 |
| `EffectiveFrom` | `date` | No | - | 시작일 |
| `EffectiveTo` | `date` | Yes | `null` | 종료일 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, PolicyCode)`

#### 인덱스

- `idx_price_policy_brand` on `(BrandHQId, PolicyType, Status)`

#### 사용 시나리오

- 가격 정책 버전 관리
- 점심/저녁/프로모션 가격 규칙

### 1.6 Promotion

| 항목 | 값 |
|---|---|
| 테이블명 | `Promotion` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 이력 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 프로모션 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `PromotionCode` | `varchar(60)` | No | - | 프로모션 코드 |
| `PromotionName` | `varchar(200)` | No | - | 프로모션명 |
| `PromotionType` | `varchar(30)` | No | - | 유형 |
| `RuleJson` | `jsonb` | No | `'{}'` | 적용 규칙 |
| `StartAt` | `timestamptz` | No | - | 시작 시각 |
| `EndAt` | `timestamptz` | Yes | `null` | 종료 시각 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, PromotionCode)`

#### 인덱스

- `idx_promotion_brand` on `(BrandHQId, Status, StartAt DESC)`

#### 사용 시나리오

- 기간 한정 할인
- 조합/세트/쿠폰 규칙 관리

### 1.7 BranchOverride

| 항목 | 값 |
|---|---|
| 테이블명 | `BranchOverride` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 이력 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 오버라이드 식별자 |
| `BranchId` | `uuid` | No | - | 지점 |
| `OverrideKey` | `varchar(120)` | No | - | 설정 키 |
| `OverrideValueJson` | `jsonb` | No | `'{}'` | 오버라이드 값 |
| `Version` | `integer` | No | `1` | 버전 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BranchId, OverrideKey, Version)`

#### 인덱스

- `idx_branch_override` on `(BranchId, OverrideKey, Status)`

#### 사용 시나리오

- 지점별 가격/출력/프로모션 예외 설정
- 본사 기본값 대비 override 관리

### 1.8 OperatorTemplate

| 항목 | 값 |
|---|---|
| 테이블명 | `OperatorTemplate` |
| 소유 주체 | `BrandHQPortal` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `BrandHQPortal` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 템플릿 식별자 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `TemplateCode` | `varchar(60)` | No | - | 템플릿 코드 |
| `TemplateName` | `varchar(200)` | No | - | 템플릿명 |
| `RoleCode` | `varchar(50)` | No | - | 적용 역할 |
| `PermissionJson` | `jsonb` | No | `'{}'` | 권한 집합 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(BrandHQId, TemplateCode)`

#### 인덱스

- `idx_operator_template_brand` on `(BrandHQId, RoleCode, Status)`

#### 사용 시나리오

- 직원 역할별 기본 권한 템플릿
- 지점 배포용 운영 권한 표준화

---

## 2. Tiếng Việt

### 2.1 BrandProfile

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `BrandProfile` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `SuperAdmin/CentralApi`, `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh brand |
| `DistributorId` | `uuid` | No | - | Đại lý sở hữu |
| `BrandCode` | `varchar(50)` | No | - | Mã brand |
| `BrandName` | `varchar(200)` | No | - | Tên brand |
| `CountryCode` | `varchar(10)` | No | - | Quốc gia |
| `DefaultLanguageCode` | `varchar(10)` | No | - | Ngôn ngữ mặc định |
| `BusinessNumber` | `varchar(50)` | Yes | `null` | Mã kinh doanh |
| `ContactName` | `varchar(120)` | Yes | `null` | Người liên hệ |
| `ContactEmail` | `varchar(200)` | Yes | `null` | Email |
| `ContactPhone` | `varchar(30)` | Yes | `null` | Số điện thoại |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `BrandCode`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### Index

- `idx_brand_distributor_status` on `(DistributorId, Status)`

#### Kịch bản sử dụng

- Onboarding brand
- Cấu hình quốc gia/ngôn ngữ mặc định
- Root entity của master data

### 2.2 Branch

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Branch` |
| Chủ thể sở hữu | `BrandHQPortal` / `CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp`, `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| Bên ghi | `BrandHQPortal`, `CentralApi` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh chi nhánh |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `DistributorId` | `uuid` | No | - | Đại lý phụ trách |
| `BranchCode` | `varchar(50)` | No | - | Mã chi nhánh |
| `BranchName` | `varchar(200)` | No | - | Tên chi nhánh |
| `BranchType` | `varchar(30)` | No | `'Store'` | Loại chi nhánh |
| `CountryCode` | `varchar(10)` | No | - | Quốc gia |
| `RegionCode` | `varchar(20)` | Yes | `null` | Vùng |
| `AddressLine1` | `varchar(255)` | Yes | `null` | Địa chỉ 1 |
| `AddressLine2` | `varchar(255)` | Yes | `null` | Địa chỉ 2 |
| `PostalCode` | `varchar(20)` | Yes | `null` | Mã bưu điện |
| `TimeZoneCode` | `varchar(50)` | No | - | Múi giờ |
| `DefaultLanguageCode` | `varchar(10)` | No | - | Ngôn ngữ mặc định |
| `BusinessHoursJson` | `jsonb` | No | `'{}'` | Giờ hoạt động |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `OpeningDate` | `date` | Yes | `null` | Ngày mở cửa |
| `ClosingDate` | `date` | Yes | `null` | Ngày đóng cửa |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `BranchCode`
- Foreign Key: `BrandHQId -> BrandProfile.Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### Index

- `idx_branch_brand_status` on `(BrandHQId, Status)`
- `idx_branch_distributor` on `(DistributorId, RegionCode)`

#### Kịch bản sử dụng

- Vận hành chi nhánh
- Quản lý triển khai terminal
- Phân loại theo vùng/quốc gia

### 2.3 BrandMenuCategory

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `BrandMenuCategory` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh category |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `CategoryCode` | `varchar(60)` | No | - | Mã category |
| `CategoryName` | `varchar(200)` | No | - | Tên category |
| `ParentCategoryId` | `uuid` | Yes | `null` | Category cha |
| `DisplayOrder` | `integer` | No | `0` | Thứ tự hiển thị |
| `IsActive` | `boolean` | No | `true` | Có sử dụng không |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, CategoryCode)`

#### Index

- `idx_menu_category_brand` on `(BrandHQId, ParentCategoryId, DisplayOrder)`

#### Kịch bản sử dụng

- Quản lý cấu trúc menu
- Đồng bộ menu xuống Edge

### 2.4 BrandMenuItem

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `BrandMenuItem` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh item |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `ItemCode` | `varchar(60)` | No | - | Mã item |
| `ItemName` | `varchar(200)` | No | - | Tên item |
| `CategoryId` | `uuid` | No | - | Category |
| `ItemType` | `varchar(30)` | No | `'Standard'` | Loại item |
| `BasePrice` | `numeric(14,2)` | No | `0` | Giá cơ bản |
| `TaxRate` | `numeric(5,2)` | No | `0` | Thuế suất |
| `UnitType` | `varchar(20)` | No | `'EA'` | Đơn vị |
| `IsSoldOut` | `boolean` | No | `false` | Hết hàng không |
| `DisplayOrder` | `integer` | No | `0` | Thứ tự hiển thị |
| `SearchKeywords` | `text` | Yes | `null` | Từ khóa tìm kiếm |
| `IsActive` | `boolean` | No | `true` | Có sử dụng không |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, ItemCode)`
- Foreign Key: `CategoryId -> BrandMenuCategory.Id`

#### Index

- `idx_menu_item_brand_category` on `(BrandHQId, CategoryId, DisplayOrder)`

#### Kịch bản sử dụng

- Quản lý món hàng
- Đồng bộ xuống Edge
- Làm basis cho giá

### 2.5 PricePolicy

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PricePolicy` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu theo lịch sử |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh policy |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `PolicyCode` | `varchar(60)` | No | - | Mã policy |
| `PolicyName` | `varchar(200)` | No | - | Tên policy |
| `PolicyType` | `varchar(30)` | No | - | Loại policy |
| `RuleJson` | `jsonb` | No | `'{}'` | Luật giá |
| `EffectiveFrom` | `date` | No | - | Ngày bắt đầu |
| `EffectiveTo` | `date` | Yes | `null` | Ngày kết thúc |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, PolicyCode)`

#### Index

- `idx_price_policy_brand` on `(BrandHQId, PolicyType, Status)`

#### Kịch bản sử dụng

- Quản lý chính sách giá theo thời gian
- Giá khung cho Edge

### 2.6 Promotion

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Promotion` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu lịch sử |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh promotion |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `PromotionCode` | `varchar(60)` | No | - | Mã promotion |
| `PromotionName` | `varchar(200)` | No | - | Tên promotion |
| `PromotionType` | `varchar(30)` | No | - | Loại promotion |
| `RuleJson` | `jsonb` | No | `'{}'` | Rule áp dụng |
| `StartAt` | `timestamptz` | No | - | Thời điểm bắt đầu |
| `EndAt` | `timestamptz` | Yes | `null` | Thời điểm kết thúc |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, PromotionCode)`

#### Index

- `idx_promotion_brand` on `(BrandHQId, Status, StartAt DESC)`

#### Kịch bản sử dụng

- Khuyến mãi theo thời gian
- Combo / coupon / set menu

### 2.7 BranchOverride

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `BranchOverride` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu lịch sử |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh override |
| `BranchId` | `uuid` | No | - | Chi nhánh |
| `OverrideKey` | `varchar(120)` | No | - | Khóa cấu hình |
| `OverrideValueJson` | `jsonb` | No | `'{}'` | Giá trị override |
| `Version` | `integer` | No | `1` | Phiên bản |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BranchId, OverrideKey, Version)`

#### Index

- `idx_branch_override` on `(BranchId, OverrideKey, Status)`

#### Kịch bản sử dụng

- Cấu hình riêng cho chi nhánh
- Ghi đè giá/khuyến mãi/thiết bị

### 2.8 OperatorTemplate

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `OperatorTemplate` |
| Chủ thể sở hữu | `BrandHQPortal` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `BrandHQPortal` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh template |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `TemplateCode` | `varchar(60)` | No | - | Mã template |
| `TemplateName` | `varchar(200)` | No | - | Tên template |
| `RoleCode` | `varchar(50)` | No | - | Vai trò áp dụng |
| `PermissionJson` | `jsonb` | No | `'{}'` | Bộ quyền |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(BrandHQId, TemplateCode)`

#### Index

- `idx_operator_template_brand` on `(BrandHQId, RoleCode, Status)`

#### Kịch bản sử dụng

- Chuẩn hóa quyền cho nhân viên
- Cấp mặc định theo brand/branch
