# 슬라이스

`경로 / Đường dẫn`: `/PosUI/src/store/slices`

## 한국어

### 역할
- 브라우저 메모리 안의 UI/클라이언트 상태를 관리하는 slice 영역이다.

### 담당 범위
- isProcessing, modal, overlay, 탭, 임시 입력 상태

### 규칙
- slice에는 UI 상태만 두고 서버 조회 데이터는 넣지 않는다.
- RTK Query 결과를 extraReducers로 다시 복사하지 않는다.

### 해도 되는 것
- 화면 잠금, 토스트, 모달, 선택 상태 같은 UI 상태를 관리한다.
- 전역 상호작용 상태를 일관된 구조로 유지한다.

### 하면 안 되는 것
- 테이블 목록, 주문 상세 같은 서버 상태를 저장하지 않는다.
- RTK Query 캐시와 중복 원본을 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng slice dùng để quản lý UI/client state trong bộ nhớ trình duyệt.

### Phạm vi phụ trách
- isProcessing, modal, overlay, tab và trạng thái nhập tạm thời

### Quy tắc
- Chỉ đặt UI state vào slice; không đặt dữ liệu truy vấn từ server/local DB.
- Không sao chép kết quả RTK Query bằng extraReducers.

### Được phép làm
- Quản lý khóa màn hình, toast, modal và trạng thái chọn của giao diện.
- Giữ cấu trúc nhất quán cho trạng thái tương tác toàn cục.

### Không được làm
- Không lưu danh sách bàn hay chi tiết đơn hàng tại đây.
- Không tạo thêm nguồn dữ liệu trùng với cache RTK Query.
