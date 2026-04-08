#!/usr/bin/env bash
# Tiếng Việt: Thiết lập CLAUDE.md tiếng Việt cho từng máy LTV.
#   Sao chép từng CLAUDE.ko.md (bản gốc tiếng Hàn) → CLAUDE.md (sẽ là bản dịch).
#   Sau đó in ra prompt để dán vào Claude Code, Claude sẽ dịch toàn bộ sang tiếng Việt.
# 한국어: 베트남어 CLAUDE.md 셋업. CLAUDE.ko.md 를 CLAUDE.md 로 복사 후
#   Claude Code 가 통째로 베트남어 번역하도록 프롬프트 출력.
set -e

echo "── 1) CLAUDE.ko.md → CLAUDE.md 복사 / Sao chép ──"
COUNT=0
while IFS= read -r ko; do
  md="${ko%.ko.md}.md"
  cp "$ko" "$md"
  COUNT=$((COUNT+1))
done < <(find . -name 'CLAUDE.ko.md' -not -path './node_modules/*' -not -path '*/node_modules/*' -not -path '*/.next/*')
echo "  → $COUNT file đã sao chép / 파일 복사 완료"

cat <<'EOF'

✅ Sẵn sàng. Bây giờ chạy Claude Code và dán nguyên prompt dưới đây.
   준비 완료. 클로드코드 실행 후 아래 프롬프트를 그대로 붙여넣어줘.

────────────────────────────────────────────────────────────────────
PROMPT (paste vào Claude Code / 클로드코드에 붙여넣기):
────────────────────────────────────────────────────────────────────

Tôi là lập trình viên người Việt. Hãy dịch TOÀN BỘ tất cả file CLAUDE.md
(không phải CLAUDE.ko.md) trong repo này từ tiếng Hàn sang tiếng Việt
hoàn toàn — KHÔNG để lại bất kỳ chữ Hàn nào.

Yêu cầu:
1. Tìm tất cả file có tên CLAUDE.md (không phải CLAUDE.ko.md) trong repo,
   loại trừ node_modules / .next.
2. Dịch toàn bộ nội dung sang tiếng Việt tự nhiên dùng thuật ngữ POS.
3. Giữ nguyên cấu trúc Markdown, tên file, đường dẫn, code block, bảng.
4. Giữ nguyên các thuật ngữ kỹ thuật (RTK Query, ESLint, useCallback,
   shared/ui, cefQuery, contracts, fixtures...).
5. KHÔNG được động đến file CLAUDE.ko.md — đó là bản gốc tiếng Hàn.
6. KHÔNG commit, KHÔNG push — CLAUDE.md đã được .gitignore.

Sau khi xong, in ra danh sách tất cả file đã được dịch.

────────────────────────────────────────────────────────────────────

Sau khi Claude dịch xong, bạn có thể bắt đầu công việc thiết kế màn hình:
   bash scripts/screen-start.sh <screen-name>

EOF
