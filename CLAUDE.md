# Platform

이 문서는 이 저장소에서 **반드시 지켜야 하는 규칙만** 적는다.
설명성 내용이나 구현 예시는 넣지 않는다.

## Source Of Truth

우선순위는 아래 순서다.

1. `1.Docs/기획 및 설계/프로젝트 통합설계/00-Platform-최종-아키텍처-기준서.md`
2. 플랫폼별 설계서 (`01~06`)
3. `1.Docs/.../DB설계/`
4. 각 프로젝트 루트 README

현재 코드와 문서가 충돌하면 **코드를 기준으로 합리화하지 말고 문서를 기준으로 수정**한다.

## 전체 공통 규칙

- 신규 플랫폼은 `SuperAdmin / RegionalDistributor / BrandHQ / Branch / EdgePos / Device` 계층을 따른다.
- `HJ-POS-TEST`는 기능 참고용이다. 구조, 코드, DB를 그대로 복제하지 않는다.
- 새 디렉토리, 새 계층, 새 통신 방식은 설계 문서에 없는 한 임의로 추가하지 않는다.
- 번역 원본은 각 프로젝트 내부 i18n 이다. `SharedAssets` 에 i18n 을 두지 않는다.
- 공통 DTO / enum / event / GraphQL 계약의 원본은 `SharedContracts` 하나다.
- `SharedContracts/ApiSdk` 의 GraphQL operation export 는 build-time drift validation 이 실제로 읽을 수 있는 평면 계약을 유지해야 한다. `0 operations` 검출 상태를 정상으로 취급하지 않는다.
- 웹 기반 프로젝트의 공용 UI 패턴 원본은 `SharedUI` 하나다. `BrandPosApp` 만 예외로 자체 `PosUi/src/shared/ui` 를 유지한다.
- 파일/이미지 업로드는 `SharedContracts/ApiSdk/src/upload`의 `useUpload` 훅과 `uploadFile`/`rollbackUploadedFiles` 유틸을 단일 원본으로 사용한다. 업로드 후 후속 작업 실패 시 반드시 `rollback(keys)`으로 업로드된 파일을 삭제한다.
- 웹 클라이언트의 실시간 채널은 **graphql-ws (GraphQL `Subscription`) 단일** 이다. Socket.IO·subscriptions-transport-ws·자체 WebSocket 허브 도입 금지. `BrandPosApp` 은 CEF bridge 만 사용하므로 적용 대상 아님.
- 모달(Modal)은 `max-height` 를 설정하고, 헤더/푸터를 고정한 채 **컨텐츠 영역에만 `overflow-y: auto`** 를 적용한다. 패널 전체가 스크롤되어 헤더/푸터가 밀려나는 형태 금지.

## RBAC 권한 키 규칙

- **진실의 원천**: `SuperAdmin/CentralApi/src/core/rbac/permissionDefinitions.ts` 단 하나다.
- **키 형식**: `resource:action` (예: `distributors:create`, `wallets:fund`). 서브리소스가 필요하면 `resource:sub:action`.
- **CRUD 단위**: 최소 `list` / `read` / `create` / `update` / `delete`. 도메인 고유 액션(예: `fund`, `topup`, `approve`, `submit`)은 필요 시 추가.
- **와일드카드**: `*` (전체), `resource:*` (해당 리소스 전체), `resource:sub:*` (해당 서브리소스 전체). 와일드카드 매칭 로직은 `permissionDefinitions.ts`의 `matchPermission()`과 Portal `useHasPermission.ts`에 동일하게 구현.
- **메뉴 매핑**: `MENU_PERMISSION_STRUCTURE`가 사이드바 메뉴 ↔ 권한 카테고리를 연결. 메뉴 추가 시 반드시 여기도 업데이트.
- **클라이언트 동기화**: Portal은 `permissionCatalog` GraphQL query로 권한 카테고리/메뉴 구조를 동적 로드. Portal `rbac/permissions.ts`의 `PERMISSIONS` 객체는 빌드 타임 참조용 레거시 별칭만 유지하며 새 키의 원천이 아니다.
- **역할 권한 저장**: `Role.permissions` JSON 배열 (예: `["dashboard:view", "distributors:*"]`). `permissionVersion` 필드로 클라이언트 캐시 무효화.

## 전화번호

- 저장·전송 형식은 E.164 단일 표준이다: `+{국가번호}{로컬번호}` (예: `+84795050727`, `+821012345678`). 로컬 번호의 선행 0 은 항상 제거한다.
- 유효성 검사·정규화 유틸은 `SharedContracts/ApiSdk/src/phone/phoneUtils.ts` 단일 원본이다. 클라이언트·서버 양쪽에서 동일하게 사용한다.
- UI 입력은 `SharedUI` 의 `PhoneInput` 컴포넌트를 사용한다. 국가 선택기 + 로컬 번호 입력을 제공하며, 선행 0 자동 제거 + E.164 출력을 보장한다.

## Naming

- DB table name: `PascalCase`
- 신규 Platform DB column name: `camelCase`
- 레거시 HJ-POS DB column name: 기존 그대로 유지
- Directory / folder name: `camelCase` (예: `menuCategory/`, `edgePos/`, `auditLogScreen/`). 단일 단어는 그대로 소문자 (예: `auth/`, `cache/`, `models/`)
- Source file name (class export — Component, Module, Service, Resolver, Guard, Model, DTO 등): `PascalCase` (예: `AppShell.tsx`, `AuthSession.module.ts`, `UserService.ts`)
- Source file name (function/value export — hook, util, helper, constant, slice, config 등): `camelCase` (예: `useAuth.ts`, `rootReducer.ts`, `errorCodes.ts`)
- NestJS suffix (`.module`, `.service`, `.resolver`, `.guard`, `.model`, `.input`, `.args` 등) 는 소문자 dot 표기를 유지한다 (예: `AuthSession.module.ts`)
- `index.ts` 는 public export 용도로만 사용한다. feature 내부 barrel 은 최소화한다.
- 다국어 필드는 `name` (베트남어 기본) / `nameKo` / `nameEn` 3 컬럼 조합만 사용한다. `description` 이 다국어가 필요하면 `description` / `descriptionKo` / `descriptionEn` 을 쓴다. 그 외 suffix (`_vi`, `_kr`, `Vn` 등) 금지.
- TypeScript / JavaScript / JSON / GraphQL field: `camelCase`
- Type / Interface / Class / C++ method: `PascalCase`
- constant / enum value: `UPPER_SNAKE_CASE`
- 닫힌 도메인의 디스크리미네이터 문자열 (예: `actorType`, `scopeType`, `status`, `loopType`, `userType`, `policyType`) 은 TypeScript `enum` 으로 선언되어 있지 않더라도 enum value 로 취급하여 `UPPER_SNAKE_CASE` 로 작성한다. 코드/DB/JSON 어디에 있든 동일하다.
  - 좋음: `'SYSTEM'`, `'EDGE_POS'`, `'BRAND_HQ'`, `'REGIONAL_DISTRIBUTOR'`, `'GLOBAL'`, `'PREPAID_DEPOSIT'`, `'OPEN_LOOP'`, `'ACTIVE'`
  - 금지: `'System'`, `'EdgePos'`, `'BrandHQ'`, `'RegionalDistributor'`, `'Global'`, `'PrepaidDeposit'`
- 단, **모델 클래스 식별자를 그대로 미러링하는 문자열 필드** (예: `AuditLog.targetType` 가 `'SuperAdminUser' | 'BrandHqEntitlement' | 'Role' ...` 처럼 Prisma 모델 명을 직렬화하는 경우) 는 모델 명과 1:1 매칭이 추적성에 더 중요하므로 `PascalCase` 를 유지한다. 이 예외는 "모델 → 식별자" 규칙이 명시적으로 문서화된 필드에만 적용한다.
- Do not create mixed-resource aggregate files such as `models/index.ts` or `dto/index.ts` for unrelated features. Split by resource; `index.ts` is for minimal public export only.

## SuperAdmin 규칙

- SuperAdmin 은 서버 전용 디렉토리가 아니라 `Portal / CentralApi / SyncWorkers` suite boundary 다.
- 포털 서버 상태 관리는 `Apollo Client`만 사용한다.
- 중앙 API는 `NestJS + Fastify + Apollo Server`다.
- 기본 API 표면은 GraphQL이다.
- REST는 `SuperAdmin/CentralApi` 안에서만 예외적으로 사용한다.
- Redis와 DataLoader는 서버 책임이다. 포털에서 직접 사용하지 않는다.
- CentralApi는 EdgePos 로컬 거래 원본을 소유하지 않는다.
- 멀티테넌트 스코프는 서비스/쿼리 레이어에서 강제해야 한다.

## BrandPosApp 규칙

- 런타임 기준은 `C++ Native Host + CEF + Next.js(TypeScript) + SQLite`다.
- `MFC UI`를 다시 도입하지 않는다.
- 로컬 SQLite 커밋이 업무 성공 기준이다.
- 중앙 API, 브라우저 메모리, Redux snapshot을 업무 원본으로 사용하지 않는다.
- `Setup / Maintenance`는 별도 앱이 아니라 `BrandPosApp` 내부 모드다.
- 상태 관리는 `RTK Query + Redux Toolkit`이다. `React Query`는 금지다.

## BrandPosApp 레이어 규칙

- `Presentation/CEF/InternalBridge`는 thin router다.
- `InternalBridge`에서 SQL, 트랜잭션, 오케스트레이션을 수행하지 않는다.
- `UseCases`만 트랜잭션, idempotency, lock, ledger, outbox, UI event 순서를 결정한다.
- `Domain`은 순수 업무 규칙만 가진다. UI 송신, 외부 ACK, sync 정책을 결정하지 않는다.
- `Infrastructure`는 기술 구현만 가진다. 업무 성공 여부를 판정하지 않는다.
- `PosRealTimeSender`는 `UseCases`에서만 호출한다.

## BrandPosApp UI 규칙

- UI를 구현하는 프로젝트는 재사용 가능한 UI 원본을 각 프로젝트의 `shared` 경로에 둔다.
- 화면은 `shared` 컴포넌트를 import해서 사용하고, 화면 안에서 새 UI 원본을 직접 만들지 않는다.
- 공통 디자인 변경은 `shared` 컴포넌트 수정만으로 전체 화면에 반영될 수 있어야 한다.
- `width`, `height`, variant, event handler, query/api adapter 같은 화면별 차이는 props로 주입한다.
- 화면 구현은 `화면리스트/화면설계,구조,요소/`의 화면 문서와 표준 템플릿을 단일 기준으로 삼는다.
- 화면 문서와 구현 파일명 표기는 `BrandPosApp/PosUi` 실제 구조 기준의 `.ts` / `.tsx` 파일명만 사용한다.
- 화면 구현이 끝나면 해당 화면 문서의 `작업 진행 기록`에 완료 범위와 남은 범위를 반드시 기록한다.
- `PosUi` 화면 컴포넌트는 `window.cefQuery`를 직접 호출하지 않는다.
- 브리지 호출은 `PosUi/src/bridge`를 통해서만 수행한다.
- 서버 상태는 RTK Query 캐시가 원본이고, slice는 UI 상태만 가진다.
- `PosUi/src/shared/ui`가 재사용 UI 원본이다.
- `app/design-system`과 `app/design-docs`는 원본 UI를 소비하는 preview/documentation route다.
- `screens` 안에 재사용 컴포넌트 원본을 만들지 않는다.
- 모든 화면의 UI 요소(버튼, 카드, 입력, 탭, 스테퍼, 칩 등)는 반드시 `shared/ui` 공용 컴포넌트를 사용한다. 화면 내부에 inline으로 동일 역할의 요소를 직접 만들지 않는다. 공용 컴포넌트에 필요한 variant나 prop이 없으면 공용 컴포넌트를 먼저 확장한 뒤 사용한다.

### React Compiler / 최적화 규칙

- `BrandPosApp/PosUi`는 React Compiler v1.0(`babel-plugin-react-compiler`)이 적용되어 있다 (`next.config.ts: reactCompiler: true`).
- React Compiler가 `useCallback`, `useMemo`, `React.memo`의 역할을 자동으로 수행하므로, **가급적 수동 메모이제이션을 사용하지 않는다.**
- 예외 — 다음 상황에서만 수동 사용을 허용한다:
  - `useEffect`/`useLayoutEffect`의 의존성 배열에서 참조 안정성이 반드시 필요한 경우
  - 고비용 계산(O(n²) 이상, 1000+ 항목 반복 등)을 명시적으로 캐싱해야 하는 경우
  - 외부 라이브러리 API가 참조 동일성을 요구하는 경우 (예: `window.addEventListener` 콜백)
- 새 코드에서 `useCallback`/`useMemo`를 사용할 때는 반드시 `// React Compiler로 대체 불가: [이유]` 주석을 남긴다.

## Offline / Sync 규칙

- Outbox는 중앙 동기화용 데이터만 보낸다.
- 카드 승인, QR 승인, 배달앱 실시간 승인/거절 요청은 Outbox 재전송 대상으로 두지 않는다.
- 외부 실시간 승인형 거래는 오프라인이면 진입 차단한다.
- 온라인 복구 후에도 과거 승인 요청을 자동 재실행하지 않는다.

## i18n / Error 규칙

- 브릿지 payload에 완성 문장을 싣지 않는다.
- 장치/도메인 오류는 프로젝트 내부 code 기반 필드로 전달하고, 필요 시 해당 프로젝트 내부 i18n 키로 매핑한다.
- 번역 원본은 각 프로젝트 내부 i18n 이다. 외부 공용 번역 원본은 두지 않는다.
