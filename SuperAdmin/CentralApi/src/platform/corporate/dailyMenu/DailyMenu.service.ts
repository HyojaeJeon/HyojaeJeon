/**
 * [KO] 일일 메뉴 및 사전 주문 서비스
 *
 * 가맹점의 일일 메뉴 관리와 직원의 사전 주문 생성/취소/확인/완료를 담당한다.
 *
 * 핵심 책임:
 * 1. 일일 메뉴 CRUD: 생성(createDailyMenu), 조회(listDailyMenus, findDailyMenuById)
 * 2. 구독 기반 메뉴 조회: listDailyMenusForSubscribed (직원이 구독한 가맹점의 메뉴)
 * 3. 사전 주문: 생성(createPreOrder), 취소(cancelPreOrder),
 *    확인(confirmPreOrder), 완료(completePreOrder)
 *
 * 보안:
 * - 일일 메뉴 조회/생성: corp_daily_menus:read / corp_daily_menus:create 권한
 * - 사전 주문 조회/생성: corp_preorders:read / corp_preorders:create 권한
 * - 사전 주문 상태 변경: corp_preorders:update 권한
 * - 모든 write 경로에서 assertCorporateScope를 통한 tenant 격리 검증
 *
 * [VI] Service thuc don hang ngay va dat hang truoc
 *
 * Xu ly quan ly thuc don hang ngay cua cua hang va tao/huy/xac nhan/hoan tat
 * don dat truoc cua nhan vien.
 *
 * Trach nhiem chinh:
 * 1. CRUD thuc don: tao (createDailyMenu), truy van (listDailyMenus, findDailyMenuById)
 * 2. Truy van thuc don dang ky: listDailyMenusForSubscribed (thuc don cua cua hang nhan vien da dang ky)
 * 3. Dat truoc: tao (createPreOrder), huy (cancelPreOrder),
 *    xac nhan (confirmPreOrder), hoan tat (completePreOrder)
 *
 * Bao mat:
 * - Thuc don: corp_daily_menus:read / corp_daily_menus:create
 * - Dat truoc: corp_preorders:read / corp_preorders:create
 * - Thay doi trang thai: corp_preorders:update
 * - assertCorporateScope tren moi duong ghi de dam bao cach ly tenant
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { DomainError } from '@core/errors/DomainError';
import {
  MealCallerCtx,
  assertCorporateScope,
} from '../_internal/callerCtx';
import { CreateMealDailyMenuInput } from './dto/CreateMealDailyMenu.input';
import { CreateMealPreOrderInput } from './dto/CreateMealPreOrder.input';
import {
  allocateMealWalletSpend,
  restoreMealWalletSpend,
} from '../wallet/_internal/walletLedger';
import type { Prisma } from '@prisma/client';

@Injectable()
export class MealDailyMenuService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /* ─────────────────────────── Daily Menu Queries ─────────────────────────── */

  /**
   * [KO] 지점별 일일 메뉴 목록 조회
   *      branchId(필수) + date(선택) + mealType(선택)으로 필터링한다.
   *      items를 함께 로드한다.
   *
   * [VI] Truy van danh sach thuc don hang ngay theo chi nhanh
   *      Loc theo branchId (bat buoc) + date (tuy chon) + mealType (tuy chon).
   *      Tai items cung luc.
   */
  async listDailyMenus(branchId: string, date?: Date, mealType?: string) {
    const where: Prisma.MealDailyMenuWhereInput = { branchId };
    if (date) where.date = date;
    if (mealType) where.mealType = mealType;

    return this.prisma.mealDailyMenu.findMany({
      where,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * [KO] 일일 메뉴 단건 조회 (items 포함)
   * [VI] Truy van mot thuc don hang ngay (bao gom items)
   */
  async findDailyMenuById(id: string) {
    const menu = await this.prisma.mealDailyMenu.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!menu) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealDailyMenu' },
        details: { reason: 'Daily menu not found' },
      });
    }
    return menu;
  }

  /**
   * [KO] 직원이 구독한 가맹점의 일일 메뉴 조회
   *      1. MealMerchantSubscription에서 employeeId로 활성 구독 조회
   *      2. 구독 중인 branchId 목록으로 일일 메뉴 필터
   *      3. 날짜 필터 적용 (없으면 오늘)
   *
   * [VI] Truy van thuc don hang ngay cua cac cua hang nhan vien da dang ky
   *      1. Truy van cac dang ky hoat dong tu MealMerchantSubscription theo employeeId
   *      2. Loc thuc don hang ngay theo danh sach branchId dang ky
   *      3. Ap dung bo loc ngay (neu khong co thi lay ngay hom nay)
   */
  async listDailyMenusForSubscribed(employeeId: string, date?: Date) {
    const subscriptions = await this.prisma.mealMerchantSubscription.findMany({
      where: { employeeId, isActive: true },
      select: { branchId: true },
    });

    if (subscriptions.length === 0) return [];

    const branchIds = subscriptions.map((s) => s.branchId);
    const targetDate = date ?? new Date();

    return this.prisma.mealDailyMenu.findMany({
      where: {
        branchId: { in: branchIds },
        date: targetDate,
        status: 'ACTIVE',
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ branchId: 'asc' }, { mealType: 'asc' }],
    });
  }

  /* ───────────────────────── Daily Menu Mutation ──────────────────────────── */

  /**
   * [KO] 일일 메뉴 생성 (항목 포함)
   *      branchId + date + mealType 조합이 이미 있으면 DUPLICATE_DAILY_MENU 에러.
   *      메뉴는 항상 ACTIVE 상태로 생성된다.
   *
   * [VI] Tao thuc don hang ngay (bao gom cac muc)
   *      Neu to hop branchId + date + mealType da ton tai thi loi DUPLICATE_DAILY_MENU.
   *      Thuc don luon duoc tao voi trang thai ACTIVE.
   */
  async createDailyMenu(input: CreateMealDailyMenuInput) {
    const existing = await this.prisma.mealDailyMenu.findFirst({
      where: {
        branchId: input.branchId,
        date: input.date,
        mealType: input.mealType,
      },
    });
    if (existing) {
      throw new DomainError({
        code: 'DUPLICATE_DAILY_MENU',
        params: { branchId: input.branchId, date: input.date.toISOString(), mealType: input.mealType },
      });
    }

    return this.prisma.mealDailyMenu.create({
      data: {
        branchId: input.branchId,
        date: input.date,
        mealType: input.mealType,
        status: 'ACTIVE',
        items: {
          create: input.items.map((item) => ({
            name: item.name,
            priceVnd: item.priceVnd,
            imageUrl: item.imageUrl ?? null,
            calories: item.calories ?? null,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  /* ──────────────────────── Pre-Order Queries ─────────────────────────────── */

  /**
   * [KO] 지갑별 사전 주문 목록 조회 (페이지네이션)
   *      walletId 소유자의 corporateId와 caller의 corporate scope를 검증한다.
   *
   * [VI] Truy van danh sach don dat truoc theo vi (phan trang)
   *      Kiem tra corporateId cua chu vi khop voi corporate scope cua caller.
   */
  async listPreOrdersByWallet(
    ctx: MealCallerCtx,
    walletId: string,
    skip: number,
    take: number,
  ) {
    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: walletId },
      select: { corporateId: true },
    });
    if (!wallet) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealWallet' },
        details: { reason: 'Wallet not found' },
      });
    }
    assertCorporateScope(ctx, wallet.corporateId);

    const [data, totalCount] = await Promise.all([
      this.prisma.mealPreOrder.findMany({
        where: { walletId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.mealPreOrder.count({ where: { walletId } }),
    ]);

    return { data, totalCount };
  }

  /* ──────────────────────── Pre-Order Mutations ──────────────────────────── */

  /**
   * [KO] 사전 주문 생성
   *      단계별 흐름:
   *      1. 멱등성 검사: 동일 idempotencyKey가 이미 있으면 기존 주문 반환
   *      2. 일일 메뉴 검증: dailyMenuId 존재 + status ACTIVE 확인
   *      3. 항목 검증: 주문 항목이 해당 일일 메뉴에 속하는지 확인
   *      4. 총액 계산: menuItem.priceVnd * quantity 합산
   *      5. 지갑 조회 + corporate scope 검증
   *      6. Split payment 계산: allocateMealWalletSpend로 회사/개인 분담 계산
   *      7. 트랜잭션: 지갑 차감 + MealPreOrder + MealPreOrderItem 생성
   *
   * [VI] Tao don dat truoc
   *      Quy trinh tung buoc:
   *      1. Kiem tra idempotency: neu da co idempotencyKey giong thi tra ve don cu
   *      2. Kiem tra thuc don: dailyMenuId ton tai + status ACTIVE
   *      3. Kiem tra muc: cac muc dat hang thuoc thuc don hang ngay
   *      4. Tinh tong: menuItem.priceVnd * quantity
   *      5. Truy van vi + kiem tra corporate scope
   *      6. Tinh split payment: allocateMealWalletSpend de chia phan cong ty/ca nhan
   *      7. Giao dich: tru vi + tao MealPreOrder + MealPreOrderItem
   */
  async createPreOrder(ctx: MealCallerCtx, input: CreateMealPreOrderInput) {
    /* 1. 멱등성 검사 */
    const existingOrder = await this.prisma.mealPreOrder.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { items: true },
    });
    if (existingOrder) return existingOrder;

    /* 2. 일일 메뉴 검증 */
    const dailyMenu = await this.prisma.mealDailyMenu.findUnique({
      where: { id: input.dailyMenuId },
      include: { items: true },
    });
    if (!dailyMenu) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealDailyMenu' },
        details: { reason: 'Daily menu not found' },
      });
    }
    if (dailyMenu.status !== 'ACTIVE') {
      throw new DomainError({
        code: 'DAILY_MENU_NOT_ACTIVE',
        params: { dailyMenuId: dailyMenu.id, status: dailyMenu.status },
      });
    }

    /* 3. 항목 검증: 주문 항목이 해당 일일 메뉴에 속하는지 */
    const menuItemMap = new Map(dailyMenu.items.map((item) => [item.id, item]));
    for (const orderItem of input.items) {
      if (!menuItemMap.has(orderItem.dailyMenuItemId)) {
        throw new DomainError({
          code: 'INVALID_MENU_ITEM',
          params: { dailyMenuItemId: orderItem.dailyMenuItemId, dailyMenuId: dailyMenu.id },
        });
      }
    }

    /* 4. 총액 계산 */
    let totalAmountVnd = 0n;
    for (const orderItem of input.items) {
      const menuItem = menuItemMap.get(orderItem.dailyMenuItemId)!;
      totalAmountVnd += menuItem.priceVnd * BigInt(orderItem.quantity);
    }

    /* 5. 지갑 조회 + corporate scope 검증 */
    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealWallet' },
        details: { reason: 'Wallet not found' },
      });
    }
    assertCorporateScope(ctx, wallet.corporateId);

    if (wallet.status !== 'ACTIVE') {
      throw new DomainError({
        code: 'WALLET_NOT_ACTIVE',
        params: { walletId: wallet.id, status: wallet.status },
      });
    }

    /* 6. Split payment 계산 */
    const allocation = allocateMealWalletSpend(
      {
        balanceVnd: wallet.balanceVnd,
        companyAllowanceVnd: wallet.companyAllowanceVnd,
        personalTopUpVnd: wallet.personalTopUpVnd,
      },
      totalAmountVnd,
      true, // 사전 주문은 항상 split payment 허용
    );
    if (!allocation) {
      throw new DomainError({
        code: 'INSUFFICIENT_BALANCE',
        params: { walletId: wallet.id, required: totalAmountVnd.toString(), available: wallet.balanceVnd.toString() },
      });
    }

    /* 7. 트랜잭션: 지갑 차감 + 주문 생성 */
    const preOrder = await this.prisma.$transaction(async (tx) => {
      await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: allocation.balanceVnd,
          companyAllowanceVnd: allocation.companyAllowanceVnd,
          personalTopUpVnd: allocation.personalTopUpVnd,
        },
      });

      return tx.mealPreOrder.create({
        data: {
          walletId: wallet.id,
          corporateId: wallet.corporateId,
          branchId: dailyMenu.branchId,
          dailyMenuId: dailyMenu.id,
          mealType: dailyMenu.mealType,
          pickupSlot: input.pickupSlot,
          status: 'PENDING',
          totalAmountVnd,
          companyShareVnd: allocation.companyShareVnd,
          employeeShareVnd: allocation.employeeShareVnd,
          idempotencyKey: input.idempotencyKey,
          items: {
            create: input.items.map((item) => ({
              dailyMenuItemId: item.dailyMenuItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    return preOrder;
  }

  /**
   * [KO] 사전 주문 취소 (PENDING → CANCELLED + 지갑 환불)
   *      - PENDING 상태에서만 취소 가능
   *      - 지갑에 companyShareVnd/employeeShareVnd를 복원
   *
   * [VI] Huy don dat truoc (PENDING → CANCELLED + hoan tien vi)
   *      - Chi huy duoc khi trang thai PENDING
   *      - Khoi phuc companyShareVnd/employeeShareVnd vao vi
   */
  async cancelPreOrder(ctx: MealCallerCtx, id: string) {
    const order = await this.prisma.mealPreOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealPreOrder' },
        details: { reason: 'Pre-order not found' },
      });
    }
    assertCorporateScope(ctx, order.corporateId);

    if (order.status !== 'PENDING') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { from: order.status, to: 'CANCELLED' },
      });
    }

    /* 지갑 환불 + 상태 변경 트랜잭션 */
    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: order.walletId },
    });
    if (!wallet) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealWallet' },
        details: { reason: 'Wallet not found for refund' },
      });
    }

    const restored = restoreMealWalletSpend(
      {
        balanceVnd: wallet.balanceVnd,
        companyAllowanceVnd: wallet.companyAllowanceVnd,
        personalTopUpVnd: wallet.personalTopUpVnd,
      },
      order.companyShareVnd,
      order.employeeShareVnd,
    );

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: restored.balanceVnd,
          companyAllowanceVnd: restored.companyAllowanceVnd,
          personalTopUpVnd: restored.personalTopUpVnd,
        },
      });

      return tx.mealPreOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });
    });

    return updatedOrder;
  }

  /**
   * [KO] 사전 주문 확인 (PENDING → CONFIRMED)
   *      가맹점 관리자가 주문을 접수할 때 호출한다.
   *
   * [VI] Xac nhan don dat truoc (PENDING → CONFIRMED)
   *      Goi khi quan ly cua hang tiep nhan don hang.
   */
  async confirmPreOrder(ctx: MealCallerCtx, id: string) {
    const order = await this.prisma.mealPreOrder.findUnique({
      where: { id },
    });
    if (!order) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealPreOrder' },
        details: { reason: 'Pre-order not found' },
      });
    }
    assertCorporateScope(ctx, order.corporateId);

    if (order.status !== 'PENDING') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { from: order.status, to: 'CONFIRMED' },
      });
    }

    return this.prisma.mealPreOrder.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });
  }

  /**
   * [KO] 사전 주문 완료 (CONFIRMED → COMPLETED)
   *      직원이 음식을 수령했을 때 호출한다.
   *
   * [VI] Hoan tat don dat truoc (CONFIRMED → COMPLETED)
   *      Goi khi nhan vien da nhan do an.
   */
  async completePreOrder(ctx: MealCallerCtx, id: string) {
    const order = await this.prisma.mealPreOrder.findUnique({
      where: { id },
    });
    if (!order) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'MealPreOrder' },
        details: { reason: 'Pre-order not found' },
      });
    }
    assertCorporateScope(ctx, order.corporateId);

    if (order.status !== 'CONFIRMED') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: { from: order.status, to: 'COMPLETED' },
      });
    }

    return this.prisma.mealPreOrder.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { items: true },
    });
  }
}
