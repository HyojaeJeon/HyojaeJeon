# SuperAdmin Portal

Platform 공급사 운영 콘솔. `01-SuperAdmin-기능리스트.md` 를 단일 진실로 삼아
테넌트 · 배포 · 거버넌스 · 운영 · 감사 를 한 화면에서 통제한다.

## 스택

- **Next.js 16 App Router** (React 19, React Compiler v1)
- **Apollo Client 3** — CentralApi GraphQL 소비 (HTTP + graphql-ws subscriptions)
- **Redux Toolkit** — UI 상태 전용 (서버 상태는 Apollo 캐시가 원본)
- **Tailwind CSS v4** — CSS 커스텀 프로퍼티 기반 light/dark 토큰
- **next-themes** — light 기본 + 다크 토글
- **@platform/shared-ui** — Foundation/Primitives/Composites/Templates (단일 진실)
- **로컬 i18n** — ko / vi / en 3종 (프로젝트 내부 원본)
- **GraphQL Code Generator** — `codegen.ts` 로 CentralApi schema 자동 타입 생성

## 디렉토리

```
src/
├── app/           # Next.js App Router (얇은 라우트 → screens import)
├── screens/       # 화면 단위 (PosUi 패턴: screen ID 1:1, 코드 스플릿팅)
├── shared/        # Portal 전용 chrome
│   ├── layout/    # AppShell / NavigationRail / TopBar / nav-items
│   ├── hooks/
│   └── utils/     # cn, format
├── providers/     # ApolloProvider, ReduxProvider, I18nProvider, ThemeProvider
├── store/         # Redux Toolkit slices (ui, auth)
├── graphql/       # Apollo client, queries, (codegen output)
├── i18n/          # ko / vi / en locales + I18nProvider
├── rbac/          # 39 permission key + PermissionGuard + useHasPermission
└── styles/        # globals.css (OKLCH design tokens + light/dark)
```

## 디자인 방향

"Operator Command Deck" — 데이터 밀집형 엔터프라이즈 콘솔. 좌측 NavigationRail +
상단 TopBar + contextual content. Tabular nums (JetBrains Mono) + Inter 본문.
Light 기본 + next-themes 다크 토글. OKLCH color system.

## 재사용 UI 원본 위치

CLAUDE.md 규칙에 따라 재사용 UI 는 `@platform/shared-ui` (SharedUI 패키지) 에만
둔다. Portal 의 `src/shared/` 는 Portal 전용 chrome/hooks/utils 만 가진다.

## 개발

```bash
cp .env.local.example .env.local
npm install
npm run dev      # http://localhost:3001
npm run codegen  # CentralApi 가 :4000 에서 실행 중일 때
npm run check    # typecheck + lint
```

## 구현 상태 (Phase 0)

- [x] 스캐폴딩 (config / tailwind v4 / providers / store / apollo / i18n / rbac)
- [x] 디자인 토큰 light + dark (OKLCH)
- [x] SharedUI 확장 (Button, Card, Badge, DataTable, Input, Skeleton, Tabs, PageHeader, SummaryStrip, SectionCard, DashboardPage/ListPage/DetailPage templates)
- [x] AppShell + NavigationRail (6 영역 + 권한 기반 hide) + TopBar (검색, 알림, 다국어, 테마)
- [x] DashboardScreen — CentralApi `DashboardOverview` query 소비 (metrics, audits, licenses, sync health)
- [x] 모든 1차 sub-route stub (26개) → `ComingSoonScreen`
- [x] i18n 3종 (ko / vi / en) — 네비게이션, 공통 액션, 대시보드, meta

## 향후 Phase

- **Phase 1** Tenants 영역 (Distributors · Brands · Branches · EdgePos · Corporates + sub-pages)
- **Phase 2** Deploy · Governance (Licenses, Entitlements, Policies, RBAC, Users)
- **Phase 3** Operations (Sync, Realtime, Telemetry, Incidents) + System (Audit, Reference, Health)
- **Phase 4** Realtime subscriptions, e2e tests, persisted query 전환

## 백엔드 연동

`.env.local` 로 CentralApi endpoint 를 지정한다:

```
NEXT_PUBLIC_CENTRAL_API_HTTP=http://localhost:4000/graphql
NEXT_PUBLIC_CENTRAL_API_WS=ws://localhost:4000/graphql
```

CentralApi 가 실행 중이면 `npm run codegen` 으로 타입을 생성한다. 오프라인
작업에서는 `DashboardOverviewData` 같은 수동 타입을 임시로 사용한다.
