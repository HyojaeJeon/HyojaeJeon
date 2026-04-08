# Platform 협업 가이드

> 한국어: 두 개발자가 클로드코드로 100+개 화면을 동일 패턴으로 작업하기 위한 운영 가이드.
> Tiếng Việt: Hướng dẫn vận hành để hai lập trình viên triển khai 100+ màn hình theo cùng một pattern bằng Claude Code.

규칙은 모두 `BrandPosApp/PosUi/CLAUDE.md` 와 `src/shared/ui/INDEX.md` 에 있다. 이 문서는 **운영 / 셋업 / 머지 흐름** 만 다룬다.

---

## 0. 자동 차단 시스템 (사람이 잊을 수 없도록)

규칙 위반은 시스템이 차단한다. 사람 리뷰어는 베트남어 자연스러움 / 의미 일치만 본다.

| 단계 | 차단 도구 | 무엇을 막는가 |
|---|---|---|
| 로컬 commit | Husky pre-commit + lint-staged | ESLint 룰 위반 (useCallback, raw color, cefQuery, palette 직접) |
| 로컬 commit | `scripts/check-posui-rules.sh` | 폴더 구조, 한/베 헤더 주석, fixture 3종, endpoint reference 패턴, index.tsx 200줄 제한, inline SVG |
| PR 생성 | GitHub Actions `PosUi Rules` | TypeScript / ESLint / 위 커스텀 룰 모두 재검증 |
| 머지 직전 | GitHub Branch Protection | 다른 개발자 1명의 승인 + CI 통과 필수 |

→ 로컬에서 잊어도 GitHub 가 잡고, GitHub 를 우회하려 해도 branch protection 이 막는다.

---

## 1. 저장소 소유자 1회 셋업 (관리자만)

1. GitHub `Settings → Collaborators` → 두 개발자 `Write` 권한으로 초대.
2. GitHub `Settings → Branches → Add rule` (`main` 브랜치):
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Required: `PosUi Rules / Lint / Type / Custom rules`
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
3. GitHub `Settings → Actions → General` → `Workflow permissions` → `Read and write permissions` 활성화.

이걸 한 번만 설정하면, **Admin 도 main 에 직접 푸시하거나 CI 를 우회할 수 없다.**

---

## 2. 각 개발자 1회 셋업

```bash
# 1) clone
git clone https://github.com/HyojaeJeon/HJ-POS-ReDesigned.git Platform
cd Platform

# 2) git 사용자 정보 (커밋 작성자)
git config user.name "본인 이름"
git config user.email "본인 GitHub 이메일"

# 3) PosUi 의존성 설치 + Husky 활성화
cd BrandPosApp/PosUi
npm install
# npm install 시 package.json 의 prepare 스크립트가 husky 를 자동 활성화한다

# 4) mock 모드 환경변수
echo "NEXT_PUBLIC_DATA_SOURCE=mock" > .env.local

# 5) 로컬 검증 1회 실행
npm run check    # typecheck + lint + custom rules

# 6) 개발 서버
npm run dev      # http://localhost:3001
```

---

## 3. 일상 작업 흐름 (모든 화면 동일)

```bash
# A) main 최신화
git checkout main
git pull origin main

# B) 화면 1개당 브랜치 1개
git checkout -b feat/<screen-name>

# C) 클로드코드 실행 (프로젝트 루트에서)
cd ../..    # Platform 루트로
claude
# 첫 지시:
#   "BrandPosApp/PosUi/CLAUDE.md 와 src/shared/ui/INDEX.md 를 읽고,
#    7단계 워크플로우에 따라 <화면명> 을 작업해줘"

# D) 커밋 (pre-commit hook 이 자동 검증)
git add <files>
git commit -m "feat(<screen>): ..."
# 만약 pre-commit 에서 빨간불 → 위반 메시지대로 수정 후 재커밋

# E) 푸시
git push -u origin feat/<screen-name>

# F) PR 생성 (PR 템플릿이 자동 첨부됨)
gh pr create
# GitHub Actions 가 자동 실행. 모든 검증 통과해야 머지 가능.

# G) 다른 개발자가 리뷰 → 승인 → 머지 → 브랜치 자동 삭제
```

---

## 4. 도메인 분담 (CLAUDE.md 와 동일)

| 개발자 | 도메인 |
|---|---|
| A | OrderScreen, PaymentScreen, TableScreen, CustomerScreen |
| B | SetupScreen, SettingsScreen, MaintenanceScreen, StockScreen, EmployeeScreen |
| 공통 | LoginScreen, MainMenuScreen (먼저 잡는 사람) |

**선행 PR 로 분리해야 하는 공통 영역**:
- `src/shared/ui/**`
- `src/shared/ui/INDEX.md`
- `src/styles/tokens/**`
- `src/contracts/**`
- `src/store/api/posApi.ts`
- `src/i18n/**`
- `CLAUDE.md`, `BrandPosApp/PosUi/CLAUDE.md`

화면 PR 안에 위 변경을 함께 넣지 말 것. 즉시 머지로 블로커 제거.

---

## 5. 충돌이 났을 때

```bash
git checkout main
git pull origin main
git checkout feat/<my-branch>
git rebase main
# 충돌 해결
git add <resolved-files>
git rebase --continue
git push --force-with-lease    # rebase 후만, force 금지
```

---

## 6. CI 가 빨간불일 때

1. PR 페이지의 `Checks` 탭에서 실패 단계 확인
2. 실패 종류:
   - **TypeScript** → 타입 에러. 코드 수정.
   - **ESLint** → 메시지대로 수정 (`useCallback`, raw color, `cefQuery` 등)
   - **Custom rules** → `scripts/check-posui-rules.sh` 가 출력한 메시지대로 수정
3. 푸시하면 CI 자동 재실행

---

## 7. SSH 단일 워크스페이스 방식을 쓰지 않는 이유

- 두 클로드코드가 같은 파일을 동시 수정 → 사일런트 데이터 손실
- A 의 PC 가 꺼지면 B 작업 불가
- 변경 이력 추적 불가, 백업 없음
- dev server hot-reload 중 동시 수정 → 빌드 깨짐

→ git PR 흐름 + 자동 차단 CI 가 정답. 사람 실수를 시스템이 막는다.

---

## 8. 비상 상황

| 상황 | 대응 |
|---|---|
| main 이 깨짐 | `git revert <commit>` → 원인 PR 작성자가 fix PR |
| force push 사고 | `git reflog` 로 복구. branch protection 이 force push 를 막아야 함 |
| 같은 shared/ui 둘이 동시 작성 | 먼저 머지된 쪽 채택. 다른 쪽은 import 만 변경하여 PR 재제출 |
| 클로드코드가 같은 실수 반복 | CLAUDE.md 에 규칙을 더 명시적으로 추가. 두 명 모두 보강 |
