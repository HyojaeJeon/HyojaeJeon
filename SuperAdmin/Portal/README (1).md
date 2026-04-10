# Portal

`경로`: `/SuperAdmin/Portal`

## 역할

- 공급사 운영 포털이다.

## 고정 스택

- `Next.js(TypeScript) + App Router + Apollo Client`

## 반드시 지킬 규칙

- 서버 상태는 `Apollo Client`만 사용한다.
- `Redux Toolkit`은 UI 상태에만 사용한다.
- `Redis`와 `DataLoader`는 직접 사용하지 않는다.
- 공통 계약은 `SharedContracts`를 사용한다.
- 번역 원본은 `SharedAssets/i18n/locales`를 사용한다.
- 브랜드 내부 운영 화면이나 EdgePos 장치 제어 UI를 중복 구현하지 않는다.
