# 프로젝트 통합설계

`경로 / Đường dẫn`: `/1.Docs/기획 및 설계/프로젝트 통합설계`

## 한국어

### 역할
- 프로젝트 통합설계 관련 문서를 정리하는 폴더다.

### 담당 범위
- 설계서, 체크리스트, 외부 연동 규칙, 테스트 계획, 운영 문서

### 문서 지도
- `00-Platform-최종-아키텍처-기준서.md`: Platform 전체 스택과 기술 기준을 정의하는 최상위 기준서
- `01-SuperAdmin-통합-플랫폼-설계서.md`: 공급사/슈퍼관리자 관점 통합 플랫폼 설계서
- `02-RegionalDistributor-통합유통-플랫폼-설계서.md`: 대리점/통합유통 플랫폼 설계서
- `03-BrandHQ-브랜드-지점-운영-플랫폼-설계서.md`: 브랜드 본사/지점 운영 플랫폼 설계서
- `04-Edge-POS-아키텍처-설계서.md`: 매장/단말 Edge POS 설계 기준서
- `05-Edge-POS-전체-흐름-AZ-가이드.md`: Edge POS 동작 흐름 A-Z 설명서
- `06-Edge-POS-P0-P1-설계-보완-체크리스트.md`: Edge POS 설계 보완 체크리스트
- `플랫폼 별 기능리스트/`: SuperAdmin, RegionalDistributor, BrandHQ, EdgePos 기능 리스트와 커버리지 매트릭스
- `DB설계/`: 전체 플랫폼 DB 설계 전용 폴더

### 규칙
- 문서는 현행 코드 설명이 아니라 목표 구조와 운영 기준을 명확히 정의해야 한다.
- 중복 문서를 늘리기보다 단일 기준 문서를 우선 갱신한다.

### 해도 되는 것
- 설계 근거, 운영 기준, 마이그레이션 규칙을 문서화한다.
- 코드 변경과 함께 문서를 동기화한다.

### 하면 안 되는 것
- 서로 충돌하는 복수 기준 문서를 방치하지 않는다.
- 이미 문서화된 원칙을 코드에서 어겼는데 문서를 그대로 두지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục dùng để sắp xếp tài liệu liên quan đến 프로젝트 통합설계.

### Phạm vi phụ trách
- Tài liệu thiết kế, checklist, quy tắc tích hợp ngoài, kế hoạch test và tài liệu vận hành

### Bản đồ tài liệu
- `00-Platform-최종-아키텍처-기준서.md`: tài liệu chuẩn mức cao nhất định nghĩa stack và tiêu chuẩn kỹ thuật của toàn Platform
- `01-SuperAdmin-통합-플랫폼-설계서.md`: tài liệu platform ở góc nhìn nhà cung cấp / super admin
- `02-RegionalDistributor-통합유통-플랫폼-설계서.md`: tài liệu nền tảng phân phối tích hợp / đại lý
- `03-BrandHQ-브랜드-지점-운영-플랫폼-설계서.md`: tài liệu platform vận hành brand/branch
- `04-Edge-POS-아키텍처-설계서.md`: tài liệu tiêu chuẩn cho EdgePos tại cửa hàng
- `05-Edge-POS-전체-흐름-AZ-가이드.md`: hướng dẫn A-Z về luồng vận hành Edge POS
- `06-Edge-POS-P0-P1-설계-보완-체크리스트.md`: checklist bổ sung thiết kế Edge POS
- `플랫폼 별 기능리스트/`: danh sách chức năng theo từng platform và ma trận coverage
- `DB설계/`: thư mục riêng cho toàn bộ thiết kế DB

### Quy tắc
- Tài liệu phải mô tả rõ cấu trúc mục tiêu và chuẩn vận hành, không chỉ mô tả mã hiện tại.
- Ưu tiên cập nhật tài liệu chuẩn duy nhất thay vì tạo thêm tài liệu trùng lặp.

### Được phép làm
- Tài liệu hóa cơ sở thiết kế, chuẩn vận hành và quy tắc migration.
- Đồng bộ tài liệu cùng với thay đổi trong mã.

### Không được làm
- Không để tồn tại nhiều tài liệu chuẩn mâu thuẫn nhau.
- Không giữ nguyên tài liệu khi mã đã vi phạm nguyên tắc đã được viết ra.
