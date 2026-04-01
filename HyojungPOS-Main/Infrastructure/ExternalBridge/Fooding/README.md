# Fooding

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/ExternalBridge/Fooding`

## 한국어

### 역할
- Fooding 외부 연동의 수신/발행/연결 관리 구현을 담당한다.

### 담당 범위
- MQTT 연결, 발행, 수신 핸들링, 이벤트 훅

### 규칙
- Fooding 이벤트는 파싱 후 UseCases로 넘기고 직접 UI/DB를 건드리지 않는다.
- 수신 이벤트에도 requestId 추적 체인을 유지한다.

### 해도 되는 것
- 연결 상태 관리, MQTT publish/consume, payload 검증을 구현한다.
- 내부 DTO 변환과 이벤트 위임을 수행한다.

### 하면 안 되는 것
- 주문 영속화나 UI 갱신을 여기서 직접 하지 않는다.
- 외부 payload를 검증 없이 그대로 내부에 흘리지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách kết nối, nhận và phát sự kiện của tích hợp Fooding.

### Phạm vi phụ trách
- Kết nối MQTT, publish, xử lý incoming và event hook

### Quy tắc
- Sau khi parse, sự kiện Fooding phải được chuyển vào UseCases; không chạm trực tiếp DB/UI.
- Phải giữ chuỗi theo dõi requestId cho cả sự kiện nhận vào.

### Được phép làm
- Triển khai quản lý kết nối, publish/consume MQTT và kiểm tra payload.
- Chuyển đổi DTO nội bộ và ủy quyền sự kiện.

### Không được làm
- Không trực tiếp lưu đơn hàng hay cập nhật UI ở đây.
- Không đưa payload ngoài vào hệ thống nội bộ khi chưa kiểm tra.
