# Portal

`경로`: `/SuperAdmin/Portal`

## 역할

- 공급사 운영용 독립 웹 앱이다.
- `SuperAdmin/CentralApi`의 하위 폴더가 아니라 `SuperAdmin` suite 안의 sibling project다.

## 고정 스택

- `Next.js(TypeScript) + App Router + Apollo Client`
- 공용 UI 패턴 원본은 `SharedUI` 를 사용한다.

## 화면 구조 초안

- `Dashboard`
- `Tenants`
  - `Distributors`
  - `Brands`
    - `Branches` 탭
      - `Edge POS` 탭
    - `Catalog` 탭
  - `Corporates`
- `Deploy`
  - `Packages`
  - `Releases`
  - `Rollouts`
- `Governance`
  - `Licenses`
  - `Entitlements`
  - `Platform Policies`
  - `RBAC`
  - `SuperAdmin Users`
- `Operations`
  - `Sync Monitor`
  - `Realtime Health`
  - `EdgePos Telemetry`
  - `Incidents`
  - `Remote Support`
- `Audit & System`
  - `Audit Log`
  - `Reference Data`
  - `System Health`

브랜드 소유 리소스인 `Branches` 와 `Catalog` 는 최상위 독립 메뉴가 아니라 `Tenants > Brands` 상세 탭으로만 노출한다. Edge POS 단말의 등록/수정/제어는 `Tenants > Brands > Branches > Edge POS` 탭에서 처리하고, `Operations > EdgePos Telemetry` 는 전사 장치 관제만 담당한다.

## 경계

- 서버 로직은 여기 두지 않는다.
- API는 `SuperAdmin/CentralApi`만 호출한다.
- `CentralApi`와 `SyncWorkers`의 구현을 여기서 복제하지 않는다.
- 공용 UI 컴포넌트는 `SharedUI` 에서만 가져오고, 포털 내부에 별도 공용 UI 원본을 만들지 않는다.

## 반드시 지킬 규칙

- 서버 상태는 `Apollo Client`만 사용한다.
- `Redux Toolkit`은 UI 상태에만 사용한다.
- `Redis`와 `DataLoader`는 직접 사용하지 않는다.
- 공통 계약은 `SharedContracts`를 사용한다.
- 번역 원본은 이 포털 내부 `src/i18n`을 사용한다.
- 브랜드 내부 운영 화면이나 EdgePos 장치 제어 UI를 중복 구현하지 않는다.
