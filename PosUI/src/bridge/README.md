# 브릿지

`경로 / Đường dẫn`: `/PosUI/src/bridge`

## 한국어

### 역할
- PosUI와 C++ 사이의 저수준 transport 입구를 담당한다.

### 담당 범위
- PosRequestSender, mock/CEF 분기, 공통 요청 봉투 구성

### 규칙
- 컴포넌트는 window.cefQuery를 직접 호출하지 않는다.
- 이 계층은 transport를 제공할 뿐 상태 원본을 소유하지 않는다.

### 해도 되는 것
- 공통 request envelope 생성과 환경 감지를 구현한다.
- RTK Query baseQuery/queryFn이 재사용할 transport를 제공한다.

### 하면 안 되는 것
- 도메인 캐시 정책을 여기서 구현하지 않는다.
- 화면 전용 UI 상태를 브릿지에 저장하지 않는다.

## Tiếng Việt

### Vai trò
- Đây là lối vào transport mức thấp giữa PosUI và C++.

### Phạm vi phụ trách
- PosRequestSender, chuyển nhánh mock/CEF và cấu trúc envelope chung

### Quy tắc
- Component không được gọi window.cefQuery trực tiếp.
- Tầng này chỉ cung cấp transport, không sở hữu nguồn trạng thái.

### Được phép làm
- Triển khai tạo request envelope chung và nhận biết môi trường.
- Cung cấp transport để RTK Query baseQuery/queryFn tái sử dụng.

### Không được làm
- Không triển khai chính sách cache miền tại đây.
- Không lưu UI state riêng của màn hình trong bridge.
