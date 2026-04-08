<!--
한국어: 화면 작업 PR 템플릿. PosUi/CLAUDE.md 의 PR 체크리스트를 자동 첨부한다.
Tiếng Việt: Template PR cho công việc màn hình. Tự động đính kèm checklist của PosUi/CLAUDE.md.
-->

## 변경 요약

<!-- 어떤 화면 / 어떤 도메인 / 어떤 패턴 -->

## 7단계 워크플로우

- [ ] 0단계: `src/shared/ui/INDEX.md` + reference 화면 폴더 학습 완료
- [ ] 1단계: 화면 문서 `5.1` / `5.2` / `5.3` 섹션 채움
- [ ] 2단계: `src/contracts/<domain>/*.types.ts` 추가/재사용
- [ ] 3단계: `src/mocks/fixtures/<domain>/*.fixture.ts` 3종 작성 (`default` / `empty` / `error`)
- [ ] 4단계: `src/store/api/<domain>Api.ts` reference 패턴(`switch (DATA_SOURCE)`) 적용
- [ ] 5단계: `src/screens/<Screen>/` thin orchestrator + `components/` + `hooks/` 구조
- [ ] 6단계: 화면 문서 `작업 진행 기록` 표 갱신

## 시각 검증 (사람이 직접 확인)

- [ ] 라이트 테마 스크린샷 첨부
- [ ] 다크 테마 스크린샷 첨부
- [ ] 베트남어 주석이 자연스러움 (기계 번역 아님)
- [ ] 화면 문서와 구현이 의미적으로 일치

## CI 자동 검증 (PR 등록 시 자동 실행)

- TypeScript 컴파일
- ESLint (`useCallback` / `useMemo` / raw color / `cefQuery` 차단)
- Custom rules: 폴더 구조, 한/베 헤더 주석, fixture 3종, endpoint reference 패턴, `index.tsx` 200줄 제한, inline SVG 차단
