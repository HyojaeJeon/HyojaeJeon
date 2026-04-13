/**
 * [KO] MealWallet 서비스 — 임직원 식권 지갑(allowance ledger)의 핵심 비즈니스 로직.
 *      발급, 조회, 회사 지원금 적립(fund), 개인 충전(topUp), 법인 입금 확인(confirmDeposit)을 담당합니다.
 *
 *      ========== 보안 원칙 ==========
 *      - 모든 read/write 경로에서 caller의 corporateContext와 대상 row의 corporateId를 강제 비교합니다.
 *      - SUPER_ADMIN만 corporate 경계를 자유롭게 넘을 수 있습니다.
 *      - capability(기능 사용 권한) + permission(RBAC 권한) 이중 가드를 적용합니다.
 *
 *      ========== 자금 흐름 ==========
 *      1. 법인이 Funding Account에 예치금 입금 (confirmDeposit)
 *      2. 관리자가 직원 지갑에 회사 지원금 적립 (fund: Funding Account → companyAllowanceVnd)
 *      3. 직원이 개인 돈으로 지갑 충전 (topUp: PG 결제 → personalTopUpVnd)
 *      4. 직원이 가맹점에서 결제 시 2-Bucket split payment (walletLedger.ts에서 처리)
 *
 * [VI] Service MealWallet — logic nghiệp vụ cốt lõi của ví phiếu ăn nhân viên (allowance ledger).
 *      Phát hành, truy vấn, cấp trợ cấp công ty (fund), nạp cá nhân (topUp), xác nhận nạp tiền pháp nhân (confirmDeposit).
 *
 *      ========== Nguyên tắc bảo mật ==========
 *      - Mọi đường đọc/ghi đều bắt buộc so khớp corporateContext của caller với corporateId của bản ghi.
 *      - Chỉ SUPER_ADMIN mới vượt qua ranh giới corporate tự do.
 *      - Áp dụng bảo vệ kép: capability (quyền sử dụng tính năng) + permission (quyền RBAC).
 *
 *      ========== Luồng vốn ==========
 *      1. Pháp nhân nạp ký quỹ vào Funding Account (confirmDeposit)
 *      2. Quản trị viên cấp trợ cấp vào ví nhân viên (fund: Funding Account → companyAllowanceVnd)
 *      3. Nhân viên tự nạp tiền cá nhân vào ví (topUp: thanh toán PG → personalTopUpVnd)
 *      4. Nhân viên thanh toán tại cửa hàng bằng split payment 2-Bucket (xử lý tại walletLedger.ts)
 */
import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/callerCtx';
import { CreateMealWalletInput } from './dto/CreateMealWallet.input';
import { FundMealWalletInput } from './dto/FundMealWallet.input';
import { TopUpMealWalletInput } from './dto/TopUpMealWallet.input';
import { DomainError } from '@core/errors/DomainError';
import {
  COMPANY_ALLOWANCE_SOURCE_TYPE,
  PERSONAL_TOP_UP_SOURCE_TYPE,
  applyMealWalletFunding,
} from './_internal/walletLedger';

@Injectable()
export class MealWalletService {
  constructor(
    /** [KO] Prisma ORM 서비스 — DB 접근 / [VI] Service Prisma ORM — truy cập DB */
    private readonly prisma: PrismaService,
    /** [KO] 기능 사용 권한(Entitlement) 서비스 — MEAL_TICKET capability 검증 / [VI] Service quyền sử dụng tính năng — kiểm tra capability MEAL_TICKET */
    private readonly entitlement: EntitlementService,
    /** [KO] RBAC 권한 서비스 — 세부 작업 권한 검증 / [VI] Service quyền RBAC — kiểm tra quyền thao tác chi tiết */
    private readonly permission: PermissionService,
  ) {}

  /**
   * [KO] 직원 ID로 지갑 단건 조회
   *      단계:
   *      1. employeeId로 지갑을 DB에서 조회
   *      2. 지갑이 없으면 null 반환
   *      3. 지갑이 있으면 caller의 corporateContext와 지갑의 corporateId 비교 → 불일치 시 에러
   *      4. 스코프 검증을 통과하면 지갑 반환
   *
   * [VI] Truy vấn ví theo ID nhân viên
   *      Các bước:
   *      1. Tìm ví trong DB bằng employeeId
   *      2. Không tìm thấy → trả về null
   *      3. Tìm thấy → so khớp corporateContext của caller với corporateId của ví → lỗi nếu không khớp
   *      4. Vượt qua kiểm tra phạm vi → trả về ví
   */
  async findByEmployee(ctx: MealCallerCtx, employeeId: string) {
    const wallet = await this.prisma.mealWallet.findUnique({ where: { employeeId } });
    if (!wallet) return null;
    assertCorporateScope(ctx, wallet.corporateId);
    return wallet;
  }

  /**
   * [KO] 지갑 ID로 단건 조회 — 없으면 RESOURCE_NOT_FOUND 에러를 던집니다.
   * [VI] Truy vấn ví theo ID — không tìm thấy thì ném lỗi RESOURCE_NOT_FOUND.
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const wallet = await this.prisma.mealWallet.findUnique({ where: { id } });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);
    return wallet;
  }

  /**
   * [KO] 법인(Corporate) ID로 지갑 목록 조회 (페이지네이션)
   *      1차 방어: caller의 corporateContext가 요청 corporateId와 다르면 즉시 거절 (Prisma 호출 전).
   *      2차 방어: WHERE 절에 corporateId를 명시 — SUPER_ADMIN이라도 다른 corporate row가 섞일 수 없습니다.
   *
   * [VI] Truy vấn danh sách ví theo ID pháp nhân (phân trang)
   *      Bảo vệ cấp 1: Nếu corporateContext của caller khác corporateId yêu cầu → từ chối ngay (trước khi gọi Prisma).
   *      Bảo vệ cấp 2: Ghi rõ corporateId trong mệnh đề WHERE — dù SUPER_ADMIN cũng không thể trộn lẫn bản ghi corporate khác.
   */
  async listByCorporate(
    ctx: MealCallerCtx,
    corporateId: string,
    skip: number,
    take: number,
  ) {
    assertCorporateScope(ctx, corporateId);
    const where = { corporateId };
    const [data, totalCount] = await Promise.all([
      this.prisma.mealWallet.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealWallet.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * [KO] 신규 지갑 발급
   *      단계:
   *      1. employeeId로 직원 조회 → 없거나 삭제됨이면 에러
   *      2. caller의 corporateContext와 직원의 corporateId 비교 (스코프 검증)
   *      3. target corporate 기준으로 MEAL_TICKET capability 확인
   *      4. corporate.wallet.write RBAC 권한 확인
   *      5. 모든 가드 통과 시 지갑 생성 (DB INSERT)
   *
   * [VI] Phát hành ví mới
   *      Các bước:
   *      1. Tìm nhân viên bằng employeeId → lỗi nếu không tồn tại hoặc đã xóa
   *      2. So khớp corporateContext của caller với corporateId của nhân viên (kiểm tra phạm vi)
   *      3. Kiểm tra capability MEAL_TICKET cho corporate đích
   *      4. Kiểm tra quyền RBAC corporate.wallet.write
   *      5. Vượt qua mọi bảo vệ → tạo ví (DB INSERT)
   */
  async create(ctx: MealCallerCtx, input: CreateMealWalletInput) {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Employee' }, details: { reason: 'Employee not found' } });
    }
    assertCorporateScope(ctx, employee.corporateId);

    const targetCtx = withTargetCorporate(ctx, employee.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.write');

    return this.prisma.mealWallet.create({
      data: {
        corporateId: employee.corporateId,
        employeeId: employee.id,
        dailyLimitVnd: input.dailyLimitVnd,
      },
    });
  }

  /**
   * [KO] 회사 지원금 적립 (Fund) — Funding Account에서 직원 지갑의 companyAllowanceVnd 버킷으로 이동
   *
   *      단계:
   *      1. 금액 양수 검증 (0 이하면 에러)
   *      2. walletId로 지갑 조회 → 없으면 에러
   *      3. caller corporate 스코프 검증
   *      4. MEAL_TICKET capability + corporate.wallet.fund RBAC 권한 확인
   *      5. 트랜잭션 시작:
   *         a. 법인(MealCorporate) 조회
   *         b. fundingModel이 PREPAID_DEPOSIT이면:
   *            - 법인 예치금 잔액 >= 적립 금액인지 확인 (부족하면 INSUFFICIENT_DEPOSIT 에러)
   *            - 법인 예치금에서 적립 금액만큼 차감
   *         c. fundingModel이 CREDIT_NET이면:
   *            - 잔액 검증 없이 진행 (외상 방식)
   *         d. walletLedger.applyMealWalletFunding으로 지갑 버킷 상태 계산
   *         e. 지갑 잔액 업데이트 (balanceVnd, companyAllowanceVnd, personalTopUpVnd)
   *         f. FundingEntry 원장 기록 생성 (sourceType: COMPANY_ALLOWANCE)
   *      6. 업데이트된 지갑 반환
   *
   * [VI] Cấp trợ cấp công ty (Fund) — chuyển từ Funding Account vào bucket companyAllowanceVnd của ví
   *
   *      Các bước:
   *      1. Kiểm tra số tiền dương (<=0 thì lỗi)
   *      2. Tìm ví bằng walletId → lỗi nếu không tìm thấy
   *      3. Kiểm tra phạm vi corporate của caller
   *      4. Kiểm tra capability MEAL_TICKET + quyền RBAC corporate.wallet.fund
   *      5. Bắt đầu transaction:
   *         a. Tìm pháp nhân (MealCorporate)
   *         b. Nếu fundingModel là PREPAID_DEPOSIT:
   *            - Kiểm tra số dư ký quỹ >= số tiền cấp (thiếu → lỗi INSUFFICIENT_DEPOSIT)
   *            - Trừ số tiền cấp từ ký quỹ pháp nhân
   *         c. Nếu fundingModel là CREDIT_NET:
   *            - Tiến hành không cần kiểm tra số dư (hình thức ghi nợ)
   *         d. Tính toán trạng thái bucket ví bằng walletLedger.applyMealWalletFunding
   *         e. Cập nhật số dư ví (balanceVnd, companyAllowanceVnd, personalTopUpVnd)
   *         f. Tạo bản ghi sổ cái FundingEntry (sourceType: COMPANY_ALLOWANCE)
   *      6. Trả về ví đã cập nhật
   */
  async fund(ctx: MealCallerCtx, input: FundMealWalletInput) {
    if (input.amountVnd <= 0n) {
      throw new DomainError({ code: 'INVALID_AMOUNT', details: { reason: 'amountVnd must be positive' } });
    }

    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);

    const targetCtx = withTargetCorporate(ctx, wallet.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.fund');

    return this.prisma.$transaction(async (tx) => {
      const corp = await tx.mealCorporate.findUnique({
        where: { id: wallet.corporateId },
      });
      if (!corp) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });

      // [KO] PREPAID_DEPOSIT만 잔액에서 직접 차감. CREDIT_NET*는 외상이므로 잔액 검증 없이 충전 허용.
      // [VI] Chỉ PREPAID_DEPOSIT mới trừ trực tiếp từ số dư. CREDIT_NET* là ghi nợ nên cho phép nạp không cần kiểm tra số dư.
      if (corp.fundingModel === 'PREPAID_DEPOSIT') {
        if (corp.depositBalanceVnd < input.amountVnd) {
          throw new DomainError({ code: 'INSUFFICIENT_DEPOSIT', params: { available: corp.depositBalanceVnd.toString(),
            requested: input.amountVnd.toString() } });
        }
        await tx.mealCorporate.update({
          where: { id: corp.id },
          data: {
            depositBalanceVnd: corp.depositBalanceVnd - input.amountVnd,
          },
        });
      }

      // [KO] walletLedger 헬퍼로 다음 버킷 상태 계산
      // [VI] Tính trạng thái bucket tiếp theo bằng helper walletLedger
      const nextState = applyMealWalletFunding(
        wallet,
        input.amountVnd,
        COMPANY_ALLOWANCE_SOURCE_TYPE,
      );

      // [KO] 지갑 잔액 업데이트 (3개 필드 동시 갱신)
      // [VI] Cập nhật số dư ví (cập nhật đồng thời 3 trường)
      const updatedWallet = await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: nextState.balanceVnd,
          companyAllowanceVnd: nextState.companyAllowanceVnd,
          personalTopUpVnd: nextState.personalTopUpVnd,
        },
      });

      // [KO] 원장(ledger) 기록 생성 — 감사 추적용
      // [VI] Tạo bản ghi sổ cái (ledger) — để theo dõi kiểm toán
      await tx.mealWalletFundingEntry.create({
        data: {
          walletId: wallet.id,
          sourceType: COMPANY_ALLOWANCE_SOURCE_TYPE,
          status: 'POSTED',
          amountVnd: input.amountVnd,
          sourceBatchId: input.sourceBatchId ?? null,
          postedAt: new Date(),
        },
      });

      return updatedWallet;
    });
  }

  /**
   * [KO] 개인 충전 (Top-Up) — 직원이 PG 결제 후 personalTopUpVnd 버킷에 적립
   *
   *      단계:
   *      1. 금액 양수 검증
   *      2. walletId로 지갑 조회 + corporate 스코프 검증
   *      3. MEAL_TICKET capability + corporate.wallet.topup RBAC 권한 확인
   *      4. 트랜잭션 시작:
   *         a. walletLedger.applyMealWalletFunding으로 personalTopUpVnd 버킷 증가 계산
   *         b. 지갑 잔액 업데이트
   *         c. FundingEntry 원장 기록 생성 (sourceType: PERSONAL_TOP_UP)
   *      5. 업데이트된 지갑 반환
   *
   *      ※ fund()와 달리 법인 예치금 차감이 없습니다 — 직원 개인 돈이므로.
   *
   * [VI] Nạp cá nhân (Top-Up) — nhân viên nạp vào bucket personalTopUpVnd sau khi thanh toán PG
   *
   *      Các bước:
   *      1. Kiểm tra số tiền dương
   *      2. Tìm ví bằng walletId + kiểm tra phạm vi corporate
   *      3. Kiểm tra capability MEAL_TICKET + quyền RBAC corporate.wallet.topup
   *      4. Bắt đầu transaction:
   *         a. Tính toán tăng bucket personalTopUpVnd bằng walletLedger.applyMealWalletFunding
   *         b. Cập nhật số dư ví
   *         c. Tạo bản ghi sổ cái FundingEntry (sourceType: PERSONAL_TOP_UP)
   *      5. Trả về ví đã cập nhật
   *
   *      ※ Khác với fund(), không trừ ký quỹ pháp nhân — vì đây là tiền cá nhân nhân viên.
   */
  async topUp(ctx: MealCallerCtx, input: TopUpMealWalletInput) {
    if (input.amountVnd <= 0n) {
      throw new DomainError({ code: 'INVALID_AMOUNT', details: { reason: 'amountVnd must be positive' } });
    }

    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);

    const targetCtx = withTargetCorporate(ctx, wallet.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.topup');

    return this.prisma.$transaction(async (tx) => {
      const nextState = applyMealWalletFunding(
        wallet,
        input.amountVnd,
        PERSONAL_TOP_UP_SOURCE_TYPE,
      );

      const updatedWallet = await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: nextState.balanceVnd,
          companyAllowanceVnd: nextState.companyAllowanceVnd,
          personalTopUpVnd: nextState.personalTopUpVnd,
        },
      });

      // [KO] 개인 충전 원장 기록 — paymentReferenceId로 PG 거래 추적 가능
      // [VI] Bản ghi sổ cái nạp cá nhân — theo dõi giao dịch PG qua paymentReferenceId
      await tx.mealWalletFundingEntry.create({
        data: {
          walletId: wallet.id,
          sourceType: PERSONAL_TOP_UP_SOURCE_TYPE,
          status: 'POSTED',
          amountVnd: input.amountVnd,
          sourceReferenceId: input.paymentReferenceId ?? null,
          postedAt: new Date(),
        },
      });

      return updatedWallet;
    });
  }

  /**
   * [KO] 법인 입금 확인 (Deposit Confirmation)
   *      기업 Funding Account의 잔액을 referenceNo 기반으로 증액합니다.
   *      PREPAID_DEPOSIT 모델에서 은행 이체 확인 후 호출됩니다.
   *
   *      단계:
   *      1. caller corporate 스코프 검증
   *      2. corporateId + ACTIVE 상태인 FundingAccount 조회 → 없으면 에러
   *      3. FundingAccount의 balanceVnd를 amountVnd만큼 증가 (atomic increment)
   *      4. 업데이트된 FundingAccount 반환
   *
   * [VI] Xác nhận nạp tiền pháp nhân (Deposit Confirmation)
   *      Tăng số dư Funding Account của doanh nghiệp dựa trên referenceNo.
   *      Được gọi sau khi xác nhận chuyển khoản ngân hàng trong mô hình PREPAID_DEPOSIT.
   *
   *      Các bước:
   *      1. Kiểm tra phạm vi corporate của caller
   *      2. Tìm FundingAccount có corporateId + trạng thái ACTIVE → lỗi nếu không tìm thấy
   *      3. Tăng balanceVnd của FundingAccount thêm amountVnd (atomic increment)
   *      4. Trả về FundingAccount đã cập nhật
   */
  async confirmDeposit(
    ctx: MealCallerCtx,
    corporateId: string,
    amountVnd: bigint,
    referenceNo: string,
  ) {
    assertCorporateScope(ctx, corporateId);

    const account = await this.prisma.mealFundingAccount.findFirst({
      where: { corporateId, status: 'ACTIVE' },
    });
    if (!account) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'FundingAccount' },
        details: { reason: 'Active funding account not found for corporate' },
      });
    }

    return this.prisma.mealFundingAccount.update({
      where: { id: account.id },
      data: { balanceVnd: { increment: amountVnd } },
    });
    // TODO: AuditLog — DEPOSIT_CONFIRMED (referenceNo: referenceNo)
  }

  /**
   * [KO] 특정 지갑의 FundingEntry(원장 항목) 목록 조회 (페이지네이션)
   *      먼저 findById로 지갑 존재 + corporate 스코프를 검증한 뒤, 항목 목록을 반환합니다.
   *
   * [VI] Truy vấn danh sách FundingEntry (mục sổ cái) của ví cụ thể (phân trang)
   *      Trước tiên kiểm tra ví tồn tại + phạm vi corporate bằng findById, sau đó trả về danh sách mục.
   */
  async listFundingEntriesByWallet(
    ctx: MealCallerCtx,
    walletId: string,
    skip: number,
    take: number,
  ) {
    // [KO] 지갑 존재 + 스코프 검증 (findById 내부에서 assertCorporateScope 호출)
    // [VI] Kiểm tra ví tồn tại + phạm vi (findById gọi assertCorporateScope bên trong)
    await this.findById(ctx, walletId);
    const where = { walletId };
    const [data, totalCount] = await Promise.all([
      this.prisma.mealWalletFundingEntry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealWalletFundingEntry.count({ where }),
    ]);
    return { data, totalCount };
  }
}
