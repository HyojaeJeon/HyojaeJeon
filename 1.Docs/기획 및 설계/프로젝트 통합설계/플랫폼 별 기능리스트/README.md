# 플랫폼 별 기능리스트

`경로 / Đường dẫn`: `/1.Docs/기획 및 설계/프로젝트 통합설계/플랫폼 별 기능리스트`

## 한국어

### 역할
- HJ-POS 레거시 기능을 신규 Platform 계층 기준으로 재분류한 기능 리스트 집합이다.
- 이 폴더는 기능 목록의 기준 원본이 아니라, **플랫폼별 소유권과 커버리지를 보여주는 최종 정리본**이다.

### 담당 범위
- `SuperAdmin`, `RegionalDistributor`, `BrandHQ`, `EdgePos`의 기능 소유권
- 레거시 기능 목록의 플랫폼별 매핑
- 커버리지 검증 매트릭스

### 문서 지도
- `00-기능리스트-커버리지-매트릭스.md`: 레거시 기능 목록과 신규 플랫폼 문서의 대응표
- `01-SuperAdmin-기능리스트.md`: 공급사/슈퍼관리자 기능 목록
- `02-RegionalDistributor-기능리스트.md`: 대리점/통합유통 기능 목록
- `03-BrandHQ-기능리스트.md`: 브랜드 본사 기능 목록
- `04-EdgePos-기능리스트.md`: 매장 Edge POS 기능 목록

### 규칙
- 새로운 기능이 추가되면 먼저 해당 플랫폼 문서와 커버리지 매트릭스를 함께 갱신한다.
- 레거시 기능은 복제 대상이 아니라, 신규 아키텍처 기준으로 재분류한다.
- 기능이 둘 이상의 플랫폼에 걸치면 책임 주체를 명시한다.

### 해도 되는 것
- 플랫폼별 기능 책임과 범위를 문서화한다.
- 레거시 HJ-POS 기능을 신규 구조로 재배치한다.
- 기능 누락 여부를 커버리지 매트릭스로 검증한다.

### 하면 안 되는 것
- 같은 기능을 서로 다른 플랫폼 문서에 중복 책임으로 둔다.
- 기준 없이 레거시 문구를 그대로 복붙한다.
- 기능 문서와 설계 문서의 책임 경계를 어긋나게 둔다.

## Tiếng Việt

### Vai trò
- Đây là tập tài liệu phân loại lại chức năng của HJ-POS legacy theo các tầng của Platform mới.
- Thư mục này không phải nguồn gốc nguyên bản của danh sách chức năng, mà là **bản chốt cuối cùng về quyền sở hữu và coverage theo platform**.

### Phạm vi phụ trách
- Quyền sở hữu chức năng của `SuperAdmin`, `RegionalDistributor`, `BrandHQ`, `EdgePos`
- Mapping chức năng legacy sang platform mới
- Ma trận kiểm tra coverage

### Bản đồ tài liệu
- `00-기능리스트-커버리지-매트릭스.md`: bảng đối chiếu giữa legacy và tài liệu platform mới
- `01-SuperAdmin-기능리스트.md`: danh sách chức năng của nhà cung cấp / super admin
- `02-RegionalDistributor-기능리스트.md`: danh sách chức năng của tầng đại lý / phân phối
- `03-BrandHQ-기능리스트.md`: danh sách chức năng của brand HQ
- `04-EdgePos-기능리스트.md`: danh sách chức năng của Edge POS tại cửa hàng

### Quy tắc
- Khi có chức năng mới, cập nhật đồng thời tài liệu platform tương ứng và ma trận coverage.
- Chức năng legacy không được copy nguyên trạng; phải tái phân loại theo kiến trúc mới.
- Nếu một chức năng thuộc nhiều platform, phải ghi rõ chủ sở hữu chính.

### Được phép làm
- Tài liệu hóa trách nhiệm và phạm vi chức năng theo từng platform.
- Tái sắp xếp chức năng HJ-POS legacy theo cấu trúc mới.
- Kiểm tra thiếu sót bằng ma trận coverage.

### Không được làm
- Không để một chức năng có nhiều platform cùng chịu trách nhiệm chính mà không nói rõ.
- Không copy nguyên văn legacy khi chưa tái cấu trúc.
- Không làm lệch ranh giới trách nhiệm giữa tài liệu chức năng và tài liệu thiết kế.
