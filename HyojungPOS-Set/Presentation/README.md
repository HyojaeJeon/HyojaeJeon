# 표현 계층

`경로 / Đường dẫn`: `/HyojungPOS-Set/Presentation`

## 한국어

### 역할
- UI 표현과 브라우저/레거시 화면 호스팅을 담당하는 계층이다.

### 담당 범위
- CEF, InternalBridge, LegacyDlg, LegacyUiCommon

### 규칙
- 표현 계층은 입력과 출력 형식을 담당하고, 업무 결정은 UseCases로 넘긴다.
- 화면 표현과 브릿지 책임을 분리한다.

### 해도 되는 것
- 브라우저 호스팅, 화면 전환, 입력 라우팅 구조를 정리한다.
- 레거시 화면을 점진 전환 가능한 상태로 유지한다.

### 하면 안 되는 것
- 트랜잭션, 멱등성, DB 영속화 판단을 여기서 하지 않는다.
- 여러 Manager를 직접 조합해 오케스트레이션하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là tầng trình bày phụ trách UI và việc host trình duyệt/màn hình legacy.

### Phạm vi phụ trách
- CEF, InternalBridge, LegacyDlg và LegacyUiCommon

### Quy tắc
- Tầng trình bày xử lý hình thức vào/ra, còn quyết định nghiệp vụ phải chuyển xuống UseCases.
- Tách biệt trách nhiệm hiển thị màn hình và trách nhiệm bridge.

### Được phép làm
- Tổ chức hosting trình duyệt, chuyển màn hình và định tuyến input.
- Giữ màn hình legacy ở trạng thái có thể migrate dần.

### Không được làm
- Không xử lý transaction, idempotency hay quyết định lưu DB tại đây.
- Không tự phối hợp nhiều Manager để điều phối nghiệp vụ.
