# CEF 핸들러

`경로 / Đường dẫn`: `/HyojungPOS-Main/Presentation/CEF/Handlers`

## 한국어

### 역할
- CEF 수명주기, 브라우저 호스팅, 스킴 매핑, crash recovery를 처리한다.

### 담당 범위
- AppHandler, BrowserDlg, SchemeHandler, BrowserRecoveryManager

### 규칙
- 핸들러는 브라우저 동작과 복구를 책임지고, 업무 규칙은 다루지 않는다.
- 화면 복구는 브라우저 메모리가 아니라 DB/UseCase bootstrap 기준으로 한다.

### 해도 되는 것
- 브라우저 생성/파괴/복구와 스킴 처리 로직을 정리한다.
- renderer crash 감지와 fallback 연계를 구현한다.

### 하면 안 되는 것
- 주문/결제 데이터 조작을 이 계층에서 직접 수행하지 않는다.
- 사용자 화면 상태를 메모리 snapshot만으로 복구하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này xử lý vòng đời CEF, host trình duyệt, mapping scheme và crash recovery.

### Phạm vi phụ trách
- AppHandler, BrowserDlg, SchemeHandler và BrowserRecoveryManager

### Quy tắc
- Handler chỉ phụ trách hành vi trình duyệt và phục hồi, không xử lý quy tắc nghiệp vụ.
- Phục hồi màn hình phải dựa trên DB/UseCase bootstrap, không dựa vào bộ nhớ trình duyệt.

### Được phép làm
- Tổ chức logic tạo/hủy/phục hồi browser và xử lý scheme.
- Triển khai phát hiện renderer crash và liên kết fallback.

### Không được làm
- Không trực tiếp thay đổi dữ liệu đơn hàng/thanh toán ở tầng này.
- Không phục hồi trạng thái màn hình chỉ bằng snapshot trong bộ nhớ.
