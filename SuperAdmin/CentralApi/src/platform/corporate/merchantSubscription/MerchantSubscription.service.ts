/**
 * [KO] MealMerchantSubscription 서비스
 *      임직원이 특정 가맹점(Branch)의 일일 메뉴 알림을 구독/해지하는 비즈니스 로직.
 *
 *      제공 기능:
 *        - listByEmployee: 직원의 활성 구독 목록 조회
 *        - subscribe: 구독 생성 또는 업데이트 (upsert)
 *        - unsubscribe: 구독 비활성화 (isActive=false)
 *
 *      보안 모델:
 *        - 모든 메서드: caller의 corporateScope 검증 (직원의 corporateId 기준)
 *
 * [VI] Service MealMerchantSubscription
 *      Logic nghiệp vụ cho nhân viên đăng ký/hủy thông báo thực đơn hàng ngày của chi nhánh.
 *
 *      Chức năng:
 *        - listByEmployee: Danh sách đăng ký đang hoạt động của nhân viên
 *        - subscribe: Tạo hoặc cập nhật đăng ký (upsert)
 *        - unsubscribe: Vô hiệu hóa đăng ký (isActive=false)
 *
 *      Mô hình bảo mật:
 *        - Mọi phương thức: kiểm tra corporateScope của caller (dựa trên corporateId nhân viên)
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { DomainError } from '@core/errors/DomainError';
import {
  MealCallerCtx,
  assertCorporateScope,
} from '../_internal/callerCtx';

@Injectable()
export class MealMerchantSubscriptionService {
  constructor(
    /** [KO] Prisma DB 접근 서비스 / [VI] Service truy cập DB Prisma */
    private readonly prisma: PrismaService,
  ) {}

  // ───── Read (조회 / Truy vấn)

  /**
   * [KO] 직원의 활성 구독 목록을 조회합니다.
   *      caller의 corporateScope를 검증한 뒤, isActive=true인 구독만 반환합니다.
   * [VI] Truy vấn danh sách đăng ký đang hoạt động của nhân viên.
   *      Kiểm tra corporateScope của caller, chỉ trả về đăng ký isActive=true.
   */
  async listByEmployee(ctx: MealCallerCtx, employeeId: string) {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Employee' },
        details: { reason: 'Employee not found' },
      });
    }
    assertCorporateScope(ctx, employee.corporateId);

    const data = await this.prisma.mealMerchantSubscription.findMany({
      where: { employeeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data, totalCount: data.length };
  }

  // ───── Mutations (변경 / Thay đổi)

  /**
   * [KO] 가맹점 일일 메뉴 구독 생성/업데이트 (upsert).
   *      (employeeId, branchId) 조합이 이미 존재하면 알림 설정과 isActive를 업데이트합니다.
   *      존재하지 않으면 새 구독을 생성합니다.
   *
   * [VI] Tạo/cập nhật đăng ký thực đơn hàng ngày (upsert).
   *      Nếu cặp (employeeId, branchId) đã tồn tại, cập nhật cài đặt thông báo và isActive.
   *      Nếu không, tạo đăng ký mới.
   */
  async subscribe(
    ctx: MealCallerCtx,
    input: {
      employeeId: string;
      branchId: string;
      notifyBreakfast?: boolean;
      notifyLunch?: boolean;
      notifyDinner?: boolean;
    },
  ) {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Employee' },
        details: { reason: 'Employee not found' },
      });
    }
    assertCorporateScope(ctx, employee.corporateId);

    return this.prisma.mealMerchantSubscription.upsert({
      where: {
        uq_meal_merchant_sub_emp_branch: {
          employeeId: input.employeeId,
          branchId: input.branchId,
        },
      },
      create: {
        employeeId: input.employeeId,
        branchId: input.branchId,
        isActive: true,
        notifyBreakfast: input.notifyBreakfast ?? false,
        notifyLunch: input.notifyLunch ?? true,
        notifyDinner: input.notifyDinner ?? false,
      },
      update: {
        isActive: true,
        notifyBreakfast: input.notifyBreakfast ?? false,
        notifyLunch: input.notifyLunch ?? true,
        notifyDinner: input.notifyDinner ?? false,
      },
    });
  }

  /**
   * [KO] 가맹점 구독 해지 — isActive=false로 설정합니다.
   *      레코드를 물리 삭제하지 않고 비활성화하여 이력을 보존합니다.
   *
   * [VI] Hủy đăng ký — đặt isActive=false.
   *      Không xóa vật lý, vô hiệu hóa để bảo toàn lịch sử.
   */
  async unsubscribe(
    ctx: MealCallerCtx,
    employeeId: string,
    branchId: string,
  ) {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Employee' },
        details: { reason: 'Employee not found' },
      });
    }
    assertCorporateScope(ctx, employee.corporateId);

    const subscription = await this.prisma.mealMerchantSubscription.findUnique({
      where: {
        uq_meal_merchant_sub_emp_branch: { employeeId, branchId },
      },
    });
    if (!subscription) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MerchantSubscription' },
        details: { reason: 'Subscription not found for this employee and branch' },
      });
    }

    return this.prisma.mealMerchantSubscription.update({
      where: { id: subscription.id },
      data: { isActive: false },
    });
  }
}
