# CorporatePortal 구현 작업계획서

> **대상 프로젝트**: `/Users/hyojae/projects/Platform/CorporatePortal`
> **기반 문서**:
> - `1.Docs/식권관리플랫폼/프로젝트 개요.md` (비즈니스 기획)
> - `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` (월별 통합 인보이스 사양)
> - `1.Docs/기획 및 설계/프로젝트 통합설계/00-Platform-최종-아키텍처-기준서.md` §2.1 / §99 / §100
> - `1.Docs/기획 및 설계/프로젝트 통합설계/01-SuperAdmin-기능리스트.md` §13.1
> - `1.Docs/기획 및 설계/프로젝트 통합설계/DB설계/10-전체-테이블-컬럼-마스터.md` §1.1 ~ §1.17
> - `CorporatePortal/CLAUDE.md` / `CorporatePortal/README.md`
> **작성일**: 2026-04-08
> **언어**: 한국어 (Tiếng Việt 병기는 각 화면의 i18n 원본에만 적용)

---

## 0. 이 문서의 목적

CorporatePortal 은 지금까지 `package.json` + `CLAUDE.md` + `README.md` + `src/app/{layout,page}.tsx` 만 존재하는 사실상 **빈 프로젝트** 이다. 본 문서는 이 상태에서 **production-ready 1차 릴리스** (P0) 까지 가는 경로를 step-by-step 으로 확정한다. 프리엠티브 질문, 결정 사항, 산출물, DoD 를 모두 한 곳에 박제하여 다른 개발자가 이어받아도 같은 결과에 도달할 수 있도록 하는 것이 목적이다.

**원칙**:
- **설계 문서 (Source of Truth) 를 코드로 합리화하지 않는다.** 코드와 설계가 충돌하면 설계를 기준으로 코드를 고친다.
- CorporatePortal 은 `SuperAdmin/Portal` 과 **형제 프로젝트**이며, 같은 기술 스택과 같은 shell 구조를 공유한다. Portal 의 성공 패턴을 단순 복제하지 않고 **Corporate 도메인 책임만** 구현한다.
- 새 UI 원본을 만들지 않는다. 모든 버튼/카드/입력/탭은 `@platform/shared-ui` (= `../SharedUI`) 에서 import 한다. 필요한 variant/prop 이 없으면 **SharedUI 를 먼저 확장한 뒤** 사용한다.
- 번역 원본은 **각 프로젝트가 자기 내부에 별도로** 둔다. 프로젝트 간 i18n 공유 금지. CorporatePortal 의 번역 원본 경로는 `CorporatePortal/src/i18n`, SuperAdmin/Portal 은 `SuperAdmin/Portal/src/i18n`, BrandPosApp/PosUi 는 `BrandPosApp/PosUi/src/i18n` 처럼 각자 따로 관리한다. `SharedAssets` 에 번역 키를 두지 않는다.
- **서버 선행 작업 우선**: CorporatePortal 구현은 단독으로 진행할 수 없다. `SuperAdmin/CentralApi` + `SuperAdmin/SyncWorkers` + `SharedContracts` + 인프라 계약 등 **서버 측 선행 작업** 이 먼저 완료되어야 한다. 서버 선행 작업은 **§22 Phase -1 (Server Prerequisites)** 에 8개 sub-phase (SP-A ~ SP-H) 로 분해되어 있으며, Phase 0 착수 전 완료 게이트를 통과해야 한다.

---

## 1. 책임 경계 (범위 고정)

### 1.1 CorporatePortal 이 다루는 것

CorporatePortal 은 **식권 플랫폼 B2B 고객 기업 (Corporate) 의 HR / 재무 관리자** 가 매일 사용하는 단일 웹 포털이다. 관리하는 리소스는 아래 **정확히 이 목록** 뿐이다 — 새 리소스 추가는 본 작업계획서의 개정이 선행되어야 한다.

| 리소스 | 소유 leaf (CentralApi) | 1차 릴리스 범위 |
|---|---|---|
| Corporate 프로필 (회사 정보, 세금코드, 주소) | `platform/corporate/profile` | 조회·수정 |
| 부서 (Department) | `platform/corporate/profile` (department sub) | 트리 조회/생성/수정/비활성 |
| 임직원 (Employee) | `platform/corporate/profile` (employee sub) | 명단, 배지(RFID) 매핑, HRIS 싱크 상태, 퇴사 처리 |
| 식권 계정 (Allowance Ledger) | `platform/corporate/wallet` | 회사 지원금 / 개인 충전 / 원장 내역, split payment share 표시 |
| 식대 정책 (MealPolicy) | `platform/corporate/policy` | 부서/직급/시간대/한도/Split/Carryover 빌더 |
| 예산 (FundingAccount) | `platform/corporate/wallet` (funding entry) | Prepaid Deposit / Credit 모델, 회사 지원금 적립 배치 |
| 허용 머천트 풀 (AllowedMerchantPool) | `platform/corporate/merchant` | 화이트리스트 편집, 카테고리별 토글 |
| 월간 통합 전자세금계산서 | `platform/corporate/einvoice` | **수령·다운로드 only** (발행은 SuperAdmin 책임) |
| HRIS 연동 | (신규 leaf 후보 `platform/corporate/hris-sync`) | 연결/끊기, 마지막 싱크 상태 |
| 회사 관리자 계정 | `platform/corporate/profile` (CorporateAdminUser) | 초대/권한/비밀번호 재설정 |

### 1.2 CorporatePortal 이 다루지 않는 것 (이 경계를 넘으면 거부)

| 리소스 | 소유 프로젝트 |
|---|---|
| 메뉴 / 지점 / 재고 / 영업시간 / 직원 근태 | `BrandPosApp/PosUi` (제휴식당) |
| 가맹 계약 · 수수료율 정책 엔진 · 머천트 승인 | `SuperAdmin/Portal` |
| 통합 인보이스 **발행** (WeTax 호출, refId 생성, submission log) | `SuperAdmin/Portal` + `SyncWorkers` cron |
| 실시간 결제 승인 / 3-Way Matching 배치 | `CentralApi/platform/corporate/transaction`, `settlement` |
| Closed Loop 단말 프로비저닝 / RFID 게이트 제어 | `EdgePos` + `Device/MealTicketClosedLoopTerminal` |
| License / Entitlement 발급 / 회수 | `SuperAdmin/Portal` |

**강제 수단**: 1) README 라우트 테이블에 없는 path 를 만들 때는 작업계획서 개정 PR 을 먼저 낸다. 2) `BrandPosApp/PosUi` 의 코드/타입을 import 하지 않는다 (ESLint custom rule 로 막는다 — `scripts/check-corporate-portal-rules.mjs`).

---

## 2. 기술 스택 및 의존성 확정

### 2.1 기본 스택 (변경 금지)

| 항목 | 값 |
|---|---|
| Next.js | ^16.2.1 (App Router, React 19) |
| TypeScript | ^6.0.2 |
| GraphQL Client | `@apollo/client` ^3.11 (only, `fetch` 직접 금지) |
| UI 시스템 | `@platform/shared-ui` = `../SharedUI` (workspace link) |
| 상태 관리 | Apollo Client (server state) + `@reduxjs/toolkit` + `react-redux` (UI state only) |
| Dev port | **3003** (SuperAdmin/Portal 3001, BrandPosApp/PosUi 3002, CorporatePortal 3003) |
| i18n | 각 프로젝트 내부에 별도 보관 — CorporatePortal 은 `CorporatePortal/src/i18n/locales/{ko,vi,en}`. 다른 프로젝트의 i18n 파일을 import 하거나 공유하지 않는다 |
| 지도 | **Google Maps 전용** — `@react-google-maps/api` + `@googlemaps/js-api-loader`. Mapbox / Naver / OpenStreetMap / 기타 지도 라이브러리 **사용 금지**. API 키는 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (env). referer 제한 필수 |
| RBAC | 서버 RBAC 시스템 기반 — `Permission` / `Role` / `RolePermission` / `UserRoleAssignment` (CentralApi 원본). 포털에 role 이름 하드코딩 금지. 현재 세션의 effective permission 은 `mealCorporateAdminMe` 쿼리로 받아서 사용. §8.3 참조 |
| CSS | Tailwind v4 (`@tailwindcss/postcss`, `postcss.config.mjs`) |
| Codegen | `@graphql-codegen/cli` + `@graphql-codegen/client-preset` |
| React Compiler | `babel-plugin-react-compiler` v1 (SuperAdmin/Portal 과 동일 설정) |

### 2.2 추가해야 하는 의존성 (현재 package.json 기준)

현재 `CorporatePortal/package.json` 은 최소 의존성만 있다. 아래를 **1회 package.json 개정 PR** 로 한 번에 추가한다.

```jsonc
// dependencies 에 추가
{
  "@platform/shared-ui": "file:../SharedUI",
  "@tailwindcss/postcss": "^4.2.2",
  "babel-plugin-react-compiler": "^1.0.0",
  "clsx": "^2.1.1",
  "graphql-ws": "^5.16.0",
  "lucide-react": "^0.468.0",
  "next-themes": "^0.4.4",
  "postcss": "^8.5.8",
  "sonner": "^1.7.1",
  "tailwind-merge": "^2.6.0",
  "tailwindcss": "^4.2.2",
  "zod": "^3.24.1",
  // Google Maps (P1 부터 사용, P0 번들에서는 dynamic import 로 lazy load)
  "@react-google-maps/api": "^2.19.3",
  "@googlemaps/js-api-loader": "^1.16.6"
}
// devDependencies 에 추가
{
  "@eslint/eslintrc": "^3.2.0",
  "@graphql-codegen/cli": "^5.0.3",
  "@graphql-codegen/client-preset": "^4.5.1",
  "@next/eslint-plugin-next": "^16.2.1",
  "@types/react-dom": "^19.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "eslint": "^9.0.0",
  "eslint-config-next": "^16.2.1",
  "tsx": "^4.21.0"
}
```

### 2.3 scripts 확장

```jsonc
{
  "scripts": {
    "dev": "next dev --webpack -p 3003 -H 0.0.0.0",
    "build": "next build --webpack",
    "start": "next start -p 3003 -H 0.0.0.0",
    "lint": "eslint src --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

### 2.4 Next.js 설정

- `next.config.ts`: `reactCompiler: true`, `transpilePackages: ['@platform/shared-ui', '@platform/api-sdk']` (SuperAdmin/Portal 과 동일)
- `tsconfig.json`: path alias `@/*` → `src/*`, `@ui/*` → `../SharedUI/src/*` (또는 package.json 경로 재사용)
- `codegen.ts`: CentralApi GraphQL schema 에서 operation 을 생성. SuperAdmin/Portal 의 `codegen.ts` 를 참고.

---

## 3. 소스 트리 (확정)

SuperAdmin/Portal 과 **동일한 9개 최상위 버킷** 구조를 사용한다. 추가·변경 금지.

```
CorporatePortal/
├── codegen.ts                       # GraphQL codegen 설정
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── public/
├── scripts/
│   └── check-corporate-portal-rules.mjs   # ESLint 외 custom rule runner (책임 경계 강제)
└── src/
    ├── app/                         # Next.js App Router (라우트만, 로직 최소)
    │   ├── layout.tsx
    │   ├── page.tsx                 # '/' → /dashboard redirect
    │   ├── providers.tsx            # ApolloProvider + ReduxProvider + ThemeProvider 조합
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── departments/page.tsx
    │   ├── departments/[id]/page.tsx
    │   ├── employees/page.tsx
    │   ├── employees/[id]/page.tsx
    │   ├── policies/page.tsx
    │   ├── policies/[id]/page.tsx
    │   ├── budget/page.tsx
    │   ├── budget/ledger/page.tsx
    │   ├── merchants/page.tsx
    │   ├── invoices/page.tsx
    │   ├── invoices/[id]/page.tsx
    │   ├── integrations/page.tsx
    │   └── settings/
    │       ├── company/page.tsx
    │       ├── admins/page.tsx
    │       └── session/page.tsx
    ├── graphql/                     # codegen 산출물 + operations
    │   ├── generated/               # codegen output (.gitignore 아님, 커밋)
    │   └── fragments/               # 공용 fragment
    ├── i18n/
    │   ├── index.ts                 # i18n init
    │   ├── locales/
    │   │   ├── ko/{common,dashboard,employees,policies,budget,invoices,settings}.json
    │   │   ├── vi/{동일}.json
    │   │   └── en/{동일}.json
    │   └── use-translation.ts
    ├── providers/                   # ApolloClient, Redux store, Theme, Toast, ErrorBoundary 초기화
    │   ├── apollo.ts
    │   ├── auth-provider.tsx
    │   ├── theme-provider.tsx
    │   └── toast-provider.tsx
    ├── rbac/
    │   ├── capabilities.ts          # 'CORPORATE_ADMIN' / 'CORPORATE_FINANCE' / 'CORPORATE_HR'
    │   ├── guard.tsx                # <RequireCapability capability="...">
    │   └── use-current-session.ts   # me 쿼리 wrapper
    ├── screens/                     # 화면별 feature 모듈 (route/resource 단위 분리)
    │   ├── dashboard/
    │   ├── departments/
    │   ├── employees/
    │   ├── policies/
    │   ├── budget/
    │   ├── merchants/
    │   ├── invoices/
    │   ├── integrations/
    │   └── settings/
    ├── shared/                      # CorporatePortal 내부 공용 (도메인 객체, util 만)
    │   ├── format/                  # vnd formatter, date formatter (locale-aware)
    │   ├── guards/
    │   └── layout/                  # AppShell, SideNav, TopBar (SharedUI 조합만)
    ├── store/                       # Redux toolkit slice (UI state only)
    │   ├── index.ts
    │   └── slices/
    │       ├── navigation.slice.ts
    │       ├── filters.slice.ts
    │       └── drawer.slice.ts
    └── styles/
        ├── globals.css              # Tailwind directives + CSS vars
        └── tokens.css               # SharedUI tokens re-export
```

### 3.1 "한 파일당 한 리소스" 원칙

- `screens/<resource>/` 는 leaf 다. 내부에 sub-leaf 금지.
- `screens/<resource>/index.ts` 는 public export 용도만. `components.ts`, `hooks.ts` 같은 혼합 집계 파일 금지.
- 한 화면이 복잡하면 **sibling leaf** (예: `screens/departments-tree/`) 로 분리. nested 금지.

### 3.2 코드 스플리팅 / 청킹 원칙

- `src/app/**/page.tsx` 는 route shell 만 담당한다. 데이터 가공과 무거운 위젯 조립은 `src/screens/<resource>/` 로 내린다.
- 무거운 UI 블록은 `src/screens/<resource>/chunks/` 아래로 분리하고, 페이지에서 `dynamic(() => import(...))` 로 직접 불러온다.
- `chunks/` 와 그 하위에는 `index.ts` 를 두지 않는다. lazy boundary 는 명시적 파일 경로로만 사용한다.
- 공통 lazy 대상: 차트, 지도, CSV preview/import, PDF viewer, rich text editor, 대형 테이블, 멀티스텝 drawer.
- 지도가 포함된 화면은 기본적으로 `ssr: false` dynamic import 를 사용한다.
- 한 route 에서 250KB gzip 목표를 넘길 조짐이 있으면, 먼저 chunk 분리를 검토하고 그 다음에 기능 범위를 조정한다.

---

## 4. 라우트별 상세 설계

README 의 라우트 초안을 **실제 구현 단위** 로 확정한다. 각 라우트마다: (1) 화면 목적 (2) 사용 리소스 (3) 필수 GraphQL operation (4) 허용 action (5) 1차 릴리스 (P0) 포함 여부 를 명시한다.

### 4.1 `/dashboard` — 예산 소진 / 부서별 리포트 / 알림 센터

- **화면 목적**: HR/재무 관리자가 매일 아침 가장 먼저 여는 홈. 한 스크린 안에서 "① 이번 달 예산이 얼마나 빠졌는가 ② 어느 부서가 예상보다 빠르게 쓰는가 ③ 이번 달 인보이스 상태 ④ 만료 예정 이월 포인트 ⑤ 이상 거래 / 정책 위반 건수 ⑥ 처리 대기 중인 관리자 작업" 을 한눈에 본다.
- **해결하는 문제**: (기획서 §4.2) "재무 부서의 예산 예측(Forecasting) 능력을 돕는다" — 월 절반이 지나기 전에 예산 초과 위험을 감지하고, 정책을 조정할 시간을 확보한다.

#### 4.1.1 위젯 구성 (위→아래, 좌→우)

| # | 위젯 | 내용 | 데이터 소스 | P0 |
|---|---|---|---|---|
| W1 | **이번 달 예산 사용률** | 원형 게이지 + `사용 / 총예산 / 잔여` 숫자. `fundingModel` 에 따라 "예치금 잔액" 또는 "신용 한도 사용률" 표시 | `mealCorporateDashboardSummary` | ✅ |
| W2 | **월간 추세** | 최근 6개월의 일일 소진 라인 차트 (이번 달은 오늘까지). "지난달 대비 ±N%" 배지 | `mealCorporateDailySpendTrend(corporateId, from, to)` | ✅ |
| W3 | **부서별 소진 랭킹** | 상위 5개 부서의 가로 막대 (부서명, 예산 대비 %, 소진액 VND). 빨강/주황/초록 임계값 (80%/60%) | `mealBudgetByDepartment(corporateId, period)` | ✅ |
| W4 | **활성 임직원 / 지갑 상태** | `ACTIVE / SUSPENDED / FROZEN / CLOSED` 4단 분포 바. 총 지갑 수 표기 | `mealWalletStatusDistribution(corporateId)` | ✅ |
| W5 | **인기 제휴 식당 Top 10** | `이번 달 이용 건수 / 금액 / 평균 단가` 표. 클릭 → `/merchants/[branchId]` 상세 | `mealTopMerchantsThisMonth(corporateId)` | ✅ |
| W6 | **이번 달 인보이스 상태 카드** | `MealConsolidatedEInvoice` 현재 달 row. status (`DRAFT / DISPUTED / REQUESTED / SUBMITTING / ACCEPTED / REJECTED / VOIDED`) 배지 + 타임라인. DRAFT 이면 "검토하기" CTA (reviewDueAt D-day 표시), ACCEPTED 이면 PDF/XML 다운로드 버튼, REJECTED 이면 "SuperAdmin 문의" CTA | `mealConsolidatedEInvoiceCurrent` | ✅ |
| W7 | **이상 거래 / 정책 위반 알림** | 최근 7일의 `DECLINED` 거래 중 `declineReason=POLICY_VIOLATION / FRAUD_SUSPECTED / DAILY_LIMIT` 건수. 클릭 → `/dashboard/anomalies` | `mealTransactionAnomalies(corporateId, sinceDays=7)` | ⚠️ P1 |
| W8 | **만료 예정 이월 포인트** | 이번 달 말 소멸 예정 `companyAllowanceVnd` 총액 + 영향받는 임직원 수 | `mealExpiringAllowance(corporateId, withinDays=7)` | ⚠️ P1 |
| W9 | **처리 대기 To-Do** | 초대된 admin 응답 대기 / 정책 approval 대기 / 거부된 funding entry 등 목록 (최대 5건) | `mealCorporateTodoItems(corporateId)` | ⚠️ P1 |
| W10 | **HRIS 싱크 상태 배지** | 마지막 싱크 시각 + 실패 건수. 연동 안 되어 있으면 "연동하기" CTA | `hrisIntegrationStatus(corporateId)` | ❌ P2 |

#### 4.1.2 필터 / 기간 선택

- 상단 우측에 `이번 달 / 지난 달 / 분기 / 커스텀 기간` 드롭다운.
- 기간 변경 시 W1 ~ W5 가 리프레시 (URL query param `?period=current|previous|quarter|custom&from=&to=` 로 공유 가능).
- 부서 필터 (멀티 선택) 로 W2 / W3 / W5 를 부서 스코프로 제한.

#### 4.1.3 사용 DTO

`MealTicketCorporate`, `MealTicketWallet[]`, `MealTicketConsolidatedEInvoice`, `MealTicketSettlementBatch`, `MealTicketTransaction[]` (집계 전 raw 는 제한적으로만), `HrisIntegration` (P2), `MealCorporateTodoItem` (신규 DTO 후보).

#### 4.1.4 GraphQL operation (모두 신규)

- `mealCorporateDashboardSummary(corporateId, period)` — W1 + W2 기초 데이터
- `mealCorporateDailySpendTrend(corporateId, from, to)` — W2 라인 차트
- `mealBudgetByDepartment(corporateId, period)` — W3
- `mealWalletStatusDistribution(corporateId)` — W4
- `mealTopMerchantsThisMonth(corporateId, period, limit=10)` — W5
- `mealConsolidatedEInvoiceCurrent(corporateId)` — W6
- `mealTransactionAnomalies(corporateId, sinceDays)` — W7 (P1)
- `mealExpiringAllowance(corporateId, withinDays)` — W8 (P1)
- `mealCorporateTodoItems(corporateId)` — W9 (P1)

#### 4.1.5 허용 action

- 위젯 클릭 → 해당 리소스 상세 페이지 navigate
- W6 에서 PDF/XML 다운로드 (`mealInvoiceDownloadPdf/Xml`)
- W9 에서 To-Do 항목의 "처리" 버튼 → 해당 상세 페이지
- 대시보드 자체는 **mutation 없음** (읽기 전용)

#### 4.1.6 엣지 케이스

- **신규 가입 corporate** (아직 거래 / 지갑 / 인보이스 없음): 각 위젯에 `<EmptyState>` 표시 + "임직원 초대하기" CTA 노출
- **멀티 funding model**: PREPAID 와 CREDIT 을 동시에 쓰는 corporate (hybrid) 는 W1 에 "예치금 잔액" + "신용 한도 사용률" 두 게이지를 나란히 표시
- **권한 없는 사용자** (`VIEWER` role): W6 의 다운로드 버튼 숨김, 나머지는 읽기 가능
- **정책 위반 거래가 많은 경우** (>50건/일): W7 에 "상세 보기" 버튼 + 페이지네이션된 anomaly list 로 연결

#### 4.1.7 성능 / 캐시

- 각 위젯은 Apollo cache 에 `keyFields: ['corporateId', 'period']` 로 normalize.
- 대시보드 열 때 병렬 쿼리 (10개 위젯 → 1회 batched fetch 필요 — CentralApi DataLoader 가 corporate 스코프로 batch).
- `refetchInterval: 5 * 60 * 1000` (5분) 로 자동 갱신. `document.visibilityState === 'visible'` 일 때만.
- 사용자가 명시적으로 새로고침 버튼 누르면 `refetch()`.

- **P0**: ✅ (W1~W6). W7~W9 는 P1, W10 은 P2.

### 4.2 `/departments` — 부서 트리 / 부서별 예산

- **화면 목적**: 회사 부서 조직도를 관리. HRIS 연동이 있으면 read-only + 싱크 상태 뷰, 수동 관리면 CRUD + 부서별 식대 예산 배정.
- **해결하는 문제**: 기획서 §4.2 "부서별 식대 예산을 기획 및 집행" + "부서별 예산 소진 속도 추적". 공공기관·대기업의 전형적인 "부서 단위 예산 운영" 패턴 (비플식권 / 식권대장 공통 기능).

#### 4.2.1 화면 구성

- **좌측 트리**: 루트 → 하위 부서 트리. 각 노드에 아이콘 (부서), 부서명, 인원 수 배지, HRIS 싱크 표시 (연동 부서는 🔒)
- **우측 상세 패널**: 선택된 부서의 기본 정보 + 이번 달 예산 + 소속 임직원 카운트 + 최근 거래 요약
- **상단 툴바**: `새 부서 추가` / `검색` / `HRIS 동기화` (수동 트리거) / `엑셀 내보내기`

#### 4.2.2 부서 상세 패널 필드

| 필드 | 타입 | 편집 가능 | 설명 |
|---|---|---|---|
| 부서 코드 (`departmentCode`) | string | 수동관리 시 O / HRIS 연동 시 X | 외부 시스템 키 |
| 부서명 (`departmentName`) | string | 수동 시 O | 다국어는 단일 필드 (베트남어 우선, 필요 시 JSON 확장 P2) |
| 상위 부서 (`parentDepartmentId`) | uuid | 수동 시 O | 드롭다운으로 이동. 사이클 감지 필요 |
| 소속 인원 수 | computed | 읽기 | `count(MealEmployee where departmentId)` |
| 이번 달 예산 | bigint | P1 | 부서 단위로 분리 운영 시 (분리되지 않으면 "corporate 전체 공유") |
| 이번 달 소진 | bigint | 읽기 | 이번 달 거래 합계 |
| 잔여 예산 | bigint | 읽기 | 예산 - 소진 |
| 적용되는 정책 | list | P1 | `MealPolicy.appliesToDepartmentIds` 역참조 |
| HRIS 동기 상태 | badge | 읽기 | 싱크 시각, 상태 (`IN_SYNC / STALE / FAILED`) |
| 마지막 변경 | timestamp | 읽기 | |
| 메모 | text | 수동 시 O | 500자 |

#### 4.2.3 사용 DTO

- `MealCorporateDepartment` (FK `parentDepartmentId` self-reference)
- `MealCorporateDepartmentBudget` (신규 DTO 후보, P1. 부서별 월 예산 배정 테이블)

#### 4.2.4 GraphQL operation (모두 신규)

- `mealDepartmentsByCorporate(corporateId)` — 트리 전체 조회 (materialized path 또는 adjacency list)
- `mealDepartmentDetail(id)` — 상세 패널
- `mealDepartmentCreate(input)` — `{corporateId, parentDepartmentId?, code, name, memo?}`
- `mealDepartmentUpdate(id, input)` — 위 필드 부분 업데이트
- `mealDepartmentMove(id, newParentId)` — 드래그 앤 드롭 이동 (P1)
- `mealDepartmentDeactivate(id)` — soft delete + 소속 임직원의 `departmentId` → null
- `mealDepartmentBudgetUpdate(departmentId, period, amountVnd)` — 부서별 월 예산 업데이트 (P1)
- `mealDepartmentHrisSync(corporateId)` — HRIS 재싱크 수동 트리거 (P2)

#### 4.2.5 허용 action

- 생성 / 수정 / 이동 / 비활성. **삭제 불가** (`deletedAt` 만 세팅).
- HRIS 연동 부서는 **읽기 전용**. 수정 시도 시 "이 부서는 Base.vn 에서 동기화 중입니다" 안내 + HRIS 에서 직접 수정하라는 링크.
- 비활성화 시 "소속 임직원 N명의 department 가 제거됩니다. 계속하시겠습니까?" 확인 다이얼로그. 소속 임직원이 0 이어도 정책에 참조되어 있으면 먼저 정책 수정을 요구.
- 부서 이동 시 순환 참조 방지 (ancestor 검사).

#### 4.2.6 엣지 케이스

- **순환 참조**: 부서 A → B → A 형태 금지. 서버 측 (CentralApi) 에서 FK 생성 시 ancestor chain 검사.
- **루트 부서 삭제 금지**: `parentDepartmentId === null` 인 루트 부서는 비활성화할 수 없음 (다른 루트로 임직원 이동 필요).
- **다수 루트 허용**: 한 corporate 가 여러 루트 부서를 가질 수 있음 (예: "본사", "제조동", "연구소" 가 각자 루트).
- **HRIS 충돌**: Base.vn 에 삭제된 부서가 CorporatePortal 에 남아있을 때 → 싱크 시 "사라진 부서" 리스트를 관리자에게 보여주고 수동 confirm 후 비활성.
- **대용량 조직** (500+ 부서): 트리 lazy load (`mealDepartmentChildren(parentId)` 로 level 별 fetch).

#### 4.2.7 HRIS 동기화된 부서 가드 (P0 필수)

- `MealCorporateDepartment.isExternalSync=true` 인 부서는:
  - 수정 / 삭제 / 이동 mutation 을 서버가 `DEPARTMENT_EXTERNALLY_SYNCED` 에러로 거부
  - 화면 표시: 부서 노드에 🔒 아이콘 + 편집 버튼 disabled + tooltip "Base.vn 에서 동기화 중입니다"
  - CorporatePortal 전용 메타 (메모 / 이번 달 예산 할당 P1) 만 수정 가능
- 사용자가 HRIS 연동 시점 전에는 모든 부서가 `isExternalSync=false` 이므로 자유롭게 CRUD 가능. 연동 전환 시 SuperAdmin 이 `isExternalSync` 플래그를 일괄 true 로 전환.

#### 4.2.8 P0 범위

- P0: flat list + 생성/수정/비활성 CRUD + 상위 부서 드롭다운 이동 + **`isExternalSync` 가드 (수동 수정 차단)**
- P1: 트리 D&D, 부서별 예산 배정, 정책 역참조 표시
- P2: HRIS 싱크 수동 트리거, 충돌 해결 UI, 다국어 부서명

- **P0**: ✅ (CRUD 만)

### 4.3 `/employees` — 임직원 명단 / 일괄 작업

- **화면 목적**: 임직원 전체 명단 조회, 검색, 필터, 정렬, CSV 일괄 등록/내보내기, 배지 매핑, 계정 일시정지/재개, 퇴사 처리.
- **해결하는 문제**: 기획서 §3.1 "HR 관리자가 임직원 명단을 관리", 식권대장의 "식권 제작·카드 관리·분배 업무를 한 번의 클릭으로" UX 지향. 공장형 (Closed Loop) 에서는 용역업체 소속 구분 (§5.1) 이 중요.

#### 4.3.1 화면 구성

- **상단 툴바**: `+ 임직원 추가` (단건) / `📤 CSV 업로드` (일괄) / `📥 CSV 내보내기` / `배지 일괄 발급` / `HRIS 동기화` / `고급 필터`
- **검색바**: 이름, 이메일, 사번, 전화번호, 배지 번호 전문 검색 (디바운스 300ms)
- **필터 칩**: `부서` / `지갑 상태` / `정책` / `고용 형태` / `HRIS 싱크 상태` / `최근 사용 기간`
- **테이블** (기본 열 — 사용자가 커스터마이즈 가능):

| 열 | 내용 | 정렬 가능 |
|---|---|---|
| 체크박스 | 다중 선택 (bulk action 용) | - |
| 아바타 / 이름 | fullName + employeeCode | ✅ |
| 부서 | departmentName | ✅ |
| 직급 / 고용 형태 | roleCode / employmentType (정규/계약/파견/용역 — §5.1 하청 인력) | ✅ |
| 지갑 잔액 | `companyAllowanceVnd + personalTopUpVnd` 합계. 두 bucket 분리 표시 (작은 글씨로) | ✅ |
| 지갑 상태 | badge (`ACTIVE / SUSPENDED / FROZEN / CLOSED`) | ✅ |
| 배지 번호 | badgeRfid (마스킹: `****1234`) | - |
| 최근 결제 | lastTransactionAt (relative time: "2시간 전") | ✅ |
| HRIS 싱크 | badge | - |
| 액션 | ⋯ 메뉴 (상세/편집/배지/정지/퇴사) | - |

- **페이지네이션**: keyset cursor pagination, 페이지당 25/50/100 토글. 5000명 이상도 성능 저하 없이 동작.
- **뷰 토글**: `테이블 / 카드` (카드 뷰는 모바일 우선)

#### 4.3.2 임직원 상세/편집 폼 (모달 또는 drawer)

**탭 1 — 기본 정보**
- 사진 (선택, P2)
- 이름 (required, 2~100자)
- 사번 (`employeeCode`, required, unique within corporate)
- 이메일 (optional, 이메일 형식 검증)
- 전화번호 (optional, 베트남 전화번호 형식 `+84` 또는 `0` prefix)
- 부서 (select, 트리 드롭다운)
- 상위 관리자 (optional, 다른 임직원 참조)
- 고용 형태 (enum: `FULL_TIME / CONTRACT / DISPATCH / CONTRACTOR_AGENCY` — §5.1 용역업체 분리)
- 입사일 (date)
- 퇴사일 (read-only, 퇴사 처리 후 표시)

**탭 2 — 식권 계정 (Wallet)**
- 지갑 상태 (`ACTIVE / SUSPENDED / FROZEN / CLOSED`)
- 회사 지원금 잔액 (read-only)
- 개인 충전 잔액 (read-only)
- 일일 한도 (`dailyLimitVnd`) — 정책에 의해 override 되는 경우 표시
- 적용되는 정책 (list)
- 배지 번호 (`badgeRfid`, optional — Closed Loop 단말 RFID 매핑용)

**탭 3 — 최근 활동**
- 최근 10건의 거래 (`MealTransaction`)
- 최근 10건의 funding entry

#### 4.3.3 CSV 일괄 업로드

- **Template 다운로드**: `employeeCode, fullName, email, phone, departmentCode, employmentType, roleCode, badgeRfid, startDate` 열 고정
- **업로드 처리**:
  1. 사용자가 CSV 선택 → 미리보기 (처음 10행)
  2. 검증 단계 — 각 행에 `[OK] / [WARN] / [ERROR]` 표시 (emailCode 중복, 부서 미존재 등)
  3. 검증 결과 요약: `성공 A건 / 경고 B건 / 오류 C건`
  4. "업로드 실행" 클릭 → 배치 처리 → 결과 리포트
- **Idempotency**: `employeeCode` 를 키로 upsert (기존 임직원은 update, 신규만 insert)
- **트랜잭션**: 전체 배치가 atomic 이어야 하며, 한 건이라도 실패하면 롤백 (또는 "오류 건만 제외하고 진행" 옵션)

#### 4.3.4 Bulk Action (체크박스 다중 선택 후)

| 액션 | 설명 | 필요 permission |
|---|---|---|
| 부서 이동 | 선택된 N명의 `departmentId` 일괄 변경 | `corporate.employee.write` |
| 정책 적용 | 선택된 N명에게 정책 적용 (정책의 `appliesToDepartmentIds` 대신 개별 적용) | `corporate.policy.write` |
| 일시 정지 | 지갑 status → `SUSPENDED` (새 거래 불가, 포인트 잔액은 유지) | `corporate.employee.write` |
| 정지 해제 | `SUSPENDED` → `ACTIVE` | `corporate.employee.write` |
| 퇴사 일괄 처리 | 여러 명 한번에 퇴사 (effectiveDate 일괄). **회사 지원금 포인트는 서버가 자동으로 전액 소멸 처리**. 관리자의 회수 옵션 없음 | `corporate.employee.write` |
| 배지 일괄 발급 | CSV 업로드 후 배지 매핑 (P1) | `corporate.employee.write` |
| CSV 내보내기 | 필터링된 결과 엑셀 다운로드 | `corporate.employee.read` |

> **중요**: "회사 지원금 일괄 회수" Bulk action 은 **존재하지 않는다**. 회사 지원금은 포인트 개념이며, 퇴사 시 자동으로 소멸한다 (§9.5). 관리자가 수동으로 포인트를 회수 / 몰수 / 차감하는 기능은 원칙적으로 없으며, 배포 실수 교정이 필요한 극한 상황에만 "관리자 수동 교정" (§9.2 `REVERSED`) mutation 이 존재한다 (P2, 감사 필수).

#### 4.3.5 퇴사 처리 플로우 (자동 소멸, 관리자 선택 옵션 없음)

1. `⋯` → `퇴사 처리` 클릭
2. 퇴사일 입력 (기본값: 오늘)
3. 퇴사 사유 (optional, 자유 입력 — AuditLog 에만 저장)
4. 확인 다이얼로그 — 서버가 자동 수행할 작업을 **미리 고지**:
   ```
   다음 작업이 되돌릴 수 없게 일괄 수행됩니다:

   ✓ 지갑 상태: ACTIVE → CLOSED
   ✓ 회사 지원금 포인트 {240,000 VND} 전액 자동 소멸
     (관리자 회수 옵션 없음 — 조건부 포인트 규칙)
   ✓ 배지(RFID) 무효화 → 단말 차단
   ✓ 이 임직원에게 적용된 정책 해제
   ✓ 개인 충전 잔액 {120,000 VND} → 환불 안내 이메일 발송
     (실제 환불은 별도 수기 처리, P2에서 자동화)
   ✓ 감사 로그 기록
   ```
5. `mealEmployeeTerminate(id, effectiveDate, reason?)` mutation 호출
6. 서버가 단일 트랜잭션으로 위 5개 작업 원자적 수행 (§9.5 규칙)
7. 성공 시 토스트 + 리스트 refetch

> **포인트는 "회수" 되지 않는다**: 회사 지원금은 식권 구매에만 쓸 수 있는 조건부 포인트이므로, 회사로 되돌아가는 현금이 아니다. 서버는 단순히 funding entry `status=EXPIRED` 를 기록하고 `companyAllowanceVnd → 0` 으로 세팅할 뿐이다. 감사 로그에는 소멸된 금액이 기록되어 회계팀이 복지비 예산 소진 현황을 추적할 수 있다.

#### 4.3.6 사용 DTO

`MealEmployee`, `MealTicketWallet`, `MealTicketWalletFundingEntry` (퇴사 시 서버가 `EXPIRED` 자동 기록), `MealCorporateDepartment`, `MealTicketPolicy` (적용 정책 역참조)

#### 4.3.7 GraphQL operation (모두 신규)

- `mealEmployeesByCorporate(corporateId, filter, cursor, orderBy)` — keyset pagination
- `mealEmployeeSearchSuggestions(corporateId, query)` — 검색바 autocomplete
- `mealEmployeeCreate(input)`
- `mealEmployeeUpdate(id, input)`
- `mealEmployeeBulkCreate(inputs)` — CSV 일괄 (upsert)
- `mealEmployeeBulkUpdateDepartment(ids, newDepartmentId)`
- `mealEmployeeBulkSuspend(ids, reason)`
- `mealEmployeeBulkResume(ids)`
- `mealEmployeeAssignBadge(id, badgeRfid)`
- `mealEmployeeBulkAssignBadge(pairs)` — [{employeeId, badgeRfid}]
- `mealEmployeeTerminate(id, effectiveDate, reason?)` — 서버가 §9.5 자동 소멸 플로우 원자적 수행. `clawbackMode` 같은 선택 파라미터는 **없다**.
- `mealEmployeeBulkTerminate(inputs)` — 다수 동시 퇴사, 동일하게 자동 소멸
- `mealEmployeesCsvExport(corporateId, filter)` — signed URL 반환
- `mealEmployeesCsvImport(corporateId, upload)` — multipart upload 또는 S3 presigned

#### 4.3.8 엣지 케이스

- **사번 중복**: 같은 corporate 내에서 `employeeCode` unique. 중복 시 `EMPLOYEE_CODE_DUPLICATE` 에러.
- **배지 중복**: 같은 corporate 내에서 `badgeRfid` unique (null 은 제외). 다른 사람에게 이미 할당된 배지면 "기존 소유자에서 해제하고 새로 할당하시겠습니까?" 확인.
- **퇴사 취소 불가**: 한 번 `CLOSED` 된 wallet 은 재활성화 불가. 재입사자는 새 계정 생성.
- **부서 삭제와의 연계**: 부서 비활성화 시 소속 임직원 `departmentId` → null. 화면에서 "소속 부서 없음" 경고 배지 표시.
- **HRIS 동기화 임직원 (isExternalSync=true)** — **P0 필수 가드**:
  - 서버 스키마: `MealEmployee.isExternalSync` (boolean, default false), `externalSyncSourceId` (외부 HRIS 의 employee id), `externalSyncLastAt` (마지막 싱크 시각)
  - `isExternalSync=true` 인 임직원의 기본 정보 (이름 / 사번 / 이메일 / 전화 / 부서 / 고용형태 / 입사일) 수정 mutation 은 서버가 `EMPLOYEE_EXTERNALLY_SYNCED` 에러로 **거부**
  - 단 **CorporatePortal 전용 필드** (배지 `badgeRfid`, 메모, 적용 정책) 는 수정 가능 — HRIS 가 관리하지 않는 필드이므로
  - 화면 표시: 탭 1 "기본 정보" 에 🔒 아이콘 + "Base.vn 에서 동기화 중입니다. 수정은 원본 시스템에서 진행하세요" 안내 + `externalSyncLastAt` 상대 시각 표시
  - 퇴사 처리 (`mealEmployeeTerminate`): HRIS 가 `terminationDate` 를 싱크할 것이 기본 기대이지만, 긴급 상황 (보안 사고 / 이상 거래) 에는 수동 퇴사 허용 — 단 OWNER 권한만 가능 + 이유 입력 필수. 이후 다음 HRIS 싱크에서 충돌 경고.
- **부서의 isExternalSync 도 동일 원칙** — `MealCorporateDepartment.isExternalSync=true` 면 수정/삭제 금지, HRIS 에서 관리
- **포인트 / 개인 충전 잔액이 있는 임직원 퇴사**: 서버가 자동으로 회사 지원금 포인트 `EXPIRED` 처리 + 개인 충전 환불 안내 이메일 발송. 관리자가 "회수할지 말지" 선택하는 옵션은 **없다** (§9.5).

#### 4.3.9 P0 범위

- P0: 리스트 + 검색 + 필터 + 단건 CRUD + 배지 매핑 + 퇴사 처리 (자동 소멸) + CSV 내보내기 + **`isExternalSync` 가드 (수동 수정 차단)** — HRIS 연동 전 이미 가드 로직은 작동해야 함
- P1: CSV 업로드, Bulk action (부서 이동 / 정책 적용 / 일시정지 / 일괄 퇴사), 고급 필터
- P2: 사진 업로드, HRIS 충돌 해결 UI (이름 변경 충돌 / 부서 이동 충돌 등의 시각화 화면), 다국어 이름, 관리자 수동 포인트 교정

- **P0**: ✅

### 4.4 `/employees/[id]` — 임직원 상세 페이지

- **화면 목적**: 한 임직원의 프로필 + allowance ledger + funding entry 원장 + 최근 결제 내역 + 적용 정책 + 감사 로그. **이 화면이 admin 이 가장 자주 보는 detail view** 이며, 이상 거래 / 민원 조사의 entry point.

#### 4.4.1 화면 구성 (탭)

**Header**
- 아바타 + 이름 + 사번 + 부서 + 지갑 상태 배지
- 빠른 액션 버튼: `편집` / `일시정지` / `정책 변경` / `배지 재발급` / `퇴사 처리`

**탭 1 — 개요**
- 기본 정보 요약 (리스트 view)
- Allowance Ledger 요약 카드 (3 bucket: 회사 지원금 / 개인 충전 / 합산)
- 이번 달 사용 현황 mini 차트 (일일 소진)
- 적용되는 정책 (리스트, 각각 effective range 표기)
- 최근 5건 거래 (inline)

**탭 2 — 원장 (Ledger)**
- 전체 `MealWalletFundingEntry` 목록 (keyset pagination)
- 필터: `sourceType` (COMPANY_ALLOWANCE / PERSONAL_TOP_UP), `status` (POSTED/PENDING/REVERSED), 기간
- 각 행: 시각, source type (아이콘), 금액, status, 메모, source batch id (클릭 → 배치 상세)
- 엑셀 다운로드

**탭 3 — 거래 내역**
- 전체 `MealTransaction` 목록 (keyset pagination)
- 필터: 기간, `loopType` (OPEN/CLOSED), `status` (APPROVED/DECLINED/REVERSED), `authMethod`, 머천트
- 각 행: 시각, 머천트 (지점명), 요청 금액, 승인 금액, 회사 지원금 / 개인 충전 분리 (Split 표기), 상태, decline reason (거절 시)
- 거래 상세 모달: 전체 payload + 3-Way Matching 상태 + settlement batch 링크

**탭 4 — 정책 이력**
- 이 임직원에게 지금까지 적용된 정책 / 적용 해제 이력 (timeline)
- 각 이벤트: 적용 시각, 정책명, 적용자 (admin), 적용 사유 (optional)

**탭 5 — 감사 로그**
- 이 임직원 프로필에 대한 admin action history (누가 언제 무엇을 변경했는가)
- 소스: `AuditLog where targetType='MealEmployee' and targetId=id`
- P1

#### 4.4.2 Allowance Ledger 요약 카드 (상세 규칙)

```
┌─────────────────────────────────────────────────┐
│  💰 식권 계정                                    │
├─────────────────────────────────────────────────┤
│  🏢 회사 지원금 포인트 [P]  240,000 VND          │
│     이번 달 충전: 500,000 / 사용: 260,000       │
│     ⏰ 자동 소멸 예정 (2026-04-30): 85,000       │
│     ※ 조건부 포인트 — 식권 결제에만 사용 가능    │
│                                                 │
│  💳 개인 충전 잔액          120,000 VND (현금)    │
│     ZaloPay 연동 / 마지막 충전: 3일 전          │
│     ※ 환불 가능                                 │
│                                                 │
│  ── 사용 가능 금액                              │
│  🪙 총 사용 가능            360,000 VND          │
│                                                 │
│  일일 한도: 150,000 VND (정책 A 에 의해)         │
└─────────────────────────────────────────────────┘
```

- 회사 지원금 포인트 / 개인 충전 현금은 절대 섞여서 표시되지 않는다 (조건부 토큰 vs 일반 자금의 구분 강조).
- `[P]` 뱃지로 "포인트" 성격 강조. 현금 뉘앙스 (지급/회수/환급) 용어는 UI 어디에도 등장하지 않음.
- "자동 소멸 예정" 은 `companyAllowanceVnd` 중 `effectiveTo` 가 이번 달 말인 금액만 계산 (P1). 관리자가 수동으로 회수하지 않고, SyncWorkers 월말 cron 이 자동 `EXPIRED` 처리.
- "일일 한도" 는 정책에 의해 override 된 값 표시.
- 개인 충전 라인만 "환불 가능" 문구 — 회사 지원금에는 환불 문구 금지 (혼동 방지).

#### 4.4.3 사용 DTO

`MealEmployee`, `MealTicketWallet`, `MealTicketWalletFundingEntry[]`, `MealTicketTransaction[]`, `MealTicketPolicy[]`, `AuditLog[]`

#### 4.4.4 GraphQL operation (모두 신규)

- `mealEmployeeDetail(id)` — 탭 1 요약 (employee + wallet + 정책 + 최근 5건 join)
- `mealWalletFundingEntries(walletId, filter, cursor)` — 탭 2 포인트 거래 내역 keyset
- `mealTransactionsByWallet(walletId, filter, cursor)` — 탭 3 거래
- `mealEmployeePolicyHistory(employeeId)` — 탭 4
- `mealEmployeeAuditLog(employeeId, cursor)` — 탭 5 (P1)
- `mealWalletSuspend(walletId, reason)` — 일시 정지
- `mealWalletResume(walletId)` — 정지 해제
- `mealWalletCompanyAllowanceAdjust(walletId, deltaVnd, reason)` — **P2, 극한 상황** (잘못된 배포 실수 교정). 반드시 감사 + 이중 확인. 양수 delta 로 추가 / 음수 delta 로 감액. 내부적으로 funding entry `REVERSED` (증감 교정) 로 기록. 일반 업무 플로우가 **아니다**.

> `mealWalletCompanyAllowanceClawback` operation 은 **삭제** — "회수" 개념 자체를 제거. 퇴사 시 자동 소멸은 `mealEmployeeTerminate` 내부에서 서버가 처리하므로 별도 mutation 불필요.

#### 4.4.5 허용 action

- 편집 → `/employees/[id]/edit` 또는 inline drawer
- 일시정지 / 해제 → wallet status 전환 (포인트 잔액은 유지, 새 거래만 차단)
- 정책 변경 → 정책 드롭다운 + 적용 사유 입력
- 배지 재발급 → 기존 배지 invalidate + 새 배지 할당
- 퇴사 처리 → §4.3.5 플로우 (자동 소멸)
- 관리자 수동 포인트 교정 (P2, 극히 드물게) → `mealWalletCompanyAllowanceAdjust`. 기본 숨김. 배포 실수 정정용.

#### 4.4.6 엣지 케이스

- **wallet 이 아직 생성되지 않은 경우**: 임직원은 있지만 wallet 이 없음 → "지갑 발급" CTA 표시
- **정책이 복수 적용** (부서 정책 + 직급 정책 동시 적용): 어떤 정책이 우선하는가? 서버에서 priority 계산 후 `effectiveLimit` 을 내려받아 표시.
- **감사 로그가 24개월 초과**: AuditLog retention 정책상 오래된 이벤트는 archive. "24개월 이전 내역은 아카이브에서 조회" 안내.

- **P0**: ✅ (탭 1~3). 탭 4 / 탭 5 는 P1.

### 4.5 `/policies` — 세밀한 식대 정책 빌더

- **화면 목적**: 기획서 §4.2 "레고 블록 조립하듯 개별 세팅" — 부서/직급/시간대/한도/Split/Carryover/카테고리/지역 반경 을 조합하여 정책을 발행하고 활성화/비활성화. Grab for Business 사례처럼 "프로젝트 팀에 한시적 예산 부여" 같은 유연한 통제가 가능해야 함.
- **해결하는 문제**:
  - 공장형 (§5.1): 교대조 기반 다층 보조금 (A조는 11:30~13:00, B조는 18:00~20:00 만 허용)
  - 도심형 (§5.2): 야근자 배달 식대 예산 한시 개방

#### 4.5.1 화면 구성

- **좌측 정책 목록 panel**:
  - 정책 카드 리스트 (각각 `status` 배지, 적용 인원 수, effectiveFrom/To)
  - 검색 + 상태 필터 (`ACTIVE / SCHEDULED / PAUSED / EXPIRED`)
  - `+ 새 정책` 버튼
  - 정렬: 생성일 desc / 이름 asc / 우선순위
- **우측 편집 panel** (선택된 정책의 5탭):

#### 4.5.2 편집 폼 5탭 상세

**탭 1 — 기본 정보**
- 정책 코드 (`policyCode`, required, unique within corporate, 대문자+숫자+언더스코어)
- 정책명 (`policyName`, required, 3~200자, 다국어 P2)
- 설명 (textarea, 500자)
- 우선순위 (number, 낮을수록 우선 — 복수 정책 동시 적용 시 해결용)
- 유효 기간: `effectiveFrom` (date, required) ~ `effectiveTo` (date, optional, 무한 지속은 null)
- 상태 (readonly, 시스템 계산): `ACTIVE / SCHEDULED / PAUSED / EXPIRED`
- 우선순위 가이드: "충돌 시 낮은 번호가 이깁니다. 기본값: 100"

**탭 2 — 시간대 (Windows)**
- 동적 리스트: 여러 window 를 추가 가능
- 각 window:
  - 요일 선택 (월~일 체크박스) + 빠른 선택 (`평일`, `주말`, `매일`)
  - 시작 시각 (HH:mm)
  - 종료 시각 (HH:mm)
  - 이 window 의 최대 허용 금액 (optional, 탭 3 한도를 override)
- 예시 UI: "평일 11:00~14:00 + 평일 17:30~19:30"
- 충돌 검증: 같은 정책 내 두 window 가 시간 겹치면 경고

**탭 3 — 한도 (Limits)**
- 1회 최대 결제 (`maxPerTransactionVnd`, VND, required)
- 일일 한도 (`dailyLimitVnd`, VND, required)
- 월간 한도 (`monthlyLimitVnd`, VND, optional — P1)
- Split Payment 허용 (`allowSplitPayment`, boolean). `true` 면 회사 지원금 부족 시 개인 충전으로 자동 보충. `false` 면 회사 지원금 내에서만 결제.
- Carryover 허용 (`allowCarryover`, boolean). `true` 면 이번 달 미사용 `companyAllowanceVnd` 가 다음 달로 이월. `false` 면 월말에 소멸.
- Carryover 최대 이월 개월 (`carryoverMaxMonths`, int, 1~6, default 1)
- 미사용 포인트 소멸 정책: `MONTH_END / QUARTER_END / NEVER` (default MONTH_END)
- 하루 최대 거래 건수 (`dailyTransactionCountLimit`, int, optional — 식수 남용 방지)

**탭 4 — 적용 대상**
- 라디오: `전체 임직원 / 특정 부서 / 특정 직급 / 특정 고용 형태 / 커스텀 명단`
- 부서 멀티 선택 (트리 드롭다운, 하위 부서 자동 포함 옵션)
- 직급 코드 멀티 선택 (`appliesToRoleCodes`)
- 고용 형태 필터 (§4.3 고용 형태 enum)
- 커스텀 명단: 임직원 검색 + 추가 (P1)
- "현재 이 정책이 적용되는 임직원: **N명**" 실시간 카운트

**탭 5 — 허용 머천트 / 카테고리**
- 탭 5a: 카테고리 허용
  - 멀티 선택 (아이콘 + 카테고리명): 한식 / 베트남식 / 카페 / 분식 / 편의점 / 한잔 / 배달 / 케이터링 / ...
  - `전체 허용` 토글 (기본값)
- 탭 5b: 특정 머천트 whitelist / blacklist
  - 검색하여 머천트 추가
  - `whitelist` (이 정책은 이 머천트들만 허용) 또는 `blacklist` (이 머천트들 제외)
  - P1
- 탭 5c: 지역 반경 제한 (P2)
  - 회사 주소 기준 반경 (예: 2km) 내 머천트만 허용
  - 회사 주소가 여러 개면 멀티 거점 지원

#### 4.5.3 상태 머신 (Policy Lifecycle)

```
DRAFT ──[publish]──▶ SCHEDULED ──[effectiveFrom 도달]──▶ ACTIVE
  │                                                       │
  │                                                       │ [pause]
  └──[discard]──▶ (삭제)                                   ▼
                                                        PAUSED
                                                          │
                                                      [resume]
                                                          ▼
                                                        ACTIVE
                                                          │
                                               [effectiveTo 도달 또는 deactivate]
                                                          ▼
                                                       EXPIRED
```

- 한 번 ACTIVE 된 정책은 수정이 제한됨 (한도, 대상 은 새 버전으로 발행해야 함)
- DRAFT 만 자유롭게 수정 / 삭제 가능

#### 4.5.4 Preview & Simulation (P1)

- 정책을 publish 하기 전에 "이 정책이 적용되면 어떻게 되는가?" 시뮬레이션
- 입력: 가상의 임직원 (부서 / 직급) + 가상의 거래 (시각 / 금액 / 머천트)
- 출력: 승인됨 / 거절됨 + 사유 + 어떤 window / 한도에 의해 결정

#### 4.5.5 사용 DTO

`MealTicketPolicy`, `MealTicketPolicyWindow[]`

#### 4.5.6 GraphQL operation (모두 신규)

- `mealPoliciesByCorporate(corporateId, filter)`
- `mealPolicyDetail(id)`
- `mealPolicyCreate(input)` — DRAFT 로 생성
- `mealPolicyUpdate(id, input)` — DRAFT 만 수정 가능
- `mealPolicyPublish(id, effectiveFrom)` — DRAFT → SCHEDULED/ACTIVE
- `mealPolicyPause(id, reason)` — ACTIVE → PAUSED
- `mealPolicyResume(id)` — PAUSED → ACTIVE
- `mealPolicyDeactivate(id, effectiveTo)` — ACTIVE → EXPIRED
- `mealPolicyClone(id)` — 복제 후 DRAFT 로
- `mealPolicyImpactPreview(id)` — 적용 대상 임직원 수 + 예상 비용 (P1)
- `mealPolicySimulateTransaction(policyId, simulationInput)` — 시뮬레이션 (P1)
- `mealPolicyAuditTrail(policyId)` — 변경 이력 (P1)

#### 4.5.7 엣지 케이스

- **복수 정책 충돌**: 한 임직원에게 3개 정책이 동시에 해당 → 우선순위 숫자 낮은 정책이 이김 + 나머지는 적용 제외 (또는 한도 합산 — **서버 정책 결정 필요**)
- **effectiveFrom 이 과거**: 과거 날짜로는 publish 불가 (이전 거래에 소급 적용 금지)
- **빈 대상**: "적용 대상 0명" 일 때 publish 불가
- **overlap 되는 windows 내에서 같은 요일**: 관리자가 명시적으로 "의도된 중복입니다" 체크해야 진행
- **외화 정책**: VND 외 통화는 지원하지 않음 (베트남 전용). 모든 금액은 VND BigInt.
- **정책 삭제 시도**: ACTIVE 정책은 삭제 불가 → deactivate 먼저. EXPIRED 정책도 감사 목적으로 삭제 불가.

#### 4.5.8 P0 범위

- P0: 5탭 CRUD + publish/pause/resume/deactivate. 복수 정책 충돌 해결 로직.
- P1: 복제, 시뮬레이션, 감사 이력, 머천트 whitelist/blacklist, 커스텀 명단
- P2: 지역 반경, 다국어 정책명

- **P0**: ✅

### 4.6 `/budget` — Funding Policy / 예산 / Allowance Ledger 중심 화면

- **화면 목적**: Allowance Ledger 시스템의 중심 대시보드. 회사 전체의 funding 상태 (예치금 / 신용 한도 / 회사 지원금 포인트 충전 배치) + 이번 달 소진 분석 + 다음 달 예측.
- **해결하는 문제**: 기획서 §3.1 "사전 충전 및 예치금 모델" vs "사후 정산 Credit Net15/Net30" 을 한 화면에서 관리. 플럭시 같은 float income 운영 모델 준비.

#### 4.6.0 Funding Policy — SuperAdmin 책임 원칙 (핵심)

> **중요 — 책임 분리**: 기업/회사 고객이 어떤 funding model (Prepaid / Credit Net15 / Credit Net30) 로 플랫폼을 사용할지는 **플랫폼 공급자 (SuperAdmin) 가 신용도 평가 후 부여** 한다. Corporate 가 스스로 선택하는 것이 아니다.

**Funding Model 종류**:

| model | 의미 | 현금 흐름 | 적용 대상 (사용 가정) |
|---|---|---|---|
| `UNASSIGNED` | **미부여** (기본값, 신용도 평가 전) | 없음 — 임직원 포인트 충전 불가 | 신규 가입 직후 / 평가 대기 중 / 정지된 고객 |
| `PREPAID_DEPOSIT` | 예치금 선납 | Corporate → 플랫폼 에스크로 계좌 → 이후 포인트 충전 차감 | 중소기업 / 신용 등급 낮음 / 계약 초기 |
| `CREDIT_NET15` | 사후 정산 (15일) | 월말 사용액 합산 → 익월 15일 납입 | 중견기업 / 신용 등급 양호 |
| `CREDIT_NET30` | 사후 정산 (30일) | 월말 사용액 합산 → 익월 30일 납입 | 대기업 / FDI / 최상위 신용 등급 |

**SuperAdmin 측 책임 (SuperAdmin/Portal)**:
- Corporate 가입 시 초기 funding model 은 **`UNASSIGNED`** — 명시적으로 부여 전까지 임직원은 식권을 쓸 수 없다
- SuperAdmin 은 Corporate 의 **신용도 평가** 수행 (재무제표 / 신용평가사 리포트 / 비즈니스 규모 / 계약서 검토)
- 평가 결과에 따라 아래 중 하나로 전환:
  - `PREPAID_DEPOSIT` + `monthlyBudgetVnd` 한도 설정
  - `CREDIT_NET15` + `creditLimitVnd` 한도 설정
  - `CREDIT_NET30` + `creditLimitVnd` 한도 설정
- 모든 변경은 AuditLog 에 기록되고 Corporate OWNER 에게 알림 발송
- Corporate 의 신용도 저하 / 연체 발생 시 SuperAdmin 이 funding model 을 downgrade (예: CREDIT_NET30 → PREPAID_DEPOSIT) 또는 `UNASSIGNED` 로 일시 정지 가능

**CorporatePortal 측 책임 (본 프로젝트)**:
- 현재 funding model 을 **읽기 전용 으로 표시**
- funding model 에 따라 UI 동작을 분기 (§4.6.1 섹션 1)
- `UNASSIGNED` 상태에서는 포인트 충전 mutation 을 **클라이언트 단에서도 차단** (서버가 이중 검증)
- SuperAdmin 에게 funding model 부여 요청 / upgrade 요청 버튼 (comment + 이메일 발송, 실제 변경은 SuperAdmin 이)
- **금지 액션**: funding model 을 Corporate 관리자가 직접 변경 (`corporate.funding.policy.write` permission 은 SuperAdmin 전용)

**서버 측 enforcement** (CentralApi 의 `corporate.wallet.fund` guard):
```
if corporate.fundingModel === 'UNASSIGNED' then
    throw DomainError('FUNDING_MODEL_NOT_ASSIGNED')
  if 'PREPAID_DEPOSIT' and depositBalanceVnd < requestedLoadVnd then
    throw DomainError('INSUFFICIENT_DEPOSIT')
  if 'CREDIT_NET15' | 'CREDIT_NET30' and outstandingVnd + requestedLoadVnd > creditLimitVnd then
    throw DomainError('CREDIT_LIMIT_EXCEEDED')
```

#### 4.6.1 화면 구성 (섹션별)

**섹션 1 — Funding Policy 상태 카드 (최상단, 가장 중요)**

현재 `MealCorporate.fundingModel` 에 따라 카드 내용이 완전히 다르게 표시:

**케이스 A — `UNASSIGNED` (미부여, 신규 가입 직후 또는 SA 정지)**:
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Funding Policy 가 아직 부여되지 않았습니다.      │
├─────────────────────────────────────────────────────┤
│  플랫폼 공급자 (SuperAdmin) 가 귀사의 신용도를 평가  │
│  한 후 Prepaid 또는 Credit 정책을 부여합니다.       │
│                                                     │
│  현재 상태: 신용도 평가 대기 중                     │
│  평가 상태: PENDING (제출일: 2026-04-01)           │
│                                                     │
│  이 상태에서는 임직원 포인트 충전이 불가능합니다.   │
│  임직원 등록 / 정책 설정 / 머천트 허용 설정은 가능. │
│                                                     │
│  [📧 SuperAdmin 에 문의]  [📄 제출 서류 확인]       │
└─────────────────────────────────────────────────────┘
```
- CTA: "SuperAdmin 문의" → 이메일 템플릿 열림 / "제출 서류 확인" → 신용도 평가 필요 서류 목록 모달

**케이스 B — `PREPAID_DEPOSIT` (예치금 선납)**:
```
┌─────────────────────────────────────────────────────┐
│  💰 Prepaid Deposit (예치금 선납 방식)               │
│  👤 부여자: 플랫폼 공급자 / 부여일: 2026-01-15       │
├─────────────────────────────────────────────────────┤
│  🏦 에스크로 잔액:      450,000,000 VND              │
│     월 예산 (권장):     500,000,000 VND              │
│     사용 중:            280,000,000 VND              │
│     잔여 (충전 가능):   170,000,000 VND              │
│                                                     │
│  ⚠️ 잔액 부족 예상 시점: D-12 (2026-04-20)           │
│                                                     │
│  은행 납입 안내:                                    │
│  BIDV Bank / 123-456-789 / Platform Ltd            │
│  [📝 납입 완료 기록]  [📈 월간 소진 추이 보기]      │
└─────────────────────────────────────────────────────┘
```
- 관리자가 은행에 실제 송금 후 "납입 완료 기록" 버튼 → 증빙 업로드 + 금액 입력 → SuperAdmin 이 확인 후 `depositBalanceVnd` 업데이트
- 잔액이 N일 내 소진 예상이면 빨간 배너 + 자동 알림

**케이스 C — `CREDIT_NET15` 또는 `CREDIT_NET30` (사후 정산)**:
```
┌─────────────────────────────────────────────────────┐
│  💳 Credit NET30 (사후 정산 방식)                    │
│  👤 부여자: 플랫폼 공급자 / 부여일: 2026-01-15       │
├─────────────────────────────────────────────────────┤
│  💳 신용 한도:          1,000,000,000 VND            │
│     이번 달 사용:       320,000,000 VND (32%)       │
│     한도 내 여유:       680,000,000 VND              │
│                                                     │
│  📅 다음 정산일: 2026-05-01 (D-23)                   │
│  📄 다음 인보이스 예상 총액: 320,000,000 VND         │
│                                                     │
│  [📊 정산 이력 보기]  [💼 한도 상향 요청]            │
└─────────────────────────────────────────────────────┘
```
- 한도 사용률 progress bar + 임계 경고 (80%/100%)
- "한도 상향 요청" → SuperAdmin 에 comment 전송 (실제 승인은 SA)
- 다음 정산일 = `periodEnd + netTermDays (15 or 30)`

**섹션 2 — 이번 달 포인트 소진 요약** (funding 부여 후에만 표시)
- 총 예산 / 충전된 회사 지원금 포인트 / 실제 사용 / 미사용 / 자동 소멸 예정 (5개 숫자 카드)
- 포인트 사용 vs 충전 추이 차트 (날짜 vs VND, 2개 라인)
- 부서별 소진 막대 차트 (상위 10)
- 카테고리별 소진 파이 (한식/베트남식/카페/편의점/배달)

> UNASSIGNED 상태에서는 섹션 2 부터 **회색 비활성** 으로 표시 + "Funding Policy 부여 후 사용 가능" 오버레이

**섹션 3 — 회사 지원금 포인트 충전 (월초 배치)** (funding 부여 후에만 활성)
- "이번 달 충전 이력" 리스트 (UI 표현: "충전". 내부 DB 는 funding entry)
- 마지막 충전 배치: 날짜 + 대상 인원 + 총액 + 상태 (`PENDING/POSTED/FAILED/PARTIAL_SUCCESS`)
- 다음 충전 예정일
- 수동 충전 트리거 버튼 (P1) — 드라이런 + 실행 2단계 — **UNASSIGNED 에서는 비활성**
- 정기 배치 설정 (cron-like): "매월 1일 09:00 전 직원에게 X VND 포인트 충전" (P1)

**섹션 4 — 개인 충전 활동**
- 임직원이 본인 돈 (ZaloPay/MoMo/VNPay) 으로 충전한 내역 요약
- 이번 달 총 충전액, 충전 인원, 평균 충전액
- "회사 지원금 대비 개인 충전 비율" (임직원의 self-funding 수준을 나타냄)
- **주의**: 개인 충전은 funding model 과 무관하게 임직원 개인의 자발적 충전이므로 UNASSIGNED 상태에서도 이론상 가능하나, 실제 서버는 `MealWallet.status='ACTIVE'` + `MealCorporate.status='ACTIVE'` 일 때만 허용

**섹션 5 — 예산 예측 (Forecast)** (funding 부여 후에만 활성)
- 현재 포인트 소진 속도 기준 "이달 말 예상 총액" 계산
- 지난 3개월 평균 대비 ±N%
- **PREPAID 모델**: 예치금 소진 예상 시점 (D-n) 경고
- **CREDIT 모델**: 한도 초과 예상 시점 경고
- P1

**섹션 6 — 월말 자동 소멸 예정 포인트** (§9.4 참조, funding 부여 후에만 활성)
- 이번 달 말에 자동 소멸될 회사 지원금 포인트 총액 + 영향받는 임직원 수
- **중요**: 소멸은 SyncWorkers cron 이 자동 수행. 관리자가 수동으로 회수하지 않음.
- 영향 임직원 목록 (클릭 → `/employees/[id]`)
- P1

**섹션 2 — 이번 달 포인트 소진 요약**
- 총 예산 / 충전된 회사 지원금 포인트 / 실제 사용 / 미사용 / 자동 소멸 예정 (5개 숫자 카드)
- 포인트 사용 vs 충전 추이 차트 (날짜 vs VND, 2개 라인)
- 부서별 소진 막대 차트 (상위 10)
- 카테고리별 소진 파이 (한식/베트남식/카페/편의점/배달)

**섹션 3 — 회사 지원금 포인트 충전 (월초 배치)**
- "이번 달 충전 이력" 리스트 (UI 표현: "충전". 내부 DB 는 funding entry)
- 마지막 충전 배치: 날짜 + 대상 인원 + 총액 + 상태 (`PENDING/POSTED/FAILED/PARTIAL_SUCCESS`)
- 다음 충전 예정일
- 수동 충전 트리거 버튼 (P1) — 드라이런 + 실행 2단계
- 정기 배치 설정 (cron-like): "매월 1일 09:00 전 직원에게 X VND 포인트 충전" (P1)

**섹션 4 — 개인 충전 활동**
- 임직원이 본인 돈 (ZaloPay/MoMo/VNPay) 으로 충전한 내역 요약
- 이번 달 총 충전액, 충전 인원, 평균 충전액
- "회사 지원금 대비 개인 충전 비율" (임직원의 self-funding 수준을 나타냄)
- **주의**: 개인 충전은 실제 현금이므로 회사 지원금 포인트와 같은 카드에 표시하지 않음

**섹션 5 — 예산 예측 (Forecast)**
- 현재 포인트 소진 속도 기준 "이달 말 예상 총액" 계산
- 지난 3개월 평균 대비 ±N%
- 예산 초과 예상 시 빨간 경고 카드 + "정책 재조정" CTA → `/policies`
- P1

**섹션 6 — 월말 자동 소멸 예정 포인트**
- 이번 달 말에 자동 소멸될 회사 지원금 포인트 총액 + 영향받는 임직원 수
- 소멸되면 "재무 관점" 에서 미사용 복지비 (회사가 충전했지만 안 쓴 포인트)
- **중요**: 소멸은 SyncWorkers cron 이 자동 수행. 관리자가 수동으로 회수하지 않음.
- 영향 임직원 목록 (클릭 → `/employees/[id]`)
- P1

#### 4.6.2 Allowance Ledger 표시 원칙 (§9 에서 재확인)

- **회사 지원금 포인트** 와 **개인 충전 현금** 은 절대 합쳐서 한 숫자로만 표시하지 않는다
- 합산 잔액은 별도 "사용 가능 금액" 으로만 표기
- 각 bucket 의 이번 달 흐름 (**충전 / 사용 / 소멸 / 이월**) 을 독립적으로 계산
- **용어 강제**: "지급 / 회수" 금지, "충전 / 소멸" 사용. 회사 지원금 버킷은 항상 `[P]` 포인트 뱃지와 함께 표시

#### 4.6.3 사용 DTO

`MealFundingAccount`, `MealTicketWallet` (집계), `MealTicketWalletFundingEntry[]`, `MealTicketConsolidatedEInvoice` (링크)

#### 4.6.4 GraphQL operation

**Query**:
- `mealFundingAccountByCorporate(corporateId)` — 섹션 1 funding policy 카드 (fundingModel / depositBalanceVnd / creditLimitVnd / outstandingVnd / nextInvoiceDueDate / monthlyBudgetVnd / creditAssessmentStatus / fundingPolicyGrantedAt / fundingPolicyGrantedByAdminId)
- `mealFundingPolicyHistory(corporateId, cursor)` — funding policy 변경 이력 (P1, SuperAdmin 의 승급/강등 전수 기록)
- `mealBudgetSummary(corporateId, period)` — 섹션 2 차트 집계 (UNASSIGNED 일 때 `{ available: false, reason: 'FUNDING_NOT_ASSIGNED' }` 반환)
- `mealBudgetByCategoryAndDepartment(corporateId, period)` — 카테고리/부서별 집계
- `mealBudgetForecast(corporateId)` — 섹션 5 예측
- `mealCompanyAllowanceLoadBatches(corporateId, cursor)` — 섹션 3 충전 이력
- `mealPersonalTopUpActivity(corporateId, period)` — 섹션 4
- `mealExpiringAllowanceDetail(corporateId, period)` — 섹션 6 자동 소멸 예정 포인트

**Mutation — Corporate 측 (funding model 별 분기)**:
- `mealCompanyAllowanceLoad(input)` — 수동 포인트 충전 실행. **UNASSIGNED 에서는 서버가 `FUNDING_MODEL_NOT_ASSIGNED` 에러**. PREPAID 에서는 예치금 잔액 검증, CREDIT 에서는 한도 검증.
- `mealCompanyAllowanceLoadSchedule(corporateId, cronExpr, amount)` — 정기 충전 배치 설정 (UNASSIGNED 차단)
- `mealFundingAccountDepositRecord(input)` — **PREPAID 전용**. 실제 송금은 은행에서 처리, 본 mutation 은 "송금 완료 기록" 만 (status=`PENDING`). SuperAdmin 이 확인 후 `POSTED` 로 승격 (§4.6.4 SA mutation 참조).
- `mealCorporateRequestFundingPolicyUpgrade(input)` — Corporate 의 한도 상향 / 모델 변경 요청. 실제 승인은 SuperAdmin (comment + email 발송). 서버는 요청 기록만 저장.

**Mutation — SuperAdmin 전용** (CorporatePortal 에 절대 노출 금지):
- `platformAssignCorporateFundingPolicy(corporateId, input)` — SA 가 Corporate 에 funding model 최초 부여 또는 변경. `{ fundingModel, monthlyBudgetVnd, creditLimitVnd?, netTermDays?, notes, assessmentDocumentRefs }`. 권한: `platform.corporate.fundingpolicy.write` (SA 전용)
- `platformApproveFundingDeposit(depositRecordId)` — PREPAID 예치금 납입 기록을 PENDING → POSTED 전환 (입금 확인 후)
- `platformSuspendCorporateFunding(corporateId, reason)` — funding model → UNASSIGNED 로 downgrade (연체 / 신용 저하 시)
- `platformUpdateCorporateCreditAssessment(corporateId, status, notes, documentRefs)` — 신용도 평가 상태 (`PENDING / APPROVED / REJECTED / UNDER_REVIEW`) 업데이트

> **용어 매핑 주의**: 기존에 "distribute / 배포" 로 표현하던 mutation 을 "**load (충전)**" 로 통일. "distribute" 는 뭔가를 나눠준다는 뉘앙스가 있어 여전히 지급 느낌이 날 수 있음. "load" 는 "선불카드에 포인트를 적재" 라는 명확한 meta (Pluxee / Edenred 도 동일 표현). `Deposit` 은 Funding Account 의 예치금 (실제 현금) 납입이므로 예외적으로 유지.

#### 4.6.5 허용 action (funding model 별)

| 액션 | UNASSIGNED | PREPAID_DEPOSIT | CREDIT_NET15/30 | 필요 permission |
|---|:---:|:---:|:---:|---|
| 섹션 1 funding 상태 조회 | ✅ | ✅ | ✅ | `corporate.wallet.read` |
| 월초 자동 포인트 충전 (cron) | ❌ | ✅ | ✅ | 서버 자동 |
| 수동 포인트 충전 (`mealCompanyAllowanceLoad`) | ❌ `FUNDING_NOT_ASSIGNED` | ✅ (예치금 한도 내) | ✅ (신용 한도 내) | `corporate.wallet.fund` |
| 예치금 납입 기록 (`mealFundingAccountDepositRecord`) | ❌ | ✅ | ❌ (의미 없음) | `corporate.wallet.fund` |
| 한도 상향 / 모델 변경 **요청** (`mealCorporateRequestFundingPolicyUpgrade`) | ✅ (평가 촉구) | ✅ (Credit 으로 승급 요청) | ✅ (한도 상향 요청) | `corporate.wallet.fund` |
| funding policy **실제 변경** | ❌ SA 전용 | ❌ SA 전용 | ❌ SA 전용 | `platform.corporate.fundingpolicy.write` |
| 정기 충전 배치 설정 | ❌ | ✅ | ✅ | `corporate.wallet.fund` |
| 임직원 등록 / 배지 발급 / 정책 설정 | ✅ | ✅ | ✅ | 각 화면 permission |

> **임직원 등록은 funding policy 와 무관**: Corporate 가 UNASSIGNED 상태여도 임직원 리스트 등록 / 부서 편집 / 정책 빌더 사용은 가능. 다만 임직원 wallet 발급은 되어 있되 (`MealWallet.status='ACTIVE'`) 포인트 잔액은 0 이며 서버가 충전 mutation 을 차단한다.

#### 4.6.6 엣지 케이스

- **UNASSIGNED 에서 충전 시도**: 서버가 `FUNDING_MODEL_NOT_ASSIGNED` 에러 반환. 포털은 에러 코드 → "플랫폼 공급자가 귀사의 funding model 을 아직 부여하지 않았습니다. SuperAdmin 에 문의하세요" 안내 토스트
- **신규 가입 직후 자동 `UNASSIGNED`**: SuperAdmin 이 corporate 를 생성할 때 기본값 `UNASSIGNED`. 신용도 평가 후 명시적으로 부여 필수.
- **예치금 부족**: PREPAID 에서 `depositBalanceVnd < 이번 달 필요 예산` 이면 화면 상단에 빨간 배너 "예치금 부족, 재납입이 필요합니다" + 구체 금액 표시. 신규 거래 승인은 CentralApi 의 transaction service 에서 차단
- **수동 포인트 충전 시 예치금 부족**: 확인 다이얼로그에서 "예치금이 N VND 부족합니다. 예치금 납입 후 다시 시도하세요" 에러, 실행 차단
- **포인트 충전 배치 부분 실패**: 5000명 중 300명 실패 시 funding entry status `FAILED`, 전체 batch 는 `PARTIAL_SUCCESS`. "실패 건만 재시도" CTA 제공
- **CREDIT 모델 초과**: `outstandingVnd + newChargeVnd > creditLimitVnd` 접근 시 새 거래 차단 (CentralApi 에서 `CREDIT_LIMIT_EXCEEDED`) + 화면에 경고
- **SuperAdmin 이 PREPAID → CREDIT 로 승급**: 기존 예치금은 어떻게? 기본 정책 — 기존 예치금은 잔존 그대로 유지 (credit 한도와 병존). 예치금이 먼저 소진된 후 credit 한도 사용. SA 가 명시적으로 "예치금 환급 요청" 시 환불 (P2)
- **SuperAdmin 이 CREDIT → PREPAID 로 강등**: 미지급 outstanding 금액은 어떻게? 기본 정책 — SA 가 downgrade 시 반드시 "기존 outstanding 은 어떻게 정산할지" 명시 (즉시 청구 / 다음 정산일 유지 / 분할 납부). AuditLog 에 기록.
- **funding model 변경 중 진행 중인 거래**: 변경 트랜잭션이 원자적 → 진행 중 거래는 기존 model 기준으로 처리, 이후 거래부터 신 model 적용

- **P0**: ✅ (섹션 1~4 read-only)

### 4.7 `/budget/ledger` — 원장 내역 (Corporate Ledger)

- **화면 목적**: 회사 전체의 funding entry + transaction 을 시간순 한 줄로 통합 표시. 회계 증빙 / 민원 대응 / 감사 증빙용 원장.
- **해결하는 문제**: 비플식권의 "식권별 현황 / 사용자별 현황 / 가맹점별 현황" 3종 보고서 + 식권대장의 "부서별·식당별 통계" 를 한 곳에 모은 SoR.

#### 4.7.1 화면 구성

- **필터 바**: 기간 / sourceType (FUNDING / TRANSACTION) / 부서 / 임직원 / 머천트 / 상태 / 최소/최대 금액
- **결과 테이블** (union view):

| 열 | FUNDING 행 (포인트 변동) | TRANSACTION 행 (결제) |
|---|---|---|
| 시각 | createdAt | authorizedAt |
| 유형 | 🏢 회사 지원금 충전 / 자동 소멸 / 개인 충전 | 💳 결제 / 거절 / 결제 취소 |
| 대상 | 임직원 (지갑 소유자) | 임직원 + 머천트 (지점명) |
| 금액 | ±VND (충전 `+`, 사용/소멸 `−`) | ±VND (결제 `−`, 취소 `+`) |
| 상태 | PENDING / POSTED / EXPIRED / REVERSED | APPROVED / DECLINED / REVERSED / SETTLED |
| 원장 키 | fundingEntryId | transactionId |
| 비고 | source batch id (월초 배치) / 소멸 사유 (퇴사/월말/정책) | Split ratio / decline reason |

- `EXPIRED` 로우는 회색 처리 + "자동 소멸" 라벨 (시스템이 수행한 것이라는 점 강조)
- `REVERSED` (관리자 교정) 로우는 🟠 주황 + "관리자 교정" 라벨 + 교정 사유 tooltip (드물게만 등장)

- **합계 바** (필터 결과 기준): 총 거래 수 / 승인 금액 / 거절 건수 / 환불 건수
- **엑셀 다운로드**: 원본 ledger + group-by 리포트 (부서 / 머천트 / 일자)
- **북마크**: 관리자가 자주 쓰는 필터 조합을 저장 (P2)

#### 4.7.2 GraphQL operation

- `mealCorporateLedger(corporateId, filter, cursor)` — union type 반환
- `mealCorporateLedgerExport(corporateId, filter)` — signed URL

#### 4.7.3 P0 범위

- P0: ❌ (P1) — 1차 릴리스는 `/employees/[id]` 상세의 탭 2/3 로 충분
- P1: 통합 원장 + 엑셀 다운로드
- P2: 북마크, 고급 group-by

- **P0**: ❌ (P1)

### 4.8 `/merchants` — 제휴 가맹식당 허용 토글 (읽기 전용 카탈로그 + allowlist)

> **핵심 책임 분리** (사용자 확정):
> - **SuperAdmin** 이 제휴 가맹 계약을 맺은 식당 (`BrandHQ` + `Branch` + `MealMerchantEnrollment`) 을 **등록 / 수정 / 해제 / 수수료율 설정** 한다. 머천트 카탈로그의 **단일 원본은 SuperAdmin**.
> - **CorporatePortal** 은 SuperAdmin 이 활성화한 제휴 가맹식당 리스트를 **읽기 전용으로 표시** 하고, 각 머천트마다 "우리 회사 임직원이 여기서 식권을 사용할 수 있는가?" **토글 하나만** 편집한다. 토글 ON 된 머천트에서만 해당 corporate 의 임직원이 식권을 쓸 수 있다.
> - CorporatePortal 은 머천트를 **생성 / 수정 / 해제 / 수수료율 변경 / 정산계좌 변경 하지 않는다** (서버 RBAC 로 차단).

- **화면 목적**: Corporate 관리자가 "우리 임직원이 쓸 수 있는 가맹 식당" 을 토글 단위로 큐레이션.
- **해결하는 문제**: 기획서 §4.2 "임직원에게 어떤 식당에서 쓰게 할지 지정". 플랫폼 전체 가맹식당 중 우리 회사 정책에 맞는 것만 open.

#### 4.8.1 화면 구성 (2가지 view 토글)

**View A — 리스트**
- 필터: 카테고리 / 지역 (구·거리·ward) / 허용 여부 (ALLOWED/BLOCKED/ALL) / loopType / 이번 달 사용 여부
- 테이블 (각 행은 읽기 전용, 우측 토글만 편집 가능):

| 열 | 내용 |
|---|---|
| 머천트명 | BrandHQ + Branch displayName (SuperAdmin 소유) |
| 카테고리 | 한식 / 베트남식 / 카페 / 편의점 / ... |
| 주소 | 전체 주소 (읽기) |
| loopType | OPEN_LOOP / CLOSED_LOOP 배지 |
| 거리 | 회사 주소 기준 km (Google Maps Distance Matrix, P1) |
| 이번 달 이용 | 건수 / 금액 (이 corporate 의 임직원 기준) |
| 수수료율 | 표시만 (SuperAdmin 설정, 참고용) |
| 허용 토글 | ON / OFF 스위치 ← **유일한 편집 가능 필드** |

- 툴바: `카테고리별 일괄 ON/OFF` / `전체 결과 일괄 ON/OFF` / `CSV 내보내기`

**View B — Google Maps 지도 (P1)** — Bounding Box 기반 서버 지오펜싱
- **지도 라이브러리: Google Maps 전용** (`@react-google-maps/api` + `@googlemaps/js-api-loader`)
- 기본 센터: corporate 의 `addressFull` 을 Google Geocoding 으로 변환한 좌표 (주소 변경 시 재지오코딩, Redis 24h 캐시)

**Bounding Box 기반 쿼리 (비용 / 성능 최적화 핵심)**:
- **절대 원칙**: 전체 머천트 마커를 한 번에 불러오지 않는다. 지도의 현재 viewport (Bounding Box) 안의 머천트만 서버에 요청.
- 쿼리:
  ```graphql
  mealEnrolledMerchantsByCorporate(
    corporateId: $corporateId,
    bbox: { swLat: $swLat, swLng: $swLng, neLat: $neLat, neLng: $neLng },
    filter: { categoryIds?, isAllowed? },
    limit: 500  # 한 viewport 에 500 마커 상한
  )
  ```
- 서버 (CentralApi) 는 PostGIS 확장 또는 단순 `WHERE lat BETWEEN swLat AND neLat AND lng BETWEEN swLng AND neLng` 로 필터링
- `Branch` 테이블에 `(lat, lng)` 컬럼 + GIST 인덱스 필요 (Phase -1 SP-A 에 추가)
- **Debounce**: 사용자가 지도를 팬/줌할 때마다 viewport 가 바뀌지만, 300ms debounce 후에만 쿼리. 연속 움직임 중엔 호출 안 함.
- **중첩 viewport 캐싱**: Apollo cache 에 `{ bboxHash }` 별 결과 저장. 이전 viewport 와 겹치는 영역은 재요청 없이 즉시 표시.
- **마커 클러스터링**: 500 마커 초과 시 `@googlemaps/markerclusterer` 로 클러스터 표시 → 확대 시 해제
- **LOD (Level of Detail)** — 줌 레벨별:
  - z < 12 (광역): 머천트 표시 X, "확대하여 가맹식당 보기" 안내만
  - z 12~14: 클러스터만 표시 (카운트 수)
  - z >= 15: 개별 마커 표시

**마커 색상**:
- 🟢 초록: 현재 corporate 가 허용 (ALLOWED)
- ⚪ 회색: 가맹되어 있지만 우리 회사는 아직 미허용 (BLOCKED)
- 🔴 빨강: SuperAdmin 이 enrollment 해제 (가맹 끝남) — 토글 disabled

**상호작용**:
- 마커 클릭 → 우측 drawer 에 상세 + 토글
- 지도 상단 컨트롤: `내 회사 중심으로 이동` / `반경 필터 (0.5 / 1 / 2 / 5 km)` / `카테고리 체크박스`
- 반경 필터는 지도의 circle overlay 로 시각화 + bbox 로 서버 쿼리

**Google Maps 비용 관리**:
- **Maps JavaScript API 로드**: 페이지당 1회 (React `LoadScript` once) — 지도 표시당 ~$7/1000 로드
- **Places API 사용 최소화**: 자동완성 / 주소 검색 기능은 필요 시에만 (P2)
- **Geocoding API 캐싱**: corporate.addressFull + Branch.address 를 Redis 24h 캐시 → 월간 중복 호출 제거
- **Static Maps 활용 (P2)**: 대시보드 W6 같은 작은 미리보기는 Static Maps API (더 저렴) 로 전환
- **월 예산 alert**: GCP billing alert 70% / 90% / 100% 자동 알림 → SA 가 viewport 통계 조사

**API 키 관리**:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (env)
- HTTP referer 제한 (`corporate.hyojung.vn` 도메인만)
- GCP Console 에서 Maps JavaScript + Geocoding + Static Maps API 만 활성화 (나머지 차단)
- 일일 호출 한도 설정 (예: 50,000 req/day) → 초과 시 자동 차단

**Google Maps 사용 이유**: 베트남에서 유일하게 안정적인 POI + 한국어/베트남어/영어 라벨 + PostGIS 대비 운영 간소화. Mapbox / Naver 는 사용하지 않음.

#### 4.8.2 머천트 상세 drawer (리스트 / 지도 클릭 시)

**읽기 전용 정보 (SuperAdmin 소유)**:
- 기본 정보: 이름, 주소, 전화, 카테고리, loopType
- enrollment 상태 + 가입 일자 + 계약 종료 예정일
- 수수료율 이력 (effectiveFrom ~ effectiveTo, 표시만)
- 영업 시간 (Branch 운영 스케줄)
- SuperAdmin 이 공개한 브랜드 설명 / 메뉴 카테고리

**Corporate 관점의 통계** (읽기):
- 이번 달 사용 요약: 이용 건수, 총 금액, 고유 이용자 수, 평균 객단가, 상위 임직원 3명
- 거절 사유 통계 (P1): 이 머천트에서 우리 회사 임직원이 거절된 건수 + 사유 breakdown

**편집 가능한 유일한 필드**:
- **허용 토글** (`isAllowed`) — ON/OFF
- 토글 변경 시 사유 입력 (optional, 감사 로그에 기록)
- 변경 사항은 **즉시 반영** (다음 거래부터 적용)

**금지 액션** (서버 측에서 `403 Forbidden` 반환):
- 머천트 정보 수정
- 수수료율 변경
- 정산 계좌 변경
- 가맹 해제 / 재가입
- 새 머천트 추가

#### 4.8.3 카테고리 일괄 관리

- SuperAdmin 이 정의한 카테고리 preset: `한식`, `베트남식 (Phở, Bún, Cơm)`, `일식`, `중식`, `패스트푸드`, `카페`, `편의점`, `한잔 (Bia hơi)`, `배달 전용`, `케이터링`
- 각 카테고리 카드: `해당 카테고리 머천트 N개 중 허용 M개` 표시 + `모두 허용 / 모두 차단` 버튼
- 일괄 토글 시 영향 머천트 수 확인 다이얼로그

#### 4.8.4 데이터 모델 (§10 확정본 참조)

- **SuperAdmin 소유**:
  - `MealMerchantEnrollment` — 가맹 상태 (BrandHQ 1:1)
  - `MealMerchantCommissionRate` — 수수료율 이력
  - `MealMerchantSettlementAccount` — 정산 계좌
- **CorporatePortal 관리 (Corporate 스코프)**:
  - `MealCorporateMerchantAllowlist` (신규) — `(corporateId, branchId, isAllowed, updatedByAdminId, updatedAt, reason?)` 조합 테이블
  - 한 corporate 는 수많은 가맹식당에 대해 각각 ON/OFF 레코드를 가짐 (기본값: OFF — 명시적으로 허용해야 함)

#### 4.8.5 사용 DTO

`MealTicketMerchantBranchView` (SuperAdmin 소유, read-only view), `MealCorporateMerchantAllowlist` (신규), `MealMerchantEnrollment` (read-only)

#### 4.8.6 GraphQL operation

- `mealEnrolledMerchantsByCorporate(corporateId, filter, cursor)` — 이 corporate 에 노출되는 활성 가맹식당 리스트 (allowlist join)
- `mealMerchantDetailForCorporate(branchId, corporateId)` — drawer 상세 + 통계
- `mealMerchantMonthlyStatsForCorporate(branchId, corporateId, period)` — 이용 통계
- `mealCorporateMerchantAllowToggle(corporateId, branchId, allowed, reason?)` — 단건 토글
- `mealCorporateMerchantBulkToggle(corporateId, updates)` — 다건
- `mealCorporateMerchantCategoryBulkToggle(corporateId, categoryId, allowed)` — 카테고리 일괄
- `mealCorporateMerchantGeocode(corporateId)` — Google Geocoding 으로 회사 주소 → 좌표 (P1)
- `mealCorporateMerchantDeclineReasons(corporateId, branchId, period)` — P1

> 서버 측 권한: 위 모든 mutation 은 `corporate.merchant.allow.write` 필요. 머천트 자체 CRUD (`corporate.merchant.enroll`, `corporate.merchant.commission.write`, `corporate.merchant.account.write`) 는 **CorporatePortal 관리자에게 절대 부여되지 않는다**. (SuperAdmin role 전용)

#### 4.8.7 엣지 케이스

- **enrollment 가 해제된 머천트**: `MealMerchantEnrollment.isActive=false` 인 경우 리스트에서 회색 + "가맹 종료" 배지 + 토글 disabled. 과거 이 corporate 가 ON 상태였어도 서버가 자동으로 거래 승인 거절.
- **새로 가입한 머천트**: 지난 7일 내 SuperAdmin 이 enrollment 한 머천트는 "NEW" 배지 + 대시보드 알림 (P1)
- **기본값**: 새 corporate 가입 직후 모든 머천트는 OFF (BLOCKED) 상태. 명시적으로 허용해야 임직원이 사용 가능. 온보딩 시 "모든 한식/베트남식 카테고리 일괄 허용" CTA 제공.
- **이미 거래 중인 머천트 차단**: 차단 시점 이후 거래만 거절. 진행 중/승인 완료된 거래는 영향 없음.
- **SuperAdmin 이 가맹 해제**: SuperAdmin 이 `MealMerchantEnrollment.isActive=false` 로 바꾸면, 모든 corporate 의 allowlist 행은 유지되지만 서버가 거래를 자동 거절. CorporatePortal 은 "가맹 종료됨" 표시만.
- **수수료율 변경**: SuperAdmin 이 수수료를 변경해도 corporate 쪽에 영향 없음 (인보이스에만 반영). CorporatePortal 은 참고용으로 최신 수수료율만 표시.

#### 4.8.8 P0 범위

- P0: View A 리스트 + 단건/다건 토글 + 카테고리 일괄 + 필터 + CSV 내보내기
- P1: View B Google Maps 지도 + geocoding + 반경 필터 + 거절 사유 통계 + NEW 배지 알림
- P2: 즐겨찾기 / 리뷰 / 임직원 추천 기능

- **P0**: ✅

### 4.9 `/invoices` — 월간 통합 전자세금계산서 검토 / 발행 요청 / 수령

- **화면 목적**: 매월 1회 자동 생성되는 단일 통합 전자세금계산서 (Consolidated E-Invoice) 를 **Corporate 재무팀이 검토** → **발행 요청 또는 이의 제기** → 수령·다운로드·감사.
- **해결하는 문제**: 기획서 §2.1 "수천 건의 개별 식사 내역을 하나의 청구서로 묶어 전자세금계산서를 일괄 발행" — 재무팀이 종이 영수증 수백 장을 대체하고 GDT 제출 증빙을 자동 확보. + **B2B AP 워크플로우 관점의 검토 승인 단계** (SAP Concur / Tipalti / Coupa / Basware 표준).
- **법적 기반**: Decree 70/2025, Decree 123/2020, Circular 32/2025 (베트남 e-Invoice 의무화)
- **하이브리드 워크플로우** (사양서 `EInvoice-WeTax-사양.md §4.3.2` / §4.3.2.a 상태 머신 참조):
  1. 매월 1일 SyncWorkers cron 이 DRAFT 자동 생성
  2. **Corporate 가 7일 이내 검토 → "발행 요청" 또는 "이의 제기"**
  3. 7일 무응답 시 SyncWorkers daily cron 이 자동으로 `REQUESTED` 로 승격 (autoPromoted=true, 세무 마감일 보호)
  4. SuperAdmin 검수 → WeTax → GDT → ACCEPTED
  5. Corporate 재무팀 PDF/XML 다운로드
- **Corporate 의 역할 재확인** (법적 경계): "발행 요청" 은 **법적 발행 주체를 바꾸는 것이 아니라 서비스 구매자의 내용 확인 완료** 를 의미한다. seller 는 여전히 플랫폼 사업자. Corporate 는 `einvoice.request.write` / `einvoice.dispute.write` 를 통해 **검토 단계에만 참여**하고, 실제 발행 (`einvoice.publish.write` + WeTax 호출) 은 SuperAdmin 책임.

#### 4.9.1 화면 구성

- **필터 바**: 연도 / 월 범위 / 상태 (`DRAFT / DISPUTED / REQUESTED / SUBMITTING / ACCEPTED / REJECTED / VOIDED`) / provider type
- **상단 알림 배너** (상황별):
  - DRAFT 존재: "🔔 2026년 3월 인보이스가 검토 대기 중입니다 (D-5 / 마감: 2026-04-08). 내용 확인 후 발행 요청을 해주세요." + "지금 검토" CTA → 해당 row 의 상세로 이동
  - ACCEPTED 최신: "이번 달 인보이스가 준비되었습니다" + 다운로드 CTA
  - REJECTED 존재: "2026년 2월 인보이스가 GDT 에서 거부되었습니다. SuperAdmin 에게 문의하세요" (빨강)
  - DISPUTED (본인이 제기): "2026년 3월 인보이스에 이의 제기 중. SuperAdmin 응답 대기" (주황)
- **리스트 테이블**:

| 열 | 내용 |
|---|---|
| 기간 | 2026-03 (periodStart ~ periodEnd) |
| refId | `MC202603<corp12>` (클릭 → 상세) |
| 총 금액 (VND) | totalAmountVnd |
| VAT 금액 | vatAmountVnd |
| 라인 수 | `MealConsolidatedEInvoiceLine.count` |
| 합산 거래 건수 | sourceTransactionCount |
| 그룹화 전략 | BY_MERCHANT / BY_DAY / BY_DEPARTMENT / BY_CATEGORY / SINGLE_LINE 배지 |
| 상태 | badge (DRAFT 회색 / DISPUTED 주황 / REQUESTED 파랑 / SUBMITTING 스피너 / ACCEPTED 초록 / REJECTED 빨강 / VOIDED 회색 취소선) |
| 검토 마감 | DRAFT 일 때만 표시 — `reviewDueAt` 까지의 D-day (빨강: 2일 이하, 주황: 3~5일, 초록: 6~7일) |
| 발행 / 생성일 | DRAFT 는 createdAt, ACCEPTED 는 발행일 |
| GDT 접수 번호 | gdtReceiptNo (null 이면 "-") |
| 액션 | 상태별 버튼 (§4.9.2) |

#### 4.9.2 상태별 표시 및 액션 (핵심)

| 상태 | 의미 | UI 표시 | Corporate 허용 액션 | 필요 permission |
|---|---|---|---|---|
| **DRAFT** | cron 이 자동 생성, Corporate 검토 대기 | 회색 "검토 대기" + D-day 카운터 | **"발행 요청" 버튼** / **"이의 제기" 버튼** | `einvoice.request.write` / `einvoice.dispute.write` |
| **DISPUTED** | Corporate 가 이의 제기, SuperAdmin 조사 중 | 주황 "이의 제기 중" + 제기 사유 표시 | 조회만 (SuperAdmin 응답 대기) | `einvoice.read` |
| **REQUESTED** | Corporate 가 발행 요청 (또는 7일 자동 승격), SuperAdmin 검수 대기 | 파랑 "발행 요청됨" + 요청 시각 (또는 "자동 승격" 배지) | 조회만 | `einvoice.read` |
| **SUBMITTING** | SuperAdmin 이 WeTax 에 제출 중 | 주황 스피너 "제출 중" | 조회만 | `einvoice.read` |
| **ACCEPTED** | GDT 수락 완료 | 초록 "발급 완료" | **PDF 다운로드 / XML 다운로드** | `einvoice.read` |
| **REJECTED** | GDT 거부 | 빨강 "거부됨" + 거부 사유 | 조회만 + "SuperAdmin 문의" 링크 | `einvoice.read` |
| **VOIDED** | 긴급 무효화 (SA 가 처리) | 회색 취소선 "무효" 워터마크 | 조회만 (감사 목적 보존) | `einvoice.read` |

#### 4.9.2.a 발행 요청 플로우 (DRAFT → REQUESTED)

1. Corporate admin (OWNER 또는 FINANCE_ADMIN) 이 DRAFT 인보이스 클릭 → 상세 페이지 진입
2. 총액 / 그룹화 / 라인 내역 / sourceTransactionCount 검토
3. `[발행 요청]` 버튼 클릭 (기본 색상, primary CTA)
4. 확인 다이얼로그:
   ```
   이 인보이스의 발행을 요청하시겠습니까?

   📄 기간: 2026년 3월 1일 ~ 3월 31일
   💰 총액: 152,400,000 VND (VAT 포함)
   📊 거래 건수: 847건 / 라인: 12개 (BY_MERCHANT)
   🏢 Buyer: (주)우리회사 (세금코드 0123456789)

   [취소] [발행 요청 확정]

   확정 후 SuperAdmin 이 검수 → WeTax 에 제출 → GDT 발급됩니다.
   이 작업은 되돌릴 수 없으며, 잘못된 내용이면 "이의 제기" 를 사용하세요.
   ```
5. `mealConsolidatedInvoiceRequestIssuance(id)` mutation 호출
6. 서버 cache update → 상태 DRAFT → REQUESTED, UI 즉시 갱신
7. 토스트: "발행 요청이 전달되었습니다. SuperAdmin 검수 후 ACCEPTED 로 전환됩니다."
8. SuperAdmin 에 알림 (subscription topic: `platform.einvoice.requested`)

#### 4.9.2.b 이의 제기 플로우 (DRAFT → DISPUTED)

1. 상세 페이지에서 총액 이상 / 누락 의심 / 머천트 매핑 오류 발견
2. `[이의 제기]` 버튼 클릭 (outline, secondary)
3. 사유 입력 모달:
   ```
   이 인보이스에 이의를 제기하는 사유를 입력하세요.

   구체적인 라인 / 금액 / 날짜를 명시해주세요:
   [텍스트 영역, 최소 30자]

   첨부 파일 (optional): PDF/이미지 드롭존 — 내부 회계 증빙 등
   ```
4. `mealConsolidatedInvoiceDispute(id, reason, attachments?)` mutation 호출
5. 서버: status DRAFT → DISPUTED, disputedBy / disputedAt / disputeReason 기록
6. SuperAdmin 에 알림 (topic: `platform.einvoice.disputed`)
7. UI: 인보이스 카드가 주황 배지 + "SuperAdmin 응답 대기 중" 상태
8. SuperAdmin 이 수정/재생성 후 → DRAFT 로 revert → Corporate 에 재검토 요청 알림

#### 4.9.2.c 7일 자동 승격 (무응답 대응)

- SyncWorkers 의 daily cron `einvoice-auto-promote.job.ts` (매일 01:00 GMT+7) 이 `status='DRAFT' AND reviewDueAt < now()` 인 인보이스를 찾아 자동으로 REQUESTED 전환
- `autoPromoted=true` 플래그 + AuditLog 기록
- Corporate 에 알림: "검토 기간(7일)이 지나 자동으로 발행 요청되었습니다. 이상이 있다면 SuperAdmin 에게 문의하세요."
- 목적: 세무 마감일 (매월 20일 — Decree 70/2025 권장) 을 놓치지 않기 위함
- 검토 기간은 corporate 별로 조정 가능 (`MealCorporate.einvoiceReviewDays`, 기본 7, 3~14일)
| REJECTED | GDT 거부 (세무 오류 등) | "거부됨" (빨강) + SuperAdmin 연락 CTA |
| VOIDED | 무효화 | "무효" (회색) |

#### 4.9.3 허용 action

- **조회만 가능**
- ACCEPTED 상태의 인보이스에 대해:
  - PDF 다운로드 (signed URL, 5분 만료)
  - XML 다운로드 (GDT 원본 형식, 감사/재제출용)
  - 이메일 재전송 (P1, 등록된 contact email 로)
- **절대 금지**:
  - 재발행 요청
  - 수정
  - 라인 추가/삭제
  - 상태 수동 변경
  - 제출 취소
- REJECTED 상태일 때: "이 인보이스는 GDT 에서 거부되었습니다. SuperAdmin 에게 문의하세요" 안내 박스 + 이메일/chat 링크

#### 4.9.4 GraphQL operation

**Query**:
- `mealInvoicesByCorporate(corporateId, periodFilter, statusFilter, cursor)`
- `mealInvoiceDetail(id)` — §4.10
- `mealInvoiceDownloadPdf(id)` — signed URL (ACCEPTED 에서만 반환)
- `mealInvoiceDownloadXml(id)` — signed URL (ACCEPTED 에서만 반환)
- `mealInvoiceCurrent(corporateId)` — 이번 달 (대시보드 W6 와 공유)

**Mutation — Corporate 검토 단계** (신규, P0):
- `mealConsolidatedInvoiceRequestIssuance(id)` — DRAFT → REQUESTED 전환
  - 필요 permission: `einvoice.request.write`
  - 응답: 업데이트된 `MealConsolidatedEInvoice` full shape (status='REQUESTED', requestedByAdminId, requestedAt)
  - 서버 가드: 현재 status 가 `DRAFT` 가 아니면 `INVOICE_INVALID_STATE_TRANSITION` 에러
- `mealConsolidatedInvoiceDispute(id, input)` — DRAFT → DISPUTED 전환
  - Input: `{ reason: string (min 30자), attachmentRefs?: string[] }`
  - 필요 permission: `einvoice.dispute.write`
  - 응답: 업데이트된 invoice full shape (status='DISPUTED', disputedByAdminId, disputedAt, disputeReason)

**Mutation — 금지** (CorporatePortal 에 절대 노출 안 함):
- ~~`publishConsolidatedInvoice`~~ — SuperAdmin 전용 (`einvoice.publish.write`)
- ~~`voidConsolidatedInvoice`~~ — SuperAdmin 전용
- ~~`retryPublish`~~ — SuperAdmin 전용
- ~~`resolveDisputedInvoice`~~ — SuperAdmin 전용

**Subscription** (P1):
- `mealCorporateInvoiceChanges(corporateId)` — 상태 변화 실시간 수신 (DRAFT → REQUESTED → ACCEPTED 전이 감지)

#### 4.9.5 엣지 케이스

- **7일 자동 승격 직전**: `reviewDueAt < now() + 1day` 이면 리스트에 🔴 "D-1" 경고 + 이메일 리마인더 발송 (P1)
- **DISPUTED 후 Corporate 가 이의를 취소하고 싶을 때**: 취소 기능은 없음. SuperAdmin 이 조사 후 결정. 대신 추가 comment 제공 가능 (P2)
- **같은 달 두 번 클릭**: `mealConsolidatedInvoiceRequestIssuance` 는 멱등 — 이미 REQUESTED 상태면 에러 없이 기존 상태 반환
- **OWNER 가 이의 제기 → FINANCE_ADMIN 이 발행 요청 시도**: 서버가 현재 status DISPUTED 이므로 `INVALID_STATE_TRANSITION` 에러 반환
- **SuperAdmin 이 DISPUTED → DRAFT revert 후**: Corporate 에게 알림 + 다시 7일 window 부여 (reviewDueAt 갱신)
- **REJECTED 상태**: Corporate 는 조회만, 재제출 / 수정 불가. "SuperAdmin 에 문의" 버튼이 유일한 CTA.

#### 4.9.6 P0 범위

- **P0**: 리스트 + 상세 + PDF/XML 다운로드 + **발행 요청** + **이의 제기** + 상태별 액션 버튼 노출 + 검토 마감 D-day 카운터
- P1: 이메일 리마인더 (검토 마감 임박), 거부 사유 상세, 감사 이벤트 링크, 실시간 subscription, DISPUTED 후 추가 comment

- **P0**: ✅

### 4.10 `/invoices/[id]` — 인보이스 상세 / 검토 / 발행 요청

- **화면 목적**: 한 통합 인보이스의 full detail + **상태별 액션 패널** (DRAFT 면 발행 요청/이의 제기, ACCEPTED 면 PDF/XML 다운로드). 라인 항목 / seller / buyer snapshot / provider request/response / 제출 이력 / 감사 증빙 재생.

#### 4.10.1 섹션 구성

**섹션 0 — 상태별 액션 패널 (상단 sticky)**

상태에 따라 다른 액션 패널이 표시된다:

- **DRAFT 상태**: 🟡 "검토 대기 — 마감까지 D-5"
  - 큰 primary 버튼 `[📝 발행 요청]` — §4.9.2.a 플로우
  - 중 secondary 버튼 `[⚠️ 이의 제기]` — §4.9.2.b 플로우
  - 안내: "이 인보이스를 확인한 후 발행 요청을 해주시면 SuperAdmin 이 검수 → WeTax → GDT 제출합니다. 이상이 있다면 이의 제기로 SuperAdmin 에게 재검토를 요청하세요."

- **DISPUTED 상태**: 🟠 "이의 제기 중 — SuperAdmin 응답 대기"
  - 제기 시각 / 제기한 관리자 / 제기 사유 표시
  - "이 인보이스는 현재 조사 중입니다. 해결 후 다시 검토 요청이 오면 알림을 받으실 수 있습니다."
  - 액션 버튼 없음 (SuperAdmin 응답 대기)

- **REQUESTED 상태**: 🔵 "발행 요청 완료 — SuperAdmin 검수 대기"
  - 요청 시각 / 요청한 관리자 (또는 "자동 승격" 배지)
  - 검수 예상 소요 시간 안내 (예: "평균 1~2 영업일")

- **SUBMITTING 상태**: 🟠 스피너 "WeTax 에 제출 중"

- **ACCEPTED 상태**: 🟢 "발급 완료"
  - 큰 primary 버튼 `[📄 PDF 다운로드]`
  - 중 secondary 버튼 `[📦 XML 다운로드]`
  - ACCEPTED 시각 / GDT 접수 번호 표시

- **REJECTED 상태**: 🔴 "GDT 거부됨"
  - 거부 사유 표시 (provider errorMessage 요약)
  - `[📧 SuperAdmin 에 문의]` 버튼 (이메일 템플릿 열림)

- **VOIDED 상태**: ⚫ "무효 처리됨"
  - 무효 사유 표시
  - 조회만 가능

**섹션 1 — 인보이스 헤더**
- refId (`MC202603HYOJ12345678`)
- 기간 (periodStart ~ periodEnd)
- 상태 배지
- 생성일 / 발행 요청일 / ACCEPTED 일 (타임라인 형태)
- reviewDueAt (DRAFT 인 경우 남은 D-day)
- GDT 접수 번호 + CQT 인증 코드 (ACCEPTED 이후)
- provider type (WETAX / VIETTEL / MISA / DIRECT_GDT)
- formNo / serialNo / invoiceNo / lookupCode
- 그룹화 전략 배지

**섹션 2 — Seller Snapshot (발급자 = 플랫폼 사업자)**
- 박제된 seller 정보: `legalName / taxCode / addressFull (+ 분리 4개 필드: addressCity / addressDistrict / addressWard / addressDetail) / representativeName / contactEmail / contactPhone / contactFax / bankAccountNumber / bankName / defaultSerialPrefix`
- 이 정보는 발급 시점에 고정되며, PlatformLegalEntity 가 변경되어도 이 인보이스는 원본 유지
- Provider 별 매핑: WeTax seller / Viettel `sellerInfo` / MISA `SellerInfo` 모두 여기에서 읽음

**섹션 3 — Buyer Snapshot (수신자 = 우리 회사)**
- 박제된 corporate 정보: `companyName / taxCode / addressFull (+ 분리 4개 필드) / contactName / contactEmail (PII 마스킹) / contactPhone / contactFax / bankAccountNumber / bankName / einvoiceConsolidationStrategy`
- 만약 회사가 그 후에 이름/주소를 변경했어도, 이 인보이스는 발급 당시의 snapshot 유지
- Provider 별 매핑: WeTax buyer / Viettel `buyerInfo` / MISA `BuyerInfo` 모두 여기에서 읽음

**섹션 4 — 라인 항목 (`MealConsolidatedEInvoiceLine[]`)**
- 테이블: seq / itemCode / itemName / uom / quantity / unitPriceVnd / amountVnd / vatRate / vatAmountVnd / payAmountVnd / feature
- 그룹화 전략에 따라 라인 수가 달라짐:
  - `BY_MERCHANT`: 머천트 수만큼 (예: 50 라인)
  - `BY_DAY`: 30 라인
  - `BY_DEPARTMENT`: 부서 수만큼
  - `BY_CATEGORY`: 카테고리 수만큼 (5~10 라인)
  - `SINGLE_LINE`: 1 라인
- 합계: totalAmountVnd, vatAmountVnd
- 라인 클릭 → 원본 거래 내역 drill-down (P1) : "이 라인에 포함된 거래 N건" 모달 — **DRAFT 상태 검토에 특히 유용** (이상 건 발견 시 바로 이의 제기)

**섹션 5 — 검토 / 발행 타임라인 (신규, P0)**
- 상태 전이 이벤트를 시간순으로 표시:
  - `🤖 2026-04-01 00:15 — cron 자동 생성 (DRAFT)`
  - `👤 2026-04-03 14:22 — 홍길동 (FINANCE_ADMIN) 발행 요청 → REQUESTED`
  - `👤 2026-04-04 09:30 — SuperAdmin (김철수) 검수 승인 → SUBMITTING`
  - `🌐 2026-04-04 09:30 — WeTax 제출 → GDT 승인 → ACCEPTED`
- 이벤트별 트리거 주체 (cron / Corporate admin / SuperAdmin / WeTax) 아이콘 구분

**섹션 6 — 제출 이력 (`EInvoiceSubmissionLog[]`)**
- 각 attempt 의 시각 / status / provider / durationMs / errorCode / errorMessage
- 첫 시도부터 최종 ACCEPTED 까지의 모든 retry 이력
- 감사 추적: 왜 2번 실패하고 3번째에 성공했는지 투명 공개
- P1

**섹션 7 — Audit Trail**
- 인보이스 관련 admin action history (requestIssuance / dispute / publish / retry)
- 각 전이의 시각 + 트리거 (cron / manual / retry) + actor
- 이의 제기 사유 / SuperAdmin 해결 comment
- P1

#### 4.10.2 GraphQL operation

- `mealInvoiceDetail(id)` — 섹션 1~5 전체
- `mealInvoiceSubmissionLogs(invoiceId, cursor)` — 섹션 6 (P1)
- `mealInvoiceAuditTrail(invoiceId)` — 섹션 7 (P1)
- `mealInvoiceLineTransactionDrilldown(lineId, cursor)` — 라인 원본 거래 (P1)
- `mealInvoiceDownloadPdf(id)` / `mealInvoiceDownloadXml(id)` — ACCEPTED 에서만
- `mealConsolidatedInvoiceRequestIssuance(id)` — DRAFT → REQUESTED (§4.9.2.a)
- `mealConsolidatedInvoiceDispute(id, input)` — DRAFT → DISPUTED (§4.9.2.b)

#### 4.10.3 엣지 케이스

- **라인 수가 500 초과** (BY_MERCHANT 전략): 테이블 가상 스크롤 필수
- **PII 마스킹**: buyerSnapshot 의 contactEmail / contactPhone 은 화면에서 마스킹 (`t***@example.com`, `+84 ***** 1234`)
- **REJECTED 인보이스**: 라인 항목은 보존하되 "이 인보이스는 거부되었으며 세무 효력이 없습니다" 경고 배너
- **VOIDED 인보이스**: 전체 화면에 "무효" 워터마크
- **DRAFT 인데 발행 요청 권한 없는 사용자** (VIEWER): 액션 패널의 버튼이 disabled 또는 숨김, 툴팁 "이 액션은 OWNER 또는 FINANCE_ADMIN 만 가능합니다"
- **이의 제기 사유 30자 미만**: 클라이언트 즉시 검증 + 서버 재확인
- **SuperAdmin 이 DISPUTED 해결 → DRAFT revert**: 상태 전환 시 섹션 0 액션 패널이 자동으로 DRAFT 모드로 전환, 새 reviewDueAt 표시

- **P0**: ✅ (섹션 0~5 + 발행 요청 + 이의 제기). 섹션 6/7 는 P1.

### 4.11 `/integrations` — HRIS 연동 / 외부 시스템

- **화면 목적**: Base.vn / SAP / Workday / 자체 HRIS API 연동 상태 관리. 마지막 싱크 시각, 싱크 실패 이벤트, 수동 재싱크 트리거, API 키 관리.
- **해결하는 문제**: 기획서 §4.2 "HRIS 연동을 통한 임직원 자동 동기화" + Base.vn 같은 베트남 현지 HR SaaS 와의 통합. 단, Base HRM 은 integration 이 "closed system" 이라 우선 순위 낮음.

#### 4.11.1 지원 대상 (로드맵)

| 파트너 | 우선순위 | Phase |
|---|---|---|
| **Base.vn** (HRM) | 최우선 — 베트남 시장 주도 | P2 |
| **자체 HRIS webhook** | 높음 — 대기업용 generic API | P2 |
| **SAP SuccessFactors** | 중 — FDI 대기업 | P3 |
| **Workday** | 중 — 다국적 기업 | P3 |
| **BambooHR / Personio** | 낮음 | P3 이후 |

#### 4.11.2 화면 구성

- **커넥터 카드 그리드**: 각 파트너 로고 + 연결 상태 + `연결 / 연결 해제` 버튼
- **선택된 커넥터 detail**:
  - 연결 상태 (`CONNECTED / DISCONNECTED / ERROR`)
  - 연결된 tenant id (파트너 측)
  - API 키 / OAuth 토큰 만료 일
  - 마지막 싱크 시각 + 다음 예정 시각
  - 싱크 범위 (부서 / 임직원 / 고용 형태 / 근태 / 급여)
  - 충돌 해결 정책 (파트너 우선 / CorporatePortal 우선 / 수동 해결)
  - 실패 이벤트 목록 (최근 50건)
  - 수동 재싱크 버튼 (드라이런 / 실행)

#### 4.11.3 Sync 대상

| 엔티티 | 방향 | 설명 |
|---|---|---|
| 부서 | HRIS → Portal | 조직도 동기화 |
| 임직원 | HRIS → Portal | 입사/퇴사/부서이동 자동 반영 |
| 고용 형태 | HRIS → Portal | 정규/계약/파견 구분 |
| 근태 (shift) | HRIS → Portal | 교대조 기반 정책 (§5.1) |
| 급여 | (양방향 없음) | 플랫폼이 접근하지 않음 — 민감 정보 |

#### 4.11.4 GraphQL operation (P2 이후)

- `hrisIntegrationsByCorporate(corporateId)`
- `hrisIntegrationConnect(provider, credentials)`
- `hrisIntegrationDisconnect(integrationId)`
- `hrisIntegrationSyncNow(integrationId, dryRun)`
- `hrisIntegrationSyncHistory(integrationId, cursor)`
- `hrisIntegrationConflicts(integrationId, cursor)` — 해결 대기 중인 충돌

#### 4.11.5 P0 범위

- P0: "연동 준비 중" 스켈레톤 페이지만. 지원 파트너 리스트 + "곧 출시" 배지.
- P2: Base.vn 연동 실제 구현 (read-only, 부서/임직원)
- P3: 양방향 싱크, 충돌 해결 UI, SAP/Workday

- **P0**: ❌ (P2)

### 4.12 `/settings/company` — 회사 정보

- **화면 목적**: Corporate 프로필 (법적 정보 / 연락처 / e-Invoice 발행 설정). 한번 설정하면 인보이스에 그대로 박제되므로 정확성 중요.

#### 4.12.1 필드 (Viettel/MISA/WeTax 3 provider 공통 요구사항 반영)

**탭 1 — 법적 정보 (Buyer 정보 — 인보이스 발행 시 박제)**
- 회사명 (`companyName`, required, 2~200자) — `*Tên công ty`
- 영문 회사명 (P1, 국제 invoice 용)
- 세금 코드 (`taxCode`, required, 베트남 MST 10~13자리) — `*Mã số thuế`
- 사업자 등록 종류 (법인 / 개인사업자)
- 설립일
- 대표자명 (`representativeName`)

**탭 1b — 주소 (분리 저장)**
> 세 provider 모두 베트남 행정 단위 기준 분리 저장 요구. HJ-POS-TEST 이미지 1 의 `Tên Thành Phố / Tên Khu Vực (Quận, phường, xã) / Địa Chỉ Chi Tiết` 그대로 반영.

- 시/성 (`addressCity`, required) — `Tên Thành Phố` (예: `Hà Nội`, `TP. Hồ Chí Minh`, `Đà Nẵng`)
- 구/군 (`addressDistrict`, P1) — `Tên Quận` (예: `Quận 1`, `Ba Đình`)
- 동/읍/면 (`addressWard`, P1) — `Tên Phường/Xã`
- 상세 주소 (`addressDetail`, required, 300자) — `*Địa Chỉ Chi Tiết` (예: `123 Lê Lợi`)
- 전체 주소 (`addressFull`, 서버 자동 조합, 읽기 전용 표시) — `{detail}, {ward}, {district}, {city}` 형태로 합쳐짐

**탭 2 — 연락처**
- HR 담당자 이름 (`contactName`)
- HR 담당자 이메일 (`contactEmail`, required) — `*Email`, 월간 인보이스 이메일 수신처
- HR 담당자 전화 (`contactPhone`, +84 형식, required) — `*Số Điện Thoại`
- Fax (`contactFax`, optional) — `Số Fax`
- 재무 담당자 (별도)
- 대표 청구 이메일 (billing CC)

**탭 2b — 은행 정보 (선택, 인보이스 payer 정보 활용)**
- 은행 계좌번호 (`bankAccountNumber`) — `Số Tài Khoản Ngân Hàng`
- 은행 이름 (`bankName`) — `Tên Ngân Hàng` (예: `BIDV`, `Vietcombank`)

**탭 3 — e-Invoice 설정**
- 통합 인보이스 그룹화 전략 (`einvoiceConsolidationStrategy`): 5종 드롭다운 + 각 전략의 미리보기 예시
- 발행 일자 설정: "매월 N일" (기본 1일)
- 발행 후 이메일 자동 발송 대상 (contactEmail + 추가 CC)
- 디지털 서명 설정 (P2, provider 가 처리하므로 여기서는 박제 정보만)

**탭 4 — 브랜딩 (P2)**
- 로고 업로드 (인보이스 PDF 커스터마이징용 — provider 지원 여부에 따라)
- Primary color (portal 테마)

> **중요**: 탭 1 ~ 2b 의 모든 필드는 **3 provider (WeTax / Viettel / MISA) 에 공통으로 박제** 되는 buyer 정보이다. 누락 필드가 있으면 해당 provider API 가 거부할 수 있다. 특히 `addressDetail` / `addressCity` / `contactEmail` / `contactPhone` 4 개는 3 provider 모두에서 required.

#### 4.12.2 검증 규칙

- `taxCode`: 10 또는 13자리 숫자 (베트남 MST)
- `companyName`: 특수문자 제한 (법적 명칭에 허용되는 것만)
- `addressDetail`: 공백 제외 5자 이상
- `addressCity`: 베트남 63개 행정단위 (Province/City) 중 선택 — drop-down 또는 자동완성 (P1)
- `contactEmail`: RFC 5322 + 도메인 검증
- `contactPhone`: E.164 형식 + 베트남 번호 prefix (+84 또는 0)
- `bankAccountNumber`: 베트남 은행 계좌 번호 포맷 (provider 별 상이, 유연 검증)
- 수정 시 이력 저장 (`AuditLog`): 세금 코드 / 주소 / 은행 계좌 변경은 감사 대상

#### 4.12.3 GraphQL operation

- `mealCorporateProfile` — 현재 세션의 corporate
- `mealCorporateUpdate(input)` — 전체 필드 업데이트
- `mealCorporateChangeHistory(corporateId, cursor)` — 변경 이력 (P1)

#### 4.12.4 엣지 케이스

- **세금 코드 변경**: 베트남 GDT 측 법인 등록 변경을 의미 → 변경 후 새로 발행되는 인보이스부터 반영. 과거 인보이스는 snapshot 유지. 관리자에게 "변경 전 발행된 인보이스는 영향 없음" 안내.
- **주소 변경**: 다음 달 인보이스부터 반영.
- **그룹화 전략 변경**: 다음 달부터 적용. 이번 달 DRAFT 인보이스에는 영향 없음.
- **승인자 없음**: `OWNER` 가 퇴사하고 해제되면 프로필 수정 불가 → SuperAdmin 에게 대행 요청.

- **P0**: ✅

### 4.13 `/settings/admins` — 관리자 계정 / 역할 관리 (서버 RBAC 기반)

- **화면 목적**: 같은 corporate 의 다른 admin 초대 / role 부여 / 개별 permission 추가·제거 / 계정 일시정지 / 로그인 이력 조회.
- **전제**: 이 화면은 `corporate.admin.manage` permission 이 필요하다. 기본 template 에서는 `CORPORATE_OWNER` 만 이 permission 을 가진다. OWNER 는 이 권한을 다른 admin 에게도 부여할 수 있으나, "권한 격상 방지" 때문에 자신이 가진 permission 범위 내에서만 부여 가능.

#### 4.13.1 최초 OWNER 발급 (SuperAdmin 책임)

- 새 corporate 가 온보딩될 때 **SuperAdmin/Portal** 이 아래 작업을 원자적으로 수행:
  1. `MealCorporate` row 생성
  2. 초기 `CorporateAdminUser` 1명 생성 (email, loginId, 임시 비밀번호)
  3. `UserRoleAssignment` 1행 생성: `(userType='CORPORATE_ADMIN', userId, roleId=CORPORATE_OWNER, scopeCorporateId=<corp.id>, grantedBy=<superAdminId>, status='ACTIVE')`
  4. 초대 이메일 발송 (비밀번호 설정 링크, 24시간 만료)
- 이 플로우는 **CorporatePortal 이 수행하지 않는다**. CorporatePortal 은 "이미 존재하는 OWNER 가 추가 관리자를 초대" 하는 역할만.
- SuperAdmin 이 긴급 OWNER 재발급 / 복구도 SuperAdmin/Portal 에서 처리.

#### 4.13.2 화면 구성

- **리스트 테이블**: 이름 / 이메일 / 부여된 role / 추가 permission / 상태 (`ACTIVE / PENDING_INVITE / SUSPENDED / EXPIRED`) / 마지막 로그인 / 가입일 / 액션
- **상단**: `+ 관리자 초대` 버튼 (permission `corporate.admin.manage` 없으면 숨김)
- **우측 패널**: 선택된 admin 의 상세 + effective permission 집합 (서버가 계산한 실제 가용 권한)

#### 4.13.3 초대 플로우 (서버 RBAC 기반)

1. `+ 관리자 초대` → 모달
2. 이메일 + role template 선택 (`CORPORATE_OWNER / CORPORATE_HR_ADMIN / CORPORATE_FINANCE_ADMIN / CORPORATE_VIEWER`) + (P1) 추가 permission 선택 또는 제외
3. 이메일 중복 체크
4. 권한 격상 검증 (클라이언트 + 서버):
   - 초대자가 template 의 permission 집합을 전부 보유하는가?
   - 부족한 permission 이 있으면 모달에서 해당 항목 disabled + "당신은 이 권한이 없어 부여할 수 없습니다" 안내
5. `초대 발송` → `mealCorporateAdminInvite` → 서버가 `CorporateAdminUser (status=PENDING_INVITE)` + `UserRoleAssignment` 원자적 생성 + 초대 이메일 발송
6. 초대받은 사람 → 이메일 링크 → 비밀번호 설정 → `status=ACTIVE` 로 전환
7. 초대 만료: 7일, 재발송 가능

#### 4.13.4 Role / Permission Matrix (서버 seed 기준)

아래 matrix 는 §8.3.3 의 **Role template 4개** 와 §8.3.2 의 **Permission 카탈로그** 를 조합해 자동 생성된다. 포털에는 하드코딩하지 않는다 (`mealCorporateRolePermissionMatrix` query 로 서버에서 받아온다).

| Permission | CORPORATE_OWNER | CORPORATE_HR_ADMIN | CORPORATE_FINANCE_ADMIN | CORPORATE_VIEWER |
|---|:---:|:---:|:---:|:---:|
| `corporate.profile.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.profile.write` | ✅ | ❌ | ❌ | ❌ |
| `corporate.department.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.department.write` | ✅ | ✅ | ❌ | ❌ |
| `corporate.employee.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.employee.write` | ✅ | ✅ | ❌ | ❌ |
| `corporate.wallet.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.wallet.fund` (포인트 충전 + 예치금 납입 기록 + funding 요청) | ✅ | ❌ | ✅ | ❌ |
| `corporate.wallet.topup` | ✅ | ❌ | ✅ | ❌ |
| `corporate.funding.read.limit` (한도 금액 열람) | ✅ | ❌ | ✅ | ❌ |
| ~~`platform.corporate.fundingpolicy.write`~~ (funding model 부여) | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| ~~`platform.corporate.credit.assess.write`~~ (신용도 평가) | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| ~~`platform.corporate.deposit.approve`~~ (예치금 승인) | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| `corporate.policy.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.policy.write` | ✅ | ✅ | ❌ | ❌ |
| `corporate.transaction.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.settlement.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.merchant.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.merchant.allow.write` | ✅ | ✅ | ✅ | ❌ |
| `einvoice.read` | ✅ | ✅ | ✅ | ✅ |
| **`einvoice.request.write`** (DRAFT → REQUESTED) | ✅ | ❌ | ✅ | ❌ |
| **`einvoice.dispute.write`** (DRAFT → DISPUTED) | ✅ | ❌ | ✅ | ❌ |
| `corporate.report.read` | ✅ | ✅ | ✅ | ✅ |
| `corporate.audit.read` | ✅ | ❌ | ❌ | ❌ |
| `corporate.admin.manage` | ✅ | ❌ | ❌ | ❌ |
| ~~`corporate.merchant.enroll`~~ | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| ~~`corporate.merchant.commission.write`~~ | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| ~~`corporate.merchant.account.write`~~ | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |
| ~~`einvoice.publish.write`~~ (실제 WeTax 호출) | **절대 ❌** | **절대 ❌** | **절대 ❌** | **절대 ❌** |

> **인보이스 검토 권한 분리 설계 의도**:
> - `einvoice.request.write` / `einvoice.dispute.write` 는 **재무 책임이 있는 role** (OWNER + FINANCE_ADMIN) 에만 부여. HR_ADMIN 은 인사 업무 담당이므로 인보이스 재무 결정 권한 없음.
> - `einvoice.read` 는 VIEWER 를 포함한 모든 role 에 열려 있어 누구나 확인은 가능.
> - `einvoice.publish.write` (실제 발행 = WeTax HTTP 호출) 는 베트남 세무 법규상 Seller(플랫폼 사업자) 만 가능 — CorporatePortal 의 어떤 role 에도 절대 부여하지 않는다.

> 마지막 4개 permission 은 **SuperAdmin role 전용**. 어떤 CorporatePortal role 도 부여되지 않는다. (머천트 enroll / 수수료 / 정산계좌 / 인보이스 발행은 플랫폼 사업자 권한)

#### 4.13.5 커스텀 role / 개별 permission 추가 (P1)

- OWNER 는 template 에 추가 permission 을 **grant** 하거나 **revoke** 할 수 있다 (단 본인이 가진 범위 내).
- 서버 `UserRoleAssignment` 는 여러 role 을 한 user 에게 부여 가능 (`status='ACTIVE'` 인 중복 role 금지, 단 scope 다르면 허용).
- 커스텀 role 생성은 P2 (`mealCorporateCustomRoleCreate`). P0/P1 은 template 4개만.

#### 4.13.6 OWNER 보호 규칙

- 한 corporate 는 항상 최소 1명의 `CORPORATE_OWNER` role 을 가진 ACTIVE admin 이 있어야 함
- 마지막 OWNER 해제 / 퇴사 / 일시정지 시도 → 서버가 `CANNOT_DEMOTE_LAST_OWNER` 에러 반환 → 포털에 "다른 OWNER 를 먼저 지정하세요" 안내
- SuperAdmin 만 비상 상황에서 우회 가능 (SuperAdmin/Portal 에서)

#### 4.13.7 GraphQL operation

- `mealCorporateAdminsByCorporate(corporateId, filter)` — 리스트
- `mealCorporateAdminDetail(userId)` — 상세 (effective permission 포함)
- `mealCorporateAdminInvite(input)` — `{email, roleCodes: [], additionalPermissions?: [], scopeDepartmentId?}`
  - 서버: `CorporateAdminUser` + `UserRoleAssignment` 원자적 생성. 권한 격상 검증.
- `mealCorporateAdminGrantRole(userId, roleCode)` — 기존 admin 에 role 추가
- `mealCorporateAdminRevokeRole(assignmentId)` — role 회수 (OWNER 마지막 보호)
- `mealCorporateAdminGrantPermission(userId, permissionKey)` — P1, 개별 permission grant
- `mealCorporateAdminRevokePermission(userId, permissionKey)` — P1
- `mealCorporateAdminSuspend(userId, reason)` — status → SUSPENDED (OWNER 보호)
- `mealCorporateAdminResume(userId)`
- `mealCorporateAdminRevokeInvite(inviteId)` — 만료 전 초대 취소
- `mealCorporateAdminResendInvite(inviteId)`
- `mealCorporateAdminLoginHistory(userId, cursor)` — P1
- `mealCorporateAdminPasswordResetRequest(userId)` — P1, 다른 admin 의 비밀번호 재설정 이메일 트리거
- `mealCorporateRolePermissionMatrix` — role × permission 전체 매트릭스 (서버 원본)
- `mealCorporateAdminMe` — 현재 세션의 effective permission 집합

#### 4.13.8 엣지 케이스

- **초대받은 사람이 이미 다른 corporate 의 admin**: 새 `CorporateAdminUser` 를 생성하되 email 은 같을 수 있음 (서로 다른 loginId). 혹은 같은 사용자에게 여러 `UserRoleAssignment` (서로 다른 `scopeCorporateId`) 로 확장 (P2).
- **초대 만료 후 재발송**: 만료 전 기록 삭제 대신 status `EXPIRED` 로 두고 새 invite 생성.
- **권한 격상 시도 감지**: OWNER 가 아닌 admin 이 자신보다 높은 permission 을 부여하려 하면 서버가 `PERMISSION_ESCALATION_DENIED` 반환.

#### 4.13.9 P0 범위

- P0: 리스트 + 초대 (template 4개) + role 변경 + suspend/resume + OWNER 보호
- P1: 개별 permission grant/revoke + 로그인 이력 + 비밀번호 재설정 요청
- P2: 커스텀 role 생성, 멀티-corporate 사용자 연결

- **P0**: ✅

### 4.14 `/settings/session` — 내 계정 / 보안

- **화면 목적**: 로그인한 본인의 프로필, 비밀번호 변경, 2FA, 로그인 이력, 세션 관리.

#### 4.14.1 구성

**섹션 1 — 내 프로필**
- 이름, 이메일 (읽기), 전화, 언어 설정 (ko/vi/en), 타임존 (기본 Asia/Ho_Chi_Minh)
- 알림 설정: 이메일 / 브라우저 푸시 (P1)

**섹션 2 — 비밀번호**
- 현재 비밀번호 / 새 비밀번호 / 확인
- 비밀번호 정책: 최소 10자, 대소문자+숫자+특수 포함, 지난 5개 사용 금지
- 변경 시 다른 세션 로그아웃 옵션

**섹션 3 — 2FA (P1)**
- TOTP (Google Authenticator / Authy)
- QR 코드 스캔 + 백업 코드 10개 다운로드
- 비활성화 시 2FA 코드 + 비밀번호 재확인 필요

**섹션 4 — 활성 세션**
- 현재 로그인된 디바이스 목록 (브라우저 / OS / IP / 마지막 활동)
- 개별 세션 강제 로그아웃
- 모든 세션 로그아웃

**섹션 5 — 로그인 이력**
- 최근 30건: 시각 / IP / 브라우저 / 성공 여부
- 실패한 로그인 시도 강조 표시

#### 4.14.2 GraphQL operation

- `mealCorporateAdminMe` — 현재 로그인 정보
- `mealCorporateAdminUpdateProfile(input)`
- `mealCorporateAdminChangePassword(current, new)`
- `mealCorporateAdminEnable2FA(secret, verificationCode)` — P1
- `mealCorporateAdminDisable2FA(password, totpCode)` — P1
- `mealCorporateAdminActiveSessions` — P1
- `mealCorporateAdminLogoutSession(sessionId)` — P1
- `mealCorporateAdminLoginHistory(cursor)` — P1

- **P0**: ✅ (프로필 + 비밀번호 변경만)

### 4.15 `(auth)/login`, `(auth)/forgot-password`

- **목적**: 이메일 + 비밀번호 로그인. JWT + refresh token. 비밀번호 재설정 이메일 발송.
- **사용 operation**: `operations/auth.ts` 의 기존 operation 재사용
- **P0**: ✅

---

## 5. SharedContracts/ApiSdk 에 추가해야 하는 operations

4절의 "**신규**" 로 표시된 operation 은 모두 `SharedContracts/ApiSdk/src/operations/` 에 **새 파일** 로 추가해야 한다. CorporatePortal 의 모든 operation 은 SharedContracts 를 경유하며, 프로젝트 내부에 operation document 를 직접 작성하지 않는다.

### 5.1 새로 만들어야 하는 operation 파일

| 파일 | 담기는 operation | CentralApi 대응 leaf |
|---|---|---|
| `operations/corporate.ts` | `mealCorporateProfile` / `mealCorporateUpdate` / `mealCorporateDashboardSummary` | `platform/corporate/profile` |
| `operations/corporate-department.ts` | `mealDepartmentsByCorporate` / `mealDepartmentCreate` / `mealDepartmentUpdate` / `mealDepartmentDeactivate` | `platform/corporate/profile/department` (신규 sub-leaf) |
| `operations/corporate-employee.ts` | `mealEmployeesByCorporate` / `mealEmployeeDetail` / `mealEmployeeCreate` / `mealEmployeeUpdate` / `mealEmployeeAssignBadge` / `mealEmployeeTerminate` | `platform/corporate/profile/employee` (신규 sub-leaf) |
| `operations/corporate-policy.ts` | `mealPoliciesByCorporate` / `mealPolicyCreate` / `mealPolicyUpdate` / `mealPolicyActivate` / `mealPolicyDeactivate` | `platform/corporate/policy` |
| `operations/corporate-budget.ts` | `mealFundingAccountByCorporate` (**fundingModel 상태 + 신용도 평가 상태 + 한도/outstanding 포함**) / `mealFundingPolicyHistory` (P1) / `mealBudgetSummary` / `mealBudgetByCategoryAndDepartment` / `mealBudgetForecast` / `mealFundingAccountDepositRecord` (PREPAID 납입 기록) / `mealCorporateRequestFundingPolicyUpgrade` (SA 에 요청만) / `mealCompanyAllowanceLoad` / `mealCompanyAllowanceLoadSchedule` / `mealCompanyAllowanceLoadBatches` / `mealPersonalTopUpActivity` / `mealExpiringAllowanceDetail` | `platform/corporate/wallet` + funding entry |
| `operations/corporate-ledger.ts` | `mealWalletFundingEntries` / `mealTransactionsByWallet` / `mealCorporateLedger` (P1) | `platform/corporate/wallet` / `transaction` |
| `operations/corporate-merchant.ts` | `mealEnrolledMerchantsByCorporate` / `mealMerchantDetailForCorporate` / `mealMerchantMonthlyStatsForCorporate` / `mealCorporateMerchantAllowToggle` / `mealCorporateMerchantBulkToggle` / `mealCorporateMerchantCategoryBulkToggle` / `mealCorporateMerchantGeocode` (P1) / `mealCorporateMerchantDeclineReasons` (P1) | `platform/corporate/merchant` (read-only view + allowlist toggle) |
| `operations/corporate-einvoice.ts` | `mealInvoicesByCorporate` / `mealInvoiceDetail` / `mealInvoiceDownloadPdf` / `mealInvoiceDownloadXml` / `mealInvoiceCurrent` / `mealConsolidatedInvoiceRequestIssuance` / `mealConsolidatedInvoiceDispute` / `mealInvoiceSubmissionLogs` (P1) / `mealInvoiceAuditTrail` (P1) / `mealInvoiceLineTransactionDrilldown` (P1) | `platform/corporate/einvoice` |
| `operations/corporate-admin.ts` | `mealCorporateAdminsByCorporate` / `mealCorporateAdminDetail` / `mealCorporateAdminInvite` / `mealCorporateAdminGrantRole` / `mealCorporateAdminRevokeRole` / `mealCorporateAdminSuspend` / `mealCorporateAdminResume` / `mealCorporateAdminRevokeInvite` / `mealCorporateAdminResendInvite` / `mealCorporateRolePermissionMatrix` / `mealCorporateAdminMe` | `platform/corporate/profile` (admin sub) + `core/rbac` |

### 5.2 작성 규칙 (기존 `operations/wallet.ts` 패턴 준수)

- 각 operation 은 `GraphQLOperation<Data, Variables>` 형식으로 export.
- `operationName` 은 PascalCase.
- `document` 는 template literal. 응답 shape 는 반드시 `success { code message requestId data { ... } } error { code message requestId details }` 를 포함 (response shape 규칙).
- **CentralApi 에 resolver 가 먼저 존재해야 한다.** 본 작업계획서의 Phase 0 에서 CentralApi 의 누락 resolver 를 먼저 추가한 뒤, SharedContracts operation 을 작성한다.
- **Mutation 응답 shape 규칙 (중요 — §16.2 cache update 전략 전제)**: 모든 mutation 은 영향받은 entity 의 **완전한 shape** 을 반환해야 한다. 이는 포털이 `refetchQueries` 없이 cache 갱신만으로 UI 를 즉시 업데이트할 수 있게 하는 전제 조건이다.
  - 단건 update → 변경된 entity 1개 full shape
  - 생성 → 새 entity 1개 full shape (서버 생성 필드 `id`, `createdAt` 등 포함)
  - 삭제 → 삭제된 entity 의 `id` + `deletedAt` (soft delete) 또는 `{ deletedId: string }` (hard delete)
  - 연쇄 변경 → 모든 영향 entity 를 한 response 안에 union 또는 nested 로 반환 (예: `mealEmployeeTerminate` → `{ employee: MealEmployee, wallet: MealTicketWallet, expiredFundingEntries: [...] }`)
  - Bulk operation → 영향받은 entity 배열 전체를 반환 (단 100건 초과 시 성능 고려 — 영향받은 id 배열만 반환 후 클라이언트가 selective refetch 하는 패턴은 허용)
- **서버 mutation 설계는 "refetch 제로" 를 목표로** 한다. 만약 mutation 결과로 UI 가 반영해야 할 상태가 반환 값만으로 부족하다면, 그것은 mutation 설계 자체를 재검토해야 한다는 신호다.

### 5.3 DTO 보강

`mealticket/dto.ts` 에 아래 DTO 가 누락되어 있다 — 추가 필요.

| DTO | 필드 출처 |
|---|---|
| `MealCorporateDepartment` | `prisma/schema/70-mealticket.prisma` `MealCorporateDepartment` |
| `MealEmployee` (현재 `MealTicketWallet` 내부에서만 참조됨) | 같음 |
| `MealTicketFundingAccount` | 같음 |
| `MealTicketConsolidatedEInvoiceLine` | 같음 |
| `MealTicketConsolidatedEInvoice` — 신규 필드 (refId / cqtCode / formNo / serialNo / invoiceNo / lookupCode / transType / currencyCode / exchangeRate / paymentMethod / providerType / providerRequestJson / providerResponseJson / consolidationStrategy / sellerSnapshot / buyerSnapshot / sourceTransactionCount) | 이미 prisma 확장 완료 |
| `MealTicketConsolidatedEInvoice` — **하이브리드 워크플로우 필드** (reviewDueAt / requestedByAdminId / requestedAt / autoPromoted / disputedByAdminId / disputedAt / disputeReason / disputeResolvedAt / disputeResolvedByAdminId) | 사양서 §4.3.2.a 상태 머신 |
| `MealTicketCorporate` — `addressFull`, `einvoiceConsolidationStrategy`, `einvoiceReviewDays` (3~14일 조정 가능, 기본 7일) 필드 | 같음 |
| `CorporateAdminUser` | 같음 |
| `MealCorporateMerchantAllowlist` | 신규 모델 — §10.2 확정본 (`corporateId, branchId, enrollmentId, isAllowed, reason, updatedByAdminId, updatedAt`) |
| `CorporateEffectivePermissions` | `mealCorporateAdminMe` 응답 — `{userId, roles: RoleCode[], permissions: PermissionKey[], scopeCorporateId}` |
| `CorporateRolePermissionMatrix` | `mealCorporateRolePermissionMatrix` 응답 — role × permission 전체 매트릭스 |
| `CorporateLedgerEntry` (union) | funding entry + transaction 통합 원장 (§4.7) |
| `CorporateDashboardSummary` | 대시보드 W1~W9 집계 response shape |
| `CorporateBudgetForecast` | 섹션 5 예측 (현재 소진 속도 / 예상 총액 / 전월 대비 %) |

`mealticket/enums.ts` 에 아래 enum 추가:

| Enum | 값 |
|---|---|
| `MealTicketEInvoiceStatus` | `DRAFT` / `DISPUTED` / `REQUESTED` / `SUBMITTING` / `ACCEPTED` / `REJECTED` / `VOIDED` (신규 DISPUTED / REQUESTED 포함, 기존 BUILT 는 제거) |
| `MealTicketEInvoiceConsolidationStrategy` | `BY_MERCHANT` / `BY_DAY` / `BY_DEPARTMENT` / `BY_CATEGORY` / `SINGLE_LINE` |

### 5.4 3 Provider 필드 매트릭스 (HJ-POS-TEST 실제 코드 기반 전수 조사)

> 본 섹션은 HJ-POS-TEST 의 `WeTaxMgr.h` / `Base.h` 의 `tViettel_Seller` / `tViettel_Buyer` / `MisaTaxMgr.h` / `tMISA_Config` / `CMisaOriginalInvoiceData` 를 1:1 분석하여 **각 provider 가 실제로 요구하는 모든 필드** 를 박제한 전수 매트릭스다. 이 표에 있는 모든 필드가 DB 스키마와 Portal UI 에 반영되어야 한다.

#### 5.4.1 Seller 필드 매트릭스 (발급 주체 = 플랫폼 사업자)

| 필드 (공통명) | WeTax `t_wetax_seller` | Viettel `tViettel_Seller` | MISA `sellerXxx` | Platform 필드 매핑 |
|---|---|---|---|---|
| 세금코드 | `tax_code` ✅ req | `sellerTaxCode` ✅ req | `sellerTaxCode` | `PlatformLegalEntity.taxCode` ✅ |
| 법인명 | `store_name` ✅ req | `sellerLegalName` ✅ req | `sellerLegalName` | `PlatformLegalEntity.legalName` ✅ |
| 매장 코드 / 고객 코드 | `store_code` ✅ req | `sellerCustomerCode` | — | **`PlatformLegalEntity.storeCode`** (SP-A24b 신규) |
| 매장명 | `store_name` | `sellerCustomerName` | — | `PlatformLegalEntity.displayName` ✅ |
| 시 / 성 | (embedded in buyer_address) | `sellerCityName` | (embedded) | `PlatformLegalEntity.addressCity` ✅ (SP-A24) |
| 구 / 군 | (embedded) | `sellerDistrictName` | (embedded) | `PlatformLegalEntity.addressDistrict` ✅ |
| 동 / 상세 주소 | (embedded) | `sellerAddressLine` ✅ req | `sellerAddress` | `PlatformLegalEntity.addressDetail` ✅ |
| 은행 계좌 | — | `sellerBankAccount` | `sellerBankAccount` | **`PlatformLegalEntity.bankAccountNumber`** ✅ (SP-A24) |
| 은행 이름 | — | `sellerBankName` | `sellerBankName` | **`PlatformLegalEntity.bankName`** ✅ |
| 이메일 | (WeTaxCompany 에서) | `sellerEmail` | `sellerEmail` | `PlatformLegalEntity.contactEmail` ✅ |
| 전화번호 | — | `sellerPhoneNumber` | `sellerPhoneNumber` | **`PlatformLegalEntity.contactPhone`** (SP-A24b 신규) |
| Fax | — | `sellerFaxNumber` | `sellerFax` | **`PlatformLegalEntity.contactFax`** ✅ |
| 국가 코드 | — | `sellerCountryCode` | — | **`PlatformLegalEntity.countryCode`** (SP-A24b, default `VN`) |
| 웹사이트 | — | — | `sellerWebsite` | **`PlatformLegalEntity.website`** (SP-A24b, nullable) |
| 주문 일자 | `order_date` ✅ req | (embedded in invoice) | (`invDate`) | runtime 생성, 저장 불필요 |

#### 5.4.2 Provider 고유 credentials / 설정 필드 매트릭스

**저장 위치**: `EInvoiceProviderConfig.providerSpecificConfig` (Json) + credentials 는 vault

| 필드 | WeTax | Viettel | MISA | Json key 예시 |
|---|:---:|:---:|:---:|---|
| username | ✅ | ✅ (`{taxCode}-{seq}`) | ✅ | `providerSpecificConfig.credentialsRef` → vault |
| password | ✅ | ✅ | ✅ | (vault) |
| **invoiceType** | — | ✅ req (예: `"1"`) | — | `providerSpecificConfig.invoiceType` |
| **templateCode** | — | ✅ req (예: `"1/8899"`) | — (`orgInvTemplateNo`) | `providerSpecificConfig.templateCode` |
| **invoiceSeries** | — (대신 `serialNo`) | ✅ req (예: `"K23MMJ"`) | ✅ req (`invSeries`, 예: `"C22TAX"`) | `providerSpecificConfig.invoiceSeries` |
| **serialPrefix** (C/K) | ✅ | — | — | `providerSpecificConfig.serialPrefix` |
| **formNo** | ✅ (예: `"1"`) | — | — | `providerSpecificConfig.formNo` |
| **serialType** | ✅ (예: `"TKT"`) | — | — | `providerSpecificConfig.serialType` |
| **currencyCode** | ✅ (`VND`) | ✅ req | ✅ | `providerSpecificConfig.currencyCode` |
| **exchangeRate** | ✅ (1) | ✅ (int) | ✅ | `providerSpecificConfig.exchangeRate` |
| **paymentMethod** / **paymentStatus** | ✅ (`TM/CK`) | ✅ (bool `paymentStatus`) | ✅ (`paymentMethodName`) | `providerSpecificConfig.paymentMethod` |
| **adjustmentType** | — | ✅ | — | `providerSpecificConfig.adjustmentType` |
| **adjustmentInvoiceType** | — | ✅ req (예: `"1"`) | — | `providerSpecificConfig.adjustmentInvoiceType` |
| **cusGetInvoiceRight** | — | ✅ req (bool) | — | `providerSpecificConfig.cusGetInvoiceRight` |
| **invoice_cluster** (login 응답) | — | ✅ (multi-cluster 라우팅) | — | `providerSpecificConfig.invoiceCluster` (응답 저장) |
| **reservationCode** | — | ✅ req | — | `providerSpecificConfig.reservationCode` |
| **transactionUuid** | — | ✅ | — | runtime 생성 |
| **validation** | — | ✅ (int) | — | `providerSpecificConfig.validation` |
| **appId** | — | — | ✅ | `providerSpecificConfig.appId` |
| **bUseDigitalSign** | — | — | ✅ (bool) | `providerSpecificConfig.useDigitalSign` |
| **storeCode** | ✅ | — | — | `providerSpecificConfig.storeCode` |

#### 5.4.3 Buyer 필드 매트릭스 (수신자 = Corporate)

> **주의**: 식권 플랫폼의 buyer 는 **항상 corporate** 이므로 개인 식별 필드 (`buyerIdType / buyerIdNo / buyerBirthDay`) 는 사용하지 않는다. 아래 표에서 "식권 플랫폼 사용 여부" 열에 명시.

| 필드 | WeTax `t_wetax_invoices` | Viettel `tViettel_Buyer` | MISA `CMisaOriginalInvoiceData` | Platform 필드 | 식권 사용 |
|---|---|---|---|---|:---:|
| 세금코드 | `buyer_tax_code` | `buyerTaxCode` | `buyerTaxCode` | `MealCorporate.taxCode` ✅ | ✅ req |
| 회사명 | `buyer_comp_name` | `buyerLegalName` | `buyerLegalName` | `MealCorporate.companyName` ✅ | ✅ req |
| 고객 코드 | — | `buyerCode` | `buyerCode` | `MealCorporate.tenantCode` ✅ | ✅ |
| 수령자 이름 (개인) | `buyer_name` | `buyerName` ✅ req | `buyerFullName` | `MealCorporate.contactName` ✅ | ⚠️ (대표 수령자) |
| 시 / 성 | (embedded) | `buyerCityName` | (embedded) | `MealCorporate.addressCity` ✅ (SP-A22) | ✅ |
| 구 / 군 | (embedded) | `buyerDistrictName` | (embedded) | `MealCorporate.addressDistrict` ✅ | ✅ |
| 상세 주소 | `buyer_address` | `buyerAddressLine` ✅ req | `buyerAddress` | `MealCorporate.addressDetail` ✅ | ✅ req |
| 은행 계좌 | — | `buyerBankAccount` | `buyerBankAccount` | **`MealCorporate.bankAccountNumber`** ✅ (SP-A23) | ✅ |
| 은행 이름 | — | `buyerBankName` | `buyerBankName` | **`MealCorporate.bankName`** ✅ | ✅ |
| 이메일 | `buyer_email` | `buyerEmail` | `buyerEmail` | `MealCorporate.contactEmail` ✅ | ✅ req |
| Email CC | `buyer_email_cc` | — | — | **`MealCorporate.contactEmailCc`** (SP-A22b 신규) | ✅ |
| 전화번호 | `buyer_tel` | `buyerPhoneNumber` | `buyerPhoneNumber` | `MealCorporate.contactPhone` ✅ | ✅ req |
| Fax | — | `buyerFaxNumber` | — | `MealCorporate.contactFax` ✅ | ✅ |
| 국가 코드 | — | `buyerCountryCode` | — | **`MealCorporate.countryCode`** (SP-A22b, default `VN`) | ✅ |
| 예산 부서 코드 | `buyer_budget_unit_code` | — | — | **`MealCorporate.budgetUnitCode`** (SP-A22b, nullable) | ⚠️ (공공기관용) |
| 연락 담당자 | — | — | `contactName` | `MealCorporate.contactName` | ✅ |
| **개인 주민증** (`buyerIdNo / buyerIdType`) | `buyer_cccd` | `buyerIdNo` / `buyerIdType` | — | **사용 안 함** | ❌ (개인 buyer 케이스 없음) |
| **여권 번호** | `buyer_passport_no` | — | — | **사용 안 함** | ❌ |
| **생년월일** | — | `buyerBirthDay` | — | **사용 안 함** | ❌ |
| **buyerNotGetInvoice** | ✅ | ✅ | — | **항상 0 hardcoded** | ❌ |

#### 5.4.4 Invoice Line 필드 매트릭스

| 필드 | WeTax `t_wetax_invoice_details` | Viettel item (Json) | MISA `CMisaOriginalInvoiceDetail` | Platform `MealConsolidatedEInvoiceLine` |
|---|---|---|---|---|
| seq / line number | `seq` | (itemInfo 배열 index) | `lineNumber` | `seq` ✅ |
| itemCode | `item_code` | `itemCode` | `itemCode` | `itemCode` ✅ |
| itemName | `item_name` ✅ req | `itemName` | `itemName` | `itemName` ✅ req |
| unit (uom) | `uom` ✅ req | `unitName` | `unitName` | `uom` ✅ req |
| quantity | `quantity` ✅ req | `quantity` | `quantity` | `quantity` ✅ req |
| unitPrice | `unit_price` ✅ req | `unitPrice` | `unitPrice` | `unitPriceVnd` ✅ req |
| amount (before VAT) | `amount` ✅ req | `itemTotalAmountWithoutTax` | `amountWithoutVAT` | `amountVnd` ✅ req |
| vat rate | `vat_rate` ✅ req | `taxPercentage` | `VATRateName` | `vatRate` ✅ req |
| vat amount | `vat_amount` ✅ req | `taxAmount` | `VATAmount` | `vatAmountVnd` ✅ req |
| pay amount (total) | `pay_amount` ✅ req | `itemTotalAmountWithTax` | `amountAfterTax` | `payAmountVnd` ✅ req |
| feature | `feature` ✅ req | — | `itemType` (1~4) | `feature` ✅ |
| discount rate | `dc_rate` | `inputMenuDC` | `discountRate` | `dcRate` ✅ |
| discount amount | `dc_amount` | `itemDiscount` | `discountAmount` | `dcAmountVnd` ✅ |
| vatType | — | `vatType` | — | (ruleJson) |
| itemType (MISA 전용) | — | — | `itemType` (1=HHDV / 2=promo / 3=discount / 4=note) | (P1, `feature` 확장) |
| inventoryItemNote | — | — | `inventoryItemNote` | ❌ 사용 안 함 |
| lotNo / expiryDate | — | — | `lotNo / expiryDate` | ❌ 사용 안 함 (물류 도메인용) |

#### 5.4.5 Invoice Header 필드 매트릭스

| 필드 | WeTax | Viettel | MISA | Platform `MealConsolidatedEInvoice` |
|---|---|---|---|---|
| refId / 멱등성 키 | `ref_id` | `reservationCode` / `transactionUuid` | `refId` | `refId` ✅ |
| CQT 인증 코드 | `cqt_code` | — | — | `cqtCode` ✅ |
| bill no | `bill_no` | — | — | (내부 생성) |
| POS no | `pos_no` | — | — | (내부 생성) |
| invoice type | `invoice_type` | (`invoiceType`) | `orgInvoiceType` | `transType` ✅ (WeTax) / providerSpecific |
| form no | `form_no` | `templateCode` | `orgInvTemplateNo` | `formNo` ✅ |
| serial no / series | `serial_no` | `invoiceSeries` | `invSeries` | `serialNo` ✅ |
| trans type | `trans_type` | `adjustmentInvoiceType` | — | `transType` ✅ |
| invoice no (응답) | (response 에서) | (response) | `orgInvNo` | `invoiceNo` ✅ |
| lookup code (응답) | ✅ | — | — | `lookupCode` ✅ |
| invoice date | `order_date` | `invoiceIssuedDate` | `invDate` | `createdAt` / `periodStart` ✅ |
| currency | `currency_code` | `currencyCode` | `currencyCode` | `currencyCode` ✅ |
| exchange rate | `exchange_rate` | `exchangeRate` | `exchangeRate` | `exchangeRate` ✅ |
| payment method | `payment_method` | `paymentStatus` | `paymentMethodName` | `paymentMethod` ✅ |
| tot amount / total | `tot_amount` | `summarizeInfo.totalAmountWithoutVat` | `totalAmount` | `totalAmountVnd` ✅ |
| tot vat | `tot_vat_amount` | `summarizeInfo.totalVat` | `totalVATAmount` | `vatAmountVnd` ✅ |
| tot dc | `tot_dc_amount` | (in taxBreakdowns) | `totalDiscountAmount` | (line 별 dcAmountVnd 합계) |
| tot pay | `tot_pay_amount` | `summarizeInfo.totalAmount` | (computed) | `totalAmountVnd` ✅ |
| invoice note | — | — | `invoiceNote` | **`notes` (SP-A29 신규, nullable varchar 500)** |
| buyerNotGetInvoice | `buyerNotGetInvoice` (body level) | `buyerNotGetInvoice` | — | **항상 0 hardcoded** |

#### 5.4.6 누락 필드 체크리스트 (Phase -1 SP-A 에 신규 task 추가)

위 5 매트릭스 분석 결과, **기존 SP-A22 ~ SP-A28 로 커버되지 않은 누락 필드**:

| 필드 | 소속 테이블 | 이유 |
|---|---|---|
| `PlatformLegalEntity.storeCode` | Seller | WeTax `store_code` / Viettel `sellerCustomerCode` |
| `PlatformLegalEntity.contactPhone` | Seller | Viettel / MISA 요구 (기존에 없었음) |
| `PlatformLegalEntity.countryCode` | Seller | Viettel `sellerCountryCode` (default `VN`) |
| `PlatformLegalEntity.website` | Seller | MISA `sellerWebsite` (nullable) |
| `MealCorporate.contactEmailCc` | Buyer | WeTax `buyer_email_cc` |
| `MealCorporate.countryCode` | Buyer | Viettel `buyerCountryCode` |
| `MealCorporate.budgetUnitCode` | Buyer | WeTax `buyer_budget_unit_code` (공공기관 부서 예산 코드, 선택) |
| `MealConsolidatedEInvoice.notes` | Invoice | MISA `invoiceNote`, 일반 메모 |
| `MealConsolidatedEInvoiceLine.itemType` | Line | MISA 확장 (1=HHDV / 2=promo / 3=discount / 4=note) — P1 |

→ **SP-A29** 신규 task 로 한꺼번에 추가 (다음 Phase -1 migration 에 묶어서)
| `MealTicketEInvoiceProviderType` | `WETAX` / `VIETTEL` / `MISA` / `DIRECT_GDT` |
| `MealTicketWalletFundingEntryStatus` | `PENDING` / `POSTED` / `EXPIRED` / `REVERSED` (§9.2 — EXPIRED 신규) |
| `MealTicketWalletFundingSourceType` | `COMPANY_ALLOWANCE` / `PERSONAL_TOP_UP` |
| `MealTicketWalletStatus` | `ACTIVE` / `SUSPENDED` / `FROZEN` / `CLOSED` |
| `MealTicketLoopType` | `OPEN_LOOP` / `CLOSED_LOOP` |
| `MealTicketAuthMethod` | `APP_QR` / `DYNAMIC_BARCODE` / `RFID_BADGE` / `BIOMETRIC_FACE` / `BIOMETRIC_FINGERPRINT` |
| `MealTicketTxnStatus` | `PENDING` / `APPROVED` / `DECLINED` / `REVERSED` / `SETTLED` |
| `MealTicketDeclineReason` | `POLICY_VIOLATION` / `TIME_OUT_OF_WINDOW` / `DAILY_LIMIT` / `INSUFFICIENT_POINTS` / `MERCHANT_NOT_ALLOWED` / `FRAUD_SUSPECTED` / `WALLET_SUSPENDED` / `ENROLLMENT_INACTIVE` |
| `MealTicketEmployeeEmploymentType` | `FULL_TIME` / `CONTRACT` / `DISPATCH` / `CONTRACTOR_AGENCY` (§5.1 용역 인력 분리) |
| `CorporateRoleCode` | `CORPORATE_OWNER` / `CORPORATE_HR_ADMIN` / `CORPORATE_FINANCE_ADMIN` / `CORPORATE_VIEWER` |
| `CorporatePermissionKey` | §8.3.2 의 전체 corporate.* permission 목록 (typed union) |

> **원칙**: 포털은 이 enum 의 문자열 값을 **반드시 SharedContracts 에서 import** 하여 사용한다. 포털 내부에 enum 을 재정의하거나 문자열 리터럴을 하드코딩하지 않는다.

---

## 6. 화면 간 공통 레이아웃

### 6.1 AppShell 구조

```
┌─ TopBar ─────────────────────────────────────────────┐
│ [Logo] CorporatePortal   [회사명] [알림] [언어] [나] │
├──────┬──────────────────────────────────────────────┤
│ Nav  │  Page Content                                │
│      │                                              │
│ Dash │  (각 route 의 page.tsx 가 여기에 렌더)       │
│ Dept │                                              │
│ Emp  │                                              │
│ Poli │                                              │
│ Bud  │                                              │
│ Merc │                                              │
│ Inv  │                                              │
│ Intg │                                              │
│ Set  │                                              │
└──────┴──────────────────────────────────────────────┘
```

- **TopBar**: 회사명은 `me.corporate.companyName` 로 고정 표시 (multi-corporate 지원 안 함 — 1 admin = 1 corporate).
- **SideNav**: `rbac/capabilities.ts` 의 capability 에 따라 항목 숨김. 예: `FINANCE_ADMIN` 은 `/employees`, `/departments` 를 보지 못함.
- **Breadcrumb** 는 page header 영역에 표시.
- TopBar / SideNav 는 `shared/layout/app-shell.tsx` 한 파일로 구현, SharedUI 의 `Nav`, `Stack`, `Card` 만 조합.

### 6.2 로딩 / 에러 / 빈 상태

- 로딩: SharedUI 의 `<Skeleton>` 사용.
- 에러: `<ErrorState code={...} message={t(...)} retry={...}>` 공통 컴포넌트 (SharedUI 내부).
- 빈 상태: `<EmptyState icon={...} title={t(...)} description={t(...)} action={...}>` 공통 컴포넌트.

---

## 7. i18n 키 공간 초안

> **규칙 재확인**: 번역 원본은 **각 프로젝트 내부에 별도로** 둔다. CorporatePortal 의 번역은 오직 `CorporatePortal/src/i18n/locales/` 안에만 존재하며, 다른 프로젝트 (SuperAdmin/Portal, BrandPosApp/PosUi 등) 의 번역 파일을 import 하거나 공유하지 않는다. 설령 같은 의미의 키라 해도 각자 복사본을 유지한다.

`CorporatePortal/src/i18n/locales/<ko|vi|en>/*.json` 에 아래 파일 구조로 작성. 키 네이밍은 **camelCase + dot notation**.

```
src/i18n/locales/
├── ko/
│   ├── common.json          # 버튼 / 필터 / 에러 공용
│   ├── nav.json             # 사이드 네비게이션 항목
│   ├── dashboard.json
│   ├── departments.json
│   ├── employees.json
│   ├── policies.json
│   ├── budget.json
│   ├── merchants.json
│   ├── invoices.json
│   ├── integrations.json
│   ├── settings.json
│   └── auth.json            # 로그인 / 비밀번호 재설정
├── vi/  (동일)
└── en/  (동일)
```

### 7.1 키 예시 (`employees.json`)

```jsonc
{
  "page": {
    "title": "임직원",
    "description": "부서별 임직원 명단과 배지 매핑을 관리합니다"
  },
  "table": {
    "columnFullName": "이름",
    "columnDepartment": "부서",
    "columnBadge": "배지 번호",
    "columnWalletStatus": "지갑 상태",
    "columnLastTransaction": "최근 결제"
  },
  "action": {
    "inviteEmployee": "임직원 추가",
    "assignBadge": "배지 매핑",
    "terminate": "퇴사 처리"
  },
  "form": {
    "employeeCode": "사번",
    "fullName": "이름",
    "email": "이메일",
    "phone": "전화번호",
    "department": "부서"
  }
}
```

### 7.2 번역 작업 규칙

- `ko` 가 원본. `vi` 는 반드시 원어민 검수. `en` 은 엔터프라이즈 톤.
- 에러 code → 번역 키 매핑은 `src/i18n/error-map.ts` 한 파일에서 관리.
- 브리지 payload 에 완성 문장을 넣지 않는다 (CLAUDE.md 규칙). `code` + `params` 만 내려받아 클라이언트가 번역.

---

## 8. Apollo Client / Redux / RBAC 초기화

### 8.1 Apollo

- `src/providers/apollo.ts`:
  - `HttpLink` — CentralApi `/graphql` (env: `NEXT_PUBLIC_GRAPHQL_ENDPOINT`)
  - `WebSocketLink` (`graphql-ws`) — 실시간 구독 (인보이스 상태 변경, 정책 publish 이벤트 등). P0 에는 구독 없이 polling 만.
  - `AuthLink` (apollo-link-context) — `Authorization: Bearer <access_token>` 헤더 주입
  - `RetryLink` — 네트워크 오류 3회 재시도
  - `ErrorLink` — 401 → refresh token 시도, 실패 시 `/login` redirect
  - `InMemoryCache` — type policies (keyFields) 를 각 DTO 마다 지정 (예: `MealEmployee` → `employeeCode`)

### 8.2 Redux

- **UI 상태만** 저장. 서버 상태는 Apollo.
- Slice:
  - `navigation.slice` — side nav open/close, 활성 route
  - `filters.slice` — 각 화면의 필터 상태 (세션 유지)
  - `drawer.slice` — drawer/modal 열림 상태

### 8.3 RBAC — 서버 Permission/Role 시스템 기반

CorporatePortal 은 **서버에 이미 정의된 RBAC 시스템** 위에서 동작한다. SuperAdmin/Portal 과 완전히 동일한 시스템이며, role / permission / UserRoleAssignment 는 전부 서버가 원본이다. **포털에는 role 이름을 하드코딩하지 않는다.**

#### 8.3.1 서버 RBAC 시스템 (CentralApi 측, 이미 구현됨)

- **테이블**: `Permission`, `Role`, `RolePermission`, `UserRoleAssignment` (`prisma/schema/15-rbac.prisma`)
- **PermissionService**: `@core/rbac/permission.service.ts` — 단일 진입점
- **Guards / Decorators**: `@RequirePermission('corporate.employee.write')` 데코레이터가 Resolver/Controller 단에서 권한 강제
- **평가 컨텍스트** (4축): `{ userType, userId, scopeCorporateId, scopeBrandHqId, scopeBranchId, scopeDistributorId }` — CorporatePortal 로그인 사용자는 `userType='CORPORATE_ADMIN'`, `scopeCorporateId=<본인 회사 ID>` 로 평가됨. 다른 corporate 의 데이터는 글로벌 권한이 있어도 자동으로 차단된다.
- **Permission key 포맷**: `domain.subdomain.action` (예: `corporate.employee.write`, `corporate.wallet.fund`, `corporate.merchant.allow.write`)

#### 8.3.2 Permission 카탈로그 — 리소스 중심 + scope 분리 원칙

**설계 원칙 (§23 D-26 확정)**:
- Permission key 는 **리소스 중심** (`<resource>.<action>`) 으로 명명한다
- SuperAdmin 과 Corporate 가 **같은 permission key 를 공유**하되 `scope` 로만 범위를 제한한다 (예: `einvoice.read` 는 `scope='PLATFORM'` 이면 전체 조회, `scope='CORPORATE'` + `scopeCorporateId=<x>` 이면 자기 회사 인보이스만)
- 이 원칙 덕분에 SuperAdmin/Portal 과 CorporatePortal 이 **동일한 permission 체크 로직** (`PermissionService`) 을 공유한다
- 예외: 신용도 평가 / funding policy 부여 같은 **플랫폼 공급자 고유 권한** 은 `platform.*` 네임스페이스 유지

**Corporate 도메인 permission 카탈로그** (seed.ts 기준):

기존 `corporate.*` 네임스페이스 (Corporate 도메인 기본 CRUD):
- `corporate.profile.read` / `corporate.profile.write`
- `corporate.department.read` / `corporate.department.write`
- `corporate.employee.read` / `corporate.employee.write`
- `corporate.wallet.read` / `corporate.wallet.write` / `corporate.wallet.fund` / `corporate.wallet.topup`
- `corporate.policy.read` / `corporate.policy.write`
- `corporate.transaction.read` / `corporate.transaction.authorize` / `corporate.transaction.reverse`
- `corporate.settlement.read` / `corporate.settlement.run`
- `corporate.merchant.read` / `corporate.merchant.enroll` / `corporate.merchant.activate` / `corporate.merchant.commission.write` / `corporate.merchant.account.write`

**CorporatePortal 을 위해 추가 필요** — `corporate.*` (Corporate 전용):
- `corporate.merchant.allow.write` — 머천트 allowlist 토글 (§4.8)
- `corporate.report.read` — 리포트 화면 조회 (§11)
- `corporate.audit.read` — 감사 로그 조회 (§13)
- `corporate.admin.manage` — 같은 회사 관리자 초대/해제/역할 변경 (§4.13)
- `corporate.funding.read.limit` — funding 한도 금액 열람 (§4.6)

**EInvoice 도메인 permission 카탈로그** (리소스 중심 `einvoice.*`):

| permission | 의미 | SuperAdmin 할당 | Corporate 할당 (scope=CORPORATE) |
|---|---|:---:|:---:|
| `einvoice.read` | 인보이스 조회 (리스트 / 상세 / 라인 / 제출 이력) | ✅ (전체) | ✅ (자기 corporate 만) |
| `einvoice.request.write` | DRAFT → REQUESTED 전환 (Corporate 발행 요청) | ✅ | ✅ (OWNER / FINANCE_ADMIN) |
| `einvoice.dispute.write` | DRAFT → DISPUTED 전환 (이의 제기) | ✅ | ✅ (OWNER / FINANCE_ADMIN) |
| `einvoice.publish.write` | REQUESTED → SUBMITTING → ACCEPTED (실제 WeTax 발급) | ✅ | **❌ (절대 금지)** |
| `einvoice.retry.write` | REJECTED → SUBMITTING (발급 재시도) | ✅ | **❌** |
| `einvoice.void.write` | ACCEPTED → VOIDED (긴급 무효화) | ✅ | **❌** |
| `einvoice.revert.write` | REQUESTED → DRAFT (긴급 수정 필요 시) | ✅ | **❌** |
| `einvoice.dispute.resolve.write` | DISPUTED → DRAFT (SA 가 이의 제기 처리) | ✅ | **❌** |

> **핵심 통찰**: `einvoice.read` 는 두 주체가 같은 permission key 를 쓰지만 서버의 `PermissionService.evaluate(ctx)` 가 `scope` 를 보고 자동 필터링한다. 예: SuperAdmin 의 `mealInvoicesByCorporate` 호출은 전체 corporate 를 볼 수 있고, Corporate 의 같은 쿼리는 `scopeCorporateId` 기준 자기 회사만 반환. **클라이언트에서 permission 분기 로직을 복제할 필요가 없다.**

**Platform 전용 permission** (SuperAdmin/Portal 고유, Corporate 에는 개념 자체가 없음):
- `platform.corporate.fundingpolicy.write` — Corporate funding model 부여/변경 (§4.6.0)
- `platform.corporate.credit.assess.write` — 신용도 평가 상태 업데이트
- `platform.corporate.deposit.approve` — PREPAID 예치금 납입 기록 승인
- `platform.rbac.write` — Role / Permission / UserRoleAssignment 관리
- `platform.audit.read` — 전역 감사 로그 조회
- `platform.license.write` / `platform.policy.write` / `platform.deploy.write` / `platform.user.write` — SuperAdmin 플랫폼 운영

> **리소스 중심 vs 기능 중심 비교**:
> - ❌ **기능 중심** (기각): `corporate.invoice.*` 는 "Corporate 의 invoice 화면" 이라는 기능 위치 기반. SuperAdmin 의 인보이스 검수는 `platform.einvoice.*` 로 별도 관리 → 두 네임스페이스를 동기화해야 함 → 실수 빈발.
> - ✅ **리소스 중심** (채택): `einvoice.*` 는 리소스 자체를 가리킴. 주체는 `scope` 로만 구분. 한 번 정의하면 여러 곳에서 재사용.

#### 8.3.3 Corporate role template (서버 Role 테이블에 seed 로 등록)

포털에 role 이름을 하드코딩하지 않는 대신, 서버 `Role` 테이블에 `scope='CORPORATE'` 로 **기본 role template 4개**를 seed 한다. `isSystem=true` 로 삭제 불가.

| roleCode | roleName (한) | 부여되는 permission (기본 template) |
|---|---|---|
| `CORPORATE_OWNER` | 기업 최고 관리자 | 모든 `corporate.*` permission (단 SuperAdmin 전용 4개 제외) + `corporate.admin.manage` + `corporate.audit.read` |
| `CORPORATE_HR_ADMIN` | 인사 관리자 | `profile.read`, `department.*`, `employee.*`, `policy.*`, `wallet.read`, `merchant.read`, `merchant.allow.write`, `invoice.read`, `report.read` |
| `CORPORATE_FINANCE_ADMIN` | 재무 관리자 | `profile.read`, `department.read`, `employee.read`, `wallet.*`, `policy.read`, `transaction.read`, `settlement.read`, `merchant.read`, `merchant.allow.write`, `invoice.read`, `report.read` |
| `CORPORATE_VIEWER` | 조회 전용 | `profile.read`, `department.read`, `employee.read`, `wallet.read`, `policy.read`, `transaction.read`, `settlement.read`, `merchant.read`, `invoice.read`, `report.read` |

- **Template 는 시작점** 이며, 실제 OWNER 가 "커스텀 role" 을 만들어 permission 을 세밀하게 조정할 수 있음 (P1). P0 는 위 4개 template 만 지원.
- OWNER 가 다른 관리자에게 permission 을 부여할 때는 **자신이 가진 permission 범위 내에서만** 부여 가능 (권한 격상 방지). 서버 측 PermissionService 가 grant 시 검증한다.
- `corporate.admin.manage` permission 이 없으면 `/settings/admins` 자체가 숨겨짐.

#### 8.3.4 초기 admin 발급 플로우 (SuperAdmin → CorporatePortal OWNER)

```
1. SuperAdmin/Portal 에서 새 corporate 온보딩
   - MealCorporate 생성 (companyName, taxCode, addressFull, etc)
   - 초기 OWNER 계정 (CorporateAdminUser) 1개 발급
   - UserRoleAssignment 1행 생성: (userType='CORPORATE_ADMIN', userId, roleId=CORPORATE_OWNER, scopeCorporateId=<corp>)
   - 초대 이메일 발송 (임시 비밀번호 또는 one-time setup link)
2. OWNER 가 CorporatePortal 에 첫 로그인 → 비밀번호 설정 → 대시보드 진입
3. OWNER 가 /settings/admins 에서 같은 회사의 다른 관리자 초대
   - 초대 시 role template 선택 (CORPORATE_HR_ADMIN / FINANCE_ADMIN / VIEWER) 또는 커스텀 (P1)
   - 서버: 새 CorporateAdminUser + UserRoleAssignment(scopeCorporateId=<동일 corp>) 생성
   - OWNER 는 본인이 가진 permission 범위 내에서만 부여 가능 (자동 검증)
4. 초대받은 관리자가 이메일 링크 → 비밀번호 설정 → 부여된 role 로 로그인
```

- **OWNER 1명 필수**: 한 corporate 는 항상 최소 1명의 `CORPORATE_OWNER` role 을 가진 admin 이 있어야 한다. 마지막 OWNER 를 해제하려 하면 에러. (다른 OWNER 를 먼저 지정해야 함)
- **SuperAdmin 개입**: OWNER 가 완전히 사라지면 (예: 계정 분실, 퇴사) SuperAdmin 이 긴급 OWNER 재발급 가능. 이 플로우는 SuperAdmin/Portal 에서 처리.

#### 8.3.5 클라이언트 측 RBAC (CorporatePortal)

- **단일 쿼리**: `mealCorporateAdminMe` — 현재 세션의 user + 부여된 effective permission 집합 `Set<PermissionKey>` 을 반환
- **Hook**: `useCurrentPermissions()` → `Set<string>` (Apollo cache 에 long-lived)
- **Hook**: `useHasPermission('corporate.employee.write'): boolean`
- **Guard 컴포넌트**: `<RequirePermission permission="corporate.employee.write" fallback={<Forbidden />}>`
- **SideNav / 버튼 숨김**: 권한 없는 메뉴 / 액션은 렌더링 단계에서 숨김 (UI 편의)
- **실제 enforcement**: 서버의 `@RequirePermission` 가드가 최종 차단. **포털의 숨김은 보안이 아니라 UX**.
- **Permission 카탈로그는 서버가 원본**: 포털에 권한 key 문자열을 하드코딩하되, 이는 서버 seed 와 1:1 매칭되는 typed enum 으로 관리 (`@platform/api-sdk/src/mealticket/permissions.ts` — SharedContracts 에 추가).

```typescript
// 개념 예시 (실제 코드는 SharedContracts 에 작성, 본 문서는 설계만)
export const CORPORATE_PERMISSIONS = {
  PROFILE_READ: 'corporate.profile.read',
  PROFILE_WRITE: 'corporate.profile.write',
  DEPARTMENT_READ: 'corporate.department.read',
  DEPARTMENT_WRITE: 'corporate.department.write',
  EMPLOYEE_READ: 'corporate.employee.read',
  EMPLOYEE_WRITE: 'corporate.employee.write',
  WALLET_READ: 'corporate.wallet.read',
  WALLET_FUND: 'corporate.wallet.fund',
  POLICY_READ: 'corporate.policy.read',
  POLICY_WRITE: 'corporate.policy.write',
  MERCHANT_READ: 'corporate.merchant.read',
  MERCHANT_ALLOW_WRITE: 'corporate.merchant.allow.write',
  INVOICE_READ: 'einvoice.read',
  REPORT_READ: 'corporate.report.read',
  AUDIT_READ: 'corporate.audit.read',
  ADMIN_MANAGE: 'corporate.admin.manage',
} as const;
```

#### 8.3.6 화면별 필요 permission 매핑

| 화면 | 읽기 permission | 쓰기 permission |
|---|---|---|
| `/dashboard` | `profile.read` + `transaction.read` | - |
| `/departments` | `department.read` | `department.write` |
| `/employees` | `employee.read` | `employee.write` |
| `/employees/[id]` | `employee.read` + `wallet.read` + `transaction.read` | `employee.write` + `wallet.write` |
| `/policies` | `policy.read` | `policy.write` |
| `/budget` | `wallet.read` + `report.read` | `wallet.fund` |
| `/merchants` | `merchant.read` | `merchant.allow.write` |
| `/invoices` | `invoice.read` | - (write 없음) |
| `/reports/*` | `report.read` | - |
| `/settings/company` | `profile.read` | `profile.write` |
| `/settings/admins` | `admin.manage` | `admin.manage` |
| `/settings/session` | (본인 계정) | (본인 계정) |
| `/settings/audit` | `audit.read` | - |

---

## 9. Allowance Ledger 개념 모델링 (중요)

### 9.0 핵심 도메인 모델 — 회사 지원금은 "포인트"다

> **절대 규칙**: 회사 지원금(`companyAllowanceVnd`)은 **식권 구매에만 사용할 수 있는 조건부 포인트** 이다. 현금이 아니며, "지급" · "회수" · "환급" 같은 현금 이동 용어를 쓰면 안 된다. 이 규칙은 UI 문구 / API mutation 이름 / 감사 로그 / 알림 / 엑셀 리포트 모든 곳에 일관되게 적용된다.

**현금 vs 포인트 의미 차이**:

| 관점 | 현금 지갑 (금지된 멘탈 모델) | Allowance 포인트 (올바른 멘탈 모델) |
|---|---|---|
| 본질 | 임직원이 소유한 돈 | 회사가 식권 사용 목적으로만 배포한 조건부 토큰 |
| 귀속 | 임직원 개인 자산 | 회사 자산 (사용 권한만 임직원에게 위임) |
| 소멸 가능성 | 없음 (무기한 유효) | 월말 / 퇴사 / 정책 만료 시 자동 소멸 |
| 사용처 | 자유 (ATM 인출, 타인 송금) | 식권 결제만 (회사가 허용한 머천트 + 시간대 + 카테고리) |
| 퇴사 시 | 임직원이 인출 | **자동 소멸** (회사로 되돌아가지도 않음, 그냥 expire) |
| 회계 처리 | 부채 (회사가 임직원에게 돈을 빚진 것) | 회사 비용 (임직원 복지비, 집행 전까지는 예치) |

**UI 용어 매핑** (작업계획서 / SharedContracts / i18n 모두 준수):

| ❌ 금지 (현금 뉘앙스) | ✅ 사용 (포인트 뉘앙스) |
|---|---|
| 지원금을 지급하다 | 지원금 포인트를 **충전하다** / **배포하다** |
| 지원금을 회수하다 | 지원금 포인트가 **소멸하다** / **만료되다** |
| 환급 / 환불 | (회사 지원금에는 해당 없음) |
| clawback | expire / forfeit |
| pay / deposit | load / grant |
| refund | (회사 지원금에는 해당 없음) |
| 잔액 (balance) | 사용 가능 포인트 (available points) |

**예외 — 개인 충전 (`personalTopUpVnd`)** 은 다르다:
- 임직원이 본인 돈 (ZaloPay/MoMo/VNPay) 으로 실제 현금을 충전한 것 → 그 부분은 "현금" 성격
- 퇴사 시 개인 충전 잔액은 **환불** 가능 (실제 현금 이동, ZaloPay/MoMo API 호출 — P2)
- 즉: "회사 지원금 = 포인트 / 개인 충전 = 현금" 로 멘탈 모델을 철저히 분리

### 9.1 잔액 요약 카드 표시 규칙

- 잔액 요약 card 에는 항상 **세 줄** 을 표시:
  1. 🏢 **회사 지원금 포인트** (`companyAllowanceVnd`) — 조건부 토큰. 아이콘 옆에 `P` (Point) 뱃지. 소멸 예정일 함께 표시.
  2. 💳 **개인 충전 잔액** (`personalTopUpVnd`) — 실제 현금. 환불 가능.
  3. **사용 가능 금액** (`companyAllowanceVnd + personalTopUpVnd`) — 단순 합계, "이 임직원이 지금 식권 결제에 쓸 수 있는 총액"
- 단일 잔액만 표시하지 않는다. 사용자가 두 bucket 의 성격을 혼동하지 않게 한다.
- 회사 지원금 라인에는 "VND" 뒤에 작은 글씨로 `포인트` 라벨. 개인 충전 라인에는 `현금 (환불 가능)` 라벨.

### 9.2 포인트 거래 내역 (Funding Entry) 분류 표시

DB 테이블명은 `MealTicketWalletFundingEntry` 를 유지하지만, **UI 에서는 "포인트 거래 내역" 또는 "포인트 변동 이력"** 으로 표현한다.

`sourceType` 별 표시:

| sourceType | UI 표현 | 설명 | 색상 | 아이콘 |
|---|---|---|---|---|
| `COMPANY_ALLOWANCE` | 회사 지원금 충전 | 회사가 월초 배치로 **포인트 충전** | 파랑 | `Building2` |
| `PERSONAL_TOP_UP` | 개인 충전 | 임직원이 ZaloPay/MoMo 등으로 본인 돈 충전 | 초록 | `Wallet` |

`status` 별 표시 (서버 enum 확장 — DB 마이그레이션 필요):

| status | UI 표현 | 의미 | 언제 발생 |
|---|---|---|---|
| `PENDING` | 대기 | 배포 예약됨, 아직 포인트 잔액 미반영 | 월초 배치 실행 직후 |
| `POSTED` | 충전 완료 | 포인트 잔액 반영됨 | 정상 충전 완료 |
| `EXPIRED` | 자동 소멸 | **퇴사 / 월말 만료 / 정책 만료** 등으로 자동 소멸 | 퇴사 처리 / SyncWorkers 월말 cron |
| `REVERSED` | 관리자 교정 | 배포 실수를 관리자가 수동 교정 (드물게, 감사 필수) | 관리자 수동 조정 (P2) |

> **중요 — `EXPIRED` vs `REVERSED` 구분**:
> - `EXPIRED` = **자동 소멸** (시스템 판단 / 규칙 기반). 퇴사, 월말, 정책 만료. UI 표현: "자동 소멸", "만료됨". **관리자 개입 없음**.
> - `REVERSED` = **관리자 수동 교정**. 잘못된 배포를 취소. 반드시 사유 기록 + 이중 확인. 극히 드물게만 사용. UI 표현: "관리자 교정".
> - 기존 문서에서 `REVERSED` 라고 쓰여있던 자동 회수 케이스들은 전부 `EXPIRED` 로 전환.

### 9.3 Split Payment 표시

`MealTicketTransaction.companyShareVnd` + `employeeShareVnd` 가 0 이 아닌 모든 거래는 "Split" 배지로 표시. 거래 상세 화면에서 두 금액을 분리 표기.

- `companyShareVnd` = 이 거래에 사용된 회사 지원금 포인트 부분
- `employeeShareVnd` = 이 거래에 사용된 개인 충전 현금 부분

### 9.4 Carryover (이월) & 월말 만료 — FIFO 회계 모델

> **핵심**: Carryover 는 재무적으로 **미지급 비용 (Accrued Expense) 처리** 에 해당한다. PREPAID 모델에서는 이미 선납한 예치금이 월을 넘어 조금씩 소진되는 형태, CREDIT 모델에서는 "월초에 배포되었지만 소진되지 않은 잔여" 가 발생 — 두 경우 모두 회계적으로 정확한 소진 순서가 필요하다.

#### 9.4.1 FIFO (선입선출) 소진 원칙

한 임직원의 `companyAllowanceVnd` 잔액은 내부적으로 **여러 "포인트 Lot"** 으로 관리된다 (CentralApi 측 데이터 모델). 각 Lot 은 `MealTicketWalletFundingEntry` 1 row 에 대응:

```
임직원 A 의 포인트 Lot 스택 (FIFO 큐):
  ┌──────────────────────────────────────┐
  │ Lot#1: 2026-02-01 충전, 400K VND    │ ← 2월 원본
  │        사용 300K, 잔여 100K         │
  │        effectiveToAt: 2026-03-31    │ ← 이월 허용 시
  ├──────────────────────────────────────┤
  │ Lot#2: 2026-03-01 충전, 500K VND    │ ← 3월 원본
  │        사용 200K, 잔여 300K         │
  │        effectiveToAt: 2026-04-30    │
  ├──────────────────────────────────────┤
  │ Lot#3: 2026-03-15 이월 생성, 100K   │ ← Lot#1 의 이월분
  │        (source_batch = 'carryover_  │
  │           from_Lot1_202602')        │
  │        effectiveToAt: 2026-03-31    │ ← 이월 1회만 허용
  └──────────────────────────────────────┘

  총 사용 가능: 100 + 300 = 400K VND
```

**FIFO 소진 규칙** (CentralApi 의 transaction authorize 에서):

1. 임직원이 결제할 때, 서버는 `MealTicketWalletFundingEntry WHERE walletId=X AND status='POSTED' AND sourceType='COMPANY_ALLOWANCE' AND remainingVnd > 0 ORDER BY effectiveToAt ASC, createdAt ASC` 로 Lot 스택을 조회
2. **가장 먼저 만료되는 Lot 부터** 소진 (effectiveToAt 오름차순)
3. 하나의 Lot 으로 부족하면 다음 Lot 으로 이월 — 한 거래가 여러 Lot 에 걸쳐 차감 가능
4. 각 Lot 의 `remainingVnd` 를 트랜잭션 내에서 atomic 차감
5. 거래 당 사용된 Lot 목록을 `MealTransactionAllowanceUsage` join 테이블에 기록 (감사 추적)

> **왜 FIFO 인가?**: LIFO 로 하면 "가장 최근 충전분" 이 먼저 소진되어 오래된 Lot 이 영원히 만료 → 이월 정책의 의미가 사라진다. FIFO 는 "먼저 배포된 것 먼저 쓰기" 원칙으로, 만료 직전 Lot 을 자연스럽게 먼저 소진시켜 소멸 금액을 최소화한다.

#### 9.4.2 월말 만료 cron 로직

SyncWorkers 의 `meal-wallet-monthend-expire.job.ts` (월말 23:59 GMT+7):

```
FOR each Lot in MealTicketWalletFundingEntry
    WHERE status = 'POSTED'
      AND sourceType = 'COMPANY_ALLOWANCE'
      AND remainingVnd > 0
      AND effectiveToAt < now()
DO
  policy = getPolicyFor(wallet, Lot.sourceBatchId)
  IF policy.allowCarryover AND Lot.carryoverCount < policy.carryoverMaxMonths THEN
    -- 새 Lot (status=POSTED) 생성, effectiveToAt 한 달 연장
    CREATE new Lot {
      walletId: Lot.walletId
      sourceType: COMPANY_ALLOWANCE
      status: POSTED
      amountVnd: Lot.remainingVnd
      remainingVnd: Lot.remainingVnd
      effectiveToAt: Lot.effectiveToAt + 1month
      carryoverCount: Lot.carryoverCount + 1
      note: 'carryover_from_' + Lot.id
      sourceBatchId: Lot.sourceBatchId  -- 원본 배치 추적
    }
    UPDATE Lot SET status = 'EXPIRED', remainingVnd = 0
      -- 원본 Lot 은 EXPIRED 로 이관, 새 Lot 이 승계
  ELSE
    UPDATE Lot SET status = 'EXPIRED', remainingVnd = 0
      -- 정책상 이월 불가 또는 이월 횟수 초과 → 단순 소멸
    LOG AuditLog {
      actionType: 'ALLOWANCE_EXPIRED',
      targetType: 'MealTicketWalletFundingEntry',
      targetId: Lot.id,
      details: { amountVnd, walletId, reason }
    }
  END IF
END FOR
```

**트랜잭션 무결성**:
- 각 Lot 처리는 개별 Postgres 트랜잭션 (소규모 → 장시간 락 방지)
- 10만개 임직원 corporate 라도 Lot 수는 임직원 수의 2~3배 (평균 2~3 Lot/임직원) → 20~30만 row 처리
- BullMQ 병렬 워커 4개 기준 1분 이내 완료 목표

#### 9.4.3 UI 투명성 — "소멸 예정" 표시 규칙

`/employees/[id]` 의 Allowance Ledger 카드에서 "자동 소멸 예정" 이 단순 숫자가 아니라 **투명한 내역** 으로 표시되어야 한다:

```
┌─────────────────────────────────────────────────────┐
│  🏢 회사 지원금 포인트 [P]       240,000 VND        │
├─────────────────────────────────────────────────────┤
│  Lot 상세 (FIFO 소진 순서):                         │
│                                                     │
│  ⏰ 2026-03-31 소멸 예정 (D-5):    85,000 VND       │
│     ↑ 2026-02-01 충전분의 이월 1회차                │
│     ↑ 이월 한도 초과 → 다음 소멸은 완전 만료       │
│                                                     │
│  ⏰ 2026-04-30 소멸 예정 (D-35):  155,000 VND       │
│     ↑ 2026-03-01 충전분                             │
│     ↑ 정책: 이월 1회 허용 → D-day 도달 시 한 번 이월 │
└─────────────────────────────────────────────────────┘
```

- 각 Lot 이 개별 row 로 표시
- 소멸 예정일 (effectiveToAt) D-day 카운터
- Lot 의 **원본 충전 배치** 와 **현재 이월 횟수** 표시 → 사용자가 "이 돈이 어디서 왔고 언제 사라지는지" 추적 가능
- 민원 방지 핵심: 불투명한 "-85,000 VND 소멸" 표시는 분쟁을 부른다. 투명한 Lot 구조로 **"왜 사라졌는가"** 에 대한 답이 즉시 나와야 한다.

#### 9.4.4 대시보드 / 리포트 집계 방식

- `/dashboard` W8 "만료 예정 이월 포인트" 위젯은 `SUM(remainingVnd)` WHERE `effectiveToAt < now() + 7day` 로 계산
- `/budget` 섹션 6 "월말 소멸 예정" 은 `effectiveToAt` 를 월 단위로 group by
- `/reports/carryover-expiry` (P1) — 각 임직원별 / 부서별 / 월별 소멸 금액 전수 리포트

#### 9.4.5 서버 측 구현 요구사항 (CentralApi)

- `MealTicketWalletFundingEntry` 스키마에 **`remainingVnd` / `carryoverCount` / `sourceBatchId` 필드 추가** (Phase -1 SP-A 확장)
- `MealTransactionAllowanceUsage` 신규 join 테이블: `(transactionId, fundingEntryId, consumedVnd, consumedAt)` — 한 거래가 여러 Lot 을 소비한 이력
- Transaction authorize 시 FIFO 쿼리를 advisory lock 으로 보호 (동시 거래 race condition 방지)
- `ALLOWANCE_EXPIRED` 이벤트는 AuditLog + Realtime topic 동시 발행 → Corporate 관리자 알림

#### 9.4.6 Phase 범위

- **P0**: 이월 정책 UI 빌더 (§4.5 탭 3) + 읽기 전용 소멸 예정 숫자 표시
- **P1**: 월말 만료 cron 실제 구현 + FIFO 소진 로직 + Lot 단위 상세 표시 (§9.4.3) + `/reports/carryover-expiry`
- **P2**: 사용자 설정 — "이 Lot 을 다른 Lot 보다 먼저 쓰고 싶다" 같은 수동 우선순위 조정 (드문 엣지케이스, 기본은 FIFO 자동)

### 9.4.5 Funding Policy 가 Allowance 발행의 전제 조건

> **철칙**: 회사 지원금 포인트는 **플랫폼 공급자가 Corporate 에 funding policy 를 부여한 후에만** 발행될 수 있다. funding policy 가 없으면 (`UNASSIGNED`) 아무리 Corporate 관리자가 정책 빌더로 정책을 만들고 임직원을 등록해도 포인트는 0 으로 유지된다.

**인과 관계 체인**:

```
[1] SuperAdmin 이 Corporate 신용도 평가
      ↓
[2] SA 가 funding model 부여 (PREPAID_DEPOSIT / CREDIT_NET15 / CREDIT_NET30)
      + 한도 설정 (monthlyBudgetVnd / creditLimitVnd)
      ↓
[3] Corporate 가 PREPAID 면 에스크로 계좌로 예치금 선납
       or Corporate 가 CREDIT 이면 신용 한도 확보됨
      ↓
[4] Corporate 가 월초 포인트 충전 배치 실행 (자동 또는 수동)
      ↓
[5] 임직원 wallet 에 companyAllowanceVnd 포인트 반영
      ↓
[6] 임직원이 식권 결제 → 포인트 차감
      ↓
[7] 월말 consolidator cron → MealConsolidatedEInvoice DRAFT
      ↓
[8] Corporate 검토 → 발행 요청 → SA 검수 → GDT ACCEPTED
      ↓
[9a] PREPAID: 예치금 잔액에서 자동 차감 (또는 기 차감된 상태)
[9b] CREDIT:  Net15/30 후 Corporate 가 실제 대금 납입
```

- **Step 1 이 안 끝나면 Step 4 부터 전체 블로킹**: 신용도 평가 대기 중인 Corporate 는 임직원에게 식권을 주지 못한다.
- **Step 2 의 funding model 에 따라 Step 9 의 현금 흐름이 완전히 다름**: PREPAID 는 이미 현금이 플랫폼에 있음 / CREDIT 는 월말에야 현금을 받음 → 플랫폼 측 risk 프로파일이 완전히 다름.
- **Step 6 의 거래 승인 가드**: CentralApi 의 transaction service 가 매 승인 시점에 `corporate.fundingModel !== 'UNASSIGNED'` 검증.

### 9.5 퇴사 시 자동 소멸 규칙

퇴사 처리 (wallet status → `CLOSED`) 시 서버가 **원자적으로 자동 수행**:

1. 남은 `companyAllowanceVnd` 전체를 `EXPIRED` 상태로 funding entry 기록 (`sourceType=COMPANY_ALLOWANCE`, `status=EXPIRED`, `note='employee_terminated'`)
2. `MealTicketWallet.companyAllowanceVnd` → 0
3. `MealTicketWallet.status` → `CLOSED`
4. 배지 (`badgeRfid`) 무효화 → 새 거래 진입 차단
5. AuditLog 기록 (`actionType='WALLET_AUTO_EXPIRE_ON_TERMINATION'`)

- **관리자 선택 옵션 없음**: "회수할까 말까" 같은 UI 옵션은 존재하지 않는다. 퇴사 = 회사 지원금 자동 소멸.
- **개인 충전 (`personalTopUpVnd`) 은 별도 처리**: 퇴사 시 임직원에게 환불 안내 이메일 발송 (`contact the admin for refund`). 실제 환불 mutation 은 P2 (ZaloPay/MoMo API). 이 금액은 wallet CLOSED 후에도 "refund pending" 상태로 보존.
- **감사 추적**: `/employees/[id]/ledger` 탭에서 퇴사 시각 + 자동 소멸된 포인트 금액 + trigger actor (퇴사 처리한 관리자) 가 기록됨.

---

## 10. 허용 머천트 모델 (MealCorporateMerchantAllowlist)

### 10.1 책임 분리 (확정)

| 책임 | 소유 프로젝트 | DB 테이블 |
|---|---|---|
| 제휴 가맹 계약 체결 / 해제 | **SuperAdmin/Portal** | `MealMerchantEnrollment` |
| 수수료율 설정 / 변경 | **SuperAdmin/Portal** | `MealMerchantCommissionRate` |
| 정산 계좌 관리 | **SuperAdmin/Portal** | `MealMerchantSettlementAccount` |
| 머천트 카테고리 / 주소 / 영업시간 | **SuperAdmin/Portal** (원본은 BrandHQ 가 BrandPosApp/PosUi 에서 관리, SuperAdmin 이 승인) | `BrandProfile` / `Branch` |
| **Corporate 별 허용 여부 (allowlist)** | **CorporatePortal** | `MealCorporateMerchantAllowlist` (신규) |

### 10.2 데이터 모델 — `MealCorporateMerchantAllowlist` (확정)

```
model MealCorporateMerchantAllowlist {
  id               uuid @id
  corporateId      uuid → MealCorporate
  branchId         uuid → Branch            // 실제 식당 지점
  enrollmentId     uuid → MealMerchantEnrollment  // 활성 가맹 레코드 참조 (FK)
  isAllowed        boolean                  // true = 우리 회사 임직원이 사용 가능
  reason           varchar(500)?            // 변경 사유 (감사용)
  updatedByAdminId uuid → CorporateAdminUser
  updatedAt        timestamptz
  createdAt        timestamptz

  @@unique([corporateId, branchId])
  @@index([corporateId, isAllowed])
}
```

- **기본값**: 레코드가 없으면 `isAllowed=false` 로 간주 (명시적 allowlist). 즉 새 corporate 는 처음 어떤 머천트도 사용 불가 → 관리자가 allow 해야 사용 가능.
- **`enrollmentId` FK**: SuperAdmin 이 enrollment 를 해제하면 `MealMerchantEnrollment.isActive=false` 로 바뀌고, 서버는 거래 승인 시 (`enrollment.isActive && allowlist.isAllowed`) 둘 다 true 일 때만 승인.
- **Cascade**: enrollment 삭제 시 allowlist row 는 유지 (감사 목적). isActive 플래그로만 차단.

### 10.3 트랜잭션 승인 시 평가 로직 (CentralApi 측)

```
거래 승인 조건 (모두 만족해야 APPROVED):
  1. wallet.status === 'ACTIVE'
  2. policy 평가 (시간대 / 한도 / Split Payment / Carryover)
  3. merchantEnrollment.isActive === true   ← SuperAdmin 관리
  4. allowlist.isAllowed === true            ← CorporatePortal 관리
  5. (선택) category 허용 여부
```

### 10.4 CentralApi 신규 permission 추가

seed.ts 의 `corporate` 도메인 permission 카탈로그에 아래 1개 추가:

```
corporate.merchant.allow.write    — 허용 머천트 토글 (allowlist 편집)
```

> 주의: 기존 `corporate.merchant.enroll` / `corporate.merchant.commission.write` / `corporate.merchant.account.write` 는 **SuperAdmin role 전용** 이며 CorporatePortal 관리자에게는 절대 부여되지 않는다. Corporate 전용 role template 의 grant 목록에서 명시적으로 제외한다.

### 10.5 화면 P0 범위 (§4.8 참조)

- 리스트 + 카테고리 일괄 + 단건/다건 토글 + 필터 + CSV 내보내기
- View B (Google Maps) 는 P1

---

## 11. 리포트 / 분석 (Report & Analytics)

작업계획서의 §4 에서 대시보드 위젯과 각 화면의 내부 리포트는 이미 정의되었다. 본 섹션은 **전용 리포트 화면** (P1) 을 추가 정의한다. 비플식권의 3종 보고서 (식권별 / 사용자별 / 가맹점별) + 식권대장의 "부서별·식당별 통계" 를 모두 커버한다.

### 11.1 리포트 카탈로그

| 리포트 | 경로 | 설명 | Phase |
|---|---|---|---|
| 기간별 예산 소진 | `/reports/spend-by-period` | 일/주/월별 총 소진액 차트 + 테이블. 지난달 대비 증감. | P1 |
| 부서별 소진 | `/reports/spend-by-department` | 부서 트리 드릴다운, 각 부서의 예산 대비 % | P1 |
| 임직원별 소진 | `/reports/spend-by-employee` | 상위/하위 N명, 평균, 분포 차트 | P1 |
| 머천트별 이용 | `/reports/spend-by-merchant` | 인기 식당 랭킹, 카테고리 breakdown, 평균 객단가 | P1 |
| 카테고리별 이용 | `/reports/spend-by-category` | 한식 vs 베트남식 vs 카페 vs 편의점 | P1 |
| 시간대별 이용 | `/reports/spend-by-timeslot` | 점심/저녁/심야, 요일별 heatmap | P1 |
| 거래 decline 분석 | `/reports/declines` | 거절된 거래의 사유 breakdown, 이상 패턴 | P1 |
| 이월 / 소멸 리포트 | `/reports/carryover-expiry` | 이번 달 소멸 예정 / 이월 대상 | P1 |
| Split Payment 분석 | `/reports/split-payment` | 회사 지원금 vs 개인 충전 비율, 평균 보충액 | P1 |
| 정책 효과 분석 | `/reports/policy-effectiveness` | 정책 A 적용 전/후 소진 패턴 변화 | P2 |
| SaaS Subscription 청구 | `/reports/saas-billing` | 플랫폼이 corporate 에게 청구한 월간 SaaS 비용 | P1 |
| Float 활용 (예치금 운용) | `/reports/float-utilization` | 예치금 평균 잔존일, 대략적 운용 수익 | P2 |

### 11.2 공통 기능 (모든 리포트)

- **기간 선택**: 오늘 / 어제 / 이번 주 / 지난 주 / 이번 달 / 지난 달 / 분기 / 커스텀
- **비교 기간**: 같은 기간 지난달/지난분기/지난해와 비교
- **필터**: 부서 / 정책 / 고용 형태 / 머천트 카테고리
- **차트**: 라인 / 막대 / 파이 / heatmap / 테이블 (사용자가 토글)
- **엑셀 / CSV 내보내기**: 원본 데이터 + 집계본
- **PDF 리포트** (P2): 회사 로고 + 기간 + 주요 KPI 요약 한 장 PDF
- **스케줄 리포트** (P2): 월초에 자동 생성되어 관리자 이메일로 발송
- **북마크**: 자주 쓰는 필터 조합 저장
- **공유 링크**: URL query param 으로 필터 상태 공유 가능

### 11.3 데이터 소스

- 모든 리포트는 CentralApi 의 `platform/corporate/reports` leaf (신규) 에서 집계된 결과를 받음
- CentralApi 는 OLTP DB (PostgreSQL) + 별도 OLAP 집계 테이블 (materialized view 또는 cube) 을 유지
- 5분 단위로 집계 테이블 refresh (P2 에서 실시간 필요 시 ClickHouse / Druid 고려)

### 11.4 성능 요구

- 1000명 규모 corporate 의 3개월 리포트 → **3초 이내** 첫 페인트
- 10000명 규모 → **8초 이내**
- 차트 pagination / 가상 스크롤 필수

### 11.5 GraphQL operation (P1)

- `mealReportSpendByPeriod(corporateId, from, to, granularity)`
- `mealReportSpendByDepartment(corporateId, period, depth)`
- `mealReportSpendByEmployee(corporateId, period, cursor, orderBy)`
- `mealReportSpendByMerchant(corporateId, period, cursor)`
- `mealReportSpendByCategory(corporateId, period)`
- `mealReportSpendByTimeslot(corporateId, period)`
- `mealReportDeclines(corporateId, period)`
- `mealReportCarryoverExpiry(corporateId, period)`
- `mealReportSplitPayment(corporateId, period)`
- `mealReportExport(corporateId, reportType, filter, format)` — signed URL

---

## 12. 알림 / 통보 (Notification Center)

### 12.1 알림 종류

| 알림 | 대상 | 채널 | Phase |
|---|---|---|---|
| 예산 80% 소진 경고 | FINANCE_ADMIN / OWNER | 이메일 + 포털 벨 | P1 |
| 예산 100% 초과 | 위 동일 | 이메일 + 포털 벨 + 슬랙 (P2) | P1 |
| 예치금 부족 | 위 동일 | 이메일 + 포털 벨 | P1 |
| 인보이스 생성됨 (DRAFT) | FINANCE_ADMIN | 포털 벨 | P1 |
| 인보이스 수락됨 (ACCEPTED) | FINANCE_ADMIN + billing CC | 이메일 (PDF 첨부) + 포털 벨 | P1 |
| 인보이스 거부됨 (REJECTED) | OWNER + FINANCE_ADMIN | 이메일 (긴급) + 포털 벨 | P1 |
| 이상 거래 감지 | OWNER + HR_ADMIN | 이메일 + 포털 벨 | P1 |
| 임직원 초대 수락 | 초대한 admin | 포털 벨 | P1 |
| 정책 충돌 감지 | HR_ADMIN | 포털 벨 | P1 |
| 이월 포인트 소멸 예정 | HR_ADMIN | 포털 벨 (7일 전) | P1 |
| HRIS 싱크 실패 | OWNER | 이메일 + 포털 벨 | P2 |
| 새 머천트 가입 (같은 지역) | HR_ADMIN | 포털 벨 | P2 |

### 12.2 포털 벨 (Bell) UI

- TopBar 우측의 🔔 아이콘 + 미읽음 배지 (max 99+)
- 클릭 시 drawer: 최근 30건의 알림
- 각 알림: 아이콘 / 제목 / 요약 / 시각 / 관련 리소스 링크 / 미읽음 표시
- 필터: 전체 / 미읽음 / 중요도 (INFO / WARN / CRITICAL)
- "모두 읽음 처리" 버튼
- 우측 상단 ⚙️ → 알림 설정 (`/settings/session` 으로 이동)

### 12.3 이메일 템플릿

- 각 알림 종류마다 ko/vi/en 3개 언어 템플릿
- 템플릿은 CentralApi 의 `core/mailer` 가 소유 (Corporate Portal 은 트리거만)
- HTML + plaintext fallback
- 수신자의 언어 설정에 따라 자동 선택

### 12.4 실시간 알림 (P1)

- GraphQL Subscription (`graphql-ws`) — `mealCorporateNotifications(corporateId)` 토픽 구독
- 새 알림 오면 포털 벨 배지 증가 + 토스트 (sonner)
- 브라우저 푸시 알림 (P2, Web Push API)

### 12.5 GraphQL operation

- `mealNotificationsByCorporate(corporateId, cursor, filter)`
- `mealNotificationMarkRead(notificationIds)`
- `mealNotificationMarkAllRead(corporateId)`
- `mealNotificationPreferences(adminId)` — 알림 수신 설정
- `mealNotificationUpdatePreferences(adminId, prefs)`
- Subscription `mealCorporateNotifications(corporateId)` — 실시간

---

## 13. 감사 / 컴플라이언스 (Audit & Compliance)

### 13.1 모든 admin action 의 감사 로그

- 모든 mutation 호출은 `AuditLog` 에 기록 (`core/audit/audit.service`)
- 필드: `actorType='CORPORATE_ADMIN'`, `actorId`, `actionType`, `targetType`, `targetId`, `scope`, `detailsJson`, `ipAddress`, `userAgent`, `createdAt`
- 24개월 retention + 월별 archive

### 13.2 감사 화면 (P1)

- `/settings/audit` — Corporate 관점의 감사 로그 뷰
- 필터: actor / actionType / targetType / 기간
- 타임라인 view (역순)
- 엑셀 / PDF 내보내기

### 13.3 민감 액션 (additional verification 필요)

다음 액션은 비밀번호 재입력 또는 2FA 재확인 필요:

- 대량 퇴사 처리 (10명 이상) — 자동 포인트 소멸이 연쇄 발생하므로 감사 중요
- 관리자 수동 포인트 교정 (P2, `mealWalletCompanyAllowanceAdjust`) — 배포 실수 정정, 극한 상황에만 허용
- OWNER 역할 변경 / 해제
- 회사 세금 코드 변경
- 관리자 대량 해제 (5명 이상)
- 예치금 인출 (P2)
- 보안 정책 변경 (P2)

### 13.4 베트남 컴플라이언스 준수

- **개인정보보호법 (PDPL)**: 임직원 PII (이름/이메일/전화/배지) 는 암호화 저장, 마스킹 표시, 접근 로그 기록
- **Decree 53/2022 (사이버보안법)**: 베트남 시민의 데이터는 베트남 국내 저장 (infra 제약, SuperAdmin 이 해결)
- **PIT 면제 증빙**: 월간 인보이스는 PIT 증빙 자료로 24개월 이상 보존
- **GDT 접근 로그**: WeTax → GDT 제출 로그는 분쟁 시 증빙 → `EInvoiceSubmissionLog` retention 24개월

### 13.5 GraphQL operation

- `mealCorporateAuditLog(corporateId, filter, cursor)` — 감사 이력 조회
- `mealCorporateAuditLogExport(corporateId, filter, format)` — 내보내기
- `mealCorporateSensitiveActionVerify(password, totpCode)` — 민감 액션 재인증

---

## 14. 사용자 플로우 시나리오 (End-to-End Scenarios)

각 시나리오는 실제 HR/재무 관리자의 1일~1월 작업 흐름을 재현한다. E2E 테스트 (§12 후반부에 정의) 의 근거가 된다.

### 14.1 시나리오 A — 신규 가입 onboarding (첫 1시간 ~ 수일)

> **전제 1 (SuperAdmin 측)**:
> - SuperAdmin 이 `MealCorporate` row 생성 (companyName, taxCode, addressFull 등) — 초기 `fundingModel='UNASSIGNED'`, `creditAssessmentStatus='PENDING'`
> - 초기 `CorporateAdminUser` 1명 + `UserRoleAssignment(roleCode='CORPORATE_OWNER', scopeCorporateId)` 원자적 발급
> - OWNER 앞으로 초대 이메일 발송
> - Corporate 에게 신용도 평가에 필요한 서류 안내 이메일 병행 발송

**Phase 1 — Corporate 기본 설정** (OWNER 로그인 첫 1시간, funding 부여 전):
1. OWNER 가 초대 이메일의 링크 클릭 → `/set-password?token=...` → 초기 비밀번호 설정
2. 자동 로그인 → `/dashboard` 리다이렉트 → **Empty state 대시보드 + 상단 배너 "Funding Policy 가 부여되지 않았습니다. 신용도 평가 제출 후 활성화됩니다"**
3. `mealCorporateAdminMe` 쿼리로 effective permission 로드 → 사이드 네비가 OWNER 권한 기준 렌더
4. `/settings/company` 이동 → 회사 정보 (contactName, contactEmail, contactPhone, taxCode, addressFull 등) 보완
5. `/settings/company` 탭 3 → 통합 인보이스 그룹화 전략 선택 (기본: BY_MERCHANT)
6. `/departments` 이동 → 루트 부서 2~3개 생성 ("본사", "연구소")
7. `/employees` 이동 → `+ 임직원 추가` 단건 1명 또는 CSV 업로드 (임직원 등록은 funding 없이도 가능, 단 wallet 포인트는 0)
8. `/policies` 이동 → "기본 정책" 하나 생성 (평일 11:30~14:00 점심, 1회 100K VND, 일일 150K VND) → 활성화
9. `/merchants` 이동 → 카테고리별로 한식/베트남식/카페 허용 토글 ON
10. `/settings/admins` 이동 → HR 담당자 / 재무 담당자 추가 초대
11. `/budget` 이동 → **UNASSIGNED 상태 카드 확인** → "SuperAdmin 문의" / "제출 서류 확인" 버튼 클릭 → 필요한 재무 서류 목록 확인 (사업자등록증 / 재무제표 2년치 / 법인 통장 사본 / 대표자 신분증 / 계약서 초안 등)

**Phase 2 — 신용도 평가 (수 시간 ~ 수일, 오프라인 프로세스)**:
12. 재무팀이 필요 서류를 SuperAdmin 에게 이메일 / 업로드
13. SuperAdmin 이 SA-CORP-FUND-001 화면에서 서류 검토 + 신용도 평가 → `creditAssessmentStatus` 를 `PENDING → UNDER_REVIEW`
14. SuperAdmin 이 최종 결정 → `platformAssignCorporateFundingPolicy` mutation:
    - 중소기업이면 `PREPAID_DEPOSIT` + `monthlyBudgetVnd=500,000,000`
    - 중견기업이면 `CREDIT_NET15` + `creditLimitVnd=1,000,000,000`
    - 대기업이면 `CREDIT_NET30` + `creditLimitVnd=5,000,000,000`
15. 서버: `MealCorporateFundingPolicyHistory` row 자동 생성 + AuditLog + 실시간 토픽 `corporate.funding.policy.changed` publish
16. Corporate OWNER 에게 이메일 + 포털 벨 알림 "Funding Policy 가 부여되었습니다"

**Phase 3 — Funding 입금 / 사용 시작** (funding 부여 후):
17. Corporate OWNER 가 `/budget` 새로고침 → 섹션 1 카드가 **PREPAID** 또는 **CREDIT** 모드로 바뀜
18. **PREPAID 경우**: 은행 정보 확인 → 실제 송금 → `/budget` 에 "납입 완료 기록" 클릭 → 금액 / 증빙 업로드 → status=PENDING 기록. SuperAdmin 이 통장 대조 후 승인 → status=POSTED → `depositBalanceVnd` 업데이트
19. **CREDIT 경우**: 추가 입금 불필요. 바로 다음 단계로.
20. Corporate OWNER 가 `/budget` → 월초 포인트 충전 배치 설정 (매월 1일 09:00 전 직원에게 500K VND 포인트 자동 충전, P1)
21. 첫 자동 충전 실행 → 임직원 wallet 에 `companyAllowanceVnd` 반영 → 임직원이 식권 사용 가능
22. Onboarding 완료 → `/dashboard` 에 실제 데이터 표시 시작

**DoD**:
- Phase 1 (기본 설정): OWNER 로그인 후 **1시간 이내**
- Phase 2 (신용도 평가): SuperAdmin 처리 시간에 따라 **1~5 영업일**
- Phase 3 (funding 입금 / 첫 충전): PREPAID 은 은행 송금 시간 + SA 승인까지 **1~2 영업일**, CREDIT 은 **즉시**
- 임직원이 실제 식권 사용 시작까지 총 **2~7 영업일** (산업 표준 대비 빠른 편 — B2B 보험 / 카드 발급이 1~2주 걸리는 것 대비 경쟁력)

### 14.2 시나리오 B — 월초 정기 업무 (매월 1일 ~ 7일)

1. **매월 1일 오전** — 벨 🔔 "2026년 3월 인보이스 (DRAFT) 가 검토 대기 중 — 마감까지 D-7"
2. `/dashboard` 접속 → W6 위젯: 이번 달 DRAFT 인보이스 카드 표시 + "검토하기" CTA
3. `/invoices` 이동 → 리스트 최상단에 DRAFT 2026-03 인보이스 + D-7 카운터
4. 인보이스 상세 진입 → 총액 / 그룹화 / 라인 / sourceTransactionCount 검토
5. 섹션 4 "라인 항목" 에서 머천트별 합산액 검토, 의심 건이 있으면 라인 클릭 → 원본 거래 drill-down (P1)
6. **케이스 A — 정상**: `[📝 발행 요청]` 버튼 클릭 → 확인 다이얼로그 → "발행 요청 확정" → 상태 DRAFT → REQUESTED
7. **케이스 B — 이상 발견**: `[⚠️ 이의 제기]` → 사유 입력 (30자 이상) → 상태 DRAFT → DISPUTED → SuperAdmin 응답 대기
8. 이후 SuperAdmin 검수 → WeTax → GDT → ACCEPTED 까지 평균 1~2 영업일
9. ACCEPTED 되면 벨 🔔 "2026년 3월 인보이스가 발급되었습니다"
10. `/invoices` → PDF + XML 다운로드 → 재무팀 내부 archive
11. `/reports/spend-by-department` → 부서별 지난달 소진 리뷰 → 재무 보고서 작성
12. `/budget` → 이번 달 예치금 확인 (부족하면 은행 이체 후 납입 기록)
13. `/employees` → HRIS 싱크 또는 수동 신규 입사자 등록
14. `/policies` → 필요 시 정책 조정 (예: 부서 이동자 정책 재적용)
15. `/dashboard` 재확인 → 이번 달 회사 지원금 포인트 충전 배치 트리거 (P1)

**DoD**:
- 케이스 A (정상 발행 요청): 인보이스 검토 + 요청 **5분 이내**
- 케이스 B (이의 제기): 이의 제기 제출 **10분 이내**, 이후 SuperAdmin 해결 대기
- 월초 전체 업무 (인보이스 검토 포함): **30분 이내**
- Corporate 관리자가 휴가로 7일 이상 무응답 시에도 자동 승격으로 발행 진행 (세무 마감 리스크 없음)

### 14.3 시나리오 C — 신규 임직원 100명 일괄 입사 (CSV 업로드)

1. HR 팀이 HRIS 에서 100명 명단을 CSV 로 추출
2. `/employees` → `📤 CSV 업로드` 클릭
3. 템플릿 다운로드 → 포맷 확인 → 명단 붙여넣기 + 저장
4. 파일 선택 → 미리보기 (처음 10행) 확인
5. "검증" 클릭 → 전체 100행 검증 → 리포트: `성공 95 / 경고 3 (중복 사번) / 오류 2 (부서 미존재)`
6. 오류 2건 수정 → 재업로드 또는 "오류 제외하고 진행"
7. "업로드 실행" → 서버 배치 처리 → 성공 후 "98명 추가 완료" 토스트
8. `/policies` → 신규 입사자 자동 정책 적용 확인 (정책의 `appliesToDepartmentIds` 로 자동 포함)
9. `/budget` → 이번 달 회사 지원금 포인트 추가 충전 (신규 입사자 대상만)

**DoD**: 100명 업로드 + 정책 적용 + 포인트 충전까지 10분 이내

### 14.4 시나리오 D — 이상 거래 감지 → 대응 (긴급)

1. 🔔 알림 "이상 거래 감지: 임직원 김OO, 최근 1시간 내 15건 거절" 수신
2. 알림 클릭 → `/employees/[id]` 로 이동
3. 탭 3 "거래 내역" → decline reason 확인 (`DAILY_LIMIT` 반복)
4. `⋯` → "일시 정지" → 사유 입력 "이상 거래 조사 중" → 확인
5. wallet status → `SUSPENDED` (새 거래 차단, 포인트 잔액 유지)
6. 해당 임직원에게 이메일 / 전화로 확인
7. 일반 거래였음이 확인되면 `정지 해제` → `ACTIVE` 복귀
8. 부정 거래였으면 `퇴사 처리` → 서버가 자동으로 회사 지원금 포인트 소멸 + 배지 무효화 + AuditLog 기록. 관리자가 별도 "회수" 액션 하지 않음.

**DoD**: 감지 후 5분 이내 일시 정지, 15분 이내 결정

### 14.5 시나리오 E — 분기 예산 조정

1. `/reports/spend-by-period` → 지난 3개월 추이 확인
2. 특정 부서가 매달 예산 120% 초과 패턴 발견
3. `/policies` → 해당 부서 전용 정책 생성 (더 낮은 1회 한도)
4. 영향 범위 preview → 적용 대상 N명 확인
5. publish → 다음 달부터 적용
6. `/dashboard` 에서 다음 달 초부터 모니터링

**DoD**: P1 에서 리포트 + 정책 조정까지 seamless 연계

### 14.6 시나리오 F — 퇴사 처리 (자동 포인트 소멸)

1. HRIS 에서 퇴사 이벤트 발생 (또는 관리자 수동)
2. `/employees` → 해당 임직원 검색 → `⋯` → "퇴사 처리"
3. 퇴사일 입력 (effective date, 기본값: 오늘)
4. (선택) 퇴사 사유 입력 — AuditLog 에만 저장
5. 확인 다이얼로그: 서버가 자동 수행할 작업 5가지 미리 고지 (§4.3.5)
6. "확인" → `mealEmployeeTerminate(id, effectiveDate, reason?)` mutation 호출
7. 서버가 단일 트랜잭션으로:
   - wallet status → `CLOSED`
   - 남은 `companyAllowanceVnd` → funding entry `EXPIRED` 기록 + 잔액 0
   - 배지(RFID) 무효화
   - 적용된 정책 해제
   - 개인 충전 `personalTopUpVnd` 는 보존 + 환불 안내 이메일 발송
   - AuditLog (`actionType=WALLET_AUTO_EXPIRE_ON_TERMINATION`)
8. 성공 토스트 + 리스트 refetch

> **관리자 선택 옵션이 없다**: "회수할까 말까", "유지할까 말까" 같은 옵션은 UI 에 존재하지 않는다. 퇴사 = 회사 지원금 포인트 자동 소멸. 포인트는 현금이 아니라 조건부 토큰이기 때문 (§9.0).

**DoD**: 단건 3분 이내, bulk 100건 10분 이내 (P1 bulk 퇴사)

---

## 15. UX / 접근성 / 반응형

### 15.1 디자인 원칙

- **데스크탑 우선** (HR/재무 관리자의 주 워크플로우는 데스크탑)
- 태블릿 (iPad 가로) 까지 완벽 지원
- 스마트폰은 읽기 전용 모드 (긴급 조회 용도)
- Tailwind breakpoint: `sm(640), md(768), lg(1024), xl(1280), 2xl(1536)`
- 기본 타겟 해상도: `1440x900` ~ `1920x1080`

### 15.2 접근성 (a11y)

- **WCAG 2.1 AA 준수**
- 모든 interactive 요소는 키보드 접근 (Tab / Enter / Esc / Space)
- **focus 표시**: Tailwind 의 `ring-2 ring-offset-2` 같은 시각 노이즈가 큰 링은 **사용하지 않는다**. SharedUI 의 공용 버튼/입력/탭 컴포넌트가 자체적으로 제공하는 `focus-visible` 기반의 미묘한 스타일 (예: 배경 음영 변화, 1px border 강조) 을 따른다. 커스텀 포커스 스타일을 화면 내에서 새로 정의하지 않는다.
- 색상 대비 4.5:1 이상 (본문), 3:1 이상 (큰 텍스트 / UI)
- ARIA 레이블 (특히 아이콘 only 버튼)
- 테이블은 `<th>` / `<scope>` 사용
- 폼 라벨 연결 (`<label for>`)
- 에러 메시지는 `aria-live="polite"`
- 스크린 리더 테스트 (NVDA / VoiceOver)

### 15.3 반응형 규칙

| 화면 폭 | 대시보드 | 임직원 | 정책 빌더 | 인보이스 |
|---|---|---|---|---|
| sm (~640) | 위젯 1열 | 카드 뷰 (모바일) | 진입 차단 ("데스크탑에서 사용하세요") | 리스트만 |
| md (768+) | 위젯 2열 | 간소화 테이블 | 탭 기반 순차 진행 | 리스트 + 상세 |
| lg (1024+) | 위젯 3열 | 전체 테이블 | 2-pane | 리스트 + 상세 |
| xl (1280+) | 위젯 4열 | 전체 + 필터 사이드바 | 3-pane (목록 / 편집 / 미리보기) | 리스트 + 상세 |

### 15.4 다크 모드

- `next-themes` 로 light / dark / system 3가지
- TopBar 의 ⚙️ 에서 토글
- SharedUI 가 dark variant 를 제공

### 15.5 i18n UX

- 언어 스위처는 TopBar 우측
- 기본값: 베트남어 (vi-VN) — 베트남 고객 대상
- 한국어 / 영어는 선택 가능
- 날짜 포맷: 베트남어 `dd/MM/yyyy`, 한국어 `yyyy-MM-dd`, 영어 `MMM dd, yyyy`
- 통화 포맷: VND (천단위 구분, 소수점 없음, `1,234,567 ₫` 또는 `1.234.567 VND`)
- 이름 정렬: 베트남어 기준 (given name first)

### 15.6 빈 상태 / 에러 상태 / 로딩 상태

- 빈 상태: 일러스트 + 설명 + 주요 CTA
- 에러 상태: 에러 코드 + 번역된 메시지 + "재시도" 버튼 + "문제가 계속되면 담당자에게 문의" 링크
- 로딩 상태: Skeleton (테이블 5행, 카드 3개 등 context 맞춤)
- 네트워크 끊김: TopBar 에 빨간 배너 "오프라인" + 자동 재연결 시도

---

## 16. 성능 / 캐시 / 오류 복구

### 16.1 초기 번들 크기

- 목표: 초기 JS bundle < **250KB gzip** (대시보드 진입 시)
- 수단:
  - Next.js App Router 의 route-level code splitting
  - `dynamic()` import 로 큰 라이브러리 lazy load (차트 라이브러리, 지도)
  - 아이콘은 tree-shakable `lucide-react`
  - Apollo Client `createHttpLink` + `InMemoryCache` 만 초기 로드, subscription 은 lazy

### 16.2 Apollo 캐시 정책

- `InMemoryCache` 의 `typePolicies`:
  - `MealEmployee.keyFields: ['employeeId']`
  - `MealTicketWallet.keyFields: ['walletId']`
  - `MealTicketCorporate.keyFields: ['corporateId']`
  - pagination: 각 도메인별 keyset `merge` 함수 정의 (`relayStylePagination` / `offsetLimitPagination` 직접 사용 금지 — 서버가 keyset 기반이므로 custom merge 필수)
- `fetchPolicy`:
  - 리스트: `cache-first` (첫 방문은 network, 이후는 cache. `cache-and-network` 는 **사용 금지** — 백그라운드 재요청이 서버 자원을 낭비)
  - 상세: `cache-first`
  - 민감 action 직후: `network-only` (권한 / 감사 재확인이 꼭 필요한 경우에만 명시적으로)
- **`refetchQueries` 사용 금지 — Cache update 전략**:
  - 모든 mutation 은 **서버 응답을 그대로 cache 에 반영** 해서 UI 가 즉시 갱신되도록 설계한다. 서버에 list query 를 다시 쏘는 것은 네트워크 자원 낭비이며, 사용자 UX 지연을 유발한다.
  - 서버 mutation 응답 shape 는 "변경된 entity 전체 객체 (또는 영향받은 객체 배열)" 를 반환하도록 설계한다. 이를 위해 SharedContracts 의 모든 mutation document 는 mutation 자리에서 완전한 entity shape 을 요청한다.
  - **클라이언트 측 cache 반영 패턴** (4가지):
    1. **단건 update** (가장 흔한 경우): `keyFields` 기반 normalized cache 에 의해 서버 응답이 자동으로 기존 entity 를 덮어씀. 추가 코드 불필요. 예: `mealEmployeeUpdate` 응답이 `MealEmployee` 전체를 반환하면, Apollo 가 자동으로 cache 의 해당 employee 를 갱신 → UI 즉시 리렌더.
    2. **신규 생성** (list 에 추가): mutation `update` 함수에서 `cache.modify` 로 해당 list field 의 refs 배열에 새 entity ref 를 prepend / append. 예: `mealEmployeeCreate` → `mealEmployeesByCorporate` 리스트에 신규 추가.
    3. **삭제** (list 에서 제거): mutation `update` 함수에서 `cache.modify` 로 list 의 refs 배열에서 해당 ref 를 필터링 + `cache.evict({ id: cache.identify(deleted) })` 로 normalized cache 에서도 제거.
    4. **연관 entity 동시 변경** (예: 퇴사 → wallet status 변경 + funding entry 추가 + employee status 변경): 서버가 한 mutation 으로 **모든 영향받은 entity** 를 한 응답 안에 반환 → Apollo 가 각 entity 를 자동 갱신. 서버 mutation 설계는 이 패턴에 맞춰 `{ employee, wallet, expiredFundingEntry }` 형태로 return.
  - `optimisticResponse` 는 단건 update / 단순 toggle 에만 사용 (예: 머천트 allowlist 토글). 복잡한 연쇄 변경에는 사용하지 않고, 단순히 서버 응답을 기다린다.
  - **금지 패턴**: `mutation.refetchQueries = [{ query: ListQuery }]`, `client.refetchQueries({ include: [...] })`, `window.location.reload()`, `router.refresh()` 를 mutation 이후에 호출하는 것 — 모두 사용 금지.
  - **금지 이유**: (1) 서버 네트워크 / DB 부하 낭비 (2) UX 지연 (refetch 완료까지 stale UI) (3) race condition 가능성 (refetch 도중 사용자가 추가 액션).
  - **단, 다음 경우에만 예외적으로 refetch 허용**: (a) 서버 측에서 mutation 결과로 정확한 entity 목록을 반환하기 어려운 집계 쿼리 (예: 대시보드 KPI, forecast) — 이 경우에도 mutation 직후가 아니라 사용자가 명시적으로 "새로고침" 버튼을 누를 때 또는 page focus 이벤트에 반응. (b) Subscription 이 없는 실시간 상태 (예: 인보이스 상태 변화 polling). (a)/(b) 외에는 refetch 사용 금지.

### 16.3 네트워크 오류 복구

- `RetryLink`: 일시적 네트워크 오류 3회 자동 재시도 (exponential backoff)
- `ErrorLink`: 401 → refresh token 시도 → 실패 시 `/login`
- 500 / 503 → 사용자에게 에러 토스트 + "재시도" 버튼
- 네트워크 complete 끊김 → 오프라인 배너 + 쿼리 큐잉 (복구 시 재시도)

### 16.4 Race condition / 동시 편집

- **낙관적 잠금**: `updatedAt` 을 mutation input 에 포함 → 서버가 mismatch 감지 시 `409 CONFLICT` 반환
- 화면에 "다른 사용자가 이 항목을 수정했습니다. 새로고침 후 다시 시도하세요" 모달
- 정책 publish 같은 critical mutation 은 서버 측에서 advisory lock (Redis)

### 16.5 Pagination

- 모든 리스트는 **keyset pagination** (offset 금지)
- `cursor: string | null` + `limit: number` (default 25, max 100)
- Next/Previous 양방향 커서
- 대시보드 위젯은 `limit: 10` 고정

### 16.6 Request Deduplication

- 같은 query 가 500ms 내에 여러 번 발송되면 Apollo가 dedupe
- `useQuery` 의 `skip` 옵션으로 조건부 skip
- 대시보드의 10개 위젯 query 는 가능하면 1개 batched query 로 통합

### 16.7 Large List 최적화

- 5000명 이상 임직원 리스트: virtual scroll (`@tanstack/react-virtual`)
- 큰 테이블: sticky header + sticky first column
- 이미지 lazy load (`loading="lazy"`)

### 16.8 Core Web Vitals 목표 / 측정

| 지표 | 목표 (p75) | 측정 방법 |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Next.js Analytics + Web Vitals API |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 동일 |
| **INP** (Interaction to Next Paint) | < 200ms | 동일 |
| **TTFB** (Time to First Byte) | < 800ms | Next.js Server Components 사용 시 |
| **초기 JS bundle (gzip)** | < 250KB | `@next/bundle-analyzer` CI 리포트 |
| **Apollo 쿼리 응답 p95** | < 500ms (cached) / < 1.5s (network) | Apollo Link 측 latency 측정 |
| **대시보드 첫 페인트** | < 1.5s (cache) / < 3s (network) | 10개 위젯 병렬 fetch 기준 |
| **리포트 (3개월 집계)** | < 3s (1000명 corporate) / < 8s (10000명) | §11.4 |

### 16.9 DB 인덱스 설계 (클라이언트 관점 필요 인덱스)

서버 (CentralApi) 에 반드시 존재해야 하는 인덱스 — 포털 쿼리 성능의 전제 조건:

| 인덱스 | 대상 쿼리 | 현재 상태 |
|---|---|---|
| `MealTransaction(corporateId, status, createdAt DESC)` | 거래 리스트 + 기간 필터 | ✅ 이미 존재 (`idx_meal_tx_corp_status_time`) |
| `MealTransaction(corporateId, brandHqId, status, createdAt DESC)` | 대시보드 인기 머천트 | ✅ 이미 존재 (`idx_meal_tx_tenancy`) |
| `MealTransaction(walletId, createdAt DESC)` | 임직원 상세 거래 탭 | ✅ 이미 존재 (`idx_meal_tx_wallet_time`) |
| `MealTransaction(branchId, status, createdAt DESC)` | 머천트별 이용 통계 | ✅ 이미 존재 (`idx_meal_tx_branch_status_time`) |
| `MealEmployee(corporateId, departmentId)` | 임직원 리스트 + 부서 필터 | ✅ 이미 존재 (`idx_meal_emp_corp_dept`) |
| `MealWallet(corporateId, status)` | 대시보드 지갑 분포 | ✅ 이미 존재 (`idx_meal_wallet_corp_status`) |
| `MealPolicy(corporateId, status)` | 정책 리스트 | ✅ 이미 존재 (`idx_meal_policy_corp`) |
| `MealConsolidatedEInvoice(corporateId, status)` | 인보이스 리스트 + 상태 필터 | ✅ 이미 존재 (`idx_meal_invoice_corp_status`) |
| `MealConsolidatedEInvoice(providerType, status, createdAt DESC)` | SuperAdmin 모니터링 | ✅ 이미 존재 (`idx_meal_invoice_provider_status_time`) |
| `MealConsolidatedEInvoice(refId)` UNIQUE | 멱등성 dedupe | ✅ 이미 존재 (`uq_meal_invoice_ref_id`) |
| **`MealConsolidatedEInvoice(status, reviewDueAt)` WHERE status='DRAFT'** | **SyncWorkers 7일 자동 승격 cron** | ❌ 신규 필요 (F-4b migration 에 추가) |
| **`MealCorporateMerchantAllowlist(corporateId, isAllowed)`** | allowlist 리스트 + 필터 | ❌ 신규 필요 (F-4a migration 에 추가) |
| **`MealCorporateMerchantAllowlist(corporateId, branchId)` UNIQUE** | 단건 토글 조회 | ❌ 신규 필요 |
| **`MealTicketWalletFundingEntry(walletId, sourceType, status, createdAt DESC)`** | 원장 keyset pagination + 필터 | 확인 필요 |
| **`MealTicketWalletFundingEntry(walletId, status, effectiveToAt)` WHERE status='POSTED'** | 월말 자동 만료 cron + "소멸 예정" 대시보드 위젯 | ❌ 신규 필요 |
| **`AuditLog(targetType, targetId, createdAt DESC)`** | 임직원/인보이스 상세 감사 탭 | ✅ 이미 존재 (partition 별) |
| **`Branch(lat, lng)` GIST** | `/merchants` View B Bounding Box 쿼리 | ❌ 신규 필요 — `Branch` 테이블에 `lat` / `lng` (decimal) 컬럼 추가 + PostGIS `CREATE INDEX ... USING GIST (ST_MakePoint(lng, lat))` (또는 단순 `(lat, lng)` btree) |
| **`MealTicketWalletFundingEntry(walletId, status, effectiveToAt ASC, createdAt ASC) WHERE status='POSTED' AND sourceType='COMPANY_ALLOWANCE'`** | §9.4.1 FIFO 소진 쿼리 | ❌ 신규 필요 — FIFO 소진 시 매 거래마다 실행되므로 인덱스 필수 |
| **`MealTransactionAllowanceUsage(transactionId)` + `(fundingEntryId)`** | 거래 ↔ Lot 역추적 | ❌ 신규 필요 |
| **`MealEmployee(corporateId, isExternalSync)`** | HRIS 동기화된 임직원 필터 | ❌ 신규 필요 |

> 클라이언트 배포 전에 위 인덱스가 서버에 생성되어 있는지 DBA 체크리스트로 확인. 누락 시 키셋 페이지네이션 쿼리가 full table scan 으로 퇴화.

### 16.10 N+1 query 방지

- 서버 (CentralApi) 는 모든 관계 fetch 에 **DataLoader** 사용 (request-scoped batch loading)
- 포털 관점에서 N+1 감지: Apollo DevTools 의 query 탭에서 동일 쿼리 여러 번 호출 여부 확인
- CI 의 `scripts/check-n-plus-one.mjs` — 테스트 시 `prisma-query-inspector` 로 SQL 횟수 모니터링 (P1)
- 리스트 + 각 항목 상세를 동시에 필요로 하면, 서버가 한 쿼리에서 nested fetch 하도록 resolver 설계. 클라이언트가 각 행마다 추가 쿼리 쏘지 않음.

### 16.11 Large payload 최적화

- GraphQL 응답이 100KB 초과하면 서버가 `gzip` (Apollo Server 기본) + Brotli 옵션
- 대시보드 집계 쿼리는 서버에서 이미 합계/그룹만 반환 (raw row 금지)
- 인보이스 상세의 라인이 500 초과 (BY_MERCHANT 전략) 시 라인은 별도 paginated query 로 분리 (`mealInvoiceLinesByInvoice(invoiceId, cursor)`)

---

## 17. 관측성 / 로깅 / 모니터링 (Observability)

### 17.1 클라이언트 측 텔레메트리

- **에러 추적**: Sentry (또는 유사 — 최종 결정은 §23 D-17). React Error Boundary + Apollo ErrorLink 에서 자동 캡처. 사용자 PII 는 필터링 후 전송.
- **성능 추적**: Web Vitals API (`@vercel/analytics` 또는 직접 구현) — LCP/CLS/INP/TTFB 를 p75/p95 로 집계
- **사용자 action 추적** (P1): 주요 mutation 호출 / 화면 진입 이벤트를 구조화 로그로 전송 (단 PII 제외)
- **샘플링**: 일반 event 10% / 에러 100% / 느린 query (>2s) 100%

### 17.2 구조화 로그 규칙

클라이언트 `console.log` / `console.error` 직접 호출 금지. 대신 `shared/logger.ts` 래퍼 사용:

```typescript
// 개념 예시 — 실제 구현은 Phase 0 F-16
logger.info('screen.enter', { screen: 'invoices', corporateId });
logger.error('mutation.failed', { operation: 'requestIssuance', code, requestId });
logger.warn('slow.query', { operation: 'mealEmployeesByCorporate', ms });
```

- **필수 필드**: `event`, `timestamp`, `sessionId`, `userId` (있을 때), `scopeCorporateId`, `requestId`
- **금지 필드**: 비밀번호, 전화번호, 이메일 전체, 배지 RFID 전체 (마지막 4자리만)
- **로그 레벨**: DEBUG (dev only) / INFO (정상 동작) / WARN (복구 가능 에러) / ERROR (사용자에게 영향) / FATAL (세션 중단)

### 17.3 서버 correlation

- 모든 GraphQL 요청에 `X-Request-Id` 헤더 자동 생성 (uuid v4)
- 서버 응답의 `error.requestId` 를 클라이언트 로그에 포함 → SuperAdmin 이 서버 로그 grep 으로 추적 가능
- Apollo Link 에서 자동 주입, 사용자가 코드 작성 필요 없음

### 17.4 모니터링 대시보드 (운영)

- **서버 측** (SuperAdmin/CentralApi 책임): Grafana + Prometheus + Loki
  - p95 latency (query/mutation 별)
  - 에러율 (status code 별)
  - DB query 시간 / connection pool 사용률
  - Redis hit/miss rate
  - SyncWorkers job 실행 / 실패
- **클라이언트 측**: Sentry Performance + Web Vitals
  - 화면별 LCP/CLS/INP
  - JS 에러 trends
  - API 에러 trends
- **비즈니스 지표** (§11 리포트 연계): 월간 인보이스 ACCEPTED 비율, Corporate 검토 평균 소요 시간, 자동 승격 비율

### 17.5 Alerting 정책

| 알림 | 임계 | 받는 주체 |
|---|---|---|
| API 에러율 > 5% (5분간) | CRITICAL | oncall SRE |
| 인보이스 발행 실패 > 10% (1시간) | CRITICAL | SA + oncall |
| 7일 자동 승격 비율 > 30% | WARN | 서비스 책임자 (Corporate 검토 UX 개선 필요 신호) |
| 대시보드 LCP p75 > 4s | WARN | Frontend 책임자 |
| Corporate 로그인 실패율 > 20% (1시간) | WARN | 보안팀 |
| DB connection pool > 80% | WARN | DBA |

---

## 18. 유지보수 / 운영 (Maintainability & Operations)

### 18.1 버전 관리 / 호환성

- **SharedContracts 변경 시 호환성 원칙**:
  - **Breaking change**: operation 제거 / 필드 제거 / 타입 변경 — major version bump (0.x → 1.0 → 2.0). 모든 consumer (Portal, BrandAdminPortal, BrandPosApp, SyncWorkers) 를 동시에 배포.
  - **Non-breaking**: 새 operation 추가 / 기존 타입에 optional 필드 추가 — minor version bump. 각 consumer 가 자기 페이스로 업그레이드.
  - **Deprecation**: 필드에 `@deprecated` directive + 90일 grace period → 이후 제거.
- **Prisma migration 규칙**:
  - 파일명: `YYYYMMDDHHMMSS_short_description` (예: `20260408104500_meal_einvoice_consolidated_mode`)
  - `IF NOT EXISTS` / `IF EXISTS` 전제 → 재실행 안전
  - Breaking migration (컬럼 타입 변경, FK 재구성) 은 3 단계로 나눔: ① 신규 컬럼 추가 ② 데이터 백필 ③ 기존 컬럼 제거 (3번은 다음 배포에)
- **Next.js / React 버전 업그레이드**: major bump 는 QA 전체 회귀 테스트 후 적용. Next.js 16 → 17 전환 시 App Router 변경 사항 전수 검토.

### 18.2 Feature flag / 점진 배포

- **Feature flag** (P1+): 신기능은 flag 뒤에서 점진 배포. `@core/entitlement` 의 `BrandHqEntitlement` 와 구분 — 사용자 가시성 flag 는 `FeatureFlag` 테이블 별도 운영 (server-side).
- **환경별 분기**: `NEXT_PUBLIC_ENV=development|staging|production` + `scripts/check-env.mjs` 로 production 에서 dev-only 코드가 들어가지 않도록 빌드 시 검증
- **Canary 배포**: Vercel 또는 k8s + Istio 로 10% → 50% → 100% 점진 트래픽 이관 (P2)

### 18.3 문서화 / 온보딩

- **Storybook**: SharedUI 컴포넌트 카탈로그 — CorporatePortal 개발자가 가용 variant 확인용 (P1)
- **Design docs**: BrandPosApp 의 `design-docs` 패턴 (`app/design-docs/`) 을 CorporatePortal 에도 적용 (P2)
- **코드 커멘트**: CLAUDE.md 규칙 따름 — "logic 이 self-evident 하지 않은 곳에만". 파일 상단에 한국어 + 베트남어 목적 설명 (BrandPosApp 규칙 상속)
- **README.md**: 로컬 실행 / env 변수 목록 / 첫 로그인 / codegen 재생성 방법 / 자주 겪는 문제 5개

### 18.4 CI / CD 파이프라인

- **PR 검증** (GitHub Actions `corporate-portal.yml`):
  1. `npm ci`
  2. `npm run codegen` → diff 확인 (산출물 커밋되었는지)
  3. `npm run typecheck`
  4. `npm run lint`
  5. `scripts/check-corporate-portal-rules.mjs` (custom rule)
  6. `npm run build` (Next.js 빌드 + bundle size 체크)
  7. `npm run test:unit` (도메인 로직)
  8. `npm run test:e2e` (Playwright, P0 시나리오 6건)
  9. Sentry source map 업로드 (production 브랜치만)
- **배포**: `main` 브랜치 merge → staging 자동 배포 → QA pass → production (수동 승인)
- **Rollback**: `git revert` + 자동 재배포. 핵심 cron job (einvoice 관련) 은 수동 rollback 전 영향 분석 필수

### 18.5 의존성 업데이트 정책

- **Security patch**: 즉시 (Dependabot alert 기준 P0)
- **Minor/patch**: 2주 주기 (Renovate bot, auto-merge 가능 한정)
- **Major**: 분기 1회 계획 검토. Next.js / React / Apollo / Prisma 는 upgrade PR 단독으로 QA 전체 회귀
- **Breaking change 감지**: CI 가 package-lock.json diff 검사 + changelog 자동 수집

### 18.6 런북 (Runbook)

다음 장애 시나리오에 대해 `docs/runbook/` 에 단계별 대응 매뉴얼 작성 (P1):

1. **CentralApi 다운** → Portal 의 에러 메시지 가이드 + SuperAdmin 긴급 연락
2. **WeTax 다운** → 인보이스 발행 지연 발생 시 Corporate 안내 문구 + SuperAdmin 큐 모니터링
3. **Redis 다운** → Apollo in-memory fallback 동작 확인
4. **Google Maps API quota 초과** → `/merchants` View B 임시 비활성 + 리스트 뷰 강제 전환
5. **DB 연결 실패** → read replica 전환 여부 + 읽기 전용 모드 UX
6. **월초 cron 실패** → 수동 트리거 + Corporate 에 검토 마감 연장 안내
7. **대량 로그인 실패** → 보안 사고 의심 → 토큰 강제 만료 + 비밀번호 재설정 요청

### 18.7 Graceful degradation

- **실시간 알림 (subscription) 다운** → polling 으로 자동 전환 (30초 간격)
- **지도 (Google Maps) 다운** → 리스트 뷰만 표시 + 배너 "지도가 일시적으로 사용 불가합니다"
- **차트 라이브러리 dynamic import 실패** → 숫자 요약만 표시
- **i18n 번역 누락** → 영어 fallback (ko → en → vi 순)
- **권한 쿼리 실패** → 읽기 전용 모드 (`corporate.*.read` 만 가정)

---

## 19. 확장성 / 스케일링 (Scalability)

### 19.1 스케일링 축

| 축 | 현재 가정 | Phase 2 목표 | Phase 3 목표 |
|---|---|---|---|
| **Corporate 수** | 10~100 | 500 | 5,000+ |
| **Corporate 당 임직원 수** | 10~500 | 5,000 | 50,000+ |
| **일일 거래 건수** | 100~1,000 | 50,000 | 500,000+ |
| **동시 접속 관리자** | 5~50 | 500 | 5,000+ |
| **월간 발행 인보이스 수** | 10~100 | 500 | 5,000+ |
| **인보이스당 라인 수** | 10~50 | 200 | 1,000+ |
| **인보이스당 sourceTransactionCount** | 500~5,000 | 50,000 | 500,000+ |

### 19.2 수평 확장 전략

- **Portal (Next.js)**: Stateless → k8s Deployment + HorizontalPodAutoscaler. 세션은 JWT 기반 (메모리 없음) → pod 수 자유 증가
- **CentralApi (NestJS)**: Stateless 원칙. Redis 로 분산 cache + pub/sub → pod 수 자유 증가. DB connection pool 을 pod 수에 비례해 조정 (`DATABASE_POOL_SIZE / pods`)
- **SyncWorkers**: 단일 leader 필요 작업 (cron) 은 Redis 분산 락으로 중복 방지. 나머지 worker 는 BullMQ concurrent consumer 로 수평 확장
- **DB (PostgreSQL)**: primary + read replica 2개 (P1). 읽기 쿼리는 replica 로 라우팅 (Prisma read/write split P2)
- **Redis**: Redis Sentinel 또는 Redis Cluster (P2)

### 19.3 대용량 corporate 대응 (임직원 50,000+)

- **임직원 리스트**: keyset pagination + virtual scroll → 클라이언트 메모리 O(pageSize)
- **Wallet batch 생성**: 신규 corporate 입사자 10,000명 일괄 → SyncWorkers 가 1000명 chunk 로 나눠 처리
- **월초 포인트 충전 배치**: Corporate 당 임직원 수에 비례 → 10,000명 corporate 는 최대 5분, 50,000명은 30분 소요 가정 (BullMQ priority queue 로 스케줄링)
- **인보이스 합산**: 500,000 transaction 을 스트림 쿼리 (Prisma cursor) 로 합산 → 메모리 O(groupCount), 단일 pass
- **검토 화면**: 라인 1,000 초과 → virtual scroll + server-side paging

### 19.4 멀티 provider / 멀티 corporate / 멀티 country 확장

| 확장 축 | 현재 | Phase 4+ 확장 방안 |
|---|---|---|
| **e-Invoice provider** | WeTax 전용 | `EInvoiceProvider` 테이블 + `EInvoiceProviderConfig` 환경별 분기 (이미 DB 설계) → Bizzi / Misa / GDT-Direct 추가는 `_internal/` 에 구현체만 추가 |
| **Corporate 스코프** | 1 admin = 1 corporate | P2 — 같은 email 로 여러 `UserRoleAssignment` (서로 다른 `scopeCorporateId`) 허용 + TopBar 에 corporate 스위처 |
| **Country** | 베트남 전용 | Phase 5+ — `PlatformLegalEntity` 에 country 분기 추가 + e-Invoice provider 별 country 매트릭스 + i18n 확장 (예: 한국 KR, 인도네시아 ID) |
| **Currency** | VND 전용 | Phase 5+ — `Currency` 참조 테이블 + `unitPriceVnd` → `unitPrice` + `currencyCode` 로 일반화 |
| **Payment provider** | ZaloPay / MoMo / VNPay | Phase 3+ — provider interface 추상화 |

### 19.5 데이터 retention / archive

`MealTransaction`, `AuditLog`, `EInvoiceSubmissionLog`, `SyncOutbox` 등 append-only 테이블의 retention 정책 (CLAUDE.md 의 기준):

| 테이블 | 파티션 주기 | Retention | Archive 대상 |
|---|---|---|---|
| `MealTransaction` | 월 | 60개월 (세무 5년) | 60개월 초과 → cold storage (S3) |
| `AuditLog` | 월 | 24개월 | 24개월 초과 → S3 Glacier |
| `EInvoiceSubmissionLog` | 월 | 24개월 | 동일 |
| `SyncOutbox` | 월 | ACKED 30일 / FAILED 수동 | 30일 초과 ACKED → purge |
| `MealTicketWalletFundingEntry` | 월 | 60개월 (세무) | 60개월 초과 → S3 |
| `MealConsolidatedEInvoice` | (파티션 없음, 월별 row 수 적음) | **영구 보존** (베트남 세무 요건) | archive 없음 |

> 포털은 기본적으로 최근 24개월 데이터만 조회. 그 이전은 "archive 조회" 별도 UI (P2) 에서 느린 쿼리 허용.

### 19.6 비용 관리

- **Google Maps API**: 월간 무료 할당량 초과 시 quota 알림. Places / Geocoding / Distance Matrix 별 예산 설정. 캐싱 (Redis 24h) 으로 중복 호출 최소화
- **WeTax provider**: 건당 과금 가능성 → 발행 수 모니터링 + SuperAdmin 대시보드에서 월간 발행 수 / 예상 비용 표시
- **Sentry**: event 수 기반 과금 → 샘플링 비율 조정 가능
- **Cloud infra (k8s)**: HPA 정책 — 평일 점심 시간 (11~14h) 에 2배 스케일, 야간 50% 축소

### 19.7 Generic EInvoice 추상화 로드맵 (Phase 4+)

> **미래 확장 — 식권 외 다른 도메인으로 e-Invoice 기능 확장**: 현재 `MealConsolidatedEInvoice` 는 식권 도메인 전용이지만, 플랫폼이 물류 / 자재 / 복지 외 서비스로 확장될 때 동일한 "월별 통합 인보이스 + Corporate 검토 + SuperAdmin 발급" 워크플로우가 재사용될 수 있다. 이를 위해 Generic EInvoice 추상화 계획을 남긴다.

#### 19.7.1 Generic Schema 전략

현재 단계에서 **premature abstraction 은 금지**. `MealConsolidatedEInvoice` 를 그대로 식권 전용으로 구현한 뒤, 2번째 도메인 (예: 물류) 의 인보이스 요구사항이 나왔을 때 **공통 패턴을 추출하여 `GenericConsolidatedEInvoice` 베이스 모델** 로 리팩토링. 이때 원칙:

| 원칙 | 세부 |
|---|---|
| **Snapshot 보존** | 발행 시점의 seller / buyer / 라인 / 금액 / vat / provider response 는 **immutable snapshot** 으로 유지. 재무 감사 목적이므로 나중에 원본 데이터가 변경되어도 인보이스는 과거 시점으로 복원 가능해야 한다. |
| **Status 머신 재사용** | `DRAFT / DISPUTED / REQUESTED / SUBMITTING / ACCEPTED / REJECTED / VOIDED` 7 상태는 도메인 불문 재사용 가능. `GenericEInvoiceStateMachine` 으로 추출. |
| **Consolidation 전략 추상화** | `BY_MERCHANT / BY_DAY / BY_DEPARTMENT / BY_CATEGORY / SINGLE_LINE` 5 전략 중 일부는 도메인 독립적 (`BY_DAY / BY_DEPARTMENT / SINGLE_LINE`). 일부는 도메인 특화 (`BY_MERCHANT` 는 식권, `BY_SKU` 는 자재). 추상 전략 인터페이스 + 도메인별 구현체. |
| **Provider 추상화 재사용** | `EInvoiceProvider` 인터페이스는 이미 도메인 독립적 (WeTax / Viettel / MISA / DIRECT_GDT). 식권 도메인의 provider wiring 을 그대로 물류 도메인에서도 재사용. |
| **Portal 컴포넌트 재사용** | 인보이스 리스트 / 상세 / 발행 요청 / 이의 제기 UI 는 **도메인 무관 공용 컴포넌트** 로 추출 가능. CorporatePortal 에 구현한 후 향후 다른 포털도 import. |

#### 19.7.2 Meal* 접두사 제거 로드맵 (Phase 4+)

**현재 상태**: DB 모델 / DTO / operation 이름 모두 `Meal*` 접두사 사용 (`MealConsolidatedEInvoice`, `MealEmployee`, `MealCorporate`, `mealInvoicesByCorporate`, `mealEmployeesByCorporate` 등).

**문제점**: 플랫폼 지향점이 "식권" 을 넘어 "복지 플랫폼 / 법인 비용 관리" 로 확장될 때 `Meal*` 접두사는 의미 축소 편향.

**해결 로드맵 (단계적)**:

1. **Phase 4** — `Meal*` 접두사는 그대로 유지하되, **생성되는 새 도메인** (예: 자재 / 물류 / 교통) 은 `Meal*` 없이 일반 용어 사용 (`Consolidated`, `Employee`, `Department` 등 네임스페이스 분리)
2. **Phase 5** — `Meal*` 접두사 deprecation 공지 + alias 생성 (DB 에는 기존 테이블 유지, TypeScript 에만 re-export). consumer 는 90일 유예 기간 안에 import 변경
3. **Phase 6** — 실제 테이블 rename (`MealConsolidatedEInvoice` → `ConsolidatedEInvoice`). Prisma migration + data migration + 모든 consumer 한꺼번에 배포. Breaking change.

**긴급도**: 낮음. 지금은 Phase 0~3 기능 구현이 우선. Meal* 는 "플랫폼이 정말 식권 외로 확장되는 시점" 에 재검토.

**대신 Phase 0~3 동안 지킬 원칙**:
- 새 기능을 만들 때 도메인 독립적 용어 선호 (`CorporateAdminUser`, `EInvoiceProvider`, `PlatformLegalEntity` 같은 이미 중립적인 이름은 그대로)
- `Meal*` 접두사가 붙은 엔티티는 **식권 도메인 핵심 리소스** 에만 한정 (`MealCorporate`, `MealWallet`, `MealTransaction` 등). 주변 유틸리티 / infra 는 `Meal` 없이 작성.

---

## 20. 인증 / 세션

### 20.1 로그인 흐름

1. 사용자가 `/login` 에서 `loginId + password` 입력
2. `mealCorporateLogin(loginId, password)` mutation 호출 (신규 operation)
3. 응답: `accessToken`, `refreshToken`, `CorporateAdminUser`, `MealCorporate`
4. `accessToken` 은 memory (Apollo link context), `refreshToken` 은 **httpOnly secure cookie** (CentralApi 가 설정).
5. `providers/auth-provider.tsx` 가 session context 유지, `useCurrentSession()` 훅 제공.
6. Middleware `src/middleware.ts` 가 `/login` 외 모든 route 에 대해 session 유무 확인, 없으면 `/login` redirect.

### 20.2 토큰 갱신

- `accessToken` 유효기간 15분, `refreshToken` 유효기간 7일.
- 401 응답 시 `mealCorporateRefreshToken` mutation → 새 accessToken 재주입 → 원래 요청 재시도.
- 2회 연속 refresh 실패 시 강제 로그아웃 + `/login?expired=1`.

### 20.3 멀티 세션

- **1 admin 계정 = 1 corporate** (CorporateAdminUser 가 단일 corporateId FK 를 가짐). 멀티 tenant 스위처는 없음.
- 단, 한 사람이 다른 회사의 관리자이기도 하다면, 별도 계정으로 가입 (현재 DB 제약).

---

## 21. 테스트 / 검증 전략

### 21.1 타입 안전성

- `npm run typecheck` — tsc strict 통과
- `npm run codegen` — CentralApi schema 변경 시 operation type 재생성
- Apollo `useQuery`, `useMutation` 은 codegen 된 typed hook 만 사용, `gql` 문자열 리터럴을 직접 쓰지 않는다.

### 21.2 E2E 테스트 (P0 범위)

- Playwright 도입 (`@playwright/test`). SuperAdmin/Portal 과 동일 설정.
- P0 시나리오:
  - 로그인 → 대시보드 진입
  - 임직원 추가 → 리스트에 표시됨
  - 정책 생성 → 리스트에 DRAFT 로 표시됨 → 활성화
  - 인보이스 리스트 조회 → 상세 진입 → PDF 다운로드 링크 노출
  - 로그아웃

### 21.3 단위 테스트

- 단위 테스트는 **도메인 로직** (allowance ledger 분리 계산, 정책 windows 중복 검증, VND 포맷터) 에만 적용. UI snapshot 테스트는 하지 않는다 (유지보수 비용 대비 효용 낮음).

### 21.4 Custom Rule (CI)

- `scripts/check-corporate-portal-rules.mjs`:
  - `BrandPosApp/PosUi/*` import 금지
  - 직접 `gql` 템플릿 리터럴 금지 (반드시 SharedContracts operation 경유)
  - `window.cefQuery` 호출 금지 (CorporatePortal 은 Web, CEF 없음)
  - raw color hex (`#[0-9a-f]+`) 금지 — tailwind token 만
  - 한/베/영 3개 언어 번역 키 누락 검사 (한 언어에 있는 키가 다른 언어에 없으면 실패)

---

## 22. Phase 별 Task 분해

아래는 **실제 실행 가능한** task 단위. 각 task 는 1 PR 로 머지 가능한 크기.

### Phase -1 — 서버 측 선행 작업 (Server Prerequisites)

> **CorporatePortal 구현 (Phase 0 F-2 이후) 에 착수하기 전 반드시 완료되어야 할 작업**. 이 Phase 의 결과물 없이 포털을 개발하면 mock 의존이 심해져 나중에 통합 단계에서 전면 재작업이 발생한다. 본 섹션은 "서버 선행 작업의 단일 체크리스트" 역할을 한다.
>
> **책임 프로젝트 범례**:
> - 🔴 `SuperAdmin/CentralApi` (NestJS + Prisma + PostgreSQL)
> - 🟠 `SuperAdmin/SyncWorkers` (BullMQ cron)
> - 🟡 `SharedContracts/ApiSdk` (공용 계약)
> - 🟢 `SuperAdmin/Portal` (SuperAdmin 운영자 UI)
> - ⚪ 운영 / DevOps / 계약 / 인프라
> - 🔵 `Shared` (`SharedUI`, DB 운영팀, QA)

---

#### SP-A. DB 스키마 & Migration (🔴 CentralApi)

CorporatePortal 모든 쿼리의 전제 조건. 이 단계가 끝나지 않으면 포털은 컴파일 자체가 되지 않는다.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-A1 | 🔴 `prisma/schema/70-mealticket.prisma` — `MealCorporate.addressFull` (varchar 500, nullable) 컬럼 추가 | 포털 §4.12 `/settings/company` / 인보이스 buyer snapshot | `prisma validate` + SANDBOX DB 반영 + sample row 저장 검증 |
| SP-A2 | 🔴 `MealCorporate.einvoiceConsolidationStrategy` (varchar 30, default `BY_MERCHANT`) 컬럼 추가 | 인보이스 생성 로직 + §4.12 탭 3 | 동일 |
| SP-A3 | 🔴 **`MealCorporate.einvoiceReviewDays`** (int, default 7, check 3~14) 컬럼 추가 | §4.9.2.c 7일 자동 승격 / §23 D-19 | 동일 |
| SP-A4 | 🔴 `MealConsolidatedEInvoice` 기본 12 필드 추가 (refId / cqtCode / formNo / serialNo / invoiceNo / lookupCode / transType / currencyCode / exchangeRate / paymentMethod / providerType / providerRequestJson / providerResponseJson) | 인보이스 상세 §4.10 | `prisma validate` + unique refId 제약 생성 |
| SP-A5 | 🔴 `MealConsolidatedEInvoice` 하이브리드 워크플로우 10 필드 추가 (reviewDueAt / requestedByAdminId / requestedAt / autoPromoted / disputedByAdminId / disputedAt / disputeReason / disputeResolvedAt / disputeResolvedByAdminId / sourceTransactionCount) | §4.9.2 상태 전이 + §4.10 섹션 0 액션 패널 | 각 FK / nullable 검증 |
| SP-A6 | 🔴 `MealConsolidatedEInvoice.status` enum 확장 (`DRAFT / DISPUTED / REQUESTED / SUBMITTING / ACCEPTED / REJECTED / VOIDED`). 기존 `BUILT` row 가 있으면 `DRAFT` 로 이관하는 data migration 포함 | 전체 인보이스 상태 머신 | `SELECT DISTINCT status FROM ...` 에서 BUILT 0건 확인 |
| SP-A7 | 🔴 `MealConsolidatedEInvoiceLine` 신규 모델 | 인보이스 상세 라인 항목 | `prisma validate` |
| SP-A8 | 🔴 `EInvoiceProvider` + `EInvoiceProviderConfig` + `EInvoiceSubmissionLog` 3개 모델 | 발급 인프라 | `prisma validate` |
| SP-A9 | 🔴 `PlatformLegalEntity` 신규 모델 (베트남 전용, country 분기 없음) | seller snapshot | `prisma validate` + unique code/taxCode 제약 |
| SP-A10 | 🔴 `MealCorporateMerchantAllowlist` 신규 모델 (`corporateId, branchId, enrollmentId, isAllowed, reason, updatedByAdminId, updatedAt`) | §4.8 머천트 토글 | `prisma validate` + unique (corporateId, branchId) |
| SP-A11 | 🔴 `MealTicketWalletFundingEntry.status` enum 에 `EXPIRED` 추가 + data migration (기존 POSTED/REVERSED 는 그대로) | §9.5 퇴사 자동 소멸 + 월말 만료 cron | enum 확장 확인 |
| SP-A12 | 🔴 **필수 인덱스 추가** (§16.9 표 — 신규 5개): `MealConsolidatedEInvoice(status, reviewDueAt) WHERE status='DRAFT'` / `MealCorporateMerchantAllowlist(corporateId, isAllowed)` / `MealCorporateMerchantAllowlist(corporateId, branchId) UNIQUE` / `MealTicketWalletFundingEntry(walletId, sourceType, status, createdAt DESC)` / `MealTicketWalletFundingEntry(walletId, status, effectiveToAt) WHERE status='POSTED'` | 포털 keyset pagination 성능 / cron job 성능 | `EXPLAIN ANALYZE` 로 인덱스 사용 확인 |
| SP-A13 | 🔴 **`MealCorporate.fundingModel` enum 확장** — 기본값 `UNASSIGNED` 추가 (`UNASSIGNED / PREPAID_DEPOSIT / CREDIT_NET15 / CREDIT_NET30`). 기존 row 는 현 상태 유지, 신규 row 는 `UNASSIGNED` 가 default | §4.6.0 SA 부여 flow | `prisma validate` + enum 검증 |
| SP-A14 | 🔴 **`MealCorporate` 신용도 평가 필드 추가**: `creditAssessmentStatus` (varchar 20, default `PENDING` — `PENDING / UNDER_REVIEW / APPROVED / REJECTED / SUSPENDED`), `creditAssessmentNotes` (text, nullable), `fundingPolicyGrantedAt` (timestamptz, nullable), `fundingPolicyGrantedByAdminId` (uuid → SuperAdminUser, nullable), `netTermDays` (int, nullable — 15 / 30 when CREDIT), `outstandingVnd` (bigint default 0 — CREDIT 모델의 현재 미지급 금액) | §4.6.0 / §9.4.5 | migration 확인 |
| SP-A15 | 🔴 **`MealCorporateFundingPolicyHistory` 신규 모델** — funding model 변경 이력 추적 append-only. `(id, corporateId, previousModel, newModel, previousLimit, newLimit, reason, changedByAdminId, changedAt, auditLogRef)` | 감사 추적 / §4.6.4 `mealFundingPolicyHistory` query | `prisma validate` |
| SP-A16 | 🔴 **`MealCorporateFundingDepositRecord` 신규 모델** — PREPAID 예치금 납입 기록 (은행 송금 → 포털 기록 → SA 승인). `(id, corporateId, amountVnd, depositedAt, depositMethod, referenceNumber, status [PENDING/POSTED/REJECTED], recordedByAdminId, approvedByAdminId?, approvedAt?, notes, receiptFileRef)` | §4.6.1 케이스 B 예치금 납입 기록 | `prisma validate` |
| SP-A17 | 🔴 **FIFO 포인트 Lot 모델** (§9.4) — `MealTicketWalletFundingEntry` 에 필드 확장: `remainingVnd` (bigint, default=amountVnd) / `carryoverCount` (int, default 0) / `sourceBatchId` (varchar 120, nullable — 원본 배치 추적) / `effectiveFromAt` + `effectiveToAt` (timestamptz) | §9.4 FIFO 소진 / 월말 만료 | 필드 생성 + 기존 row backfill |
| SP-A18 | 🔴 **`MealTransactionAllowanceUsage` 신규 join 테이블** — 한 거래가 여러 Lot 을 소비한 이력. `(id, transactionId, fundingEntryId, consumedVnd, consumedAt, lotCarryoverCount)`. 인덱스: `(transactionId)`, `(fundingEntryId)` | §9.4.1 FIFO 감사 추적 | `prisma validate` |
| SP-A19 | 🔴 **`MealEmployee.isExternalSync` 필드 신규** (boolean, default false) + `externalSyncSourceId` (varchar 120, nullable — 외부 HRIS 의 employee id 참조) + `externalSyncLastAt` (timestamptz, nullable) | §4.3 / §4.4 HRIS 수동 수정 차단 | 필드 생성 |
| SP-A20 | 🔴 **`MealCorporateDepartment.isExternalSync` 필드** (동일 구조) — 부서도 HRIS 에서 동기화 시 동일 가드 적용 | §4.2 HRIS 연동 부서 수정 차단 | 필드 생성 |
| SP-A21 | 🔴 **`Branch.lat` + `Branch.lng`** (decimal(9,6)) 컬럼 추가 + Google Geocoding 으로 기존 row 백필 + GIST 또는 btree 인덱스 `ON (lat, lng)` | §4.8 View B Bounding Box 쿼리 | 좌표 채워진 row 수 확인 + `EXPLAIN ANALYZE` 인덱스 사용 |
| SP-A22 | 🔴 **`MealCorporate` buyer 주소 분리 필드** (Viettel/MISA/WeTax 공통 요구사항, HJ-POS-TEST 이미지 1 기준) — 기존 `addressFull` 유지 + 신규: `addressCity` (varchar 100 — Tên Thành Phố) / `addressDistrict` (varchar 100 — Tên Quận) / `addressWard` (varchar 100 — Tên Phường/Xã) / `addressDetail` (varchar 300 — Địa Chỉ Chi Tiết). `addressFull` 은 4개 필드의 combined serialized 값 (trigger 로 자동 동기화) | Viettel S-Invoice buyer 필드 요구사항 / §4.12 / §5.3 | 주소 분리 저장 검증 |
| SP-A23 | 🔴 **`MealCorporate` 추가 연락/은행 필드** — `contactFax` (varchar 30 — Số Fax) / `bankAccountNumber` (varchar 50 — Số Tài Khoản Ngân Hàng) / `bankName` (varchar 200 — Tên Ngân Hàng). invoice buyer 블록에 표기 | Viettel / MISA buyer info 화면 | 필드 생성 |
| SP-A24 | 🔴 **`PlatformLegalEntity` 동일 분리 필드** — `addressCity` / `addressDistrict` / `addressWard` / `addressDetail` / `contactFax` / `bankAccountNumber` / `bankName`. seller snapshot 도 3 provider 요구 대응 | seller snapshot 생성 | 필드 생성 |
| SP-A25 | 🔴 **`EInvoiceProviderConfig.providerSpecificConfig` Json 필드 추가** — provider 별 고유 설정 담기 (§17.1.1 매트릭스):<br>`WETAX: { serialPrefix, formNo, serialType, currencyCode, exchangeRate, paymentMethod, storeCode }`<br>`VIETTEL: { invoiceType, templateCode, invoiceSeries, cusGetInvoiceRight, invoiceCluster }`<br>`MISA: { invoiceSeries, adjustmentInvoiceType, orgTaxAuthorityCode }`<br>기존 WeTax 전용 default* 필드는 유지 + `@deprecated` → `providerSpecificConfig` 로 점진 이관 | §17.1.1 공통화 전략 / Phase 4+ Viettel/MISA 구현 전제 | JSONB 필드 + provider type 별 runtime 스키마 검증 (P1 zod) |
| SP-A26 | 🔴 **Vault 경로 구조 문서화** — provider 별 credentials 경로 표준화: `vault://einvoice/{corporateId}/{providerType}/{env}/credentials`. WETAX: `{username, password, taxCode, storeCode}` / VIETTEL: `{username (taxCode-seq 형식), password}` / MISA: `{username, password}`. platform level (공통) 은 `vault://einvoice/_platform/{providerType}/{env}/credentials` | Phase 4 provider 통합 | vault 경로 문서 + 읽기 스크립트 테스트 |
| SP-A27 | 🔴 **`EInvoiceBuyerProfile` 신규 모델 (선택)** — Corporate 가 직접 인보이스를 발행하지 않으므로 식권 플랫폼에서는 필요 없지만, 향후 Corporate 가 자사 매장 POS 에서 일반 고객 인보이스를 발행하는 기능 확장 시 buyer catalog 가 필요. 현 Phase 에서는 **미구현 (skeleton 만)** 으로 두고 P4 로 연기 | 미래 확장 | (P4) |
| SP-A29 | 🔴 **§5.4 필드 매트릭스 전수 반영 — 3 provider 누락 필드 추가**:<br>• `PlatformLegalEntity.storeCode` (varchar 60, nullable) — WeTax store_code / Viettel sellerCustomerCode<br>• `PlatformLegalEntity.contactPhone` (varchar 30, nullable) — Viettel/MISA sellerPhoneNumber<br>• `PlatformLegalEntity.countryCode` (varchar 3, default `'VN'`) — Viettel sellerCountryCode<br>• `PlatformLegalEntity.website` (varchar 255, nullable) — MISA sellerWebsite<br>• `PlatformLegalEntity.displayNameEn` / `legalNameEn` (varchar 200, nullable) — 국제 invoice 대비 (P1)<br>• `MealCorporate.contactEmailCc` (varchar 500, nullable) — WeTax buyer_email_cc<br>• `MealCorporate.countryCode` (varchar 3, default `'VN'`) — Viettel buyerCountryCode<br>• `MealCorporate.budgetUnitCode` (varchar 60, nullable) — WeTax buyer_budget_unit_code (공공기관용)<br>• `MealConsolidatedEInvoice.notes` (varchar 500, nullable) — MISA invoiceNote / 일반 관리자 메모<br>• `MealConsolidatedEInvoiceLine.itemType` (varchar 2, default `'1'`) — MISA 확장 (1=HHDV / 2=promo / 3=discount / 4=note). Phase 1 은 항상 `'1'` 고정 | §5.4.6 누락 필드 전수 반영 | migration + 각 필드 값 검증 |
| SP-A30 | 🔴 Migration 파일 생성 + 커밋 + `prisma migrate deploy` SANDBOX 적용 | 모든 후속 작업 | `_prisma_migrations` 테이블 확인 |

#### SP-B. CentralApi RBAC & Seed (🔴 CentralApi)

포털의 모든 permission 기반 UI 는 이 seed 완료 후에만 의미가 있다.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-B1 | 🔴 `prisma/seed.ts` 에 **신규 Corporate 도메인 permission 5개** 추가: `corporate.merchant.allow.write` / `corporate.report.read` / `corporate.audit.read` / `corporate.admin.manage` / `corporate.funding.read.limit` | §4.13 Role matrix / §8.3.2 | `SELECT * FROM "Permission" WHERE domain='corporate'` |
| SP-B1a | 🔴 **기존 `corporate.invoice.*` permission 을 리소스 중심 `einvoice.*` 로 마이그레이션** (§23 D-26). 기존 seed 의 `corporate.invoice.read` / `corporate.invoice.write` 를 제거하고 아래 8개 `einvoice.*` permission 을 `domain='einvoice'` 로 신규 등록: `einvoice.read` / `einvoice.request.write` / `einvoice.dispute.write` / `einvoice.publish.write` / `einvoice.retry.write` / `einvoice.void.write` / `einvoice.revert.write` / `einvoice.dispute.resolve.write`. 기존 RolePermission 행은 rename 매핑으로 마이그레이션 (`corporate.invoice.read` → `einvoice.read` 등) | SuperAdmin / Corporate 공유 permission | `Permission WHERE domain='einvoice'` 8개 row 확인 + SA / Corporate 모두 read 가능 확인 |
| SP-B3 | 🔴 **4개 Corporate Role template** seed (`scope='CORPORATE', isSystem=true`): `CORPORATE_OWNER` / `CORPORATE_HR_ADMIN` / `CORPORATE_FINANCE_ADMIN` / `CORPORATE_VIEWER`. 각각 §4.13.4 매트릭스에 정의된 permission grant | 포털 RBAC 전체 | `SELECT * FROM "Role" WHERE scope='CORPORATE'` 확인 |
| SP-B4 | 🔴 Role × Permission 매핑 (`RolePermission` 테이블) seed — §4.13.4 매트릭스 한 줄 한 줄이 row 로 생성됨 | `useHasPermission` hook | 각 template 당 permission 수 검증 |
| SP-B5 | 🔴 `UserRoleAssignment` 의 `userType='CORPORATE_ADMIN'` + `scopeCorporateId` 축이 `PermissionService.getEffectivePermissions()` 에서 정상 평가되는지 테스트 | `mealCorporateAdminMe` 쿼리 | `jest` 테스트 통과 |
| SP-B6 | 🔴 **초기 PlatformLegalEntity row 1개** seed — 플랫폼 사업자의 실제 베트남 법인 정보 (`code='HYOJUNG_VN_HQ'` 또는 실제 값, `taxCode`, `legalName`, `addressFull`, `defaultSerialPrefix='C'`, `isActive=true`) | 인보이스 발급 seller snapshot | `SELECT * FROM "PlatformLegalEntity" WHERE "isActive"=true` 1건 |
| SP-B7 | 🔴 **초기 EInvoiceProvider row** seed (`providerType='WETAX'`, `isActive=true`) + `EInvoiceProviderConfig` SANDBOX row (`baseUrl='https://apitest.wetax.com.vn'`, `credentialsVaultRef='vault://wetax/sandbox/credentials'`) | provider 추상화 로직 | seed 확인 |
| SP-B8 | 🔴 **SuperAdmin 전용 funding policy permission 3개 seed**: `platform.corporate.fundingpolicy.write` (funding model 부여/변경) / `platform.corporate.credit.assess.write` (신용도 평가 업데이트) / `platform.corporate.deposit.approve` (예치금 납입 기록 승인) | SA 전용 flow | `Permission` 테이블 row 확인 |
| SP-B9 | 🔴 SuperAdmin role (`PLATFORM_SUPER_ADMIN` / `PLATFORM_SUPPORT_ENGINEER` 등) 에 위 3개 permission 부여 매핑 | SA 의 실제 mutation 가능 | `RolePermission` 확인 |
| SP-B10 | 🔴 Corporate role template (OWNER / HR_ADMIN / FINANCE_ADMIN / VIEWER) 에 위 3개 permission **절대 부여 금지** + seed 테스트로 회귀 방지 | 권한 격상 방지 | 매트릭스 검증 |
| SP-B11 | 🔴 기존 샘플 / 개발 corporate row 는 `fundingModel='UNASSIGNED'` / `creditAssessmentStatus='PENDING'` 으로 data migration (기본값) | 테스트 환경 | `SELECT DISTINCT "fundingModel" FROM "MealCorporate"` |

#### SP-C. CentralApi Corporate 도메인 Resolver / Service (🔴 CentralApi)

포털의 모든 GraphQL 쿼리는 여기서 먼저 존재해야 한다. **"resolver 없는 operation 을 포털이 먼저 작성하는 것은 금지"** — 항상 서버가 먼저, 포털이 나중.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-C1 | 🔴 `platform/corporate/profile` leaf 확장: `mealCorporateProfile` (me), `mealCorporateUpdate`, `mealCorporateDashboardSummary` | §4.1 / §4.12 | Playwright smoke + GraphQL playground |
| SP-C2 | 🔴 `platform/corporate/profile/department` sub-leaf 신규: `mealDepartmentsByCorporate / mealDepartmentDetail / mealDepartmentCreate / mealDepartmentUpdate / mealDepartmentMove (P1) / mealDepartmentDeactivate / mealDepartmentBudgetUpdate (P1) / mealDepartmentHrisSync (P2)` | §4.2 | 단위 테스트 + 순환 참조 검증 |
| SP-C3 | 🔴 `platform/corporate/profile/employee` sub-leaf 신규: `mealEmployeesByCorporate / mealEmployeeDetail / mealEmployeeCreate / mealEmployeeUpdate / mealEmployeeAssignBadge / mealEmployeeTerminate (자동 소멸 포함) / mealEmployeeBulk* (P1) / CsvExport / CsvImport` | §4.3 / §4.4 | 퇴사 자동 소멸 원자성 테스트 |
| SP-C4 | 🔴 `platform/corporate/profile/admin` sub-leaf 신규: `mealCorporateAdminsByCorporate / mealCorporateAdminDetail / mealCorporateAdminMe / mealCorporateAdminInvite / mealCorporateAdminGrantRole / mealCorporateAdminRevokeRole / mealCorporateAdminSuspend / mealCorporateAdminResume / mealCorporateRolePermissionMatrix` | §4.13 / §8.3 | OWNER 보호 테스트 (`CANNOT_DEMOTE_LAST_OWNER`) |
| SP-C5 | 🔴 `platform/corporate/policy` 확장: `mealPoliciesByCorporate / mealPolicyDetail / mealPolicyCreate / mealPolicyUpdate / mealPolicyPublish / mealPolicyPause / mealPolicyResume / mealPolicyDeactivate` + 상태 머신 enforcement | §4.5 | 상태 전이 테스트 |
| SP-C6 | 🔴 `platform/corporate/wallet` 확장: `mealFundingAccountByCorporate / mealBudgetSummary / mealBudgetByCategoryAndDepartment / mealBudgetForecast (P1) / mealCompanyAllowanceLoad (was Distribute) / mealCompanyAllowanceLoadSchedule / mealCompanyAllowanceLoadBatches / mealPersonalTopUpActivity / mealExpiringAllowanceDetail / mealWalletFundingEntries / mealTransactionsByWallet` | §4.6 / §4.7 / §4.4 | funding entry `EXPIRED` 자동 소멸 테스트 |
| SP-C7 | 🔴 `platform/corporate/merchant` 확장: `mealEnrolledMerchantsByCorporate / mealMerchantDetailForCorporate / mealMerchantMonthlyStatsForCorporate / mealCorporateMerchantAllowToggle / mealCorporateMerchantBulkToggle / mealCorporateMerchantCategoryBulkToggle / mealCorporateMerchantGeocode (P1)` | §4.8 | 서버 측에서 `corporate.merchant.enroll/commission.write/account.write` 는 SuperAdmin 전용임을 guard 테스트로 검증 |
| SP-C8 | 🔴 `platform/corporate/einvoice` 확장 — **Corporate 쪽 mutation**: `mealInvoicesByCorporate / mealInvoiceDetail / mealInvoiceDownloadPdf / mealInvoiceDownloadXml / mealInvoiceCurrent / mealConsolidatedInvoiceRequestIssuance / mealConsolidatedInvoiceDispute` | §4.9 / §4.10 | 상태 전이 가드 매트릭스 (§4.3.2.a) 테스트 |
| SP-C9 | 🔴 `platform/corporate/einvoice` 확장 — **SuperAdmin 쪽 mutation**: `publishConsolidatedInvoice / resolveDisputedInvoice / revertToDraft / retryPublish / voidConsolidatedInvoice` + `runEInvoiceConsolidationForCorporate` (SyncWorkers 호출용) | SuperAdmin/Portal + SyncWorkers | 각 mutation 의 permission guard 테스트 |
| SP-C10 | 🔴 `_internal/einvoice-consolidator.ts` 5 그룹화 함수 실구현 (`groupByMerchant / groupByDay / groupByDepartment / groupByCategory / groupSingleLine`) + `consolidated-publish-context.builder.ts` | 월초 cron | 각 전략별 테스트 + 엣지 케이스 |
| SP-C11 | 🔴 `_internal/wetax.client.ts` axios 실제 HTTP 구현 + `_internal/wetax.provider.ts` + `_internal/kyc-lookup.ts` 3-source fallback | provider 발급 | **SANDBOX 실제 호출 테스트** (apitest.wetax.com.vn) |
| SP-C12 | 🔴 **Mutation 응답 shape 규칙 준수**: 모든 mutation 이 영향받은 entity 의 full shape 을 반환 (§5.2). 특히 연쇄 변경 (`mealEmployeeTerminate` → employee + wallet + expiredFundingEntries) | 포털 refetch-free cache update 전략 (§16.2) | 각 mutation response 를 스키마 검사로 검증 |
| SP-C13 | 🔴 **상태 머신 guard enforcement**: 서버 단에서 `INVOICE_INVALID_STATE_TRANSITION` / `CANNOT_DEMOTE_LAST_OWNER` / `POLICY_INVALID_STATE_TRANSITION` 등 비즈니스 불변식 enforcement | 보안 + 데이터 무결성 | 각 전이 허용 매트릭스 (§4.3.2.a / §4.5.3) 테스트 |
| SP-C14 | 🔴 DataLoader 설정 — 리스트 쿼리의 N+1 방지 (employee → wallet / department 등 관계 로딩) | 성능 §16.10 | Apollo DevTools + query count 검증 |
| SP-C15 | 🔴 실시간 토픽 publisher: `corporate.einvoice.changed` / `corporate.transaction.changed` / `platform.einvoice.disputed` / `platform.einvoice.requested` / **`corporate.funding.policy.changed`** / **`corporate.funding.deposit.approved`** | §12 알림 (P1) | 이벤트 발행 테스트 |
| SP-C16 | 🔴 **Funding policy enforcement guard** — CentralApi 의 `corporate.wallet.fund` / `corporate.wallet.topup` / transaction authorize 에서 `corporate.fundingModel === 'UNASSIGNED'` 일 때 `FUNDING_MODEL_NOT_ASSIGNED` 에러, PREPAID 일 때 `depositBalanceVnd` 한도 검증, CREDIT 일 때 `outstandingVnd + newCharge ≤ creditLimitVnd` 검증 | §4.6.0 서버 측 enforcement | 각 model 별 단위 테스트 |
| SP-C17 | 🔴 **SuperAdmin 측 funding policy mutation 구현**: `platformAssignCorporateFundingPolicy` / `platformApproveFundingDeposit` / `platformSuspendCorporateFunding` / `platformUpdateCorporateCreditAssessment`. 각 mutation 에서 `MealCorporateFundingPolicyHistory` row 자동 생성 + AuditLog 기록 + Corporate OWNER 에 알림 | SP-F7 SA 화면 | 이력 row 생성 검증 + 알림 수신 |
| SP-C18 | 🔴 **Corporate 측 funding 요청 mutation**: `mealCorporateRequestFundingPolicyUpgrade` (현재 모델 / 원하는 모델 / 사유 / 제출 서류 ref) — 요청 기록 저장 + SA 에 이메일 / 알림. 실제 변경은 SA 의 mutation 으로만 발생. `mealFundingAccountDepositRecord` (PREPAID 예치금 납입 증빙 기록, status=PENDING) | §4.6.4 Corporate 측 mutation | 요청 → SA 승인 → 상태 전이 테스트 |
| SP-C19 | 🔴 **Transaction service enforcement**: 식권 결제 승인 시점에 `corporate.fundingModel !== 'UNASSIGNED'` + `corporate.status === 'ACTIVE'` 검증. UNASSIGNED / SUSPENDED 상태에서는 승인 거절 + `declineReason='FUNDING_SUSPENDED'` 반환 | §9.4.5 transaction 승인 가드 | BrandPosApp 거래 승인 테스트 |

#### SP-D. SyncWorkers Cron Jobs (🟠 SyncWorkers)

포털이 직접 호출하지는 않지만 UI 동작의 전제 조건.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-D1 | 🟠 `einvoice-consolidation.job.ts` 신규 — BullMQ scheduled job `0 0 1 * *` GMT+7. 모든 active corporate 순회 → CentralApi `runEInvoiceConsolidationForCorporate(corporateId, period)` mutation 호출. 실패 시 재시도 (exponential backoff 3회) + SA 알림 | §4.9 DRAFT 자동 생성 | 테스트 환경에서 수동 trigger 성공 |
| SP-D2 | 🟠 **`einvoice-auto-promote.job.ts` 신규** — BullMQ scheduled job `0 1 * * *` GMT+7 (매일 01:00). `MealConsolidatedEInvoice WHERE status='DRAFT' AND reviewDueAt < now()` 조회 → 자동 `REQUESTED` 전환 + `autoPromoted=true` + AuditLog + Corporate 알림 | §4.9.2.c 7일 자동 승격 | 테스트: 가짜 `reviewDueAt` overdue 로 설정 후 실행 검증 |
| SP-D3 | 🟠 **`meal-wallet-monthend-expire.job.ts` 신규** — 월말 23:59 GMT+7. 정책에 따라 미사용 `companyAllowanceVnd` 를 `EXPIRED` 처리 + funding entry 기록 | §9.4 월말 만료 | 테스트: 월말 시점 시뮬레이션 |
| SP-D4 | 🟠 `einvoice-retention-archive.job.ts` (P2) — 월 1회. 24개월 초과 `EInvoiceSubmissionLog` / `AuditLog` 를 S3 Glacier 로 archive + purge (§19.5) | 데이터 retention | |
| SP-D5 | 🟠 BullMQ Redis 연결 + 분산 lock (동시 실행 방지) + Sentry 에러 추적 | 모든 cron 안정성 | 2 replica 테스트에서 중복 실행 안 됨 확인 |
| SP-D6 | 🟠 Cron 실패 알림 — SA 관리자에게 Slack/email 경고 | 장애 대응 §18.6 | 실패 시뮬레이션 테스트 |

#### SP-E. SharedContracts (🟡 SharedContracts/ApiSdk)

포털이 import 하는 **단일 계약 원본**. SP-C 가 끝나야 이 단계를 시작할 수 있다.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-E1 | 🟡 `mealticket/dto.ts` — §5.3 표의 신규 DTO 전체 (9개+): `MealCorporateDepartment`, `MealEmployee`, `MealTicketFundingAccount`, `MealTicketConsolidatedEInvoiceLine`, 하이브리드 워크플로우 9 필드 포함 `MealTicketConsolidatedEInvoice` 확장, `CorporateAdminUser`, `MealCorporateMerchantAllowlist`, `CorporateEffectivePermissions`, `CorporateRolePermissionMatrix`, `CorporateLedgerEntry` (union), `CorporateDashboardSummary`, `CorporateBudgetForecast` | 포털 타입 전체 | `tsc --noEmit` 통과 |
| SP-E2 | 🟡 `mealticket/enums.ts` — §5.3 표의 신규 enum 13종: `MealTicketEInvoiceStatus` (7개 상태, BUILT 제거), `MealTicketEInvoiceConsolidationStrategy`, `MealTicketEInvoiceProviderType`, `MealTicketWalletFundingEntryStatus` (`EXPIRED` 포함), `MealTicketWalletFundingSourceType`, `MealTicketWalletStatus`, `MealTicketLoopType`, `MealTicketAuthMethod`, `MealTicketTxnStatus`, `MealTicketDeclineReason`, `MealTicketEmployeeEmploymentType`, `CorporateRoleCode`, `CorporatePermissionKey` (typed union) | 포털 enum import | 동일 |
| SP-E3 | 🟡 `mealticket/permissions.ts` 신규 — typed `CORPORATE_PERMISSIONS` 객체 (§8.3.5 예시) — 서버 seed 와 1:1 매칭 | `useHasPermission` | lint rule: 문자열 리터럴 직접 사용 금지 |
| SP-E4 | 🟡 `operations/corporate*.ts` 9개 파일 작성 — §5.1 표 전체 (profile / department / employee / policy / budget / ledger / merchant / einvoice / admin) | 포털 query / mutation 호출 | 각 operation 이 서버 schema 와 match 검증 |
| SP-E5 | 🟡 **Mutation 응답 shape 규칙 적용**: 모든 mutation 의 document 에서 영향받은 entity 의 완전한 field 선택 — refetch 없는 cache update 전략 (§16.2) 의 전제 | 포털 UX | golden 테스트: 각 mutation 이 full shape 반환 |
| SP-E6 | 🟡 `npm run build` 통과 (ESM dist 생성) + SemVer minor bump + persisted query manifest 자동 생성 통과 | 포털 F-7 | `dist/` 커밋 + manifest 파일 존재 |
| SP-E7 | 🟡 `ApiSdk` package 를 workspace 또는 local link 로 CorporatePortal 이 import 가능한 상태 | 포털 compile | `import { mealCorporateProfileOperation } from '@platform/api-sdk'` 가 타입 해석 |

#### SP-F. SuperAdmin/Portal (🟢 SuperAdmin/Portal)

CorporatePortal 과 독립적이지만, **발급자 검수 flow 가 SA/Portal 에 없으면 REQUESTED 인보이스가 영원히 쌓인다** → Corporate 사용자가 "왜 아직도 REQUESTED 에서 안 넘어가지?" 라고 문의하는 사태 발생.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-F1 | 🟢 SA-EINV-001 ~ 007 화면 구현 — DRAFT 큐 / DISPUTED 큐 / REQUESTED 큐 / 상세 / 재발행 / 실패 모니터링 / 감사 | Corporate 가 발행 요청 후 실제로 발급이 되도록 | SA 관리자 smoke 테스트 |
| SP-F2 | 🟢 기존 `SA-CORP-INV-001` (기업 인보이스 관리) 갱신 — provider 응답 / 상태 전이 표시 | SuperAdmin 감사 | |
| SP-F3 | 🟢 `PlatformLegalEntity` 관리 화면 — 법인 등록 / 변경 (새 row `ACTIVE` + 기존 row `isActive=false`) | 통합 인보이스 seller 변경 | smoke 테스트 |
| SP-F4 | 🟢 `EInvoiceProvider` / `EInvoiceProviderConfig` 관리 화면 — WeTax credentials 등록 (vault ref) / 활성화 / 환경 전환 | provider 교체 | |
| SP-F5 | 🟢 SuperAdmin 이 Corporate 의 **초기 OWNER 발급** 하는 flow — 기존 corporate 관리 화면 확장 (1 admin 원자적 발급 + UserRoleAssignment + 초대 이메일) | §4.13.1 최초 OWNER 발급 | E2E 시나리오 테스트 |
| SP-F6 | 🟢 마지막 OWNER 소실 시 긴급 복구 flow (SuperAdmin 만) | §8.3.4 / §27 Q12 | |
| SP-F7 | 🟢 **SA-CORP-FUND-001 (신규) — Corporate 신용도 평가 및 Funding Policy 부여 화면**. Corporate 목록 → 상세 → 재무 서류 업로드 / 평가 status 전환 / funding model 선택 (PREPAID / CREDIT_NET15 / CREDIT_NET30) / 한도 입력 (monthlyBudgetVnd / creditLimitVnd / netTermDays) / 메모 / 확정 → `platformAssignCorporateFundingPolicy` mutation. 권한: `platform.corporate.fundingpolicy.write` | Corporate 의 UNASSIGNED 해제 + 임직원 포인트 충전 가능 | 전체 flow E2E |
| SP-F8 | 🟢 **SA-CORP-FUND-002 — PREPAID 예치금 승인 화면**. Corporate 가 제출한 예치금 납입 기록 (status=PENDING) 리스트 → 은행 통장 대조 → 승인 → `platformApproveFundingDeposit` → status=POSTED + `depositBalanceVnd` 업데이트 | Corporate 가 예치금 확인 | approval flow |
| SP-F9 | 🟢 **SA-CORP-FUND-003 — Funding Policy 이력 / 한도 조정 화면**. 과거 변경 이력 (`MealCorporateFundingPolicyHistory`) 표시 + 한도 상향/하향 / 모델 변경 / 긴급 정지 (`platformSuspendCorporateFunding` → UNASSIGNED) 액션 | 운영 중 한도 조정 | 이력 추적 검증 |
| SP-F10 | 🟢 **SuperAdmin 대시보드 위젯** — 신용도 평가 대기 (PENDING) 건수 / 예치금 승인 대기 건수 / Credit 한도 경고 (80%+) / 연체 corporate 리스트 | 운영 가시성 | smoke 테스트 |
| SP-F11 | 🟢 **`/system/settings` 신규 route 생성** — Next.js App Router `SuperAdmin/Portal/src/app/system/settings/page.tsx` 신규. 탭 기반 컨테이너 (SharedUI `Tabs` 컴포넌트). URL query `?tab=xxx` 로 탭 활성 상태 유지 (페이지 새로고침 / 뒤로가기 보존) | §5.4 필드 매트릭스 반영 | `http://localhost:3001/system/settings` 접근 + 각 탭 전환 |
| SP-F11a | 🟢 **NavigationRail 에 `system.settings` nav 항목 추가** (`SuperAdmin/Portal/src/shared/layout/nav-items.ts`). `system` children 의 마지막에 `{ key: 'system.settings', labelKey: 'nav.system.settings', href: '/system/settings', icon: 'Settings' }` 추가. i18n 키 `nav.system.settings` 를 ko/en/vi 3개 언어에 추가 (`시스템 설정` / `System Settings` / `Cài đặt hệ thống`) | 사이드바 노출 | NavigationRail 에 메뉴 표시 확인 |
| SP-F11b | 🟢 **탭 1 (`?tab=legal-entity`) — 플랫폼 사업자 정보** (PlatformLegalEntity 관리). 필드 (§5.4.1 seller 매트릭스 전체):<br>• 기본: `code` (unique 식별자) / `taxCode` (MST) / `legalName` / `legalNameEn` / `displayName` / `displayNameEn` / `storeCode` / `representativeName`<br>• 주소 분리: `addressCity` (63개 행정단위 dropdown) / `addressDistrict` / `addressWard` / `addressDetail`<br>• 연락처: `contactEmail` / `contactEmailCc` / `contactPhone` / `contactFax` / `website`<br>• 은행: `bankName` / `bankAccountNumber`<br>• 국가/통화: `countryCode` (default `VN`) / `defaultSerialPrefix` (`C`/`K`)<br>• 상태: `isActive` (활성 row 1건 불변식) + 변경 이력 보기 (append-only, `PlatformLegalEntityHistory`)<br>Mutation: `platformUpdateLegalEntity(input)` → 기존 active row `isActive=false` + 신규 row 생성 (이력 추적) | seller snapshot 정확성 | 저장 후 활성 row 1건 검증 |
| SP-F11c | 🟢 **탭 2 (`?tab=einvoice-provider`) — EInvoice Provider Credentials 설정** (HJ-POS-TEST 이미지 2 대응). 상단에 provider 드롭다운 (WeTax / Viettel S-Invoice / MISA meInvoice) + environment (SANDBOX / PRODUCTION) 토글. provider 별 고유 폼 분기 (§5.4.2):<br>**공통 필드**:<br>• Base URL (자동 suggest but 수정 가능) / Credentials Vault Ref (경로 표시) / Username / Password<br>• Current Status (CONNECTED / AUTH_FAILED / DISCONNECTED) + "테스트 연결" 버튼 (sandbox login 시도)<br>**WeTax 전용**: `taxCode` / `storeCode` / `serialPrefix` (C or K) / `formNo` (기본 `1`) / `serialType` (기본 `TKT`) / `currencyCode` (VND) / `exchangeRate` (1) / `paymentMethod` (`TM/CK`)<br>**Viettel S-Invoice 전용**: `username` (형식 `{taxCode}-{seq}` 예 `0100109106-509`) / `invoiceType` (예 `1`) / `templateCode` (예 `1/8899`) / `invoiceSeries` (예 `K23MMJ`) / `adjustmentType` / `adjustmentInvoiceType` / `paymentStatus` (bool) / `cusGetInvoiceRight` (bool) / `exchangeRate` / `reservationCode` / `validation`<br>**MISA meInvoice 전용**: `appId` / `invoiceSeries` (예 `C22TAX`) / `adjustmentInvoiceType` / `useDigitalSign` (bool) / `orgInvTemplateNo`<br>저장 시 credentials 는 vault 에 쓰기 (`vault://einvoice/_platform/{providerType}/{env}/credentials`), 나머지는 `EInvoiceProviderConfig.providerSpecificConfig` JSON 에 병합 저장. 저장 후 실시간 publish `platform.einvoice.provider.config.changed` | Phase 4 Viettel/MISA 전환 준비 | provider 별 폼 분기 + 테스트 연결 성공 |
| SP-F11d | 🟢 **탭 3 (`?tab=provider-monitoring`) — Provider 활성 / Failover / 모니터링**. 활성 provider 카드 3개 (WeTax / Viettel / MISA) + 각각 최근 24h 발급 수 / 성공률 / 평균 latency / 에러 breakdown (TIMEOUT / AUTH_FAILED / PROVIDER_DOWN / PARSE_ERROR) / 토글 (isActive). Failover chain 설정 (예: WeTax down 시 → Viettel → MISA). 각 provider 최근 제출 로그 리스트 (`EInvoiceSubmissionLog`) | 운영 가시성 | 라이브 메트릭 확인 |
| SP-F11e | 🟢 **탭 4 (`?tab=general`) — 일반 시스템 설정** (기본 설정 / 점검 모드 / 유지보수 공지 / 글로벌 i18n default). P2 로 skeleton 만 | 미래 확장 | 화면 렌더 |
| SP-F11f | 🟢 **탭 5 (`?tab=audit`) — 설정 변경 감사 로그**. `AuditLog` 에서 `actionType IN ('PLATFORM_LEGAL_ENTITY_UPDATE', 'EINVOICE_PROVIDER_CONFIG_UPDATE', 'EINVOICE_PROVIDER_TOGGLE')` 필터링 → 최근 변경 리스트 + actor / 전/후 diff / 시각 | 감사 추적 | 로그 row 확인 |
| SP-F12 | 🟢 **PlatformLegalEntity 관리 API (CentralApi 측)** — `platformGetActiveLegalEntity` / `platformListLegalEntityHistory` / `platformCreateLegalEntity` / `platformUpdateLegalEntity` / `platformDeactivateLegalEntity`. 권한: `platform.legal.entity.write` 신규 permission | SP-F11b 탭 1 | GraphQL playground 테스트 |
| SP-F13 | 🟢 **EInvoiceProviderConfig 관리 API (CentralApi 측)** — `platformListEInvoiceProviders` / `platformGetProviderConfig(providerType, environment)` / `platformUpdateProviderConfig(input)` / `platformToggleProviderActive(providerId, active)` / `platformTestProviderConnection(providerType, environment)` (sandbox login 시도 + 응답 반환). 권한: `einvoice.provider.config.write` 신규 | SP-F11c 탭 2 | provider login 테스트 성공 |

#### SP-G. 인프라 / 운영 계약 (⚪ DevOps)

코드 외 실제 운영 준비 — 이 단계가 없으면 배포 직전에 블로킹된다.

| # | 작업 | 블로킹 대상 | 담당 | 완료 확인 |
|---|---|---|---|---|
| SP-G1 | ⚪ **WeTax SANDBOX 계약 + API 자격증명 발급** (`apitest.wetax.com.vn`) | SP-C11 / SP-D1 | 비즈니스 개발 + vendor 관리 | Bearer token 정상 발급 |
| SP-G2 | ⚪ **WeTax PRODUCTION 계약 + credentials** (릴리스 직전) | production 인보이스 발행 | 동일 | |
| SP-G3 | ⚪ **Vault 셋업** (HashiCorp Vault 또는 AWS Secrets Manager). `EInvoiceProviderConfig.credentialsVaultRef` 경로 운영 규칙 확정 | SP-C11 | DevOps | credentials 저장 + fetch 검증 |
| SP-G4 | ⚪ **Google Maps Platform API 키 발급** (§23 D-14). Places / Geocoding / Maps JavaScript API 활성화 + referer 제한 | §4.8 View B | DevOps | 포털 dev 환경에서 map 렌더 |
| SP-G5 | ⚪ **PostgreSQL 운영 DB 준비** — RDS 또는 managed Postgres, 파티션 확장, read replica, 백업 정책 | 전체 | DBA | connection 테스트 |
| SP-G6 | ⚪ **Redis 운영 인스턴스** — cache / lock / rate limit / BullMQ queue. Sentinel 또는 Cluster | SP-C (cache) + SP-D (BullMQ) | DevOps | ping 테스트 |
| SP-G7 | ⚪ **S3 (또는 동급) bucket** — 인보이스 PDF / XML 저장, signed URL 정책. IAM 권한 CentralApi 에 부여 | §4.9 다운로드 | DevOps | upload/download 검증 |
| SP-G8 | ⚪ **Sentry 프로젝트 생성** (3개: CentralApi / CorporatePortal / SyncWorkers). DSN 환경변수 설정 (§23 D-17) | §17 관측성 | DevOps | 테스트 에러 발생 시 Sentry 수신 |
| SP-G9 | ⚪ **Grafana / Prometheus / Loki** 연결 (SuperAdmin 기존 스택 재사용) | §17.4 | DevOps | 기본 대시보드 접근 |
| SP-G10 | ⚪ **CI / CD 파이프라인** — GitHub Actions `corporate-portal.yml` 신규 (§18.4 9단계) | 포털 PR 검증 | DevOps | 샘플 PR 에서 모든 step green |
| SP-G11 | ⚪ **도메인 / DNS / TLS** — `corporate.hyojung.vn` 또는 동급. Let's Encrypt / CloudFlare | production 배포 | DevOps | HTTPS 접근 검증 |
| SP-G12 | ⚪ **Email 발송 인프라** (SendGrid / AWS SES / Mailgun) — 인보이스 알림 / 초대 이메일 / 비밀번호 재설정. SPF/DKIM 설정. 베트남어 / 한국어 / 영어 템플릿 | §4.13 초대 / §12 알림 | DevOps | 테스트 이메일 수신 검증 |
| SP-G13 | ⚪ **WebSocket 엔드포인트** — 실시간 subscription (graphql-ws). load balancer sticky session 또는 server-sent fallback | §12.4 실시간 알림 (P1) | DevOps | 연결 테스트 |

#### SP-H. QA / 테스트 (🔵 QA)

포털 Phase 1 착수 전 서버 측 최소 검증 완료.

| # | 작업 | 블로킹 대상 | 완료 확인 |
|---|---|---|---|
| SP-H1 | 🔵 CentralApi corporate 도메인 단위 테스트 (`jest`) — 신규 resolver / service / 상태 머신 전부 | SP-C 완료 확인 | `npm test` 통과 + 커버리지 70%+ |
| SP-H2 | 🔵 **WeTax SANDBOX 실제 발급 E2E** — 가짜 corporate 1개 생성 → 가짜 MealTransaction 10건 삽입 → `runEInvoiceConsolidationForCorporate` → `publishConsolidatedInvoice` → SANDBOX GDT ACCEPTED 확인 | SP-C11 + SP-G1 | sandbox lookup_code 수신 |
| SP-H3 | 🔵 하이브리드 워크플로우 E2E — DRAFT → Corporate request → REQUESTED → SA publish → SUBMITTING → ACCEPTED 전이 7일 자동 승격 포함 | SP-C8 + SP-D2 | `jest` + manual QA |
| SP-H4 | 🔵 RBAC E2E — 각 role template 별 금지 mutation 이 403 으로 차단되는지 전수 검증 | SP-B + SP-C | 보안 테스트 통과 |
| SP-H5 | 🔵 월초 cron 부하 테스트 — 100 corporate × 1000 tx 가정, consolidation job 실행 시간 측정 (§15.1 목표 10분 이내) | SP-D1 | 부하 테스트 리포트 |
| SP-H6 | 🔵 DB 마이그레이션 rollback 테스트 — 각 migration 을 revert 했을 때 정상 동작 | SP-A | manual QA |

---

#### Phase -1 완료 게이트 (Exit Criteria)

**Phase 0 F-2 이후에 착수하려면 아래가 모두 true 여야 한다**:

- [ ] 🔴 SP-A1~A13 완료 — 모든 migration SANDBOX DB 적용 + `prisma validate`
- [ ] 🔴 SP-B1~B7 완료 — seed.ts 실행 후 `Permission` / `Role` / `PlatformLegalEntity` / `EInvoiceProvider` row 확인
- [ ] 🔴 SP-C1~C15 완료 — GraphQL playground 에서 각 operation schema 확인 + 단위 테스트 통과
- [ ] 🟠 SP-D1~D6 완료 — dev 환경에서 cron job manual trigger 성공
- [ ] 🟡 SP-E1~E7 완료 — SharedContracts `dist/` 생성 + CorporatePortal 이 import 가능
- [ ] 🟢 SP-F5 (SuperAdmin 의 초기 OWNER 발급 flow) 최소 완료 — 나머지 SA 화면은 병행 가능
- [ ] ⚪ SP-G1 / G3 / G4 / G5 / G6 / G7 / G8 / G10 (최소 인프라) 완료
- [ ] 🔵 SP-H1 / H2 / H3 / H4 최소 통과

**Phase -1 미완료 상태에서 Phase 0 를 착수하면**: CorporatePortal 이 mock 데이터에 의존하여 진행되며, 나중에 서버 계약이 바뀌면 **화면 / 쿼리 / 타입이 모두 깨지는 대규모 rework** 가 발생한다. 반드시 위 게이트를 통과해야 한다.

**병행 가능한 것**:
- CorporatePortal Phase 0 중 F-1 (의존성 설치 — 이미 완료) / F-2 (config 파일) / F-11 (layout shell skeleton) / F-12 (i18n init) 는 SP 단계와 **독립적으로 진행 가능**
- 단 F-6 (SharedContracts 사용) / F-7 (operations 사용) / F-13 (permission hooks) 부터는 SP-E / SP-B 완료 후에만 가능

---

### Phase 0 — Foundation (CorporatePortal 전용, 2일)

> **전제**: Phase -1 의 최소 게이트 통과. 아래 task 는 **포털 내부 작업만** 이며, 서버 측 작업 (SP-A ~ SP-H) 은 Phase -1 에서 이미 완료되어야 한다.

| # | Task | 산출물 | 블로킹 선행 |
|---|---|---|---|
| F-1 | package.json 의존성 1회 추가 + scripts 확장 (완료) | `package.json`, `package-lock.json` | - |
| F-2 | `tsconfig.json` / `next.config.ts` / `eslint.config.mjs` / `postcss.config.mjs` 초기화 (SuperAdmin/Portal 복사 후 port/alias 조정) | 5개 설정 파일 | - |
| F-3 | `codegen.ts` 작성 + 1회 codegen 실행 + 결과 커밋 (codegen 산출물은 .gitignore 대상 아님) | `src/graphql/generated/*` | **SP-E6 필수** (SharedContracts dist) |
| F-4 | `providers/apollo.ts` (cache-first fetchPolicy + keyFields type policies + ErrorLink + RetryLink + 단일 flight query dedup) + `providers/auth-provider.tsx` + `providers/theme-provider.tsx` + `providers/toast-provider.tsx` + `app/providers.tsx` | 5개 파일 | SP-E6 |
| F-5 | Redux store + 3개 slice skeleton (navigation / filters / drawer) | `store/*` | - |
| F-6 | `shared/layout/app-shell.tsx` + `top-bar.tsx` + `side-nav.tsx` (SharedUI 조합만, permission 기반 메뉴 필터 — `useHasPermission` 연결) | `shared/layout/*` | SP-B4 (role matrix seed), SP-C4 (`mealCorporateAdminMe` resolver) |
| F-7 | i18n init + `common.json` / `nav.json` / `auth.json` 3개 언어 + `error-map.ts` (서버 에러 code → i18n key) | `i18n/*` | - |
| F-8 | `rbac/use-current-permissions.ts` + `use-has-permission.ts` + `<RequirePermission>` guard 컴포넌트 (§8.3.5) + `use-current-session.ts` | `rbac/*` | SP-C4 |
| F-9 | `(auth)/login/page.tsx` + `(auth)/set-password/page.tsx` + `(auth)/forgot-password/page.tsx` 로그인 / 초기 비밀번호 설정 / 재설정 | 3 screens | SP-F5 (SuperAdmin 이 OWNER 초대 이메일 발송하는 flow) |
| F-10 | `middleware.ts` session guard + permission 기반 route 보호 + 401 refresh token flow | 1 file | F-4 |
| F-11 | Observability 기초 — `providers/telemetry.ts` (Sentry 또는 OpenTelemetry client 초기화), 전역 error boundary, structured logger wrapper | `providers/telemetry.ts` + `shared/error-boundary.tsx` | SP-G8 (Sentry DSN) |

> Phase -1 을 별도 Phase 로 분리한 이유: Phase 0 의 F-3 ~ F-8 (이전 버전) 이 실제로는 **서버 작업** 이었음. 이를 Phase -1 로 승격하여 책임 프로젝트와 블로킹 관계를 명확히 함. Phase 0 은 이제 **포털 내부 bootstrap 만** 담당.

### Phase 1 — P0 Screens (분할됨, 1 PR = 1 task)

| # | Task | 산출물 | 주요 위젯/기능 |
|---|---|---|---|
| P0-1 | `/dashboard` — W1~W6 위젯 구현 (예산 게이지 / 월간 추세 / 부서 랭킹 / 지갑 분포 / 인기 식당 / 이번 달 인보이스 상태 카드 — 7개 상태 지원 + D-day 카운터 + 상황별 CTA) | `screens/dashboard/*` | §4.1 |
| P0-2 | `/departments` — flat list + CRUD + 상위 부서 이동 | `screens/departments/*` | §4.2 |
| P0-3a | `/employees` — list + 검색 + 필터 + keyset pagination + CSV export | `screens/employees/list/*` | §4.3 |
| P0-3b | `/employees` — 단건 CRUD + 퇴사 처리 + 배지 매핑 + **`isExternalSync` 가드** (HRIS 동기화 임직원은 기본정보 read-only, 배지/정책/메모만 수정 가능) | `screens/employees/editor/*` | §4.3.5 / §4.3.8 |
| P0-3c | `/employees/[id]` — 상세 (탭 1~3: 개요/원장/거래) | `screens/employees/detail/*` | §4.4 |
| P0-4a | `/policies` — list + 상태 머신 + 탭 1 (기본 정보) + 탭 3 (한도) | `screens/policies/basic/*` | §4.5.2 |
| P0-4b | `/policies` — 탭 2 (시간대 빌더) + 탭 4 (적용 대상) | `screens/policies/windows-targets/*` | §4.5.2 |
| P0-4c | `/policies` — 탭 5 (머천트/카테고리 허용) + publish/pause/deactivate | `screens/policies/merchants-lifecycle/*` | §4.5.3 |
| P0-5 | `/budget` — 섹션 1~4 read-only (funding 상태 / 지출 요약 / 적립 이력 / 개인 충전) | `screens/budget/*` | §4.6.1 |
| P0-6 | `/merchants` — View A 리스트 + 카테고리 일괄 + 단건/다건 토글 + CSV export | `screens/merchants/*` | §4.8 |
| P0-7a | `/invoices` — 리스트 + 필터 + 상태 배지 (DRAFT/DISPUTED/REQUESTED/SUBMITTING/ACCEPTED/REJECTED/VOIDED) + D-day 카운터 | `screens/invoices/list/*` | §4.9 |
| P0-7b | `/invoices/[id]` — 상세 섹션 0~5 (액션 패널 / 헤더 / seller / buyer / 라인 / 타임라인) + PDF/XML 다운로드 | `screens/invoices/detail/*` | §4.10 |
| P0-7c | `/invoices/[id]` — **발행 요청** 플로우 (확인 다이얼로그 + `mealConsolidatedInvoiceRequestIssuance`) | `screens/invoices/detail/request-issuance/*` | §4.9.2.a |
| P0-7d | `/invoices/[id]` — **이의 제기** 플로우 (사유 입력 모달 + `mealConsolidatedInvoiceDispute`) | `screens/invoices/detail/dispute/*` | §4.9.2.b |
| P0-8 | `/settings/company` — Corporate 프로필 편집 3탭 | `screens/settings/company/*` | §4.12 |
| P0-9 | `/settings/admins` — list + invite + role 변경 + suspend/resume + OWNER 보호 | `screens/settings/admins/*` | §4.13 |
| P0-10 | `/settings/session` — 프로필 + 비밀번호 변경 | `screens/settings/session/*` | §4.14 |
| P0-11 | `/integrations` — 스켈레톤 "준비 중" 안내 페이지 | 1 screen | §4.11 |
| P0-12 | 공통 — TopBar 🔔 bell skeleton (실제 알림은 P1) | `shared/layout/notification-bell.tsx` | §12.2 |
| P0-13 | 공통 — Empty State / Error State / Skeleton 공용 컴포넌트 3종 | `shared/state/*` | §15.6 |
| P0-14 | Playwright — 시나리오 A (onboarding) E2E | `tests/e2e/onboarding.spec.ts` | §14.1 |
| P0-15 | Playwright — 시나리오 B (월초 업무) E2E | `tests/e2e/monthly-routine.spec.ts` | §14.2 |
| P0-16 | Playwright — 시나리오 F (퇴사) E2E | `tests/e2e/termination.spec.ts` | §14.6 |
| P0-17 | Custom rule — `scripts/check-corporate-portal-rules.mjs` + CI 통합 | `scripts/*` + CI workflow | §12.4 |
| P0-18 | i18n — `dashboard.json` / `departments.json` / `employees.json` / `policies.json` / `budget.json` / `merchants.json` / `invoices.json` / `settings.json` / `auth.json` ko/vi/en 3언어 | `src/i18n/locales/**` | §7 |

### Phase 2 — P1 (2~3주)

| # | Task |
|---|---|
| P1-1 | `/dashboard` — W7~W9 (이상 거래 / 만료 예정 / To-Do) |
| P1-2 | `/departments` — 트리 D&D + 부서별 예산 배정 |
| P1-3 | `/employees` — CSV 업로드 + Bulk action (부서 이동 / 정책 적용 / 일시정지 / 일괄 퇴사) |
| P1-4 | `/employees/[id]` — 탭 4 (정책 이력) + 탭 5 (감사 로그 포함 자동 소멸 이벤트 표시) |
| P1-5 | `/policies` — 복제 + 시뮬레이션 + 감사 이력 + 머천트 whitelist/blacklist |
| P1-6 | `/budget` — 섹션 5 (Forecast) + 섹션 6 (자동 소멸 예정 포인트) + 수동 포인트 충전 (`mealCompanyAllowanceLoad`) + 정기 배치 설정 |
| P1-7 | `/budget/ledger` — 통합 원장 화면 + 엑셀 다운로드 |
| P1-8 | `/merchants` — View B 지도 + 거절 사유 통계 + NEW 배지 알림 |
| P1-9 | `/invoices` — 이메일 재전송 + 섹션 5 (제출 이력) + 섹션 6 (Audit Trail) |
| P1-10 | `/reports/*` — 11종 전용 리포트 (spend-by-period/department/employee/merchant/category/timeslot/declines/carryover-expiry/split-payment/saas-billing) |
| P1-11 | 알림 / 통보 — 포털 벨 + 실시간 subscription + 이메일 템플릿 연동 |
| P1-12 | 감사 — `/settings/audit` 화면 + 민감 액션 재인증 |
| P1-13 | 2FA (TOTP) 설정 + `/settings/session` 탭 3 확장 |
| P1-14 | RBAC — 개별 permission grant/revoke UI + 부서 한정 HR_ADMIN (scope 추가 확장) |
| P1-15 | Playwright — 시나리오 C (CSV 일괄 업로드) / D (이상 거래 대응) / E (분기 예산 조정) E2E |

### Phase 3 — P2 (+3주)

| # | Task |
|---|---|
| P2-1 | HRIS 연동 — Base.vn API 1차 구현 (부서/임직원 read-only sync) |
| P2-2 | HRIS 연동 — 싱크 실패 해결 UI, 충돌 해결 모드 |
| P2-3 | Carryover 규칙 UI + SyncWorkers 배치 연동 |
| P2-4 | 대시보드 커스텀 — 사용자가 위젯 배치 저장 |
| P2-5 | `/reports/policy-effectiveness` + `/reports/float-utilization` |
| P2-6 | 스케줄 리포트 (월초 자동 PDF 이메일) |
| P2-7 | 브라우저 푸시 알림 (Web Push API) |
| P2-8 | 다크 모드 완전 지원 |
| P2-9 | 다국어 부서명 / 정책명 (JSON 확장) |
| P2-10 | 개인 충전 환불 flow (ZaloPay/MoMo 환불 API) — 퇴사 시 임직원에게 실제 현금 환불 |
| P2-10b | `mealWalletCompanyAllowanceAdjust` — 관리자 수동 포인트 교정 UI (배포 실수 정정, 드물게, 감사 필수, 이중 확인) |
| P2-11 | 머천트 리뷰 / 평점 / 즐겨찾기 추천 |
| P2-12 | SAP SuccessFactors / Workday connectors |

---

## 23. 결정이 필요한 사항 (사용자 확인 전까지 보류)

아래 항목은 본 작업계획서가 가정한 결정이지만, 구현 착수 전에 사용자 확인을 받아야 한다.

| # | 항목 | 상태 / 기본 가정 |
|---|---|---|
| D-1 | 멀티 corporate 스위처 | 1 admin = 1 corporate (스위처 없음). 사용자 확인 필요 ✅ |
| D-2 | 임직원 `/employees` CSV 일괄 업로드 | P1 로 확정 |
| D-3 | `/merchants` 지도 라이브러리 | **확정: Google Maps 전용** (`@react-google-maps/api` + `@googlemaps/js-api-loader`). Mapbox / Naver / 기타 금지. 사유: 베트남 POI 커버리지, 다국어 라벨. |
| D-4 | 비밀번호 정책 (길이, 복잡도) | CentralApi 와 동일 (최소 10자, 대소문자+숫자+특수). 사용자 확인 필요 ✅ |
| D-5 | Corporate role 정의 | **확정: 서버 RBAC 기반 4개 template** (`CORPORATE_OWNER / CORPORATE_HR_ADMIN / CORPORATE_FINANCE_ADMIN / CORPORATE_VIEWER`). 포털에 role 이름 하드코딩 금지. seed.ts 에 template 등록 필요 (§8.3.3). |
| D-6 | Language 기본값 | `vi-VN` (베트남 고객 대상), `ko-KR` / `en-US` 스위치. 사용자 확인 필요 ✅ |
| D-7 | 인보이스 PDF 생성 위치 | CentralApi 가 생성하고 S3 signed URL 반환 (Portal 은 받아만 씀). 사용자 확인 필요 ✅ |
| D-8 | HRIS 연동 파트너 1차 목록 | Base.vn 만 P2. 사용자 확인 필요 ✅ |
| D-9 | 허용 머천트 모델 | **확정: `MealCorporateMerchantAllowlist` 별도 테이블** (§10.2). SuperAdmin 이 가맹 카탈로그 소유, Corporate 는 allowlist 토글만. |
| D-10 | 2FA 방식 | TOTP (Google Authenticator) P1. 사용자 확인 필요 ✅ |
| D-11 | **초기 OWNER 발급 권한** | **확정: SuperAdmin/Portal 에서 SuperAdmin 이 직접 발급**. CorporatePortal 은 OWNER 자체를 생성하지 않는다. 마지막 OWNER 소실 시 SuperAdmin 만 복구 가능. |
| D-12 | Corporate 전용 permission 4개 추가 seed | **확정: `corporate.merchant.allow.write` / `corporate.report.read` / `corporate.audit.read` / `corporate.admin.manage`** 를 CentralApi seed.ts 에 추가 (Phase 0 F-5 에서). |
| D-13 | **SuperAdmin 전용 permission 4개 분리** | **확정**: `corporate.merchant.enroll` / `corporate.merchant.activate` / `corporate.merchant.commission.write` / `corporate.merchant.account.write` / `einvoice.publish.write` 는 Corporate role template 에 절대 부여 금지. SuperAdmin role 만 보유. |
| D-14 | Google Maps API 키 발급 및 청구 계정 | SuperAdmin 의 GCP 프로젝트에서 발급, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 로 주입. referer 제한 필수 (CorporatePortal 도메인만). Places / Geocoding / Maps JavaScript API 활성화. 사용자 확인 필요 ✅ |
| D-15 | **회사 지원금 = 포인트, 자동 소멸** | **확정: §9 전면 수정**. 회사 지원금은 식권 결제용 조건부 포인트이며 현금이 아니다. "지급/회수" 용어 금지, "충전/자동 소멸" 용어만 사용. 퇴사 시 남은 포인트는 서버가 자동으로 `EXPIRED` 처리 (관리자 선택 옵션 없음). 개인 충전은 별개 (실제 현금, 환불 가능). 기존 `mealWalletCompanyAllowanceClawback` mutation 삭제, 대신 P2 로 `mealWalletCompanyAllowanceAdjust` (수동 교정, 극한 상황) 만 유지. `mealCompanyAllowanceDistribute` → `mealCompanyAllowanceLoad` rename. funding entry status 에 `EXPIRED` 추가 (DB migration 필요). |
| D-16 | **인보이스 하이브리드 워크플로우** | **확정: §4.9 / §4.10 전면 수정 + 사양서 §4.3.2 재작성**. cron 자동 DRAFT 생성 → **Corporate 가 7일 이내 발행 요청 또는 이의 제기** → 7일 무응답 시 자동 승격 → SuperAdmin 검수 → WeTax → GDT. 법적 seller 는 여전히 플랫폼 사업자, Corporate 의 "발행 요청" 은 서비스 구매자의 내용 확인 완료 표시. 신규 permission 2개 (`einvoice.request.write` / `einvoice.dispute.write`), 신규 mutation 2개 (`mealConsolidatedInvoiceRequestIssuance` / `mealConsolidatedInvoiceDispute`), 상태 enum 2개 추가 (`DRAFT → DISPUTED`, `DRAFT → REQUESTED`), schema 필드 10개 추가 (reviewDueAt / requestedBy / requestedAt / autoPromoted / disputedBy / disputedAt / disputeReason / disputeResolvedAt / disputeResolvedBy / corporate.einvoiceReviewDays). SyncWorkers daily cron `einvoice-auto-promote.job.ts` 신규 (매일 01:00). |
| D-17 | **관측성 / 에러 추적 솔루션** | 기본 가정: **Sentry** (`@sentry/nextjs`) — error tracking + performance + replay. 대안: OpenTelemetry + Grafana Loki + Tempo (자체 호스팅, 더 저렴). SuperAdmin 의 기존 관측 인프라와 정렬 필요. 사용자 확인 필요 ✅ |
| D-18 | **Google Maps API 캐싱 정책** | Geocoding / Places 결과를 Redis 24h TTL 캐싱 (서버 측). 동일 corporate 주소 / 머천트 좌표는 중복 호출 금지. 캐시 key 에는 원본 주소 해시. 사용자 확인 필요 ✅ |
| D-19 | **7일 Corporate 검토 마감 기간 커스터마이징** | `MealCorporate.einvoiceReviewDays` 기본 7일, 3~14일 조정 가능. 어느 role 이 조정 권한을 갖는가? 기본 가정: OWNER 만 (`corporate.profile.write` 권한으로 통합). 사용자 확인 필요 ✅ |
| D-20 | **Retention 정책 적용 방식** | `MealTransaction` 60개월, `AuditLog` 24개월, `EInvoiceSubmissionLog` 24개월, `SyncOutbox` ACKED 30일. SyncWorkers 에 cron 추가 필요 (월 1회 archive + purge). 사용자 확인 필요 ✅ |
| D-21 | **신용도 평가 프로세스 / SLA** | **확정: §4.6.0 SA 주도 funding policy 부여 모델**. 신규 Corporate 는 `fundingModel='UNASSIGNED'` 기본값, SuperAdmin 이 신용도 평가 (재무제표 / 신용평가사 리포트 / 비즈니스 규모 / 계약서) 후 PREPAID_DEPOSIT / CREDIT_NET15 / CREDIT_NET30 부여. UNASSIGNED 상태에서는 임직원 포인트 충전 불가. **정의 필요**: (1) 평가 완료 SLA (목표 1~5 영업일) (2) 평가 담당자 지정 (SuperAdmin 내 소수 권한자만) (3) 평가 거부 시 재신청 대기 기간 (4) 자동화 가능 여부 (상장 기업 / 기존 고객사 추천 등의 경우 자동 APPROVED 가능?) 사용자 확인 필요 ✅ |
| D-22 | **신용도 평가 통과 기준 표준화** | **기본 가정**: 3단계 tier 기준 — `TIER_A` (FDI 대기업 / 삼성 협력사 등 상위 신용) → CREDIT_NET30 / `TIER_B` (중견기업 / 상장사) → CREDIT_NET15 / `TIER_C` (중소기업 / 스타트업) → PREPAID_DEPOSIT. 구체 재무 지표 (매출 / 부채비율 / 영업이익률) 기준은 별도 내부 문서로. 사용자 확인 필요 ✅ |
| D-23 | **PREPAID → CREDIT 승급 시 기존 예치금 처리** | **기본 가정**: 기존 예치금 그대로 유지 → 다음 거래부터 예치금 소진 우선 → 예치금 0 되면 credit 한도 사용. 명시적 환불은 SA 의 별도 refund 작업 (P2). 사용자 확인 필요 ✅ |
| D-24 | **CREDIT → PREPAID 강등 시 outstanding 정산 방식** | **기본 가정**: SA 가 downgrade 시 반드시 outstanding 정산 방식 명시 — `IMMEDIATE` (즉시 청구) / `NEXT_PERIOD` (다음 정산일까지 유지) / `INSTALLMENT` (분할 납부). 기본값 `NEXT_PERIOD`. 사용자 확인 필요 ✅ |
| D-25 | **Corporate 가 볼 수 있는 funding 정보의 범위** | 모든 funding 정보 (fundingModel / 한도 / outstanding / 이력) 를 Corporate OWNER 가 조회 가능. HR_ADMIN 은 fundingModel 만 조회 (한도 금액은 FINANCE_ADMIN 이상만). VIEWER 는 fundingModel 배지만 조회 가능. 사용자 확인 필요 ✅ |
| D-26 | **Permission key 리소스 중심 통일 (einvoice.*)** | **확정: §8.3.2 전면 적용**. 기존 `corporate.invoice.*` + `platform.einvoice.*` 혼재 구조를 **`einvoice.*` 리소스 중심 단일 네임스페이스**로 통일. SuperAdmin 과 Corporate 는 **같은 permission key 를 공유**하되 `scope` (PLATFORM vs CORPORATE + scopeCorporateId) 로만 범위 제한. 8개 permission 정의: `einvoice.read / request.write / dispute.write / publish.write / retry.write / void.write / revert.write / dispute.resolve.write`. 장점: (1) SuperAdmin/Portal 과 CorporatePortal 이 동일한 `PermissionService` 로직 공유 (2) 권한 매트릭스 관리 단순화 (3) 향후 `einvoice` 리소스를 식권 외 다른 서비스 (물류 / 자재) 로 확장 시 permission 재정의 없이 새 provider 만 추가. 기존 seed 의 rename 매핑 필요 (SP-B1a). |
| D-27 | **3 Provider 완전 지원 (WeTax / Viettel / MISA)** | **확정: 사양서 §0.3 / §17.1 / 작업계획서 §4.10 / §4.12 / §17.1.1 매트릭스**. HJ-POS-TEST 에 구현된 3개 provider 를 모두 `EInvoiceProvider` 추상화 위에 지원. Phase 1 은 **WeTax 단독 구현** (본 사양서), Phase 4 에서 **Viettel S-Invoice + MISA meInvoice 동시 추가**. `EInvoiceProviderConfig.providerSpecificConfig` Json 필드 신규 — provider 별 고유 설정 (Viettel: InvoiceType/TemplateCode/InvoiceSeries/cusGetInvoiceRight / MISA: invoiceSeries/adjustmentInvoiceType / WeTax: serialPrefix/formNo/serialType/paymentMethod) 담기. Corporate 와 SuperAdmin 은 동일 추상화로 동작 — corporate 별 preferred provider 는 P5 로 연기. |
| D-28 | **Buyer/Seller 주소 분리 + 은행/Fax 필드 추가** | **확정: SP-A22~A24**. HJ-POS-TEST 이미지 1 (Viettel S-Invoice buyer 입력 화면) 분석 결과, 기존 `addressFull` 단일 필드로는 3 provider 의 요구사항을 충족하지 못함. `MealCorporate` 와 `PlatformLegalEntity` 에 주소 4개 분리 필드 (`addressCity / addressDistrict / addressWard / addressDetail`) + `contactFax` + `bankAccountNumber` + `bankName` 추가. `addressFull` 은 trigger 로 자동 조합 (기존 코드 호환). 인보이스 seller/buyer snapshot 에도 동일 구조 박제. §4.12.1 탭 1b 주소 / 탭 2b 은행 정보 신규. |
| D-29 | **3 Provider 필드 전수 매트릭스 (§5.4) — 누락 필드 완전 반영** | **확정: SP-A29**. HJ-POS-TEST 의 `WeTaxMgr.h` / `Base.h` `tViettel_Seller/Buyer` / `MisaTaxMgr.h` 를 1:1 분석하여 seller 15필드 / provider credentials 22필드 / buyer 20필드 / invoice line 15필드 / invoice header 20필드 총 5개 매트릭스로 정리. 기존 SP-A22~A28 로 커버되지 않은 **9개 누락 필드** 를 SP-A29 에서 추가: `PlatformLegalEntity.{storeCode, contactPhone, countryCode, website, legalNameEn, displayNameEn}` / `MealCorporate.{contactEmailCc, countryCode, budgetUnitCode}` / `MealConsolidatedEInvoice.notes` / `MealConsolidatedEInvoiceLine.itemType`. 모든 필드가 §5.4 표와 1:1 매핑됨. |
| D-30 | **SuperAdmin/Portal `/system/settings` 탭 기반 설정 페이지** | **확정: SP-F11 ~ F13**. `http://localhost:3001/system/settings` 신규 route + 사이드바 `system` children 에 `system.settings` nav 항목 추가. 탭 5개: (1) 플랫폼 사업자 정보 (`PlatformLegalEntity`) (2) EInvoice Provider Credentials (HJ-POS-TEST 이미지 2 대응, provider 별 분기) (3) Provider 모니터링 (failover + 24h 메트릭) (4) 일반 시스템 설정 (P2 skeleton) (5) 설정 변경 감사 로그. URL query `?tab=xxx` 로 탭 상태 유지. 권한: `platform.legal.entity.write` / `einvoice.provider.config.write` 신규 permission. SP-F11a (nav-items.ts 수정) / SP-F11b~f (5개 탭 구현) / SP-F12 (legal entity API) / SP-F13 (provider config API). |

---

## 24. 완료 정의 (Definition of Done)

### 24.1 각 task 의 DoD

- `npm run check` (typecheck + lint) 통과
- `npm run codegen` 이 clean 상태 (uncommitted changes 없음)
- 대상 화면의 i18n 키가 ko/vi/en 3개 언어에 모두 존재
- `scripts/check-corporate-portal-rules.mjs` 통과
- 화면이 `shared/layout/app-shell.tsx` 안에 렌더됨
- SharedUI 를 통하지 않은 raw `<button>` / `<input>` / `<div>` (시맨틱 div 제외) 가 없음
- 해당 task 의 Playwright 시나리오 (있으면) 통과

### 24.2 P0 릴리스 DoD

- 위 §13 Phase 0 + Phase 1 모든 task 완료
- E2E 시나리오 5건 CI 에서 green
- `scripts/check-corporate-portal-rules.mjs` CI 포함
- README.md 업데이트 (로컬 실행 방법, env 변수 목록, 1차 릴리스 범위 명시)
- 본 작업계획서의 §14 결정 사항 모두 확정 (사용자 승인)
- SuperAdmin/Portal 과 나란히 실행될 때 포트 충돌 없음 (3003)
- Apollo 는 반드시 SharedContracts operation 을 경유 (raw `gql` 금지)
- `.env.local.example` 제공 (필요한 env 변수 명시)

---

## 25. 작업 진행 기록

> 이 섹션은 작업 진행에 따라 실제 수행자가 채운다. Task 하나를 마칠 때마다 완료 범위 / 남은 범위 / 이슈를 1~2줄로 기록.

### 2026-04-08 (초안)

- 본 작업계획서 초안 작성 (Claude)
- 현황 파악:
  - CorporatePortal 은 빈 Next.js 16 + React 19 셸 상태 (package.json + layout/page 만)
  - SuperAdmin/Portal 이 성숙한 형제 프로젝트로 모든 설정 복제 기준이 됨
  - SharedContracts 에 corporate 전용 operation 이 없음 — 9개 파일 신규 작성 필요
  - CentralApi 는 corporate leaf (profile/wallet/einvoice/policy/merchant/settlement/transaction) 가 존재하지만 department/employee sub-leaf + budget mutation 은 추가 필요

### 2026-04-08 (Next.js + Portal 라이브러리 설치)

- CorporatePortal 에 `npm install` 으로 Next.js 16.2.3 + React 19 + TypeScript 6 + Apollo + Redux 기본 설치 (Step 1)
- SuperAdmin/Portal 기반 추가 라이브러리 설치 (Step 2):
  - `@platform/shared-ui` → `file:../SharedUI` 링크
  - Tailwind v4, React Compiler, lucide-react, sonner, zod, clsx, tailwind-merge, next-themes, graphql-ws, postcss
  - graphql-codegen (cli + client-preset), eslint stack, @next/eslint-plugin-next, tsx, @types/react-dom
- `package.json` scripts 를 Portal 과 동일하게 확장 (dev/build/start `--webpack`, lint, typecheck, check, codegen, codegen:watch)
- `diff` 검증 결과 Portal 과 CorporatePortal 의 dependency 이름 목록이 완벽히 일치

### 2026-04-08 (기능 상세 확장)

- 사용자 피드백 "기획서가 단순함" 에 따라 작업계획서 대폭 확장
- 식권대장 / 비플식권 / Pluxee (Sodexo) / Edenred / Swile / Base.vn / DoorDash for Business / ezCater 등 실제 B2B 식권·복지 플랫폼의 공개 문서를 WebSearch 로 조사하여 기능 카탈로그 보강
- §4 각 화면 상세를 필드·액션·엣지케이스·권한·성능·빈상태 레벨까지 확장 (대시보드는 10개 위젯, 임직원은 CSV 일괄 + 8개 bulk action, 정책은 5탭 빌더 + 상태머신, 인보이스는 6섹션 상세 등)
- §11 리포트 / §12 알림 / §13 감사 / §14 사용자 플로우 시나리오 6건 / §15 UX 접근성 / §16 성능 6개 새 섹션 추가
- §19 Phase 별 Task 분해 를 P0 13건 → P0 18건, P1 7건 → 15건, P2 5건 → 12건 으로 세분화 (1 PR = 1 task 기준)
- §23 외부 벤치마크 플랫폼 출처 명시

### 2026-04-08 (3건 정책 확정)

사용자 피드백 반영:

- **지도**: Mapbox / Naver 옵션 제거 → **Google Maps 전용** 확정 (`@react-google-maps/api` + `@googlemaps/js-api-loader`). §2.1 / §4.8 / §14 / §19 에 반영. API 키는 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- **머천트 관리**: CorporatePortal 은 머천트 카탈로그 자체를 편집하지 않는다. **SuperAdmin 이 가맹 계약 / 수수료 / 정산 계좌** 를 관리하고, **CorporatePortal 은 허용 토글 하나만** 편집. `MealCorporateMerchantAllowlist` 별도 테이블 모델 확정 (§10.2). `Option A/B` 논의 제거. §4.8 전체 재작성.
- **RBAC**: 포털에 role 이름 하드코딩 (`OWNER/HR_ADMIN/FINANCE_ADMIN/VIEWER`) 제거. **서버의 `Permission` / `Role` / `RolePermission` / `UserRoleAssignment` 시스템** 위에서 동작. `scope='CORPORATE'` 의 4개 role template 을 seed.ts 에 등록. SuperAdmin 이 초기 `CORPORATE_OWNER` 1명 발급 → OWNER 가 내부 관리자 생성 / 권한 부여 (권한 격상 방지). `corporate.merchant.enroll / commission.write / account.write / invoice.write` 4개 permission 은 SuperAdmin 전용, Corporate 는 절대 부여 금지. §8.3 / §4.13 전체 재작성. 신규 permission 4개 (`merchant.allow.write / report.read / audit.read / admin.manage`) 는 seed.ts 에 추가 필요.
- §20 결정 사항 업데이트: D-3 (지도) / D-5 (role) / D-9 (allowlist 모델) 확정. D-11 / D-12 / D-13 / D-14 신규 추가.
- §19 Phase 0 task 재정렬: F-3 "seed.ts 에 permission + role template 추가" 를 앞으로 배치. F-4 "allowlist 모델 + migration" 추가. F-5 "merchant allowlist resolver + RBAC query" 추가. 전체 13 task → 15 task.

### 2026-04-08 (지원금 = 포인트 개념 + 자동 소멸)

사용자 피드백: "지원금 회수를 관리자가 수동으로 처리하는 게 아니라 퇴사 시 자동 회수되어야 한다. 그리고 지원금은 지급/회수 개념이 아니라 식권 구매에 사용할 수 있는 포인트 개념이다."

- **§9 Allowance Ledger 전면 재작성**:
  - §9.0 핵심 도메인 모델 — "포인트 vs 현금" 멘탈 모델 대조표 + UI 용어 매핑 (`지급/회수` 금지 → `충전/소멸` 사용)
  - §9.1 잔액 표시 규칙에 `[P]` 포인트 뱃지 + "환불 가능" / "조건부 포인트" 라벨 분리
  - §9.2 funding entry status 에 **`EXPIRED`** 추가 (퇴사/월말/정책 만료 자동 소멸). 기존 `REVERSED` 는 "관리자 수동 교정 (극한 상황)" 의미로만 축소
  - §9.4 Carryover — 월말 만료는 SyncWorkers 자동 배치 명시
  - §9.5 **퇴사 시 자동 소멸 규칙** 신규 — 서버가 단일 트랜잭션으로 원자적 수행 (`WALLET_AUTO_EXPIRE_ON_TERMINATION`)
- **§4.3.4 / §4.3.5 / §4.3.7 / §4.3.8 / §4.3.9** — "회사 지원금 일괄 회수" Bulk action 제거, 퇴사 처리 플로우에서 관리자 "정산 옵션" 제거, 자동 처리 사전 고지 다이얼로그로 변경, `mealEmployeeTerminate` 의 `clawbackMode` 파라미터 삭제
- **§4.4.2 / §4.4.4 / §4.4.5** — Allowance Ledger 카드에 `[P]` 포인트 뱃지 + "조건부 포인트" 문구. `mealWalletCompanyAllowanceClawback` operation **삭제**. 대체로 P2 `mealWalletCompanyAllowanceAdjust` (배포 실수 교정, 감사 필수, 극한 상황) 만 유지
- **§4.6 Budget** — 섹션 2/3/6 용어 정정 ("적립" → "충전", "소멸" 은 자동임을 명시). Operation `mealCompanyAllowanceDistribute` → `mealCompanyAllowanceLoad` rename (Pluxee/Edenred 표준 용어). `Deposit` 은 현금 예치금이므로 예외 유지
- **§4.7 `/budget/ledger`** — 통합 원장 테이블 status 컬럼에 `EXPIRED` 추가. `EXPIRED` 행은 회색 "자동 소멸" 라벨, `REVERSED` 행은 주황 "관리자 교정" 라벨
- **§13.3 민감 액션** — "대규모 wallet 회수" 제거 → "대량 퇴사 처리 (10명 이상)" + "관리자 수동 포인트 교정 (P2)" 로 교체
- **§14.4 / §14.6 시나리오** — 퇴사 관련 플로우에서 "긴급 회수" / "정산 옵션" 모두 제거, 자동 소멸 플로우로 변경
- **§19 Phase task** — P1-3/P1-4 에서 "긴급 회수" 삭제, P1-6 에서 "수동 포인트 충전" 명시. P2-10b 신규 "`mealWalletCompanyAllowanceAdjust` 수동 교정 UI" 추가
- **§20 D-15 신규** — "회사 지원금 = 포인트, 자동 소멸" 정책 확정
- **§5 operations/corporate-budget.ts** — operation 목록 확장 (Load 시리즈, Forecast, Expiring 등)

### 2026-04-08 (인보이스 하이브리드 워크플로우 — Corporate 발행 요청 추가)

사용자 피드백: "Corporate 도 발행 요청은 해야 하는 것 아닌가? 내용 확인 후 발행 요청 버튼 하나만 누르면 SuperAdmin 으로 자동 전달되는 게 맞지 않나? 실제 상용 서비스는 어떻게 작동하는가?"

**조사 결과**:
- 식권대장 / 비플식권 / Pluxee / Sodexo / Edenred 등 식권 전용 플랫폼은 대체로 "자동 발행 + 사후 리포트" 모델이며 명시적 발행 요청 버튼은 공개 문서에 드러나지 않음
- 반면 일반 B2B AP 자동화 (SAP Concur / Tipalti / Coupa / Basware) 는 **multi-level approval workflow** 가 표준
- 사용자의 직관이 정확 — 두 패턴을 결합한 **하이브리드 모델** 이 가장 합리적

**반영 내용**:
- **사양서 `EInvoice-WeTax-사양.md §4.3.2` 재작성** — 5단계 → **6단계 하이브리드 closing 흐름** (cron 자동 DRAFT 생성 → Corporate 검토 → 발행 요청/이의 제기 → 7일 자동 승격 fallback → SuperAdmin 검수 → WeTax 제출 → Corporate 다운로드)
- **사양서 §4.3.2.a 상태 머신 + 전이 허용 매트릭스** 신규
- **사양서 §4.3.3** 트리거 / 검토 window / 자동 승격 / 법적 발행 주체 항목 추가
- **사양서 §14** Phase 1 체크리스트에 상태 머신 확장 필드 10개 + 신규 permission 3개 (`einvoice.request.write` / `einvoice.dispute.write` / `einvoice.dispute.resolve.write`) 추가
- **작업계획서 §4.9** `/invoices` — 상태 enum 확장 (DRAFT/**DISPUTED**/**REQUESTED**/SUBMITTING/ACCEPTED/REJECTED/VOIDED), 상태별 액션 버튼 매트릭스, §4.9.2.a 발행 요청 플로우 + §4.9.2.b 이의 제기 플로우 + §4.9.2.c 7일 자동 승격, 신규 mutation 2개
- **작업계획서 §4.10** `/invoices/[id]` — 상단 sticky "섹션 0 — 상태별 액션 패널" 신규, 섹션 5 검토/발행 타임라인 신규
- **작업계획서 §4.13** Role Matrix 에 `einvoice.request.write` / `einvoice.dispute.write` 2개 permission 추가 (OWNER + FINANCE_ADMIN 만). 권한 분리 의도 설명 박스.
- **작업계획서 §8.3.2** Corporate 도메인 신규 permission 6개 목록에 위 2개 추가
- **작업계획서 §14.2 시나리오 B** — 월초 업무에 "검토 → 발행 요청 또는 이의 제기" 단계 반영. DoD 에 5/10분 목표 추가.
- **작업계획서 §19 Phase 1** — P0-7a/b 에 더해 **P0-7c (발행 요청 플로우)** / **P0-7d (이의 제기 플로우)** 2개 task 추가
- **작업계획서 §20 D-16 신규** — "인보이스 하이브리드 워크플로우" 확정 항목
- SyncWorkers 에 `einvoice-auto-promote.job.ts` daily cron 신규 추가 항목 기재

**설계 원칙 재확인**:
- 법적 발행 주체는 **여전히 플랫폼 사업자**. Corporate 의 "발행 요청" 은 법적 seller 를 바꾸는 것이 아니라 **서비스 구매자의 내용 확인 완료** 표시.
- Corporate 가 `einvoice.request.write` / `dispute` 를 가지지만, 실제 발행 mutation (`einvoice.publish.write` → WeTax HTTP 호출) 은 여전히 SuperAdmin 전용.
- 7일 자동 승격으로 세무 마감일 (Decree 70/2025 매월 20일 권장) 리스크 방지.
- B2B AP 워크플로우 관점에서 Corporate 재무팀의 내부 검토 단계 확보 → 투명성 + 3-Way Matching 보조 + 책임 분담 명확.

### 2026-04-08 (Focus ring 금지 + refetchQueries 금지)

사용자 피드백 2건:

1. **Focus ring 금지**: `ring-2 ring-offset-2` 같은 Tailwind 시각 노이즈 ring 은 사용 금지. SharedUI 의 공용 컴포넌트가 제공하는 `focus-visible` 기반 미묘한 스타일만 따른다. 커스텀 포커스 스타일 신규 정의 금지.
   - §15.2 접근성 규칙 수정

2. **`refetchQueries` 금지 — Cache update 전략 강제**: mutation 후 list query 를 다시 쏘는 패턴 금지. "서버 응답 기반 apollo cache 업데이트 → UI 즉시 업데이트" 가 표준. 불필요한 refetch 는 서버 네트워크 자원 낭비 + UX 지연.
   - §16.2 Apollo 캐시 정책 전면 재작성:
     - `cache-and-network` → `cache-first` 로 변경 (백그라운드 재요청도 자원 낭비)
     - `refetchQueries` / `client.refetchQueries` / `router.refresh` / `window.location.reload` **전부 금지**
     - Cache update 4가지 패턴 명시: (1) normalized cache 자동 덮어쓰기 (2) `cache.modify` list refs 추가/삭제 (3) `cache.evict` (4) 연쇄 변경 시 mutation 응답에 모든 영향 entity 포함
     - `optimisticResponse` 는 단건 toggle 에만 사용 (예: 머천트 allowlist)
     - 예외 허용: 집계 쿼리 (대시보드 KPI) 는 사용자 명시 "새로고침" 또는 page focus 이벤트에 반응
   - §5.2 SharedContracts mutation 작성 규칙에 "Mutation 응답 shape 는 반드시 영향받은 entity 의 완전한 shape 을 반환" 규칙 추가 — cache update 전략의 전제 조건

### 2026-04-08 (3 Provider 필드 전수 매트릭스 + SA Portal /system/settings 탭 기반 UI)

사용자 피드백: "모든 입력항목 누락없이 반영 맞는가? 실제 각 플랫폼 세금계산서 발행 시 요구 필드가 DB 설계에 반영되어야 한다. 그리고 SuperAdmin Portal 에 발행 주체 정보 저장 UI 가 있어야 한다 (http://localhost:3001/system, 사이드바 '설정' 메뉴, 탭 기반)."

**반영 내용**:

**① §5.4 3 Provider 필드 매트릭스 신규** — HJ-POS-TEST 실제 코드 (`WeTaxMgr.h` + `Base.h tViettel_Seller/Buyer` + `MisaTaxMgr.h`) 1:1 분석:
- **§5.4.1 Seller 필드 매트릭스** (15 필드 × 3 provider) — taxCode / legalName / storeCode / addressCity/District/Ward/Detail / bankAccountNumber/Name / contactEmail/Phone/Fax / countryCode / website / orderDate 등
- **§5.4.2 Provider credentials / 고유 설정 매트릭스** (22 필드 × 3 provider) — username/password + 각 provider 별 고유 (WeTax: serialPrefix/formNo/serialType/paymentMethod/storeCode, Viettel: invoiceType/templateCode/invoiceSeries/cusGetInvoiceRight/invoice_cluster/reservationCode/adjustmentType/adjustmentInvoiceType/paymentStatus/validation, MISA: appId/invoiceSeries/adjustmentInvoiceType/useDigitalSign/orgInvTemplateNo)
- **§5.4.3 Buyer 필드 매트릭스** (20 필드) — taxCode / companyName / address 4 분리 / bank 2 / contactEmail/Cc/Phone/Fax / countryCode / budgetUnitCode (공공기관) + 개인 buyer 필드 (buyerIdNo/Type/BirthDay/passport) 는 **의도적 제외** (식권 플랫폼은 buyer=corporate 고정)
- **§5.4.4 Invoice Line 필드 매트릭스** (15 필드) — seq/itemCode/itemName/uom/quantity/unitPrice/amount/vatRate/vatAmount/payAmount/feature/dcRate/dcAmount/vatType/itemType
- **§5.4.5 Invoice Header 필드 매트릭스** (20 필드) — refId/cqtCode/formNo/serialNo/transType/invoiceNo/lookupCode/exchangeRate/paymentMethod/totals/notes 등
- **§5.4.6 누락 필드 체크리스트** — 기존 SP-A22~A28 로 커버되지 않은 9개 필드 식별

**② Phase -1 SP-A29 신규** — §5.4 매트릭스 전수 반영:
- `PlatformLegalEntity`: `storeCode / contactPhone / countryCode / website / legalNameEn / displayNameEn`
- `MealCorporate`: `contactEmailCc / countryCode / budgetUnitCode`
- `MealConsolidatedEInvoice.notes`
- `MealConsolidatedEInvoiceLine.itemType` (MISA 확장)

**③ Phase -1 SP-F 완전 재구성 — `/system/settings` 탭 기반 UI**:
- **SP-F11**: `/system/settings` 신규 route + 탭 컨테이너 + URL query `?tab=xxx` 로 상태 유지
- **SP-F11a**: `nav-items.ts` 에 `system.settings` nav 추가 (icon: `Settings`) + i18n 3언어 (ko/en/vi)
- **SP-F11b 탭 1 플랫폼 사업자 정보** — PlatformLegalEntity 전체 필드 (17 필드) + 63개 베트남 행정단위 dropdown + isActive 불변식 + 변경 이력
- **SP-F11c 탭 2 EInvoice Provider Credentials** — HJ-POS-TEST 이미지 2 직접 대응. Provider 드롭다운 (WeTax/Viettel/MISA) + environment 토글 + 공통/고유 필드 분기 폼 + "테스트 연결" 버튼 + 저장 시 vault 에 credentials, `providerSpecificConfig` JSON 에 설정
- **SP-F11d 탭 3 Provider 모니터링** — 3 provider 카드 + 24h 메트릭 (성공률/latency/에러 breakdown) + failover chain 설정
- **SP-F11e 탭 4 일반 시스템 설정** (P2 skeleton)
- **SP-F11f 탭 5 설정 감사 로그**
- **SP-F12 / SP-F13**: CentralApi 측 API (`platformGet/Create/Update/Deactivate LegalEntity` / `platformGet/Update ProviderConfig` / `platformToggleProviderActive` / `platformTestProviderConnection`) + 신규 permission 2개 (`platform.legal.entity.write` / `einvoice.provider.config.write`)

**④ §23 결정 사항 D-29 / D-30 신규**:
- D-29: 3 Provider 필드 전수 매트릭스 (§5.4) — 누락 9 필드 완전 반영
- D-30: SuperAdmin/Portal `/system/settings` 탭 기반 설정 페이지 — 5 탭 + 권한 분리

**설계 원칙 재확인**:
- 공통 필드는 `EInvoiceProvider` interface 가 보장 → provider 별 body 변환은 serializer 에서
- provider 별 고유 필드는 `providerSpecificConfig` Json (런타임 Zod 검증)
- vault 경로 표준화 (`vault://einvoice/_platform/{providerType}/{env}/credentials`)
- SuperAdmin 단일 UI 에서 3 provider 를 동일 추상화로 관리 → CorporatePortal 에 provider 차이가 노출되지 않음

### 2026-04-08 (Viettel / MISA / WeTax 3 provider 반영 + Buyer/Seller 필드 확장)

사용자 피드백: "HJ-POS-TEST 에 Viettel / MISA / WeTax 3개 플랫폼으로 세금계산서 발행 가능한데 현 프로젝트 설계에 반영되어 있는가? 그리고 이미지 2장의 입력 항목 (buyer 발행 화면 / provider credentials 설정 화면) 이 현 DB 및 코드에 반영되어 있는가?"

**분석 결과**:
- HJ-POS-TEST 에 실제 3 provider 구현 확인: `WeTax/WeTaxMgr.{h,cpp}` (1,842 lines) / `ExcelAuto/ViettelTaxMgr.{h,cpp}` (52 KB) / `ExcelAuto/MisaTaxMgr.{h,cpp}` (31 KB)
- 기존 설계는 enum 에 `WETAX / BIZZI / MISA / DIRECT_GDT` 로 **Bizzi 가 잘못 들어가 있었음** (Bizzi 는 HJ-POS-TEST 에 없음, Viettel 이 실제 구현)
- 이미지 1 (Viettel S-Invoice 발행 화면) 의 buyer 필드와 현재 `MealCorporate` 스키마 대조 → **주소 분리 / fax / 은행 계좌 / 은행명 누락**
- 이미지 2 (Viettel credentials 설정 화면) 의 seller 필드와 현재 `EInvoiceProviderConfig` 스키마 대조 → **Viettel 고유 필드 (InvoiceType / TemplateCode / InvoiceSeries) 담을 곳 없음** — WeTax 전용 default* 필드만 존재

**반영 내용**:

**① Enum 정정**: `BIZZI` → **`VIETTEL`** 교체 (작업계획서 + 사양서 전 문서 일괄 교체)

**② 사양서 구조화**:
- §0.3 신규 — HJ-POS-TEST 3 provider 매트릭스 박스 (WeTax / Viettel / MISA 의 레거시 경로 / Base URL / 인증 방식 / 구현 우선순위)
- §17.1 전면 재작성 — 3 provider 각각의 Phase 4 구현 계획 (HTTP 엔드포인트 / 고유 설정 필드 / 구현 위치)
- **§17.1.1 공통화 전략 매트릭스** 신규 — 공통 필드 / provider 별 고유 필드 15개 비교 표
- 기존 `Bizzi` 언급 전수 교체 (`BizziProvider` → `ViettelProvider`, "failover (Bizzi 있으면)" → "failover (Viettel 또는 MISA 있으면)")

**③ DB schema 확장** (Phase -1 SP-A 신규 task 7건):
- **SP-A22**: `MealCorporate` 주소 4개 분리 필드 (`addressCity / addressDistrict / addressWard / addressDetail`) + `addressFull` trigger 자동 조합
- **SP-A23**: `MealCorporate` 추가 연락/은행 필드 (`contactFax / bankAccountNumber / bankName`)
- **SP-A24**: `PlatformLegalEntity` 동일 분리 필드 — seller 도 3 provider 요구 대응
- **SP-A25**: **`EInvoiceProviderConfig.providerSpecificConfig` Json 필드 신규** — provider 별 고유 설정 분기 저장 (Viettel: InvoiceType/TemplateCode/InvoiceSeries/cusGetInvoiceRight/invoiceCluster / MISA: invoiceSeries/adjustmentInvoiceType/orgTaxAuthorityCode / WeTax: serialPrefix/formNo/serialType/paymentMethod/storeCode)
- **SP-A26**: Vault 경로 구조 표준화 (`vault://einvoice/{corporateId}/{providerType}/{env}/credentials`) + provider 별 key 매핑 문서화
- **SP-A27**: `EInvoiceBuyerProfile` 모델 (미래 확장 P4, skeleton 만)
- **SP-A28**: Migration + SANDBOX 적용

**④ SuperAdmin/Portal 화면 3개 신규** (Phase -1 SP-F):
- **SP-F11 (SA-EINV-PROVIDER-001)** — Provider Credentials 설정 화면 (HJ-POS-TEST 이미지 2 기반). provider 드롭다운 → provider 별 고유 폼 분기 (WeTax / Viettel / MISA)
- **SP-F12 (SA-EINV-PROVIDER-002)** — Provider 활성 / failover 체인 / 성공률 모니터링
- **SP-F13 (SA-EINV-PROVIDER-003)** — PlatformLegalEntity 관리 화면 (주소 4 필드 분리)

**⑤ CorporatePortal §4.12 `/settings/company` 화면 확장**:
- **탭 1b 주소 분리** 신규 — `addressCity / addressDistrict / addressWard / addressDetail` 분리 입력 (이미지 1 대응)
- **탭 2b 은행 정보** 신규 — `bankAccountNumber / bankName` + `contactFax` 추가
- 검증 규칙 확장 — 베트남 63개 행정단위 dropdown (P1) + 은행 계좌 형식 / E.164 전화번호

**⑥ §4.10 인보이스 상세 섹션 2/3 snapshot 필드 목록 확장** — seller/buyer 양쪽 모두 분리 주소 4 필드 + 은행/Fax 포함. provider 별 매핑 주석 추가.

**⑦ §23 결정 사항 D-27 / D-28 신규**:
- D-27: 3 Provider (WeTax / Viettel / MISA) 완전 지원 — Phase 1 WeTax 단독, Phase 4 Viettel+MISA 동시
- D-28: Buyer/Seller 주소 분리 + Fax + 은행 필드 추가 — 3 provider 공통 요구사항

**설계 원칙 재확인**:
- 공통 필드 (seller / buyer / lines / totals / currency) 는 `EInvoiceProvider` interface 가 보장 → provider 별 body 변환은 serializer 에서
- provider 별 고유 필드는 `providerSpecificConfig` Json 에 자유 저장 (Zod 런타임 검증 P1)
- vault 경로 표준화로 secret rotation 자동화 가능
- 3 provider 모두 동일한 포털 UI 에서 관리 → SuperAdmin 이 "어떤 provider 를 쓸지" 만 선택하면 나머지는 자동

### 2026-04-08 (리뷰 피드백 5건 반영 — Permission 통일 / FIFO / Geofencing / HRIS / Generic 로드맵)

사용자 리뷰 피드백 5가지를 모두 반영:

**① Permission Key 리소스 중심 통일 (einvoice.*)**:
- 기존 `corporate.invoice.*` + `platform.einvoice.*` 혼재 → **`einvoice.*` 단일 네임스페이스** 로 통일
- 8개 permission 정의: `einvoice.read / request.write / dispute.write / publish.write / retry.write / void.write / revert.write / dispute.resolve.write`
- SuperAdmin 과 Corporate 가 **같은 permission key 를 공유**하되 `scope` (PLATFORM vs CORPORATE + scopeCorporateId) 로만 범위 제한
- §8.3.2 전면 재작성 — 리소스 중심 vs 기능 중심 비교 + 테이블로 역할별 할당 명시
- §4.13 Role Matrix / §4.9 상태별 액션 / §5 operations / §22 SP-B1a (마이그레이션 task) / §23 D-26 (결정) 전수 교체
- sed 로 전 문서 일괄 교체

**② Carryover FIFO 로직 + UI 투명성** (§9.4 전면 재작성):
- 포인트 Lot 스택 개념 도입 — 각 funding entry 가 "원본 충전" 또는 "이월 생성" 으로 구분됨
- FIFO (선입선출) 소진 규칙 — 가장 먼저 만료되는 Lot 부터 차감
- 월말 cron 의 이월/만료 로직 pseudocode 명시 (`carryoverCount < policy.carryoverMaxMonths` 이면 Lot 승계, 아니면 EXPIRED)
- **UI 투명성 원칙** — `/employees/[id]` 의 Allowance Ledger 카드에 Lot 상세 표시 (소멸 예정일 D-day + 원본 배치 + 이월 횟수). 민원 방지 핵심.
- §22 SP-A17 (`MealTicketWalletFundingEntry` 에 `remainingVnd` / `carryoverCount` / `sourceBatchId` / `effectiveFromAt` / `effectiveToAt` 필드) + SP-A18 (`MealTransactionAllowanceUsage` join 테이블 신규)
- §16.9 인덱스 추가 — FIFO 소진 쿼리용 `(walletId, status, effectiveToAt ASC, createdAt ASC) WHERE status='POSTED'`
- Phase P1 구현 (P0 는 정책 빌더만)

**③ Google Maps Bounding Box 지오펜싱** (§4.8 View B 대폭 확장):
- "전체 마커 로딩" 금지 → **Bounding Box 기반 viewport-based loading**
- `mealEnrolledMerchantsByCorporate(corporateId, bbox: { swLat, swLng, neLat, neLng }, limit=500)` 쿼리
- **Debounce 300ms** + Apollo cache bbox key + 중첩 viewport 캐싱
- **LOD** (Level of Detail): z < 12 안내 / z 12~14 클러스터 / z >= 15 개별 마커
- 마커 클러스터링 (`@googlemaps/markerclusterer`)
- Google Maps API 비용 관리 (일일 한도, SKU 별 사용 모니터링, GCP billing alert 70/90/100%)
- §22 SP-A21 신규 — `Branch.lat` / `Branch.lng` 컬럼 + GIST 또는 btree 인덱스 + 기존 row Google Geocoding 백필
- §16.9 인덱스 추가 — `Branch(lat, lng) GIST`

**④ HRIS isExternalSync 플래그 P0 승격**:
- 기존 P2 로 미뤘던 HRIS 충돌 해결 UI 중 **`isExternalSync` 플래그 가드는 P0 으로 승격**
- `MealEmployee.isExternalSync` + `externalSyncSourceId` + `externalSyncLastAt` 필드 추가
- 서버 mutation 가드: `isExternalSync=true` 면 기본정보 수정 `EMPLOYEE_EXTERNALLY_SYNCED` 에러
- CorporatePortal 전용 필드 (배지 / 정책 / 메모) 만 수정 가능
- UI 표시: 탭 1 에 🔒 아이콘 + "Base.vn 에서 동기화 중" 안내 + 마지막 싱크 시각
- 부서도 동일 원칙 (`MealCorporateDepartment.isExternalSync`)
- §22 SP-A19 / SP-A20 신규 + §22 P0-3b task 에 가드 명시 + §16.9 `MealEmployee(corporateId, isExternalSync)` 인덱스
- **이유**: HRIS 실제 연동 구현은 여전히 P2 지만, 가드 로직은 P0 부터 작동해야 나중에 연동 시 "과거에 수동 수정된 레코드" 와 HRIS 원본이 충돌하는 사태 방지

**⑤ Generic EInvoice 추상화 + Meal* 접두사 제거 로드맵** (§19.7 신규):
- 현재는 **premature abstraction 금지** — `MealConsolidatedEInvoice` 를 식권 전용으로 구현
- 2번째 도메인 (물류 / 자재) 요구사항 나오면 공통 패턴 추출하여 `GenericConsolidatedEInvoice` 리팩토링
- **Snapshot 보존 원칙** 재강조 — seller / buyer / 라인 / provider response 는 immutable
- Status 머신 / Consolidation 전략 / Provider 추상화 / Portal 컴포넌트 각각의 추출 가능성 명시
- **Meal\* 접두사 제거 로드맵** — Phase 4 (신규 도메인부터 중립 용어) / Phase 5 (alias + deprecation) / Phase 6 (실제 rename, breaking change)
- 긴급도 낮음 — Phase 0~3 동안은 현재 용어 유지
- 단 Phase 0~3 동안 지킬 원칙: 새 infra / 유틸리티 엔티티는 `Meal*` 접두사 없이 작성 (이미 `CorporateAdminUser` / `EInvoiceProvider` / `PlatformLegalEntity` 는 중립적)

### 2026-04-08 (SA 주도 Funding Policy 부여 flow 반영)

사용자 피드백: "슈퍼관리자가 특정 기업/회사 고객 별로 신용도 평가하여 선지급(Prepaid) 또는 후불(Credit) 정책을 부여/미부여 할 수 있어야 한다. 각 corporate 는 그 정책에 따라 임직원들에게 식권 사용권 부여 전 사전 예치금 입금 또는 사용 후 지불 방식이 되어야 한다."

**반영 내용**:

- **§4.6 `/budget` 전면 재작성** — `4.6.0 Funding Policy SuperAdmin 책임 원칙` 신규 섹션 + funding model 4종 (`UNASSIGNED` / `PREPAID_DEPOSIT` / `CREDIT_NET15` / `CREDIT_NET30`) 매트릭스 + SA vs Corporate 책임 분리 + 서버 enforcement pseudocode
- **§4.6.1 화면 구성** — 섹션 1 Funding Policy 상태 카드를 3가지 케이스별 ASCII 예시로 재작성:
  - 케이스 A (UNASSIGNED) — 신용도 평가 대기 안내 + SuperAdmin 문의 CTA + 임직원 충전 불가 경고
  - 케이스 B (PREPAID_DEPOSIT) — 에스크로 잔액 / 월 예산 / 사용 중 / 소진 예상 D-day / 은행 납입 안내
  - 케이스 C (CREDIT_NET15/30) — 신용 한도 / 사용률 / 한도 여유 / 다음 정산일 / 한도 상향 요청
- **§4.6.5 허용 action 매트릭스** — funding model 별 허용/차단 액션 표
- **§4.6.6 엣지 케이스** — UNASSIGNED 시도 / 예치금 부족 / 한도 초과 / PREPAID↔CREDIT 전환 시 잔액 처리
- **§9.4.5 신규** — "Funding Policy 가 Allowance 발행의 전제 조건" — 인과 관계 체인 9단계 + 각 단계별 enforcement
- **§22 Phase -1 SP-A 확장** (A13~A17 신규) — `fundingModel` enum 에 `UNASSIGNED` 추가 / 신용도 평가 필드 6개 / `MealCorporateFundingPolicyHistory` / `MealCorporateFundingDepositRecord` 신규 모델 + migration
- **§22 Phase -1 SP-B 확장** (B8~B11 신규) — SA 전용 funding policy permission 3개 (`fundingpolicy.write` / `credit.assess.write` / `deposit.approve`) seed + Corporate role 에 절대 부여 금지 회귀 테스트 + 기존 샘플 corporate row `UNASSIGNED` 로 data migration
- **§22 Phase -1 SP-C 확장** (C15 realtime topic 2개 추가, C16~C19 신규) — funding policy enforcement guard / SA funding mutation 4개 / Corporate 측 funding 요청 mutation 2개 / transaction service 승인 가드 확장
- **§22 Phase -1 SP-F 확장** (F7~F10 신규) — SuperAdmin/Portal 의 신규 4 화면: SA-CORP-FUND-001 (신용도 평가 + funding policy 부여) / SA-CORP-FUND-002 (PREPAID 예치금 승인) / SA-CORP-FUND-003 (funding policy 이력 / 한도 조정) / SA 대시보드 funding 위젯
- **§5 operations 테이블** — `operations/corporate-budget.ts` 에 `mealFundingPolicyHistory / mealCorporateRequestFundingPolicyUpgrade / mealFundingAccountDepositRecord` 추가
- **§8.3.2 SuperAdmin 전용 permission** 목록에 3개 funding 관련 permission 명시적 금지 추가
- **§4.13 Role Matrix** 에 `corporate.wallet.fund` / `corporate.funding.read.limit` 구분 + SA 전용 3개 permission 금지 row
- **§14.1 Onboarding 시나리오** 전면 재작성 — 3 Phase 로 분할:
  - Phase 1: Corporate 기본 설정 (OWNER 로그인 첫 1시간, funding 부여 전 — 임직원 등록까지 가능)
  - Phase 2: 신용도 평가 (오프라인, SA 주도, 1~5 영업일)
  - Phase 3: funding 입금 / 첫 충전 (PREPAID 는 은행 송금 + SA 승인 1~2 영업일, CREDIT 은 즉시)
- **§23 결정 사항 D-21~D-25 신규** — 신용도 평가 SLA / tier 기준 / PREPAID↔CREDIT 전환 정책 / outstanding 정산 방식 / Corporate 의 funding 정보 열람 범위

**설계 원칙 재확인**:
- funding policy 는 **플랫폼 공급자의 핵심 risk 관리 영역** — Corporate 가 자율로 선택할 수 없고, 반드시 SA 의 신용도 평가 후 부여
- UNASSIGNED 는 "임시 정지" 가 아니라 "기본 상태" — 신규 가입 / 연체 / 계약 해지 임박 모두 UNASSIGNED 로 수렴
- 포털 UI 는 funding model 을 **읽기 전용 으로 표시** + 변경 "요청" 만 가능 — 실제 변경은 SA mutation 으로만
- 서버 측 enforcement 3중 (transaction authorize 시 / `corporate.wallet.fund` mutation 시 / 월초 cron 시) 으로 절대 누락 방지

### 2026-04-08 (Phase -1 Server Prerequisites 섹션 신규)

사용자 피드백: "이 프로젝트 구현작업 전 서버측에 선행되어야 할 작업들은 명시된거야?"

**문제**: 기존 Phase 0 F-3 ~ F-7 은 실제로 **서버 측 작업** (CentralApi seed / prisma / resolver / SyncWorkers / SharedContracts) 이었음. 이를 "Phase 0" 라고 묶어놓으니 책임 프로젝트 / 블로킹 관계 / 완료 확인 방법이 흐려져서, 포털 개발자가 "Phase 0 부터 시작하면 되겠네" 라고 착각할 위험 존재.

**해결**:

- **§22 에 Phase -1 Server Prerequisites 섹션 신규 삽입** — 8개 sub-phase (SP-A ~ SP-H) 로 서버 선행 작업 전수 분해:
  - **SP-A DB 스키마 & Migration** (🔴 CentralApi) 13 task — prisma schema 확장 + 신규 인덱스 5종 + data migration (BUILT → DRAFT)
  - **SP-B RBAC & Seed** (🔴 CentralApi) 7 task — permission 6개 seed + Role template 4개 + Role×Permission matrix + PlatformLegalEntity 초기 row + EInvoiceProvider seed
  - **SP-C Corporate 도메인 Resolver / Service** (🔴 CentralApi) 15 task — profile/department/employee/admin/policy/wallet/merchant/einvoice 전체 + consolidator 5 그룹화 + wetax client 실제 구현 + mutation full shape 규칙 + 상태 머신 enforcement + DataLoader + realtime publisher
  - **SP-D SyncWorkers Cron** (🟠 SyncWorkers) 6 task — consolidation / auto-promote / monthend-expire / retention-archive / 분산 락 / 실패 알림
  - **SP-E SharedContracts** (🟡) 7 task — DTO 12개 + enum 13종 + permissions typed + operations 9 파일 + mutation full shape 규칙 적용 + dist 빌드 + workspace link
  - **SP-F SuperAdmin/Portal** (🟢) 6 task — SA-EINV-001~007 7 화면 + PlatformLegalEntity 관리 + EInvoiceProvider 관리 + 초기 OWNER 발급 flow + 긴급 복구 flow
  - **SP-G 인프라 / 운영 계약** (⚪ DevOps) 13 task — WeTax SANDBOX/PROD 계약 + Vault + Google Maps API / PostgreSQL / Redis / S3 / Sentry / Grafana / CI/CD / DNS / Email / WebSocket
  - **SP-H QA / 테스트** (🔵 QA) 6 task — 단위 테스트 + WeTax SANDBOX E2E + 하이브리드 워크플로우 E2E + RBAC 금지 mutation 차단 + 월초 cron 부하 + migration rollback

- **Phase -1 완료 게이트 (Exit Criteria)** 명시 — 8개 checkbox 로 "Phase 0 착수 가능 여부" 판정
- **병행 가능 task** 명시 — Phase 0 F-1 / F-2 / F-5 / F-7 은 서버 선행 없이도 진행 가능. F-3 (codegen) / F-4 (Apollo) / F-6 (AppShell) / F-8 (rbac hooks) / F-9 (login) / F-11 (Sentry) 는 특정 SP 완료 후에만 가능 (블로킹 선행 컬럼 명시)

- **Phase 0 정리** — 기존 F-3 ~ F-7 (서버 작업) 을 Phase -1 로 이관. Phase 0 은 이제 **포털 내부 bootstrap 11 task (F-1 ~ F-11)** 로 축소. 각 F-n 에 "블로킹 선행 SP-x" 컬럼 추가하여 dependency 명시.

**결과**: 프로젝트 매니저 / PM 이 "서버 준비는 어디까지 됐지?" 를 볼 수 있는 **단일 체크리스트** 확보. 포털 개발자가 mock 에 의존해 진행하다가 뒤늦게 대규모 rework 하는 사태를 방지.

### 2026-04-08 (전체 검토 — 정합성 + 성능/관측성/유지보수/확장성 보강)

사용자 피드백: "전체적으로 문서 다시 검토. 정합성/누락/불일치 모두 수정. 성능/최적화/유지보수/확장성 고려 내용 반영."

**정합성 수정**:
- 구버전 `BUILT` 상태 잔재 제거 (작업계획서 W6 위젯 설명 / 사양서 §4.5 publish 가드 / §14 Portal 화면 체크리스트)
- §17 인증/세션 / §18 테스트 / §21 완료정의 의 subsection 번호 오류 정정 (`11.1 → 17.1`, `12.1 → 18.1`, `15.1 → 21.1`)
- §5 operations 테이블의 `corporate-einvoice.ts` 에 신규 mutation 2개 (requestIssuance / dispute) + 이번 달 쿼리 누락 보완
- `corporate-budget.ts` operations 에 Forecast / LoadBatches 등 누락 보완

**DTO / Enum 보강 (§5.3 대폭 확장)**:
- `MealTicketEInvoiceStatus` enum 재정의 (BUILT 제거, DISPUTED / REQUESTED 추가)
- 하이브리드 워크플로우 9개 필드 (reviewDueAt / requestedBy / requestedAt / autoPromoted / disputedBy / disputedAt / disputeReason / disputeResolvedAt / disputeResolvedBy) 명시
- `MealCorporate.einvoiceReviewDays` 필드 추가
- 기타 enum 11종 완전 목록화 (`MealTicketWalletFundingEntryStatus` 에 `EXPIRED` 포함)

**Phase 0 task 재정렬** (§22):
- F-3 을 "seed permission 6개 + Role template 4개" 로 구체화 (발행 요청 / 이의 제기 permission 2개 추가)
- F-4 를 F-4a / F-4b / F-4c 로 분할: (a) allowlist 모델 (b) 인보이스 하이브리드 10 필드 + status enum 확장 + BUILT→DRAFT 이관 (c) funding entry EXPIRED
- F-5 을 F-5a / F-5b / F-5c / F-5d 로 분할: (a) 누락 resolver (b) einvoice 상태 머신 enforcement + 신규 mutation 7개 (c) einvoice-consolidator 5 그룹화 실구현 (d) SyncWorkers 3개 cron (consolidation + auto-promote + monthend-expire)
- F-9 Apollo provider 설정을 cache-first + keyFields + ErrorLink + RetryLink + dedup 로 구체화
- F-12 i18n 에 `error-map.ts` 추가
- F-16 Observability 기초 (Sentry / error boundary / logger wrapper) 신규 task

**신규 섹션 3개 추가 (§16 뒤 삽입)**:
- **§16 성능 섹션 확장** — 16.8 Core Web Vitals 목표 / 16.9 DB 인덱스 설계 (기존/신규 인덱스 목록) / 16.10 N+1 방지 / 16.11 Large payload 최적화
- **§17 관측성 / 로깅 / 모니터링** — 5 절 (클라이언트 텔레메트리 / 구조화 로그 / 서버 correlation / 모니터링 대시보드 / Alerting 정책)
- **§18 유지보수 / 운영** — 7 절 (버전 호환성 / Feature flag / 문서화 / CI/CD / 의존성 / 런북 / Graceful degradation)
- **§19 확장성 / 스케일링** — 6 절 (스케일링 축 / 수평 확장 / 대용량 corporate / 멀티 provider/corporate/country / 데이터 retention / 비용 관리)
- 기존 §17 ~ §24 는 §20 ~ §27 로 재번호 매김

### (다음 작업자)

**0. 결정 사항 사용자 승인** (Phase -1 착수 전):
- [ ] §23 결정 사항 사용자 승인 받기 (D-1 / D-2 / D-4 / D-6 / D-7 / D-8 / D-10 / D-14 / D-17 / D-18 / D-19 / D-20 남음. D-3 / D-5 / D-9 / D-11 / D-12 / D-13 / D-15 / D-16 는 이미 확정)

**1. Phase -1 Server Prerequisites 착수** (가장 중요):
- [ ] SP-A (🔴 CentralApi DB schema & migration) — 13 task
- [ ] SP-B (🔴 CentralApi RBAC & seed) — 7 task (PlatformLegalEntity 초기 row 포함)
- [ ] SP-C (🔴 CentralApi corporate 도메인 resolver) — 15 task (**mutation full shape 규칙 준수 필수** §5.2)
- [ ] SP-D (🟠 SyncWorkers cron) — 6 task (consolidation / auto-promote / monthend-expire)
- [ ] SP-E (🟡 SharedContracts DTO/Enum/Operations) — 7 task
- [ ] SP-F (🟢 SuperAdmin/Portal 발급자 검수 화면) — 최소 SP-F5 (초기 OWNER 발급 flow) 우선 완료
- [ ] SP-G (⚪ 인프라 / 운영 계약) — WeTax SANDBOX / Google Maps / Redis / S3 / Sentry / DB / CI 13 task
- [ ] SP-H (🔵 QA 테스트) — 최소 SP-H1~H4 완료

**2. Phase -1 Exit Criteria 통과 확인** (checkbox 8개)

**3. Phase 0 Foundation (CorporatePortal 내부 bootstrap) 착수** — F-1 (완료) → F-2 → ... → F-11

**4. Phase 1 P0 Screens 개발** — P0-1 부터 순서대로 또는 독립 task 병렬

---

## 26. 참고 자료

### 26.1 기반 문서 (프로젝트 내부)

- `1.Docs/식권관리플랫폼/프로젝트 개요.md` — 비즈니스 기획, 주체별 역할, 수익 모델
- `1.Docs/식권관리플랫폼/EInvoice-WeTax-사양.md` — 월별 통합 인보이스 사양 (`§4.3 통합 모드`)
- `1.Docs/기획 및 설계/프로젝트 통합설계/00-Platform-최종-아키텍처-기준서.md`
  - `§2.1` Corporate 계층 신설
  - `§99` MealTicket 도메인 편입
  - `§100` BrandHQ Entitlement
- `1.Docs/기획 및 설계/프로젝트 통합설계/01-SuperAdmin-기능리스트.md` `§13.1`
- `1.Docs/기획 및 설계/프로젝트 통합설계/DB설계/10-전체-테이블-컬럼-마스터.md` `§1.1 ~ §1.17`
- `CorporatePortal/CLAUDE.md` / `CorporatePortal/README.md`

### 26.2 형제 프로젝트 (복제 기준)

- `SuperAdmin/Portal/` — Next.js + Apollo + Redux + SharedUI 조합의 성숙한 예시
  - `src/providers/apollo.ts`
  - `src/rbac/*`
  - `src/shared/layout/*`
  - `codegen.ts`
  - `package.json`
  - `eslint.config.mjs`

### 26.3 공유 패키지

- `SharedContracts/ApiSdk/src/mealticket/*` — 공용 DTO/enum
- `SharedContracts/ApiSdk/src/operations/*` — GraphQL operation 원본 (corporate 관련 신규 파일 추가 필요)
- `SharedUI/` — 공용 UI 원본 (확장은 여기서)

### 26.4 CentralApi 스키마 & RBAC

- `SuperAdmin/CentralApi/prisma/schema/70-mealticket.prisma` — MealTicket DB 모델
- `SuperAdmin/CentralApi/prisma/schema/15-rbac.prisma` — RBAC DB 모델 (`Permission` / `Role` / `RolePermission` / `UserRoleAssignment`, scope 4축 포함 `scopeCorporateId`)
- `SuperAdmin/CentralApi/prisma/seed.ts` — 기존 `corporate.*` permission 25개 + legacy role 8개 seed. CorporatePortal 을 위해 permission 4개 + role template 4개 추가 필요 (§8.3.2 / §8.3.3)
- `SuperAdmin/CentralApi/src/core/rbac/` — `PermissionService`, `@RequirePermission` 데코레이터, `PermissionGuard` (단일 진입점)
- `SuperAdmin/CentralApi/src/platform/corporate/*` — leaf 별 resolver/service (profile/wallet/einvoice/policy/merchant/settlement/transaction 이 이미 존재, department/employee sub-leaf + allowlist + admin 관리 resolver 추가 필요)
- `SuperAdmin/CentralApi/src/platform/superadmin/rbac/` — SuperAdmin 용 Role/Permission/UserRoleAssignment CRUD resolver (CorporatePortal 은 이것을 소비하지 않고 제한된 `mealCorporateRolePermissionMatrix` / `mealCorporateAdminMe` query 만 사용)

### 26.5 외부 벤치마크 플랫폼 (기능 설계 참고)

작업계획서 작성 시 아래 플랫폼의 실제 제품 문서 / 사이트를 참고하여 기능을 보강했다. **디자인이나 상표 복제는 하지 않으며**, 오직 "B2B 식권 플랫폼의 관리자 포털이 일반적으로 제공하는 기능 카탈로그" 를 확보하기 위해 참조함.

**한국 (Korea)**:
- **식권대장 (Vendys)** — `https://sikdae.com/` — 국내 No.1 B2B 마켓플레이스. 부서별 예산 관리 / 사용 내역 통계 / 식권 발행·회수 / 부서별·식당별 통계 기능을 참조.
- **비플식권 (Webcash)** — `https://mealzeropay.gitbook.io/guide` — 관리자 가이드. 3종 보고서 (식권별 / 사용자별 / 가맹점별 현황 보고서), 기간·사업장·식권용도 필터, 엑셀 다운로드 패턴을 §4.7 / §11 에 반영.
- **식신e식권 (Siksin)** — `https://www.siksine.com/` — 유사 영역.

**글로벌 (Europe / India / Americas)**:
- **Pluxee (구 Sodexo BRS)** — `https://www.pluxee.in/` — 인도 시장 리더. 카드 발급 · 재충전 · 리포팅 · monthly reconciliation 패턴, NFC 기반 contactless 결제 UX 참고.
- **Edenred** — `https://www.edenred.com/` — 유럽 / 브라질 대표. Ticket Restaurant 상품, 식당 온보딩 도구 패턴 참고.
- **Swile (Lunchr)** — 프랑스 스타트업. HR 대시보드 + 단일 카드·앱 패턴 (§4.1 대시보드 영감).

**베트남 (Vietnam)**:
- **Base.vn HRM** — `https://base.vn/` — 베트남 SaaS HRM 리더. 1인당 월 35,000~95,000 VND SaaS 가격 모델, ESS 포털 패턴. HRIS 연동 1차 대상 (§4.11).
- **PITO** — B2B 케이터링. 모바일 앱 내 plug-in 연동 아이디어 (§P2 확장).
- **GrabFood / ShopeeFood** — 시장 가격 비교 용도 (수수료 대비 타깃팅).

**공통 패턴**:
- **DoorDash for Business** — 실시간 스펜딩 대시보드 / 팀/위치별 참여도 / 컴플라이언스 / 정책 관리 UX 참고.
- **ezCater** — 팀 예산 / 주간·월간 허용량 / 정책 설정 UX 참고.
- **eMenuCard** — HR 분석 애플리케이션 / 중앙 집중 대시보드 / 사용 현황 보고서 패턴 참고.

**법규**:
- `Decree 70/2025/ND-CP` — 베트남 e-Invoice 최신 개정
- `Decree 123/2020` — 전자세금계산서 의무화
- `Circular 32/2025` — e-Invoice 운영 세부 지침
- `Circular 003/2025/TT-BNV` + `Decree 44/2025/NĐ-CP` — 식대 수당 PIT 면제 한도 전면 폐지

---

## 27. FAQ

**Q1. 왜 CorporatePortal 을 SuperAdmin/Portal 과 합치지 않는가?**
A. 기준서 `§99.2` 가 Corporate 계층을 SuperAdmin 과 **도메인 모델이 0% 겹치지 않는** 별도 주체로 정의한다. SuperAdmin 은 플랫폼 사업자의 내부 운영 도구이고 Corporate 는 외부 고객 기업의 self-service 포털이다. 합치면 RBAC 복잡도가 폭증하고 공급자 도구가 외부 고객에게 노출된다.

**Q2. 왜 BrandPosApp/PosUi 와 합치지 않는가?**
A. 마찬가지로 BrandHQ (제휴식당) 와 Corporate (식권 고객 기업) 는 서로 다른 주체 (제휴식당은 메뉴/지점을 소유, 고객 기업은 임직원/예산을 소유). 두 주체는 같은 플랫폼에서 **거래 상대방** 이다.

**Q3. 왜 `/merchants` 를 P0 에 넣는가? 1 차 릴리스에는 전체 카테고리 허용으로 충분하지 않은가?**
A. 기획 문서 §3.1 에서 "디지털 포인트는 조건부 토큰" 이라고 명시한다. 카테고리 허용만으로는 특정 블랙리스트 (예: 술집) 차단이 불가능하므로 P0 에 편입. 단, 지도/고도화는 P1 으로 미룸.

**Q4. 왜 `/invoices` 에 재발행 / 수정 기능이 없는가? (Corporate 는 "발행 요청" 은 할 수 있음)**
A. 인보이스 흐름은 **하이브리드 워크플로우** (사양서 §4.3.2) 이며 Corporate 의 권한은 제한적이다:

**Corporate 가 할 수 있는 것** (`einvoice.request.write` / `dispute`):
- DRAFT 상태 인보이스 검토 후 "발행 요청" 버튼 (DRAFT → REQUESTED)
- DRAFT 상태 인보이스에 "이의 제기" 버튼 (DRAFT → DISPUTED, 사유 필수)
- ACCEPTED 상태 인보이스 PDF/XML 다운로드

**Corporate 가 할 수 없는 것** (`einvoice.publish.write` — SuperAdmin 전용):
- 실제 WeTax HTTP 호출 / GDT 제출
- ACCEPTED 된 인보이스 수정
- REJECTED 된 인보이스 재제출
- VOIDED 처리

베트남 세무 법규 (Decree 123/2020, Circular 32/2025) 상 **법적 발행 주체 (seller) 는 플랫폼 사업자 (서비스 공급자)** 이며 이 역할은 Corporate 가 대신할 수 없다. Corporate 의 "발행 요청" 은 법적으로 **서비스 구매자의 내용 확인 완료** 를 의미하며, 실제 GDT 제출은 여전히 SuperAdmin 의 책임이다.

**Q5. React Query 쓰면 안 되나?**
A. Platform CLAUDE.md 규칙: 포털 서버 상태 관리는 Apollo Client만. React Query 금지.

**Q6. 새 UI 컴포넌트 (예: Tree D&D) 가 SharedUI 에 없으면?**
A. **SharedUI 를 먼저 확장한 뒤** CorporatePortal 에서 사용. CorporatePortal 내부에 별도 원본을 만들지 않는다. SharedUI 확장 PR 은 `SharedUI/CLAUDE.md` 의 variant 규칙을 따른다.

**Q7. 왜 지도는 Google Maps 만 쓰는가? Mapbox / Naver 가 더 싸지 않나?**
A. (1) 베트남 현지 POI (식당 / 카페 / 편의점) 커버리지가 Google 이 가장 완전하다. (2) Naver Maps 는 한국 특화이며 베트남 주소 / 거리 정보가 불충분. (3) Mapbox 는 베트남 지번 주소를 정확히 geocoding 하지 못하는 경우가 빈번. (4) 베트남어 / 한국어 / 영어 라벨을 동시에 지원. (5) 한 플랫폼에서 Places / Geocoding / Distance Matrix / Static Maps 를 모두 제공 → API 키 1개로 끝. 비용은 SuperAdmin 의 GCP 프로젝트에서 공통 정산.

**Q8. 왜 CorporatePortal 에서 머천트 자체를 등록 / 수정 / 삭제할 수 없는가?**
A. 머천트는 **플랫폼 사업자 (SuperAdmin) 가 BrandHQ 와 가맹 계약을 맺은 법적 자산** 이다. 수수료율 / 정산 계좌 / 계약 종료일 같은 상업 조건은 SuperAdmin 만 건드릴 수 있어야 한다. CorporatePortal 은 그 카탈로그 위에서 "우리 회사 임직원은 어떤 식당에서 식권을 쓸 수 있는가?" 라는 **큐레이션만** 담당. 즉 SuperAdmin = 카탈로그 owner, Corporate = 큐레이터.

**Q9. 왜 초기 OWNER 는 CorporatePortal 에서 발급하지 않는가?**
A. 닭과 달걀 문제다. 첫 OWNER 가 없으면 누가 CorporatePortal 에 로그인해서 다른 사람을 초대하겠는가? 해결책은 **SuperAdmin 이 corporate 온보딩 시 OWNER 1명을 원자적으로 발급** 하는 것. 이것은 기존 SuperAdmin/Portal 의 corporate 관리 flow 에 이미 자연스럽게 녹아든다. OWNER 분실 / 퇴사 시에도 SuperAdmin 이 비상 복구.

**Q10. 왜 RBAC 를 클라이언트에 하드코딩하지 않는가? 편하게 보기에는 enum 이 낫지 않나?**
A. 하드코딩 role 이름의 가장 큰 문제는 **서버와 포털의 동기화 실패**. 서버가 permission 을 추가하거나 role template 을 수정하면 포털도 같이 배포해야 한다. 서버 RBAC 시스템을 단일 원본으로 두면, 포털은 `mealCorporateAdminMe` 가 반환하는 permission 집합만 보고 UI 를 렌더하면 된다. 권한 격상 / 오버라이드 / 부서 스코프 확장 같은 고급 기능도 서버 한 곳에서 관리 가능. 다만 타입 안전성을 위해 permission key **상수** 는 `SharedContracts` 에서 typed enum 으로 공유한다 (하드코딩 아님, enum type).

**Q11. 같은 사람이 여러 corporate 의 admin 이면?**
A. P0 기준으로는 **1 CorporateAdminUser 계정 = 1 corporate** (`CorporateAdminUser.corporateId` 가 FK). 같은 사람이 여러 회사를 관리하려면 회사별로 별도 계정 가입. P2 에서 "같은 email 로 여러 `UserRoleAssignment` (서로 다른 `scopeCorporateId`)" 확장 검토.

**Q12. OWNER 가 완전히 사라지면 어떻게 복구?**
A. 마지막 OWNER 해제는 서버가 `CANNOT_DEMOTE_LAST_OWNER` 로 차단한다. 그럼에도 사망 / 퇴사 / 계정 분실로 마지막 OWNER 가 접근 불가능해지면, SuperAdmin 이 SuperAdmin/Portal 에서 긴급 `CORPORATE_OWNER` 재발급. 이 작업은 AuditLog 에 `action=EMERGENCY_OWNER_RECOVERY` 로 기록.

**Q13. 왜 회사 지원금을 "지급" 이나 "회수" 가 아니라 "충전 / 소멸" 이라고 표현하는가? 사용자가 혼동하지 않는가?**
A. 정반대다. "지급 / 회수" 는 사용자를 혼동시킨다. 이유:

(1) **법적 성격**: 회사 지원금은 임직원의 개인 자산이 아니라 회사가 복지 목적으로 지정한 **조건부 예산**이다. 식권 결제에만 쓸 수 있고, 출금 / 양도 / 현금화 불가. 따라서 "지급" (임직원에게 소유권 이전) 이라는 표현은 법적으로 부정확하다.

(2) **퇴사 시 처리**: "회수" 라는 단어는 "한번 준 걸 다시 빼앗는" 뉘앙스라 노동 분쟁의 소지가 있다. 실제로는 애초에 임직원 소유가 아니었으므로 "회수" 가 아니라 **자동 만료** 가 정확한 표현. `EXPIRED` 라는 DB 상태가 이를 반영.

(3) **회계 처리**: 회사 입장에서 이 금액은 "선지급된 부채" 가 아니라 "복지비 예산 할당". 월말에 미사용분은 임직원에게 빚진 돈이 아니라 **복지비 미집행**으로 회계 처리된다.

(4) **사용자 멘탈 모델**: 선불카드 / 마일리지 / 포인트는 전 세계 사용자가 이미 친숙한 개념. "300 포인트 충전됨, 이번 달 말 소멸 예정" 같은 문구는 쿠팡 / GrabFood / ZaloPay 에서 일상적으로 본다. 오히려 "지급 / 회수" 가 더 생소하고 위협적으로 느껴진다.

(5) **국제 표준**: Pluxee (Sodexo), Edenred, Swile 의 공식 문서 모두 **"load" (충전) / "expire" (만료)** 용어를 사용. 업계 관행과 일치.

**Q14. 퇴사 시 관리자가 "회수할지 말지" 선택할 수 있어야 하지 않나? 어떤 경우에는 유지하고 싶을 수도 있지 않나?**
A. 선택 옵션을 만들면 오히려 문제가 생긴다:

(1) **일관성 보장**: 선택 옵션이 있으면 관리자마다 / 상황마다 다른 결정이 나온다 → 감사 대응 시 "왜 A는 회수하고 B는 유지했는가?" 질문에 대답할 근거가 필요. 자동화하면 규칙 한 줄 ("퇴사 = 자동 소멸") 로 설명 끝.

(2) **법적 리스크**: 관리자의 자의적 판단으로 일부 임직원은 포인트가 유지되고 일부는 소멸되면 **차별 대우 소송** 근거가 될 수 있다.

(3) **포인트 의미 붕괴**: 퇴사 후에도 포인트가 유지되면 임직원은 "내 돈" 으로 느끼게 되고, 소멸 시 분쟁이 격해진다. 처음부터 "조건부 포인트" 라는 규칙이 명확해야 함.

(4) **예외 상황 대응**: 만약 정말 특별한 이유로 퇴사자에게 포인트를 남겨야 한다면, P2 의 `mealWalletCompanyAllowanceAdjust` (수동 교정) 를 쓴다. 이는 감사 필수 + 이중 확인이 걸린 **극히 드문 관리자 액션**이며, 일반 퇴사 플로우와 분리되어 있다.

**Q16z. 왜 Corporate 가 직접 funding model 을 선택할 수 없는가?**
A. Funding policy (Prepaid vs Credit) 는 **플랫폼 공급자의 핵심 risk 관리 영역** 이다. Corporate 가 자유롭게 선택하게 하면 다음 문제가 발생한다:

(1) **Risk 선택 편향**: 누구나 CREDIT_NET30 을 선택하려 한다 (현금 흐름 유리). 플랫폼은 채권 리스크를 전부 떠안음 → 파산 위험.

(2) **신용도 평가의 의미 상실**: 플랫폼이 Corporate 의 재무제표 / 신용 등급 / 영업 규모를 검토하지 않고 Corporate 가 원하는 대로 부여하면, B2B 금융 비즈니스의 기본 원칙이 무너진다.

(3) **Pluxee / Edenred / Sodexo 벤치마크**: 이들 글로벌 플랫폼도 "Corporate 가 자율 선택" 이 아니라 "Sales 팀 + Credit 팀 이 승인" 한다. 대기업은 credit, 중소기업은 prepaid 가 업계 표준.

(4) **부동 자산 (Float) 전략**: 기획서 §6.3 에서 "예치금 운용 이자 수익" 을 핵심 수익원으로 정의. 이 모델이 작동하려면 PREPAID 고객이 일정 비율 이상 유지되어야 한다 → 플랫폼이 portfolio 관점에서 고객 분포를 조절해야 함.

(5) **분쟁 시 명확성**: "왜 나는 CREDIT 을 못 쓰지?" 문의가 들어와도 "신용도 평가 결과" 라는 객관적 기준이 있어야 Sales 팀이 대응할 수 있다.

따라서 Corporate 는 "funding model 변경 **요청**" 만 할 수 있고 (`mealCorporateRequestFundingPolicyUpgrade`), 실제 결정은 SuperAdmin 이 신용도 재평가 후 승인/거절한다.

**Q16y. UNASSIGNED 상태에서 임직원 등록은 왜 가능한가? 함께 막는 게 논리적이지 않나?**
A. 의도적 설계다. Corporate OWNER 가 Phase 1 (기본 설정) 을 마치는 동안 Phase 2 (신용도 평가, 1~5 영업일) 가 병렬로 진행되도록 하기 위함. 즉:

- Corporate 는 신용도 평가 제출 → 대기 중 "임직원 명단 / 부서 / 정책 / 허용 머천트" 를 미리 세팅
- SuperAdmin 이 funding policy 를 부여한 순간 → 이미 모든 준비가 끝나있으므로 즉시 포인트 충전 가능
- 이 병렬 진행 덕분에 onboarding 총 소요 시간이 "순차 진행" 대비 절반으로 단축 (2~7일 → 0.5~2일 체감)

단, **임직원 wallet 은 발급되지만 `companyAllowanceVnd=0`** 이며 서버가 충전 mutation 을 차단한다. 즉 "폼 준비" 는 가능하되 "실제 발행" 은 차단.

**Q16x. CREDIT 모델에서 Corporate 가 돈을 못 내면 어떻게 하는가?**
A. 다단계 대응:

1. **경고** (한도 80% 시): 자동 알림 → Corporate OWNER + FINANCE_ADMIN 에 이메일
2. **한도 초과** (100%): 새 포인트 충전 / 거래 승인 자동 차단 → Corporate 에 alert
3. **Net term 연체** (Net15/30 경과): 플랫폼 내부 연체 플래그 → SA 에 경고
4. **연체 7일**: SA 가 `platformSuspendCorporateFunding` → `UNASSIGNED` 로 강등 → 임직원 거래 전면 차단 → 재무팀 법무 검토
5. **연체 30일+**: 법무 조치 / 계약 해지 / 미수금 청구 소송

이 단계들은 AuditLog 에 전수 기록되고, Corporate 에게 각 단계별 공식 통지가 발송된다.

**Q16. 왜 Corporate 가 "발행 요청" 을 하는 하이브리드 모델을 채택했는가? 식권대장 / Pluxee 는 자동 발행 아닌가?**
A. 맞다. 식권 전용 플랫폼 (식권대장 / 비플식권 / Pluxee / Sodexo / Edenred) 의 공개 문서에는 명시적 "Corporate 발행 요청" 버튼이 드러나지 않는다. 하지만:

(1) **일반 B2B AP 자동화 표준**: SAP Concur / Tipalti / Coupa / Basware 는 모두 **multi-level approval workflow** 를 필수 기능으로 제공한다. "buyer 측 재무팀이 공급자의 인보이스를 내부 검토 후 지급" 하는 흐름이 B2B 표준.

(2) **투명성**: Corporate 가 내용을 검토할 기회 없이 자동 발행되면 이상 거래 발견 시점이 늦어진다. 하이브리드 모델은 Corporate 재무팀이 1차 검수자로 참여하게 하여 3-Way Matching 을 보조한다.

(3) **책임 분담**: "왜 이 금액인가?" 라는 감사 질문에 대해 "Corporate 재무팀이 내용을 확인하고 발행 요청했다" 라는 근거가 AuditLog 에 남는다. 분쟁 시 책임이 명확하다.

(4) **B2B 관계의 투명성**: 플랫폼 사업자가 Corporate 에게 "너희 동의 없이 세금계산서를 발행했다" 는 느낌을 주면 신뢰 관계가 무너진다. Corporate 의 확인 단계는 파트너십 신호.

(5) **자동 fallback 으로 리스크 제거**: 7일 무응답 시 자동 승격 → 세무 마감 리스크는 제로. Corporate 관리자 부재 / 휴가 / 방치 에도 발행 지연 없음.

(6) **법적 seller 는 불변**: Corporate 의 "발행 요청" 은 법적 seller 를 바꾸는 것이 아니라 "서비스 구매자의 내용 확인 완료" 를 표시하는 것. 실제 WeTax 호출과 GDT 제출은 여전히 플랫폼 사업자 (SuperAdmin) 책임.

즉 **"식권 플랫폼의 자동화 편의" + "B2B AP 의 검토 투명성" + "자동 fallback 의 안전망"** 세 가지를 모두 달성하는 하이브리드 모델이 현재 설계다.

**Q16a. Corporate 가 "이의 제기" 를 남발하면 어떻게 되는가?**
A. 이의 제기 사유는 최소 30자 텍스트 + 감사 로그 필수 기록. SuperAdmin 이 조사 후 "이의 기각" 할 수 있으며 (P2), 반복적 남용은 Corporate OWNER 에게 경고 이메일 발송 (P2). 단, 초기에는 이의 제기를 막을 이유가 없으므로 P0 에서는 제약 없이 허용한다.

**Q16b. 7일 자동 승격 후 Corporate 가 "발행 취소" 할 수 있는가?**
A. 아니다. 자동 승격되어 REQUESTED 상태가 되면 SuperAdmin 검수 + WeTax 제출이 진행된다. 만약 제출 전에 이상을 발견하면, Corporate OWNER 가 SuperAdmin 에게 직접 연락하여 "긴급 revertToDraft" 를 요청할 수 있다 (P1). REQUESTED 에서 다시 DRAFT 로 되돌리는 mutation 은 SuperAdmin 전용이다.

**Q15a. 왜 `refetchQueries` 를 쓰지 않는가? Apollo 공식 패턴이 아닌가?**
A. Apollo 가 `refetchQueries` 옵션을 제공하는 건 사실이지만, 그건 "쉬운 길" 이지 "옳은 길" 이 아니다. 이유:

(1) **서버 자원 낭비**: 한 번의 mutation 을 위해 list query 를 다시 쏘는 것은, 이미 서버가 응답으로 준 정보를 버리고 똑같은 데이터를 다시 달라고 하는 꼴이다. corporate 1개당 임직원이 5000명이라면, 매 mutation 마다 5000명 리스트를 다시 serialize / 네트워크 전송 / 역직렬화 하는 비용이 발생한다.

(2) **UX 지연**: mutation 응답이 와도 UI 는 아직 stale 상태. refetch 가 끝날 때까지 사용자는 "뭐가 바뀌었는지" 볼 수 없다. 반면 cache update 는 mutation 응답 즉시 UI 반영.

(3) **Race condition**: refetch 도중 사용자가 추가 mutation 을 하면 순서가 꼬인다. cache update 는 이벤트 순서대로 선형적으로 반영된다.

(4) **네트워크 환경**: 베트남 현장은 3G/4G 네트워크가 흔하다. 한 번의 클릭이 "mutation + refetch" 두 번의 왕복을 만들면 체감 속도가 반으로 준다.

(5) **설계 방향**: 서버 mutation 이 "변경된 entity 전체" 를 반환하는 것은 GraphQL 의 정석이다. REST 의 `POST → 201 + Location` 패턴과 달리, GraphQL 은 응답에 full shape 을 담도록 설계되어야 한다. 그 전제를 지키면 `refetchQueries` 는 필요 없다.

**예외**: 집계 쿼리 (대시보드 KPI, 예산 forecast) 는 단일 entity 가 아니라 여러 테이블의 sum / count 를 조합한다. 이 경우에도 mutation 직후가 아니라 사용자가 명시적으로 "새로고침" 버튼을 누르거나 page focus 이벤트에 반응하는 형태로만 refetch 를 허용한다.

**Q15b. 왜 focus ring 을 쓰지 않는가? 접근성에 필요하지 않나?**
A. 접근성은 `focus-visible` 이 충족한다. `ring-2 ring-offset-2` 같은 Tailwind 의 유틸 ring 은:

(1) **시각 노이즈**: 2px 링 + 2px offset + shadow 가 총 6~8px 의 공간을 차지해 조밀한 테이블 / 폼 UI 를 망가뜨린다.

(2) **화면 흔들림**: 링이 기존 레이아웃 크기를 넘어 표시되므로, 포커스 이동 시 주변 요소가 밀려나는 것처럼 보인다.

(3) **일관성 부재**: 각 화면에서 ring 두께 / 색상 / offset 이 제각각이면 디자인 시스템이 깨진다.

(4) **SharedUI 가 이미 제공**: 공용 버튼 / 입력 / 탭이 내부적으로 `focus-visible` 기반의 미묘한 스타일 (배경 음영 변화, 1px border 강조, 브라우저 기본 outline 개선) 을 적용한다. 화면 단에서 추가 정의가 필요 없다.

(5) **WCAG 2.1 AA 준수**: WCAG 는 "focus 가 시각적으로 구분 가능" 을 요구할 뿐, ring 이어야 한다고 요구하지 않는다. 배경 음영 + border 1px 변화로도 충분히 만족한다.

SharedUI 에 focus-visible 스타일이 누락된 컴포넌트를 발견하면, **SharedUI 를 확장** 하는 PR 을 먼저 낸다. CorporatePortal 내부에 ring 을 커스텀으로 추가하지 않는다.

**Q15. `EXPIRED` 와 `REVERSED` 의 차이는?**
A. 완전히 다른 성격이다:

- `EXPIRED`: **시스템이 자동 수행**. 퇴사 / 월말 만료 / 정책 만료. 규칙 기반이므로 관리자 개입 없음. UI 라벨: "자동 소멸". 자주 발생 (매월 말, 퇴사 시).
- `REVERSED`: **관리자가 수동 교정**. 배포 실수 (예: 실수로 1,000,000 VND 를 10,000,000 VND 로 충전) 를 되돌릴 때. 감사 필수 + 이중 확인 + 사유 입력. UI 라벨: "관리자 교정". 극히 드물게 발생. P2 에서만 지원.

두 상태를 같은 색 / 같은 라벨로 표시하면 "왜 이 포인트가 사라졌는가?" 질문에 답할 수 없으므로, UI 에서 색상 (회색 vs 주황) 과 라벨로 명확히 구분한다.

---

*본 작업계획서는 production-ready P0 릴리스까지 가는 경로를 확정한다. Phase 0 착수 전에 §23 의 남은 결정 사항을 사용자 승인 받아야 한다.*
