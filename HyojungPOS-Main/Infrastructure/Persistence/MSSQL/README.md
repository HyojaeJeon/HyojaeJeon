# MSSQL

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/Persistence/MSSQL`

## 한국어

### 역할
- 로컬 MSSQL 접근과 스키마 관리 같은 영속 인프라 구현을 담당한다.

### 담당 범위
- DBAccess, AdoWraper, Schema, Rows, Mappers, Sql, Migration, Stores

### 규칙
- 로컬 MSSQL은 업무 데이터의 진실의 원천이라는 전제를 지킨다.
- 연결/스키마/저장소 구현만 담당하고 비즈니스 성공 판정은 하지 않는다.

### 해도 되는 것
- DB 연결 안정화, 스키마 업그레이드, 영속 계층 유틸을 관리한다.
- UseCases/Domain이 사용할 안전한 persistence 기반을 제공한다.
- 역설계 결과를 테이블/row/mapper/sql/store 구조로 고정한다.

### 하면 안 되는 것
- 외부 sync 성공 여부를 여기서 업무 성공으로 해석하지 않는다.
- UI 브릿지 포맷이나 화면 상태를 직접 관리하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách phần persistence MSSQL cục bộ như kết nối và quản lý schema.

### Phạm vi phụ trách
- DBAccess, AdoWraper, Schema, Rows, Mappers, Sql, Migration và Stores

### Quy tắc
- Phải giữ nguyên giả định local MSSQL là nguồn dữ liệu nghiệp vụ gốc.
- Chỉ phụ trách kết nối/schema/persistence, không phán quyết thành công nghiệp vụ.

### Được phép làm
- Quản lý ổn định kết nối DB, nâng cấp schema và tiện ích persistence.
- Cung cấp nền tảng persistence an toàn cho UseCases/Domain.
- Cố định kết quả reverse engineering thành cấu trúc table/row/mapper/sql/store.

### Không được làm
- Không diễn giải thành công sync ngoài thành thành công nghiệp vụ tại đây.
- Không quản lý trực tiếp format bridge UI hay trạng thái màn hình.
