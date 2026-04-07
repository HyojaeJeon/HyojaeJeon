# Central PostgreSQL Schema Definition

> Canonical physical schema definition for the Central PostgreSQL database.
> This document consolidates the central-side table definitions from `07-DB-실제-테이블-정의서/` and excludes Edge SQLite tables.

## Scope
- Included: shared reference data, SuperAdmin governance, RegionalDistributor governance, BrandHQ master data
- Excluded: all EdgePos runtime tables, device snapshots, offline order/payment tables, and other SQLite-only tables
- Source inputs: `07-DB-실제-테이블-정의서/`, `10-전체-테이블-컬럼-마스터.md`, `11-레거시-테이블-검증결과.md`

## Schema Rules
- Table names stay `PascalCase`.
- Central PostgreSQL owns only central reference/governance/master tables.
- Soft delete is the default for business entities unless explicitly forbidden.
- `jsonb` is reserved for policy/rule/config payloads that need versioned flexibility.
- Edge-local data is not mirrored into this schema as a second ownership root.

## Table Map
| Domain | Tables | Storage |
|---|---|---|
| Shared Reference Data | Language, Region, Currency | Central PostgreSQL + Edge SQLite cache |
| SuperAdmin Governance | SuperAdminUser, PlatformLicense, PlatformPolicy, AuditLog, DeployPackage, DeployRelease | Central PostgreSQL |
| RegionalDistributor Channel Governance | DistributorProfile, Territory, DistributorContract, BrandAssignment, DeploymentScope, ChannelUser | Central PostgreSQL |
| BrandHQ Master Data | BrandProfile, Branch, BrandMenuCategory, BrandMenuItem, PricePolicy, Promotion, BranchOverride, OperatorTemplate | Central PostgreSQL |

## Relationship Summary
- `DistributorProfile` is the parent for `Territory`, `DistributorContract`, `BrandAssignment`, `DeploymentScope`, and `ChannelUser`.
- `BrandProfile` is the parent for `Branch`, `BrandMenuCategory`, `BrandMenuItem`, `PricePolicy`, `Promotion`, `BranchOverride`, and `OperatorTemplate`.
- `Branch` is the operational unit under `BrandProfile`, while `EdgePos` stays in the Edge SQLite schema.

## Shared Reference Data

> Central and Edge share this reference data; the canonical storage is Central PostgreSQL.

### 1.1 Language

| 항목 | 값 |
|---|---|
| 테이블명 | `Language` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL + Edge SQLite cache |
| 원본 | Central |
| 읽는 주체 | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal`, `BrandPosApp` |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | 내부 식별자 |
| `LanguageCode` | `varchar(10)` / `TEXT` | No | - | `ko-KR`, `vi-VN`, `en-US` |
| `NativeName` | `varchar(100)` / `TEXT` | No | - | 원어 표기명 |
| `DisplayName` | `varchar(100)` / `TEXT` | No | - | UI 표시명 |
| `Direction` | `varchar(5)` / `TEXT` | No | `'LTR'` | 텍스트 방향 |
| `IsDefault` | `boolean` / `INTEGER` | No | `false` | 기본 언어 여부 |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | 사용 가능 여부 |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `LanguageCode`
- Check: `Direction in ('LTR', 'RTL')`

#### 인덱스

- `idx_language_is_active` on `(IsActive, IsDefault)`

#### 사용 시나리오

- 조회: 포털/Edge 초기 언어 선택
- 생성: 플랫폼 초기 seed
- 수정: 언어명/활성화 상태 변경
- 삭제: 논리 삭제
- 동기화: Edge는 중앙 기준값을 내려받아 사용

### 1.2 Region

| 항목 | 값 |
|---|---|
| 테이블명 | `Region` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL + Edge SQLite cache |
| 원본 | Central |
| 읽는 주체 | 전체 플랫폼 |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | 내부 식별자 |
| `RegionCode` | `varchar(20)` / `TEXT` | No | - | 지역 코드 |
| `CountryCode` | `varchar(10)` / `TEXT` | No | - | 국가 코드 |
| `RegionName` | `varchar(120)` / `TEXT` | No | - | 지역명 |
| `CurrencyCode` | `char(3)` / `TEXT` | No | - | 기본 통화 코드 |
| `TimeZoneCode` | `varchar(50)` / `TEXT` | No | - | 기본 타임존 |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | 사용 가능 여부 |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `RegionCode`

#### 인덱스

- `idx_region_country` on `(CountryCode, RegionName)`

#### 사용 시나리오

- 국가/지역별 대리점 배치
- 세금/통화/언어 기본값 결정
- 리포트 집계 단위

### 1.3 Currency

| 항목 | 값 |
|---|---|
| 테이블명 | `Currency` |
| 소유 주체 | `SuperAdmin/CentralApi` |
| 저장 위치 | Central PostgreSQL + Edge SQLite cache |
| 원본 | Central |
| 읽는 주체 | 전체 플랫폼 |
| 쓰는 주체 | `SuperAdmin/CentralApi` |
| 동기화 방향 | Downstream |
| 보존 정책 | 영구 보존 |
| 삭제 정책 | Soft delete |

#### 컬럼 정의

| 컬럼명 | 타입 | Nullable | Default | 의미 |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | 내부 식별자 |
| `CurrencyCode` | `char(3)` / `TEXT` | No | - | ISO 4217 코드 |
| `CurrencyName` | `varchar(80)` / `TEXT` | No | - | 통화명 |
| `Symbol` | `varchar(10)` / `TEXT` | No | - | 통화 기호 |
| `DecimalDigits` | `smallint` / `INTEGER` | No | `2` | 소수 자릿수 |
| `RoundingMode` | `varchar(20)` / `TEXT` | No | `'HALF_UP'` | 반올림 규칙 |
| `IsDefault` | `boolean` / `INTEGER` | No | `false` | 기본 통화 여부 |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | 사용 가능 여부 |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | 생성 시각 |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | 수정 시각 |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | 삭제 시각 |

#### 제약 조건

- Primary Key: `Id`
- Unique: `CurrencyCode`

#### 인덱스

- `idx_currency_default` on `(IsDefault, IsActive)`

#### 사용 시나리오

- 가격/할인/정산 표시
- 국가별 로컬 통화 처리
- Edge/Portal 공통 금액 표준화

---

## SuperAdmin Governance

> Platform supplier governance tables live here.

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

## RegionalDistributor Channel Governance

> Regional distributor and exclusive territory governance tables live here.

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

## BrandHQ Master Data

> BrandHQ and branch master data tables live here.

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
