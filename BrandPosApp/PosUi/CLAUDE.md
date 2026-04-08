# PosUi

`경로`: `/BrandPosApp/PosUi`
상위 규칙: `../CLAUDE.md`

## 역할
- EdgePos 용 Next.js (TypeScript) 프론트엔드.

## 기본 규칙
- 서버 상태는 `RTK Query` 만 사용. slice 는 UI 상태만.
- 화면에서 `window.cefQuery` 직접 호출 금지. `src/bridge` 만 사용.
- 재사용 UI 원본은 `src/shared/ui`. 카탈로그는 `src/shared/ui/INDEX.md`.
- 계약 원본: 중앙 GraphQL 은 `SharedContracts/ApiSdk`, EdgePos bridge 는 `src/contracts/<domain>/*.types.ts`.
- 번역 원본은 `src/i18n` (PosUi 내부).
- mock transport 로 C++ 없이 UI 개발 가능해야 한다.
- **디자인 토큰만 사용**. raw hex (`#ff0000`), 임의 px (`text-[14px]`), Tailwind palette 직접 (`bg-red-500`) 금지. 의미 토큰(`bg-pos-error`, `h-touch`, `rounded-pos-input`, `text-md`) 만 사용.
- **라이트 / 다크 테마 모두 필수 지원**. 모든 색상 토큰은 `data-theme="light"` / `data-theme="dark"` 양쪽에 정의되어 있어야 한다. 화면/컴포넌트는 토큰만 사용하므로 추가 분기 코드를 작성하지 않는다. 테마 전환은 `useTheme` 훅이 담당한다 (`document[data-theme]` 변경 + `SYSTEM:SET_THEME` bridge). 화면이 직접 테마 상태를 읽거나 수동 분기하지 않는다.

## 화면 작업 7단계 (모든 화면 동일, 순서 고정)

0. **사전 학습 (필수)**:
   - `src/shared/ui/INDEX.md` 카탈로그를 읽고 화면 문서가 요구하는 UI 요소가 이미 있는지 확인.
   - 화면 패턴(Form / Master-Detail / Grid Picker / Wizard / Full-Screen Dialog) 중 하나를 선택하고, INDEX.md 의 reference 화면 폴더 전체(`index.tsx` + `components/` + `hooks/`) 를 읽는다.
   - 카탈로그에 없는 UI 요소는 **선행 PR** 로 `shared/ui` 에 먼저 추가한 뒤 INDEX.md 에 한 줄 등록하고 즉시 머지한다. 화면 폴더에 inline UI 원본 금지.
1. **문서 읽기** — `1.Docs/.../화면리스트/화면설계,구조,요소/<screen>.md`. 5.1 / 5.2 / 5.3 섹션(사용 컴포넌트 / 사용 템플릿 / 디자인 토큰)이 있는지 확인하고 없으면 채운다.
2. **계약 정의** — `src/contracts/<domain>/<feature>.types.ts` 에 `Request` / `Response` / `Entity` 추가. enum 문자열은 `UPPER_SNAKE_CASE`.
3. **Fixture** — `src/mocks/fixtures/<domain>/<screen>.fixture.ts` 에 3종 강제: `default` / `empty` / `error`. 타입은 contract import.
4. **Endpoint** — `src/store/api/<domain>Api.ts` 에 reference 패턴 그대로 추가.
5. **화면 컴포넌트** — `src/screens/<Screen>/` 폴더 구조 따름. 0단계에서 정한 템플릿 + shared/ui 컴포넌트만 사용.
6. **문서 갱신** — 화면 `.md` 의 `작업 진행 기록` 표에 한 행 추가.

## 화면 폴더 구조 (필수)

```
screens/<Screen>/
  index.tsx               ← thin orchestrator. 상태 조립 + 레이아웃만.
  components/
    <PascalCase>.tsx      ← 화면 전용 컴포지션. shared/ui import 해서 조립.
  hooks/
    use<Xxx>.ts           ← 화면 전용 상태/로직 분리.
```

- `index.tsx` 에 비즈니스 로직 / 인라인 markup / 인라인 SVG 금지. 모두 `components/` 와 `hooks/` 로 분리.
- `components/*` 파일명은 PascalCase. shared/ui 만 조립한다. inline UI 원본 금지.
- 재사용 가능한 UI 발견 → 먼저 `shared/ui` 에 추가한 뒤 import. 화면 전용만 `components/` 에 둔다.
- 재사용 가능한 hook 발견 → `shared/hooks/` 로 승격.
- 코드 스플리팅: Next.js App Router 가 화면 단위 자동 split. 추가 dynamic import 는 거대 dialog / 외부 라이브러리에만.

## Mock 분기

- `process.env.NEXT_PUBLIC_DATA_SOURCE` ∈ `'mock' | 'bridge' | 'rest'`. 기본 `'mock'`.
- 백엔드 연동 시 `.env.local` 한 줄 변경. 화면/타입/fixture 코드 수정 0.

## Endpoint reference 패턴 (모든 endpoint 동일)

```ts
import { posApi } from './posApi';
import type { ExampleRequest, ExampleResponse } from '@contracts/example/example.types';
import { exampleFixtures } from '@mocks/fixtures/example/example.fixture';

const DATA_SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock') as 'mock' | 'bridge' | 'rest';

const exampleApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getExample: build.query<ExampleResponse, ExampleRequest>({
      queryFn: async (params, _api, _extra, baseQuery) => {
        switch (DATA_SOURCE) {
          case 'mock':   return { data: exampleFixtures.default };
          case 'bridge': return (await baseQuery({ cmd: 'EXAMPLE:GET', params })) as { data: ExampleResponse };
          case 'rest':   return (await baseQuery({ url: '/example', method: 'GET', params })) as { data: ExampleResponse };
        }
      },
      providesTags: ['Example'],
    }),
  }),
});

export const { useGetExampleQuery } = exampleApi;
```

## React Compiler — 수동 메모이제이션 금지

- React Compiler v1.0 적용. `useCallback` / `useMemo` / `React.memo` **사용 금지**.
- 본 PR 에서 만진 파일에 기존 사용처가 있으면 함께 제거.
- 예외 (이 4가지만 허용, 직전 줄에 `// React Compiler로 대체 불가: <사유>` 주석 필수):
  1. `useEffect` / `useLayoutEffect` 의존성 배열 참조 안정성
  2. 고비용 계산 (O(n²) 이상 또는 1000+ 항목) 캐싱
  3. 외부 라이브러리 API 가 참조 동일성 요구 (예: `addEventListener` 콜백)
  4. `forwardRef` + `useImperativeHandle`

## 주석 규칙

**파일 헤더 (모든 .ts/.tsx 필수)** — JSDoc 블록에 한국어 + 베트남어 병기:

```ts
/**
 * 한국어: <한 줄 요약 + 핵심 동작>
 * Tiếng Việt: <bản dịch tự nhiên, dùng thuật ngữ POS>
 */
```

**export 시그니처 (모든 함수/컴포넌트/hook)** — 한국어 한 줄 + 베트남어 한 줄 JSDoc.

**로직 주석 — 다음 항목은 반드시**:
- `if` / `switch` / `try` 분기 의도 (코드만 봐서 의미가 자명하지 않을 때)
- 부수효과: bridge 호출, RTK Query mutation, `useEffect`
- 상태 전이 (어떤 사용자 행동으로 변하는지)
- 계산식 / 변환 (단위, 통화, 날짜)
- TODO / FIXME (무엇을 / 왜 / 언제 해야 하는지 명시)
- "왜 필요한가" 가 코드만 봐서는 드러나지 않는 모든 곳

**핵심 분기 / 부수효과 주석은 한국어 + 베트남어 둘 다.** 사소한 라인은 한국어만 가능.

**금지**:
- 기계 번역 그대로 붙여넣기
- 내용 없는 `// TODO`
- 코드를 그대로 풀어쓴 redundant 주석
- 주석 안에 `t('...')` 호출 결과 (i18n 원본만이 단일 출처)

## 도메인 분담

| 개발자 | 도메인 |
|---|---|
| A | `OrderScreen`, `PaymentScreen`, `TableScreen`, `CustomerScreen` |
| B | `SetupScreen`, `SettingsScreen`, `MaintenanceScreen`, `StockScreen`, `EmployeeScreen` |
| 공통 | `LoginScreen`, `MainMenuScreen` (선착) |

- `shared/ui` 신규 컴포넌트 / contract 타입 변경은 **선행 PR 분리** → 즉시 머지.
- PR 1개 = 화면 1개 = contract + fixture + endpoint + 컴포넌트 + 문서 갱신.

## 화면 문서(`.md`) 표준 섹션

화면 문서에는 아래 3개 섹션이 반드시 있어야 한다. 없으면 화면 작업 1단계에서 채워 넣은 뒤 진행한다.

- `## 5.1 사용 컴포넌트` — `shared/ui` 컴포넌트 명시 (예: `IconLabelField`, `NumPad(compact)`, `Button(variant=primary)`). 화면 전용 컴포지션은 `screens/<Screen>/components/<Name>` 으로 표기.
- `## 5.2 사용 템플릿` — `POSMainLayout` / `SplitPanelLayout` / `FullScreenPanel` / `FullScreenModal` 중 하나.
- `## 5.3 디자인 토큰` — 기본 토큰만 사용하면 "기본". 특수한 spacing/size 가 필요하면 토큰명 명시. raw 값 금지.

## PR 머지 전 체크리스트

- [ ] 0단계 사전 학습 완료 (`shared/ui/INDEX.md` + 같은 패턴 reference 화면 폴더)
- [ ] 화면 문서 읽음, 5.1 / 5.2 / 5.3 섹션 채워짐
- [ ] contract 타입은 `src/contracts/` 에만, 화면 파일에 ad-hoc 타입 없음
- [ ] fixture 3종 (`default` / `empty` / `error`) 작성
- [ ] endpoint 가 reference 패턴(`switch`) 사용
- [ ] 화면이 RTK Query hook 으로만 데이터 수신, `bridge` / `cefQuery` 직접 호출 없음
- [ ] 모든 UI 요소가 `shared/ui` 사용, inline 컴포넌트 / inline SVG 없음
- [ ] 화면이 0단계에서 정한 템플릿을 사용
- [ ] raw hex / 임의 px / Tailwind palette 직접 사용 없음 (의미 토큰만)
- [ ] 라이트 / 다크 테마 양쪽에서 시각 검증 완료 (화면 / 컴포넌트에 테마 분기 코드 없음, 토큰만 사용)
- [ ] 신규 토큰을 추가했다면 light / dark 양쪽 값이 정의됨
- [ ] shared/ui 신규 컴포넌트가 추가되었다면 `INDEX.md` 에 등록됨
- [ ] `index.tsx` 는 thin orchestrator, 로직은 `components/` + `hooks/` 분리
- [ ] `useCallback` / `useMemo` / `React.memo` 신규 사용 없음, 만진 파일의 기존 사용처 제거 (예외 시 사유 주석)
- [ ] 모든 파일 헤더 JSDoc 에 `한국어:` + `Tiếng Việt:` 병기
- [ ] 모든 export 시그니처에 한/베 한 줄 요약 JSDoc
- [ ] 비자명 분기 / 부수효과 / 계산식에 한/베 상세 주석
- [ ] 화면 문서 `작업 진행 기록` 갱신
