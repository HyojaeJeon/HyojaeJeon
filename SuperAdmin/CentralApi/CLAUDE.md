# CentralApi

`경로`: `/SuperAdmin/CentralApi`
상위 규칙: `../../CLAUDE.md`

## 역할
- 중앙 인증, 계정, RBAC, 멀티테넌시, 정책, 동기화 수신을 담당하는 중앙 백엔드다.

## 구현 규칙
- 다국어 라벨이 필요한 DB 컬럼 / GraphQL 필드 / DTO 필드는 `name` (vi 기본) / `nameKo` / `nameEn` 및 `description` / `descriptionKo` / `descriptionEn` 쌍만 사용한다. 기타 suffix 금지.
- **다국어 필드 서버 해석**: GraphQL 응답에서 `title`, `name`, `description` 등 기본 필드에 클라이언트 `Accept-Language` 헤더 기반으로 해석된 값을 담아 반환한다. `resolveLocalizedRow/Rows()` (`core/i18n/resolveLocalizedFields.ts`) 헬퍼를 resolver에서 호출. 클라이언트는 `Ko`/`En` suffix 필드를 직접 읽지 않고 기본 필드만 사용한다. locale 우선순위: Accept-Language → userLanguage → tenantLanguage → `'en'`.
- 기본 API 표면은 GraphQL이다. REST는 예외만 허용한다.
- auth / rbac / tenancy / policy / audit / sync / entitlement 계약은 `SharedContracts`를 따른다.
- 멀티테넌트 스코프와 capability 체크는 서비스/쿼리 레이어에서 강제한다.
- Redis는 cache / lock / rate limit / queue handoff만 맡는다.
- cache 정책 확장은 `src/core/cache` 에서만 정의하고, 도메인 서비스가 Redis key / TTL / invalidation 을 제각각 조합하지 않는다.
- 인증 실패는 `INVALID_CREDENTIALS` / `ACCOUNT_INACTIVE` / `TOO_MANY_LOGIN_ATTEMPTS` 같은 구조화 코드로만 표현한다. 잘못된 로그인은 반드시 rate-limit 누적 대상이어야 하며, `VALIDATION_ERROR` 같은 뭉뚱그린 코드로 로그인 실패를 숨기지 않는다.
- 웹 인증은 short-lived access token + rotating refresh session 표준을 따른다. access token 은 `sessionId` 를 포함해 서버에서 revoke 검증 가능해야 하고, refresh token 은 HttpOnly cookie + 서버 저장 hash/session 레코드로만 관리한다.
- `refreshSession`, `logout`, `logoutAllSessions` 는 `platform/superadmin/auth/` surface 에서만 제공한다. refresh token 을 GraphQL payload/localStorage 로 노출하지 않는다.
- GraphQL auth cookie는 resolver/service 에서 Fastify reply 를 직접 만지지 않는다. `responseCookies` buffer 에만 추가하고, 실제 `Set-Cookie` flush 는 `main.ts` 의 Fastify `onSend` 단일 경로에서만 수행한다. `core/graphql/plugins/GraphqlCookie.plugin.ts` 는 batch metadata 만 남긴다.
- 로컬 개발 쿠키는 `localhost` same-site(cross-port) 기준으로 `SameSite=Lax` + non-Secure 를 사용한다. 개발 기본 host 는 `localhost` 로 통일하고 `127.0.0.1` 과 섞지 않는다.
- `CREDENTIAL_ENCRYPTION_KEY` 는 refresh session 암호화 전용이다. 64-char hex(32 bytes) 가 아니면 server boot/login 이 즉시 실패해야 한다.
- 실시간 채널은 **graphql-ws subscription 단일** 이다. Socket.IO·subscriptions-transport-ws·자체 WS 허브 금지. 운영 push 를 포함한 모든 server→client push 는 GraphQL `Subscription` 으로 정의하고 persisted-query allow-list·complexity·rate-limit 통제를 그대로 받는다. fan-out 은 `src/core/graphql/subscriptions/` 의 Redis-backed subscription bus 를 사용한다.
- DataLoader는 request-scoped batch loading만 한다.
- EdgePos 로컬 거래 원본을 대체하지 않는다.
- 응답 표준화와 서버 로케일 처리는 `src/core/i18n`, `src/core/response`, `src/core/errors` 같은 서버 내부 계층에서 처리한다. public 응답은 `success / error` 네이밍만 사용하고, REST 예외 경로도 ad-hoc `{ ok, data }` 형태를 쓰지 않는다.
- 서버 번역 원본은 CentralApi 내부 i18n에 둔다.
- `platform/corporate/wallet` 은 현금 지갑이 아니라 allowance ledger 다. 회사 지원금 / 개인 충전 / split payment 를 구분 기록하고, funding entry 로 원장을 남긴다.
- 전자세금계산서는 `shared/einvoice/` leaf 단일 도메인이다 (특정 platform 계층에 결합 금지). DB 모델은 `EInvoice / EInvoiceLine` 이며 `subjectType + subjectId` polymorphic (`'CORPORATE' | 'BRAND_HQ' | 'BRANCH' | 'EDGE_POS'`) + `issuanceMode` (`'CONSOLIDATED' | 'SINGLE_RECEIPT'`) 로 식권 / POS / 가맹점 정산 시나리오를 단일 테이블에서 처리한다. 발급 주체별 전용 컬럼 / 별도 테이블 추가 금지.
- 누적성 운영 데이터(`AuditLog`, `SyncEvent`, `EInvoice`, `MealTransaction`, `MealWalletFundingEntry` 등)는 page-less list surface 를 만들지 않는다. GraphQL list query 는 기본적으로 `skip/take` 또는 cursor pagination 을 가져야 한다.
- `shared/health` 는 REST-only 다. GraphQL resolver/model/query 를 추가하지 않는다.

## 소스 구조 규칙

`src/` 는 다음 3개 최상위 버킷만 허용한다. 그 외 새 최상위 폴더를 만들지 않는다.

```
src/
├── core/        # cross-cutting infra only (도메인 금지)
├── platform/    # bounded context only (인프라 금지)
└── shared/      # 플랫폼 간 공유 도메인
```

### core/ 원칙
- 도메인 모델·리졸버·CRUD 서비스를 두지 않는다.
- 허용 내용: `prisma/`, `redis/`, `cache/` (policy service / invalidation / redis primitive), `graphql/` (plugins, loaders, pagination, subscriptions/pubsub bus), `auth/` (jwt strategy / guards / decorators / constants), `rbac/` (PermissionService, PermissionGuard, `@RequirePermission`), `tenancy/` (tenant-scope), `audit/` (AuditService, audit dto/models), `filters/`, `interceptors/`.
- core 는 platform/shared 의 어떤 심볼도 import 하지 않는다 (단, DataLoader 타입 힌트는 예외로 허용하되 `import type` 만 사용).
- `core/crypto/` 는 cross-cutting credential encryption/decryption infra 로 허용한다. provider credentials, external integration secret payload 처리 외 용도로 도메인별 암호화 로직을 흩뿌리지 않는다.
- `core/rbac/permissionDefinitions.ts` 는 **전체 플랫폼 권한 키의 유일한 원천**이다. `PERMISSION_CATEGORIES` (카테고리+CRUD 키), `MENU_PERMISSION_STRUCTURE` (사이드바 메뉴 매핑), `matchPermission()` (와일드카드 매칭), `LEGACY_KEY_MAP` (기존 키 호환)을 정의한다. 새 권한 추가 시 이 파일만 수정하면 Portal이 `permissionCatalog` query로 자동 동기화.

### platform/ 원칙
- 6 계층을 반영한다: `superadmin/`, `distributor/`, `brand/`, `branch/`, `edge-pos/`, `corporate/`.
- 각 계층은 **leaf** 만 가지거나, **그룹 폴더 + 그 하위 leaf** 를 가진다. 다른 형태는 금지.
- 계층 간 cross import 는 `@platform/...` alias 로만 한다.
- `platform/superadmin/auth/` 는 SuperAdmin 계정 관리 전용이다. JWT strategy·guard·decorator 는 `core/auth/` 에 둔다.
- `platform/edge-pos/` 는 EdgePos 단말 등록·인증 전용 leaf 다. `edge-pos-auth.controller.ts` 의 REST 엔드포인트는 단말 로그인용이며 SuperAdmin 포털 로그인과 섞지 않는다.

### platform/ leaf 표준 (단일 템플릿)

leaf 는 "하나의 비즈니스 리소스 = 하나의 폴더 + 단일 명명 prefix" 다. **예외 없이** 아래 템플릿을 따른다.

```
<resource>/                          # camelCase, 단수형
├── <Resource>.module.ts             # required
├── <Resource>.resolver.ts           # GraphQL 사용 시 required
├── <Resource>.controller.ts         # REST 사용 시에만 (예외)
├── <Resource>.service.ts            # required
├── <Resource>.service.spec.ts       # 신규 leaf 는 강력 권장
├── dto/                             # input 이 있을 때만
│   ├── <VerbResource>.input.ts
│   └── <Name>.args.ts
└── models/                          # GraphQL ObjectType 이 있을 때만
    └── <Resource>.model.ts          # 다중 ObjectType 도 각 파일 하나씩
```

**leaf 안에서 금지되는 것**:
- `services/` 폴더 (1 leaf 1 service)
- `resolvers/` 폴더 (1 leaf 1 resolver)
- `controllers/` 폴더 (1 leaf 0~1 controller)
- 다중 모델 집계 파일 (`models.ts`, `models/index.ts` 등)
- nested leaf (leaf 안에 또 다른 leaf 폴더). 도메인 분할이 필요하면 형제(sibling) leaf 로 만든다.

**leaf 안의 `_internal/` 사용 (선택)**:
- leaf 가 외부 시스템 통합 (e-Invoice provider, 결제 PG, 외부 SaaS) 등 **여러 helper 파일** 로 분할이 필요할 때만 허용한다.
- 외부에서 `_internal/` 의 어떤 심볼도 import 하지 않는다 (leaf 의 service/resolver 만 노출).
- 사용 사례:
  - `corporate/_internal/caller-ctx.ts` — corporate 도메인 공유 helper
  - `corporate/einvoice/_internal/wetax.{provider,client,serializer,merger,types,constants}.ts` + `einvoice-provider.interface.ts` + `kyc-lookup.ts` — WeTax e-Invoice provider 구현체
- `_internal/` 파일은 module.ts 에서 명시적으로 wiring 한다 (자동 import 금지).

### platform/ 그룹 폴더 (bounded context group)

리소스들을 도메인 단위로 묶는 중간 폴더는 허용한다 (예: `brand/catalog/`, `brand/deploy/`). 그러나:

- 그룹 폴더에는 **`<group>.module.ts` 단 한 파일만** 둔다 (sub-leaf 들의 module 을 묶는 aggregator).
- 그룹 폴더 자체에 resolver/service/dto/models 를 두지 않는다.
- 그룹 깊이는 최대 1 (계층/그룹/leaf). 그룹 안에 또 그룹 금지.
- 그룹 이름은 도메인 명사로. 기술 축 이름(`services`, `controllers`, `internal`, `common`) 금지.

### platform/ 네이밍 규칙

1. **리소스 redundancy 금지**: `corporate/corporate/`, `sync/sync/` 처럼 그룹과 leaf 명이 같지 않게 한다. 부모 폴더가 도메인 명을 이미 표현하면 leaf 는 `profile/` 같은 의미적 이름으로 둔다.
2. **모호 폴더 금지**: `common/`, `shared/`, `utils/`, `helpers/` 같이 무엇이 들어갈지 알 수 없는 이름은 사용하지 않는다. 도메인 내부 helper 가 정말 필요하면 `_internal/` 로 시작하는 폴더에 두고, 한 줄 주석으로 무엇이 있는지 명시한다.
3. **단수형**: leaf 폴더는 단수형 명사를 사용한다 (`menuItem`, not `menuItems`).
4. **prefix 일관성**: leaf 안의 모든 파일은 동일한 `<resource>` prefix 를 공유한다. 예외 없이.
5. **camelCase 폴더**: 폴더명 camelCase, 파일명은 class export 시 PascalCase / function-value export 시 camelCase (최상위 `CLAUDE.md` naming 규칙 따른다).

### shared/ 원칙
- 한 플랫폼 계층에 귀속되지 않는 도메인만 둔다: `entitlement/`, `reference/`, `sync/`, `health/`.
- 각 leaf 는 platform leaf 와 동일한 표준 템플릿을 따른다.
- reference 같이 여러 리소스를 묶는 경우 그룹 폴더(`reference/`) 안에 sub-leaf (`language/`, `region/`, `currency/`) 를 둔다. 그룹 폴더에는 `reference.module.ts` 만 허용.
- `health/` 는 예외적으로 REST controller only 이며 resolver/models 를 두지 않는다.

### 리소스 분리
- `models/index.ts`, `dto/index.ts` 같은 혼합 집계 파일은 금지한다.
- 각 리소스는 자기 폴더와 자기 파일을 가진다. 한 파일에 여러 리소스의 `ObjectType` / `DTO`를 몰아넣지 않는다.
- `index.ts`는 같은 리소스의 public export만 허용한다.

### 모델/DTO 파일명 규칙
- **모델 파일명**: `<클래스명에서 Model 접미사 제거>.model.ts` 의 PascalCase.
  - `BrandMenuCategoryModel` → `BrandMenuCategory.model.ts`
  - `MealTransactionModel` → `MealTransaction.model.ts`
  - `PermissionModel` → `Permission.model.ts`
- **DTO input 파일명**: `<VerbResource>.input.ts`. 예: `CreateMealCorporate.input.ts`, `UpdateBrand.input.ts`.
- **DTO args 파일명**: `<QueryName>.args.ts`. 예: `AuditLogFilter.args.ts`.
- 한 파일에 한 클래스만. 다중 ObjectType 은 각자 .model.ts 로 분리.

### 현재 platform/shared 디렉토리 ground truth

```
platform/
├── superadmin/                  # 운영 계층
│   ├── audit/                   # leaf
│   ├── auth/                    # leaf
│   ├── Governance.module.ts     # 그룹 aggregator (license + PlatformPolicy)
│   ├── license/                 # leaf
│   ├── platformPolicy/          # leaf
│   └── rbac/                    # leaf
├── distributor/
│   └── profile/                 # leaf
├── brand/
│   ├── catalog/                 # 그룹
│   │   ├── Catalog.module.ts    # 그룹 aggregator
│   │   ├── menuCategory/        # leaf
│   │   ├── menuItem/            # leaf
│   │   ├── pricePolicy/         # leaf
│   │   └── promotion/           # leaf
│   ├── deploy/                  # 그룹
│   │   ├── Deploy.module.ts     # 그룹 aggregator
│   │   ├── package/             # leaf
│   │   └── release/             # leaf
│   └── profile/                 # leaf
├── branch/
│   └── profile/                 # leaf
├── edgePos/                     # leaf (단일 leaf 라 그룹 폴더 없음)
└── corporate/
    ├── _internal/               # 도메인 내부 helper (callerCtx). leaf 아님
    ├── einvoice/                # leaf
    ├── merchant/                # leaf
    ├── policy/                  # leaf
    ├── profile/                 # leaf
    ├── settlement/              # leaf
    ├── transaction/             # leaf
    └── wallet/                  # leaf

shared/
├── einvoice/                    # leaf — 베트남 GDT 전자세금계산서 (polymorphic subjectType)
│   └── _internal/               # WeTax provider 구현체
├── entitlement/                 # leaf
├── health/                      # leaf (REST controller only)
├── reference/                   # 그룹
│   ├── Reference.module.ts      # 그룹 aggregator
│   ├── currency/                # leaf
│   ├── language/                # leaf
│   └── region/                  # leaf
└── sync/                        # leaf (controller + resolver)
```

위 트리는 표준이며 신규 leaf 는 같은 패턴을 따른다. 이 트리 외 형태가 등장하면 표준 위반이다.

### Profile leaf 명명 패턴 (정당한 두 가지)

`profile/` leaf 는 부모 도메인을 표현한다. 클래스명은 두 가지 패턴 모두 허용한다:

1. **단순 패턴** — 부모 도메인이 단일 의미인 경우. 클래스명 = 부모 도메인.
   예: `branch/profile/models/Branch.model.ts` → `BranchModel`
2. **명시 패턴** — 부모 도메인 안에 다른 leaf 와 명확히 구분이 필요한 경우. 클래스명 = `<부모><Profile>`.
   예: `brand/profile/models/BrandProfile.model.ts` → `BrandProfileModel`,
        `distributor/profile/models/DistributorProfile.model.ts` → `DistributorProfileModel`

이 두 패턴은 모두 표준이며 GraphQL public contract 호환성을 위해 보존된다. 신규 leaf 추가 시 부모 도메인의 충돌 가능성을 평가하여 선택한다.

### Alias & 네이밍
- 경로 alias 는 `@core/*`, `@platform/*`, `@shared/*` 세 개만 허용. legacy `@modules/*`, `@common/*`, `@prisma/*` 는 금지.
- 폴더명은 camelCase, 파일명은 class export 시 PascalCase / function-value export 시 camelCase (최상위 `CLAUDE.md` naming 규칙 따른다).
- `index.ts` barrel 은 public export 용도로만. feature 내부 barrel 은 최소화.

### 데이터 Retention & Partitioning

append-only 대량 테이블은 파티션 전략을 반드시 유지한다. prisma schema 는 파티션을 표현하지 못하므로 migration 파일에서 관리한다.

| 테이블 | 파티션 키 | Partition 간격 | Retention | Purge 주체 |
|---|---|---|---|---|
| `AuditLog` | `createdAt` | 월 | 24 개월 (법무 검토) | SyncWorkers cron (월 1 회 archive) |
| `SyncOutbox` | `createdAt` | 월 | ACKED 30 일, FAILED 수동 | SyncWorkers cron (일 1 회 purge) |
| `MealTransaction` | `createdAt` | 월 | 60 개월 (세무 요건) | manual archive |

파티션 생성은 `pg_partman` 사용을 권장한다. Prisma migration 파일에서 `prisma migrate dev` 대신 `prisma migrate diff --script` 로 raw SQL 을 뽑고, `PARTITION BY RANGE` 문을 수동 편집한 뒤 `prisma migrate deploy` 로 적용한다.

### 디스크리미네이터 문자열

규칙 (필드 enumeration 대신 판정 기준):

1. **"미리 정해진 유한 토큰 집합"** 을 저장하는 모든 string 컬럼/필드/JSON 키는 `UPPER_SNAKE_CASE`. PascalCase / camelCase 금지.
2. **예외**: 값이 Prisma 모델 클래스 명을 그대로 미러링하는 메타 필드만 PascalCase 허용 (예: `AuditLog.targetType`).
3. 신규 컬럼 추가 시 (1) 닫힌 enum 인지 (2) 모델 명 미러링인지 PR 설명에 명시. 명시 없으면 reject.
4. 컬럼/필드 이름 패턴 휴리스틱 (참고용 — 대부분 (1) 에 해당):
   `*Type` · `*Method` · `*Mode` · `*Kind` · `*Status` · `status` · `*Scope` · `scope` · `*Code` · `*Model` (값이 enum 인 경우)
5. 검증: 신규 enum 도입 시 사용 지점에 `'X' | 'Y' | 'Z'` 리터럴 union 으로 타입 좁혀서 컴파일러가 오타/오케이싱을 잡게 한다.
6. 자동 lint: `scripts/lint-discriminators.mjs` 가 (1) 위반 패턴을 grep 한다. CI 의 build gate 에 포함.
