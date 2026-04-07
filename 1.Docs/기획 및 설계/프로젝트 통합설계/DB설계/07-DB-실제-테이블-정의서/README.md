# 실제 테이블 정의서

`경로 / Đường dẫn`: `/1.Docs/기획 및 설계/프로젝트 통합설계/DB설계/07-DB-실제-테이블-정의서`

## 한국어

### 역할
- 이 폴더는 실제 DB 테이블과 컬럼 정의를 담는 본문 폴더다.
- `10-전체-테이블-컬럼-마스터.md`를 기준 인벤토리로 삼아 실제 정의를 이곳에 쌓는다.

### 작성 규칙
- 도메인별 파일로 나눈다.
- 한 파일 안에는 관련 테이블만 넣는다.
- 각 테이블은 메타 정보, 컬럼 정의, 제약 조건, 인덱스, 사용 시나리오, 마이그레이션 메모를 포함한다.
- `10`에서 추린 실제 대상만 이곳에 축적한다.

### 권장 구조

```text
07-DB-실제-테이블-정의서/
├── SuperAdmin/
├── RegionalDistributor/
├── BrandHQ/
├── Branch/
├── EdgePos/
└── Shared/
```

### 1차 실제 정의서

- `Shared/ReferenceData.md`
- `SuperAdmin/Governance.md`
- `RegionalDistributor/ChannelGovernance.md`
- `BrandHQ/MasterData.md`
- `EdgePos/OperationalCore.md`

### 보조 문서

- `../10-전체-테이블-컬럼-마스터.md`: 현재 플랫폼 + legacy HJ-POS 전체 테이블/컬럼 전수 인벤토리
- `../11-레거시-테이블-검증결과.md`: `10`과 레거시 코드의 대조 검증 결과
- `../12-Central-PostgreSQL-스키마-정의서.md`: 중앙 PostgreSQL의 최종 canonical schema definition

### 해도 되는 것
- 실제 table/column 정의를 이곳에 축적한다.
- 도메인별로 테이블 정의를 분리한다.
- 변동 이력과 마이그레이션 메모를 함께 적는다.

### 하면 안 되는 것
- 템플릿만 두고 실제 정의를 다른 문서에 흩뿌리지 않는다.
- schema 의사결정을 이 폴더 밖에서 새로 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục chứa nội dung định nghĩa bảng và cột DB thực tế.
- Các định nghĩa thật được tách ra từ inventory tổng hợp `10-전체-테이블-컬럼-마스터.md` và lưu tại đây.

### Quy tắc viết
- Tách file theo domain.
- Chỉ đưa các bảng liên quan vào cùng một file.
- Mỗi bảng phải có meta info, định nghĩa cột, ràng buộc, index, kịch bản sử dụng và ghi chú migration.
- Chỉ tích lũy các bảng thực tế đã được lọc từ `10`.

### Cấu trúc khuyến nghị

```text
07-DB-실제-테이블-정의서/
├── SuperAdmin/
├── RegionalDistributor/
├── BrandHQ/
├── Branch/
├── EdgePos/
└── Shared/
```

### Định nghĩa thực tế đợt 1

- `Shared/ReferenceData.md`
- `SuperAdmin/Governance.md`
- `RegionalDistributor/ChannelGovernance.md`
- `BrandHQ/MasterData.md`
- `EdgePos/OperationalCore.md`

### Tài liệu phụ trợ

- `../10-전체-테이블-컬럼-마스터.md`: inventory đầy đủ toàn bộ bảng/cột của platform hiện tại + legacy HJ-POS
- `../11-레거시-테이블-검증결과.md`: kết quả đối chiếu giữa `10` và mã nguồn legacy
- `../12-Central-PostgreSQL-스키마-정의서.md`: canonical schema definition của Central PostgreSQL

### Được phép làm
- Tích lũy định nghĩa table/column thực tế tại đây.
- Tách định nghĩa bảng theo từng domain.
- Ghi kèm lịch sử thay đổi và ghi chú migration.

### Không được làm
- Không để định nghĩa thật bị rải ở nơi khác ngoài thư mục này.
- Không tự tạo quyết định schema ngoài thư mục này.
