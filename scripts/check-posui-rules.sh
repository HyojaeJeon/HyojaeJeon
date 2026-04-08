#!/usr/bin/env bash
# Tiếng Việt: Kiểm tra quy tắc PosUi mà ESLint không bắt được. Nếu có biến môi
#   trường CHANGED_FILES (CI cung cấp) thì chỉ kiểm tra các file đó; ngược lại
#   quét toàn bộ src (pre-commit local).
# 한국어: ESLint 가 잡지 못하는 PosUi 규칙 검사. CHANGED_FILES 환경변수가 있으면
#   그 파일들만 검사 (CI), 없으면 src 전체 검사 (로컬 pre-commit).
set -u
ROOT="BrandPosApp/PosUi/src"
FAIL=0
echo "── PosUi rules check ──"

CHANGED_MODE="false"
if [ -n "${CHANGED_FILES:-}" ]; then
  CHANGED_MODE="true"
  CHANGED_LIST=$(echo "$CHANGED_FILES" | grep -E "^${ROOT}/.*\.(ts|tsx)$" || true)
  echo "Mode: changed files only"
else
  echo "Mode: full scan"
fi

list_files() {
  local pattern_dir="$1"
  shift
  if [ "$CHANGED_MODE" = "true" ]; then
    echo "$CHANGED_LIST" | grep -E "^${pattern_dir}/.*$" || true
  else
    find "$pattern_dir" "$@" 2>/dev/null || true
  fi
}

# 1) screens/<Screen>/index.tsx 에 inline <svg> 금지
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/screens/*/index.tsx)
      if grep -qIl '<svg' "$f" 2>/dev/null; then
        echo "❌ $f : inline SVG (shared/ui/atoms/Icon 사용)"
        FAIL=1
      fi
      ;;
  esac
done < <(list_files "$ROOT/screens" -name 'index.tsx')

# 2) index.tsx 200줄 초과 차단 (thin orchestrator)
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/screens/*/index.tsx)
      lines=$(wc -l < "$f" 2>/dev/null || echo 0)
      if [ "$lines" -gt 200 ]; then
        echo "❌ $f : ${lines} lines (200 초과). thin orchestrator 위반."
        FAIL=1
      fi
      ;;
  esac
done < <(list_files "$ROOT/screens" -name 'index.tsx')

# 3) 화면 폴더 구조 (full scan 일 때만)
if [ "$CHANGED_MODE" = "false" ]; then
  for d in "$ROOT"/screens/*/; do
    name=$(basename "$d")
    [ "$name" = "common" ] && continue
    [ -f "${d}index.tsx" ] || { echo "❌ $d : index.tsx 없음"; FAIL=1; }
    [ -d "${d}components" ] || { echo "❌ $d : components/ 없음"; FAIL=1; }
  done
fi

# 4) contracts / fixtures / screens 한·베 헤더
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/contracts/*|"$ROOT"/mocks/fixtures/*|"$ROOT"/screens/*) ;;
    *) continue ;;
  esac
  case "$f" in
    *"/common/"*|*.d.ts) continue ;;
  esac
  if ! grep -q '한국어:' "$f" 2>/dev/null || ! grep -q 'Tiếng Việt:' "$f" 2>/dev/null; then
    echo "❌ $f : 한국어/Tiếng Việt 헤더 주석 누락"
    FAIL=1
  fi
done < <(list_files "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \))

# 5) fixture 3종
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/mocks/fixtures/*.fixture.ts)
      for k in default empty error; do
        if ! grep -qE "(^|[^a-zA-Z])${k}[[:space:]]*:" "$f"; then
          echo "❌ $f : '${k}' 시나리오 누락"
          FAIL=1
        fi
      done
      ;;
  esac
done < <(list_files "$ROOT/mocks/fixtures" -name '*.fixture.ts')

# 6) endpoint reference 패턴
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/store/api/*Api.ts)
      if grep -q 'injectEndpoints' "$f" && ! grep -q 'switch (DATA_SOURCE)' "$f"; then
        echo "❌ $f : reference 패턴(switch (DATA_SOURCE)) 미적용"
        FAIL=1
      fi
      ;;
  esac
done < <(list_files "$ROOT/store/api" -name '*.ts')

# 7) cefQuery 직접 호출
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/screens/*|"$ROOT"/shared/ui/*)
      if grep -qIn 'window\.cefQuery' "$f" 2>/dev/null; then
        echo "❌ $f : cefQuery 직접 호출"
        FAIL=1
      fi
      ;;
  esac
done < <(list_files "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \))

# 8) useCallback / useMemo (예외 주석 없는 사용)
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$ROOT"/bridge/*|"$ROOT"/providers/*|"$ROOT"/store/*|"$ROOT"/shared/hooks/*) continue ;;
  esac
  while IFS=: read -r _ num _; do
    [ -z "$num" ] && continue
    prev=$((num - 1))
    prev_line=$(sed -n "${prev}p" "$f" 2>/dev/null || true)
    if ! echo "$prev_line" | grep -q '대체 불가:'; then
      echo "❌ $f:$num : useCallback/useMemo (예외 주석 없음)"
      FAIL=1
    fi
  done < <(grep -nE 'useCallback|useMemo' "$f" 2>/dev/null || true)
done < <(list_files "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \))

if [ "$FAIL" = "0" ]; then
  echo "✅ PosUi rules check 통과"
fi
exit $FAIL
