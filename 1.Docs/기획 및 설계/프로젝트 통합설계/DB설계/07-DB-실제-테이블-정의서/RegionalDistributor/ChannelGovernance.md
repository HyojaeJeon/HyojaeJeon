# RegionalDistributor Channel Governance
# RegionalDistributor Channel Governance / Quản trị kênh đại lý

> 이 문서는 대리점 계층의 실제 중앙 운영 테이블 정의서다.
> 대리점은 지역/국가 독점 유통권, 현지 계약, rollout 조율, 1차 지원 책임을 가진다.
> Tài liệu này định nghĩa bảng thực tế cho tầng đại lý.
> Đại lý có quyền phân phối độc quyền theo quốc gia/khu vực, hợp đồng địa phương, điều phối rollout và hỗ trợ cấp 1.

---

## 1. Korean

### 1.1 DistributorProfile

| 항목 | 값 |
|---|---|
| 테이블명 | `DistributorProfile` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 대리점 식별자 |
| `DistributorCode` | `varchar(50)` | No | - | 대리점 코드 |
| `CompanyName` | `varchar(200)` | No | - | 회사명 |
| `LegalName` | `varchar(200)` | Yes | `null` | 법인명 |
| `BusinessNumber` | `varchar(50)` | Yes | `null` | 사업자 등록번호 |
| `CountryCode` | `varchar(10)` | No | - | 국가 코드 |
| `TerritoryName` | `varchar(120)` | No | - | 관할 지역명 |
| `DefaultLanguageCode` | `varchar(10)` | No | `'en-US'` | 기본 언어 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `ContactName` | `varchar(120)` | Yes | `null` | 담당자명 |
| `ContactEmail` | `varchar(200)` | Yes | `null` | 이메일 |
| `ContactPhone` | `varchar(30)` | Yes | `null` | 전화번호 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `DistributorCode`
- Unique: `BusinessNumber`

#### 인덱스

- `idx_distributor_country_status` on `(CountryCode, Status)`

#### 사용 시나리오

- 대리점 온보딩
- 국가/지역별 운영 범위 설정
- 포털 권한 분기

### 1.2 Territory

| 항목 | 값 |
|---|---|
| 테이블명 | `Territory` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 지역 식별자 |
| `DistributorId` | `uuid` | No | - | 소유 대리점 |
| `CountryCode` | `varchar(10)` | No | - | 국가 코드 |
| `RegionCode` | `varchar(20)` | Yes | `null` | 세부 지역 코드 |
| `TerritoryName` | `varchar(120)` | No | - | 지역명 |
| `CurrencyCode` | `char(3)` | No | - | 기본 통화 |
| `TimeZoneCode` | `varchar(50)` | No | - | 기본 타임존 |
| `IsExclusive` | `boolean` | No | `true` | 독점 여부 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### 인덱스

- `idx_territory_distributor` on `(DistributorId, CountryCode, RegionCode)`

#### 사용 시나리오

- 국가/지역 독점권 관리
- 브랜드 배치 가능 범위 판단

### 1.3 DistributorContract

| 항목 | 값 |
|---|---|
| 테이블명 | `DistributorContract` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 계약 만료 후 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 계약 식별자 |
| `DistributorId` | `uuid` | No | - | 대리점 |
| `ContractNo` | `varchar(80)` | No | - | 계약 번호 |
| `ContractType` | `varchar(40)` | No | - | 계약 유형 |
| `StartDate` | `date` | No | - | 시작일 |
| `EndDate` | `date` | Yes | `null` | 종료일 |
| `ExclusiveFlag` | `boolean` | No | `false` | 독점권 여부 |
| `RevenueShareRate` | `numeric(5,2)` | Yes | `null` | 수익 배분율 |
| `SupportLevel` | `varchar(30)` | No | `'Standard'` | 지원 수준 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `SignedAt` | `timestamptz` | Yes | `null` | 서명 시각 |
| `Notes` | `text` | Yes | `null` | 비고 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `ContractNo`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### 인덱스

- `idx_contract_distributor` on `(DistributorId, Status, EndDate)`

#### 사용 시나리오

- 독점권 계약 관리
- 수익 배분/지원 수준 관리

### 1.4 BrandAssignment

| 항목 | 값 |
|---|---|
| 테이블명 | `BrandAssignment` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `BrandHQPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 배정 식별자 |
| `DistributorId` | `uuid` | No | - | 대리점 |
| `BrandHQId` | `uuid` | No | - | 브랜드 본사 |
| `AssignmentType` | `varchar(30)` | No | `'Primary'` | 배정 유형 |
| `AssignmentStatus` | `varchar(20)` | No | `'Active'` | 상태 |
| `StartDate` | `date` | No | - | 시작일 |
| `EndDate` | `date` | Yes | `null` | 종료일 |
| `AccountManagerName` | `varchar(120)` | Yes | `null` | 담당자명 |
| `Notes` | `text` | Yes | `null` | 비고 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`
- Foreign Key: `BrandHQId -> BrandProfile.Id`

#### 인덱스

- `idx_brand_assignment` on `(DistributorId, BrandHQId, AssignmentStatus)`

#### 사용 시나리오

- 대리점별 담당 브랜드 연결
- 브랜드 롤아웃 책임 추적

### 1.5 DeploymentScope

| 항목 | 값 |
|---|---|
| 테이블명 | `DeploymentScope` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `BrandHQPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 범위 식별자 |
| `DistributorId` | `uuid` | No | - | 대리점 |
| `BrandHQId` | `uuid` | Yes | `null` | 브랜드 본사 |
| `BranchId` | `uuid` | Yes | `null` | 지점 |
| `EdgePosId` | `uuid` | Yes | `null` | Edge 단말 |
| `ScopeType` | `varchar(30)` | No | - | 범위 유형 |
| `AllowedAction` | `varchar(80)` | No | - | 허용 작업 |
| `VersionPolicy` | `varchar(50)` | No | `'LatestStable'` | 버전 정책 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### 인덱스

- `idx_deployment_scope` on `(DistributorId, BrandHQId, BranchId, EdgePosId)`

#### 사용 시나리오

- 롤아웃 대상 범위 정의
- 배포/다운로드 가능한 액션 통제

### 1.6 ChannelUser

| 항목 | 값 |
|---|---|
| 테이블명 | `ChannelUser` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 사용자 식별자 |
| `DistributorId` | `uuid` | No | - | 소속 대리점 |
| `LoginId` | `varchar(100)` | No | - | 로그인 ID |
| `PasswordHash` | `varchar(255)` | No | - | 비밀번호 해시 |
| `DisplayName` | `varchar(120)` | No | - | 표시명 |
| `Email` | `varchar(200)` | Yes | `null` | 이메일 |
| `RoleCode` | `varchar(50)` | No | - | 역할 코드 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `LastLoginAt` | `timestamptz` | Yes | `null` | 마지막 로그인 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(DistributorId, LoginId)`

#### 인덱스

- `idx_channel_user_distributor` on `(DistributorId, RoleCode, Status)`

#### 사용 시나리오

- 대리점 포털 로그인
- 담당자 권한 관리

---

## 2. Tiếng Việt

### 2.1 DistributorProfile

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DistributorProfile` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh đại lý |
| `DistributorCode` | `varchar(50)` | No | - | Mã đại lý |
| `CompanyName` | `varchar(200)` | No | - | Tên công ty |
| `LegalName` | `varchar(200)` | Yes | `null` | Tên pháp lý |
| `BusinessNumber` | `varchar(50)` | Yes | `null` | Mã kinh doanh |
| `CountryCode` | `varchar(10)` | No | - | Mã quốc gia |
| `TerritoryName` | `varchar(120)` | No | - | Tên khu vực quản lý |
| `DefaultLanguageCode` | `varchar(10)` | No | `'en-US'` | Ngôn ngữ mặc định |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `ContactName` | `varchar(120)` | Yes | `null` | Người liên hệ |
| `ContactEmail` | `varchar(200)` | Yes | `null` | Email |
| `ContactPhone` | `varchar(30)` | Yes | `null` | Số điện thoại |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `DistributorCode`
- Unique: `BusinessNumber`

#### Index

- `idx_distributor_country_status` on `(CountryCode, Status)`

#### Kịch bản sử dụng

- Onboarding đại lý
- Xác định phạm vi quốc gia/khu vực
- Phân quyền trên portal

### 2.2 Territory

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Territory` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh khu vực |
| `DistributorId` | `uuid` | No | - | Đại lý sở hữu |
| `CountryCode` | `varchar(10)` | No | - | Mã quốc gia |
| `RegionCode` | `varchar(20)` | Yes | `null` | Mã vùng chi tiết |
| `TerritoryName` | `varchar(120)` | No | - | Tên vùng |
| `CurrencyCode` | `char(3)` | No | - | Tiền tệ mặc định |
| `TimeZoneCode` | `varchar(50)` | No | - | Múi giờ mặc định |
| `IsExclusive` | `boolean` | No | `true` | Có độc quyền không |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### Index

- `idx_territory_distributor` on `(DistributorId, CountryCode, RegionCode)`

#### Kịch bản sử dụng

- Quản lý độc quyền quốc gia/khu vực
- Xác định phạm vi triển khai brand

### 2.3 DistributorContract

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DistributorContract` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu sau khi hết hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh hợp đồng |
| `DistributorId` | `uuid` | No | - | Đại lý |
| `ContractNo` | `varchar(80)` | No | - | Số hợp đồng |
| `ContractType` | `varchar(40)` | No | - | Loại hợp đồng |
| `StartDate` | `date` | No | - | Ngày bắt đầu |
| `EndDate` | `date` | Yes | `null` | Ngày kết thúc |
| `ExclusiveFlag` | `boolean` | No | `false` | Có độc quyền không |
| `RevenueShareRate` | `numeric(5,2)` | Yes | `null` | Tỷ lệ chia sẻ doanh thu |
| `SupportLevel` | `varchar(30)` | No | `'Standard'` | Mức hỗ trợ |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `SignedAt` | `timestamptz` | Yes | `null` | Thời điểm ký |
| `Notes` | `text` | Yes | `null` | Ghi chú |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `ContractNo`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### Index

- `idx_contract_distributor` on `(DistributorId, Status, EndDate)`

#### Kịch bản sử dụng

- Quản lý hợp đồng độc quyền
- Theo dõi chia sẻ doanh thu và mức hỗ trợ

### 2.4 BrandAssignment

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `BrandAssignment` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `BrandHQPortal`, `SuperAdmin/Portal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh phân bổ |
| `DistributorId` | `uuid` | No | - | Đại lý |
| `BrandHQId` | `uuid` | No | - | Brand HQ |
| `AssignmentType` | `varchar(30)` | No | `'Primary'` | Loại phân bổ |
| `AssignmentStatus` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `StartDate` | `date` | No | - | Ngày bắt đầu |
| `EndDate` | `date` | Yes | `null` | Ngày kết thúc |
| `AccountManagerName` | `varchar(120)` | Yes | `null` | Người phụ trách |
| `Notes` | `text` | Yes | `null` | Ghi chú |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`
- Foreign Key: `BrandHQId -> BrandProfile.Id`

#### Index

- `idx_brand_assignment` on `(DistributorId, BrandHQId, AssignmentStatus)`

#### Kịch bản sử dụng

- Kết nối đại lý với brand phụ trách
- Theo dõi trách nhiệm rollout

### 2.5 DeploymentScope

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DeploymentScope` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `BrandHQPortal`, `SuperAdmin/Portal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh phạm vi |
| `DistributorId` | `uuid` | No | - | Đại lý |
| `BrandHQId` | `uuid` | Yes | `null` | Brand HQ |
| `BranchId` | `uuid` | Yes | `null` | Chi nhánh |
| `EdgePosId` | `uuid` | Yes | `null` | Edge POS |
| `ScopeType` | `varchar(30)` | No | - | Loại phạm vi |
| `AllowedAction` | `varchar(80)` | No | - | Hành động cho phép |
| `VersionPolicy` | `varchar(50)` | No | `'LatestStable'` | Chính sách version |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `DistributorId -> DistributorProfile.Id`

#### Index

- `idx_deployment_scope` on `(DistributorId, BrandHQId, BranchId, EdgePosId)`

#### Kịch bản sử dụng

- Định nghĩa phạm vi rollout
- Kiểm soát action có thể deploy

### 2.6 ChannelUser

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `ChannelUser` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `RegionalDistributorPortal`, `SuperAdmin/Portal` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh user |
| `DistributorId` | `uuid` | No | - | Đại lý sở hữu |
| `LoginId` | `varchar(100)` | No | - | ID đăng nhập |
| `PasswordHash` | `varchar(255)` | No | - | Mật khẩu băm |
| `DisplayName` | `varchar(120)` | No | - | Tên hiển thị |
| `Email` | `varchar(200)` | Yes | `null` | Email |
| `RoleCode` | `varchar(50)` | No | - | Mã vai trò |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `LastLoginAt` | `timestamptz` | Yes | `null` | Lần đăng nhập gần nhất |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(DistributorId, LoginId)`

#### Index

- `idx_channel_user_distributor` on `(DistributorId, RoleCode, Status)`

#### Kịch bản sử dụng

- Đăng nhập portal đại lý
- Quản lý quyền nhân sự địa phương
