# 외부 연동

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/ExternalBridge`

## 한국어

### 역할
- 외부 시스템 payload를 내부 DTO로 변환하고 UseCases로 전달하는 인프라 영역이다.

### 담당 범위
- 배달/MQTT/결제사/외부 API 어댑터와 포맷 변환

### 규칙
- ExternalBridge는 전달자이며 직접 DB 저장이나 UI 송신을 하지 않는다.
- 외부 requestId가 없으면 수신 시 이벤트용 requestId를 생성한다.

### 해도 되는 것
- 외부 인증/서명/포맷 검증과 DTO 변환을 수행한다.
- 파싱한 이벤트를 적절한 UseCase로 위임한다.

### 하면 안 되는 것
- 직접 SQL INSERT/UPDATE를 수행하지 않는다.
- PosRealTimeSender나 화면 상태를 직접 제어하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng hạ tầng dùng để chuyển payload từ hệ thống bên ngoài sang DTO nội bộ và chuyển tiếp vào UseCases.

### Phạm vi phụ trách
- Adapter cho giao hàng/MQTT/cổng thanh toán/API ngoài và chuyển đổi format

### Quy tắc
- ExternalBridge chỉ là tầng chuyển tiếp, không được lưu DB hay gửi UI trực tiếp.
- Nếu sự kiện ngoài không có requestId thì phải tạo requestId mới tại thời điểm nhận.

### Được phép làm
- Thực hiện xác thực/chữ ký/kiểm tra format và chuyển sang DTO nội bộ.
- Ủy quyền sự kiện đã parse vào UseCase phù hợp.

### Không được làm
- Không trực tiếp chạy SQL INSERT/UPDATE.
- Không điều khiển trực tiếp PosRealTimeSender hay trạng thái màn hình.
