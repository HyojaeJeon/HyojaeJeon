# Hướng dẫn cộng tác Platform / Platform 협업 가이드

> **Tiếng Việt**: Hướng dẫn vận hành để hai lập trình viên triển khai 100+ màn hình theo cùng một pattern bằng Claude Code.
>
> **한국어**: 두 개발자가 클로드코드로 100+개 화면을 동일 패턴으로 작업하기 위한 운영 가이드.

Tất cả quy tắc nằm trong `BrandPosApp/PosUi/CLAUDE.md` và `src/shared/ui/INDEX.md`. Tài liệu này chỉ mô tả **vận hành / cài đặt / luồng merge**.
규칙은 모두 `BrandPosApp/PosUi/CLAUDE.md` 와 `src/shared/ui/INDEX.md` 에 있다. 이 문서는 **운영 / 셋업 / 머지 흐름** 만 다룬다.

---

## 0. Hệ thống chặn tự động / 자동 차단 시스템

**Tiếng Việt**: Vi phạm quy tắc bị hệ thống chặn tự động. Người review chỉ cần kiểm tra tính tự nhiên của phần dịch tiếng Việt và sự khớp về mặt ý nghĩa.

**한국어**: 규칙 위반은 시스템이 자동 차단한다. 사람 리뷰어는 베트남어 자연스러움과 의미 일치만 본다.

| Giai đoạn / 단계 | Công cụ / 도구 | Chặn cái gì / 무엇을 막는가 |
|---|---|---|
| Local commit | Husky pre-commit + lint-staged | Vi phạm ESLint / ESLint 룰 위반 |
| Local commit | `scripts/check-posui-rules.sh` | Cấu trúc thư mục, header song ngữ, 3 fixture, pattern endpoint, giới hạn 200 dòng, inline SVG / 폴더 구조, 한·베 헤더, fixture 3종, 200줄, inline SVG |
| Tạo PR / PR 생성 | GitHub Actions `PosUi Rules` | TypeScript toàn dự án + ESLint/custom rules **chỉ trên file thay đổi** / 전체 TypeScript + ESLint·custom rules **changed files only** |
| Trước khi merge / 머지 직전 | GitHub Branch Protection | 1 approval + CI pass / 1명 승인 + CI 통과 |

→ Quên ở local thì GitHub bắt; cố vượt GitHub thì branch protection chặn.
→ 로컬에서 잊어도 GitHub 가 잡고, GitHub 를 우회하려 해도 branch protection 이 막는다.

**Quan trọng / 중요**: CI chỉ kiểm tra ESLint/custom rules trên file thay đổi của PR. File mới hoặc file mà PR đó chỉnh đến → bị chặn 100%. Vi phạm cũ tích lũy ở file khác → bỏ qua, sẽ được dọn dần khi tác giả chạm tới (theo CLAUDE.md).
**한국어**: CI 의 ESLint/custom rules 는 PR 의 변경된 파일만 검사한다. 신규/만진 파일은 100% 차단, 그 외 기존 누적 위반은 무시 → 각 화면 작업 시 점진적으로 정리 (CLAUDE.md 방침과 일치).

---

## 1. Cài đặt 1 lần cho repo owner / 저장소 소유자 1회 셋업

**Tiếng Việt**:

1. GitHub `Settings → Collaborators` → mời hai lập trình viên với quyền `Write`.
2. GitHub `Settings → Branches → Add rule` cho nhánh `main`:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Required: `Lint / Type / Custom rules` (sau khi PR đầu tiên chạy CI một lần thì check này hiện trong danh sách)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
3. GitHub `Settings → Actions → General` → `Workflow permissions` → bật `Read and write permissions`.

Cài 1 lần thì **cả Admin cũng không thể push trực tiếp lên main hay vượt CI**.

**한국어**: 위와 동일. `Write` 권한 초대 → `main` branch protection 6개 항목 → Workflow permissions 활성화. 한 번 설정하면 Admin 도 main 직접 푸시 / CI 우회 불가.

---

## 2. Cài đặt 1 lần cho mỗi lập trình viên / 각 개발자 1회 셋업

```bash
# 1) Clone / 클론
git clone https://github.com/HyojaeJeon/HJ-POS-ReDesigned.git Platform
cd Platform

# 2) Git user / git 사용자 정보
git config user.name "Tên / 본인 이름"
git config user.email "Email GitHub"

# 3) Cài dependency PosUi + bật Husky / 의존성 + Husky 활성화
cd BrandPosApp/PosUi
npm install
# `prepare` script tự bật Husky / prepare 스크립트가 husky 자동 활성화

# 4) Mock mode env / mock 환경변수
echo "NEXT_PUBLIC_DATA_SOURCE=mock" > .env.local

# 5) Local check / 로컬 검증
npm run check    # typecheck + lint + custom rules

# 6) Dev server / 개발 서버
npm run dev      # http://localhost:3001
```

---

## 3. Luồng làm việc hàng ngày / 일상 작업 흐름

```bash
# A) Cập nhật main / main 최신화
git checkout main
git pull origin main

# B) Mỗi màn hình một branch / 화면 1개당 브랜치 1개
git checkout -b feat/<screen-name>

# C) Chạy Claude Code từ thư mục gốc / 프로젝트 루트에서 클로드코드 실행
cd ../..
claude
# Lệnh đầu tiên / 첫 지시:
#   "Đọc BrandPosApp/PosUi/CLAUDE.md và src/shared/ui/INDEX.md,
#    rồi triển khai <tên màn hình> theo workflow 7 bước."
#   "BrandPosApp/PosUi/CLAUDE.md 와 src/shared/ui/INDEX.md 를 읽고,
#    7단계 워크플로우에 따라 <화면명> 을 작업해줘"

# D) Commit (pre-commit hook tự kiểm tra / 자동 검증)
git add <files>
git commit -m "feat(<screen>): ..."

# E) Push
git push -u origin feat/<screen-name>

# F) Tạo PR / PR 생성
gh pr create
# CI tự chạy. Phải pass mới merge / CI 자동 실행. 통과해야 머지

# G) Reviewer còn lại approve → merge → branch tự xoá
# 다른 개발자 승인 → 머지 → 브랜치 자동 삭제
```

---

## 4. Phân chia domain / 도메인 분담

| LTV / 개발자 | Domain / 도메인 |
|---|---|
| A | `OrderScreen`, `PaymentScreen`, `TableScreen`, `CustomerScreen` |
| B | `SetupScreen`, `SettingsScreen`, `MaintenanceScreen`, `StockScreen`, `EmployeeScreen` |
| Chung / 공통 | `LoginScreen`, `MainMenuScreen` |

**Tiếng Việt** — Vùng chung phải tách thành PR riêng (merge ngay):
**한국어** — 선행 PR 로 분리해야 하는 공통 영역 (즉시 머지):

- `src/shared/ui/**`
- `src/shared/ui/INDEX.md`
- `src/styles/tokens/**`
- `src/contracts/**`
- `src/store/api/posApi.ts`
- `src/i18n/**`
- `CLAUDE.md`, `BrandPosApp/PosUi/CLAUDE.md`

---

## 5. Khi xảy ra conflict / 충돌

```bash
git checkout main && git pull origin main
git checkout feat/<my-branch>
git rebase main
# Resolve / 해결
git add <resolved-files>
git rebase --continue
git push --force-with-lease    # rebase 후만, force 금지
```

---

## 6. Khi CI báo đỏ / CI 빨간불

1. Tab `Checks` của PR → xem bước fail / `Checks` 탭에서 실패 단계 확인
2. **TypeScript** → sửa type / 타입 수정
   **ESLint** → sửa theo message / 메시지대로 수정
   **Custom rules** → sửa theo log của `scripts/check-posui-rules.sh` / 메시지대로 수정
3. Push lại → CI tự chạy lại / 푸시 시 CI 자동 재실행

---

## 7. Tại sao không dùng SSH workspace dùng chung / SSH 단일 워크스페이스 미사용 이유

- Hai phiên Claude Code chỉnh cùng file → mất dữ liệu âm thầm / 같은 파일 동시 수정 → 사일런트 손실
- PC của A tắt thì B không làm việc được / A PC 꺼지면 B 작업 불가
- Không có lịch sử thay đổi / 변경 이력 추적 불가
- Hot-reload bị vỡ build / hot-reload 빌드 깨짐

→ Git PR + CI tự chặn. / git PR + 자동 차단 CI 가 정답.

---

## 8. Tình huống khẩn cấp / 비상 상황

| Tình huống / 상황 | Cách xử lý / 대응 |
|---|---|
| Main bị hỏng / main 깨짐 | `git revert <commit>` → tác giả PR fix / 원인 PR 작성자가 fix |
| Force push nhầm / force push 사고 | `git reflog`. Branch protection phải chặn force / branch protection 으로 force push 차단 |
| Hai người tạo cùng component shared/ui / 같은 shared/ui 동시 작성 | Bên merge trước được giữ / 먼저 머지된 쪽 채택 |
| Claude Code lặp lỗi / 클로드코드 같은 실수 반복 | Bổ sung quy tắc rõ hơn vào CLAUDE.md / CLAUDE.md 에 규칙 보강 |
