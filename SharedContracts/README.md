# SharedContracts

`경로 / Đường dẫn`: `/SharedContracts`

## 한국어

### 역할
- 모든 TypeScript 앱이 함께 쓰는 공용 계약 패키지다.
- UI, API, Worker, Edge 간에 주고받는 데이터 형식의 단일 원본 역할을 한다.

### 담당 범위
- DTO, 요청/응답 envelope, enum, event payload
- GraphQL input/output 타입, validation schema, pagination type
- tenant/brand/branch/edgePos 식별자 타입, error code, locale key
- `ApiSdk/` 하위 패키지로 Portal/Edge가 재사용할 GraphQL operation/typed SDK를 제공할 수 있다.

### 규칙
- React 컴포넌트, DB 구현, C++ 코드, 서버 비즈니스 로직은 넣지 않는다.
- 계약 변경은 반드시 버전과 호환성 규칙을 따라야 한다.
- 계약은 가능한 한 한 곳에서 정의하고, 여러 앱이 복사본이 아니라 동일한 타입 원본을 보게 한다.

### 해도 되는 것
- `BrandAdminPortal`, `RegionalDistributorPortal`, `SuperAdmin/Portal`, `SuperAdmin/CentralApi`, `SuperAdmin/SyncWorkers`, `BrandPosApp`의 TS 레이어가 공유할 타입을 정리한다.
- 공통 요청 키, 응답 키, 에러 코드, 권한 범위, 지역/언어 식별자를 표준화한다.
- GraphQL schema 타입과 runtime validation 스키마를 함께 정리한다.
- `@platform/api-sdk`처럼 공통 operation/document/typed client 패키지를 이 내부에 둔다.

### 하면 안 되는 것
- 화면 UI 상태나 렌더링 로직을 넣지 않는다.
- DB migration이나 repository 구현을 넣지 않는다.
- 앱별 임시 타입을 여기저기 복제해서 사실상 다른 계약을 만들지 않는다.

### 소비자
- `BrandAdminPortal`
- `RegionalDistributorPortal`
- `SuperAdmin/Portal`
- `SuperAdmin/CentralApi`
- `SuperAdmin/SyncWorkers`
- `BrandPosApp`의 TypeScript 브리지/UI 계층

## Tiếng Việt

### Vai trò
- Đây là gói contract dùng chung cho toàn bộ app TypeScript.
- Đóng vai trò là nguồn sự thật duy nhất cho định dạng dữ liệu trao đổi giữa UI, API, Worker và Edge.

### Phạm vi phụ trách
- DTO, envelope request/response, enum, event payload
- GraphQL input/output type, validation schema, pagination type
- type định danh tenant/brand/branch/edgePos, error code, locale key
- Có thể cung cấp package con `ApiSdk/` để Portal/Edge tái sử dụng operation GraphQL và SDK typed.

### Quy tắc
- Không chứa React component, DB implementation, code C++ hoặc business logic server.
- Mọi thay đổi contract phải đi theo version và quy tắc tương thích.
- Contract phải được định nghĩa tập trung ở một nơi để các app dùng cùng một nguồn type.

### Được phép làm
- Chuẩn hóa type dùng chung cho `BrandAdminPortal`, `RegionalDistributorPortal`, `SuperAdmin/Portal`, `SuperAdmin/CentralApi`, `SuperAdmin/SyncWorkers` và lớp TS của `BrandPosApp`.
- Chuẩn hóa request key, response key, error code, scope quyền, định danh vùng/ngôn ngữ.
- Tổ chức đồng thời GraphQL schema type và validation schema runtime.
- Đặt package client typed dùng chung như `@platform/api-sdk` trong cây thư mục này.

### Không được làm
- Không đưa state UI hoặc logic render vào đây.
- Không đưa migration DB hay repository implementation vào đây.
- Không sao chép type cục bộ cho từng app theo cách tạo ra contract khác nhau.

### Người tiêu thụ
- `BrandAdminPortal`
- `RegionalDistributorPortal`
- `SuperAdmin/Portal`
- `SuperAdmin/CentralApi`
- `SuperAdmin/SyncWorkers`
- lớp TypeScript bridge/UI của `BrandPosApp`
