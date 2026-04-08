#!/usr/bin/env bash
# Tiếng Việt: Bắt đầu công việc 1 màn hình. Tự cập nhật main, tạo branch và in
#   prompt chuẩn để dán vào Claude Code. Lập trình viên không cần nhớ lệnh git.
# 한국어: 화면 1개 작업 시작. main 자동 동기화 + 브랜치 자동 생성 + 클로드코드용
#   표준 프롬프트 출력. 개발자는 git 명령을 외울 필요 없다.
#
# Usage / 사용법:
#   bash scripts/screen-start.sh <screen-name>
#   ví dụ / 예: bash scripts/screen-start.sh order-screen
set -e

if [ -z "${1:-}" ]; then
  echo "Usage: bash scripts/screen-start.sh <screen-name>"
  echo "  ex)  bash scripts/screen-start.sh order-screen"
  exit 1
fi

NAME="$1"
BRANCH="feat/${NAME}"

echo "── 1) main 동기화 / Đồng bộ main ──"
git checkout main
git pull origin main

echo "── 2) 브랜치 생성 / Tạo branch ──"
if git show-ref --quiet "refs/heads/${BRANCH}"; then
  echo "이미 존재 / đã tồn tại: ${BRANCH}"
  git checkout "${BRANCH}"
else
  git checkout -b "${BRANCH}"
fi

cat <<EOF

✅ 준비 완료 / Sẵn sàng. 이제 클로드코드를 실행해서 아래 프롬프트를 그대로 붙여넣어줘.
   Bây giờ chạy Claude Code và dán nguyên prompt dưới đây.

────────────────────────────────────────────────────────────────────
한국어: BrandPosApp/PosUi/CLAUDE.md 와 src/shared/ui/INDEX.md 를 먼저
  읽고, 화면 작업 7단계 워크플로우 그대로 ${NAME} 을 작업해줘.
  PR 체크리스트 12개 항목을 모두 통과해야 한다.

Tiếng Việt: Hãy đọc trước BrandPosApp/PosUi/CLAUDE.md và
  src/shared/ui/INDEX.md, rồi triển khai ${NAME} theo đúng workflow
  7 bước. Tất cả 12 mục checklist PR phải pass.
────────────────────────────────────────────────────────────────────

작업이 끝나면 / Khi xong:
   bash scripts/screen-done.sh "<커밋 메시지 / commit message>"

EOF
