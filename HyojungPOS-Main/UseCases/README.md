# 유스케이스

`경로 / Đường dẫn`: `/HyojungPOS-Main/UseCases`

## 한국어

### 역할
- 요청 단위 작업을 조정하는 유스케이스 계층의 루트다.

### 담당 범위
- 트랜잭션, 멱등성, 작업 락, Manager 호출 순서, 커밋 후 후처리

### 규칙
- UI 이벤트 결정권과 PosRealTimeSender 호출 권한은 여기만 가진다.
- 업무 데이터 + Ledger + Outbox를 같은 작업 단위 안에서 다룬다.

### 해도 되는 것
- 여러 Manager와 인프라 저장소를 조합해 하나의 작업을 완결한다.
- 오프라인 허용 범위와 외부 승인형 거래 차단 여부를 결정한다.

### 하면 안 되는 것
- 화면 렌더링이나 CEF 세부 구현을 작성하지 않는다.
- Domain/Infrastructure를 우회해 임의로 상태를 확정하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc của tầng use case dùng để điều phối công việc theo từng request.

### Phạm vi phụ trách
- Transaction, idempotency, lock tác vụ, thứ tự gọi Manager và hậu xử lý sau commit

### Quy tắc
- Chỉ tầng này mới có quyền quyết định sự kiện UI và gọi PosRealTimeSender.
- Dữ liệu nghiệp vụ + Ledger + Outbox phải được xử lý trong cùng một đơn vị công việc.

### Được phép làm
- Phoi hop nhieu Manager va store/adaptor ha tang de hoan tat mot tac vu.
- Quyết định phạm vi cho phép khi offline và việc chặn giao dịch cần phê duyệt bên ngoài.

### Không được làm
- Không viết mã render UI hay chi tiết CEF ở đây.
- Không bypass Domain/Infrastructure để tự ý chốt trạng thái.
