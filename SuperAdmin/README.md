# SuperAdmin

`경로`: `/SuperAdmin`

## 역할

- `Portal`, `CentralApi`, `SyncWorkers`를 묶는 공급사 운영 경계다.

## 고정 스택

- `Portal`: `Next.js(TypeScript) + Apollo Client`
- `CentralApi`: `NestJS + Fastify + Apollo Server + Prisma + Redis`
- `SyncWorkers`: `Node.js(TypeScript) + BullMQ + Redis`

## 반드시 지킬 규칙

- UI, API, Worker 책임을 섞지 않는다.
- 브랜드 운영과 EdgePos 로컬 업무를 여기서 직접 구현하지 않는다.
- 공통 계약은 `SharedContracts`만 사용한다.
- 번역 원본은 `SharedAssets/i18n/locales`만 사용한다.
- REST는 `CentralApi` 안에서만 허용한다.
