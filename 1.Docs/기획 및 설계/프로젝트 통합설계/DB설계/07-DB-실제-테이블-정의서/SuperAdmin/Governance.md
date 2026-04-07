# SuperAdmin Governance
# SuperAdmin Governance / Quản trị SuperAdmin

> 이 문서는 플랫폼 공급사 영역의 실제 중앙 운영 테이블 정의서다.
> 이 테이블들은 `SuperAdmin/CentralApi`가 소유하고, 포털은 GraphQL API로만 접근한다.
> Tài liệu này định nghĩa các bảng vận hành trung tâm thuộc vùng của nhà cung cấp platform.
> Các bảng này do `SuperAdmin/CentralApi` sở hữu, các portal chỉ truy cập qua GraphQL API.

---

## 1. Korean

### 1.1 SuperAdminUser

| 항목 | 값 |
|---|---|
| 테이블명 | `SuperAdminUser` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `CentralApi` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 사용자 식별자 |
| `LoginId` | `varchar(100)` | No | - | 로그인 ID |
| `PasswordHash` | `varchar(255)` | No | - | 비밀번호 해시 |
| `DisplayName` | `varchar(120)` | No | - | 표시명 |
| `Email` | `varchar(200)` | Yes | `null` | 이메일 |
| `Phone` | `varchar(30)` | Yes | `null` | 전화번호 |
| `RoleCode` | `varchar(50)` | No | - | 역할 코드 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `LastLoginAt` | `timestamptz` | Yes | `null` | 마지막 로그인 |
| `PasswordChangedAt` | `timestamptz` | Yes | `null` | 비밀번호 변경 시각 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `LoginId`
- Unique: `Email`
- Check: `Status in ('Active', 'Locked', 'Disabled')`

#### 인덱스

- `idx_superadmin_role_status` on `(RoleCode, Status)`

#### 사용 시나리오

- 슈퍼관리자 로그인
- 권한 분기
- 감사 추적의 actor 식별

### 1.2 PlatformLicense

| 항목 | 값 |
|---|---|
| 테이블명 | `PlatformLicense` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal`, `CentralApi` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 계약 만료 후 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 라이선스 식별자 |
| `ScopeType` | `varchar(30)` | No | - | `Distributor`, `BrandHQ`, `Branch` |
| `ScopeId` | `uuid` | No | - | 적용 대상 식별자 |
| `LicenseCode` | `varchar(80)` | No | - | 라이선스 코드 |
| `LicenseType` | `varchar(40)` | No | - | 종류 |
| `Status` | `varchar(20)` | No | `'Active'` | 상태 |
| `EffectiveFrom` | `date` | No | - | 시작일 |
| `EffectiveTo` | `date` | Yes | `null` | 종료일 |
| `MaxBranchCount` | `integer` | No | `0` | 허용 지점 수 |
| `MaxTerminalCount` | `integer` | No | `0` | 허용 단말 수 |
| `AllowedCountryCode` | `varchar(10)` | Yes | `null` | 허용 국가 |
| `LicensePayloadJson` | `jsonb` | No | `'{}'` | 부가 조건 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `LicenseCode`
- Check: `Status in ('Active', 'Expired', 'Suspended', 'Revoked')`

#### 인덱스

- `idx_license_scope` on `(ScopeType, ScopeId, Status)`
- `idx_license_validity` on `(EffectiveFrom, EffectiveTo)`

#### 사용 시나리오

- 대리점/브랜드/지점 라이선스 발급
- 활성 지점/단말 수 검증
- 배포 가능 범위 판단

### 1.3 PlatformPolicy

| 항목 | 값 |
|---|---|
| 테이블명 | `PlatformPolicy` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | 전체 플랫폼 |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 정책 식별자 |
| `PolicyKey` | `varchar(120)` | No | - | 정책 키 |
| `ScopeType` | `varchar(30)` | No | - | 적용 범위 유형 |
| `ScopeId` | `uuid` | Yes | `null` | 적용 범위 식별자 |
| `PolicyValueJson` | `jsonb` | No | `'{}'` | 정책 값 |
| `Version` | `integer` | No | `1` | 버전 |
| `IsActive` | `boolean` | No | `true` | 활성화 여부 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(PolicyKey, ScopeType, ScopeId, Version)`

#### 인덱스

- `idx_policy_scope_key` on `(ScopeType, ScopeId, PolicyKey, IsActive)`

#### 사용 시나리오

- 글로벌/대리점/브랜드 정책 분기
- 배포 정책, 언어 정책, 기능 플래그 제어

### 1.4 AuditLog

| 항목 | 값 |
|---|---|
| 테이블명 | `AuditLog` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, 감사 권한 보유자 |
| 쓰는 주체 | `CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 장기 보관 |
| 삭제 정책 | Hard delete 금지 |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 로그 식별자 |
| `ActorType` | `varchar(30)` | No | - | 행위자 유형 |
| `ActorId` | `uuid` | Yes | `null` | 행위자 식별자 |
| `ActionType` | `varchar(80)` | No | - | 수행 행동 |
| `TargetType` | `varchar(80)` | No | - | 대상 유형 |
| `TargetId` | `uuid` | Yes | `null` | 대상 식별자 |
| `RequestId` | `varchar(120)` | Yes | `null` | 요청 추적 ID |
| `BeforeDataJson` | `jsonb` | Yes | `null` | 변경 전 데이터 |
| `AfterDataJson` | `jsonb` | Yes | `null` | 변경 후 데이터 |
| `IpAddress` | `inet` | Yes | `null` | IP 주소 |
| `UserAgent` | `text` | Yes | `null` | User-Agent |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |

#### 제약 조건

- Primary Key: `Id`

#### 인덱스

- `idx_audit_target` on `(TargetType, TargetId, CreatedAt DESC)`
- `idx_audit_actor` on `(ActorType, ActorId, CreatedAt DESC)`

#### 사용 시나리오

- 관리자 행위 추적
- 보안/컴플라이언스 검토
- 장애 조사 시 변경 이력 확인

### 1.5 DeployPackage

| 항목 | 값 |
|---|---|
| 테이블명 | `DeployPackage` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 패키지 식별자 |
| `PackageCode` | `varchar(80)` | No | - | 배포 패키지 코드 |
| `Version` | `varchar(50)` | No | - | 버전 문자열 |
| `PlatformTarget` | `varchar(30)` | No | - | 대상 플랫폼 |
| `ArtifactUrl` | `text` | No | - | 아티팩트 경로 |
| `Checksum` | `varchar(128)` | No | - | 무결성 체크섬 |
| `ReleasedAt` | `timestamptz` | Yes | `null` | 릴리스 시각 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `(PackageCode, Version)`

#### 인덱스

- `idx_deploy_package_target` on `(PlatformTarget, ReleasedAt DESC)`

#### 사용 시나리오

- 배포 가능한 빌드 패키지 관리
- 버전 승인 및 롤백 기준

### 1.6 DeployRelease

| 항목 | 값 |
|---|---|
| 테이블명 | `DeployRelease` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Local-only |
| 보존 정책 | 영구 보관 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | 릴리스 식별자 |
| `PackageId` | `uuid` | No | - | 배포 패키지 |
| `ScopeType` | `varchar(30)` | No | - | `Distributor`, `BrandHQ`, `Branch`, `EdgePos` |
| `ScopeId` | `uuid` | No | - | 대상 식별자 |
| `ReleaseStatus` | `varchar(20)` | No | `'Planned'` | 상태 |
| `ScheduledAt` | `timestamptz` | Yes | `null` | 예약 시각 |
| `DeployedAt` | `timestamptz` | Yes | `null` | 실제 배포 시각 |
| `RollbackPackageId` | `uuid` | Yes | `null` | 롤백 패키지 |
| `ReleaseNote` | `text` | Yes | `null` | 릴리스 메모 |
| `CreatedAt` | `timestamptz` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` | No | `now()` | 수정 시각 |

#### 제약 조건

- Primary Key: `Id`
- Foreign Key: `PackageId -> DeployPackage.Id`

#### 인덱스

- `idx_deploy_release_scope` on `(ScopeType, ScopeId, ReleaseStatus)`

#### 사용 시나리오

- 브랜드/지점/Edge 배포 계획
- 롤백 기준 추적

---

## 2. Tiếng Việt

### 2.1 SuperAdminUser

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `SuperAdminUser` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `SuperAdmin/Portal`, `CentralApi` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh người dùng |
| `LoginId` | `varchar(100)` | No | - | ID đăng nhập |
| `PasswordHash` | `varchar(255)` | No | - | Mật khẩu băm |
| `DisplayName` | `varchar(120)` | No | - | Tên hiển thị |
| `Email` | `varchar(200)` | Yes | `null` | Email |
| `Phone` | `varchar(30)` | Yes | `null` | Số điện thoại |
| `RoleCode` | `varchar(50)` | No | - | Mã vai trò |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `LastLoginAt` | `timestamptz` | Yes | `null` | Lần đăng nhập gần nhất |
| `PasswordChangedAt` | `timestamptz` | Yes | `null` | Thời điểm đổi mật khẩu |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `LoginId`
- Unique: `Email`
- Check: `Status in ('Active', 'Locked', 'Disabled')`

#### Index

- `idx_superadmin_role_status` on `(RoleCode, Status)`

#### Kịch bản sử dụng

- Đăng nhập super admin
- Phân nhánh quyền
- Xác định actor cho audit log

### 2.2 PlatformLicense

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PlatformLicense` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal`, `CentralApi` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu sau khi hết hạn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh license |
| `ScopeType` | `varchar(30)` | No | - | `Distributor`, `BrandHQ`, `Branch` |
| `ScopeId` | `uuid` | No | - | Đối tượng áp dụng |
| `LicenseCode` | `varchar(80)` | No | - | Mã license |
| `LicenseType` | `varchar(40)` | No | - | Loại license |
| `Status` | `varchar(20)` | No | `'Active'` | Trạng thái |
| `EffectiveFrom` | `date` | No | - | Ngày bắt đầu |
| `EffectiveTo` | `date` | Yes | `null` | Ngày kết thúc |
| `MaxBranchCount` | `integer` | No | `0` | Số chi nhánh tối đa |
| `MaxTerminalCount` | `integer` | No | `0` | Số terminal tối đa |
| `AllowedCountryCode` | `varchar(10)` | Yes | `null` | Quốc gia cho phép |
| `LicensePayloadJson` | `jsonb` | No | `'{}'` | Điều kiện phụ |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `LicenseCode`
- Check: `Status in ('Active', 'Expired', 'Suspended', 'Revoked')`

#### Index

- `idx_license_scope` on `(ScopeType, ScopeId, Status)`
- `idx_license_validity` on `(EffectiveFrom, EffectiveTo)`

#### Kịch bản sử dụng

- Cấp license cho đại lý/brand/chi nhánh
- Kiểm tra số chi nhánh/terminal hợp lệ
- Xác định phạm vi được phép deploy

### 2.3 PlatformPolicy

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `PlatformPolicy` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | Toàn bộ platform |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh policy |
| `PolicyKey` | `varchar(120)` | No | - | Khóa policy |
| `ScopeType` | `varchar(30)` | No | - | Loại phạm vi |
| `ScopeId` | `uuid` | Yes | `null` | ID phạm vi |
| `PolicyValueJson` | `jsonb` | No | `'{}'` | Giá trị policy |
| `Version` | `integer` | No | `1` | Phiên bản |
| `IsActive` | `boolean` | No | `true` | Kích hoạt không |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(PolicyKey, ScopeType, ScopeId, Version)`

#### Index

- `idx_policy_scope_key` on `(ScopeType, ScopeId, PolicyKey, IsActive)`

#### Kịch bản sử dụng

- Quy tắc chung/toàn cục/theo brand
- Cấu hình deploy, ngôn ngữ, feature flag

### 2.4 AuditLog

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `AuditLog` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL |
| Nguồn gốc | Central |
| Bên đọc | `SuperAdmin/Portal`, người có quyền audit |
| Bên ghi | `CentralApi` |
| Hướng sync | Local-only |
| Chính sách lưu giữ | Lưu dài hạn |
| Chính sách xóa | Không cho phép hard delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` | No | - | Định danh log |
| `ActorType` | `varchar(30)` | No | - | Loại actor |
| `ActorId` | `uuid` | Yes | `null` | ID actor |
| `ActionType` | `varchar(80)` | No | - | Hành động |
| `TargetType` | `varchar(80)` | No | - | Loại đối tượng |
| `TargetId` | `uuid` | Yes | `null` | ID đối tượng |
| `RequestId` | `varchar(120)` | Yes | `null` | ID truy vết request |
| `BeforeDataJson` | `jsonb` | Yes | `null` | Dữ liệu trước |
| `AfterDataJson` | `jsonb` | Yes | `null` | Dữ liệu sau |
| `IpAddress` | `inet` | Yes | `null` | Địa chỉ IP |
| `UserAgent` | `text` | Yes | `null` | User-Agent |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |

#### Ràng buộc

- Primary Key: `Id`

#### Index

- `idx_audit_target` on `(TargetType, TargetId, CreatedAt DESC)`
- `idx_audit_actor` on `(ActorType, ActorId, CreatedAt DESC)`

#### Kịch bản sử dụng

- Theo dõi hoạt động admin
- Audit bảo mật/compliance
- Điều tra sự cố

### 2.5 DeployPackage

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DeployPackage` |
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
| `Id` | `uuid` | No | - | Định danh package |
| `PackageCode` | `varchar(80)` | No | - | Mã gói triển khai |
| `Version` | `varchar(50)` | No | - | Chuỗi version |
| `PlatformTarget` | `varchar(30)` | No | - | Nền tảng đích |
| `ArtifactUrl` | `text` | No | - | Đường dẫn artifact |
| `Checksum` | `varchar(128)` | No | - | Checksum |
| `ReleasedAt` | `timestamptz` | Yes | `null` | Thời điểm release |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `(PackageCode, Version)`

#### Index

- `idx_deploy_package_target` on `(PlatformTarget, ReleasedAt DESC)`

#### Kịch bản sử dụng

- Quản lý gói build deploy
- Xác định roll-back 기준

### 2.6 DeployRelease

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `DeployRelease` |
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
| `Id` | `uuid` | No | - | Định danh release |
| `PackageId` | `uuid` | No | - | Package được phát hành |
| `ScopeType` | `varchar(30)` | No | - | `Distributor`, `BrandHQ`, `Branch`, `EdgePos` |
| `ScopeId` | `uuid` | No | - | Đối tượng đích |
| `ReleaseStatus` | `varchar(20)` | No | `'Planned'` | Trạng thái |
| `ScheduledAt` | `timestamptz` | Yes | `null` | Lịch deploy |
| `DeployedAt` | `timestamptz` | Yes | `null` | Thời điểm deploy |
| `RollbackPackageId` | `uuid` | Yes | `null` | Package rollback |
| `ReleaseNote` | `text` | Yes | `null` | Ghi chú |
| `CreatedAt` | `timestamptz` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` | No | `now()` | Thời điểm cập nhật |

#### Ràng buộc

- Primary Key: `Id`
- Foreign Key: `PackageId -> DeployPackage.Id`

#### Index

- `idx_deploy_release_scope` on `(ScopeType, ScopeId, ReleaseStatus)`

#### Kịch bản sử dụng

- Lập kế hoạch triển khai brand/branch/Edge
- Theo dõi rollback
