# CentralApi

`경로`: `/SuperAdmin/CentralApi`
상위 규칙: `../../CLAUDE.md`

## 역할
- 중앙 인증, 계정, RBAC, 멀티테넌시, 정책, 동기화 수신을 담당하는 중앙 백엔드다.

## 구현 규칙
- 기본 API 표면은 GraphQL이다. REST는 예외만 허용한다.
- auth / rbac / tenancy / policy / audit / sync / entitlement 계약은 `SharedContracts`를 따른다.
- 멀티테넌트 스코프와 capability 체크는 서비스/쿼리 레이어에서 강제한다.
- Redis는 cache / lock / rate limit / queue handoff만 맡는다.
- cache 정책 확장은 `src/core/cache` 에서만 정의하고, 도메인 서비스가 Redis key / TTL / invalidation 을 제각각 조합하지 않는다.
- realtime 은 단일 Socket.IO 허브이며, topic / audience policy / publisher 로 분리한다. 서비스는 publisher facade 를 통해서만 발행한다.
- DataLoader는 request-scoped batch loading만 한다.
- EdgePos 로컬 거래 원본을 대체하지 않는다.
- 응답 표준화와 서버 로케일 처리는 `src/core/i18n`, `src/core/response`, `src/core/errors` 같은 서버 내부 계층에서 처리한다. public 응답은 `success / error` 네이밍만 사용하고, REST 예외 경로도 ad-hoc `{ ok, data }` 형태를 쓰지 않는다.
- 서버 번역 원본은 CentralApi 내부 i18n에 둔다.

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
- 허용 내용: `prisma/`, `redis/`, `cache/` (policy service / invalidation / redis primitive), `realtime/` (single hub / topics / audience policy / publishers), `graphql/` (plugins, loaders, pagination), `auth/` (jwt strategy / guards / decorators / constants), `rbac/` (PermissionService, PermissionGuard, `@RequirePermission`), `tenancy/` (tenant-scope), `audit/` (AuditService, audit dto/models), `filters/`, `interceptors/`.
- core 는 platform/shared 의 어떤 심볼도 import 하지 않는다 (단, DataLoader 타입 힌트는 예외로 허용하되 `import type` 만 사용).

### platform/ 원칙
- 6 계층을 반영한다: `superadmin/`, `distributor/`, `brand/`, `branch/`, `edge-pos/`, `corporate/`.
- 각 계층은 **leaf** 만 가지거나, **그룹 폴더 + 그 하위 leaf** 를 가진다. 다른 형태는 금지.
- 계층 간 cross import 는 `@platform/...` alias 로만 한다.
- `platform/superadmin/auth/` 는 SuperAdmin 계정 관리 전용이다. JWT strategy·guard·decorator 는 `core/auth/` 에 둔다.
- `platform/edge-pos/` 는 EdgePos 단말 등록·인증 전용 leaf 다. `edge-pos-auth.controller.ts` 의 REST 엔드포인트는 단말 로그인용이며 SuperAdmin 포털 로그인과 섞지 않는다.

### platform/ leaf 표준 (단일 템플릿)

leaf 는 "하나의 비즈니스 리소스 = 하나의 폴더 + 단일 명명 prefix" 다. **예외 없이** 아래 템플릿을 따른다.

```
<resource>/                          # kebab-case, 단수형
├── <resource>.module.ts             # required
├── <resource>.resolver.ts           # GraphQL 사용 시 required
├── <resource>.controller.ts         # REST 사용 시에만 (예외)
├── <resource>.service.ts            # required
├── <resource>.service.spec.ts       # 신규 leaf 는 강력 권장
├── dto/                             # input 이 있을 때만
│   ├── <verb>-<resource>.input.ts
│   └── <name>.args.ts
└── models/                          # GraphQL ObjectType 이 있을 때만
    └── <resource>.model.ts          # 다중 ObjectType 도 각 파일 하나씩
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
3. **단수형**: leaf 폴더는 단수형 명사를 사용한다 (`menu-item`, not `menu-items`).
4. **prefix 일관성**: leaf 안의 모든 파일은 동일한 `<resource>` prefix 를 공유한다. 예외 없이.
5. **kebab-case**: 폴더/파일 모두 kebab-case. 모델/클래스 이름만 PascalCase.

### shared/ 원칙
- 한 플랫폼 계층에 귀속되지 않는 도메인만 둔다: `entitlement/`, `reference/`, `sync/`, `health/`.
- 각 leaf 는 platform leaf 와 동일한 표준 템플릿을 따른다.
- reference 같이 여러 리소스를 묶는 경우 그룹 폴더(`reference/`) 안에 sub-leaf (`language/`, `region/`, `currency/`) 를 둔다. 그룹 폴더에는 `reference.module.ts` 만 허용.

### 리소스 분리
- `models/index.ts`, `dto/index.ts` 같은 혼합 집계 파일은 금지한다.
- 각 리소스는 자기 폴더와 자기 파일을 가진다. 한 파일에 여러 리소스의 `ObjectType` / `DTO`를 몰아넣지 않는다.
- `index.ts`는 같은 리소스의 public export만 허용한다.

### 모델/DTO 파일명 규칙
- **모델 파일명**: `<클래스명에서 Model 접미사 제거>.model.ts` 의 kebab-case.
  - `BrandMenuCategoryModel` → `brand-menu-category.model.ts`
  - `MealTransactionModel` → `meal-transaction.model.ts`
  - `PermissionModel` → `permission.model.ts`
- **DTO input 파일명**: `<verb>-<resource>.input.ts`. 예: `create-meal-corporate.input.ts`, `update-brand.input.ts`.
- **DTO args 파일명**: `<query-name>.args.ts`. 예: `audit-log-filter.args.ts`.
- 한 파일에 한 클래스만. 다중 ObjectType 은 각자 .model.ts 로 분리.

### 현재 platform/shared 디렉토리 ground truth

```
platform/
├── superadmin/                  # 운영 계층
│   ├── audit/                   # leaf
│   ├── auth/                    # leaf
│   ├── governance.module.ts     # 그룹 aggregator (license + platform-policy)
│   ├── license/                 # leaf
│   ├── platform-policy/         # leaf
│   └── rbac/                    # leaf
├── distributor/
│   └── profile/                 # leaf
├── brand/
│   ├── catalog/                 # 그룹
│   │   ├── catalog.module.ts    # 그룹 aggregator
│   │   ├── menu-category/       # leaf
│   │   ├── menu-item/           # leaf
│   │   ├── price-policy/        # leaf
│   │   └── promotion/           # leaf
│   ├── deploy/                  # 그룹
│   │   ├── deploy.module.ts     # 그룹 aggregator
│   │   ├── package/             # leaf
│   │   └── release/             # leaf
│   └── profile/                 # leaf
├── branch/
│   └── profile/                 # leaf
├── edge-pos/                    # leaf (단일 leaf 라 그룹 폴더 없음)
└── corporate/
    ├── _internal/               # 도메인 내부 helper (caller-ctx). leaf 아님
    ├── einvoice/                # leaf
    ├── merchant/                # leaf
    ├── policy/                  # leaf
    ├── profile/                 # leaf
    ├── settlement/              # leaf
    ├── transaction/             # leaf
    └── wallet/                  # leaf

shared/
├── entitlement/                 # leaf
├── health/                      # leaf (REST controller only)
├── reference/                   # 그룹
│   ├── reference.module.ts      # 그룹 aggregator
│   ├── currency/                # leaf
│   ├── language/                # leaf
│   └── region/                  # leaf
└── sync/                        # leaf (controller + resolver)
```

위 트리는 표준이며 신규 leaf 는 같은 패턴을 따른다. 이 트리 외 형태가 등장하면 표준 위반이다.

### Profile leaf 명명 패턴 (정당한 두 가지)

`profile/` leaf 는 부모 도메인을 표현한다. 클래스명은 두 가지 패턴 모두 허용한다:

1. **단순 패턴** — 부모 도메인이 단일 의미인 경우. 클래스명 = 부모 도메인.
   예: `branch/profile/models/branch.model.ts` → `BranchModel`
2. **명시 패턴** — 부모 도메인 안에 다른 leaf 와 명확히 구분이 필요한 경우. 클래스명 = `<부모><Profile>`.
   예: `brand/profile/models/brand-profile.model.ts` → `BrandProfileModel`,
        `distributor/profile/models/distributor-profile.model.ts` → `DistributorProfileModel`

이 두 패턴은 모두 표준이며 GraphQL public contract 호환성을 위해 보존된다. 신규 leaf 추가 시 부모 도메인의 충돌 가능성을 평가하여 선택한다.

### Alias & 네이밍
- 경로 alias 는 `@core/*`, `@platform/*`, `@shared/*` 세 개만 허용. legacy `@modules/*`, `@common/*`, `@prisma/*` 는 금지.
- 폴더명은 kebab-case, 파일명은 kebab-case (최상위 `CLAUDE.md` naming 규칙 따른다).
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
