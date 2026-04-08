PosUi 내부 bridge / domain 계약 (TypeScript) 단일 원본.

이 폴더는 EdgePos 로컬 bridge command (C++ ↔ PosUi) 의 Request / Response / Entity 타입을 정의한다.
중앙 GraphQL API 계약은 `SharedContracts/ApiSdk` 에 둔다 (별도).

규칙:
- 도메인별로 분리한다 (`auth/`, `order/`, `payment/` 등).
- enum 문자열은 `UPPER_SNAKE_CASE`.
- 화면 컴포넌트, fixture, RTK Query endpoint 는 모두 이 폴더의 타입을 import 해야 한다.
- 화면 파일에 ad-hoc 타입을 두지 않는다.
