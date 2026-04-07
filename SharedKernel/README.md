# SharedKernel

`경로 / Đường dẫn`: `/SharedKernel`

## 한국어

### 역할
- `BrandPosApp`의 C++ 네이티브 계층과 공용 빌드/관측/프로토콜 유틸을 담는 공통 기반 패키지다.
- 여러 C++ 프로젝트가 공통으로 쓰는 저수준 코어만 이곳에 둔다.

### 담당 범위
- 공통 타입, 결과 코드, 상태 표현, 문자열/파일/시간 유틸
- JSON 직렬화/역직렬화 보조, 로깅, 트레이싱, 관측성 헬퍼
- 브리지 프로토콜 인코딩/디코딩, CEF bootstrap 보조
- 장치 통신 공통 헤더, 빌드 지원, 테스트 fixture

### 규칙
- 도메인 업무 로직은 넣지 않는다.
- 특정 앱 전용 UI/화면 코드나 DB CRUD 코드는 넣지 않는다.
- `SharedContracts`가 정의한 TypeScript 계약과 충돌하지 않도록 네이밍과 메시지 형식을 맞춘다.

### 해도 되는 것
- C++ 전역 공통 함수와 헤더를 표준화한다.
- native host와 device bridge가 공유하는 최소 기능만 제공한다.
- 빌드/검증/observability 보조 코드를 유지한다.

### 하면 안 되는 것
- 주문, 결제, 테이블, 고객 같은 업무 기능을 구현하지 않는다.
- 화면 라우팅이나 React/Next.js UI 로직을 넣지 않는다.
- 중앙 API 호출이나 브랜드별 정책 분기를 여기서 직접 처리하지 않는다.

### 소비자
- `BrandPosApp` C++ Host
- `BrandPosApp` Setup/Maintenance native path
- device bridge / bootstrap / low-level utilities

## Tiếng Việt

### Vai trò
- Đây là gói nền tảng dùng chung cho tầng C++ native của `BrandPosApp` và các tiện ích build/observability/protocol dùng chung.
- Chỉ giữ các phần low-level mà nhiều project C++ cần dùng chung.

### Phạm vi phụ trách
- Kiểu dữ liệu chung, result code, trạng thái, tiện ích chuỗi/file/time
- Hỗ trợ serialize/deserialize JSON, logging, tracing, observability
- Mã hóa/giải mã bridge protocol, hỗ trợ CEF bootstrap
- Header giao tiếp thiết bị, hỗ trợ build, fixture test

### Quy tắc
- Không chứa business logic theo domain.
- Không chứa code UI/route hoặc code CRUD DB riêng của một app.
- Tên và format message phải tương thích với contract TypeScript do `SharedContracts` định nghĩa.

### Được phép làm
- Chuẩn hóa các hàm và header C++ dùng chung.
- Cung cấp đúng phần tối thiểu cho native host và device bridge cùng dùng.
- Duy trì mã hỗ trợ build, validation và observability.

### Không được làm
- Không triển khai nghiệp vụ order, payment, table, customer.
- Không đưa vào logic routing giao diện hoặc React/Next.js.
- Không xử lý trực tiếp API trung tâm hay phân nhánh policy theo brand tại đây.

### Người tiêu thụ
- C++ Host của `BrandPosApp`
- Native path cho Setup/Maintenance của `BrandPosApp`
- device bridge / bootstrap / tiện ích low-level
