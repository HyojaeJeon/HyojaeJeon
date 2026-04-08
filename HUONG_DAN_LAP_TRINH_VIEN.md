# Hướng dẫn cho lập trình viên (Anh Duy & Quốc)

> Tài liệu duy nhất bạn cần đọc. Toàn bộ flow git / PR / CI / lint đã được tự động hoá.
> Bạn chỉ cần tập trung vào **thiết kế màn hình** bằng Claude Code.
> Trong tài liệu này có sẵn 3 PROMPT để dán vào Claude Code — không cần nghĩ thêm.

---

## 0. Bối cảnh

- Repo: `https://github.com/HyojaeJeon/HJ-POS-ReDesigned`
- Hai LTV: **Anh Duy** + **Quốc**, mỗi người ~50 màn hình.
- Mọi quy tắc nằm trong các file `CLAUDE.md` ở từng thư mục — bạn sẽ tự dịch sang tiếng Việt 1 lần đầu.
- Branch protection đã bật: KHÔNG ai (kể cả admin) có thể push trực tiếp lên main. Mọi thay đổi phải qua PR + 1 approval + CI pass.

---

## 1. Cài đặt 1 lần đầu (làm theo thứ tự, không bỏ bước)

### Bước 1.1 — Chấp nhận lời mời cộng tác

Mở email GitHub hoặc vào: https://github.com/HyojaeJeon/HJ-POS-ReDesigned/invitations
→ Accept invitation

### Bước 1.2 — Clone repo

```bash
git clone https://github.com/HyojaeJeon/HJ-POS-ReDesigned.git Platform
cd Platform
```

### Bước 1.3 — Cấu hình git của bạn

```bash
git config user.name "Tên của bạn"
git config user.email "email GitHub của bạn"
```

### Bước 1.4 — Cài dependency PosUi (sẽ tự bật Husky pre-commit)

```bash
cd BrandPosApp/PosUi
npm install
cd ../..
```

### Bước 1.5 — Tạo file môi trường mock

```bash
echo "NEXT_PUBLIC_DATA_SOURCE=mock" > BrandPosApp/PosUi/.env.local
```

### Bước 1.6 — Dịch toàn bộ CLAUDE.md sang tiếng Việt (CHỈ làm 1 lần)

Repo có nhiều file `CLAUDE.ko.md` (bản gốc tiếng Hàn — KHÔNG được sửa). Bạn cần tạo bản tiếng Việt local cho riêng máy mình. File `CLAUDE.md` đã được `.gitignore` nên bản dịch của bạn sẽ KHÔNG bao giờ được commit lên repo.

Chạy lệnh sau từ thư mục gốc của repo:

```bash
bash scripts/setup-vn.sh
```

Script sẽ sao chép tất cả `CLAUDE.ko.md` → `CLAUDE.md` và in ra một PROMPT. Sau đó:

```bash
claude
```

→ Mở Claude Code, dán nguyên prompt mà script đã in ra (cũng có thể dùng prompt **#PROMPT-1** bên dưới). Claude sẽ dịch toàn bộ.

---

## 2. Quy trình làm việc 1 màn hình (chỉ 3 bước, mỗi ngày lặp lại)

### Bước A — Bắt đầu công việc

```bash
cd ~/Platform
bash scripts/screen-start.sh <screen-name>
```

Ví dụ: `bash scripts/screen-start.sh order-screen`

→ Script tự:
- Đồng bộ branch `main` mới nhất từ GitHub
- Tạo branch `feat/order-screen`
- In ra prompt chuẩn để dán vào Claude Code

### Bước B — Thiết kế bằng Claude Code

```bash
claude
```

Sau khi Claude Code mở, dán **#PROMPT-2** (xem mục 4 bên dưới). Thay `<screen-name>` bằng tên màn hình thật.

Sau đó bạn cùng Claude Code thiết kế màn hình. Claude sẽ tự đọc tài liệu, tự thêm contract / fixture / endpoint / component / hook, tự viết comment song ngữ, tự cập nhật tài liệu màn hình. Bạn chỉ cần xem kết quả và yêu cầu chỉnh nếu thấy chưa đúng.

### Bước C — Hoàn tất công việc

Khi Claude Code làm xong và bạn đã hài lòng:

```bash
bash scripts/screen-done.sh "feat: triển khai OrderScreen"
```

→ Script tự:
- Chạy `npm run check` (TypeScript + ESLint + custom rules)
- Nếu fail → in ra lỗi để bạn (hoặc Claude) sửa, KHÔNG commit
- Nếu pass → `git add` + `git commit` + `git push`
- Tạo Pull Request tự động (template tự đính kèm)

Xong. Đợi đồng nghiệp review và merge. Sau đó quay lại Bước A cho màn hình tiếp theo.

---

## 3. Phân chia công việc

| LTV | Domain |
|---|---|
| **Anh Duy** | `OrderScreen`, `PaymentScreen`, `TableScreen`, `CustomerScreen` |
| **Quốc** | `SetupScreen`, `SettingsScreen`, `MaintenanceScreen`, `StockScreen`, `EmployeeScreen` |
| Chung (ai nhận trước) | `LoginScreen`, `MainMenuScreen` |

Khi PR động đến vùng phụ trách của người kia → GitHub tự đề xuất review (CODEOWNERS).

**Vùng chung** — phải tách thành PR riêng và merge ngay để không chặn người kia:
- `src/shared/ui/**`
- `src/contracts/**`
- `src/styles/tokens/**`
- `src/i18n/**`
- `CLAUDE.ko.md` (bản gốc tiếng Hàn — KHÔNG sửa nếu không có sự đồng ý của Hyojae)

---

## 4. CÁC PROMPT để dán vào Claude Code

Chỉ dùng 3 prompt này, không cần nghĩ thêm.

### #PROMPT-1 — Dịch CLAUDE.md sang tiếng Việt (chỉ làm 1 lần đầu)

```
Tôi là lập trình viên người Việt làm việc trên repo Platform này. Hãy giúp tôi
chuẩn bị môi trường tiếng Việt cho các file hướng dẫn CLAUDE.md.

NHIỆM VỤ:
1. Tìm tất cả file có tên CLAUDE.md (KHÔNG phải CLAUDE.ko.md) trong repo,
   loại trừ node_modules và .next.
2. Đối với mỗi file CLAUDE.md tìm được, dịch TOÀN BỘ nội dung từ tiếng Hàn
   sang tiếng Việt tự nhiên — KHÔNG để lại bất kỳ chữ Hàn nào.
3. Yêu cầu chất lượng dịch:
   - Dùng thuật ngữ POS / nhà hàng tiếng Việt phù hợp.
   - Giữ nguyên cấu trúc Markdown (tiêu đề, bảng, code block, danh sách).
   - Giữ nguyên các thuật ngữ kỹ thuật và tên file/tên biến (RTK Query,
     ESLint, useCallback, shared/ui, cefQuery, contracts, fixtures, etc.).
   - Giữ nguyên đường dẫn file và tên class/function.
4. TUYỆT ĐỐI KHÔNG động đến file CLAUDE.ko.md — đó là bản gốc tiếng Hàn của
   chủ repo.
5. TUYỆT ĐỐI KHÔNG chạy git add / git commit / git push — CLAUDE.md đã được
   thêm vào .gitignore nên sẽ không bao giờ được upload.

Sau khi hoàn tất, in ra danh sách tất cả file CLAUDE.md đã được dịch.
```

### #PROMPT-2 — Bắt đầu thiết kế 1 màn hình (mỗi màn hình 1 lần)

```
Hãy đọc kỹ các file sau TRƯỚC khi bắt đầu công việc:
  1. BrandPosApp/PosUi/CLAUDE.md (quy tắc làm việc PosUi — bản tiếng Việt)
  2. BrandPosApp/PosUi/src/shared/ui/INDEX.md (catalog component dùng chung)
  3. Tài liệu màn hình: 1.Docs/기획 및 설계/프로젝트 통합설계/화면리스트/화면설계,구조,요소/<screen-name>.md

Sau đó triển khai màn hình <screen-name> theo đúng workflow 7 bước trong CLAUDE.md:
  Bước 0 — Học sẵn (đọc INDEX.md + reference screen cùng pattern)
  Bước 1 — Đọc tài liệu màn hình, đảm bảo các mục 5.1 / 5.2 / 5.3 đã có
  Bước 2 — Thêm contract types vào src/contracts/<domain>/<feature>.types.ts
  Bước 3 — Tạo fixture 3 kịch bản (default / empty / error) trong src/mocks/fixtures
  Bước 4 — Thêm endpoint theo pattern reference (switch DATA_SOURCE) trong store/api
  Bước 5 — Tạo screens/<Screen>/index.tsx (thin orchestrator) + components/ + hooks/
  Bước 6 — Cập nhật mục "작업 진행 기록" của tài liệu màn hình

YÊU CẦU TUYỆT ĐỐI:
  - KHÔNG dùng useCallback / useMemo / React.memo (React Compiler tự lo)
  - KHÔNG dùng raw color (#ff0000, bg-red-500) — chỉ dùng design token
    (bg-pos-error, text-pos-text, h-touch, rounded-pos-input...)
  - KHÔNG gọi window.cefQuery — dùng RTK Query hook
  - KHÔNG viết UI mới trong file màn hình — phải thêm vào shared/ui trước
    rồi import (nếu shared/ui chưa có, hãy nói tôi biết)
  - KHÔNG viết inline SVG — dùng shared/ui/atoms/Icon
  - File index.tsx của màn hình PHẢI ≤ 200 dòng
  - Mọi file phải có header comment SONG NGỮ Hàn / Việt
    (`한국어:` / `Tiếng Việt:`)
  - Mọi fixture phải có 3 kịch bản default / empty / error
  - Light / dark theme đều phải hoạt động (chỉ dùng token, không viết logic theme)

Tất cả 12 mục PR checklist trong CLAUDE.md phải pass — nếu không sẽ bị
pre-commit hook và CI chặn.

Tên màn hình cần triển khai: <screen-name>
```

### #PROMPT-3 — Khi CI báo đỏ trên PR

```
PR của tôi đang bị CI báo đỏ. Đây là log lỗi:

<dán log lỗi từ tab Checks của PR>

Hãy:
1. Phân tích nguyên nhân lỗi.
2. Sửa từng lỗi theo đúng quy tắc trong BrandPosApp/PosUi/CLAUDE.md.
3. KHÔNG được tắt rule, KHÔNG được dùng eslint-disable trừ khi rơi vào
   đúng 4 trường hợp ngoại lệ trong CLAUDE.md (và phải có comment lý do).
4. Sau khi sửa xong, KHÔNG tự commit — để tôi chạy `bash scripts/screen-done.sh`.
```

---

## 5. Quy tắc tuyệt đối (hệ thống tự chặn)

Bạn không cần nhớ — pre-commit hook và GitHub Actions sẽ tự chặn nếu vi phạm. Đây chỉ là tóm tắt:

1. **`useCallback` / `useMemo` / `React.memo`** → KHÔNG dùng (React Compiler tự lo)
2. **Raw color / arbitrary px** → KHÔNG dùng, chỉ dùng design token
3. **`window.cefQuery`** → KHÔNG gọi trực tiếp, dùng RTK Query hook
4. **Inline SVG / inline UI primitive** → KHÔNG viết trong file màn hình
5. **`screens/<Screen>/index.tsx` ≤ 200 dòng** → tách `components/` + `hooks/`
6. **Header comment song ngữ Hàn/Việt** → mọi `.ts`/`.tsx` đều cần
7. **Fixture 3 kịch bản** → `default` / `empty` / `error`
8. **Endpoint pattern** → `switch (DATA_SOURCE)`
9. **Light/dark theme** → chỉ token, không viết logic theme
10. **Branch ≠ main** → không bao giờ commit trực tiếp lên main

Vi phạm bất kỳ điều nào → `bash scripts/screen-done.sh` sẽ fail và in ra lý do. Sửa rồi chạy lại.

---

## 6. Khi bị conflict với main

```bash
git checkout main
git pull origin main
git checkout feat/<branch-của-bạn>
git rebase main
# Giải quyết conflict trong editor
git add .
git rebase --continue
git push --force-with-lease
```

KHÔNG bao giờ dùng `git push --force` — chỉ dùng `--force-with-lease`.

---

## 7. Khi cần thêm component mới vào `shared/ui`

Nếu trong lúc làm màn hình bạn (hoặc Claude) phát hiện cần component mới chưa có trong `INDEX.md`:

1. Tạm dừng PR màn hình hiện tại.
2. Tạo branch riêng:
   ```bash
   bash scripts/screen-start.sh shared-ui-<component-name>
   ```
3. Bảo Claude Code thêm component vào `src/shared/ui/<atoms|molecules|organisms>/<PascalCase>.tsx` và cập nhật `INDEX.md`.
4. Hoàn tất:
   ```bash
   bash scripts/screen-done.sh "feat(shared-ui): add <ComponentName>"
   ```
5. Đợi merge nhanh, sau đó `git pull origin main` về branch màn hình ban đầu để lấy component mới và tiếp tục.

---

## 8. Tóm tắt — chỉ cần nhớ

| Khi nào | Lệnh |
|---|---|
| Sau khi clone (1 lần đầu) | `bash scripts/setup-vn.sh` → dán **#PROMPT-1** |
| Bắt đầu mỗi màn hình | `bash scripts/screen-start.sh <screen-name>` → dán **#PROMPT-2** |
| Hoàn tất mỗi màn hình | `bash scripts/screen-done.sh "<commit message>"` |
| Khi CI báo đỏ | Mở Claude Code → dán **#PROMPT-3** + log lỗi |

Còn lại Claude Code + hệ thống tự lo. Tập trung vào **thiết kế đẹp, đúng tài liệu, hai theme hoạt động tốt**.

Mọi câu hỏi nhắn cho Hyojae.

Chúc may mắn 🚀
