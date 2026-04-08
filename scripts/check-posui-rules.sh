#!/usr/bin/env bash
# 한국어: PosUi 화면 작업 규칙 자동 검증 스크립트.
#   ESLint 로 잡기 어려운 파일 구조 / 헤더 주석 / fixture 시나리오 등을 검사한다.
#   pre-commit 과 GitHub Actions 양쪽에서 실행된다.
# Tiếng Việt: Script kiểm tra các quy tắc PosUi mà ESLint không bắt được
#   (cấu trúc thư mục, header song ngữ, fixture 3 kịch bản).
set -u
ROOT="BrandPosApp/PosUi/src"
FAIL=0
echo "── PosUi rules check ──"

# 1) screens/<Screen>/index.tsx 에 inline <svg> 금지
if grep -rIln '<svg' "$ROOT/screens" --include='index.tsx' 2>/dev/null; then
  echo "❌ index.tsx 에 inline SVG 발견 (shared/ui/atoms/Icon 사용)"
  FAIL=1
fi

# 2) screens/<Screen>/index.tsx 라인 수 200 초과 차단 (thin orchestrator)
while IFS= read -r f; do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 200 ]; then
    echo "❌ $f : ${lines} lines (200 초과). thin orchestrator 규칙 위반. components/ 와 hooks/ 로 분리."
    FAIL=1
  fi
done < <(find "$ROOT/screens" -name 'index.tsx' 2>/dev/null)

# 3) 화면 폴더 구조 (index.tsx + components/)
for d in "$ROOT"/screens/*/; do
  name=$(basename "$d")
  [ "$name" = "common" ] && continue
  [ -f "${d}index.tsx" ] || { echo "❌ $d : index.tsx 없음"; FAIL=1; }
  [ -d "${d}components" ] || { echo "❌ $d : components/ 폴더 없음"; FAIL=1; }
done

# 4) 모든 contracts / fixtures / screens 파일에 한/베 헤더 주석
while IFS= read -r f; do
  if ! grep -q '한국어:' "$f" || ! grep -q 'Tiếng Việt:' "$f"; then
    echo "❌ $f : 한국어/Tiếng Việt 헤더 주석 누락"
    FAIL=1
  fi
done < <(find "$ROOT/contracts" "$ROOT/mocks/fixtures" -name '*.ts' -o -name '*.tsx' 2>/dev/null)

while IFS= read -r f; do
  if ! grep -q '한국어:' "$f" || ! grep -q 'Tiếng Việt:' "$f"; then
    echo "❌ $f : 한국어/Tiếng Việt 헤더 주석 누락"
    FAIL=1
  fi
done < <(find "$ROOT/screens" -name '*.tsx' -o -name '*.ts' 2>/dev/null | grep -v '/common/')

# 5) fixture 3종 시나리오 (default / empty / error)
while IFS= read -r f; do
  for k in default empty error; do
    if ! grep -qE "(^|[^a-zA-Z])${k}[[:space:]]*:" "$f"; then
      echo "❌ $f : '${k}' 시나리오 누락"
      FAIL=1
    fi
  done
done < <(find "$ROOT/mocks/fixtures" -name '*.fixture.ts' 2>/dev/null)

# 6) endpoint reference 패턴 (queryFn switch)
while IFS= read -r f; do
  if grep -q 'injectEndpoints' "$f" && ! grep -q 'switch (DATA_SOURCE)' "$f"; then
    echo "❌ $f : reference 패턴(switch (DATA_SOURCE)) 미적용"
    FAIL=1
  fi
done < <(find "$ROOT/store/api" -name '*Api.ts' 2>/dev/null)

# 7) cefQuery 직접 호출 (screens / shared/ui)
if grep -rIn 'window\.cefQuery' "$ROOT/screens" "$ROOT/shared/ui" 2>/dev/null; then
  echo "❌ cefQuery 직접 호출 발견"
  FAIL=1
fi

# 8) useCallback / useMemo (예외 주석 없는 사용)
while IFS= read -r line; do
  file=$(echo "$line" | cut -d: -f1)
  num=$(echo "$line" | cut -d: -f2)
  prev=$((num - 1))
  prev_line=$(sed -n "${prev}p" "$file" 2>/dev/null || true)
  if ! echo "$prev_line" | grep -q '대체 불가:'; then
    echo "❌ $file:$num : useCallback/useMemo 사용 (예외 사유 주석 없음)"
    FAIL=1
  fi
done < <(grep -rIn 'useCallback\|useMemo' "$ROOT" --include='*.ts' --include='*.tsx' 2>/dev/null \
         | grep -v 'eslint.config' | grep -v 'INDEX.md' || true)

if [ "$FAIL" = "0" ]; then
  echo "✅ PosUi rules check 통과"
fi
exit $FAIL
