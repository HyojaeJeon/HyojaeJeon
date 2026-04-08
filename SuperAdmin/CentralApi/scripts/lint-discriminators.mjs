#!/usr/bin/env node
/**
 * 한국어: 디스크리미네이터 문자열 lint.
 *   닫힌 enum 컬럼/필드/JSON 키에 PascalCase string literal 이 들어가면 실패한다.
 *   본 스크립트는 사람의 기억에 의존하지 않도록 CI build gate 에 포함된다.
 *
 * 규칙:
 *   - 객체 리터럴 또는 함수 호출에서 (?:'<key>'|<key>):\s*'<PascalCaseValue>' 패턴이 발견되면 위반.
 *   - <key> 는 actorType / userType / scopeType / scope / loopType / authMethod / fundingModel / status / *Type / *Mode / *Method / *Kind 등.
 *   - 예외 화이트리스트: targetType (Prisma 모델 명 미러링).
 *   - 예외 파일: 본 스크립트 자신, *.spec.ts (테스트 fixture 는 자유), CLAUDE.md, .gitignore 등.
 *
 * Tiếng Việt: Lint discriminator strings — chặn PascalCase trong cột enum đóng.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'src');
const EXEMPT_FIELD = new Set(['targetType']);
const EXEMPT_FILES = [/\.spec\.ts$/, /lint-discriminators\.mjs$/];

const KEY_PAT =
  '(?:\\b' +
  [
    'actorType',
    'userType',
    'scopeType',
    'loopType',
    'authMethod',
    'fundingModel',
    'status',
    'scope',
    '\\w+Type',
    '\\w+Method',
    '\\w+Mode',
    '\\w+Kind',
  ].join('|\\b') +
  '\\b)';

// matches `key: 'PascalCase'` (allows leading whitespace, allows quoted key)
const RX = new RegExp(
  '(?:^|[\\s,{(])(?:\'?(' + KEY_PAT + ')\'?)\\s*:\\s*\'([A-Z][a-z]\\w*)\'',
  'gm',
);

const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name)) continue;
    if (EXEMPT_FILES.some((rx) => rx.test(full))) continue;
    const src = readFileSync(full, 'utf8');
    let m;
    RX.lastIndex = 0;
    while ((m = RX.exec(src))) {
      const field = m[1];
      const value = m[2];
      if (EXEMPT_FIELD.has(field)) continue;
      // line number
      const before = src.slice(0, m.index);
      const line = before.split('\n').length;
      violations.push({
        file: relative(process.cwd(), full),
        line,
        field,
        value,
      });
    }
  }
}

walk(ROOT);

if (violations.length === 0) {
  console.log(`discriminator-lint: OK (0 violations under ${relative(process.cwd(), ROOT)})`);
  process.exit(0);
}

console.error(`discriminator-lint: ${violations.length} violation(s)`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.field}: '${v.value}'  → expected UPPER_SNAKE_CASE`);
}
console.error(
  '\nFix by converting the value to UPPER_SNAKE_CASE, or add the field to EXEMPT_FIELD if it mirrors a Prisma model name (and document the exception in CLAUDE.md).',
);
process.exit(1);
