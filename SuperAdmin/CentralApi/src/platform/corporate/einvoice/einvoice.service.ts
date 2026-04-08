/**
 * 한국어: MealConsolidatedEInvoice Service.
 *   베트남 GDT 통합 전자세금계산서 (corporate 축).
 *   모든 read/write 가 caller corporateContext 와 target row 의 corporateId 일치 검증.
 * Tiếng Việt: Service hoá đơn điện tử hợp nhất GDT — kiểm scope corporate cho mọi đường dẫn.
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/caller-ctx';
import { GenerateMealConsolidatedInvoiceInput } from './dto/generate-meal-consolidated-invoice.input';
import { DomainError } from '@core/errors/domain-error';

const VAT_RATE_BPS = 1000n; // 10.00%

@Injectable()
export class MealEInvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
  ) {}

  async listByCorporate(ctx: MealCallerCtx, corporateId: string) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealConsolidatedEInvoice.findMany({
      where: { corporateId },
      orderBy: { periodStart: 'desc' },
    });
  }

  async findById(ctx: MealCallerCtx, id: string) {
    const i = await this.prisma.mealConsolidatedEInvoice.findUnique({
      where: { id },
    });
    if (!i) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Invoice' }, details: { reason: 'Invoice not found' } });
    assertCorporateScope(ctx, i.corporateId);
    return i;
  }

  async generate(
    ctx: MealCallerCtx,
    input: GenerateMealConsolidatedInvoiceInput,
  ) {
    assertCorporateScope(ctx, input.corporateId);
    const targetCtx = withTargetCorporate(ctx, input.corporateId);
    await this.permission.require(targetCtx, 'corporate.invoice.write');

    const txList = await this.prisma.mealTransaction.findMany({
      where: {
        corporateId: input.corporateId,
        status: { in: ['APPROVED', 'SETTLED'] },
        createdAt: { gte: input.periodStart, lt: input.periodEnd },
      },
    });

    const totalAmountVnd = txList.reduce(
      (acc, t) => acc + t.approvedAmountVnd,
      0n,
    );
    const vatAmountVnd = (totalAmountVnd * VAT_RATE_BPS) / 10000n;

    return this.prisma.mealConsolidatedEInvoice.upsert({
      where: {
        uq_meal_invoice_corp_period: {
          corporateId: input.corporateId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        },
      },
      update: { totalAmountVnd, vatAmountVnd, status: 'DRAFT' },
      create: {
        corporateId: input.corporateId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        totalAmountVnd,
        vatAmountVnd,
        status: 'DRAFT',
      },
    });
  }

  async sign(ctx: MealCallerCtx, invoiceId: string, xmlPayloadRef: string) {
    const inv = await this.prisma.mealConsolidatedEInvoice.findUnique({
      where: { id: invoiceId },
    });
    if (!inv) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Invoice' }, details: { reason: 'Invoice not found' } });
    assertCorporateScope(ctx, inv.corporateId);
    await this.permission.require(
      withTargetCorporate(ctx, inv.corporateId),
      'corporate.invoice.write',
    );
    if (inv.status !== 'DRAFT') {
      throw new DomainError({ code: 'INVALID_STATUS_TRANSITION', params: { currentStatus: inv.status } });
    }
    return this.prisma.mealConsolidatedEInvoice.update({
      where: { id: invoiceId },
      data: { status: 'SIGNED', xmlPayloadRef },
    });
  }

  /**
   * 한국어: 외부 GDT 어댑터 콜백 — 시스템 내부 호출.
   */
  async markSubmitted(invoiceId: string, gdtReceiptNo: string) {
    return this.prisma.mealConsolidatedEInvoice.update({
      where: { id: invoiceId },
      data: { status: 'SUBMITTED_GDT', gdtReceiptNo },
    });
  }

  async markAccepted(invoiceId: string) {
    return this.prisma.mealConsolidatedEInvoice.update({
      where: { id: invoiceId },
      data: { status: 'ACCEPTED_GDT' },
    });
  }
}
