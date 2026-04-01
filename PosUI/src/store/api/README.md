# RTK Query API

`경로 / Đường dẫn`: `/PosUI/src/store/api`

## 한국어

### 역할
- RTK Query 기반 서버 상태 캐시와 endpoint 구성을 담당한다.

### 담당 범위
- posApi 루트, injectEndpoints, tag/invalidate/updateQueryData 정책

### 규칙
- RTK Query는 서버 상태의 원본 캐시이고 slice는 UI 상태만 가진다.
- posApi 하나를 루트로 두고 도메인별 endpoint 모듈이 injectEndpoints 한다.

### 해도 되는 것
- queryFn/baseQuery, tagTypes, endpoint 모듈, 훅 export를 정리한다.
- 실시간 이벤트와 연동할 cache invalidate/update 정책을 만든다.

### 하면 안 되는 것
- UI 전용 상태를 여기서 관리하지 않는다.
- 화면 파일에서 직접 데이터 중복 저장 흐름을 만들지 않는다.

## Tiếng Việt

### Vai trò
- Đây là vùng phụ trách cache server state và cấu hình endpoint dựa trên RTK Query.

### Phạm vi phụ trách
- Root posApi, injectEndpoints và chính sách tag/invalidate/updateQueryData

### Quy tắc
- RTK Query là cache gốc của server state; slice chỉ giữ UI state.
- Phải dùng một posApi gốc và injectEndpoints từ các module miền.

### Được phép làm
- Tổ chức queryFn/baseQuery, tagTypes, module endpoint và export hook.
- Thiết lập chính sách invalidate/update cache để liên kết với realtime event.

### Không được làm
- Không quản lý UI-only state trong vùng này.
- Không tạo luồng sao chép dữ liệu trùng lặp từ cache sang nơi khác.
