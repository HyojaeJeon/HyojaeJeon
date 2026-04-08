# Hướng dẫn cho lập trình viên (Anh Duy & Quốc)

> Tài liệu này dành riêng cho hai lập trình viên triển khai 100+ màn hình EdgePos bằng Claude Code.
> Đọc 1 lần là đủ. Mọi thứ về git / PR / CI đều đã được tự động hoá — bạn chỉ cần tập trung vào **thiết kế màn hình**.

---

## 1. Repo

**URL**: https://github.com/HyojaeJeon/HJ-POS-ReDesigned

Bạn sẽ nhận được lời mời cộng tác qua email GitHub. Hãy chấp nhận trước khi clone.

---

## 2. Cài đặt 1 lần (chỉ làm 1 lần đầu)

```bash
# 1) Clone repo
git clone https://github.com/HyojaeJeon/HJ-POS-ReDesigned.git Platform
cd Platform

# 2) Cấu hình git của bạn
git config user.name "Tên của bạn"
git config user.email "email GitHub của bạn"

# 3) Cài dependency PosUi (sẽ tự bật Husky pre-commit hook)
cd BrandPosApp/PosUi
npm install

# 4) Tạo file môi trường mock (làm việc UI không cần backend C++)
echo "NEXT_PUBLIC_DATA_SOURCE=mock" > .env.local

# 5) Kiểm tra local 1 lần để chắc chắn mọi thứ chạy được
npm run check

# 6) Mở dev server
npm run dev
# → mở http://localhost:3001
```

Sau bước này bạn không cần cài lại gì nữa.

---

## 3. Quy trình làm việc 1 màn hình (chỉ 3 bước)

### Bước 1 — Bắt đầu công việc

```bash
cd ~/Platform        # vào thư mục gốc của repo
bash scripts/screen-start.sh order-screen
```

→ Script tự làm:
- Đồng bộ branch `main` mới nhất
- Tạo branch `feat/order-screen` cho bạn
- In ra prompt chuẩn để bạn dán vào Claude Code

**Bạn không cần gõ bất cứ lệnh git nào.**

### Bước 2 — Thiết kế bằng Claude Code

```bash
claude
```

Sau khi Claude Code mở, dán nguyên prompt mà script đã in ra:

```
Hãy đọc trước BrandPosApp/PosUi/CLAUDE.md và src/shared/ui/INDEX.md,
rồi triển khai order-screen theo đúng workflow 7 bước.
Tất cả 12 mục checklist PR phải pass.
```

Claude Code sẽ tự đọc các file hướng dẫn và làm việc theo đúng quy tắc:
- Tự đọc tài liệu màn hình (`.md` của màn hình)
- Tự thêm contract / fixture / endpoint
- Tự dùng `shared/ui` thay vì viết UI inline
- Tự tách `index.tsx` (orchestrator) + `components/` + `hooks/`
- Tự viết comment song ngữ Hàn / Việt
- Tự cập nhật mục "작업 진행 기록" của tài liệu màn hình

**Bạn chỉ cần xem kết quả, chỉnh chi tiết khi cần, và yêu cầu Claude sửa nếu bạn thấy gì chưa đúng.** Không cần lo về git, lint, hay quy tắc — hệ thống sẽ tự chặn nếu sai.

### Bước 3 — Hoàn tất

```bash
bash scripts/screen-done.sh "feat: triển khai OrderScreen"
```

→ Script tự làm:
- Chạy `npm run check` (TypeScript + ESLint + custom rules)
- Nếu fail → in ra lỗi để bạn sửa, không commit
- Nếu pass → `git add` + `git commit` + `git push`
- Tự tạo Pull Request lên GitHub (template tự đính kèm)

Xong. Bạn chỉ cần đợi đồng nghiệp review và merge.

---

## 4. Khi CI báo đỏ

Nếu PR bị đỏ (CI fail), mở tab `Checks` của PR trên GitHub để xem lỗi:

| Loại lỗi | Cách xử lý |
|---|---|
| **TypeScript** | Sửa lỗi kiểu |
| **ESLint** | Đọc thông báo và sửa (ví dụ: dùng `useCallback` → bỏ; dùng `bg-red-500` → đổi sang `bg-pos-error`; gọi `window.cefQuery` → dùng RTK Query hook) |
| **Custom rules** | Đọc log để biết file nào thiếu header song ngữ / fixture / cấu trúc thư mục |

Sửa xong, chỉ cần commit và push lại trên cùng branch:

```bash
git add .
git commit -m "fix: ..."
git push
```

CI sẽ tự chạy lại.

---

## 5. Khi bị conflict với main

```bash
git checkout main
git pull origin main
git checkout feat/<tên-branch-của-bạn>
git rebase main
# Giải quyết conflict trong editor
git add .
git rebase --continue
git push --force-with-lease
```

**Không bao giờ dùng `git push --force`** — chỉ dùng `--force-with-lease`.

---

## 6. Phân chia công việc

| Lập trình viên | Domain phụ trách |
|---|---|
| **Anh Duy** | `OrderScreen`, `PaymentScreen`, `TableScreen`, `CustomerScreen` |
| **Quốc** | `SetupScreen`, `SettingsScreen`, `MaintenanceScreen`, `StockScreen`, `EmployeeScreen` |
| Chung (ai nhận trước) | `LoginScreen`, `MainMenuScreen` |

Khi PR động đến vùng phụ trách của người kia → GitHub tự đề xuất review.

**Vùng chung** (phải tách thành PR riêng và merge ngay để không chặn người kia):
- `src/shared/ui/**` (component dùng chung)
- `src/contracts/**` (TypeScript contract)
- `src/styles/tokens/**` (design token)
- `src/i18n/**` (bản dịch)
- `CLAUDE.md`, `COLLABORATION.md`

Không gộp các thay đổi này vào PR màn hình.

---

## 7. Quy tắc tuyệt đối (hệ thống sẽ tự chặn nếu vi phạm)

Bạn không cần nhớ — pre-commit hook và CI sẽ chặn tự động. Nhưng để hiểu tại sao:

1. **Không dùng `useCallback` / `useMemo` / `React.memo`** → React Compiler tự lo. Code thường thôi.
2. **Không dùng raw color (`#ff0000`, `bg-red-500`)** → chỉ dùng design token (`bg-pos-error`, `text-pos-text`).
3. **Không gọi `window.cefQuery` trực tiếp** → dùng RTK Query hook.
4. **Không viết UI mới trong file màn hình** → thêm vào `shared/ui` trước, rồi import.
5. **Không viết inline SVG** → dùng `shared/ui/atoms/Icon`.
6. **`index.tsx` của màn hình ≤ 200 dòng** → tách thành `components/` và `hooks/`.
7. **Mọi file phải có comment song ngữ Hàn / Việt** ở header (`한국어:` / `Tiếng Việt:`).
8. **Mọi fixture phải có 3 kịch bản** `default` / `empty` / `error`.
9. **Mọi endpoint phải dùng pattern `switch (DATA_SOURCE)`**.
10. **Light/dark theme đều phải hoạt động** → chỉ dùng design token, không viết logic theme thủ công.

---

## 8. Khi cần thêm component mới vào `shared/ui`

Nếu Claude Code phát hiện cần một component chưa có trong `src/shared/ui/INDEX.md`:

1. Dừng công việc màn hình hiện tại.
2. Tạo branch riêng: `bash scripts/screen-start.sh shared-ui-<component-name>`
3. Để Claude Code thêm component vào `src/shared/ui/<atoms|molecules|organisms>/<PascalCase>.tsx`.
4. Cập nhật `src/shared/ui/INDEX.md` (thêm 1 dòng).
5. `bash scripts/screen-done.sh "feat(shared-ui): add <ComponentName>"`
6. Đợi merge nhanh, sau đó quay lại branch màn hình ban đầu.

---

## 9. Nếu bạn bị kẹt

- **Claude Code lặp lại sai cùng một lỗi** → bảo Claude Code "hãy đọc lại BrandPosApp/PosUi/CLAUDE.md mục X" rồi yêu cầu sửa.
- **CI fail mà không hiểu lý do** → copy thông báo lỗi và hỏi Claude Code "vì sao lỗi này, sửa thế nào?".
- **Conflict không tự giải quyết được** → nhắn người còn lại trước khi `--force-with-lease`.
- **Lỗi nghiêm trọng làm hỏng main** → KHÔNG được tự fix bằng force push. Báo ngay cho Hyojae.

---

## 10. Tóm tắt: bạn chỉ cần nhớ 2 lệnh

```bash
bash scripts/screen-start.sh <tên-màn-hình>      # bắt đầu
bash scripts/screen-done.sh "<commit message>"  # hoàn tất
```

Còn lại là Claude Code + hệ thống tự lo. Hãy tập trung vào **thiết kế màn hình đẹp, đúng tài liệu, hai theme hoạt động tốt**.

Chúc may mắn 🚀
