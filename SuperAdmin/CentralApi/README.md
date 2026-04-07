# CentralApi

`경로`: `/SuperAdmin/CentralApi`

## 역할

- 중앙 인증, 권한, 멀티테넌시, 정책, 배포, 동기화 수신을 담당하는 중앙 백엔드다.

## 고정 스택

- `NestJS + Fastify + Apollo Server + Prisma + Redis`

## 반드시 지킬 규칙

- 기본 API 표면은 GraphQL이다.
- REST는 Fastify endpoint로만 예외적으로 추가한다.
- 모든 request/response/event 계약은 `SharedContracts`를 따른다.
- 멀티테넌트 스코프는 resolver가 아니라 서비스/쿼리 레이어에서 강제한다.
- Redis는 cache, lock, rate limit, queue handoff 용도로만 사용한다.
- DataLoader는 request-scoped batch loading에만 사용한다.
- 대량 조회는 cursor pagination을 우선한다.
- write 이후 cache invalidation 규칙을 명시적으로 유지한다.
- CentralApi는 EdgePos 로컬 거래 원본을 대체하지 않는다.
