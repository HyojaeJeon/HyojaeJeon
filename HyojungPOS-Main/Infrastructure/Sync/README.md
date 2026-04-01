# 동기화

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/Sync`

## 한국어

### 역할
- 중앙 서버 동기화와 backlog 재전송을 담당하는 워커 영역이다.

### 담당 범위
- ConnectivityService, OutboxDispatcher, SyncWorker, SyncStateRepository

### 규칙
- 동기화 성공과 로컬 거래 성공을 분리해서 다룬다.
- 온라인 복구 시에는 중앙 서버 sync 대상 backlog만 재전송한다.

### 해도 되는 것
- 연결 상태 계산, backlog drain, retry/backoff 정책을 구현한다.
- sync 상태와 backlog count를 운영 관측 가능하게 유지한다.

### 하면 안 되는 것
- 외부 승인형 결제를 온라인 복구 후 자동 재실행하지 않는다.
- 모든 backlog를 무제한 병렬 전송하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng worker phụ trách đồng bộ với máy chủ trung tâm và retransmit backlog.

### Phạm vi phụ trách
- ConnectivityService, OutboxDispatcher, SyncWorker và SyncStateRepository

### Quy tắc
- Phải tách biệt thành công sync với thành công giao dịch cục bộ.
- Khi mạng phục hồi chỉ retransmit backlog dành cho sync máy chủ trung tâm.

### Được phép làm
- Triển khai tính toán kết nối, drain backlog và chính sách retry/backoff.
- Giữ khả năng quan sát trạng thái sync và backlog count.

### Không được làm
- Không tự động chạy lại thanh toán cần phê duyệt ngoài sau khi online trở lại.
- Không gửi song song vô hạn mọi backlog đang tồn đọng.
