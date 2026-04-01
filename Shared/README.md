# 공용 자산

`경로 / Đường dẫn`: `/Shared`

## 한국어

### 역할
- Main/Set이 함께 사용하는 런타임 자산의 루트다.

### 담당 범위
- i18n 원본, 공용 JSON, 공용 정적 자산

### 규칙
- 런타임 자산만 두고 비즈니스 코드나 UI 로직은 두지 않는다.
- 공용 자산의 진실의 원천은 Shared 아래에서 관리한다.

### 해도 되는 것
- 번역 원본과 공용 정적 자산을 한곳에 정리한다.
- Main/Set이 함께 소비할 자산 구조를 표준화한다.

### 하면 안 되는 것
- 복사본을 원본처럼 여러 곳에서 병행 수정하지 않는다.
- 코드 구현체를 런타임 자산 폴더에 섞지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc của các tài sản runtime dùng chung cho Main/Set.

### Phạm vi phụ trách
- Nguồn i18n, JSON dùng chung và tài sản tĩnh dùng chung

### Quy tắc
- Chỉ đặt tài sản runtime, không đặt business code hoặc UI logic.
- Nguồn sự thật của tài sản dùng chung phải được quản lý tập trung dưới Shared.

### Được phép làm
- Tập trung bản dịch gốc và tài sản tĩnh dùng chung tại một nơi.
- Chuẩn hóa cấu trúc asset để Main/Set cùng tiêu thụ.

### Không được làm
- Không sửa song song nhiều bản sao như thể đều là nguồn gốc.
- Không trộn implementation code vào thư mục asset runtime.
