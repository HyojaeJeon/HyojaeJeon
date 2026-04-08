# SuperAdmin Portal 기능 리스트 (상세 설계서)
# Tài liệu thiết kế chi tiết SuperAdmin Portal

> 이 문서는 `SuperAdmin/Portal` 구현의 단일 진실(source of truth) 다. 화면 ID, 호출 GraphQL operation, 권한 키, 가드, 상태/에러까지 포함한다.
>
> 기준 자료:
> - `00-Platform-최종-아키텍처-기준서.md`
> - `01-SuperAdmin-통합-플랫폼-설계서.md`
> - `1.Docs/식권관리플랫폼/프로젝트 개요.md` (베트남 B2B 식권 사업 기획서, 2025 규제·세무·운영 요구사항)
> - `SuperAdmin/CentralApi/prisma/schema/*.prisma` (44 모델)
> - `SuperAdmin/CentralApi/src/platform/**` (22 resolver)
> - `SuperAdmin/CentralApi/src/core/rbac/permission.service.ts` (39 권한 키)
> - `SuperAdmin/CentralApi/src/core/realtime/topics/realtime-topics.ts` (9 topic 그룹)
> - `SuperAdmin/CentralApi/CLAUDE.md` (leaf 표준)
>
> Tài liệu căn cứ: như trên.

---

## 0. 범위와 비범위
## 0. Phạm vi và phi phạm vi

### 0.1 SuperAdmin Portal 이 책임지는 것

SuperAdmin Portal 은 공급사가 **모든 brand / distributor / branch / corporate / RBAC / license / deploy / audit / sync / reference** 를 한 화면에서 통제하는 **단일 운영 콘솔** 이다. EdgePos 단말은 branch 상세 탭과 operations telemetry 로 다룬다. CentralApi 의 거의 모든 GraphQL operation 을 소비한다.

핵심 책임:

1. **테넌트 트리 통제** — distributor → brand → branch 축의 등록·승인·정지·삭제, branch-owned EdgePos 단말 관리, corporate (식권) 별도 축
2. **카탈로그 거버넌스** — brand 상세의 Catalog 탭에서 menu category / item / price policy / promotion 을 중앙 검수·승인·거부
3. **배포 거버넌스** — DeployPackage 등록, DeployRelease 단계적 롤아웃, ACK/실패/롤백 추적
4. **라이선스·entitlement 거버넌스** — PlatformLicense 발급, BrandHqEntitlement (POS / MEAL_TICKET) grant·suspend·revoke
5. **RBAC 거버넌스** — Role / Permission / UserRoleAssignment 의 4 축 scope-aware CRUD
6. **PlatformPolicy 거버넌스** — runtime 운영 노브 (auth.max_login_attempts 등) 의 scope 상속 관리
7. **식권 도메인 통제** — 7 leaf (corporate / wallet / policy / transaction / settlement / merchant / einvoice) 의 통합 운영
8. **운영 모니터링** — SyncOutbox / Realtime topic / EdgePos heartbeat / 인시던트 추적
9. **감사** — AuditLog keyset/연결 페이지네이션 + 필터링
10. **마스터 데이터** — Currency / Language / Region 의 단일 진실 관리

### 0.2 SuperAdmin Portal 이 하지 않는 것 (위임 대상)

- POS 매장 운영 화면 (주문/결제/테이블/주방) → `BrandPosApp`
- 브랜드 단일 본사 운영 화면 (직원 출퇴근/지점 일일 마감) → `BrandHQPortal` (별도 앱)
- 식권 사용자 화면 (개인 충전 요청/식사 인증) → `CorporatePortal` (별도 앱)
- DB 직접 접근 (모든 mutation 은 GraphQL operation 경유)
- 백엔드 비즈니스 로직 (resolver/service 가 단일 진실)

---

## 1. 정보구조 (IA)
## 1. Information Architecture

SuperAdmin Portal 은 **5 개 최상위 영역 + 1 개 시스템 영역** 으로 구성된다. 각 최상위 영역은 NavigationRail 의 단일 진입점이다.

```
SuperAdmin Portal
├── 1. Dashboard            ── /                                   (홈)
├── 2. Tenants              ── /tenants                            (테넌트 트리)
│   ├── Distributors        ── /tenants/distributors
│   ├── Brands              ── /tenants/brands
│   │   ├── Branches        ── /tenants/brands/:brandHqId/branches (브랜드 상세 탭)
│   │   │   └── Edge POS    ── /tenants/brands/:brandHqId/branches/:branchId/edge-pos (브랜치 상세 탭)
│   │   └── Catalog         ── /tenants/brands/:brandHqId/catalog  (브랜드 상세 탭)
│   └── Corporates (식권)    ── /tenants/corporates
├── 3. Deploy               ── /deploy                             (배포)
│   ├── Packages            ── /deploy/packages
│   ├── Releases            ── /deploy/releases
│   └── Rollouts (단계 모니터)── /deploy/rollouts
├── 4. Governance           ── /governance                         (거버넌스)
│   ├── Licenses            ── /governance/licenses
│   ├── Entitlements        ── /governance/entitlements
│   ├── Platform Policies   ── /governance/platform-policies
│   ├── RBAC Roles          ── /governance/rbac/roles
│   ├── RBAC Permissions    ── /governance/rbac/permissions
│   ├── RBAC Assignments    ── /governance/rbac/assignments
│   └── SuperAdmin Users    ── /governance/users
├── 5. Operations           ── /operations                         (운영 모니터)
│   ├── Sync Monitor        ── /operations/sync
│   ├── Realtime Health     ── /operations/realtime
│   ├── EdgePos Telemetry   ── /operations/telemetry
│   ├── Incidents           ── /operations/incidents
│   └── Remote Support      ── /operations/remote-support
└── 6. Audit & System       ── /system
    ├── Audit Log           ── /system/audit
    ├── Reference Data      ── /system/reference
    │   ├── Currencies      ── /system/reference/currencies
    │   ├── Languages       ── /system/reference/languages
    │   └── Regions         ── /system/reference/regions
    └── System Health       ── /system/health
```

식권(Corporate) 도메인은 단일 영역으로 묶지 않고 **테넌트 트리의 별도 축** 으로 처리한다 (Corporate 자체는 BrandHQ 와 형제 계층). 단, 거래/지갑/정산 같은 **운영 데이터** 는 Corporate sub-route 에서 직접 다룬다 (`/tenants/corporates/:id/wallets`, `/tenants/corporates/:id/transactions` 등).

브랜드 Catalog 는 별도 1급 최상위 영역이 아니라 **Brands 상세 화면의 탭** 이다. 브랜드 canonical catalog 를 SuperAdmin 이 검수하고, branch 별 실효 메뉴 차이는 branch / edge-pos 쪽 effective view 로 소비한다.

---

## 2. 화면 카탈로그 (Screen Catalog)
## 2. Danh mục màn hình

각 화면은 **screen ID**, **route**, **권한 키**, **연결 GraphQL operation**, **주요 액션**, **표시 필드** 를 가진다. 본 절은 구현 작업의 단위가 된다.

### 2.1 Dashboard (1 화면)

#### `SA-DASH-001` Platform Overview

| 항목 | 내용 |
|---|---|
| **Route** | `/` |
| **권한** | (인증된 모든 SuperAdmin) |
| **목적** | 플랫폼 전체 KPI 한 눈에 |
| **연결 operations** | `distributors(skip:0,take:1)`, `brands(skip:0,take:1)`, `branches(skip:0,take:1)`, `edgePosTerminals(skip:0,take:1)`, `mealCorporates(skip:0,take:1)`, `auditLogConnection(first:5)`, `syncStatus`, `licenses(skip:0,take:5)` |
| **카드 레이아웃** | 6개 카운터 카드 + 최근 audit 5건 + sync 상태 미니위젯 + 만료 임박 license 5건 |
| **카드 1: 테넌트 카운트** | distributorCount / brandCount / branchCount / edgePosCount / corporateCount (READ 권한 충족 시 표시, 부분 표시 허용) |
| **카드 2: 24h 거래 요약** | mealTransactionsByCorporate 의 status 별 집계 (실시간 polling 30s) |
| **카드 3: 동기화 헬스** | SyncOutbox 의 PENDING / FAILED 카운트 |
| **카드 4: 만료 임박 라이선스** | effectiveTo ≤ 30일 |
| **카드 5: 최근 감사 로그** | 최근 5건 keyset 미리보기 |
| **카드 6: Realtime 활성** | 현재 connected socket 수 (server health) |
| **빈 상태** | 권한 부족 카드는 회색 + lock 아이콘 |
| **에러** | 카드 단위 fail-soft (한 카드 실패가 화면 전체를 깨지 않음) |

---

### 2.2 Tenants (5 sub-area, 화면 ~25개)

#### 2.2.1 Distributors (4 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-DIST-001` | `/tenants/distributors` | 대리점 목록 | `distributor.profile.read` | `distributors(skip,take)` + connection variant |
| `SA-DIST-002` | `/tenants/distributors/:id` | 대리점 상세 | `distributor.profile.read` | `distributor(id)` |
| `SA-DIST-003` | `/tenants/distributors/new` | 대리점 신규 등록 | `distributor.profile.write` | `createDistributor(input)` |
| `SA-DIST-004` | `/tenants/distributors/:id/edit` | 대리점 수정/정지 | `distributor.profile.write` | `updateDistributor(id,input)`, `deleteDistributor(id)` (soft) |

**SA-DIST-001 목록 화면 상세**:

- **컬럼**: distributorCode / companyName / countryCode / status / contractCount / brandCount / createdAt
- **필터**: countryCode (Country dropdown — Region 마스터 사용), status (ACTIVE/SUSPENDED/TERMINATED), 검색어 (companyName / distributorCode / businessNumber)
- **정렬**: createdAt DESC (기본), companyName ASC
- **페이징**: 20 / 50 / 100 (skip+take 또는 cursor)
- **액션**: `+ 신규 대리점 등록` (권한 시 활성), 행 클릭 → 상세
- **빈 상태**: "등록된 대리점이 없습니다. + 신규 대리점 등록" CTA
- **에러**: 권한 없음 → 전체 lock 화면, 네트워크 오류 → 재시도 토스트

**SA-DIST-002 상세 화면 탭 구조**:

```
┌ 개요(Overview)
│  └ 회사명 / 법인명 / 사업자번호 / 대표 연락처 / 상태 / 활성기간
├ 계약(Contracts)             ── DistributorContract[]
│  ├ 계약번호 / 유형 / 시작·종료일 / 독점여부 / 수익 분배율 / 지원등급 / 상태
│  └ + 신규 계약 등록
├ 관할 구역(Territories)      ── Territory[]
│  └ 국가·지역·통화·시간대·독점여부
├ 브랜드 배정(Brand Assignments) ── BrandAssignment[]
│  └ assignmentType (PRIMARY/SECONDARY) / 담당 매니저 / 시작·종료
├ 배포 범위(Deployment Scopes) ── DeploymentScope[]
│  └ 어떤 brand/branch/edgePos 에 대해 어떤 action 허용
├ 사용자(Users)               ── DistributorUser[]
│  └ 로그인 ID / 이름 / 마지막 로그인 / 상태
└ 감사(Audit)                 ── AuditLog (targetType=DistributorProfile)
```

#### 2.2.2 Brands (5 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-BRAND-001` | `/tenants/brands` | 브랜드 목록 | `brand.profile.read` | `brands` |
| `SA-BRAND-002` | `/tenants/brands/:id` | 브랜드 상세 | `brand.profile.read` | `brand(id)` |
| `SA-BRAND-003` | `/tenants/brands/new` | 브랜드 신규 등록 | `brand.profile.write` | `createBrand` |
| `SA-BRAND-004` | `/tenants/brands/:id/edit` | 브랜드 수정 | `brand.profile.write` | `updateBrand`, `deleteBrand` |
| `SA-BRAND-005` | `/tenants/brands/:id/admins` | 브랜드 관리자 | `platform.user.read/write` | `authAccounts(userType=BRAND_ADMIN, brandHqId=:id)` |

**SA-BRAND-002 탭**:

```
├ 개요             ── brandCode / brandName / countryCode / contactInfo / status
├ 지점(Branches)    ── 자식 Branch[] (resolver field) — branches 권한 시 표시
├ 카탈로그(Catalog) ── 자식 menuCategories / menuItems / pricePolicies / promotions (resolver field, brand detail tab)
├ Capability       ── BrandHqEntitlement[] — POS / MEAL_TICKET 활성 상태
├ Operator 템플릿  ── OperatorTemplate[] — 매장 운영자 권한 템플릿
├ 사용자(Admins)   ── BrandAdminUser[]
├ 배포 이력        ── DeployRelease (scopeType=BRAND_HQ, scopeId=:id)
└ 감사
```

#### 2.2.3 Brand Branches (브랜드 상세 탭, 4 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-BRANCH-001` | `/tenants/brands/:brandHqId/branches` | 지점 목록 | `brand.branch.read` | `branches(brandHQId, skip, take)` |
| `SA-BRANCH-002` | `/tenants/brands/:brandHqId/branches/:id` | 지점 상세 | `brand.branch.read` | `branch(id)` |
| `SA-BRANCH-003` | `/tenants/brands/:brandHqId/branches/new` | 지점 신규 | `brand.branch.write` | `createBranch` |
| `SA-BRANCH-004` | `/tenants/brands/:brandHqId/branches/:id/edit` | 지점 수정/폐점 | `brand.branch.write` | `updateBranch`, `deleteBranch` |

**필터**: brandHQId (컨텍스트 고정), countryCode, regionCode, status, branchType (STORE / WAREHOUSE / OFFICE), 폐점일 유무
**원칙**: 지점은 브랜드 소유 리소스다. SuperAdmin 은 브랜드 상세 화면의 Branches 탭에서 관리하며, 전체 브랜드를 한 번에 보는 글로벌 지점 목록은 1급 nav 로 두지 않는다.

#### 2.2.4 Branch Edge POS (브랜치 상세 탭, 4 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-EDGEPOS-001` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos` | 단말기 목록 | `edgepos.terminal.read` | `edgePosTerminals(branchId?)` |
| `SA-EDGEPOS-002` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos/:id` | 단말기 상세 | `edgepos.terminal.read` | `edgePosTerminal(id)` |
| `SA-EDGEPOS-003` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos/register` | 단말기 등록 | `edgepos.terminal.write` | `registerEdgePos` |
| `SA-EDGEPOS-004` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos/:id/control` | 원격 제어 | `edgepos.terminal.write` | `updateEdgePosStatus`, `deleteEdgePos` |

**SA-EDGEPOS-002 상세** — 브랜치 소유 단말 운영 화면:

- **헤더**: terminalCode / terminalName / branch / brand / status badge
- **헬스 카드**: lastHeartbeatAt (now − last < 60s = green, < 5m = amber, ≥ 5m = red), lastSyncAt, appVersion, dbVersion
- **realtime 구독**: `edgepos.runtime.heartbeat` topic 으로 실시간 색깔 갱신
- **액션**: 일시정지 / 재시작 / 격리 (status mutation), 로그 조회 (audit filter), 원격 제어 (Phase 2)
- **탭**:
  - 개요 (메타데이터)
  - 동기화 (sync.upstream.accepted/duplicate 이벤트 stream + SyncOutbox 본 단말 row)
  - 배포 이력 (DeployRelease scopeType=EDGE_POS)
  - 감사 (targetType=EdgePosTerminal)

#### 2.2.5 Corporates (식권 별도 축, 8 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-CORP-001` | `/tenants/corporates` | 식권 고객사 목록 | `corporate.profile.read` | `mealCorporates(skip, take)` |
| `SA-CORP-002` | `/tenants/corporates/:id` | 고객사 상세 | `corporate.profile.read` | `mealCorporate(id)` |
| `SA-CORP-003` | `/tenants/corporates/new` | 고객사 신규 | `corporate.profile.write` | `createMealCorporate` |
| `SA-CORP-004` | `/tenants/corporates/:id/edit` | 고객사 수정/정지 | `corporate.profile.write` | `updateMealCorporate`, `deleteMealCorporate` |
| `SA-CORP-005` | `/tenants/corporates/:id/departments` | 부서 관리 | `corporate.department.read/write` | `mealDepartments(corporateId)` + create |
| `SA-CORP-006` | `/tenants/corporates/:id/employees` | 임직원 관리 | `corporate.employee.read/write` | `mealEmployees(corporateId)` + create |
| `SA-CORP-007` | `/tenants/corporates/:id/admins` | 고객사 관리자 | `platform.user.read/write` | `authAccounts(userType=CORPORATE_ADMIN, corporateId=:id)` |
| `SA-CORP-008` | `/tenants/corporates/:id/funding` | Funding 계좌 | `corporate.profile.read` | (read-only via mealCorporate) |

**SA-CORP-002 상세 탭** — 식권 고객사 단일 컨트롤 페이지:

```
├ 개요               ── tenantCode / companyName / taxCode / fundingModel / status
├ 부서 / 임직원      ── 합산 카운터, 빠른 진입
├ 식권 계정(Ledger) ── /tenants/corporates/:id/wallets (allowance ledger)
├ 정책(Policies)    ── /tenants/corporates/:id/policies
├ 거래(Transactions) ── /tenants/corporates/:id/transactions
├ 정산(Settlements)  ── /tenants/corporates/:id/settlements
├ 가맹점(Merchants)  ── /tenants/corporates/:id/merchants
├ E-Invoice         ── /tenants/corporates/:id/einvoices
└ 감사
```

#### 2.2.6 Corporate sub-pages (식권 운영, 13 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-CORP-WALLET-001` | `/tenants/corporates/:id/wallets` | 식권 계정 목록 | `corporate.wallet.read` | `mealWalletsByCorporate(corporateId)` |
| `SA-CORP-WALLET-002` | `/tenants/corporates/:id/wallets/:walletId` | 식권 계정 상세 | `corporate.wallet.read` | `mealWallet(id)` |
| `SA-CORP-WALLET-003` | `/tenants/corporates/:id/wallets/new` | 식권 계정 발급 | `corporate.wallet.write` | `createMealWallet` |
| `SA-CORP-WALLET-004` | (모달) | 회사지원금 적립 | `corporate.wallet.fund` | `fundMealWallet(input)` |
| `SA-CORP-WALLET-005` | (모달) | 개인 충전 | `corporate.wallet.topup` | `mealWalletTopUp(input)` |
| `SA-CORP-WALLET-006` | `/tenants/corporates/:id/wallets/:walletId/funding-entries` | 원장 내역 | `corporate.wallet.read` | `mealWalletFundingEntriesByWallet(walletId)` |
| `SA-CORP-POL-001` | `/tenants/corporates/:id/policies` | 식대 정책 목록 | `corporate.policy.read` | `mealPoliciesByCorporate(corporateId)` |
| `SA-CORP-POL-002` | `/tenants/corporates/:id/policies/new` | 신규 정책 | `corporate.policy.write` | `createMealPolicy` |
| `SA-CORP-TX-001` | `/tenants/corporates/:id/transactions` | 거래 내역 | `corporate.transaction.read` | `mealTransactionsByCorporate(corporateId)` |
| `SA-CORP-TX-002` | (모달) | 거래 강제 reverse | `corporate.transaction.reverse` | `reverseMealTransaction(id)` |
| `SA-CORP-SET-001` | `/tenants/corporates/:id/settlements` | 정산 배치 | `corporate.settlement.read` | `mealSettlementBatchesByBrand` |
| `SA-CORP-SET-002` | (모달) | 정산 실행 | `corporate.settlement.run` | `runMealSettlementBatch(input)` |
| `SA-CORP-INV-001` | `/tenants/corporates/:id/einvoices` | 통합 전자세금계산서 | `corporate.invoice.read` | `mealConsolidatedInvoices(corporateId)` |

**SA-CORP-MERCH-001 ~ 005**: 가맹점(Merchant) 등록·활성·수수료·정산계좌·해지 (5 화면, `corporate.merchant.*` 권한). 가맹점은 BrandHQ 와 1:1 매핑이지만 식권 도메인의 일부로 corporate 영역에서 관리한다.

---

### 2.3 Brand Catalog (브랜드 상세 탭, 4 영역, ~12 화면)

브랜드 카탈로그는 **브랜드 상세 화면의 Catalog 탭** 에서 다룬다. `brandHqId` context 가 항상 제공되며, SuperAdmin 은 브랜드 단위로 카탈로그를 검수·승인·거부할 수 있다.

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-CAT-CAT-001` | `/tenants/brands/:brandHqId/catalog/menu-categories` | 메뉴 카테고리 목록 | `brand.catalog.read` | `menuCategories(brandHQId)` |
| `SA-CAT-CAT-002` | `/tenants/brands/:brandHqId/catalog/menu-categories/:id` | 카테고리 상세 | `brand.catalog.read` | `menuCategory(id)` |
| `SA-CAT-CAT-003` | `/tenants/brands/:brandHqId/catalog/menu-categories/new` | 신규 카테고리 | `brand.catalog.write` | `createMenuCategory` |
| `SA-CAT-CAT-004` | `/tenants/brands/:brandHqId/catalog/menu-categories/:id/edit` | 카테고리 수정/삭제 | `brand.catalog.write` | `updateMenuCategory`, `deleteMenuCategory` |
| `SA-CAT-ITEM-001` | `/tenants/brands/:brandHqId/catalog/menu-items` | 메뉴 항목 목록 | `brand.catalog.read` | `menuItems(brandHQId)` |
| `SA-CAT-ITEM-002` | `/tenants/brands/:brandHqId/catalog/menu-items/:id` | 항목 상세 | `brand.catalog.read` | `menuItem(id)` |
| `SA-CAT-ITEM-003` | `/tenants/brands/:brandHqId/catalog/menu-items/new` | 신규 항목 | `brand.catalog.write` | `createMenuItem` |
| `SA-CAT-ITEM-004` | `/tenants/brands/:brandHqId/catalog/menu-items/:id/edit` | 항목 수정/삭제 | `brand.catalog.write` | `updateMenuItem`, `deleteMenuItem` |
| `SA-CAT-PRICE-001` | `/tenants/brands/:brandHqId/catalog/price-policies` | 가격 정책 목록 | `brand.catalog.read` | `pricePolicies(brandHQId)` |
| `SA-CAT-PRICE-002` | `/tenants/brands/:brandHqId/catalog/price-policies/:id` | 가격 정책 상세 | `brand.catalog.read` | `pricePolicy(id)` |
| `SA-CAT-PROMO-001` | `/tenants/brands/:brandHqId/catalog/promotions` | 프로모션 목록 | `brand.catalog.read` | `promotions(brandHQId)` |
| `SA-CAT-PROMO-002` | `/tenants/brands/:brandHqId/catalog/promotions/:id` | 프로모션 상세 | `brand.catalog.read` | `promotion(id)` |

**메뉴 항목 상세 화면 (`SA-CAT-ITEM-002`) 필드**:

- itemCode / itemName / categoryId / itemType / **basePrice (Decimal 14,2)** / **taxRate (0~1)** / unitType / isSoldOut / displayOrder / searchKeywords / isActive / createdAt / updatedAt
- **검증**: P2-4 의 BigInt validator + DTO `@Min(0) @Max(PRICE_MAX)` 사용 (CentralApi 가 server-side 강제하지만 client 도 동일 메시지 표시)
- **realtime**: `brand.catalog.changed(brandHQId)` 구독 → 다른 SuperAdmin 이 동시 편집 시 stale toast

---

### 2.4 Deploy (3 sub-area, 8 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-DEPLOY-PKG-001` | `/deploy/packages` | 패키지 목록 | (TBD `platform.deploy.read`) | `deployPackages(skip, take)` |
| `SA-DEPLOY-PKG-002` | `/deploy/packages/:id` | 패키지 상세 | (read) | `deployPackage(id)` |
| `SA-DEPLOY-PKG-003` | `/deploy/packages/new` | 패키지 등록 | (write) | `createDeployPackage` (TBD) |
| `SA-DEPLOY-REL-001` | `/deploy/releases` | 릴리스 목록 | (read) | `deployReleases` |
| `SA-DEPLOY-REL-002` | `/deploy/releases/:id` | 릴리스 상세 | (read) | `deployRelease(id)` |
| `SA-DEPLOY-REL-003` | `/deploy/releases/new` | 릴리스 신규 (롤아웃 정책) | (write) | `createDeployRelease` (TBD) |
| `SA-DEPLOY-ROLLOUT-001` | `/deploy/rollouts` | 진행 중 롤아웃 모니터 | (read) | `deployReleases(status=PROCESSING)` + realtime `brand.deploy.released` |
| `SA-DEPLOY-ROLLOUT-002` | `/deploy/rollouts/:id` | 단계별 진행 + ACK 추적 | (read+write) | DeployRelease 상태 + ACK + rollback |

**롤아웃 정책 옵션** (Phase 2):

- 단계: canary → 10% → 50% → 100%
- 단계 간 자동 승격 vs 수동 승인
- 자동 rollback 트리거 (heartbeat 실패율, audit error rate)
- scope 대상 (BrandHQ / Branch / EdgePos / Distributor)
- 일정 (즉시 / 예약)

---

### 2.5 Governance (7 sub-area, 18 화면)

#### 2.5.1 Licenses (3 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-LIC-001` | `/governance/licenses` | 라이선스 목록 | `platform.audit.read` (TODO: 전용 키) | `licenses(skip, take)` |
| `SA-LIC-002` | `/governance/licenses/:id` | 라이선스 상세 | (read) | `license(id)` |
| `SA-LIC-003` | `/governance/licenses/new` | 라이선스 발급 | (write) | `createLicense` (TBD) + soft delete via `deleteLicense` |

**필드**: scopeType / scopeId / licenseCode / licenseType / status / effectiveFrom / effectiveTo / maxBranchCount / maxTerminalCount / allowedCountryCode / licensePayloadJson

#### 2.5.2 Entitlements (1 화면 + 4 액션)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-ENT-001` | `/governance/entitlements` | BrandHq capability 매트릭스 | (read) | `brandHqEntitlements(brandHqId?)` |

**액션** (모달):
- `grantBrandHqCapability(input)` — POS / MEAL_TICKET 발급 (TRIAL/ACTIVE)
- `suspendBrandHqCapability(id, reason)` — 일시정지
- `resumeBrandHqCapability(id)` — 재개
- `revokeBrandHqCapability(id, reason)` — 영구 회수

**매트릭스 표시**:

```
브랜드명           POS              MEAL_TICKET
Brand A            ACTIVE           ACTIVE
Brand B            ACTIVE           TRIAL (D-7)
Brand C            ACTIVE           —
```

#### 2.5.3 Platform Policies (3 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-POL-001` | `/governance/platform-policies` | 정책 목록 | (read) | `policies(scopeType, scopeId)` |
| `SA-POL-002` | `/governance/platform-policies/:id` | 정책 상세 (버전 이력) | (read) | `policy(id)` |
| `SA-POL-003` | `/governance/platform-policies/new` | 신규 정책 (버전 증가) | (write) | `createPlatformPolicy` (TBD) |

**대표 키 카탈로그**:

| policyKey | scopeType | 의미 |
|---|---|---|
| `auth.max_login_attempts` | GLOBAL / BRAND_HQ | 로그인 시도 제한 |
| `auth.login_window_seconds` | GLOBAL | rate limit window |
| `graphql.max_complexity` | GLOBAL | (override) |
| `graphql.persisted_only` | GLOBAL | persisted query 강제 |
| `realtime.hmac_required` | GLOBAL | HMAC 강제 |

#### 2.5.4 RBAC Roles (3 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-RBAC-ROLE-001` | `/governance/rbac/roles` | 역할 목록 | `platform.rbac.read` | `rbacRoles` |
| `SA-RBAC-ROLE-002` | `/governance/rbac/roles/:id` | 역할 상세 + 권한 부여 | `platform.rbac.read/write` | `rbacRolePermissions(roleId)`, `rbacAddPermissionToRole`, `rbacRemovePermissionFromRole` |
| `SA-RBAC-ROLE-003` | `/governance/rbac/roles/new` | 신규 역할 | `platform.rbac.write` | `rbacCreateRole`, `rbacUpdateRole`, `rbacDeleteRole` |

#### 2.5.5 RBAC Permissions (1 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-RBAC-PERM-001` | `/governance/rbac/permissions` | 권한 카탈로그 (read-only) | `platform.rbac.read` | `rbacPermissions` |

#### 2.5.6 RBAC Assignments (1 화면 + 모달)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-RBAC-ASSIGN-001` | `/governance/rbac/assignments?userType=&userId=` | 사용자별 역할 할당 | `platform.rbac.read/write` | `rbacUserAssignments`, `rbacAssignRole`, `rbacRevokeRoleAssignment` |
| (모달) `SA-RBAC-EFF-001` | — | 효과적 권한 미리보기 | (read) | `rbacEffectivePermissions(userType,userId,scope)` |

**4 축 scope 입력**: distributorId / brandHqId / branchId / corporateId. corporate 는 다른 3축과 상호 배타 (CentralApi 가 강제, UI 도 동일 검증).

#### 2.5.7 SuperAdmin Users (3 화면)

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-USER-001` | `/governance/users` | 사용자 목록 | `platform.user.read` | `authAccounts(userType?, skip, take)` |
| `SA-USER-002` | `/governance/users/:id` | 사용자 상세 | `platform.user.read` | `authAccount(id)` |
| `SA-USER-003` | `/governance/users/new` | 사용자 신규 | `platform.user.write` | `createAuthAccount` |

userType 필터로 SUPER_ADMIN / DISTRIBUTOR_USER / BRAND_ADMIN / CORPORATE_ADMIN 4 가지 모두 통합 관리.

---

### 2.6 Operations (5 화면)

#### `SA-OP-SYNC-001` Sync Monitor

| 항목 | 내용 |
|---|---|
| **Route** | `/operations/sync` |
| **권한** | (TBD `platform.ops.read`) |
| **목적** | SyncOutbox 와 sync.upstream / downstream 이벤트 stream 모니터 |
| **연결 operations** | `syncEventConnection(first, after, status?, channel?)`, `syncStatus(edgePosId)` |
| **컬럼** | createdAt / channel / scopeType / scopeId / status / retryCount / lastError / pickedAt / ackedAt / workerId |
| **필터** | status (PENDING/PROCESSING/ACKED/FAILED), channel, scopeType, 기간 |
| **realtime** | `sync.upstream.accepted` / `sync.upstream.duplicate` topic 구독 |
| **액션** | FAILED row 강제 retry (Phase 2), 전체 확인 표시 |

#### `SA-OP-RT-001` Realtime Health

| 항목 | 내용 |
|---|---|
| **Route** | `/operations/realtime` |
| **목적** | 9 개 topic 그룹의 실시간 발행률, 구독자 수, 지연 |
| **표시** | topic 별 last 5min publish count, current subscribers, p50/p99 latency |
| **realtime** | 모든 topic 메타 stream 구독 |

#### `SA-OP-TEL-001` EdgePos Telemetry

| 항목 | 내용 |
|---|---|
| **Route** | `/operations/telemetry` |
| **목적** | 모든 EdgePos 단말의 heartbeat 그리드 |
| **그리드** | branch 별 column, 단말 별 row, 색상 = heartbeat 신선도 |
| **realtime** | `edgepos.runtime.heartbeat` 전체 구독 |
| **드릴다운** | 셀 클릭 → SA-EDGEPOS-002 |

#### `SA-OP-INC-001` Incidents (Phase 2)

장애/알림 인박스. 자동 감지 (heartbeat 결손, sync 실패율 급증, 라이선스 만료) + 수동 등록.

#### `SA-OP-RS-001` Remote Support (Phase 2)

원격 지원 세션 카탈로그. 단말 로그 수집, screen mirror (Phase 3+).

---

### 2.7 Audit & System (5 화면)

#### `SA-SYS-AUDIT-001` Audit Log

| 항목 | 내용 |
|---|---|
| **Route** | `/system/audit` |
| **권한** | `platform.audit.read` |
| **연결 operations** | `auditLogConnection(first, after, filter)`, `auditLog(id)` |
| **필터** | actorType, actorId, actionType, targetType, targetId, dateFrom, dateTo |
| **컬럼** | createdAt / actorType / actorId / actionType / targetType / targetId / requestId / ipAddress |
| **상세 모달** | beforeDataJson vs afterDataJson diff viewer |
| **페이징** | keyset cursor (auditLogConnection) |

#### `SA-SYS-REF-CUR-001 / 002` Currency

| ID | Route | Title | 권한 | Operations |
|---|---|---|---|---|
| `SA-SYS-REF-CUR-001` | `/system/reference/currencies` | 통화 목록 | (TBD `platform.reference.read`) | `currencies(skip,take)` |
| `SA-SYS-REF-CUR-002` | `/system/reference/currencies/:id` | 통화 상세 | (read+write) | `currency(id)`, `createCurrency`, `updateCurrency` |

`SA-SYS-REF-LANG-001/002` Language, `SA-SYS-REF-REG-001/002` Region 도 동일 패턴.

#### `SA-SYS-HEALTH-001` System Health

| 항목 | 내용 |
|---|---|
| **Route** | `/system/health` |
| **목적** | CentralApi / Redis / Postgres / Realtime / SyncWorkers 의 헬스 |
| **표시** | health endpoint 응답, redis ping, prisma slow query 카운트, persisted query allow-list 상태 |

---

## 3. 권한 매트릭스 (Role × Action)
## 3. Ma trận quyền (Role × Action)

CentralApi 의 39 개 권한 키는 SuperAdmin Portal 의 sub-role 4 종으로 묶어 운영한다.

### 3.1 SuperAdmin 4 sub-role

| sub-role | 의미 | 권한 묶음 |
|---|---|---|
| `PLATFORM_SUPER_ADMIN` | 모든 권한 | 전체 39 키 + 미래 키 |
| `PLATFORM_OPS` | 운영/모니터링 | `platform.audit.read`, 모든 `*.read`, `edgepos.terminal.read`, `corporate.transaction.read`, sync/realtime operations 화면 접근 |
| `PLATFORM_BILLING` | 라이선스/계약 | `platform.audit.read`, license/entitlement read+write, distributor/brand profile read |
| `PLATFORM_SUPPORT` | 원격 지원 | 모든 `*.read`, audit read, telemetry, remote support 화면 |

> sub-role 자체는 Role 테이블에 seed 로 삽입하고 `roleCode` 를 위 4 종으로 등록한다. PermissionService 의 동적 RBAC 가 그대로 평가한다.

### 3.2 화면 × sub-role 접근 표 (요약)

| 영역 | PLATFORM_SUPER_ADMIN | PLATFORM_OPS | PLATFORM_BILLING | PLATFORM_SUPPORT |
|---|---|---|---|---|
| Dashboard | RW | R | R | R |
| Tenants/Distributors | RW | R | R | R |
| Tenants/Brands | RW | R | R | R |
| Tenants/Brands/Branches | RW | R | — | R |
| Tenants/Brands/Branches/EdgePos | RW + 제어 | R + 제어 | — | R |
| Tenants/Corporates | RW | R | R | R |
| Tenants/Brands/Catalog | RW | R | — | R |
| Deploy | RW | R | — | R (rollout 모니터) |
| Governance/Licenses | RW | R | RW | R |
| Governance/Entitlements | RW | R | RW | R |
| Governance/Platform Policies | RW | R | — | — |
| Governance/RBAC | RW | R | — | — |
| Governance/Users | RW | R | — | — |
| Operations | RW | RW | — | RW |
| Audit | R | R | R | R |
| System/Reference | RW | R | — | — |
| System/Health | R | R | R | R |

> R = 읽기, RW = 읽기+쓰기, "—" = 화면 자체 숨김 (메뉴 표시 안 함).

### 3.3 가드 강제 지점

1. **메뉴 트리 (NavigationRail)**: `me.permissions` 결과로 메뉴 노드 자동 hide
2. **route guard**: 모든 page 가 `requirePermission(['key1','key2'])` HOC 또는 미들웨어 통과
3. **컴포넌트 단**: write 버튼은 권한 충족 시에만 enabled (서버 가드와 이중 방어)
4. **서버 단**: CentralApi 의 `PermissionGuard` 가 모든 mutation fail-closed (Portal UI 가 노출해도 서버가 거절)

---

## 4. GraphQL Operation 카탈로그
## 4. Danh mục GraphQL operation

SuperAdmin Portal 이 호출하는 모든 operation 은 `SharedContracts/ApiSdk` 에 정의되어 있어야 한다. 카테고리:

### 4.1 Read

| 카테고리 | Query 명 | 인자 | 반환 |
|---|---|---|---|
| Identity | `me` | — | `AuthAccount` |
| Identity | `authAccounts` | userType?, skip, take | `[AuthAccount]` |
| Identity | `authAccount` | id | `AuthAccount` |
| Tenant | `distributors / distributor` | skip, take / id | `[Distributor]` / `Distributor` |
| Tenant | `brands / brand` | skip, take, distributorId? / id | `[Brand]` / `Brand` |
| Tenant | `branches / branch` | brandHQId?, skip, take / id | `[Branch]` / `Branch` |
| Tenant | `edgePosTerminals / edgePosTerminal` | branchId?, skip, take / id | `[EdgePosTerminal]` / `EdgePosTerminal` |
| Brand Catalog | `menuCategories / menuCategory` | brandHQId / id | … |
| Brand Catalog | `menuItems / menuItem` | brandHQId, categoryId? / id | … |
| Brand Catalog | `pricePolicies / pricePolicy` | brandHQId / id | … |
| Brand Catalog | `promotions / promotion` | brandHQId / id | … |
| Deploy | `deployPackages / deployPackage` | skip, take / id | … |
| Deploy | `deployReleases / deployRelease` | scopeType?, scopeId? / id | … |
| Governance | `licenses / license / licensesByScope` | … | … |
| Governance | `brandHqEntitlements / brandHqActiveCapabilities` | brandHqId? | … |
| Governance | `policies / policy / effectivePolicy` | scopeType, scopeId? / policyKey + scopeChain | … |
| Governance | `rbacRoles / rbacPermissions / rbacRolePermissions / rbacUserAssignments / rbacEffectivePermissions` | … | … |
| Corporate | `mealCorporates / mealCorporate / mealDepartments / mealEmployees / mealWallet / mealWalletsByCorporate / mealPoliciesByCorporate / mealPolicy / mealTransaction / mealTransactionsByCorporate / mealTransactionsByBrand / mealSettlementBatchesByBrand / mealSettlementBatch / mealMerchantEnrollment / mealMerchantEnrollments / mealConsolidatedInvoices / mealConsolidatedInvoice` | … | … |
| Sync | `syncStatus / syncEventConnection` | edgePosId / first, after, filter | … |
| Audit | `auditLogs / auditLogConnection / auditLog` | filter / first, after, filter / id | … |
| Reference | `currencies / currency / languages / language / regions / region` | … | … |

### 4.2 Write

| 카테고리 | Mutation 명 | 권한 | 비고 |
|---|---|---|---|
| Identity | `login` | (public) | rate-limited |
| Identity | `createAuthAccount / updateAuthAccount / deleteAuthAccount / changePassword` | `platform.user.write` (changePassword 는 self) | |
| Tenant | `createDistributor / updateDistributor / deleteDistributor` | `distributor.profile.write` | |
| Tenant | `createBrand / updateBrand / deleteBrand` | `brand.profile.write` | |
| Tenant | `createBranch / updateBranch / deleteBranch` | `brand.branch.write` | |
| Tenant | `registerEdgePos / updateEdgePosStatus / deleteEdgePos` | `edgepos.terminal.write` | |
| Brand Catalog | `createMenuCategory / updateMenuCategory / deleteMenuCategory` | `brand.catalog.write` | |
| Brand Catalog | `createMenuItem / updateMenuItem / deleteMenuItem` | `brand.catalog.write` | |
| Brand Catalog | `deletePricePolicy / deletePromotion` | `brand.catalog.write` | create/update 는 별도 도메인 service 추가 백로그 |
| Governance | `deleteLicense` | (TBD) | create/update 는 백로그 |
| Governance | `grantBrandHqCapability / suspendBrandHqCapability / resumeBrandHqCapability / revokeBrandHqCapability` | (entitlement-specific, TBD 키) | |
| RBAC | `rbacAssignRole / rbacRevokeRoleAssignment / rbacCreateRole / rbacUpdateRole / rbacDeleteRole / rbacAddPermissionToRole / rbacRemovePermissionFromRole` | `platform.rbac.write` | |
| Corporate | `createMealCorporate / updateMealCorporate / deleteMealCorporate / createMealDepartment / createMealEmployee / createMealWallet / fundMealWallet / createMealPolicy / deleteMealPolicy / authorizeMealTransaction / reverseMealTransaction / runMealSettlementBatch / generateMealConsolidatedInvoice / submitMealConsolidatedInvoice / enrollMealMerchant / activateMealMerchant / deactivateMealMerchant / setMealMerchantCommission / setMealMerchantSettlementAccount` | `corporate.*` | 권한 키는 leaf 별로 다름 (위 카탈로그 참조) |
| Reference | `createCurrency / updateCurrency / createLanguage / updateLanguage / createRegion / updateRegion` | (TBD `platform.reference.write`) | |
| Sync | (REST `POST /api/v1/sync/upstream`) | (HMAC) | EdgePos → SuperAdmin direction |

### 4.3 Realtime Subscription (Socket.IO)

| topic 그룹 | 이벤트 | 사용 화면 |
|---|---|---|
| `platform.superadmin.audit.created` | audit 생성 | Dashboard, Audit |
| `platform.superadmin.policy.changed` | 정책 변경 | Platform Policies |
| `platform.superadmin.license.changed` | 라이선스 변경 | Licenses |
| `brand.profile.changed(brandHQId)` | 브랜드 프로필 변경 | Brand 상세 |
| `brand.catalog.changed(brandHQId)` | 카탈로그 변경 | Brand Catalog 탭 |
| `brand.deploy.released(brandHQId)` | 배포 발생 | Rollout 모니터 |
| `corporate.*.changed(corporateId)` | 식권 도메인 변경 | Corporate sub-pages |
| `edgepos.terminal.changed(id)` / `edgepos.runtime.heartbeat(id)` / `edgepos.runtime.changed(id)` | 단말 상태 | EdgePos 상세, Telemetry |
| `sync.upstream.accepted/duplicate(id)` | sync 이벤트 | Sync Monitor |
| `cache.invalidated` | 캐시 무효화 | (Apollo cache 자동 invalidate) |

> Apollo Client 는 `useSubscription` 으로 위 topic 을 구독해 캐시를 무효화하거나 UI 를 즉시 갱신한다.

---

## 5. 운영 절차 (Standard Operating Procedures)
## 5. Quy trình vận hành chuẩn

### 5.1 신규 브랜드 온보딩 (대표 시나리오)

```
1. 영업/계약 완료 후 SuperAdmin 이 PLATFORM_BILLING 권한으로
   /tenants/distributors/new 에서 대리점 등록 (또는 기존 대리점 선택)
2. /tenants/brands/new 에서 BrandProfile 생성 (distributorId 지정)
3. /governance/licenses/new 에서 PlatformLicense 발급
   - scopeType=BRAND_HQ, scopeId=brand.id, licenseType=Standard, effectiveTo=계약 종료
4. /governance/entitlements 에서 grantBrandHqCapability(brandHqId, capability=POS, startAsTrial=false)
5. /tenants/brands/:id/admins 에서 BRAND_ADMIN 계정 1 명 이상 생성
6. /tenants/brands/:id/branches/new 에서 첫 지점 등록 (선택)
7. /tenants/brands/:id/branches/:branchId/edge-pos/register 에서 단말기 등록 (선택)
8. AuditLog 자동 기록 → /system/audit 에서 ENTITLEMENT_GRANT, BRAND_CREATE, USER_CREATE 이력 확인
```

### 5.2 식권 고객사 온보딩 (별도 축)

```
1. /tenants/corporates/new 에서 MealCorporate 생성
   - tenantCode, companyName, taxCode, fundingModel
2. fundingModel=PREPAID_DEPOSIT 인 경우 외부 송금 후 SuperAdmin 이
   monthlyBudgetVnd / depositBalanceVnd 수동 조정 (Phase 2: 충전 mutation)
3. /tenants/corporates/:id/admins 에서 CORPORATE_ADMIN 계정 생성
4. /governance/entitlements 에서 grant MEAL_TICKET capability — 단,
   브랜드 entitlement 가 아니라 corporate 와는 별개. 현재는 brand 측만 grant
5. /tenants/corporates/:id/departments + /employees 에서 사용자 등록
6. /tenants/corporates/:id/wallets/new 로 임직원 식권 계정 발급
7. /tenants/corporates/:id/policies/new 로 식대 정책 등록
```

### 5.3 단계적 롤아웃 (Phase 2)

```
1. /deploy/packages/new 에서 신규 패키지 등록 (artifactUrl, checksum)
2. /deploy/releases/new 에서 DeployRelease 생성
   - scopeType=BRAND_HQ, scopeId=대상 브랜드
   - 단계: canary → 10% → 50% → 100%
   - 단계 간 자동 승격 임계값 (heartbeat 신선도 ≥ 90%, audit ERROR rate ≤ 1%)
3. /deploy/rollouts/:id 에서 단계별 진행 모니터
4. realtime brand.deploy.released topic 으로 적용 ACK 수집
5. 임계값 위반 시 자동 rollback 트리거 → 전체 단말 이전 버전으로 복귀
```

### 5.4 인시던트 대응

```
1. EdgePos heartbeat 결손 → /operations/telemetry 의 빨강 셀
2. Sync FAILED 급증 → /operations/sync 의 status=FAILED 필터
3. 인시던트 자동 등록 (Phase 2) → /operations/incidents 에서 대응
4. 원격 지원 필요 → /operations/remote-support 에서 세션 시작 (Phase 3)
5. 모든 조치 → audit 자동 기록
```

### 5.5 권한 변경 (RBAC)

```
1. /governance/users 에서 대상 사용자 선택
2. /governance/rbac/assignments?userType=&userId= 로 이동
3. + 역할 부여 → role + scope (4 축) 입력 → rbacAssignRole
4. 효과 미리보기: rbacEffectivePermissions(userType, userId, scope)
5. AuditLog 자동 기록 (RBAC_ASSIGN_ROLE)
6. PermissionService.invalidate() 가 RBAC 캐시 + TenantContext 캐시 동시 무효화
```

---

## 6. 비기능 요구사항 (NFR)
## 6. Yêu cầu phi chức năng

### 6.1 성능

| 지표 | 목표 |
|---|---|
| 페이지 첫 로드 | ≤ 2.0s (LCP) |
| 페이지 전환 | ≤ 300ms (Apollo cache hit) |
| 목록 query 응답 | ≤ 500ms p95 (CentralApi) |
| Realtime 갱신 | ≤ 1s end-to-end |
| Persisted query | 100% 적용 (production) |

### 6.2 보안

- 모든 SuperAdmin route 는 JWT 인증 + RBAC permission guard 필수
- session 만료 시 자동 로그아웃 + 마지막 route 기억 후 재로그인
- 민감 액션 (deleteDistributor, revokeBrandHqCapability, deleteAuthAccount, runMealSettlementBatch) 은 **2단계 확인 모달** + 사유 입력 강제
- 모든 mutation 은 audit 로 기록 (서버 측 자동) — UI 는 audit ID 를 응답에서 받아 사용자에게 안내
- CSRF: REST 는 사용 안 함 (POS 인증 외). GraphQL 은 Bearer token 만 사용
- Persisted Query Allow-List: production 강제 (`GRAPHQL_PERSISTED_QUERY_ALLOW_LIST_ENABLED=true`)

### 6.3 접근성 (a11y)

- WCAG 2.1 AA 준수
- 모든 액션 키보드 네비게이션 지원
- color contrast ≥ 4.5:1
- 모든 form input 에 label
- error 메시지는 i18n key 기반 (한·영·베)

### 6.4 i18n

- 기본 locale: ko / en / vi
- 모든 화면 텍스트는 `SuperAdmin/Portal/i18n/` 카탈로그에서 해석
- 서버 메시지 (DomainError) 는 `Accept-Language` 헤더로 협상
- 날짜/숫자/통화는 locale 별 포맷터 사용

### 6.5 관측성

- 모든 page view → analytics 이벤트
- 모든 mutation → success/failure 비율 추적
- realtime topic 별 throughput 모니터링
- error reporting (Sentry 또는 동등) 통합
- requestId 를 모든 토스트/에러 모달에 표시 (디버깅)

### 6.6 빌드/배포

- Next.js (App Router) + Apollo Client
- `SharedContracts/ApiSdk` 를 통한 typed operation 호출
- persisted query manifest 자동 생성 → CentralApi 의 allow-list 와 자동 일치
- production 빌드는 SDK validate 단계를 prebuild 로 강제

---

## 7. 화면 구조 & UI 패턴
## 7. Cấu trúc UI

### 7.1 글로벌 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│ TopBar : [Logo] [환경뱃지] [searchbar] [locale] [me ▼] [logout] │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│ Side     │                                                       │
│ Nav      │                Page Content                          │
│          │                                                       │
│ (7 영역) │                                                       │
│          │                                                       │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

- TopBar: 환경 뱃지 (DEV/STG/PROD), 글로벌 검색 (테넌트/사용자/단말 검색), me 메뉴 (changePassword), locale 토글 (ko/en/vi)
- SideNav: 7 영역 + 하위 leaf, 권한 없는 항목은 hide
- Breadcrumb: 모든 페이지 상단

### 7.2 공통 컴포넌트 (디자인 시스템)

| 컴포넌트 | 용도 | shared/ui |
|---|---|---|
| `DataTable` | 모든 목록 화면 | 정렬 / 필터 / pagination / 행 선택 |
| `DetailHeader` | 상세 상단 | 타이틀 / 상태 뱃지 / 액션 버튼 그룹 |
| `TabBar` | 상세 탭 | 권한별 탭 visibility |
| `FormDialog` | 생성/수정 모달 | typed form + class-validator 동기화 |
| `ConfirmDialog` | 위험 액션 2단계 확인 | 사유 입력 강제 옵션 |
| `JsonDiffViewer` | audit 상세의 before/after diff | |
| `StatusBadge` | ACTIVE/SUSPENDED/REVOKED 등 | 색상 토큰 |
| `ScopePicker` | 4 축 scope 입력 | distributor/brand/branch/corporate 상호 배타 강제 |
| `RealtimeIndicator` | 화면 우상단의 LIVE 점멸 | 구독 중 topic 표시 |
| `EmptyState` | 빈 상태 | 아이콘 + 안내 + CTA |
| `ErrorBoundary` | fallback | requestId 노출 |

### 7.3 빈 상태 / 로딩 / 에러 표준

| 상태 | UI |
|---|---|
| 로딩 | skeleton (목록), spinner (상세) |
| 빈 상태 | `EmptyState` 컴포넌트 + CTA (권한 충족 시) |
| 권한 없음 | lock 아이콘 + "접근 권한이 없습니다 — 관리자에게 문의" |
| 네트워크 오류 | 토스트 + 재시도 버튼 |
| 서버 에러 | `ErrorBoundary` + requestId + 신고 버튼 |
| stale (realtime) | "데이터가 업데이트되었습니다 — 새로고침" 토스트 |

---

## 8. Operation 백로그 (CentralApi 측 신규 추가 필요)
## 8. Backlog cần thêm trên CentralApi

다음 operation 은 SuperAdmin Portal 의 화면이 필요로 하지만 아직 CentralApi 에 없다. 별도 backlog 로 관리.

| operation | 화면 | 우선순위 |
|---|---|---|
| `createPricePolicy / updatePricePolicy` | SA-CAT-PRICE | P1 |
| `createPromotion / updatePromotion` | SA-CAT-PROMO | P1 |
| `createDeployPackage` | SA-DEPLOY-PKG-003 | P1 |
| `createDeployRelease` (단계적 롤아웃 정책 포함) | SA-DEPLOY-REL-003 | P1 |
| `createLicense / updateLicense` | SA-LIC-003 | P0 |
| `createPlatformPolicy / updatePlatformPolicy` | SA-POL-003 | P1 |
| `me { permissions }` 확장 (effective set 응답에 포함) | NavigationRail 권한 가드 | P0 |
| `incidents` 도메인 (목록/생성/해결) | SA-OP-INC | P2 |
| `remoteSupportSessions` 도메인 | SA-OP-RS | P3 |
| `createDistributor / updateDistributor` 의 territory/contract 자식 mutation | SA-DIST-002 탭 | P1 |
| `EdgePos remote control` (재시작/격리/로그수집) | SA-EDGEPOS-004 | P2 |
| `permissionScope` 누적 RBAC 키 (`platform.deploy.read/write`, `platform.reference.read/write`, `platform.ops.read`) | governance & operations 화면 | P0 |

> 위 P0 항목은 Portal Phase 1 작업과 병행해 CentralApi 에 먼저 추가한다.

---

## 9. 구현 우선순위 (Phase 계획)
## 9. Lộ trình triển khai

### Phase 1 (MVP — 4~6 weeks)

가장 시급한 화면을 통해 SuperAdmin 이 **신규 브랜드를 끝까지 온보딩** 할 수 있도록 한다.

1. **Auth + Layout** : login, me, NavigationRail, route guard, locale, persisted query 적용
2. **Dashboard (SA-DASH-001)** : 카운터 + 최근 audit + 만료 임박 license
3. **Tenants/Distributors (SA-DIST-001~004)** : 4 화면
4. **Tenants/Brands (SA-BRAND-001~005)** : 5 화면
5. **Brands/Branches (SA-BRANCH-001~004)** : 4 화면
6. **Brands/Branches/EdgePos (SA-EDGEPOS-001~003)** : 3 화면 (control 제외)
7. **Governance/Licenses (SA-LIC-001~003)** : 3 화면
8. **Governance/Entitlements (SA-ENT-001)** : 1 화면 + 4 액션
9. **Governance/RBAC (SA-RBAC-*)** : 5 화면
10. **Governance/Users (SA-USER-001~003)** : 3 화면
11. **System/Audit (SA-SYS-AUDIT-001)** : 1 화면

소계: **약 33 화면**

### Phase 2 (Brand Catalog + Corporate + Operations — 4~6 weeks)

12. **Brand Catalog 전체 (SA-CAT-*)** : 12 화면
13. **Tenants/Corporates (SA-CORP-001~008)** : 8 화면
14. **Corporate sub-pages (SA-CORP-WALLET/POL/TX/SET/INV)** : 11 화면
15. **Operations/Sync + Telemetry (SA-OP-SYNC, SA-OP-TEL)** : 2 화면
16. **System/Reference (Currency/Language/Region)** : 6 화면

소계: **약 39 화면**

### Phase 3 (Deploy + Realtime Health + Incidents + Remote Support — 4 weeks)

17. **Deploy 전체 (SA-DEPLOY-*)** : 8 화면
18. **Operations/Realtime + Incidents + Remote Support** : 3 화면
19. **Governance/Platform Policies** : 3 화면

소계: **약 14 화면**

**전체 총합 ≈ 86 화면**

---

## 10. 추적 (현행 구현 ↔ 본 문서)
## 10. Truy vết (mã hiện tại ↔ tài liệu)

| 본 문서 | CentralApi 위치 | 비고 |
|---|---|---|
| `distributor.profile.*` | `src/platform/distributor/profile/distributor.{resolver,service}.ts` | |
| `brand.profile.*` | `src/platform/brand/profile/brand.{resolver,service}.ts` | |
| `brand.branch.*` | `src/platform/branch/profile/branch.{resolver,service}.ts` | Brand 상세 탭 |
| `brand.catalog.*` | `src/platform/brand/catalog/{menu-category,menu-item,price-policy,promotion}/*.{resolver,service}.ts` | Brand 상세 탭 |
| `edgepos.terminal.*` | `src/platform/edge-pos/edge-pos.{resolver,service}.ts` | |
| `corporate.*` (9 leaf) | `src/platform/corporate/{profile,wallet,policy,transaction,settlement,merchant,einvoice}/*.{resolver,service}.ts` | |
| `platform.user.*` | `src/platform/superadmin/auth/auth.{resolver,service}.ts` | |
| `platform.rbac.*` | `src/platform/superadmin/rbac/permission.resolver.ts` + `src/core/rbac/permission.service.ts` | |
| `platform.audit.*` | `src/platform/superadmin/audit/audit.resolver.ts` + `src/core/audit/audit.service.ts` | |
| License | `src/platform/superadmin/license/license.{resolver,service}.ts` | |
| PlatformPolicy | `src/platform/superadmin/platform-policy/platform-policy.{resolver,service}.ts` | |
| Entitlement | `src/shared/entitlement/entitlement.{resolver,service}.ts` | |
| Sync | `src/shared/sync/sync.{resolver,controller,service}.ts` | |
| Reference | `src/shared/reference/{currency,language,region}/*.{resolver,service}.ts` | |
| Realtime topics | `src/core/realtime/topics/realtime-topics.ts` | 9 topic 그룹 |
| GovernanceModule (group) | `src/platform/superadmin/governance.module.ts` | License + PlatformPolicy aggregator |

---

## 11. 비책임 범위 (Out of Scope)
## 11. Phi phạm vi

다시 명시한다. SuperAdmin Portal 은 아래를 **하지 않는다**:

- POS 매장 운영 화면 (주문/결제/테이블/주방/장치 제어) — `BrandPosApp` 의 책임
- 브랜드 본사 일상 운영 (직원 출퇴근/지점 마감/리포트 다운로드) — `BrandHQPortal` 책임
- 식권 사용자 화면 (개인 충전/식사 인증) — `CorporatePortal` 책임
- DB 직접 조회 (모든 데이터 액세스는 GraphQL operation 경유)
- 백엔드 비즈니스 로직 중복 (SuperAdmin Portal 은 thin client; 모든 검증은 서버 단)
- EdgePos 로컬 거래 원본 보유 (CentralApi 도 보유하지 않으므로 동일)
- 매장 매출/주문 원본 — Edge → SyncWorker → CentralApi 로 흐른 read model 만 표시

---

## 12. 다음 단계
## 12. Bước tiếp theo

1. 본 문서 리뷰/승인
2. `SuperAdmin/Portal/` 디렉토리에 Next.js (App Router) 스캐폴딩 + Apollo Client + i18n 셋업
3. **Phase 1 백로그 33 화면** 의 작업 분할 (1 화면 = 1 PR 원칙)
4. CentralApi 의 P0 backlog (`me { permissions }`, `createLicense`, `createPlatformPolicy`, `permissionScope` 신규 키) 동시 진행
5. `SharedContracts/ApiSdk` 의 Portal-side operation 추가 (Phase 1 화면에 필요한 모든 query/mutation)
6. 디자인 시스템 (`shared/ui`) 의 12 공용 컴포넌트 우선 구현
7. CI 에 Portal build + persisted query manifest sync 통합

---

## 부록 A. 권한 키 카탈로그 (39 키 + 백로그 5 키)
## Phụ lục A. Catalog quyền hạn

### A.1 현행 (39 키, CentralApi seed)

| 키 | 의미 |
|---|---|
| `platform.audit.read` | Audit 조회 |
| `platform.user.read / write` | SuperAdmin 사용자 조회/관리 |
| `platform.rbac.read / write` | RBAC 조회/관리 |
| `distributor.profile.read / write` | 대리점 |
| `brand.profile.read / write` | 브랜드 |
| `brand.branch.read / write` | 지점 |
| `brand.catalog.read / write` | 브랜드 카탈로그 (Brand 상세 탭, menu/price/promo) |
| `edgepos.terminal.read / write` | EdgePos 단말 |
| `corporate.profile.read / write` | 식권 고객사 |
| `corporate.department.read / write` | 부서 |
| `corporate.employee.read / write` | 임직원 |
| `corporate.wallet.read / write / fund / topup` | 식권 계정/allowance ledger (fund 는 회사지원금, topup 은 개인충전) |
| `corporate.policy.read / write` | 식대 정책 |
| `corporate.transaction.read / authorize / reverse` | 거래 |
| `corporate.settlement.read / run` | 정산 |
| `corporate.merchant.read / enroll / activate / commission.write / account.write` | 가맹점 |
| `corporate.invoice.read / write` | 통합 전자세금계산서 |

### A.2 백로그 (5 키, P0)

| 키 | 의미 | 화면 |
|---|---|---|
| `platform.deploy.read / write` | 배포 패키지/릴리스 | Deploy 영역 |
| `platform.reference.read / write` | 마스터 데이터 | System/Reference |
| `platform.ops.read` | 운영 모니터링 | Operations |

---

## 부록 B. Prisma 모델 ↔ 화면 매핑 (44 모델)
## Phụ lục B. Map model Prisma ↔ màn hình

| 모델 | 주 화면 |
|---|---|
| `SuperAdminUser` | SA-USER-* |
| `Permission / Role / RolePermission / UserRoleAssignment` | SA-RBAC-* |
| `PlatformLicense` | SA-LIC-* |
| `PlatformPolicy` | SA-POL-* |
| `AuditLog` | SA-SYS-AUDIT-001, Dashboard |
| `DeployPackage / DeployRelease` | SA-DEPLOY-* |
| `DistributorProfile / DistributorContract / Territory / BrandAssignment / DeploymentScope / DistributorUser` | SA-DIST-* |
| `BrandProfile / BrandAdminUser / OperatorTemplate` | SA-BRAND-* |
| `Branch / BranchOverride` | SA-BRANCH-* |
| `EdgePosTerminal` | SA-EDGEPOS-*, SA-OP-TEL-001 |
| `BrandMenuCategory / BrandMenuItem / PricePolicy / Promotion` | SA-CAT-* |
| `BrandHqEntitlement` | SA-ENT-001 |
| `MealCorporate / MealCorporateDepartment / MealEmployee / CorporateAdminUser` | SA-CORP-001~007 |
| `MealWallet / MealFundingAccount` | SA-CORP-WALLET-*, SA-CORP-008 |
| `MealPolicy` | SA-CORP-POL-* |
| `MealTransaction` | SA-CORP-TX-* |
| `MealSettlementBatch` | SA-CORP-SET-* |
| `MealMerchantEnrollment / MealMerchantCommissionRate / MealMerchantSettlementAccount` | SA-CORP-MERCH-* |
| `MealConsolidatedEInvoice` | SA-CORP-INV-* |
| `SyncOutbox` | SA-OP-SYNC-001 |
| `Currency / Language / Region` | SA-SYS-REF-* |

---

---

## 13. 식권 도메인 확장 기능 (베트남 B2B 식권 사업 기획서 반영)
## 13. Mở rộng chức năng domain phiếu ăn (theo tài liệu kinh doanh)

> `1.Docs/식권관리플랫폼/프로젝트 개요.md` (베트남 B2B 식권 사업 기획서) 분석 결과, 본 문서 §2 의 `corporate.*` 화면 카탈로그가 다루지 못하는 **20 개 핵심 기능 영역** 이 추가로 식별되었다. 본 절은 그 누락분을 통합한다.
>
> 본 절의 모든 항목은 **현재 CentralApi 에 backlog** 로 등록되며, Phase 2~3 의 구현 범위에 포함된다. 일부 항목은 신규 도메인 추가가 필요하므로 §8 의 백로그로도 동시 등록한다.

### 13.1 베트남 e-Invoice 통합 컴플라이언스 (월별 통합 모드 단독)

#### 배경
- **Decree 123/2020**: 종이 영수증 폐지, 전자세금계산서 의무화 (2022-07-01 시행)
- **Decree 70/2025**: F&B / 소매업 POS 와 세무 당국 시스템 직접 연동 의무 (2025-06-01 시행)
- **재무부 통합 인보이스 허용** (Circular 32/2025): B2B 플랫폼의 일/월 단위 합산 인보이스 발행 가능
- **Circular 003/2025 + Decree 44/2025**: 식대 PIT 비과세 한도 폐지 (2025-06-15) → 식대 전액이 corporate 의 손금으로 인정 → 단일 통합 인보이스가 손금 증빙의 핵심

#### 발급 주체 매트릭스 (3 흐름 — 본 시스템 책임은 1개)

| # | Seller (발급자) | Buyer (수령자) | 발급 시점 | 본 시스템 책임 |
|---|---|---|---|---|
| ① | 가맹점 (식당) | 임직원 (개인) | — | **❌ 발급 안 함** — 임직원은 비용 부담자가 아님 |
| ② | 가맹점 (식당) | 플랫폼 사업자 | 매월 정산 | **수령·검증·매칭** (가맹점 자체 발급) |
| ③ | **플랫폼 사업자** | **기업고객 (corporate)** | **매월 1일** | **✅ 본 사양의 핵심 (통합 모드)** |

> **개인 명의 인보이스를 발급하지 않는 이유**: 베트남 적색 송장의 buyer 는 비용을 부담하는 주체. 임직원은 회사 식대를 사용한 것이지 본인 사비가 아님 → buyer 가 될 수 없음. PIT 비과세로 임직원 개인 세무 처리 대상도 아님. Split Payment 의 개인 부담분도 동일 (개인 식비는 손금 대상 아님). 따라서 **`'Khách lẻ' (개인고객)` 케이스는 본 식권 플랫폼에서 발생하지 않는다.**
>
> 상세: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` §4.0

#### 통합 모델 — Provider 추상화 + WeTax 1차

베트남 GDT 와 직접 연동하는 대신 **3rd-party e-Invoice SaaS provider** 를 경유하는 추상화 모델을 채택한다. `EInvoiceProvider` 인터페이스 + 다중 구현체로 설계해 향후 provider 교체/병행이 가능하다.

| Provider | 구현 시점 | 비고 |
|---|---|---|
| **WeTax** (`apitest.wetax.com.vn`) | **Phase 2 P0 — 1차 구현 대상** | 기존 `HJ-POS-TEST/WeTax/WeTaxMgr` (1,842 lines) 에서 **사양 차용**. 코드 자체는 C++ MFC 라 신규 작성. 사양 문서: `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` |
| **Bizzi** (`bizzi.vn`) | Phase 4 | 동일 인터페이스 구현체 추가 |
| **Misa meInvoice** | Phase 4 | 동일 |
| **GDT Direct** (자체 HSM/인증서) | Phase 5+ | 자체 운영. 비용·인증·리스크 큼 |

**WeTax 차용 자산** (HJ-POS-TEST/WeTax/WeTaxMgr 분석 결과):
- API endpoint 2종: `/api/wtx/pa/v1/pos/invoices-publish`, `/api/wtx/pa/v1/company/{taxId}`
- 17개 발급 body 필드 (`t_wetax_invoice_body`, `t_wetax_invoices`, `t_wetax_invoice_details`)
- 9개 응답 필드 (lookup_code, cqt_code, ref_id, serial_no, invoice_no, ...)
- VAT 3분기 (포함/별도/면세), 음수 수량 merge (통합 모드의 환불 차감용), 시리얼 prefix 규칙 (CQT 유무에 따른 C/K)
- KYC 3-source fallback (WeTax → vietqr.io → esgoo.net)
- ❌ **단건 모드의 `'Khách lẻ' / buyerNotGetInvoice=1 / transType='2'(Return)` 분기는 본 플랫폼에서 사용하지 않음** — 상세 §4.0.3

#### 통합 모드 closing 흐름 (5단계)

```
[1] 매일      임직원 결제 → MealTransaction (APPROVED)
[2] 매월 1일  SyncWorkers cron → EInvoiceConsolidationJob
[3] CentralApi  EInvoiceConsolidator.run(corporateId, prevMonth)
              → 가맹점/일/부서/카테고리/단일줄 그룹화 (consolidationStrategy)
              → MealConsolidatedEInvoice (status=DRAFT, refId='MC202603...')
              → MealConsolidatedEInvoiceLine[]
[4] SuperAdmin  /governance/compliance/einvoice/queue 에서 검수 + submit
              → WeTaxProvider.publish(ctx)
              → seller=PlatformLegalEntity (베트남 법인)
              → buyer=corporate (taxCode 필수)
              → buyerNotGetInvoice=0 항상 (사업자 buyer 강제)
              → transType='1' 항상 (환불은 합산 차감)
              → WeTax → GDT → ACCEPTED
[5] corporate  PDF/XML 다운로드 → 재무팀 단일 손금 증빙 처리
```

#### 통합 모드 멱등성 (refId)

```
refId = 'MC' + yyyyMM + corporateId.replace('-','').slice(0,12).toUpperCase()
예:    'MC202603A1B2C3D4E5F6'
```

`@@unique([refId])` 로 같은 corporate × 같은 달의 중복 발급 dedupe. cron 이 재실행되어도 안전.

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-EINV-001` | `/governance/compliance/einvoice/providers` | Provider 카탈로그 (WeTax/Bizzi/Misa) | `platform.einvoice.write` |
| `SA-EINV-002` | `/governance/compliance/einvoice/providers/:id` | Provider config (env/credentials) | `platform.einvoice.write` |
| `SA-EINV-003` | `/governance/compliance/einvoice/queue` | 발급 큐 (DRAFT → BUILT → SUBMITTING → ACCEPTED/REJECTED → VOIDED) | `platform.einvoice.read` |
| `SA-EINV-004` | `/governance/compliance/einvoice/queue/:id` | 발급 상세 + 원본 요청/응답 JSON + retry | `platform.einvoice.write` |
| `SA-EINV-005` | `/governance/compliance/einvoice/kyc` | 사업자번호 KYC 도구 (3-source) | `platform.einvoice.read` |
| `SA-EINV-006` | `/governance/compliance/einvoice/templates` | 시리얼/폼/CQT 정책 템플릿 | `platform.einvoice.write` |
| `SA-COMPLIANCE-005` | `/governance/compliance/regulations` | 베트남 규제 변경 추적 | `platform.compliance.read` |

**SA-EINV-002 Provider config 핵심 필드** (WeTax 기준):

- providerType: `WETAX` / `BIZZI` / `MISA` / `DIRECT_GDT`
- environment: `SANDBOX` / `PRODUCTION`
- baseUrl (예: `https://apitest.wetax.com.vn`)
- credentials (vault): username / password (또는 API key)
- defaultSerialPrefix: `C` (CQT 인증) / `K` (CQT 미인증)
- defaultFormNo, defaultSerialType (`TKT`)
- defaultCurrencyCode (`VND`), defaultExchangeRate
- defaultPaymentMethod (`TM/CK`)
- failover policy (provider 다운 시 다른 provider 로 fallback)

**SA-EINV-003 발급 큐 상태 머신**:

```
DRAFT → BUILT → SUBMITTING → ACCEPTED   (성공)
                          → REJECTED → retry / manual fix
                          → VOIDED      (수동 무효화)
```

- 거절 사유 + 재시도 액션 (백오프)
- 원본 요청/응답 JSON viewer
- realtime topic: `corporate.einvoice.changed(corporateId)` + `platform.einvoice.submission.{accepted,rejected}` (신규)

#### CentralApi 디렉토리 반영 (구체)

| 항목 | 위치 |
|---|---|
| `MealConsolidatedEInvoice` 모델 12 신규 필드 | `prisma/schema/70-mealticket.prisma` |
| `MealConsolidatedEInvoiceLine` 신규 모델 | 동일 |
| `EInvoiceProvider` 신규 모델 | 동일 |
| `EInvoiceProviderConfig` 신규 모델 | 동일 |
| `EInvoiceSubmissionLog` 신규 모델 | 동일 |
| Provider interface | `src/platform/corporate/einvoice/_internal/einvoice-provider.interface.ts` |
| WeTax provider 구현 | `src/platform/corporate/einvoice/_internal/wetax.provider.ts` |
| WeTax HTTP client | `src/platform/corporate/einvoice/_internal/wetax.client.ts` |
| WeTax JSON serializer | `src/platform/corporate/einvoice/_internal/wetax.serializer.ts` |
| WeTax line merger | `src/platform/corporate/einvoice/_internal/wetax.merger.ts` |
| WeTax types | `src/platform/corporate/einvoice/_internal/wetax.types.ts` |
| WeTax constants | `src/platform/corporate/einvoice/_internal/wetax.constants.ts` |
| KYC lookup (3-source) | `src/platform/corporate/einvoice/_internal/kyc-lookup.ts` |
| 신규 mutation | `submitConsolidatedInvoice(id)`, `voidConsolidatedInvoice(id, reason)`, `retryEInvoiceSubmission(id)`, `lookupBuyerByTaxId(taxId)` |
| 신규 권한 키 | `platform.einvoice.read / platform.einvoice.write` |

> **leaf 표준 준수**: einvoice leaf 의 module/resolver/service/dto/models 는 그대로 유지하고, provider 구현은 `_internal/` 폴더에 둔다 (`corporate/_internal/caller-ctx.ts` 와 동일 패턴). 외부에서 provider 구현체에 직접 import 금지 — `einvoice.service` 만 노출.

---

### 13.2 Multi-Tier Commission Engine (다중 수수료 정책 엔진)

#### 배경
- 영세/대형/입지/독점 계약 여부에 따른 차등 수수료 (예: 기본 3% / 특별 상권 5% / 프랜차이즈 8%)
- 현재 `MealMerchantCommissionRate` 모델은 enrollment 단위 시기별 이력만 보유 — **전역 정책 zone/category 자동 적용** 룰이 없음

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-COMMISSION-001` | `/governance/commission/policies` | 수수료 정책 목록 | `corporate.merchant.commission.write` |
| `SA-COMMISSION-002` | `/governance/commission/policies/new` | 정책 빌더 (zone × category × 계약유형) | (write) |
| `SA-COMMISSION-003` | `/governance/commission/zones` | 상권 zone 정의 | (write) |
| `SA-COMMISSION-004` | `/governance/commission/simulator` | 시뮬레이터 (가맹점 입력 → 수수료 계산) | (read) |

**SA-COMMISSION-002 정책 빌더**:

- 입력 매트릭스: zone (지역) × merchantCategory (LOCAL / FRANCHISE / SPECIAL_ZONE / EXCLUSIVE) × volumeTier (월매출 구간)
- 출력: baseRatePct, specialZoneRatePct, franchiseFlatRatePct
- 시기별 effectiveFrom/effectiveTo (자동 승계)
- 적용 시뮬레이션 (해당 정책으로 변경 시 영향받는 가맹점 수)

#### CentralApi 백로그
- 신규 모델: `MerchantCommissionPolicy` (zone, category, tier 룰), `MerchantZone`
- 신규 mutation: `createCommissionPolicy / updateCommissionPolicy / applyCommissionPolicyToMerchant`

---

### 13.3 Fraud Detection (이상 거래 탐지)

#### 배경
- 동일 식당 심야 시간 비정상 대규모 결제
- 임직원 계정의 일일 상한 도달 후 환금('깡') 시도 패턴
- 짧은 시간 동일 단말 다중 결제

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-FRAUD-001` | `/operations/fraud/alerts` | 이상 거래 알림 큐 | `platform.fraud.read` |
| `SA-FRAUD-002` | `/operations/fraud/alerts/:id` | 알림 상세 + 액션 (계정 동결 / 거래 reverse / 화이트리스트) | `platform.fraud.write` |
| `SA-FRAUD-003` | `/operations/fraud/rules` | 탐지 룰 설정 | (write) |
| `SA-FRAUD-004` | `/operations/fraud/freezes` | 동결 계정 목록 | (read) |

**SA-FRAUD-003 탐지 룰 옵션**:

- 시간대 (HH:MM ~ HH:MM 외 결제 → flag)
- 단일 거래 한도 초과
- 일일 누적 상한 90% 이상 도달 + 잔여 5분 내 다중 결제
- 동일 식당 단시간 N건 이상
- 단말기 / IP / 기기 fingerprint 기반 (Phase 3)

**SA-FRAUD-002 액션**:

- `freezeWallet(walletId, reason)` — 즉시 동결
- `reverseMealTransaction(id)` — 거래 취소 (이미 존재)
- `addToWhitelist(walletId/merchantId)` — 오탐 대응

#### CentralApi 백로그
- 신규 모델: `FraudAlert`, `FraudRule`, `WalletFreeze`
- 신규 mutation: `freezeWallet / unfreezeWallet / acknowledgeFraudAlert / dismissFraudAlert`
- 신규 권한 키: `platform.fraud.read / platform.fraud.write`

---

### 13.4 HRIS API 연동 (Base.vn / SAP / Workday)

#### 배경
- 입사/퇴사/부서이동/직급변경의 자동 동기화 → 식대 토큰 자동 부여/회수
- 베트남 시장 1위 HRIS = Base.vn (현지 SaaS)

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-HRIS-001` | `/tenants/corporates/:id/hris` | corporate 별 HRIS 연동 설정 | `corporate.hris.write` |
| `SA-HRIS-002` | `/tenants/corporates/:id/hris/sync-log` | 동기화 이력 / 실패 큐 | `corporate.hris.read` |
| `SA-HRIS-003` | `/tenants/corporates/:id/hris/mapping` | 필드 매핑 (HRIS 부서 ↔ MealCorporateDepartment) | (write) |

**SA-HRIS-001 필드**:

- providerType: BASE_VN / SAP / WORKDAY / CUSTOM_API
- API endpoint, credentials (vault 저장)
- 동기화 주기 (실시간 webhook / 시간별 / 일별)
- 이벤트 구독: HIRE / TERMINATE / DEPARTMENT_CHANGE / ROLE_CHANGE
- 충돌 해결 정책 (HRIS 우선 / Manual 우선)

#### CentralApi 백로그
- 신규 모델: `HrisIntegration`, `HrisSyncLog`, `HrisFieldMapping`
- 신규 도메인 leaf: `platform/corporate/hris/`
- 신규 권한 키: `corporate.hris.read / corporate.hris.write`

---

### 13.5 Visual Policy Builder (식대 정책 시각화 빌더)

#### 배경
- 현재 `MealPolicy.ruleJson` 은 raw JSON 편집만 가능
- 기획서: "레고 블록 조립하듯 개별적으로 세팅" — 시각적 룰 빌더 필요
- 한시적 정책 (시작~종료일, 자동 닫힘) 지원

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-CORP-POL-003` | `/tenants/corporates/:id/policies/new?mode=visual` | 비주얼 정책 빌더 | `corporate.policy.write` |
| `SA-CORP-POL-004` | `/tenants/corporates/:id/policies/:id/preview` | 정책 적용 미리보기 (대상 직원 수 + 예산 추정) | `corporate.policy.read` |
| `SA-CORP-POL-005` | `/tenants/corporates/:id/policies/templates` | 정책 템플릿 라이브러리 | `corporate.policy.read` |

**SA-CORP-POL-003 빌더 블록**:

| 블록 | 설정 |
|---|---|
| **대상** | 부서 (multi-select), 직급 (multi-select), 근무형태 (정규/파견/3교대), 입사 N개월 이상 |
| **시간대** | 평일 11~14, 주말 X, 야간 22~02 (교대조 적용) |
| **지역** | 사무실 GPS 반경 km, 또는 지정 식당 카테고리 화이트리스트 |
| **금액** | 1회 한도 / 일일 한도 / 월 한도 (회사 지원금 + 개인 추가 결제 분리) |
| **메뉴 카테고리** | 한식/일식/베트남식/카페/케이터링 ON/OFF |
| **유효 기간** | effectiveFrom ~ effectiveTo (한시적 자동 닫힘) |
| **결제 수단** | QR / RFID / 안면인식 / 지문 / 케이터링 마켓플레이스 ON/OFF |

**SA-CORP-POL-004 미리보기**:

- 적용 대상 직원 수 (실시간 계산)
- 월 예상 예산 (과거 6개월 평균 × 적용 직원 수)
- 충돌하는 기존 정책 표시

#### CentralApi 백로그
- `MealPolicy` 의 `ruleJson` 스키마 표준화 (TypeScript interface 정의)
- 신규 query: `previewMealPolicyImpact(input) → { affectedEmployeeCount, estimatedMonthlyBudgetVnd, conflictingPolicies }`
- 신규 모델: `MealPolicyTemplate` (재사용 가능 템플릿)

---

### 13.6 3-Way Matching 검증 / Exception 큐

#### 배경
- (1) 임직원 앱 결제 원장, (2) 식당 POS 매출, (3) 청구/정산 DB 가 1원 단위 일치해야 함
- 불일치 시 자동 알람 + 수동 검수 워크플로

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-MATCH-001` | `/operations/matching/exceptions` | Exception 큐 (불일치 거래) | `corporate.matching.read` |
| `SA-MATCH-002` | `/operations/matching/exceptions/:id` | Exception 상세 + 3-source diff | `corporate.matching.write` |
| `SA-MATCH-003` | `/operations/matching/runs` | 매칭 배치 실행 이력 | (read) |
| `SA-MATCH-004` | `/operations/matching/runs/:id` | 배치 결과 (matched / unmatched / total) | (read) |

**SA-MATCH-002 상세 화면**:

- 3 source 데이터 side-by-side 비교 (앱 결제 / POS 매출 / 정산 DB)
- 차이 highlighting
- 액션: `resolveAsApproved(id) / resolveAsAdjusted(id, finalAmount) / escalate(id)`
- audit 자동 기록

#### CentralApi 백로그
- 신규 모델: `MatchingRun`, `MatchingException`
- 신규 service: `MatchingService.runBatch / resolveException`
- 신규 권한 키: `corporate.matching.read / corporate.matching.write`
- realtime topic: `corporate.matching.exception.created`

---

### 13.7 Funding & Float Income (예치금 운용)

#### 배경
- 사전 충전 모델 → 에스크로 계좌에 거대 자금 예치
- 결제 시점 ~ 식당 정산 사이 시차 (15~45일)
- 단기 금융 상품 / 정부 채권 예치로 Float Income 창출 (Pluxee 모델)

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-FUNDING-001` | `/governance/funding/accounts` | 모든 corporate 의 funding 계좌 통합 | `corporate.profile.read` |
| `SA-FUNDING-002` | `/governance/funding/escrow` | 에스크로 계좌 잔액 / 거래 내역 | `corporate.profile.read` |
| `SA-FUNDING-003` | `/governance/funding/float` | Float Income 운용 현황 (단기 상품, 채권) | (TBD `platform.treasury.read`) |
| `SA-FUNDING-004` | `/governance/funding/forecast` | 정산 예정 cashflow 예측 | (read) |

**SA-FUNDING-002 표시**:

- 일별 입금/출금/잔액
- 미정산 식당 대금 (D+15, D+30, D+45 buckets)
- 미사용 corporate 예산
- 위험 알림 (잔액 < 정산 예정 → 추가 충전 알림)

#### CentralApi 백로그
- `MealFundingAccount` 확장: bankCode, bankAccountNo, balanceVnd 는 이미 존재. balanceHistory, cashflowForecast 추가
- 신규 모델: `EscrowBalanceSnapshot`, `FloatInvestment` (단기 상품 운용)
- 신규 권한 키: `platform.treasury.read / platform.treasury.write`

---

### 13.8 Merchant Onboarding Workflow (가맹점 온보딩 단계)

#### 배경
- 현재 `enrollMealMerchant` mutation 만 존재 (1단계)
- 실제 KYC 단계: 사업자등록증 → 은행계좌 검증 → 디지털 서명 동의 → 활성화

#### 신규 화면 (기존 SA-CORP-MERCH 확장)

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-MERCH-001` | `/tenants/corporates/:id/merchants/onboarding` | 신규 가맹점 단계별 온보딩 | `corporate.merchant.enroll` |
| `SA-MERCH-002` | `/tenants/corporates/:id/merchants/onboarding/:id` | 진행 상태 (KYC 단계 트래킹) | `corporate.merchant.read` |
| `SA-MERCH-003` | `/tenants/corporates/:id/merchants/onboarding/:id/documents` | 사업자등록증 / 식품안전 인증 / 위생 인증 업로드 | (write) |
| `SA-MERCH-004` | `/tenants/corporates/:id/merchants/onboarding/:id/bank-verify` | 은행계좌 1원 인증 | (write) |
| `SA-MERCH-005` | `/tenants/corporates/:id/merchants/onboarding/:id/agreement` | 디지털 서명 동의 (수수료 약관) | (write) |

**단계 정의**:

```
DRAFT → DOCUMENTS_SUBMITTED → KYC_VERIFIED → BANK_VERIFIED → AGREEMENT_SIGNED → ACTIVATED
                  ↓                ↓
              REJECTED         REJECTED
```

#### CentralApi 백로그
- `MealMerchantEnrollment` 확장: onboardingStatus, kycDocuments[], bankVerifiedAt, agreementSignedAt
- 신규 모델: `MerchantOnboardingDocument`, `MerchantBankVerification`, `MerchantAgreement`
- 신규 mutation: `submitMerchantDocuments / verifyMerchantKyc / verifyMerchantBank / signMerchantAgreement`

---

### 13.9 SaaS Subscription Billing (요금제 / 청구)

#### 배경
- corporate 별 요금제 (Per-user subscription, 15,000~30,000 VND/user/month)
- 또는 Setup Fee + AMC (제조 공장 환경)
- `PlatformLicense` 와 별개의 SaaS 빌링 도메인 필요

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-BILL-001` | `/governance/billing/plans` | 요금제 (Plan) 카탈로그 | `platform.billing.write` |
| `SA-BILL-002` | `/governance/billing/subscriptions` | corporate 별 구독 | `platform.billing.read` |
| `SA-BILL-003` | `/governance/billing/invoices` | 월간 청구서 (corporate + SaaS) | `platform.billing.read` |
| `SA-BILL-004` | `/governance/billing/invoices/:id` | 청구서 상세 (식대 + SaaS 라인 분리) | (read) |
| `SA-BILL-005` | `/governance/billing/dunning` | 미납 추적 / 독촉 워크플로 | (write) |

**Plan 구성**:

- `URBAN_OFFICE_SAAS` — per-user 월 구독 (15,000~30,000 VND)
- `INDUSTRIAL_CANTEEN_ENTERPRISE` — Setup Fee + 연간 AMC (15~20% 계약금)
- `HYBRID` — 두 가지 혼합

#### CentralApi 백로그
- 신규 도메인 leaf: `platform/billing/{plan,subscription,invoice}/`
- 신규 모델: `BillingPlan`, `BillingSubscription`, `BillingInvoice`, `BillingInvoiceLine`
- 신규 권한 키: `platform.billing.read / platform.billing.write`
- 자동 청구 cron (월 1회 SyncWorkers)

---

### 13.10 Industrial Canteen 단말기 분류 / SLA 모니터링

#### 배경
- 기존 `EdgePosTerminal` 은 일반 POS 가정. 산업용 RFID/생체인식 단말은 별도 종류
- **0.8초 이내 승인 SLA** 필요 (교대조 Shift Rush 대응)

#### 신규/확장 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-EDGEPOS-005` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos/:id/sla` | 단말기 SLA 모니터 (응답시간 분포) | `edgepos.terminal.read` |
| `SA-EDGEPOS-006` | `/tenants/brands/:brandHqId/branches/:branchId/edge-pos/types` | 단말 종류 카탈로그 (POS / RFID_GATE / FACE_TERMINAL / FINGERPRINT_TERMINAL / KIOSK) | `edgepos.terminal.write` |

**SA-EDGEPOS-005 표시**:

- p50 / p95 / p99 응답시간 (지난 1시간 / 24시간)
- SLA 위반 임계값 (>= 800ms = SLA_BREACH)
- 시간대별 시각화 (Shift Rush 시간대 핫스팟)
- 실시간 alert: 1분 내 SLA 위반 N건 이상 → incident 자동 생성

#### CentralApi 백로그
- `EdgePosTerminal` 모델 확장: terminalType (POS/RFID_GATE/FACE_TERMINAL/FINGERPRINT_TERMINAL/KIOSK), networkMode (ONLINE/OFFLINE_CACHED), slaThresholdMs
- 신규 모델: `TerminalSlaSnapshot` (시간대별 통계 캐시)
- realtime topic: `edgepos.terminal.sla.breach`

---

### 13.11 Shift-Based Subsidy Logic (교대조 기반 식대 정책)

#### 배경
- 산업단지 24시간 가동, A/B/C 교대조 + 야간조
- 무단 교차 태깅 → 시스템 거부 또는 개인 급여 자동 분기
- 기업 근태 시스템 통합

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-SHIFT-001` | `/tenants/corporates/:id/shifts` | 교대조 정의 | `corporate.shift.write` |
| `SA-SHIFT-002` | `/tenants/corporates/:id/shifts/:id/assignments` | 직원별 교대조 배정 | (write) |
| `SA-SHIFT-003` | `/tenants/corporates/:id/shifts/violations` | 무단 교차 태깅 위반 이력 | `corporate.shift.read` |

**SA-SHIFT-001 교대조 필드**:

- shiftCode (A/B/C/NIGHT)
- mealWindowStart / mealWindowEnd
- unauthorizedAccessPolicy: REJECT / DEDUCT_PERSONAL_SALARY
- 적용 부서 필터

#### CentralApi 백로그
- 신규 모델: `MealShift`, `EmployeeShiftAssignment`, `ShiftViolation`
- 신규 도메인 leaf: `platform/corporate/shift/`
- 신규 권한 키: `corporate.shift.read / corporate.shift.write`

---

### 13.12 Contractor Agency Billing (파견 인력 청구 분리)

#### 배경
- 정규직 vs 파견 인력 코드 분류
- 월말 자동으로 하청 회사별 별도 청구서 생성

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-AGENCY-001` | `/tenants/corporates/:id/agencies` | 파견 회사 목록 | `corporate.agency.write` |
| `SA-AGENCY-002` | `/tenants/corporates/:id/agencies/:id` | 파견 회사 상세 + 임직원 매핑 | (read) |
| `SA-AGENCY-003` | `/tenants/corporates/:id/agencies/:id/invoices` | 파견 회사별 월 청구서 | (read) |

#### CentralApi 백로그
- 신규 모델: `ContractorAgency`, `ContractorAgencyInvoice`
- `MealEmployee` 확장: employmentType (REGULAR / CONTRACTOR), agencyId
- 신규 권한 키: `corporate.agency.read / corporate.agency.write`

---

### 13.13 Caterer 관리 (외부 위탁 급식 업체)

#### 배경
- 삼성웰스토리 같은 외부 caterer 가 구내식당 운영
- 가맹점과 다른 카테고리 — caterer 는 기업 단위 계약
- 식자재 수요 예측 데이터 API 송신 대상

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-CATERER-001` | `/governance/caterers` | Caterer 목록 | `corporate.caterer.write` |
| `SA-CATERER-002` | `/governance/caterers/:id` | Caterer 상세 + 운영 사이트 | (read) |
| `SA-CATERER-003` | `/governance/caterers/:id/forecasts` | 수요 예측 송신 이력 | (read) |
| `SA-CATERER-004` | `/governance/caterers/:id/sites` | 사이트별 식수 / 메뉴 | (read) |

#### CentralApi 백로그
- 신규 모델: `Caterer`, `CatererSite`, `MealForecastDispatch`
- 신규 도메인 leaf: `platform/corporate/caterer/`
- 신규 권한 키: `corporate.caterer.read / corporate.caterer.write`

---

### 13.14 메뉴 / 배식 수요 예측 (ML)

#### 배경
- 교대조별 누적 결제 데이터 + 요일 패턴 → ML 모델 → 내일 배식 인원 예측
- caterer 조달 시스템 API 자동 송신
- 음식물 쓰레기 처리 비용 절감

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-FORECAST-001` | `/operations/forecast/today` | 오늘/내일 배식 예측 (corporate × site) | `platform.ops.read` |
| `SA-FORECAST-002` | `/operations/forecast/accuracy` | 모델 정확도 (예측 vs 실제) | (read) |
| `SA-FORECAST-003` | `/operations/forecast/configs` | 모델 파라미터 / 재학습 트리거 | (write) |

#### CentralApi 백로그
- 신규 모델: `MealForecast` (date, corporateId, siteId, predictedCount, actualCount)
- 외부 ML 서비스 (BullMQ job → ML inference → DB 저장)
- realtime topic: `corporate.forecast.dispatched`

---

### 13.15 B2B Catering Marketplace (PITO 등 외부 케이터링 연동)

#### 배경
- 외근 영업직, 사내 회의, 부서 회식 등을 위한 단체 주문
- PITO 같은 베트남 B2B 케이터링 마켓플레이스 플러그인

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-CATERING-001` | `/governance/catering/providers` | 케이터링 제공자 (PITO 등) 목록 | `corporate.catering.write` |
| `SA-CATERING-002` | `/governance/catering/providers/:id` | 제공자 상세 + API 키 | (write) |
| `SA-CATERING-003` | `/tenants/corporates/:id/catering/orders` | corporate 단체 주문 이력 | `corporate.catering.read` |

#### CentralApi 백로그
- 신규 모델: `CateringProvider`, `CateringOrder`
- 신규 도메인 leaf: `platform/corporate/catering/`
- 신규 권한 키: `corporate.catering.read / corporate.catering.write`

---

### 13.16 LBS Merchant Discovery 데이터 거버넌스

#### 배경
- 임직원 모바일 앱이 사용하는 식당 위치 / 메뉴 / 평점 / 리뷰
- SuperAdmin 검수 필요

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-DISCOVERY-001` | `/tenants/corporates/:id/merchants/:id/discovery` | 식당 위치 / 메뉴 / 사진 검수 | `corporate.merchant.read/write` |
| `SA-DISCOVERY-002` | `/tenants/corporates/:id/merchants/:id/reviews` | 평점 / 리뷰 모더레이션 | (write) |

#### CentralApi 백로그
- `MealMerchantEnrollment` 확장: gpsLat, gpsLng, addressFull, photos[], menuPreviewJson
- 신규 모델: `MerchantReview` (employeeId, rating, comment, status), `MerchantPhoto`

---

### 13.17 개인 결제 수단 연동 정책 (ZaloPay / MoMo / VNPay / 카드)

#### 배경
- Split Payment 의 개인 결제 부분에서 사용되는 외부 PG
- SuperAdmin 이 어떤 결제 수단을 허용/차단할지 정책 관리

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-PAY-001` | `/governance/payment-providers` | 결제 제공자 카탈로그 | `platform.payment.write` |
| `SA-PAY-002` | `/governance/payment-providers/:id` | provider 설정 (수수료, API 키, webhook) | (write) |
| `SA-PAY-003` | `/governance/payment-providers/health` | provider 헬스 모니터 (성공률, 응답시간) | (read) |

**Provider 카탈로그**:
- `ZALOPAY` — Zalo 생태계
- `MOMO` — MoMo 모바일 지갑
- `VNPAY` — VNPay 카드 게이트웨이
- `VISA / MASTERCARD` — 국제 카드
- `BANK_TRANSFER` — 계좌이체

#### CentralApi 백로그
- 신규 모델: `PaymentProvider`, `PaymentProviderConfig`, `SplitPaymentLog`
- 신규 도메인 leaf: `platform/corporate/payment/`
- 신규 권한 키: `platform.payment.read / platform.payment.write`

---

### 13.18 가맹점 자체 타겟 프로모션 거버넌스

#### 배경
- 가맹점이 자체 설정하는 시간대 할인 (예: 13:30 이후 인근 회사 직원 10% 할인)
- SuperAdmin 이 승인/감사

#### 신규 화면

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-MERCH-PROMO-001` | `/tenants/corporates/:id/merchants/:id/promotions` | 가맹점 자체 프로모션 목록 | `corporate.merchant.read` |
| `SA-MERCH-PROMO-002` | `/tenants/corporates/:id/merchants/:id/promotions/:id/approval` | 승인 워크플로 | `corporate.merchant.write` |

#### CentralApi 백로그
- 신규 모델: `MerchantPromotion` (merchantId, discountType, validFrom/Until, targetCorporateIds, approvalStatus)

---

### 13.19 Solution Type 분류 (Industrial vs Urban vs Hybrid)

#### 배경
- corporate 가 어떤 모델로 운영되는지 명시
- 화면/정책/단말 종류/요금제가 모두 분기

#### 신규 필드 + 화면 분기

| 설정 | 옵션 |
|---|---|
| `MealCorporate.solutionType` | `INDUSTRIAL_CANTEEN` / `URBAN_OFFICE` / `HYBRID` |

**화면 분기 예시**:
- `INDUSTRIAL_CANTEEN`: 단말기 (RFID/생체인식) + 교대조 + caterer + agency 필수
- `URBAN_OFFICE`: 모바일 앱 + open loop 가맹점 + LBS discovery + SaaS 구독
- `HYBRID`: 둘 다 활성

#### CentralApi 백로그
- `MealCorporate` 확장: solutionType enum
- 화면 가드: solutionType 별 메뉴 hide/show

---

### 13.20 베트남 규제 컴플라이언스 알람

#### 배경
- Decree / Circular 변경 추적
- 시행일 이전 사전 알림
- 영향받는 corporate 자동 식별

#### 신규 화면 (SA-COMPLIANCE-005 의 확장)

| ID | Route | Title | 권한 |
|---|---|---|---|
| `SA-COMPLIANCE-006` | `/governance/compliance/regulations/:id/impact` | 규제 변경 영향 분석 | `platform.compliance.read` |
| `SA-COMPLIANCE-007` | `/governance/compliance/regulations/:id/migration` | 마이그레이션 계획 | `platform.compliance.write` |

#### CentralApi 백로그
- 신규 모델: `RegulationChange`, `RegulationImpactAssessment`

---

## 14. 식권 도메인 확장 — 우선순위 재배치
## 14. Lộ trình ưu tiên cho domain phiếu ăn

§13 의 20개 영역을 §9 의 Phase 계획에 통합하면 다음과 같이 재배치된다:

### Phase 2 추가 (P0 — MVP 식권 운영 가능 조건)

| 영역 | 화면 수 | 백로그 키 |
|---|---|---|
| §13.1 GDT 컴플라이언스 | 5 | `platform.compliance.*` |
| §13.5 Visual Policy Builder | 3 | (기존 `corporate.policy.*`) |
| §13.8 Merchant Onboarding | 5 | (기존 `corporate.merchant.*` 확장) |
| §13.11 Shift-Based Subsidy | 3 | `corporate.shift.*` |
| §13.19 Solution Type 분류 | (필드만) | (기존) |

소계: **+16 화면** → Phase 2 합계 약 **55 화면**

### Phase 3 추가 (P1 — 정산/금융 운영)

| 영역 | 화면 수 | 백로그 키 |
|---|---|---|
| §13.2 Multi-Tier Commission Engine | 4 | `corporate.merchant.commission.*` |
| §13.6 3-Way Matching Exception | 4 | `corporate.matching.*` |
| §13.7 Funding & Float Income | 4 | `platform.treasury.*` |
| §13.9 SaaS Subscription Billing | 5 | `platform.billing.*` |
| §13.12 Contractor Agency Billing | 3 | `corporate.agency.*` |
| §13.13 Caterer 관리 | 4 | `corporate.caterer.*` |

소계: **+24 화면** → Phase 3 합계 약 **38 화면**

### Phase 4 신설 (P2 — 운영 고도화)

| 영역 | 화면 수 | 백로그 키 |
|---|---|---|
| §13.3 Fraud Detection | 4 | `platform.fraud.*` |
| §13.4 HRIS API 연동 | 3 | `corporate.hris.*` |
| §13.10 Industrial Canteen SLA | 2 | (기존 `edgepos.terminal.*` 확장) |
| §13.14 메뉴/배식 수요 예측 ML | 3 | (기존 `platform.ops.*`) |
| §13.15 B2B Catering Marketplace | 3 | `corporate.catering.*` |
| §13.16 LBS Discovery 거버넌스 | 2 | (기존 `corporate.merchant.*`) |
| §13.17 개인 결제 수단 정책 | 3 | `platform.payment.*` |
| §13.18 가맹점 자체 프로모션 | 2 | (기존 `corporate.merchant.*`) |
| §13.20 규제 영향 분석 | 2 | `platform.compliance.*` |

소계: **+24 화면** → Phase 4 신설 (24 화면)

### 전체 화면 합계 (재계산)

- Phase 1 (MVP 운영): 33
- Phase 2 (Brand Catalog + Corporate 기본 + 식권 P0): 55
- Phase 3 (Deploy + Operations + 식권 P1): 38
- Phase 4 (식권 P2 + 운영 고도화): 24

**총 ≈ 150 화면**

---

## 15. 식권 도메인 확장 — 권한 키 백로그 (총 28 신규 키)
## 15. Backlog quyền hạn mở rộng

§13 결과로 신규 추가가 필요한 권한 키:

| 권한 키 | 의미 | 영역 |
|---|---|---|
| `platform.compliance.read / write` | GDT/규제 | §13.1, §13.20 |
| `platform.fraud.read / write` | 이상 거래 | §13.3 |
| `platform.treasury.read / write` | 예치금 / Float | §13.7 |
| `platform.billing.read / write` | SaaS 빌링 | §13.9 |
| `platform.payment.read / write` | 결제 PG 정책 | §13.17 |
| `platform.deploy.read / write` | 배포 | (이전 §8 백로그) |
| `platform.reference.read / write` | 마스터 데이터 | (이전 §8 백로그) |
| `platform.ops.read` | 운영 모니터 | (이전 §8 백로그) |
| `corporate.hris.read / write` | HRIS 연동 | §13.4 |
| `corporate.matching.read / write` | 3-Way Matching | §13.6 |
| `corporate.shift.read / write` | 교대조 | §13.11 |
| `corporate.agency.read / write` | 파견 회사 | §13.12 |
| `corporate.caterer.read / write` | 외부 caterer | §13.13 |
| `corporate.catering.read / write` | B2B 케이터링 마켓 | §13.15 |

**총 28 키 신규** = 기존 39 키 + 신규 28 키 = **67 키 (Phase 4 완료 시점)**

---

## 16. 식권 도메인 확장 — Prisma 모델 백로그 (총 25 신규 모델)
## 16. Backlog model Prisma mở rộng

§13 결과로 신규 추가가 필요한 모델:

| 모델 | 영역 | 도메인 leaf |
|---|---|---|
| `GdtCertificate / GdtSubmissionLog / GdtIntegrationConfig` (3) | §13.1 | `platform/superadmin/compliance/` |
| `MerchantCommissionPolicy / MerchantZone` (2) | §13.2 | `platform/corporate/merchant/` (확장) |
| `FraudAlert / FraudRule / WalletFreeze` (3) | §13.3 | `platform/superadmin/fraud/` |
| `HrisIntegration / HrisSyncLog / HrisFieldMapping` (3) | §13.4 | `platform/corporate/hris/` |
| `MealPolicyTemplate` (1) | §13.5 | `platform/corporate/policy/` (확장) |
| `MatchingRun / MatchingException` (2) | §13.6 | `platform/corporate/matching/` |
| `EscrowBalanceSnapshot / FloatInvestment` (2) | §13.7 | `platform/superadmin/treasury/` |
| `MerchantOnboardingDocument / MerchantBankVerification / MerchantAgreement` (3) | §13.8 | `platform/corporate/merchant/` (확장) |
| `BillingPlan / BillingSubscription / BillingInvoice / BillingInvoiceLine` (4) | §13.9 | `platform/superadmin/billing/` |
| `TerminalSlaSnapshot` (1) | §13.10 | `platform/edge-pos/` (확장) |
| `MealShift / EmployeeShiftAssignment / ShiftViolation` (3) | §13.11 | `platform/corporate/shift/` |
| `ContractorAgency / ContractorAgencyInvoice` (2) | §13.12 | `platform/corporate/agency/` |
| `Caterer / CatererSite / MealForecastDispatch` (3) | §13.13 | `platform/corporate/caterer/` |
| `MealForecast` (1) | §13.14 | `platform/corporate/forecast/` |
| `CateringProvider / CateringOrder` (2) | §13.15 | `platform/corporate/catering/` |
| `MerchantReview / MerchantPhoto` (2) | §13.16 | `platform/corporate/merchant/` (확장) |
| `PaymentProvider / PaymentProviderConfig / SplitPaymentLog` (3) | §13.17 | `platform/corporate/payment/` |
| `MerchantPromotion` (1) | §13.18 | `platform/corporate/merchant/` (확장) |
| `RegulationChange / RegulationImpactAssessment` (2) | §13.20 | `platform/superadmin/compliance/` (확장) |

**총 41 신규 모델** + 기존 44 모델 = **85 모델 (Phase 4 완료 시점)**

추가로 기존 모델 확장 (필드 추가): `MealCorporate.solutionType`, `MealEmployee.employmentType/agencyId`, `MealMerchantEnrollment.onboardingStatus/...`, `EdgePosTerminal.terminalType/networkMode/slaThresholdMs`, `MealConsolidatedEInvoice.gdtSubmissionPayload/...`, `MealFundingAccount.balanceHistory/...`

---

## 17. 식권 도메인 확장 — 운영 시나리오 추가
## 17. Kịch bản vận hành mở rộng

기존 §5 의 5 시나리오에 다음 시나리오를 추가한다.

### 17.1 통합 전자세금계산서 월말 발급 (자동 + 수동)

```
1. 매월 1일 자정 SyncWorkers cron 이 모든 corporate 의 전월 거래 합산
2. MealConsolidatedEInvoice 자동 생성 (status=DRAFT)
3. /governance/compliance/gdt/queue 에서 SuperAdmin 이 검수
4. 일괄 또는 개별로 submitConsolidatedInvoice 호출
5. GDT 네트워크에 XML 제출 → 응답 수신 → status=ACCEPTED_GDT 또는 REJECTED_GDT
6. REJECTED 시 거절 사유 기반 수정 → 재제출
7. ACCEPTED 시 corporate 측 SaaS 청구서와 합산해 SA-BILL-003 에서 발송
```

### 17.2 가맹점 단계별 온보딩

```
1. 영업이 가맹점과 미팅 → /tenants/corporates/:id/merchants/onboarding 에서 DRAFT 등록
2. 가맹점 사장이 사업자등록증/식품안전 인증 업로드 → DOCUMENTS_SUBMITTED
3. SuperAdmin 검수 → KYC_VERIFIED 또는 REJECTED
4. 은행 1원 인증 → BANK_VERIFIED
5. 디지털 서명 동의 (수수료 약관) → AGREEMENT_SIGNED
6. 활성화 → ACTIVATED
7. 자동으로 enrollMealMerchant + 기본 commission rate 적용
```

### 17.3 이상 거래 탐지 → 계정 동결 → 검수

```
1. FraudRule 이 탐지 (예: 23:30 단일 거래 5,000,000 VND 초과)
2. FraudAlert 자동 생성 → realtime topic 으로 SA-FRAUD-001 에 표시
3. SuperAdmin 이 SA-FRAUD-002 에서 상세 검토
4. 액션:
   - 정상 거래로 판단 → dismiss
   - 부정 의심 → freezeWallet + reverseMealTransaction
5. 임직원에게 알림 (SMS/email)
6. 모든 단계 audit 자동 기록
```

### 17.4 3-Way Matching 불일치 발견

```
1. 매일 새벽 SyncWorkers 가 MatchingRun 실행
2. (앱 결제 ↔ POS 매출 ↔ 정산 DB) diff
3. 불일치 거래 → MatchingException 생성
4. SA-MATCH-001 의 큐에 표시
5. SuperAdmin 이 SA-MATCH-002 에서 3-source 비교
6. resolveAsApproved / resolveAsAdjusted / escalate
7. 정산 배치는 모든 exception 이 resolved 된 후에만 실행
```

### 17.5 신규 corporate (산업단지) 온보딩

```
1. /tenants/corporates/new 에서 MealCorporate 생성, solutionType=INDUSTRIAL_CANTEEN
2. /tenants/corporates/:id/hris 에서 Base.vn 또는 SAP 연동 설정 → 임직원 자동 동기화
3. /tenants/corporates/:id/shifts 에서 교대조 정의 (A/B/C/NIGHT)
4. /tenants/corporates/:id/agencies 에서 파견 회사 등록
5. /governance/caterers 에서 caterer (예: 삼성웰스토리) 연결
6. /tenants/brands/:id/branches/:branchId/edge-pos/register 에서 RFID/안면인식 단말기 등록 (terminalType=FACE_TERMINAL 등)
7. /tenants/corporates/:id/policies/new?mode=visual 로 식대 정책 작성 (교대조별 시간대)
8. 활성화 → 첫 결제 → 7일 후 첫 정산 배치
```

### 17.6 신규 corporate (도심 SME) 온보딩

```
1. /tenants/corporates/new 에서 MealCorporate 생성, solutionType=URBAN_OFFICE
2. /governance/billing/plans 에서 URBAN_OFFICE_SAAS plan 선택 → BillingSubscription 생성
3. /tenants/corporates/:id/admins 에서 CORPORATE_ADMIN 1명 등록
4. /tenants/corporates/:id/employees 에서 임직원 등록 (수동 또는 CSV)
5. /tenants/corporates/:id/wallets/new 에서 지갑 일괄 발급
6. /tenants/corporates/:id/merchants/onboarding 에서 인근 가맹점 5~10곳 순차 등록
7. /tenants/corporates/:id/policies/new?mode=visual 에서 SME 표준 정책 템플릿 적용
8. /governance/payment-providers 에서 ZaloPay/MoMo 활성화 (Split Payment 지원)
9. 첫 결제 → 월말 SaaS 청구서 + 식대 통합 청구서 자동 발송
```

---

**문서 끝.** 본 문서는 `SuperAdmin/Portal` 구현 작업의 단일 진실이며, 화면을 추가/수정할 때마다 본 문서를 함께 갱신한다.

**§13 ~ §17 의 식권 도메인 확장 항목은 베트남 B2B 식권 사업 기획서 (`1.Docs/식권관리플랫폼/프로젝트 개요.md`) 분석 결과로 추가되었으며, Phase 2~4 의 구현 범위에 포함된다.**
