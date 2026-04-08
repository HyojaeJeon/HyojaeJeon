# Hướng dẫn cho lập trình viên (Anh Duy & Quốc)

> Bạn chỉ cần làm 2 việc thủ công:
> 1. **Chấp nhận lời mời cộng tác trên GitHub** (1 lần)
> 2. **Mở Claude Code và dán prompt** trong tài liệu này
>
> Mọi thứ còn lại — clone, cài đặt, dịch tài liệu, tạo branch, code, test, commit, push, tạo PR — Claude Code sẽ tự làm. Bạn không cần gõ lệnh git, không cần nhớ workflow.

---

## Bước 0 — Việc thủ công duy nhất

1. Mở email GitHub → chấp nhận lời mời cộng tác repo:
   👉 https://github.com/HyojaeJeon/HJ-POS-ReDesigned/invitations
2. Cài Claude Code nếu chưa có: https://docs.claude.com/claude-code
3. Cài Node.js 20+ và `gh` CLI (`brew install gh` hoặc tương đương).
4. Đăng nhập GitHub CLI 1 lần: `gh auth login`

Xong. Từ giờ chỉ dùng 3 prompt bên dưới.

---

# 📋 PROMPT-1 — Cài đặt môi trường (CHỈ chạy 1 lần đầu tiên)

**Cách dùng**:
1. Mở terminal ở thư mục mẹ bất kỳ (ví dụ `~/projects`).
2. Chạy `claude`.
3. Dán nguyên khối prompt dưới đây vào Claude Code và Enter.

```
Tôi là lập trình viên người Việt mới tham gia dự án Platform / EdgePos PosUi.
Tôi đã chấp nhận lời mời cộng tác trên GitHub. Hãy thiết lập toàn bộ môi trường
làm việc cho tôi bằng các bước sau, theo đúng thứ tự, KHÔNG bỏ bước:

1. Clone repo vào thư mục hiện tại:
   git clone https://github.com/HyojaeJeon/HJ-POS-ReDesigned.git Platform
   cd Platform

2. Hỏi tôi tên và email GitHub của tôi (nếu git config chưa có), sau đó:
   git config user.name "<tên tôi cung cấp>"
   git config user.email "<email tôi cung cấp>"

3. Cài dependency của PosUi (sẽ tự bật Husky pre-commit hook):
   cd BrandPosApp/PosUi
   npm install
   cd ../..

4. Tạo file môi trường mock để chạy UI mà không cần backend C++:
   echo "NEXT_PUBLIC_DATA_SOURCE=mock" > BrandPosApp/PosUi/.env.local

5. Sao chép tất cả file CLAUDE.ko.md (bản gốc tiếng Hàn) sang CLAUDE.md
   để chuẩn bị dịch:
   bash scripts/setup-vn.sh
   (Script này sẽ tìm tất cả CLAUDE.ko.md và sao chép sang CLAUDE.md)

6. Dịch TOÀN BỘ tất cả file CLAUDE.md (KHÔNG phải CLAUDE.ko.md) trong repo
   từ tiếng Hàn sang tiếng Việt hoàn toàn — KHÔNG để lại bất kỳ chữ Hàn nào.

   Yêu cầu chất lượng dịch:
   - Dùng thuật ngữ POS / nhà hàng tiếng Việt phù hợp.
   - Giữ nguyên cấu trúc Markdown (tiêu đề, bảng, code block, danh sách).
   - Giữ nguyên các thuật ngữ kỹ thuật (RTK Query, ESLint, useCallback,
     shared/ui, cefQuery, contracts, fixtures, design token...).
   - Giữ nguyên đường dẫn file, tên class, tên function, tên biến.

   TUYỆT ĐỐI:
   - KHÔNG động đến bất kỳ file CLAUDE.ko.md nào (đó là bản gốc của owner).
   - KHÔNG chạy git add / git commit / git push (CLAUDE.md đã được .gitignore).

7. Sau khi dịch xong, in ra:
   - Danh sách tất cả file CLAUDE.md đã được dịch
   - Hướng dẫn ngắn cho tôi: "Bây giờ bạn có thể bắt đầu thiết kế màn hình
     bằng cách dán PROMPT-2 trong HUONG_DAN_LAP_TRINH_VIEN.md"

Trong suốt quá trình, nếu có lỗi, hãy báo cho tôi biết và dừng lại để tôi xử lý.
KHÔNG tự ý sửa file của repo ngoài 6 bước trên.
```

---

# 📋 PROMPT-2 — Triển khai 1 màn hình (lặp lại cho mỗi màn hình)

**Cách dùng**:
1. Mở terminal trong thư mục `Platform`.
2. Chạy `claude`.
3. Dán prompt dưới đây, **thay `<TÊN-MÀN-HÌNH>` bằng tên màn hình thật** (ví dụ: `order-screen`, `payment-screen`).

```
Tôi muốn triển khai màn hình <TÊN-MÀN-HÌNH> trong dự án EdgePos PosUi.
Hãy thực hiện toàn bộ quy trình end-to-end theo đúng thứ tự:

═══ GIAI ĐOẠN A: CHUẨN BỊ ═══

1. Đồng bộ branch main mới nhất:
   git checkout main
   git pull origin main

2. Tạo branch riêng cho màn hình này:
   git checkout -b feat/<TÊN-MÀN-HÌNH>

═══ GIAI ĐOẠN B: HỌC & THIẾT KẾ ═══

3. Đọc kỹ các file sau TRƯỚC khi viết bất kỳ dòng code nào:
   a. BrandPosApp/PosUi/CLAUDE.md (quy tắc PosUi — bản tiếng Việt đã dịch)
   b. BrandPosApp/PosUi/src/shared/ui/INDEX.md (catalog component dùng chung)
   c. Tài liệu màn hình trong:
      1.Docs/기획 및 설계/프로젝트 통합설계/화면리스트/화면설계,구조,요소/
      Tìm file .md tương ứng với <TÊN-MÀN-HÌNH>.
   d. Reference screen của cùng pattern:
      - Form / Keypad: screens/LoginScreen
      - Master-Detail: screens/OrderScreen
      - Full-Screen Dialog: screens/PaymentScreen

4. Triển khai màn hình theo workflow 7 bước trong CLAUDE.md:
   - Bước 0: chọn pattern màn hình + reference
   - Bước 1: đảm bảo tài liệu màn hình có mục 5.1/5.2/5.3, nếu thiếu thì bổ sung
   - Bước 2: thêm contract types vào src/contracts/<domain>/<feature>.types.ts
   - Bước 3: tạo fixture 3 kịch bản (default/empty/error) trong src/mocks/fixtures
   - Bước 4: thêm endpoint theo pattern reference (switch DATA_SOURCE) trong store/api
   - Bước 5: tạo screens/<Screen>/index.tsx (thin orchestrator ≤200 dòng) +
            components/<PascalCase>.tsx + hooks/use<Xxx>.ts
   - Bước 6: cập nhật mục "작업 진행 기록" của tài liệu màn hình

═══ QUY TẮC TUYỆT ĐỐI ═══

- KHÔNG dùng useCallback / useMemo / React.memo (React Compiler tự lo)
- KHÔNG dùng raw color (#ff0000, bg-red-500) — chỉ dùng design token
  (bg-pos-error, text-pos-text, h-touch, rounded-pos-input...)
- KHÔNG gọi window.cefQuery — dùng RTK Query hook
- KHÔNG viết UI primitive mới trong file màn hình — phải thêm vào shared/ui
  trước. Nếu shared/ui chưa có và bạn cần component mới: HÃY DỪNG LẠI và
  báo tôi biết để tôi quyết định (làm PR riêng cho shared/ui trước).
- KHÔNG viết inline SVG — dùng shared/ui/atoms/Icon
- File index.tsx PHẢI ≤ 200 dòng
- Mọi file .ts/.tsx phải có header comment SONG NGỮ Hàn / Việt
  (`한국어:` / `Tiếng Việt:`) — đây là quy tắc bắt buộc
- Light/dark theme đều phải hoạt động (chỉ dùng token, không viết logic theme)

═══ GIAI ĐOẠN C: HOÀN TẤT ═══

5. Sau khi code xong, chạy kiểm tra local:
   bash scripts/screen-done.sh "feat(<TÊN-MÀN-HÌNH>): triển khai màn hình"

   Script sẽ tự:
   - Chạy npm run check (TypeScript + ESLint + custom rules)
   - Nếu fail → in ra lỗi, KHÔNG commit. Bạn hãy phân tích lỗi và sửa, sau đó
     chạy lại screen-done.sh.
   - Nếu pass → git add + git commit + git push + tạo Pull Request tự động.

6. Sau khi PR được tạo, in ra link PR cho tôi và dừng lại.

═══ LƯU Ý ═══

- Pre-commit hook và GitHub Actions sẽ tự chặn nếu vi phạm bất kỳ quy tắc nào.
  Đừng cố tắt hook hoặc dùng eslint-disable trừ khi rơi vào đúng 4 trường hợp
  ngoại lệ trong CLAUDE.md (và phải có comment lý do).
- Branch protection trên main đang bật → KHÔNG bao giờ commit trực tiếp lên
  main. Mọi thứ phải qua branch feat/* và PR.

Tên màn hình cần triển khai: <TÊN-MÀN-HÌNH>
```

---

# 📋 PROMPT-3 — Khi CI báo đỏ trên PR

**Cách dùng**:
1. Mở tab `Checks` của PR trên GitHub → copy log lỗi.
2. Mở Claude Code trong cùng branch.
3. Dán prompt dưới đây, kèm log lỗi.

```
PR của tôi đang bị CI báo đỏ. Đây là log lỗi từ tab Checks:

<DÁN LOG LỖI VÀO ĐÂY>

Hãy:
1. Phân tích nguyên nhân từng lỗi.
2. Sửa từng lỗi theo đúng quy tắc trong BrandPosApp/PosUi/CLAUDE.md.
3. KHÔNG được tắt rule, KHÔNG được dùng eslint-disable trừ khi rơi vào đúng
   4 trường hợp ngoại lệ trong CLAUDE.md (có comment lý do bằng song ngữ).
4. Sau khi sửa xong, chạy lại bash scripts/screen-done.sh "fix: <mô tả ngắn>"
   để tự test + commit + push. CI sẽ tự chạy lại trên PR.
```

---

## Phân chia công việc

| LTV | Domain |
|---|---|
| **Anh Duy** | `OrderScreen`, `PaymentScreen`, `TableScreen`, `CustomerScreen` |
| **Quốc** | `SetupScreen`, `SettingsScreen`, `MaintenanceScreen`, `StockScreen`, `EmployeeScreen` |
| Chung (ai nhận trước) | `LoginScreen`, `MainMenuScreen` |

CODEOWNERS đã được cấu hình → khi PR động đến vùng phụ trách của người kia, GitHub tự đề xuất review.

---

## Tóm tắt — chỉ cần nhớ 3 prompt

| Khi nào | Việc thủ công | Prompt |
|---|---|---|
| Lần đầu tiên | Accept GitHub invite + `claude` ở thư mục mẹ | **PROMPT-1** |
| Mỗi màn hình mới | `cd Platform && claude` | **PROMPT-2** (thay `<TÊN-MÀN-HÌNH>`) |
| Khi CI báo đỏ | Copy log lỗi từ PR + `claude` | **PROMPT-3** |

Còn lại Claude Code + hệ thống tự lo. Tập trung vào **thiết kế đẹp, đúng tài liệu, hai theme hoạt động tốt**.

Mọi câu hỏi nhắn cho Hyojae.

Chúc may mắn 🚀
