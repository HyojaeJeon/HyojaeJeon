# hooks

`경로 / Đường dẫn`: `/PosUI/src/screens/PaymentScreen/hooks`

## 한국어

### 역할
- hooks 화면의 실제 UI 구현을 담당한다.

### 담당 범위
- hooks 화면 진입점, UI 훅, 전용 컴포넌트, 상수

### 규칙
- screens 폴더 안에는 UI와 화면 조합 로직만 둔다.
- 데이터 통신은 store/api와 bridge transport를 통해서만 수행한다.

### 해도 되는 것
- 디자인 시스템과 shared UI를 조합해 실제 화면을 구현한다.
- UI 훅, 포커스 처리, 레이아웃, 상호작용 상태를 정리한다.

### 하면 안 되는 것
- 화면 컴포넌트에서 window.cefQuery를 직접 호출하지 않는다.
- RTK Query 결과를 slice로 다시 복사 저장하지 않는다.

## Tiếng Việt

### Vai trò
- Thư mục này phụ trách UI thực tế của màn hình hooks.

### Phạm vi phụ trách
- Entry point, hook UI, component riêng và hằng số cho màn hình hooks

### Quy tắc
- Bên trong screens chỉ được đặt UI và logic ghép màn hình.
- Trao đổi dữ liệu chỉ được thực hiện qua store/api và bridge transport.

### Được phép làm
- Kết hợp design-system và shared UI để tạo màn hình thật.
- Tổ chức hook UI, xử lý focus, layout và trạng thái tương tác.

### Không được làm
- Không gọi window.cefQuery trực tiếp từ component màn hình.
- Không sao chép dữ liệu RTK Query sang slice để lưu lại lần nữa.
