# 카드 리더기

`경로 / Đường dẫn`: `/HyojungPOS-Main/Infrastructure/Device/CardReader`

## 한국어

### 역할
- 카드 리더기 장치 연동 구현을 담당한다.

### 담당 범위
- 카드 리더기 장치 제어, 상태 감지, 오류 코드 변환

### 규칙
- 장치 에러는 문서의 DEVICE_ERROR 규격으로 변환한다.
- 장치 제어는 기술 구현이고 업무 성공 최종 판정은 UseCases가 한다.

### 해도 되는 것
- 장치 어댑터, 상태 확인, 오류 코드 표준화 로직을 작성한다.
- 복구 가능 여부와 재시도 가능 여부를 구조화된 값으로 제공한다.

### 하면 안 되는 것
- 한국어/베트남어 완성 문장을 하드코딩된 원본 메시지로 취급하지 않는다.
- 장치 계층에서 화면 모달을 직접 띄우지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách triển khai tích hợp thiết bị đầu đọc thẻ.

### Phạm vi phụ trách
- Điều khiển thiết bị đầu đọc thẻ, phát hiện trạng thái và chuyển đổi mã lỗi

### Quy tắc
- Lỗi thiết bị phải được chuẩn hóa theo định dạng DEVICE_ERROR trong tài liệu.
- Điều khiển thiết bị là triển khai kỹ thuật; quyết định nghiệp vụ cuối cùng thuộc về UseCases.

### Được phép làm
- Viết adapter thiết bị, kiểm tra trạng thái và chuẩn hóa mã lỗi.
- Cung cấp cờ recoverable/retryable ở dạng có cấu trúc.

### Không được làm
- Không coi câu tiếng Hàn/tiếng Việt hardcode là nguồn message gốc.
- Không tự bật modal màn hình trực tiếp từ tầng thiết bị.
