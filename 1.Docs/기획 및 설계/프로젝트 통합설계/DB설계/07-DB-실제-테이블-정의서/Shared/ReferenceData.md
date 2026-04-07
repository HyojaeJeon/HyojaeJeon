# Shared Reference Data
# Shared Reference Data / Dữ liệu tham chiếu chung

> 이 문서는 Central과 Edge가 공통으로 참조하는 기준 데이터의 1차 실제 정의서다.
> 공용 자산(`SharedAssets`)은 번역 파일/리소스 패키지이고, 이 문서는 DB 참조 데이터만 다룬다.
> Tài liệu này là định nghĩa thực tế đợt 1 cho dữ liệu tham chiếu mà Central và Edge cùng sử dụng.
> SharedAssets là gói tài nguyên/bản dịch, không phải DB.

---

## 1. Korean

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

## 2. Tiếng Việt

### 2.1 Language

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Language` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL + Edge SQLite cache |
| Nguồn gốc | Central |
| Bên đọc | `SuperAdmin/Portal`, `RegionalDistributorPortal`, `BrandHQPortal`, `BrandPosApp` |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | Định danh nội bộ |
| `LanguageCode` | `varchar(10)` / `TEXT` | No | - | Mã ngôn ngữ |
| `NativeName` | `varchar(100)` / `TEXT` | No | - | Tên theo ngôn ngữ gốc |
| `DisplayName` | `varchar(100)` / `TEXT` | No | - | Tên hiển thị trên UI |
| `Direction` | `varchar(5)` / `TEXT` | No | `'LTR'` | Hướng văn bản |
| `IsDefault` | `boolean` / `INTEGER` | No | `false` | Có phải ngôn ngữ mặc định không |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | Có thể sử dụng không |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `LanguageCode`
- Check: `Direction in ('LTR', 'RTL')`

#### Index

- `idx_language_is_active` on `(IsActive, IsDefault)`

#### Kịch bản sử dụng

- Chọn ngôn ngữ ban đầu cho Portal/Edge
- Seed dữ liệu nền tảng
- Cập nhật tên ngôn ngữ/trạng thái hoạt động
- Xóa logic
- Edge lấy dữ liệu chuẩn từ Central

### 2.2 Region

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Region` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL + Edge SQLite cache |
| Nguồn gốc | Central |
| Bên đọc | Toàn bộ platform |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | Định danh nội bộ |
| `RegionCode` | `varchar(20)` / `TEXT` | No | - | Mã vùng |
| `CountryCode` | `varchar(10)` / `TEXT` | No | - | Mã quốc gia |
| `RegionName` | `varchar(120)` / `TEXT` | No | - | Tên vùng |
| `CurrencyCode` | `char(3)` / `TEXT` | No | - | Mã tiền tệ |
| `TimeZoneCode` | `varchar(50)` / `TEXT` | No | - | Mã múi giờ |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | Có thể sử dụng không |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `RegionCode`

#### Index

- `idx_region_country` on `(CountryCode, RegionName)`

#### Kịch bản sử dụng

- Phân bổ đại lý theo quốc gia/vùng
- Thiết lập tiền tệ/ngôn ngữ/múi giờ mặc định
- Tổng hợp báo cáo theo vùng

### 2.3 Currency

| Hạng mục | Giá trị |
|---|---|
| Tên bảng | `Currency` |
| Chủ thể sở hữu | `SuperAdmin/CentralApi` |
| Nơi lưu | Central PostgreSQL + Edge SQLite cache |
| Nguồn gốc | Central |
| Bên đọc | Toàn bộ platform |
| Bên ghi | `SuperAdmin/CentralApi` |
| Hướng sync | Downstream |
| Chính sách lưu giữ | Lưu vĩnh viễn |
| Chính sách xóa | Soft delete |

#### Định nghĩa cột

| Tên cột | Kiểu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `Id` | `uuid` / `TEXT` | No | - | Định danh nội bộ |
| `CurrencyCode` | `char(3)` / `TEXT` | No | - | Mã ISO 4217 |
| `CurrencyName` | `varchar(80)` / `TEXT` | No | - | Tên tiền tệ |
| `Symbol` | `varchar(10)` / `TEXT` | No | - | Ký hiệu tiền tệ |
| `DecimalDigits` | `smallint` / `INTEGER` | No | `2` | Số chữ số thập phân |
| `RoundingMode` | `varchar(20)` / `TEXT` | No | `'HALF_UP'` | Quy tắc làm tròn |
| `IsDefault` | `boolean` / `INTEGER` | No | `false` | Có phải tiền tệ mặc định không |
| `IsActive` | `boolean` / `INTEGER` | No | `true` | Có thể sử dụng không |
| `CreatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm tạo |
| `UpdatedAt` | `timestamptz` / `TEXT` | No | `now()` | Thời điểm cập nhật |
| `DeletedAt` | `timestamptz` / `TEXT` | Yes | `null` | Thời điểm xóa |

#### Ràng buộc

- Primary Key: `Id`
- Unique: `CurrencyCode`

#### Index

- `idx_currency_default` on `(IsDefault, IsActive)`

#### Kịch bản sử dụng

- Hiển thị giá/giảm giá/quy đổi
- Xử lý thanh toán theo quốc gia
- Chuẩn hóa số tiền ở Portal và Edge
