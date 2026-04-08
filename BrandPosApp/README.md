# BrandPosApp

`경로`: `/BrandPosApp`

## 역할

- 실제 매장에 설치되는 EdgePos 패키지다.
- POS mode와 Setup / Maintenance mode를 하나의 앱으로 제공한다.

## 고정 스택

- `C++ Native Host + CEF + Next.js(TypeScript) + SQLite`

## 반드시 지킬 규칙

- 로컬 SQLite가 업무 원본이다.
- 중앙 API를 로컬 거래 원본처럼 사용하지 않는다.
- UI 상태 관리는 `RTK Query + Redux Toolkit`으로 고정한다.
- `React Query`를 도입하지 않는다.
- `MFC UI`를 다시 도입하지 않는다.
- 번역 원본은 `BrandPosApp/PosUi/src/i18n/locales` 같은 앱 내부 i18n이 소유한다. `SharedAssets`는 번역 원본을 두지 않는다.
