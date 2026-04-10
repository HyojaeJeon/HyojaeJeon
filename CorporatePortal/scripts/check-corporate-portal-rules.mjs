#!/usr/bin/env node
/**
 * CorporatePortal 책임 경계 강제 규칙.
 * CI에서 실행되어 위반 시 빌드를 실패시킨다.
 */
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src');
const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      walk(full);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      check(full);
    }
  }
}

function check(file) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(SRC, file);

  // Rule 1: BrandPosApp 코드 import 금지
  if (/from\s+['"].*BrandPosApp/.test(content)) {
    violations.push(`${rel}: BrandPosApp import 금지`);
  }

  // Rule 2: raw gql 템플릿 리터럴 금지 (graphql/queries 디렉토리 제외)
  if (!rel.startsWith('graphql/queries') && /\bgql\s*`/.test(content)) {
    violations.push(`${rel}: raw gql 사용 금지 (graphql/queries/ 에서만 허용)`);
  }

  // Rule 3: window.cefQuery 호출 금지 (CorporatePortal은 Web, CEF 없음)
  if (/cefQuery/.test(content)) {
    violations.push(`${rel}: cefQuery 호출 금지 (Web 전용 포털)`);
  }

  // Rule 4: raw color hex 금지 (CSS custom property / Tailwind token 사용)
  const hexMatches = content.match(/#[0-9a-fA-F]{3,8}(?!\w)/g);
  if (hexMatches) {
    // Allow hex in CSS files and globals.css references
    if (!rel.endsWith('.css') && !rel.includes('globals')) {
      for (const hex of hexMatches) {
        // Allow common safe values and SVG data URIs
        if (!['#fff', '#000', '#ffffff', '#000000'].includes(hex.toLowerCase()) && !content.includes('data:image')) {
          violations.push(`${rel}: raw hex color ${hex} 금지 — Tailwind token 사용`);
          break;
        }
      }
    }
  }

  // Rule 5: refetchQueries 사용 금지
  if (/refetchQueries/.test(content)) {
    violations.push(`${rel}: refetchQueries 사용 금지 — cache.modify 사용`);
  }

  // Rule 6: ring-2 / ring-offset 금지 (SharedUI focus-visible 사용)
  if (/\bring-2\b|\bring-offset/.test(content)) {
    violations.push(`${rel}: ring-2/ring-offset 금지 — SharedUI focus-visible 사용`);
  }
}

if (fs.existsSync(SRC)) {
  walk(SRC);
}

if (violations.length > 0) {
  console.error('\n❌ CorporatePortal 규칙 위반 발견:\n');
  for (const v of violations) console.error(`  • ${v}`);
  console.error(`\n총 ${violations.length}건 위반\n`);
  process.exit(1);
} else {
  console.log('✅ CorporatePortal 규칙 검사 통과');
}
