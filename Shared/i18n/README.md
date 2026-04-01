# 다국어

`경로 / Đường dẫn`: `/Shared/i18n`

## 한국어

### 역할
- 공용 다국어 자산을 묶는 상위 폴더다.

### 담당 범위
- locale 구조, 번역 원본, 공용 i18n 자산

### 규칙
- 번역 원본은 여기서 관리하고 소비자 폴더에는 복사본만 둔다.
- 언어별 구조와 네임스페이스 체계를 일관되게 유지한다.

### 해도 되는 것
- 다국어 자산 구조를 표준화한다.
- 번역 원본 관리 정책을 문서화한다.

### 하면 안 되는 것
- 런타임 복사본과 원본을 혼동하지 않는다.
- 코드 로직을 이 자산 폴더에 넣지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục cấp trên gom các tài sản đa ngôn ngữ dùng chung.

### Phạm vi phụ trách
- Cấu trúc locale, nguồn bản dịch và tài sản i18n dùng chung

### Quy tắc
- Nguồn bản dịch phải được quản lý tại đây, còn thư mục tiêu thụ chỉ giữ bản sao.
- Giữ nhất quán cấu trúc theo ngôn ngữ và namespace.

### Được phép làm
- Chuẩn hóa cấu trúc tài sản đa ngôn ngữ.
- Tài liệu hóa chính sách quản lý nguồn bản dịch.

### Không được làm
- Không nhầm lẫn giữa bản sao runtime và nguồn gốc.
- Không đặt logic code vào thư mục asset này.
