# 멱등성

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/Persistence/Idempotency`

## 한국어

### 역할
- 멱등성 Ledger와 Outbox 저장소를 구현하는 영속 영역이다.

### 담당 범위
- RequestLedgerRepository, OutboxRepository, 중복 처리 상태 영속화

### 규칙
- requestId와 idempotencyKey를 기준으로 영속 중복 방지를 보장한다.
- Outbox는 중앙 서버 sync용이며 외부 승인형 거래 재실행 큐가 아니다.

### 해도 되는 것
- Ledger 상태와 Outbox 상태 저장소를 구현한다.
- 중복 요청 재실행 대신 기존 결과 재사용 기반을 제공한다.

### 하면 안 되는 것
- 카드/QR/배달 실시간 거래를 오프라인 backlog로 취급하지 않는다.
- 메모리 플래그만으로 운영 중복 방지를 끝냈다고 간주하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng persistence triển khai Ledger idempotency và repository Outbox.

### Phạm vi phụ trách
- RequestLedgerRepository, OutboxRepository và lưu trạng thái chống trùng

### Quy tắc
- Bảo đảm chống trùng ở mức lưu trữ theo requestId và idempotencyKey.
- Outbox chỉ dùng cho sync lên máy chủ trung tâm, không phải hàng đợi chạy lại giao dịch cần phê duyệt realtime.

### Được phép làm
- Triển khai repository cho trạng thái Ledger và Outbox.
- Cung cấp nền tảng tái sử dụng kết quả cũ thay vì chạy trùng request.

### Không được làm
- Không coi giao dịch thẻ/QR/giao hàng realtime là backlog offline.
- Không xem cờ trong bộ nhớ là đủ cho chống trùng khi vận hành.
