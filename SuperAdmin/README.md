# SuperAdmin

`경로`: `/SuperAdmin`

## 역할

- `Portal`, `CentralApi`, `SyncWorkers`를 묶는 공급사 운영 suite 경계다.
- `Portal`은 독립 Next.js 웹 앱이고 `CentralApi`의 하위 구현이 아니다.
- `CentralApi`는 서버, `SyncWorkers`는 백그라운드 워커다.

## 구조

```text
SuperAdmin/
├── Portal/       # Web app
├── CentralApi/   # Backend API
└── SyncWorkers/  # Worker
```

## 고정 스택

- `Portal`: `Next.js(TypeScript) + Apollo Client`
- `Portal` 의 공용 UI 는 `SharedUI` 를 소비한다.
- `CentralApi`: `NestJS + Fastify + Apollo Server + Prisma + Redis`
- `SyncWorkers`: `Node.js(TypeScript) + BullMQ + Redis`

## 반드시 지킬 규칙

- UI, API, Worker 책임을 섞지 않는다.
- 브랜드 운영과 EdgePos 로컬 업무를 여기서 직접 구현하지 않는다.
- 공통 계약은 `SharedContracts`만 사용한다.
- 번역 원본은 각 프로젝트 내부 i18n만 사용한다. `SharedAssets`는 번역 원본을 두지 않는다.
- REST는 `CentralApi` 안에서만 허용한다.
