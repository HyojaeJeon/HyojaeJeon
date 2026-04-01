# 결제

`경로 / Đường dẫn`: `/HyojungPOS-Main/UseCases/Payment`

## 한국어

### 역할
- 결제 관련 요청을 하나의 작업 단위로 실행하는 유스케이스 영역이다.

### 담당 범위
- 결제 요청의 트랜잭션, 멱등성, 락, Manager 호출 순서, 후처리

### 규칙
- 한 유스케이스는 하나의 비즈니스 작업 단위를 명확히 책임진다.
- 커밋 후 UI 이벤트/ACK/인쇄 같은 후처리를 분리한다.

### 해도 되는 것
- 도메인 Manager와 저장소를 조합해 작업 흐름을 구성한다.
- idempotencyKey와 requestId 기준으로 중복 실행을 방지한다.

### 하면 안 되는 것
- Action 역할이나 화면 코드를 여기 섞지 않는다.
- 외부 승인형 거래를 온라인 복구 후 자동 재실행하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng use case thực thi request liên quan đến thanh toán theo một đơn vị công việc hoàn chỉnh.

### Phạm vi phụ trách
- Transaction, idempotency, lock, thứ tự gọi Manager và hậu xử lý cho request thanh toán

### Quy tắc
- Mỗi use case phải chịu trách nhiệm rõ ràng cho một đơn vị công việc nghiệp vụ.
- Tách riêng hậu xử lý như sự kiện UI/ACK/in ấn sau khi commit.

### Được phép làm
- Phối hợp Domain Manager và repository để tạo luồng thực thi.
- Ngăn chạy trùng theo idempotencyKey và requestId.

### Không được làm
- Không trộn vai trò Action hay mã màn hình vào đây.
- Không tự động chạy lại giao dịch cần phê duyệt realtime sau khi mạng phục hồi.
