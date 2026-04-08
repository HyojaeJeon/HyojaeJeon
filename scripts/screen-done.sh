#!/usr/bin/env bash
# Tiếng Việt: Hoàn tất công việc 1 màn hình. Chạy check local, commit, push,
#   tạo PR. Lập trình viên chỉ cần dùng 1 lệnh.
# 한국어: 화면 1개 작업 완료. 로컬 검증 + commit + push + PR 생성을 한 번에.
#   개발자는 git 명령을 외울 필요 없다.
#
# Usage / 사용법:
#   bash scripts/screen-done.sh "<message>"
#   ví dụ / 예: bash scripts/screen-done.sh "feat: OrderScreen 구현"
set -e

if [ -z "${1:-}" ]; then
  echo "Usage: bash scripts/screen-done.sh \"<commit message>\""
  exit 1
fi
MSG="$1"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "❌ main 브랜치에서는 직접 작업할 수 없다 / Không làm việc trực tiếp trên main."
  echo "   먼저 / Trước tiên: bash scripts/screen-start.sh <screen-name>"
  exit 1
fi

echo "── 1) 로컬 검증 / Kiểm tra local ──"
cd BrandPosApp/PosUi
npm run check
cd ../..

echo "── 2) 변경사항 stage / Stage changes ──"
git add .

if git diff --cached --quiet; then
  echo "변경사항 없음 / Không có thay đổi. 종료."
  exit 0
fi

echo "── 3) Commit ──"
git commit -m "$MSG"

echo "── 4) Push ──"
git push -u origin "$BRANCH"

echo "── 5) PR 생성 / Create PR ──"
if command -v gh >/dev/null 2>&1; then
  gh pr create --fill --base main 2>&1 || gh pr view --web
else
  echo "gh CLI 미설치. 웹에서 PR 생성:"
  echo "  https://github.com/HyojaeJeon/HJ-POS-ReDesigned/pull/new/${BRANCH}"
fi

cat <<EOF

✅ 완료 / Hoàn tất.
   이제 다른 개발자가 리뷰/머지 할 때까지 기다리면 된다.
   Bây giờ chỉ cần chờ LTV còn lại review và merge.

다음 화면 작업 / Màn hình tiếp theo:
   bash scripts/screen-start.sh <next-screen-name>
EOF
