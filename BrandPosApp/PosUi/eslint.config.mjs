// @ts-check
/**
 * 한국어: PosUi ESLint flat config. CLAUDE.md 의 화면 작업 규칙을 시스템적으로 강제한다.
 *   - useCallback / useMemo / React.memo 사용 차단 (React Compiler 적용)
 *   - raw hex / 임의 px / Tailwind palette 직접 사용 차단 (디자인 토큰 강제)
 *   - cefQuery 직접 호출 차단 (bridge 레이어만 사용)
 *
 * Tiếng Việt: Cấu hình ESLint của PosUi. Bắt buộc các quy tắc làm việc màn hình
 *   trong CLAUDE.md ở mức hệ thống (chặn memoize thủ công, raw color, gọi cefQuery trực tiếp).
 */
import nextPlugin from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      '**/*.tsbuildinfo',
      'src/app/design-docs/docs/db-master-data.json',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // ── React Compiler: 수동 메모이제이션 금지 ─────────────────────────
      // 한국어: useCallback / useMemo 호출 자체를 차단. 예외 4가지에 해당하면 직전 줄에
      //   `// React Compiler로 대체 불가: <사유>` 주석을 적고 eslint-disable-next-line 한다.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useCallback']",
          message: 'useCallback 금지 (React Compiler 적용). 예외 시 직전 줄에 // React Compiler로 대체 불가: 사유 + eslint-disable-next-line.',
        },
        {
          selector: "CallExpression[callee.name='useMemo']",
          message: 'useMemo 금지 (React Compiler 적용). 예외 시 직전 줄에 // React Compiler로 대체 불가: 사유 + eslint-disable-next-line.',
        },
        {
          selector: "CallExpression[callee.object.name='React'][callee.property.name='memo']",
          message: 'React.memo 금지 (React Compiler 적용).',
        },
        {
          selector: "ImportSpecifier[imported.name='memo'][parent.source.value='react']",
          message: 'React.memo 금지 (React Compiler 적용).',
        },
        // ── 디자인 토큰 강제: Tailwind raw palette / 임의 값 차단 ──────
        {
          selector: "Literal[value=/\\b(bg|text|border|ring|fill|stroke|from|to|via)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-[0-9]{2,3}\\b/]",
          message: 'Tailwind palette 직접 사용 금지. 의미 토큰(bg-pos-error, text-pos-text 등)만 사용.',
        },
        {
          selector: "Literal[value=/\\[(#[0-9a-fA-F]{3,8}|[0-9.]+(px|rem|em))\\]/]",
          message: '임의 hex / px / rem 값 금지. 디자인 토큰만 사용.',
        },
        {
          selector: "Literal[value=/#[0-9a-fA-F]{6}/]",
          message: 'raw hex 색상 금지. 디자인 토큰만 사용.',
        },
        // ── window.cefQuery 직접 호출 차단 ─────────────────────────────
        {
          selector: "MemberExpression[object.object.name='window'][object.property.name='cefQuery']",
          message: 'window.cefQuery 직접 호출 금지. src/bridge 레이어를 사용.',
        },
        {
          selector: "MemberExpression[object.name='window'][property.name='cefQuery']",
          message: 'window.cefQuery 직접 호출 금지. src/bridge 레이어를 사용.',
        },
      ],

      // ── 화면 컴포넌트가 bridge 모듈을 직접 import 하지 못하게 ──────────
      // 한국어: screens/** 는 hook 만 사용해야 한다. bridge 직접 import 금지.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@bridge/*', '../bridge/*', '../../bridge/*', '../../../bridge/*'],
              message: '화면 / 컴포넌트는 bridge 를 직접 import 할 수 없다. RTK Query hook 만 사용.',
            },
          ],
        },
      ],

      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  // ── store/api 와 hooks 는 bridge import 허용 ────────────────────────
  {
    files: ['src/store/**/*.{ts,tsx}', 'src/shared/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // ── design-docs / shared/ui 에서는 디자인 토큰 룰 완화 (preview/sandbox) ─
  {
    files: ['src/app/design-docs/**/*.{ts,tsx}', 'src/app/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
