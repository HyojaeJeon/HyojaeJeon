/**
 * [KO] MealTransaction Service — 식권 결제 승인/취소의 핵심 비즈니스 로직
 *
 * 이 서비스는 직원의 식권(Meal Ticket) 결제를 실시간으로 승인(authorize)하거나
 * 취소/환불(reverse)하는 핵심 트랜잭션 처리를 담당한다.
 *
 * ── 결제 흐름 개요 ──
 * 1. POS 단말 또는 모바일 앱이 결제 요청(AuthorizeMealTransactionInput)을 보낸다
 * 2. authorize() 메서드가 scope 검증 → capability 체크 → 멱등성 확인 →
 *    지갑/가맹점 조회 → 정책 평가 → 잔액 차감 → 트랜잭션 생성 순으로 처리한다
 * 3. 어느 단계에서든 조건 불충족 시 DECLINED 트랜잭션을 기록하고 반환한다
 *
 * ── Open Loop vs Closed Loop ──
 * - Open Loop (OPEN_LOOP): 모바일 앱의 QR/바코드를 사용. 가맹점 제한 없이 넓은 범위에서 결제 가능.
 *   authMethod = APP_QR, DYNAMIC_BARCODE
 * - Closed Loop (CLOSED_LOOP): RFID 배지나 생체 인증을 사용. 계약된 특정 가맹점에서만 결제 가능.
 *   authMethod = RFID_BADGE, BIOMETRIC_FACE, BIOMETRIC_FINGERPRINT
 *
 * ── scope 검증 구조 ──
 * - caller context(MealCallerCtx)에는 userType, brandHqId, corporateId 등이 포함됨
 * - assertBrandScope: BRAND_ADMIN은 자기 brand만, SUPER_ADMIN/CORPORATE_ADMIN은 통과
 * - assertCorporateScope: CORPORATE_ADMIN은 자기 corporate만, SUPER_ADMIN은 통과
 * - 읽기(findById, listBy*)는 caller의 scope에 맞는 데이터만 반환
 * - 쓰기(authorize, reverse)는 brand 축 scope + capability + permission을 모두 검증
 *
 * [VI] MealTransaction Service — Logic nghiệp vụ cốt lõi phê duyệt/hủy thanh toán phiếu ăn
 *
 * Service này xử lý phê duyệt (authorize) hoặc hủy/hoàn (reverse) thanh toán
 * phiếu ăn (Meal Ticket) của nhân viên theo thời gian thực.
 *
 * ── Tổng quan luồng thanh toán ──
 * 1. POS hoặc ứng dụng di động gửi yêu cầu thanh toán (AuthorizeMealTransactionInput)
 * 2. Phương thức authorize() xử lý tuần tự: xác minh scope → kiểm tra capability →
 *    kiểm tra idempotency → truy vấn ví/cửa hàng → đánh giá chính sách →
 *    trừ số dư → tạo giao dịch
 * 3. Nếu bất kỳ bước nào không thỏa mãn, ghi nhận giao dịch DECLINED và trả về
 *
 * ── Open Loop vs Closed Loop ──
 * - Open Loop (OPEN_LOOP): dùng QR/mã vạch di động. Thanh toán tại nhiều cửa hàng.
 *   authMethod = APP_QR, DYNAMIC_BARCODE
 * - Closed Loop (CLOSED_LOOP): dùng thẻ RFID hoặc sinh trắc. Chỉ tại cửa hàng đã ký hợp đồng.
 *   authMethod = RFID_BADGE, BIOMETRIC_FACE, BIOMETRIC_FINGERPRINT
 *
 * ── Cấu trúc xác minh scope ──
 * - Caller context (MealCallerCtx) chứa userType, brandHqId, corporateId, v.v.
 * - assertBrandScope: BRAND_ADMIN chỉ truy cập brand mình, SUPER_ADMIN/CORPORATE_ADMIN được thông qua
 * - assertCorporateScope: CORPORATE_ADMIN chỉ truy cập corporate mình, SUPER_ADMIN được thông qua
 * - Đọc (findById, listBy*) chỉ trả dữ liệu thuộc scope của caller
 * - Ghi (authorize, reverse) xác minh scope brand + capability + permission
 */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  assertCorporateScope,
  withTargetBrand,
} from '../_internal/callerCtx';
import { MealPolicyService } from '../policy/Policy.service';
import { AuthorizeMealTransactionInput } from './dto/AuthorizeMealTransaction.input';
import { DomainError } from '@core/errors/DomainError';
import {
  allocateMealWalletSpend,
  normalizeMealWalletFundingState,
} from '../wallet/_internal/walletLedger';

/**
 * [KO] 식권 거래(MealTransaction) 서비스.
 *      결제 승인(authorize), 취소/환불(reverse), 조회(findById, listBy*)를 제공한다.
 *      모든 메서드는 MealCallerCtx를 받아 멀티테넌시 scope를 강제한다.
 * [VI] Service giao dịch phiếu ăn (MealTransaction).
 *      Cung cấp phê duyệt (authorize), hủy/hoàn (reverse), truy vấn (findById, listBy*).
 *      Mọi phương thức nhận MealCallerCtx để bắt buộc scope multi-tenancy.
 */
@Injectable()
export class MealTransactionService {
  private readonly logger = new Logger(MealTransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    /** [KO] 브랜드별 기능 활성화 여부(capability) 검증 서비스 / [VI] Service kiểm tra capability theo thương hiệu */
    private readonly entitlement: EntitlementService,
    /** [KO] RBAC 권한(permission) 검증 서비스 / [VI] Service kiểm tra quyền RBAC (permission) */
    private readonly permission: PermissionService,
    /** [KO] 식권 정책(시간대, 한도, 카테고리 등) 평가 서비스 / [VI] Service đánh giá chính sách phiếu ăn (khung giờ, hạn mức, danh mục) */
    private readonly policy: MealPolicyService,
  ) {}

  /**
   * [KO] 단건 거래 조회.
   *      CORPORATE_ADMIN은 자기 corporateId 거래만, BRAND_ADMIN은 자기 brandHqId 거래만,
   *      SUPER_ADMIN은 모든 거래를 조회할 수 있다.
   * [VI] Truy vấn một giao dịch.
   *      CORPORATE_ADMIN chỉ xem giao dịch của corporateId mình, BRAND_ADMIN chỉ xem brandHqId mình,
   *      SUPER_ADMIN xem được tất cả.
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const t = await this.prisma.mealTransaction.findUnique({ where: { id } });
    if (!t) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Transaction' }, details: { reason: 'Transaction not found' } });
    // [KO] 트랜잭션은 corporate ↔ brand 양쪽에 속한다.
    // CORPORATE_ADMIN 은 자기 corporate row 만, BRAND_ADMIN 은 자기 brand row 만.
    // [VI] Giao dịch thuộc cả hai trục corporate ↔ brand.
    // CORPORATE_ADMIN chỉ xem row corporate mình, BRAND_ADMIN chỉ xem row brand mình.
    if (ctx.userType === 'CORPORATE_ADMIN') assertCorporateScope(ctx, t.corporateId);
    else if (ctx.userType !== 'SUPER_ADMIN') assertBrandScope(ctx, t.brandHqId);
    return t;
  }

  /**
   * [KO] 기업(Corporate) 기준 거래 목록 조회 (페이지네이션).
   *      assertCorporateScope로 caller가 해당 corporateId에 접근할 수 있는지 검증한다.
   * [VI] Danh sách giao dịch theo Corporate (có phân trang).
   *      assertCorporateScope xác minh caller có quyền truy cập corporateId đó.
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
      this.prisma.mealTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealTransaction.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * [KO] 브랜드(BrandHQ) 기준 거래 목록 조회 (페이지네이션).
   *      assertBrandScope로 caller가 해당 brandHqId에 접근할 수 있는지 검증한다.
   * [VI] Danh sách giao dịch theo BrandHQ (có phân trang).
   *      assertBrandScope xác minh caller có quyền truy cập brandHqId đó.
   */
  async listByBrand(
    ctx: MealCallerCtx,
    brandHqId: string,
    skip: number,
    take: number,
    opts?: { status?: string; periodStart?: Date; periodEnd?: Date },
  ) {
    assertBrandScope(ctx, brandHqId);
    const where: Record<string, unknown> = { brandHqId };
    if (opts?.status) where.status = opts.status;
    if (opts?.periodStart || opts?.periodEnd) {
      const dateFilter: Record<string, Date> = {};
      if (opts.periodStart) dateFilter.gte = opts.periodStart;
      if (opts.periodEnd) dateFilter.lt = opts.periodEnd;
      where.createdAt = dateFilter;
    }
    const [rows, totalCount] = await Promise.all([
      this.prisma.mealTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealTransaction.count({ where }),
    ]);

    // walletId → employee → department 수동 조인 (MealTransaction에 relation 미정의)
    const walletIds = [...new Set(rows.map((r) => r.walletId))];
    const wallets = walletIds.length
      ? await this.prisma.mealWallet.findMany({
          where: { id: { in: walletIds } },
          select: {
            id: true,
            employee: {
              select: {
                fullName: true,
                department: { select: { departmentName: true } },
              },
            },
          },
        })
      : [];
    const walletMap = new Map(wallets.map((w) => [w.id, w.employee]));

    const data = rows.map((r) => {
      const emp = walletMap.get(r.walletId);
      return {
        ...r,
        employeeName: emp?.fullName ?? null,
        departmentName: emp?.department?.departmentName ?? null,
      };
    });
    return { data, totalCount };
  }

  /**
   * [KO] ★ 결제 승인 (authorize) — 식권 거래의 핵심 메서드 ★
   *
   * POS 단말 또는 모바일 앱이 결제 요청을 보내면 아래 7단계를 순서대로 수행한다.
   * 어느 단계에서든 조건 불충족 시 recordDecline()으로 DECLINED 거래를 기록하고 즉시 반환한다.
   *
   * ── 단계별 상세 설명 ──
   *
   * [1단계] Brand 축 scope 검증 + capability + permission 가드
   *   - assertBrandScope: caller가 해당 brandHqId에 접근 가능한지 확인
   *   - requireCapability('MEAL_TICKET'): 해당 브랜드가 식권 기능을 사용할 수 있는 라이선스가 있는지 확인
   *   - require('corporate.transaction.authorize'): caller에게 결제 승인 권한이 있는지 RBAC 검증
   *
   * [2단계] 멱등성(Idempotency) 검사
   *   - 동일한 idempotencyKey로 이미 처리된 거래가 있으면, 새로 생성하지 않고 기존 결과를 그대로 반환
   *   - 네트워크 재전송, POS 재시도 등으로 인한 중복 결제를 방지하는 핵심 안전장치
   *
   * [3단계+4단계] 지갑(Wallet) + 가맹점 등록(Enrollment) 병렬 조회
   *   - MealWallet: 해당 직원의 식권 지갑을 조회 → 없으면 RESOURCE_NOT_FOUND 예외
   *   - 지갑 상태(status) 검사: 'ACTIVE'가 아니면 → DECLINED(EMPLOYEE_INACTIVE)
   *   - MealMerchantEnrollment: 해당 브랜드가 식권 가맹점으로 등록/활성화되어 있는지 확인
   *     없거나 비활성이면 → DECLINED(MERCHANT_INACTIVE)
   *
   * [5단계] 정책(Policy) 평가
   *   - MealPolicyService.evaluateForEmployee()로 해당 직원에게 적용되는 정책을 평가
   *   - 5-a. 시간대/요일 검증: isTimeWindowValid가 false이면 → DECLINED(OUT_OF_POLICY_WINDOW)
   *     예: 점심시간(11:00~13:00)만 허용하는 정책에서 15:00에 결제 시도
   *   - 5-b. 건당 한도 검증: requestedAmountVnd > maxPerTransactionVnd이면 → DECLINED(OUT_OF_POLICY_WINDOW)
   *     예: 건당 100,000 VND 한도인데 150,000 VND 요청
   *   - 5-c. 가맹점 카테고리 검증: Branch의 branchType이 정책의 allowedMerchantCategoryIds에 없으면
   *     → DECLINED(MERCHANT_CATEGORY_RESTRICTED)
   *     예: '한식'만 허용하는 정책에서 '카페'에서 결제 시도
   *
   * [6단계] 일일 한도(Daily Limit) 검증
   *   - 오늘(UTC 00:00 기준) 해당 지갑의 승인된 거래 합산액을 집계
   *   - (기존 사용액 + 이번 요청액) > dailyLimitVnd이면 → DECLINED(DAILY_LIMIT_EXCEEDED)
   *
   * [7단계] 잔액 차감 + 승인 트랜잭션 생성 (단일 DB 트랜잭션)
   *   - Prisma $transaction 안에서 최신 지갑 잔액을 다시 조회 (동시성 보호)
   *   - allocateMealWalletSpend()로 회사 지원금 → 개인 충전금 순으로 차감 배분
   *     - 회사 지원금으로 충분하면: companyShareVnd = 전액, employeeShareVnd = 0
   *     - 부족하고 Split Payment 허용이면: 나머지를 개인 충전금에서 차감
   *     - 부족하고 Split Payment 비허용이면: → DECLINED(SPLIT_PAYMENT_DISABLED)
   *     - 전체 잔액 자체가 부족하면: → INSUFFICIENT_BALANCE 예외
   *   - 지갑 잔액 업데이트 (balanceVnd, companyAllowanceVnd, personalTopUpVnd)
   *   - MealTransaction 레코드 생성 (status = 'APPROVED', authorizedAt = now)
   *
   * [VI] ★ Phê duyệt thanh toán (authorize) — Phương thức cốt lõi ★
   *
   * Khi POS hoặc ứng dụng gửi yêu cầu thanh toán, thực hiện 7 bước tuần tự:
   *
   * [Bước 1] Xác minh scope Brand + capability + permission
   * [Bước 2] Kiểm tra idempotency — trả kết quả cũ nếu đã xử lý
   * [Bước 3+4] Truy vấn song song Wallet + Enrollment
   * [Bước 5] Đánh giá chính sách (khung giờ, hạn mức/lần, danh mục cửa hàng)
   * [Bước 6] Kiểm tra hạn mức trong ngày
   * [Bước 7] Trừ số dư + tạo giao dịch trong một DB transaction duy nhất
   *
   * @param ctx - caller context chứa thông tin xác thực và scope
   * @param input - dữ liệu yêu cầu thanh toán (walletId, brandHqId, branchId, số tiền, v.v.)
   * @returns giao dịch đã tạo (APPROVED hoặc DECLINED)
   */
  async authorize(
    ctx: MealCallerCtx,
    input: AuthorizeMealTransactionInput,
  ) {
    // ──────────────────────────────────────────────────────
    // [1단계] Brand 축 capability + permission 가드
    // [Bước 1] Guard capability + permission trục Brand
    // ──────────────────────────────────────────────────────
    // [KO] caller가 input.brandHqId에 접근 가능한지 scope 검증.
    //      BRAND_ADMIN은 자기 brand만, SUPER_ADMIN/CORPORATE_ADMIN은 통과.
    // [VI] Xác minh caller có quyền truy cập input.brandHqId.
    //      BRAND_ADMIN chỉ brand mình, SUPER_ADMIN/CORPORATE_ADMIN thông qua.
    assertBrandScope(ctx, input.brandHqId);
    // [KO] caller context에 target brandHqId를 주입하여 이후 검증에서 사용
    // [VI] Gắn target brandHqId vào caller context để dùng trong các bước tiếp
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    // [KO] 해당 브랜드가 'MEAL_TICKET' 기능(capability)을 사용할 수 있는 라이선스가 있는지 확인
    // [VI] Kiểm tra thương hiệu có giấy phép sử dụng capability 'MEAL_TICKET' không
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    // [KO] RBAC: caller에게 'corporate.transaction.authorize' 권한이 있는지 검증
    // [VI] RBAC: Xác minh caller có quyền 'corporate.transaction.authorize'
    await this.permission.require(brandCtx, 'corporate.transaction.authorize');

    // ──────────────────────────────────────────────────────
    // [2단계] 멱등성(Idempotency) 검사
    // [Bước 2] Kiểm tra idempotency
    // ──────────────────────────────────────────────────────
    // [KO] 동일한 idempotencyKey로 이미 처리된 거래가 있으면 기존 결과를 그대로 반환.
    //      네트워크 재전송이나 POS 재시도로 인한 중복 결제를 방지한다.
    // [VI] Nếu đã có giao dịch với cùng idempotencyKey thì trả kết quả cũ.
    //      Ngăn thanh toán trùng lặp do mạng gửi lại hoặc POS thử lại.
    const existing = await this.prisma.mealTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    // ──────────────────────────────────────────────────────
    // [3단계+4단계] Wallet + Enrollment 병렬 조회
    // [Bước 3+4] Truy vấn song song Wallet + Enrollment
    // ──────────────────────────────────────────────────────
    // [KO] 두 독립 쿼리를 Promise.all로 병렬 실행하여 DB 왕복을 줄인다.
    //      - MealWallet: 직원의 식권 지갑 (잔액, 상태 포함)
    //      - MealMerchantEnrollment: 해당 브랜드가 식권 가맹점으로 활성화되어 있는지
    // [VI] Chạy song song hai query độc lập bằng Promise.all để giảm round-trip DB.
    //      - MealWallet: ví phiếu ăn nhân viên (gồm số dư, trạng thái)
    //      - MealMerchantEnrollment: thương hiệu đã đăng ký/kích hoạt cửa hàng chưa
    const [wallet, enrollment] = await Promise.all([
      this.prisma.mealWallet.findUnique({ where: { id: input.walletId } }),
      this.prisma.mealMerchantEnrollment.findUnique({ where: { brandHqId: input.brandHqId } }),
    ]);
    // [KO] 지갑이 존재하지 않으면 RESOURCE_NOT_FOUND 예외
    // [VI] Nếu ví không tồn tại thì ném ngoại lệ RESOURCE_NOT_FOUND
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    // [KO] 지갑 상태가 ACTIVE가 아닌 경우 (퇴사, 정지 등) → DECLINED(EMPLOYEE_INACTIVE)
    // [VI] Nếu ví không ở trạng thái ACTIVE (nghỉ việc, khóa) → DECLINED(EMPLOYEE_INACTIVE)
    if (wallet.status !== 'ACTIVE') {
      return this.recordDecline(input, wallet.corporateId, 'EMPLOYEE_INACTIVE');
    }

    // [KO] 가맹점 등록이 없거나 비활성인 경우 → DECLINED(MERCHANT_INACTIVE)
    // [VI] Nếu cửa hàng chưa đăng ký hoặc không hoạt động → DECLINED(MERCHANT_INACTIVE)
    if (!enrollment || !enrollment.isActive) {
      return this.recordDecline(input, wallet.corporateId, 'MERCHANT_INACTIVE');
    }

    // ──────────────────────────────────────────────────────
    // [5단계] 정책(Policy) 평가
    // [Bước 5] Đánh giá chính sách (Policy)
    // ──────────────────────────────────────────────────────
    // [KO] 해당 직원에게 적용되는 식권 정책을 현재 시각 기준으로 평가한다.
    //      정책이 없으면(null) 모든 검증을 건너뛴다(제한 없음).
    // [VI] Đánh giá chính sách phiếu ăn áp dụng cho nhân viên tại thời điểm hiện tại.
    //      Nếu không có chính sách (null) thì bỏ qua mọi kiểm tra (không giới hạn).
    const evaluated = await this.policy.evaluateForEmployee(
      wallet.employeeId,
      new Date(),
    );

    // ── [5-a] 시간대/요일 검증 ──
    // [KO] 현재 시각이 정책에서 허용하는 시간대/요일 범위 안에 있는지 확인.
    //      예: 점심(11:00~13:00), 평일만 허용하는 정책에서 주말이나 15:00에 결제하면 거절.
    // [VI] Kiểm tra thời điểm hiện tại nằm trong khung giờ/ngày cho phép.
    //      Ví dụ: chính sách chỉ cho phép trưa (11:00~13:00) ngày thường.
    if (evaluated && !evaluated.isTimeWindowValid) {
      return this.recordDecline(input, wallet.corporateId, 'OUT_OF_POLICY_WINDOW');
    }

    // ── [5-b] 건당 한도 검증 ──
    // [KO] 이번 요청 금액이 정책의 건당 최대 한도(maxPerTransactionVnd)를 초과하는지 확인.
    //      maxPerTransactionVnd가 0이면 건당 한도를 적용하지 않는다는 뜻.
    // [VI] Kiểm tra số tiền yêu cầu có vượt hạn mức tối đa mỗi lần (maxPerTransactionVnd).
    //      maxPerTransactionVnd = 0 nghĩa là không áp dụng hạn mức mỗi lần.
    if (
      evaluated &&
      evaluated.maxPerTransactionVnd > 0n &&
      input.requestedAmountVnd > evaluated.maxPerTransactionVnd
    ) {
      return this.recordDecline(input, wallet.corporateId, 'OUT_OF_POLICY_WINDOW');
    }

    // ── [5-c] 가맹점 카테고리 검증 ──
    // [KO] 정책에 허용 업종 목록(allowedMerchantCategoryIds)이 설정되어 있으면,
    //      결제 대상 Branch의 branchType이 그 목록에 포함되는지 확인.
    //      예: '한식', '중식'만 허용하는 정책에서 '카페' 업종 Branch에서 결제하면 거절.
    // [VI] Nếu chính sách có danh sách ngành hàng cho phép (allowedMerchantCategoryIds),
    //      kiểm tra branchType của Branch có nằm trong danh sách không.
    //      Ví dụ: chỉ cho phép 'cơm Hàn', 'cơm Trung' nhưng thanh toán tại 'quán cà phê'.
    if (evaluated && evaluated.allowedMerchantCategoryIds.length > 0) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: input.branchId },
        select: { branchType: true },
      });
      const branchType = branch?.branchType ?? null;
      if (
        branchType &&
        !evaluated.allowedMerchantCategoryIds.includes(branchType)
      ) {
        return this.recordDecline(input, wallet.corporateId, 'MERCHANT_CATEGORY_RESTRICTED');
      }
    }

    // ──────────────────────────────────────────────────────
    // [6단계] 일일 한도(Daily Limit) 검증
    // [Bước 6] Kiểm tra hạn mức trong ngày (Daily Limit)
    // ──────────────────────────────────────────────────────
    // [KO] 오늘(UTC 00:00~) 해당 지갑에서 APPROVED 또는 SETTLED 상태인 거래의
    //      approvedAmountVnd 합산액 + 이번 요청액이 일일 한도를 초과하는지 확인.
    //      dailyLimitVnd가 0이면 일일 한도를 적용하지 않는다는 뜻.
    // [VI] Tính tổng approvedAmountVnd các giao dịch APPROVED/SETTLED của ví hôm nay (UTC 00:00~).
    //      Nếu (tổng đã dùng + yêu cầu lần này) > dailyLimitVnd thì từ chối.
    //      dailyLimitVnd = 0 nghĩa là không áp dụng hạn mức ngày.
    if (evaluated && evaluated.dailyLimitVnd > 0n) {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const agg = await this.prisma.mealTransaction.aggregate({
        where: {
          walletId: wallet.id,
          status: { in: ['APPROVED', 'SETTLED'] },
          createdAt: { gte: todayStart },
        },
        _sum: { approvedAmountVnd: true },
      });
      const used = (agg._sum.approvedAmountVnd ?? 0n) as bigint;
      if (used + input.requestedAmountVnd > evaluated.dailyLimitVnd) {
        return this.recordDecline(
          input,
          wallet.corporateId,
          'DAILY_LIMIT_EXCEEDED',
        );
      }
    }

    // ──────────────────────────────────────────────────────
    // [7단계] 잔액 차감 + 승인 트랜잭션 생성 (단일 DB 트랜잭션)
    // [Bước 7] Trừ số dư + tạo giao dịch (trong một DB transaction duy nhất)
    // ──────────────────────────────────────────────────────
    // [KO] Prisma $transaction으로 감싼 이유:
    //      - 잔액 차감과 거래 생성이 원자적(atomic)으로 이루어져야 한다.
    //      - 동시에 여러 결제 요청이 들어와도 한 번에 하나만 잔액을 변경할 수 있다.
    //      - 중간에 실패하면 두 작업 모두 롤백된다.
    // [VI] Dùng Prisma $transaction vì:
    //      - Trừ số dư và tạo giao dịch phải diễn ra nguyên tử (atomic).
    //      - Khi nhiều yêu cầu đồng thời, chỉ một lần thay đổi số dư được thực hiện.
    //      - Nếu thất bại giữa chừng, cả hai thao tác đều rollback.
    return this.prisma.$transaction(async (tx) => {
      // [KO] 트랜잭션 내부에서 지갑을 다시 조회하여 최신 잔액을 확보 (동시성 보호).
      //      앞서 조회한 wallet은 트랜잭션 바깥이므로 다른 요청에 의해 이미 변경되었을 수 있다.
      // [VI] Truy vấn lại ví trong transaction để lấy số dư mới nhất (bảo vệ đồng thời).
      //      Wallet truy vấn trước đó nằm ngoài transaction, có thể đã bị thay đổi.
      const fresh = await tx.mealWallet.findUnique({
        where: { id: wallet.id },
      });
      if (!fresh) {
        throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
      }
      // [KO] 레거시 지갑 데이터 정규화: bucket 필드(companyAllowanceVnd, personalTopUpVnd)가
      //      비어 있는 경우 balanceVnd 전체를 회사 지원금으로 간주하는 호환 로직.
      // [VI] Chuẩn hóa dữ liệu ví legacy: nếu trường bucket trống thì coi toàn bộ
      //      balanceVnd là trợ cấp công ty (logic tương thích ngược).
      const fundingState = normalizeMealWalletFundingState(fresh);

      // [KO] allocateMealWalletSpend: 요청 금액을 회사 지원금 → 개인 충전금 순으로 배분.
      //      - 회사 지원금으로 충분: companyShareVnd = 전액, employeeShareVnd = 0
      //      - 회사 지원금 부족 + Split Payment 허용: 나머지를 개인 충전금에서 차감
      //      - 회사 지원금 부족 + Split Payment 비허용: null 반환
      //      - 전체 잔액 부족: null 반환
      // [VI] allocateMealWalletSpend: phân bổ số tiền theo thứ tự trợ cấp công ty → nạp cá nhân.
      //      - Trợ cấp đủ: companyShareVnd = toàn bộ, employeeShareVnd = 0
      //      - Trợ cấp thiếu + Split Payment được phép: phần còn lại trừ từ nạp cá nhân
      //      - Trợ cấp thiếu + Split Payment bị tắt: trả null
      //      - Tổng số dư không đủ: trả null
      const allocation = allocateMealWalletSpend(
        fresh,
        input.requestedAmountVnd,
        Boolean(evaluated?.allowSplitPayment),
      );

      if (!allocation) {
        // [KO] allocation이 null인 경우 세부 원인을 구분하여 처리:
        //      - Split Payment가 비허용이고, 회사 지원금만으로 부족하지만 전체 잔액은 충분한 경우
        //        → DECLINED(SPLIT_PAYMENT_DISABLED): "회사 돈만으로 안 되고 개인 돈을 쓸 수도 없다"
        //      - 그 외(전체 잔액 자체가 부족) → INSUFFICIENT_BALANCE 예외
        // [VI] Khi allocation = null, phân biệt nguyên nhân chi tiết:
        //      - Split Payment bị tắt, trợ cấp không đủ nhưng tổng số dư đủ
        //        → DECLINED(SPLIT_PAYMENT_DISABLED)
        //      - Trường hợp khác (tổng số dư không đủ) → ngoại lệ INSUFFICIENT_BALANCE
        if (
          evaluated &&
          !evaluated.allowSplitPayment &&
          input.requestedAmountVnd > fundingState.companyAllowanceVnd &&
          input.requestedAmountVnd <= fundingState.balanceVnd
        ) {
          return this.recordDecline(input, wallet.corporateId, 'SPLIT_PAYMENT_DISABLED');
        }
        throw new DomainError({ code: 'INSUFFICIENT_BALANCE', params: { available: fundingState.balanceVnd.toString(),
          requested: input.requestedAmountVnd.toString() } });
      }
      // [KO] 지갑 잔액 업데이트: 차감된 금액을 반영한다.
      // [VI] Cập nhật số dư ví: phản ánh số tiền đã trừ.
      await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: allocation.balanceVnd,
          companyAllowanceVnd: allocation.companyAllowanceVnd,
          personalTopUpVnd: allocation.personalTopUpVnd,
        },
      });
      // [KO] 승인된 거래 레코드를 생성한다. status = 'APPROVED', authorizedAt = 현재 시각.
      // [VI] Tạo bản ghi giao dịch đã duyệt. status = 'APPROVED', authorizedAt = thời điểm hiện tại.
      return tx.mealTransaction.create({
        data: {
          walletId: wallet.id,
          corporateId: wallet.corporateId,
          brandHqId: input.brandHqId,
          branchId: input.branchId,
          terminalId: input.terminalId ?? null,
          loopType: input.loopType,
          authMethod: input.authMethod,
          requestedAmountVnd: input.requestedAmountVnd,
          approvedAmountVnd: input.requestedAmountVnd,
          companyShareVnd: allocation.companyShareVnd,
          employeeShareVnd: allocation.employeeShareVnd,
          status: 'APPROVED',
          idempotencyKey: input.idempotencyKey,
          authorizedAt: new Date(),
        },
      });
    });
  }

  /**
   * [KO] 거절(DECLINED) 거래 기록 헬퍼.
   *      정책 위반, 비활성 상태 등으로 결제가 거절될 때 호출된다.
   *      approvedAmountVnd = 0, employeeShareVnd = 0으로 기록하며,
   *      지갑 잔액은 차감하지 않는다.
   *      declineReason에 거절 사유를 기록한다.
   *
   * [VI] Helper ghi nhận giao dịch bị từ chối (DECLINED).
   *      Được gọi khi vi phạm chính sách, trạng thái không hoạt động, v.v.
   *      Ghi approvedAmountVnd = 0, employeeShareVnd = 0.
   *      Không trừ số dư ví.
   *      Ghi lý do từ chối vào declineReason.
   *
   * @param input  - 원래 결제 요청 데이터 / dữ liệu yêu cầu thanh toán gốc
   * @param corporateId - 해당 직원이 속한 기업 ID / ID doanh nghiệp của nhân viên
   * @param reason - 거절 사유 코드 / mã lý do từ chối
   */
  private async recordDecline(
    input: AuthorizeMealTransactionInput,
    corporateId: string,
    reason: string,
  ) {
    return this.prisma.mealTransaction.create({
      data: {
        walletId: input.walletId,
        corporateId,
        brandHqId: input.brandHqId,
        branchId: input.branchId,
        terminalId: input.terminalId ?? null,
        loopType: input.loopType,
        authMethod: input.authMethod,
        requestedAmountVnd: input.requestedAmountVnd,
        approvedAmountVnd: 0n,
        employeeShareVnd: 0n,
        status: 'DECLINED',
        declineReason: reason,
        idempotencyKey: input.idempotencyKey,
      },
    });
  }

  /**
   * [KO] ★ 거래 취소/환불 (reverse) ★
   *
   * 이미 승인(APPROVED)된 거래를 취소하고, 차감된 잔액을 복원하는 메서드이다.
   *
   * ── 취소/환불 흐름 ──
   *
   * [1] 거래 조회: transactionId로 기존 거래를 조회한다. 없으면 RESOURCE_NOT_FOUND.
   *
   * [2] scope + capability + permission 검증:
   *     - assertBrandScope: caller가 해당 brand에 접근 가능한지 확인
   *     - requireCapability('MEAL_TICKET'): 식권 기능 라이선스 확인
   *     - require('corporate.transaction.reverse'): 취소 권한 RBAC 검증
   *
   * [3] 상태 검증: status가 'APPROVED'인 거래만 취소 가능.
   *     DECLINED/SETTLED/REVERSED 상태에서는 CANNOT_REVERSE 예외.
   *     - DECLINED: 애초에 승인되지 않았으므로 취소할 것이 없음
   *     - SETTLED: 이미 정산되었으므로 별도 정산 취소 프로세스 필요
   *     - REVERSED: 이미 취소됨 (중복 취소 방지)
   *
   * [4] 단일 DB 트랜잭션 내에서:
   *     - 지갑 잔액 복원: companyShareVnd → companyAllowanceVnd 복원,
   *       employeeShareVnd → personalTopUpVnd 복원, 총액 → balanceVnd 복원
   *     - 거래 상태를 'REVERSED'로 변경
   *
   * ── 참고: 왜 increment를 사용하는가? ──
   * authorize()에서는 allocateMealWalletSpend()로 절대값을 설정했지만,
   * reverse()에서는 Prisma의 increment 연산을 사용한다.
   * 이유: 취소 시점에 다른 거래가 이미 지갑 잔액을 변경했을 수 있으므로,
   * 절대값이 아닌 상대적 증가(increment)로 안전하게 복원해야 한다.
   *
   * [VI] ★ Hủy/hoàn giao dịch (reverse) ★
   *
   * Hủy giao dịch đã duyệt (APPROVED) và khôi phục số dư đã trừ.
   *
   * ── Luồng hủy/hoàn ──
   *
   * [1] Truy vấn giao dịch theo transactionId. Không tìm thấy → RESOURCE_NOT_FOUND.
   * [2] Xác minh scope + capability + permission.
   * [3] Kiểm tra trạng thái: chỉ APPROVED mới được hủy.
   *     DECLINED/SETTLED/REVERSED → ngoại lệ CANNOT_REVERSE.
   * [4] Trong một DB transaction:
   *     - Khôi phục số dư ví (increment companyAllowanceVnd, personalTopUpVnd, balanceVnd)
   *     - Đổi trạng thái giao dịch thành 'REVERSED'
   *
   * @param ctx - caller context / ngữ cảnh caller
   * @param transactionId - 취소할 거래 ID / ID giao dịch cần hủy
   */
  async reverse(ctx: MealCallerCtx, transactionId: string) {
    // [KO] 1. 기존 거래 조회
    // [VI] 1. Truy vấn giao dịch hiện có
    const t = await this.prisma.mealTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!t) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Transaction' }, details: { reason: 'Transaction not found' } });
    // [KO] 2. brand 축 scope + capability + permission 검증
    // [VI] 2. Xác minh scope trục brand + capability + permission
    assertBrandScope(ctx, t.brandHqId);
    const brandCtx = withTargetBrand(ctx, t.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.transaction.reverse');

    // [KO] 3. APPROVED 상태가 아니면 취소 불가. DECLINED/SETTLED/REVERSED는 거절.
    // [VI] 3. Chỉ hủy được khi status = APPROVED. DECLINED/SETTLED/REVERSED bị từ chối.
    if (t.status !== 'APPROVED') {
      throw new DomainError({ code: 'CANNOT_REVERSE', params: { currentStatus: t.status } });
    }
    // [KO] 4. 단일 DB 트랜잭션: 지갑 잔액 복원 + 거래 상태 REVERSED
    // [VI] 4. Một DB transaction: khôi phục số dư ví + đổi trạng thái REVERSED
    return this.prisma.$transaction(async (db) => {
      // [KO] 지갑 잔액 복원: 회사 부담분(companyShareVnd)은 companyAllowanceVnd로,
      //      직원 부담분(employeeShareVnd)은 personalTopUpVnd로, 전체는 balanceVnd로 복원.
      //      increment를 사용하여 동시 접근 안전성을 확보한다.
      // [VI] Khôi phục số dư: phần công ty (companyShareVnd) → companyAllowanceVnd,
      //      phần nhân viên (employeeShareVnd) → personalTopUpVnd, tổng → balanceVnd.
      //      Dùng increment để đảm bảo an toàn đồng thời.
      await db.mealWallet.update({
        where: { id: t.walletId },
        data: {
          balanceVnd: { increment: t.approvedAmountVnd },
          companyAllowanceVnd: { increment: t.companyShareVnd },
          personalTopUpVnd: { increment: t.employeeShareVnd },
        },
      });
      // [KO] 거래 상태를 REVERSED로 변경
      // [VI] Đổi trạng thái giao dịch thành REVERSED
      return db.mealTransaction.update({
        where: { id: t.id },
        data: { status: 'REVERSED' },
      });
    });
  }
}
