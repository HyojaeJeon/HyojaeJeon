# 인프라

`경로 / Đường dẫn`: `/HyojungPOS-Set/Infrastructure`

## 한국어

### 역할
- 영속 저장소, 외부 연동, 장치, 동기화, 관측성 같은 기술 구현을 담는 인프라 계층의 루트다.

### 담당 범위
- Persistence, Sync, ExternalBridge, Device, Network, Observability, LegacySupport

### 규칙
- 인프라는 기술 구현을 담당하고 비즈니스 최종 결정은 하지 않는다.
- 중앙 서버 sync 재전송과 실시간 외부 승인 재실행을 혼동하지 않는다.

### 해도 되는 것
- DB 연결, 저장소, 동기화 워커, 외부 어댑터, 로깅을 구현한다.
- UseCases가 사용할 기술 어댑터와 저장소를 제공한다.

### 하면 안 되는 것
- 업무 성공 여부를 임의로 판정하지 않는다.
- UI 상태나 화면 흐름을 직접 결정하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc của tầng hạ tầng, chứa phần triển khai kỹ thuật như persistence, tích hợp ngoài, thiết bị, sync và observability.

### Phạm vi phụ trách
- Persistence, Sync, ExternalBridge, Device, Network, Observability và LegacySupport

### Quy tắc
- Hạ tầng chỉ phụ trách triển khai kỹ thuật, không đưa ra quyết định nghiệp vụ cuối cùng.
- Không được nhầm giữa retransmit sync lên máy chủ trung tâm với việc chạy lại giao dịch realtime cần phê duyệt bên ngoài.

### Được phép làm
- Triển khai kết nối DB, repository, sync worker, adapter ngoài và logging.
- Cung cấp repository/adapter kỹ thuật để UseCases sử dụng.

### Không được làm
- Không tự ý quyết định giao dịch đã thành công hay chưa.
- Không quyết định trực tiếp trạng thái UI hoặc luồng màn hình.
