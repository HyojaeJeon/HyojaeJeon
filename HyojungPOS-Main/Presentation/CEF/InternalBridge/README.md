# 내부 브릿지

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF/InternalBridge`

## 한국어

### 역할
- JS와 C++ 사이의 요청/응답 및 실시간 이벤트 입출구를 담당한다.

### 담당 범위
- PosRequestResponder, PosRealTimeSender, PosRequestActions

### 규칙
- 브릿지는 얇게 유지하고 실제 업무 실행은 UseCases로 넘긴다.
- 모든 메시지는 문서에 정의된 봉투 규격을 따른다.

### 해도 되는 것
- 요청 파싱, 필수 필드 검증, 응답 포맷 통일을 수행한다.
- 실시간 이벤트 송신의 단일 출구를 유지한다.

### 하면 안 되는 것
- Action에서 직접 SQL을 실행하지 않는다.
- Manager나 ExternalBridge가 PosRealTimeSender를 직접 호출하게 하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách lối vào/lối ra request-response và sự kiện realtime giữa JS và C++.

### Phạm vi phụ trách
- PosRequestResponder, PosRealTimeSender và PosRequestActions

### Quy tắc
- Giữ bridge mỏng và chuyển toàn bộ thực thi nghiệp vụ xuống UseCases.
- Mọi thông điệp phải tuân theo chuẩn envelope trong tài liệu.

### Được phép làm
- Phân tích request, kiểm tra field bắt buộc và chuẩn hóa response.
- Giữ một cổng phát sự kiện realtime duy nhất.

### Không được làm
- Không chạy SQL trực tiếp trong Action.
- Không cho phép Manager hay ExternalBridge gọi PosRealTimeSender trực tiếp.
