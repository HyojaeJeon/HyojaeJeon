# 스토어

`경로 / Đường dẫn`: `/PosUI/src/store`

## 한국어

### 역할
- Redux Toolkit과 RTK Query를 조합하는 프론트엔드 상태 관리 루트다.

### 담당 범위
- store 생성, reducer 조합, middleware, api/slices 연결

### 규칙
- 서버 상태와 UI 상태의 소유권을 명확히 분리한다.
- RTK Query 단일화를 유지하고 React Query를 병행 사용하지 않는다.

### 해도 되는 것
- store 구성, middleware, API slice 연결을 정리한다.
- RTK Query와 client slice 경계를 문서화한다.

### 하면 안 되는 것
- 네트워크 조회 데이터를 무분별하게 slice로 복사하지 않는다.
- 상태 관리 규칙을 화면마다 제각각 다르게 두지 않는다.

## Tiếng Việt

### Vai trò
- Đây là thư mục gốc quản lý trạng thái frontend bằng Redux Toolkit và RTK Query.

### Phạm vi phụ trách
- Tạo store, ghép reducer, middleware và kết nối api/slices

### Quy tắc
- Tách rõ quyền sở hữu giữa server state và UI state.
- Giữ nguyên chiến lược chỉ dùng RTK Query, không dùng song song React Query.

### Được phép làm
- Tổ chức store, middleware và kết nối API slice.
- Tài liệu hóa ranh giới giữa RTK Query và client slice.

### Không được làm
- Không sao chép tràn lan dữ liệu truy vấn vào slice.
- Không để mỗi màn hình dùng quy tắc state management khác nhau.
