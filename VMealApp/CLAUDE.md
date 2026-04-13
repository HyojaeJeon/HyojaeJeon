# VMealApp

`경로`: `/VMealApp`
상위 규칙: `../CLAUDE.md`

## 역할
- 식권 플랫폼의 B2E 임직원 전용 모바일 앱이다 (React Native + TypeScript).

## 구현 규칙
- **TypeScript 필수** — 모든 소스 코드는 `.ts` / `.tsx`. JS 파일 금지 (설정 파일 제외).
- 서버 상태는 `Apollo Client`, UI 상태는 `Redux Toolkit + Redux Persist`.
- GraphQL 서버는 `CentralApi` 단일. REST 호출 금지.
- 실시간 채널은 `graphql-ws` (GraphQL Subscription) 단일. Socket.IO 금지.
- 공유 계약은 `SharedContracts/ApiSdk` 단일 원본 (enums, DTOs, events).
- 전화번호는 E.164 형식 필수 (`SharedContracts/ApiSdk/src/phone/phoneUtils.ts`).
- 결제/주문은 **온라인 필수**. 오프라인 결제 전면 불가.
- 모든 결제는 서버 `mealOrderCreate` mutation 통과 후에만 가맹점에 주문 전달.
- 앱에 **제휴 가맹점 중 소속 기업이 허용한 식당만** 노출. 비제휴/비허용 식당 표시 금지.
- 번역 원본은 `src/i18n/locales/` 내부. 3개 언어 (vi/ko/en) 필수.
- OS 권한 요청 다이얼로그는 3개 언어 모두 지원.
- 사원증 RFID 연동은 관리자(CorporatePortal)만 가능. 앱에서는 조회 + 분실 신고만.

## 디렉토리 구조
```
src/
├── assets/          # 폰트, 이미지, 아이콘
├── config/          # 환경 변수, 상수
├── graphql/         # Apollo Client, queries, mutations, subscriptions, codegen
├── i18n/            # i18next 설정 + locales/vi,ko,en
├── navigation/      # React Navigation (RootNavigator, MainTabNavigator)
├── providers/       # AppProviders (Redux, Apollo, i18n, SafeArea 래핑)
├── screens/         # 화면별 폴더 (1 화면 = 1 폴더)
├── services/        # 비즈니스 로직 서비스 (auth, permission, notification)
├── shared/          # 공용 hooks, utils, ui components, constants
└── store/           # Redux Toolkit (slices: auth, wallet, settings)
```

## Naming
- 폴더명: `camelCase` (예: `walletHome/`, `merchantMap/`)
- 화면 컴포넌트: `PascalCase` (예: `WalletHomeScreen.tsx`)
- Hook: `camelCase` (예: `useWallet.ts`)
- 상수: `UPPER_SNAKE_CASE`
- GraphQL operation: `camelCase` (예: `mealOrderCreate`)
