# CEF

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF`

## 한국어

### 역할
- POS 내 브라우저 엔진과 CEF 관련 런타임 구성을 담당한다.

### 담당 범위
- SDK, Subprocess, Handlers, InternalBridge

### 규칙
- 단일 CefBrowser 전략과 crash recovery 규칙을 따른다.
- CEF는 UI 엔진이지 업무 규칙 저장소가 아니다.

### 해도 되는 것
- 브라우저 초기화, 스킴 매핑, 프로세스 복구, 스레드 전환을 구현한다.
- UI와 C++ 사이 통신 입출구를 명확히 유지한다.

### 하면 안 되는 것
- 결제/주문 비즈니스 규칙을 CEF 폴더에 숨겨 넣지 않는다.
- 브라우저 메모리를 업무 복구의 원본으로 취급하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng phụ trách engine trình duyệt trong POS và cấu hình runtime của CEF.

### Phạm vi phụ trách
- SDK, Subprocess, Handlers và InternalBridge

### Quy tắc
- Tuân thủ chiến lược một CefBrowser và quy tắc crash recovery.
- CEF là UI engine, không phải nơi chứa quy tắc nghiệp vụ.

### Được phép làm
- Triển khai khởi tạo trình duyệt, mapping scheme, phục hồi tiến trình và chuyển luồng.
- Giữ rõ ràng lối vào/lối ra giao tiếp giữa UI và C++.

### Không được làm
- Không giấu logic nghiệp vụ thanh toán/đơn hàng trong thư mục CEF.
- Không coi bộ nhớ trình duyệt là nguồn gốc để phục hồi giao dịch.
