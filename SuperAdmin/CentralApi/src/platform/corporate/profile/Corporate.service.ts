/**
 * [KO] MealCorporate 서비스
 *      식권(Meal Voucher) 고객 기업(Corporate) / 부서(Department) / 임직원(Employee)에 대한
 *      CRUD 비즈니스 로직을 담당한다.
 *
 *      보안 원칙:
 *      - PLATFORM_SUPER_ADMIN만 기업 자체의 create/update/delete 가능.
 *      - CORPORATE_ADMIN은 자기 소속 기업 내부의 department/employee만 R/W 가능.
 *      - 모든 read/write 메서드에서 MealCallerCtx의 corporateContext와 대상 row의
 *        corporateId를 강제 일치 검증한다 (assertCorporateScope).
 *
 *      추가 기능:
 *      - 청구서 스케줄(Invoice Schedule) 설정 업데이트.
 *      - 자동 청구서 발행 대상 기업 조회 (listCorporatesForInvoiceGeneration).
 *
 * [VI] Service MealCorporate
 *      Xử lý logic nghiệp vụ CRUD cho doanh nghiệp khách hàng (Corporate) / phòng ban (Department) /
 *      nhân viên (Employee) của dịch vụ phiếu ăn.
 *
 *      Nguyên tắc bảo mật:
 *      - Chỉ PLATFORM_SUPER_ADMIN mới được tạo/sửa/xóa doanh nghiệp.
 *      - CORPORATE_ADMIN chỉ được R/W phòng ban/nhân viên trong doanh nghiệp mình.
 *      - Mọi phương thức read/write đều bắt buộc xác minh corporateContext của MealCallerCtx
 *        khớp với corporateId của bản ghi đích (assertCorporateScope).
 *
 *      Chức năng bổ sung:
 *      - Cập nhật thiết lập lịch hóa đơn (Invoice Schedule).
 *      - Truy vấn doanh nghiệp cần phát hành hóa đơn tự động (listCorporatesForInvoiceGeneration).
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@core/prisma/Prisma.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/callerCtx';
import { CreateMealCorporateInput } from './dto/CreateMealCorporate.input';
import { CreateMealDepartmentInput } from './dto/CreateMealDepartment.input';
import { CreateMealEmployeeInput } from './dto/CreateMealEmployee.input';
import { UpdateMealCorporateInput } from './dto/UpdateMealCorporate.input';
import { DomainError } from '@core/errors/DomainError';

@Injectable()
export class MealCorporateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
    private readonly jwtService: JwtService,
  ) {}

  // ───── Corporate

  /**
   * [KO] 기업 목록 조회 (페이지네이션)
   *      1. SUPER_ADMIN이면 삭제되지 않은 전체 기업 목록을 반환한다.
   *      2. CORPORATE_ADMIN이면 자신이 소속된 기업만 반환한다 (corporateId 기반 필터링).
   *      3. skip/take로 페이지네이션하며, 생성일 내림차순 정렬한다.
   *      4. data 배열과 totalCount를 함께 반환한다.
   *
   * [VI] Truy vấn danh sách doanh nghiệp (phân trang)
   *      1. Nếu SUPER_ADMIN thì trả về toàn bộ doanh nghiệp chưa bị xóa.
   *      2. Nếu CORPORATE_ADMIN thì chỉ trả về doanh nghiệp mà mình thuộc về (lọc theo corporateId).
   *      3. Phân trang bằng skip/take, sắp xếp theo ngày tạo giảm dần.
   *      4. Trả về cả mảng data và totalCount.
   */
  async list(ctx: MealCallerCtx, skip: number, take: number) {
    // CORPORATE_ADMIN 은 자기 corporate 만 보이도록 강제. SUPER_ADMIN 은 전체.
    const where =
      ctx.userType === 'SUPER_ADMIN'
        ? { deletedAt: null }
        : { id: ctx.corporateId ?? '__none__', deletedAt: null };
    const [data, totalCount] = await Promise.all([
      this.prisma.mealCorporate.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.mealCorporate.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * [KO] 기업 단건 조회 (ID 기반)
   *      1. ID로 삭제되지 않은 기업을 조회한다.
   *      2. 존재하지 않으면 RESOURCE_NOT_FOUND 에러를 던진다.
   *      3. assertCorporateScope로 호출자가 해당 기업에 접근 권한이 있는지 검증한다.
   *
   * [VI] Truy vấn chi tiết doanh nghiệp (theo ID)
   *      1. Tra cứu doanh nghiệp chưa bị xóa theo ID.
   *      2. Nếu không tồn tại thì ném lỗi RESOURCE_NOT_FOUND.
   *      3. Xác minh người gọi có quyền truy cập doanh nghiệp này qua assertCorporateScope.
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const c = await this.prisma.mealCorporate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!c) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });
    assertCorporateScope(ctx, c.id);
    return c;
  }

  /**
   * [KO] 기업 생성 (SUPER_ADMIN 전용)
   *      1. 'corporate.profile.write' 권한을 검증한다.
   *      2. 호출자가 SUPER_ADMIN이 아니면 CORPORATE_CREATE_PLATFORM_ONLY 에러를 던진다.
   *      3. 입력 데이터로 새 기업 레코드를 생성하여 반환한다.
   *
   * [VI] Tạo doanh nghiệp (chỉ SUPER_ADMIN)
   *      1. Xác minh quyền 'corporate.profile.write'.
   *      2. Nếu người gọi không phải SUPER_ADMIN thì ném lỗi CORPORATE_CREATE_PLATFORM_ONLY.
   *      3. Tạo bản ghi doanh nghiệp mới từ dữ liệu đầu vào và trả về.
   */
  async create(ctx: MealCallerCtx, input: CreateMealCorporateInput) {
    // corporate 자체 생성은 platform-level — SUPER_ADMIN 권한만 가능.
    await this.permission.require(ctx, 'corporate.profile.write');
    if (ctx.userType !== 'SUPER_ADMIN') {
      throw new DomainError({ code: 'CORPORATE_CREATE_PLATFORM_ONLY', params: { userType: ctx.userType } });
    }
    return this.prisma.mealCorporate.create({
      data: {
        tenantCode: input.tenantCode,
        companyName: input.companyName,
        taxCode: input.taxCode,
        fundingModel: input.fundingModel,
        monthlyBudgetVnd: input.monthlyBudgetVnd,
        creditLimitVnd: input.creditLimitVnd,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      },
    });
  }

  /**
   * [KO] 기업 정보 수정
   *      1. ID로 기존 기업을 조회한다 (없으면 RESOURCE_NOT_FOUND).
   *      2. assertCorporateScope로 접근 권한을 검증한다.
   *      3. 'corporate.profile.write' 권한을 검증한다 (대상 기업 컨텍스트 포함).
   *      4. 입력된 필드만 업데이트하고, null/undefined인 필드는 변경하지 않는다 (Partial Update).
   *
   * [VI] Cập nhật thông tin doanh nghiệp
   *      1. Tra cứu doanh nghiệp hiện tại theo ID (nếu không tồn tại thì RESOURCE_NOT_FOUND).
   *      2. Xác minh quyền truy cập qua assertCorporateScope.
   *      3. Xác minh quyền 'corporate.profile.write' (bao gồm ngữ cảnh doanh nghiệp đích).
   *      4. Chỉ cập nhật các trường được gửi, bỏ qua trường null/undefined (Partial Update).
   */
  async update(ctx: MealCallerCtx, id: string, input: UpdateMealCorporateInput) {
    const before = await this.prisma.mealCorporate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });
    assertCorporateScope(ctx, before.id);
    await this.permission.require(withTargetCorporate(ctx, before.id), 'corporate.profile.write');

    return this.prisma.mealCorporate.update({
      where: { id },
      data: {
        companyName: input.companyName ?? undefined,
        taxCode: input.taxCode ?? undefined,
        fundingModel: input.fundingModel ?? undefined,
        monthlyBudgetVnd: input.monthlyBudgetVnd ?? undefined,
        creditLimitVnd: input.creditLimitVnd ?? undefined,
        status: input.status ?? undefined,
      },
    });
  }

  /**
   * [KO] 기업 소프트 삭제
   *      1. ID로 기존 기업을 조회한다 (없으면 RESOURCE_NOT_FOUND).
   *      2. assertCorporateScope로 접근 권한을 검증한다.
   *      3. 'corporate.profile.write' 권한을 검증한다.
   *      4. 물리적 삭제 대신 deletedAt에 현재 시각, status를 'DELETED'로 설정한다 (소프트 삭제).
   *      5. 성공 시 true를 반환한다.
   *
   * [VI] Xóa mềm doanh nghiệp
   *      1. Tra cứu doanh nghiệp hiện tại theo ID (nếu không tồn tại thì RESOURCE_NOT_FOUND).
   *      2. Xác minh quyền truy cập qua assertCorporateScope.
   *      3. Xác minh quyền 'corporate.profile.write'.
   *      4. Thay vì xóa vật lý, đặt deletedAt = thời điểm hiện tại và status = 'DELETED' (xóa mềm).
   *      5. Trả về true nếu thành công.
   */
  async softDelete(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealCorporate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });
    assertCorporateScope(ctx, before.id);
    await this.permission.require(withTargetCorporate(ctx, before.id), 'corporate.profile.write');

    await this.prisma.mealCorporate.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
    return true;
  }

  // ───── Department

  /**
   * [KO] 부서 목록 조회 (기업 ID 기반)
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. 해당 기업의 삭제되지 않은 부서 목록을 부서코드 오름차순으로 조회한다.
   *      3. parentDepartmentId가 있는 부서에 대해 상위 부서명(parentDepartmentName)을 매핑한다.
   *      4. 각 부서별 소속 임직원 수(employeeCount)를 집계하여 함께 반환한다.
   *
   * [VI] Truy vấn danh sách phòng ban (theo ID doanh nghiệp)
   *      1. Xác minh quyền truy cập doanh nghiệp của người gọi qua assertCorporateScope.
   *      2. Tra cứu danh sách phòng ban chưa bị xóa, sắp xếp theo mã phòng ban tăng dần.
   *      3. Ánh xạ tên phòng ban cha (parentDepartmentName) cho phòng ban có parentDepartmentId.
   *      4. Tổng hợp số lượng nhân viên (employeeCount) cho mỗi phòng ban và trả về cùng.
   */
  async listDepartments(ctx: MealCallerCtx, corporateId: string) {
    assertCorporateScope(ctx, corporateId);
    const depts = await this.prisma.mealCorporateDepartment.findMany({
      where: { corporateId, deletedAt: null },
      orderBy: { departmentCode: 'asc' },
    });

    // parentDepartmentId → parentDepartmentName 매핑
    const deptMap = new Map(depts.map((d) => [d.id, d.departmentName]));

    // departmentId 별 임직원 수 집계
    const empCounts = await this.prisma.mealEmployee.groupBy({
      by: ['departmentId'],
      where: { corporateId, deletedAt: null },
      _count: { id: true },
    });
    const countMap = new Map(empCounts.map((e) => [e.departmentId, e._count.id]));

    return depts.map((d) => ({
      ...d,
      parentDepartmentName: d.parentDepartmentId ? (deptMap.get(d.parentDepartmentId) ?? null) : null,
      employeeCount: countMap.get(d.id) ?? 0,
    }));
  }

  /**
   * [KO] 부서 단건 조회 (ID 기반)
   *      1. ID로 삭제되지 않은 부서를 조회한다 (없으면 RESOURCE_NOT_FOUND).
   *      2. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      3. 해당 부서의 소속 임직원 수를 집계한다.
   *      4. 상위 부서명(parentDepartmentName)을 조회하여 함께 반환한다.
   *
   * [VI] Truy vấn chi tiết phòng ban (theo ID)
   *      1. Tra cứu phòng ban chưa bị xóa theo ID (nếu không tồn tại thì RESOURCE_NOT_FOUND).
   *      2. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      3. Tổng hợp số nhân viên thuộc phòng ban.
   *      4. Tra cứu tên phòng ban cha (parentDepartmentName) và trả về cùng.
   */
  async findDepartment(ctx: MealCallerCtx, id: string) {
    const dept = await this.prisma.mealCorporateDepartment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!dept) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Department' } });
    assertCorporateScope(ctx, dept.corporateId);

    const empCount = await this.prisma.mealEmployee.count({
      where: { departmentId: id, deletedAt: null },
    });

    // parent name
    let parentDepartmentName: string | null = null;
    if (dept.parentDepartmentId) {
      const parent = await this.prisma.mealCorporateDepartment.findFirst({
        where: { id: dept.parentDepartmentId },
        select: { departmentName: true },
      });
      parentDepartmentName = parent?.departmentName ?? null;
    }

    return { ...dept, parentDepartmentName, employeeCount: empCount };
  }

  /**
   * [KO] 부서 생성
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. 'corporate.department.write' 권한을 검증한다 (대상 기업 컨텍스트 포함).
   *      3. 입력 데이터로 새 부서 레코드를 생성하여 반환한다.
   *         parentDepartmentId가 없으면 null로 저장 (최상위 부서).
   *
   * [VI] Tạo phòng ban
   *      1. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      2. Xác minh quyền 'corporate.department.write' (bao gồm ngữ cảnh doanh nghiệp đích).
   *      3. Tạo bản ghi phòng ban mới từ dữ liệu đầu vào và trả về.
   *         Nếu không có parentDepartmentId thì lưu null (phòng ban cấp cao nhất).
   */
  async createDepartment(ctx: MealCallerCtx, input: CreateMealDepartmentInput) {
    assertCorporateScope(ctx, input.corporateId);
    await this.permission.require(
      withTargetCorporate(ctx, input.corporateId),
      'corporate.department.write',
    );
    return this.prisma.mealCorporateDepartment.create({
      data: {
        corporateId: input.corporateId,
        departmentCode: input.departmentCode,
        departmentName: input.departmentName,
        parentDepartmentId: input.parentDepartmentId ?? null,
      },
    });
  }

  // ───── Employee

  /**
   * [KO] 임직원 단건 조회 (ID 기반)
   *      1. ID로 삭제되지 않은 임직원을 조회한다 (없으면 RESOURCE_NOT_FOUND).
   *      2. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *
   * [VI] Truy vấn chi tiết nhân viên (theo ID)
   *      1. Tra cứu nhân viên chưa bị xóa theo ID (nếu không tồn tại thì RESOURCE_NOT_FOUND).
   *      2. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   */
  async findEmployee(ctx: MealCallerCtx, id: string) {
    const emp = await this.prisma.mealEmployee.findFirst({
      where: { id, deletedAt: null },
    });
    if (!emp) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'MealEmployee' } });
    assertCorporateScope(ctx, emp.corporateId);
    return emp;
  }

  /**
   * [KO] 임직원 목록 조회 (기업 ID 기반, 페이지네이션)
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. 해당 기업의 삭제되지 않은 임직원 목록을 생성일 내림차순으로 반환한다.
   *
   * [VI] Truy vấn danh sách nhân viên (theo ID doanh nghiệp, phân trang)
   *      1. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      2. Trả về danh sách nhân viên chưa bị xóa, sắp xếp theo ngày tạo giảm dần.
   */
  async listEmployees(
    ctx: MealCallerCtx,
    corporateId: string,
    skip: number,
    take: number,
  ) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealEmployee.findMany({
      where: { corporateId, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * [KO] 임직원 목록 + 총 건수 조회 (기업 ID 기반, 페이지네이션)
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. Prisma $transaction으로 findMany와 count를 원자적으로 실행한다.
   *      3. [data 배열, totalCount] 튜플을 반환한다.
   *
   * [VI] Truy vấn danh sách nhân viên + tổng số (theo ID doanh nghiệp, phân trang)
   *      1. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      2. Thực hiện findMany và count nguyên tử qua Prisma $transaction.
   *      3. Trả về tuple [mảng data, totalCount].
   */
  async listEmployeesWithCount(
    ctx: MealCallerCtx,
    corporateId: string,
    skip: number,
    take: number,
  ): Promise<[unknown[], number]> {
    assertCorporateScope(ctx, corporateId);
    const where = { corporateId, deletedAt: null };
    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.mealEmployee.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.mealEmployee.count({ where }),
    ]);
    return [data, totalCount];
  }

  /**
   * [KO] 임직원 생성
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. 'corporate.employee.write' 권한을 검증한다.
   *      3. departmentId가 입력된 경우, 해당 부서가 같은 기업에 속하는지 검증한다.
   *         다른 기업의 부서이면 DEPARTMENT_CORPORATE_MISMATCH 에러를 던진다.
   *      4. 입력 데이터로 새 임직원 레코드를 생성하여 반환한다.
   *
   * [VI] Tạo nhân viên
   *      1. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      2. Xác minh quyền 'corporate.employee.write'.
   *      3. Nếu có departmentId, kiểm tra phòng ban đó thuộc cùng doanh nghiệp.
   *         Nếu thuộc doanh nghiệp khác thì ném lỗi DEPARTMENT_CORPORATE_MISMATCH.
   *      4. Tạo bản ghi nhân viên mới từ dữ liệu đầu vào và trả về.
   */
  async createEmployee(ctx: MealCallerCtx, input: CreateMealEmployeeInput) {
    assertCorporateScope(ctx, input.corporateId);
    await this.permission.require(
      withTargetCorporate(ctx, input.corporateId),
      'corporate.employee.write',
    );

    if (input.departmentId) {
      const dept = await this.prisma.mealCorporateDepartment.findFirst({
        where: {
          id: input.departmentId,
          corporateId: input.corporateId,
          deletedAt: null,
        },
      });
      if (!dept) {
        throw new DomainError({ code: 'DEPARTMENT_CORPORATE_MISMATCH', details: { reason: 'Department does not belong to corporate' } });
      }
    }
    return this.prisma.mealEmployee.create({
      data: {
        corporateId: input.corporateId,
        departmentId: input.departmentId ?? null,
        employeeCode: input.employeeCode,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        badgeRfid: input.badgeRfid,
      },
    });
  }

  // ───── Invoice Schedule

  /**
   * [KO] 청구서 스케줄 설정 업데이트
   *      1. assertCorporateScope로 호출자의 기업 접근 권한을 검증한다.
   *      2. 'corporate.profile.write' 권한을 검증한다.
   *      3. scheduleDay가 유효 범위(1~28)를 벗어나면 INVOICE_SCHEDULE_INVALID_DAY 에러를 던진다.
   *         (29~31일은 월마다 존재하지 않을 수 있으므로 28일까지만 허용)
   *      4. 해당 기업의 청구서 스케줄 관련 필드를 업데이트한다.
   *         - invoiceScheduleType: 스케줄 유형 (MONTHLY/WEEKLY/BIWEEKLY/CUSTOM)
   *         - invoiceScheduleDay: 발행 기준일
   *         - invoiceAutoGenerate: 자동 생성 여부
   *         - invoiceAutoSubmit: 자동 제출 여부
   *         - invoiceNotifyEmail: 알림 이메일 주소
   *
   * [VI] Cập nhật thiết lập lịch hóa đơn
   *      1. Xác minh quyền truy cập doanh nghiệp qua assertCorporateScope.
   *      2. Xác minh quyền 'corporate.profile.write'.
   *      3. Nếu scheduleDay ngoài phạm vi hợp lệ (1~28) thì ném lỗi INVOICE_SCHEDULE_INVALID_DAY.
   *         (Ngày 29~31 không tồn tại ở một số tháng nên chỉ cho phép đến ngày 28)
   *      4. Cập nhật các trường liên quan lịch hóa đơn của doanh nghiệp:
   *         - invoiceScheduleType: Loại lịch (MONTHLY/WEEKLY/BIWEEKLY/CUSTOM)
   *         - invoiceScheduleDay: Ngày phát hành cơ sở
   *         - invoiceAutoGenerate: Tự động tạo hay không
   *         - invoiceAutoSubmit: Tự động gửi hay không
   *         - invoiceNotifyEmail: Địa chỉ email thông báo
   */
  async updateInvoiceSchedule(
    ctx: MealCallerCtx,
    corporateId: string,
    scheduleType: string,
    scheduleDay?: number | null,
    autoGenerate?: boolean,
    autoSubmit?: boolean,
    notifyEmail?: string | null,
  ) {
    assertCorporateScope(ctx, corporateId);
    const targetCtx = withTargetCorporate(ctx, corporateId);
    await this.permission.require(targetCtx, 'corporate.profile.write');

    if (scheduleDay != null && (scheduleDay < 1 || scheduleDay > 28)) {
      throw new DomainError({ code: 'INVOICE_SCHEDULE_INVALID_DAY', params: { day: scheduleDay } });
    }

    return this.prisma.mealCorporate.update({
      where: { id: corporateId },
      data: {
        invoiceScheduleType: scheduleType,
        invoiceScheduleDay: scheduleDay ?? null,
        ...(autoGenerate != null && { invoiceAutoGenerate: autoGenerate }),
        ...(autoSubmit != null && { invoiceAutoSubmit: autoSubmit }),
        ...(notifyEmail !== undefined && { invoiceNotifyEmail: notifyEmail }),
      },
    });
  }

  // ───── Revenue / Credit helpers

  /**
   * [KO] 자동 청구서 발행 대상 기업 목록 조회
   *      오늘 날짜를 기준으로 청구서를 자동 발행해야 하는 활성 기업 목록을 반환한다.
   *      스케줄 유형별 매칭 조건:
   *      - MONTHLY: invoiceScheduleDay == 오늘 날짜(일)
   *      - WEEKLY: 오늘이 월요일인 경우에만 매칭
   *      - BIWEEKLY: 오늘이 1일 또는 16일인 경우에만 매칭
   *      - CUSTOM: invoiceScheduleDay == 오늘 날짜(일)
   *      모든 조건에 invoiceAutoGenerate = true, status = 'ACTIVE' 필터가 적용된다.
   *
   * [VI] Truy vấn danh sách doanh nghiệp cần phát hành hóa đơn tự động
   *      Dựa trên ngày hôm nay, trả về danh sách doanh nghiệp đang hoạt động cần phát hành hóa đơn tự động.
   *      Điều kiện khớp theo loại lịch:
   *      - MONTHLY: invoiceScheduleDay == ngày hôm nay
   *      - WEEKLY: chỉ khớp nếu hôm nay là thứ Hai
   *      - BIWEEKLY: chỉ khớp nếu hôm nay là ngày 1 hoặc 16
   *      - CUSTOM: invoiceScheduleDay == ngày hôm nay
   *      Tất cả điều kiện đều áp dụng bộ lọc invoiceAutoGenerate = true, status = 'ACTIVE'.
   */
  async listCorporatesForInvoiceGeneration(today: Date) {
    const day = today.getDate();
    const dow = today.getDay(); // 0=Sun
    const isMonday = dow === 1;
    const isMidMonth = day === 1 || day === 16;

    return this.prisma.mealCorporate.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        invoiceAutoGenerate: true,
        OR: [
          { invoiceScheduleType: 'MONTHLY', invoiceScheduleDay: day },
          { invoiceScheduleType: 'WEEKLY', ...(isMonday ? {} : { id: '__none__' }) },
          { invoiceScheduleType: 'BIWEEKLY', ...(isMidMonth ? {} : { id: '__none__' }) },
          { invoiceScheduleType: 'CUSTOM', invoiceScheduleDay: day },
        ],
      },
    });
  }

  // ───── VMealApp Employee Login

  /**
   * [KO] 임직원 전화번호 로그인 (VMealApp dev-friendly 버전)
   *      1. phone + corporateId + ACTIVE + deletedAt=null 조건으로 임직원을 조회한다.
   *      2. 존재하지 않으면 EMPLOYEE_NOT_FOUND 에러를 던진다.
   *      3. JWT 토큰을 발급하여 accessToken, employee, wallet 을 반환한다.
   *
   * [VI] Dang nhap nhan vien bang so dien thoai (phien ban dev-friendly cho VMealApp)
   *      1. Tim nhan vien theo phone + corporateId + ACTIVE + deletedAt=null.
   *      2. Neu khong ton tai thi nem loi EMPLOYEE_NOT_FOUND.
   *      3. Cap JWT token va tra ve accessToken, employee, wallet.
   */
  async employeeLogin(phone: string, corporateId: string) {
    const employee = await this.prisma.mealEmployee.findFirst({
      where: { phone, corporateId, status: 'ACTIVE', deletedAt: null },
      include: { wallet: true, department: true, corporate: true },
    });

    if (!employee) {
      throw new DomainError({ code: 'EMPLOYEE_NOT_FOUND', params: { phone } });
    }

    const payload = {
      sub: employee.id,
      loginId: employee.phone,
      displayName: employee.fullName,
      userType: 'MEAL_EMPLOYEE',
      corporateId: employee.corporateId,
      employeeId: employee.id,
      walletId: employee.wallet?.id ?? null,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      employee,
      wallet: employee.wallet,
    };
  }

  // ───── Employee Status Management

  async updateEmployee(
    ctx: MealCallerCtx,
    id: string,
    data: { fullName?: string; email?: string; phone?: string; departmentId?: string | null },
  ) {
    const emp = await this.prisma.mealEmployee.findUnique({ where: { id } });
    if (!emp) throw new Error('RESOURCE_NOT_FOUND');
    assertCorporateScope(ctx, emp.corporateId);

    return this.prisma.mealEmployee.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      },
    });
  }

  async suspendEmployee(ctx: MealCallerCtx, id: string) {
    const emp = await this.prisma.mealEmployee.findUnique({ where: { id } });
    if (!emp) throw new Error('RESOURCE_NOT_FOUND');
    assertCorporateScope(ctx, emp.corporateId);
    if (emp.status !== 'ACTIVE') throw new Error('Employee is not ACTIVE');

    const updated = await this.prisma.mealEmployee.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    // Suspend wallet too
    await this.prisma.mealWallet.updateMany({
      where: { employeeId: id },
      data: { status: 'SUSPENDED' },
    });

    return updated;
  }

  async terminateEmployee(ctx: MealCallerCtx, id: string) {
    const emp = await this.prisma.mealEmployee.findUnique({ where: { id } });
    if (!emp) throw new Error('RESOURCE_NOT_FOUND');
    assertCorporateScope(ctx, emp.corporateId);

    const updated = await this.prisma.mealEmployee.update({
      where: { id },
      data: { status: 'TERMINATED', deletedAt: new Date() },
    });

    // Freeze wallet
    await this.prisma.mealWallet.updateMany({
      where: { employeeId: id },
      data: { status: 'FROZEN' },
    });

    return updated;
  }

  // ───── Corporate Admins

  async listAdmins(corporateId: string) {
    const admins = await this.prisma.corporateAdminUser.findMany({
      where: { corporateId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return { data: admins, totalCount: admins.length };
  }
}
