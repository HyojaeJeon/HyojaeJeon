# SharedKernel

`경로`: `/SharedKernel`
상위 규칙: `../CLAUDE.md`

## 역할
- BrandPosApp의 C++ 네이티브 계층과 공용 빌드/관측/프로토콜 유틸의 저수준 기반이다.

## 구현 규칙
- 공통 타입, 상태 표현, JSON 직렬화, 로깅, 트레이싱, bridge protocol, CEF bootstrap, device helper, build/test support만 둔다.
- 도메인 업무 로직, UI, DB CRUD는 넣지 않는다.
- `SharedContracts`가 정의한 TS 계약과 메시지 형식을 맞춘다.
- native host / device bridge / low-level utilities가 소비하는 최소 기능만 유지한다.
