# 관측성

`경로 / Đường dẫn`: `/SharedCpp/Observability`

## 한국어

### 역할
- 운영 로그, 크래시, 추적성 데이터를 관리하는 관측성 영역이다.

### 담당 범위
- Logger, CrashReporter, requestId 체인, 운영 로그 출력

### 규칙
- 모든 주요 요청은 requestId 체인으로 추적 가능해야 한다.
- 업무 로그와 브릿지/장치/크래시 로그를 구분한다.

### 해도 되는 것
- 로그 포맷, 크래시 기록, 운영 추적 기준을 정리한다.
- 동기화/결제/장치 오류를 운영자가 추적 가능하게 만든다.

### 하면 안 되는 것
- 민감 정보 노출 로그를 남기지 않는다.
- 중요 오류를 requestId 없이 기록하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng observability dùng để quản lý log vận hành, crash và dữ liệu truy vết.

### Phạm vi phụ trách
- Logger, CrashReporter, chuỗi requestId và đầu ra log vận hành

### Quy tắc
- Mọi request quan trọng phải truy vết được bằng chuỗi requestId.
- Phải tách log nghiệp vụ với log bridge/thiết bị/crash.

### Được phép làm
- Chuẩn hóa format log, ghi nhận crash và tiêu chuẩn quan sát vận hành.
- Giúp operator theo dõi được lỗi sync/thanh toán/thiết bị.

### Không được làm
- Không ghi log làm lộ thông tin nhạy cảm.
- Không lưu lỗi quan trọng mà thiếu requestId.
