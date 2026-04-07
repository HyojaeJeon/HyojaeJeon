# DB설계

`경로 / Đường dẫn`: `/1.Docs/기획 및 설계/프로젝트 통합설계/DB설계`

## 한국어

### 역할
- 이 폴더는 전체 Platform의 DB 설계를 전담하는 단일 기준 폴더다.
- `HJ-POS-TEST`는 기능과 데이터 흐름을 참고하기 위한 레거시일 뿐, 스키마의 정답이 아니다.

### 담당 범위
- Central DB, Edge DB, Sync/Outbox, Recovery, Migration, Schema standard
- 테이블 정의서, 도메인 인벤토리, 소유권 매트릭스, 논리 모델, 물리 스키마, 마이그레이션 정책

### 문서 지도
- `07-DB-실제-테이블-정의서/`: 실제 테이블/컬럼 정의를 쌓는 본문 폴더
- `10-전체-테이블-컬럼-마스터.md`: 현재 플랫폼 + legacy HJ-POS 전체 테이블/컬럼 전수 인벤토리
- `11-레거시-테이블-검증결과.md`: `10`과 레거시 코드의 대조 검증 결과
- `12-Central-PostgreSQL-스키마-정의서.md`: 중앙 PostgreSQL의 최종 canonical schema definition

### 규칙
- DB 설계의 활성 기준은 `07`, `10`, `12`이다.
- `11`은 검증 보고서이며, schema source가 아니라 검증 결과를 기록하는 보조 문서다.
- 테이블/컬럼/키/인덱스 결정은 반드시 활성 문서에 먼저 반영한다.
- Edge 로컬 DB와 Central DB를 하나의 스키마로 보지 않는다.
- legacy 테이블은 의도적으로 폐기하지 않는다. `Partial`은 확장 대상, `Missing`은 추가 대상이다.
- 레거시와 1:1 이름이 다르더라도, 동등한 데이터 의미를 가진다면 반드시 07 또는 호환 계층에 반영한다.

### 해도 되는 것
- 신규 도메인을 활성 인벤토리와 실제 테이블 정의에 반영한다.
- 실제 테이블 정의를 템플릿 기반으로 07에 축적한다.
- 마이그레이션 규칙과 동기화 규칙을 이곳에 고정한다.

### 하면 안 되는 것
- 문서 밖에서 schema를 감으로 추가하지 않는다.
- 레거시 SQL을 그대로 복붙하고 설계 기준을 이쪽에 남기지 않는다.
- Central/Edge의 소유권 경계를 흐리지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục chuẩn duy nhất để thiết kế DB cho toàn bộ Platform.
- `HJ-POS-TEST` chỉ là legacy dùng để tham khảo chức năng và luồng dữ liệu, không phải đáp án cho schema.

### Phạm vi phụ trách
- Central DB, Edge DB, Sync/Outbox, Recovery, Migration, tiêu chuẩn schema
- Tài liệu định nghĩa bảng, inventory domain, ma trận ownership, logical model, physical schema, chính sách migration

### Bản đồ tài liệu
- `07-DB-실제-테이블-정의서/`: thư mục chứa nội dung định nghĩa bảng/cột thực tế
- `10-전체-테이블-컬럼-마스터.md`: inventory đầy đủ toàn bộ bảng/cột của platform hiện tại + legacy HJ-POS
- `11-레거시-테이블-검증결과.md`: kết quả đối chiếu giữa `10` và mã nguồn legacy
- `12-Central-PostgreSQL-스키마-정의서.md`: canonical schema definition của Central PostgreSQL

### Quy tắc
- Cấu trúc DB đang hoạt động chỉ gồm `07`, `10`, `12`.
- `11` là báo cáo kiểm chứng, không phải schema source; chỉ dùng để ghi lại kết quả đối chiếu.
- Không tạo thiết kế DB mới ở ngoài thư mục này.
- Mọi quyết định về table/column/key/index phải được phản ánh trước trong tài liệu đang hoạt động ở đây.
- Không xem Edge local DB và Central DB như một schema duy nhất.
- Không loại bỏ legacy table một cách có chủ ý. `Partial` là đối tượng mở rộng, `Missing` là đối tượng phải bổ sung.
- Dù tên không giống legacy 1:1, nếu cùng mang ý nghĩa dữ liệu thì vẫn phải được phản ánh trong 07 hoặc lớp tương thích.

### Được phép làm
- Cập nhật inventory và định nghĩa thật khi có domain mới.
- Tích lũy định nghĩa bảng thật dựa trên template.
- Cố định quy tắc migration và sync tại đây.

### Không được làm
- Không tự ý thêm schema ngoài tài liệu.
- Không copy nguyên xi legacy SQL rồi bỏ qua tiêu chuẩn thiết kế ở đây.
- Không làm mờ ranh giới ownership giữa Central và Edge.
