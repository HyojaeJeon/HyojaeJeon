/**
 * 한국어: MealCorporate Service.
 *   기준서 §99/§100. Corporate(고객 기업) CRUD + Department/Employee.
 *   - PLATFORM_SUPER_ADMIN 만 corporate 자체 create/update/delete.
 *   - CORPORATE_ADMIN 은 자기 corporate 내부의 department/employee 만 R/W.
 *   - 모든 read/write 가 caller MealCallerCtx 의 corporateContext 와 target row 의
 *     corporateId 를 강제 일치 검증한다.
 *
 * Tiếng Việt: Service Corporate với scope corporate cứng cho mọi đường dẫn.
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/caller-ctx';
import { CreateMealCorporateInput } from './dto/create-meal-corporate.input';
import { CreateMealDepartmentInput } from './dto/create-meal-department.input';
import { CreateMealEmployeeInput } from './dto/create-meal-employee.input';
import { UpdateMealCorporateInput } from './dto/update-meal-corporate.input';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class MealCorporateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
  ) {}

  // ───── Corporate

  async list(ctx: MealCallerCtx, skip: number, take: number) {
    // CORPORATE_ADMIN 은 자기 corporate 만 보이도록 강제. SUPER_ADMIN 은 전체.
    const where =
      ctx.userType === 'SUPER_ADMIN'
        ? { deletedAt: null }
        : { id: ctx.corporateId ?? '__none__', deletedAt: null };
    return this.prisma.mealCorporate.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(ctx: MealCallerCtx, id: string) {
    const c = await this.prisma.mealCorporate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!c) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });
    assertCorporateScope(ctx, c.id);
    return c;
  }

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

  async listDepartments(ctx: MealCallerCtx, corporateId: string) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealCorporateDepartment.findMany({
      where: { corporateId, deletedAt: null },
      orderBy: { departmentCode: 'asc' },
    });
  }

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
}
