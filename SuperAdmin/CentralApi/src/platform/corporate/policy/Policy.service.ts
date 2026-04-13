/**
 * [KO] 식권 정책(MealPolicy) 서비스
 *
 * 기업이 직원에게 적용하는 식권 사용 정책의 CRUD와 상태 전이, 그리고
 * 거래 시점의 정책 평가(evaluateForEmployee)를 담당합니다.
 *
 * 핵심 책임:
 * 1. CRUD: 정책 생성(create), 조회(listByCorporate, findById), 수정(update)
 * 2. 상태 전이: publish(DRAFT/PAUSED→ACTIVE), pause(ACTIVE→PAUSED),
 *    deactivate(→EXPIRED), softDelete(→DELETED)
 * 3. 정책 평가: evaluateForEmployee - 직원이 결제할 때 적용 가능한 정책을
 *    찾아서 한도/시간대/가맹점 제한을 평가
 *
 * 보안:
 * - 모든 read/write 경로에서 caller의 corporateContext와 대상 row의 corporateId
 *   일치를 검증합니다 (assertCorporateScope).
 * - 쓰기 작업은 추가로 EntitlementService(MEAL_TICKET 기능 활성화 여부)와
 *   PermissionService(corporate.policy.write 권한)를 확인합니다.
 *
 * [VI] Service chinh sach phieu an (MealPolicy)
 *
 * Xu ly CRUD, chuyen trang thai, va danh gia chinh sach tai thoi diem giao dich
 * (evaluateForEmployee) cho chinh sach phieu an ma doanh nghiep ap dung cho nhan vien.
 *
 * Trach nhiem chinh:
 * 1. CRUD: tao (create), truy van (listByCorporate, findById), cap nhat (update)
 * 2. Chuyen trang thai: publish(DRAFT/PAUSED→ACTIVE), pause(ACTIVE→PAUSED),
 *    deactivate(→EXPIRED), softDelete(→DELETED)
 * 3. Danh gia chinh sach: evaluateForEmployee - tim chinh sach phu hop khi nhan vien
 *    thanh toan, kiem tra han muc/khung gio/danh muc cua hang
 *
 * Bao mat:
 * - Kiem tra corporateContext cua caller khop voi corporateId cua ban ghi
 *   (assertCorporateScope) tren moi duong dan.
 * - Thao tac ghi con kiem tra EntitlementService (MEAL_TICKET) va
 *   PermissionService (corporate.policy.write).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/callerCtx';
import { CreateMealPolicyInput } from './dto/CreateMealPolicy.input';
import { UpdateMealPolicyInput } from './dto/UpdateMealPolicy.input';
import { DomainError } from '@core/errors/DomainError';
import type { Prisma } from '@prisma/client';

/**
 * [KO] ruleJson 에 저장되는 시간대/가맹점 규칙의 TypeScript 형상(shape)
 *
 *      DB의 ruleJson 컬럼(JSON)에 직렬화되는 객체의 구조입니다.
 *      저장 예시:
 *      {
 *        "allowedDayOfWeek": [1, 2, 3, 4, 5],          // 월~금만 허용
 *        "allowedTimeStart": "11:00",                    // 오전 11시부터
 *        "allowedTimeEnd": "14:00",                      // 오후 2시까지
 *        "allowedMealTypes": ["LUNCH"],                  // 점심만 허용
 *        "merchantCategoryRestrictions": ["KOREAN"]       // 한식 가맹점만 허용
 *      }
 *
 * [VI] Shape TypeScript cua quy tac khung gio/cua hang luu trong ruleJson
 *
 *      Cau truc doi tuong duoc serialize vao cot ruleJson (JSON) trong DB.
 *      Vi du luu tru:
 *      {
 *        "allowedDayOfWeek": [1, 2, 3, 4, 5],          // chi thu 2~6
 *        "allowedTimeStart": "11:00",                    // tu 11 gio
 *        "allowedTimeEnd": "14:00",                      // den 14 gio
 *        "allowedMealTypes": ["LUNCH"],                  // chi an trua
 *        "merchantCategoryRestrictions": ["KOREAN"]       // chi nha hang Han
 *      }
 */
interface PolicyRuleJson {
  /** [KO] 허용 요일 (0=일~6=토) / [VI] Ngay cho phep (0=CN~6=T7) */
  allowedDayOfWeek?: number[];
  /** [KO] 허용 시간 시작 (HH:mm) / [VI] Gio bat dau cho phep (HH:mm) */
  allowedTimeStart?: string;
  /** [KO] 허용 시간 종료 (HH:mm) / [VI] Gio ket thuc cho phep (HH:mm) */
  allowedTimeEnd?: string;
  /** [KO] 허용 식사 유형 / [VI] Loai bua an cho phep */
  allowedMealTypes?: string[];
  /** [KO] 가맹점 카테고리 제한 / [VI] Gioi han danh muc cua hang */
  merchantCategoryRestrictions?: string[];
  /** [KO] 향후 확장 가능한 추가 필드 / [VI] Truong bo sung co the mo rong */
  [key: string]: unknown;
}

/**
 * [KO] DB에서 읽어온 ruleJson(unknown 타입)을 안전하게 PolicyRuleJson으로 파싱
 *      - 객체이면 그대로 캐스팅
 *      - null/undefined/비객체이면 빈 객체 반환 (안전한 기본값)
 *
 * [VI] Parse an toan ruleJson (kieu unknown) tu DB thanh PolicyRuleJson
 *      - Neu la object → cast truc tiep
 *      - Neu null/undefined/khong phai object → tra ve object rong (gia tri mac dinh an toan)
 */
function parseRuleJson(raw: unknown): PolicyRuleJson {
  if (raw && typeof raw === 'object') return raw as PolicyRuleJson;
  return {};
}

/**
 * [KO] Input DTO의 규칙 필드들을 ruleJson JSON 객체로 조립
 *      CreateMealPolicyInput의 allowedDayOfWeek, allowedTimeStart 등을
 *      하나의 JSON 객체로 합쳐서 DB에 저장할 수 있도록 변환합니다.
 *
 * [VI] Ghep cac truong quy tac tu Input DTO thanh doi tuong ruleJson
 *      Gom allowedDayOfWeek, allowedTimeStart, v.v. tu CreateMealPolicyInput
 *      thanh mot doi tuong JSON de luu vao DB.
 */
function buildRuleJson(input: {
  allowedDayOfWeek?: number[];
  allowedTimeStart?: string;
  allowedTimeEnd?: string;
  allowedMealTypes?: string[];
  merchantCategoryRestrictions?: string[];
}): Prisma.InputJsonValue {
  const rule: PolicyRuleJson = {
    allowedDayOfWeek: input.allowedDayOfWeek,
    allowedTimeStart: input.allowedTimeStart,
    allowedTimeEnd: input.allowedTimeEnd,
    allowedMealTypes: input.allowedMealTypes,
    merchantCategoryRestrictions: input.merchantCategoryRestrictions,
  };
  return rule as Prisma.InputJsonValue;
}

/**
 * [KO] DB row를 GraphQL 모델로 변환할 때 ruleJson 가상 필드를 합침
 *      DB row의 ruleJson(JSON 컬럼)을 파싱하여 allowedDayOfWeek, allowedTimeStart 등
 *      개별 필드로 펼쳐서 row에 추가합니다.
 *
 *      변환 전: { id, corporateId, ruleJson: '{"allowedDayOfWeek":[1,2,3,4,5]}', ... }
 *      변환 후: { id, corporateId, ruleJson: ..., allowedDayOfWeek: [1,2,3,4,5], ... }
 *
 * [VI] Khi chuyen DB row thanh GraphQL model, merge cac truong ao tu ruleJson
 *      Parse ruleJson (cot JSON) tu DB row va trich xuat thanh cac truong rieng le
 *      (allowedDayOfWeek, allowedTimeStart, v.v.) roi gan vao row.
 *
 *      Truoc: { id, corporateId, ruleJson: '{"allowedDayOfWeek":[1,2,3,4,5]}', ... }
 *      Sau:   { id, corporateId, ruleJson: ..., allowedDayOfWeek: [1,2,3,4,5], ... }
 */
function withRuleFields<T extends { ruleJson: unknown }>(row: T) {
  const rule = parseRuleJson(row.ruleJson);
  return {
    ...row,
    allowedDayOfWeek: rule.allowedDayOfWeek ?? null,
    allowedTimeStart: rule.allowedTimeStart ?? null,
    allowedTimeEnd: rule.allowedTimeEnd ?? null,
    allowedMealTypes: rule.allowedMealTypes ?? null,
    merchantCategoryRestrictions: rule.merchantCategoryRestrictions ?? null,
  };
}

/**
 * [KO] 식권 정책 서비스 - NestJS Injectable
 *      DI로 PrismaService, EntitlementService, PermissionService를 주입받습니다.
 *
 * [VI] Service chinh sach phieu an - NestJS Injectable
 *      Nhan PrismaService, EntitlementService, PermissionService qua DI.
 */
@Injectable()
export class MealPolicyService {
  constructor(
    /**
     * [KO] Prisma ORM 서비스 - DB 접근용
     * [VI] Prisma ORM service - de truy cap DB
     */
    private readonly prisma: PrismaService,
    /**
     * [KO] Entitlement 서비스 - 기업의 기능 활성화 여부 확인 (예: MEAL_TICKET 기능이 켜져 있는지)
     * [VI] Entitlement service - kiem tra tinh nang doanh nghiep co bat hay khong (vi du: MEAL_TICKET)
     */
    private readonly entitlement: EntitlementService,
    /**
     * [KO] Permission 서비스 - RBAC 권한 확인 (예: corporate.policy.write 권한이 있는지)
     * [VI] Permission service - kiem tra quyen RBAC (vi du: co quyen corporate.policy.write khong)
     */
    private readonly permission: PermissionService,
  ) {}

  /**
   * [KO] 기업 ID로 해당 기업의 모든 정책 목록 조회
   *      1. assertCorporateScope: caller가 해당 기업에 접근 권한이 있는지 검증
   *      2. deletedAt이 null인 (소프트 삭제되지 않은) 정책만 조회
   *      3. effectiveFrom 내림차순 정렬 (최신 정책이 먼저)
   *      4. 각 row의 ruleJson을 가상 필드로 변환
   *
   * [VI] Truy van danh sach tat ca chinh sach theo ID doanh nghiep
   *      1. assertCorporateScope: xac minh caller co quyen truy cap doanh nghiep
   *      2. Chi truy van chinh sach chua bi xoa mem (deletedAt = null)
   *      3. Sap xep giam dan theo effectiveFrom (chinh sach moi nhat truoc)
   *      4. Chuyen ruleJson cua moi row thanh truong ao
   */
  async listByCorporate(ctx: MealCallerCtx, corporateId: string) {
    assertCorporateScope(ctx, corporateId);
    const rows = await this.prisma.mealPolicy.findMany({
      where: { corporateId, deletedAt: null },
      orderBy: { effectiveFrom: 'desc' },
    });
    return rows.map(withRuleFields);
  }

  /**
   * [KO] 정책 ID로 단건 조회
   *      1. ID로 정책을 찾음 (소프트 삭제 제외)
   *      2. 정책이 없으면 RESOURCE_NOT_FOUND 에러
   *      3. caller의 corporate 접근 권한 검증
   *      4. ruleJson 가상 필드 변환 후 반환
   *
   * [VI] Truy van mot chinh sach theo ID
   *      1. Tim chinh sach theo ID (loai tru da xoa mem)
   *      2. Khong tim thay → loi RESOURCE_NOT_FOUND
   *      3. Xac minh quyen truy cap corporate cua caller
   *      4. Chuyen ruleJson thanh truong ao roi tra ve
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const p = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!p) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, p.corporateId);
    return withRuleFields(p);
  }

  /**
   * [KO] 새 식권 정책 생성
   *      단계별 흐름:
   *      1. assertCorporateScope: caller가 해당 기업에 접근 가능한지 검증
   *      2. withTargetCorporate: 대상 기업 컨텍스트 생성
   *      3. requireCapability('MEAL_TICKET'): 기업에 식권 기능이 활성화되어 있는지 확인
   *      4. require('corporate.policy.write'): 정책 쓰기 RBAC 권한 확인
   *      5. DB에 DRAFT 상태로 정책 생성 (ruleJson은 buildRuleJson으로 조립)
   *      6. 생성된 row에 ruleJson 가상 필드를 합쳐서 반환
   *
   *      생성된 정책은 항상 DRAFT 상태입니다. ACTIVE로 바꾸려면 publish()를 호출해야 합니다.
   *
   * [VI] Tao chinh sach phieu an moi
   *      Quy trinh tung buoc:
   *      1. assertCorporateScope: xac minh caller co quyen truy cap doanh nghiep
   *      2. withTargetCorporate: tao context doanh nghiep muc tieu
   *      3. requireCapability('MEAL_TICKET'): kiem tra doanh nghiep da bat tinh nang phieu an
   *      4. require('corporate.policy.write'): kiem tra quyen RBAC ghi chinh sach
   *      5. Tao chinh sach trang thai DRAFT trong DB (ruleJson duoc ghep boi buildRuleJson)
   *      6. Tra ve row da tao kem cac truong ao ruleJson
   *
   *      Chinh sach moi luon o trang thai DRAFT. Goi publish() de chuyen sang ACTIVE.
   */
  async create(ctx: MealCallerCtx, input: CreateMealPolicyInput) {
    assertCorporateScope(ctx, input.corporateId);
    const targetCtx = withTargetCorporate(ctx, input.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    const row = await this.prisma.mealPolicy.create({
      data: {
        corporateId: input.corporateId,
        policyCode: input.policyCode,
        policyName: input.policyName,
        appliesToDepartmentIds: input.appliesToDepartmentIds,
        appliesToRoleCodes: input.appliesToRoleCodes,
        ruleJson: buildRuleJson(input),
        maxPerTransactionVnd: input.maxPerTransactionVnd,
        dailyLimitVnd: input.dailyLimitVnd,
        allowSplitPayment: input.allowSplitPayment,
        status: 'DRAFT',
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
    return withRuleFields(row);
  }

  /**
   * [KO] 기존 정책 부분 수정 (PATCH 방식)
   *      단계별 흐름:
   *      1. ID로 기존 정책 조회 (없으면 RESOURCE_NOT_FOUND)
   *      2. assertCorporateScope: 기업 접근 권한 검증
   *      3. requireCapability + require: entitlement/RBAC 검증
   *      4. 기존 ruleJson과 새로 전달된 규칙 필드를 병합 (merge)
   *         - input에 전달된 필드는 새 값으로 교체
   *         - input에 없는(undefined) 필드는 기존 값 유지
   *      5. DB 업데이트 (전달된 필드만 조건부 spread)
   *      6. 업데이트된 row에 ruleJson 가상 필드를 합쳐서 반환
   *
   * [VI] Cap nhat mot phan chinh sach (kieu PATCH)
   *      Quy trinh tung buoc:
   *      1. Truy van chinh sach theo ID (khong tim thay → RESOURCE_NOT_FOUND)
   *      2. assertCorporateScope: xac minh quyen truy cap doanh nghiep
   *      3. requireCapability + require: xac minh entitlement/RBAC
   *      4. Merge ruleJson cu voi cac truong quy tac moi:
   *         - Truong duoc gui → thay the bang gia tri moi
   *         - Truong khong gui (undefined) → giu nguyen gia tri cu
   *      5. Cap nhat DB (chi spread cac truong duoc gui)
   *      6. Tra ve row da cap nhat kem cac truong ao ruleJson
   */
  async update(ctx: MealCallerCtx, id: string, input: UpdateMealPolicyInput) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    /**
     * [KO] ruleJson 병합(merge) 로직:
     *      기존 ruleJson을 기반으로, input에 전달된 필드만 덮어씁니다.
     *      예: 기존 ruleJson = { allowedDayOfWeek: [1,2,3,4,5], allowedTimeStart: "06:00" }
     *          input = { allowedTimeStart: "11:00" }
     *          결과 = { allowedDayOfWeek: [1,2,3,4,5], allowedTimeStart: "11:00" }
     *
     * [VI] Logic merge ruleJson:
     *      Dua tren ruleJson hien tai, chi ghi de cac truong duoc gui trong input.
     *      Vi du: ruleJson cu = { allowedDayOfWeek: [1,2,3,4,5], allowedTimeStart: "06:00" }
     *             input = { allowedTimeStart: "11:00" }
     *             ket qua = { allowedDayOfWeek: [1,2,3,4,5], allowedTimeStart: "11:00" }
     */
    const existingRule = parseRuleJson(before.ruleJson);
    const mergedRule: PolicyRuleJson = {
      allowedDayOfWeek: input.allowedDayOfWeek ?? existingRule.allowedDayOfWeek,
      allowedTimeStart: input.allowedTimeStart ?? existingRule.allowedTimeStart,
      allowedTimeEnd: input.allowedTimeEnd ?? existingRule.allowedTimeEnd,
      allowedMealTypes: input.allowedMealTypes ?? existingRule.allowedMealTypes,
      merchantCategoryRestrictions:
        input.merchantCategoryRestrictions ?? existingRule.merchantCategoryRestrictions,
    };

    const row = await this.prisma.mealPolicy.update({
      where: { id },
      data: {
        ...(input.policyName != null && { policyName: input.policyName }),
        ...(input.appliesToDepartmentIds != null && { appliesToDepartmentIds: input.appliesToDepartmentIds }),
        ...(input.appliesToRoleCodes != null && { appliesToRoleCodes: input.appliesToRoleCodes }),
        ...(input.maxPerTransactionVnd != null && { maxPerTransactionVnd: input.maxPerTransactionVnd }),
        ...(input.dailyLimitVnd != null && { dailyLimitVnd: input.dailyLimitVnd }),
        ...(input.allowSplitPayment != null && { allowSplitPayment: input.allowSplitPayment }),
        ...(input.effectiveFrom != null && { effectiveFrom: input.effectiveFrom }),
        ...(input.effectiveTo !== undefined && { effectiveTo: input.effectiveTo ?? null }),
        ruleJson: mergedRule as Prisma.InputJsonValue,
      },
    });
    return withRuleFields(row);
  }

  /**
   * [KO] 정책 발행 (DRAFT 또는 PAUSED → ACTIVE)
   *      - DRAFT/PAUSED 상태에서만 호출 가능
   *      - 그 외 상태에서 호출하면 INVALID_STATUS_TRANSITION 에러
   *      - 발행 후 정책이 직원에게 실제로 적용됩니다
   *
   * [VI] Phat hanh chinh sach (DRAFT hoac PAUSED → ACTIVE)
   *      - Chi goi duoc tu trang thai DRAFT/PAUSED
   *      - Goi tu trang thai khac → loi INVALID_STATUS_TRANSITION
   *      - Sau khi phat hanh, chinh sach thuc su ap dung cho nhan vien
   */
  async publish(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    if (before.status !== 'DRAFT' && before.status !== 'PAUSED') {
      throw new DomainError({ code: 'INVALID_STATUS_TRANSITION', params: { from: before.status, to: 'ACTIVE' } });
    }
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    const row = await this.prisma.mealPolicy.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    return withRuleFields(row);
  }

  /**
   * [KO] 정책 일시 중지 (ACTIVE → PAUSED)
   *      - ACTIVE 상태에서만 호출 가능
   *      - 일시 중지된 정책은 직원에게 적용되지 않습니다
   *      - 다시 publish()로 ACTIVE 복구 가능
   *
   * [VI] Tam dung chinh sach (ACTIVE → PAUSED)
   *      - Chi goi duoc tu trang thai ACTIVE
   *      - Chinh sach tam dung se khong ap dung cho nhan vien
   *      - Co the phuc hoi ACTIVE bang publish()
   */
  async pause(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    if (before.status !== 'ACTIVE') {
      throw new DomainError({ code: 'INVALID_STATUS_TRANSITION', params: { from: before.status, to: 'PAUSED' } });
    }
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    const row = await this.prisma.mealPolicy.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
    return withRuleFields(row);
  }

  /**
   * [KO] 정책 비활성화 (어떤 상태든 → EXPIRED)
   *      - 모든 상태에서 호출 가능
   *      - 비활성화된 정책은 다시 ACTIVE로 돌릴 수 없음 (publish 불가)
   *      - 완전히 종료된 정책에 사용
   *
   * [VI] Vo hieu hoa chinh sach (bat ky trang thai nao → EXPIRED)
   *      - Goi duoc tu moi trang thai
   *      - Chinh sach EXPIRED khong the chuyen lai ACTIVE (khong the publish)
   *      - Dung cho chinh sach da ket thuc hoan toan
   */
  async deactivate(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    const row = await this.prisma.mealPolicy.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });
    return withRuleFields(row);
  }

  /**
   * [KO] 정책 소프트 삭제 (deletedAt 타임스탬프 설정 + 상태를 DELETED로 변경)
   *      - 실제로 DB에서 삭제하지 않고, deletedAt과 status만 변경
   *      - 삭제된 정책은 모든 조회에서 제외됨 (where: { deletedAt: null })
   *      - 성공 시 true 반환
   *
   * [VI] Xoa mem chinh sach (dat deletedAt + doi trang thai thanh DELETED)
   *      - Khong thuc su xoa khoi DB, chi cap nhat deletedAt va status
   *      - Chinh sach da xoa bi loai khoi tat ca truy van (where: { deletedAt: null })
   *      - Tra ve true khi thanh cong
   */
  async softDelete(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    await this.prisma.mealPolicy.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
    return true;
  }

  /**
   * [KO] 정책 평가 - 직원의 결제 시점에 적용 가능한 정책을 찾아 평가
   *
   *      이 메서드는 시스템 내부 호출 전용입니다 (transaction service에서 사용).
   *      호출 컨텍스트가 시스템(트랜잭션 평가)이므로 caller scope 검증을 생략합니다.
   *
   *      단계별 흐름:
   *      1단계: 직원 정보 조회
   *        - employeeId로 MealEmployee 레코드 조회
   *        - 직원이 없으면 null 반환 (결제 거부)
   *
   *      2단계: 후보 정책 목록 조회
   *        - 해당 직원의 기업(corporateId)에 속한 정책 중:
   *          a) status가 ACTIVE인 것만
   *          b) 소프트 삭제되지 않은 것만
   *          c) effectiveFrom <= now (이미 시작된 것)
   *          d) effectiveTo가 null이거나 >= now (아직 만료되지 않은 것)
   *        - effectiveFrom 내림차순 정렬 (최신 정책 우선)
   *
   *      3단계: 정책 매칭 (우선순위)
   *        - 1순위: 직원의 부서ID가 appliesToDepartmentIds에 포함된 정책
   *        - 2순위: appliesToDepartmentIds가 빈 배열인 정책 (전체 부서 대상 = fallback)
   *        - 3순위: 후보 목록의 첫 번째 정책 (최신 정책)
   *        - 아무것도 없으면 null 반환
   *
   *      4단계: 요일 검증
   *        - JS Date.getDay() 기준: 0=일, 1=월, 2=화, ..., 6=토
   *        - 정책의 allowedDayOfWeek에 오늘 요일이 포함되는지 확인
   *        - 기본값: [1,2,3,4,5] (평일)
   *
   *      5단계: 시간대 검증
   *        - 현재 시각을 HH:mm 형식으로 변환 (예: "13:45")
   *        - allowedTimeStart~allowedTimeEnd 범위 안에 있는지 문자열 비교
   *        - 기본값: "06:00"~"22:00"
   *
   *      6단계: 결과 반환
   *        - policyId: 매칭된 정책 ID
   *        - dailyLimitVnd: 일일 한도
   *        - maxPerTransactionVnd: 1회 한도
   *        - allowSplitPayment: 분할 결제 허용 여부
   *        - isTimeWindowValid: 요일 + 시간대 검증 통과 여부
   *        - allowedMerchantCategoryIds: 허용된 가맹점 카테고리 목록
   *
   * [VI] Danh gia chinh sach - tim va danh gia chinh sach phu hop tai thoi diem thanh toan
   *
   *      Phuong thuc nay chi danh cho he thong goi noi bo (dung trong transaction service).
   *      Vi context la he thong (danh gia giao dich), bo qua xac minh scope caller.
   *
   *      Quy trinh tung buoc:
   *      Buoc 1: Truy van thong tin nhan vien
   *        - Tim MealEmployee theo employeeId
   *        - Khong tim thay → tra ve null (tu choi thanh toan)
   *
   *      Buoc 2: Truy van danh sach chinh sach ung vien
   *        - Trong cac chinh sach cua doanh nghiep (corporateId) cua nhan vien:
   *          a) Chi status ACTIVE
   *          b) Chua bi xoa mem
   *          c) effectiveFrom <= now (da bat dau)
   *          d) effectiveTo la null hoac >= now (chua het han)
   *        - Sap xep giam dan theo effectiveFrom (chinh sach moi nhat truoc)
   *
   *      Buoc 3: Matching chinh sach (thu tu uu tien)
   *        - Uu tien 1: chinh sach co phong ban cua nhan vien trong appliesToDepartmentIds
   *        - Uu tien 2: chinh sach co appliesToDepartmentIds rong (toan bo phong ban = du phong)
   *        - Uu tien 3: chinh sach dau tien trong danh sach (moi nhat)
   *        - Khong co → tra ve null
   *
   *      Buoc 4: Kiem tra ngay trong tuan
   *        - JS Date.getDay(): 0=CN, 1=T2, 2=T3, ..., 6=T7
   *        - Kiem tra ngay hien tai co trong allowedDayOfWeek
   *        - Mac dinh: [1,2,3,4,5] (ngay lam viec)
   *
   *      Buoc 5: Kiem tra khung gio
   *        - Chuyen gio hien tai sang HH:mm (vi du: "13:45")
   *        - So sanh chuoi voi allowedTimeStart~allowedTimeEnd
   *        - Mac dinh: "06:00"~"22:00"
   *
   *      Buoc 6: Tra ve ket qua
   *        - policyId: ID chinh sach phu hop
   *        - dailyLimitVnd: han muc ngay
   *        - maxPerTransactionVnd: han muc moi giao dich
   *        - allowSplitPayment: cho phep chia thanh toan
   *        - isTimeWindowValid: ket qua kiem tra ngay + gio
   *        - allowedMerchantCategoryIds: danh sach danh muc cua hang cho phep
   */
  async evaluateForEmployee(
    employeeId: string,
    now: Date,
  ): Promise<{
    policyId: string;
    dailyLimitVnd: bigint;
    maxPerTransactionVnd: bigint;
    allowSplitPayment: boolean;
    isTimeWindowValid: boolean;
    allowedMerchantCategoryIds: string[];
  } | null> {
    /* [KO] 1단계: 직원 조회 / [VI] Buoc 1: Truy van nhan vien */
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) return null;

    /* [KO] 2단계: 후보 정책 목록 조회 / [VI] Buoc 2: Truy van danh sach chinh sach ung vien */
    const candidates = await this.prisma.mealPolicy.findMany({
      where: {
        corporateId: employee.corporateId,
        status: 'ACTIVE',
        deletedAt: null,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    /*
     * [KO] 3단계: 정책 매칭 (부서 → fallback → 최신)
     * [VI] Buoc 3: Matching chinh sach (phong ban → du phong → moi nhat)
     */
    const matchingDept = employee.departmentId
      ? candidates.find((p) =>
          p.appliesToDepartmentIds.includes(employee.departmentId as string),
        )
      : undefined;
    const fallback = candidates.find((p) => p.appliesToDepartmentIds.length === 0);
    const chosen = matchingDept ?? fallback ?? candidates[0];
    if (!chosen) return null;

    const rule = parseRuleJson(chosen.ruleJson);

    /* [KO] 4단계: 요일 검증 - JS getDay() → 0=일,1=월,...,6=토 */
    /* [VI] Buoc 4: Kiem tra ngay - JS getDay() → 0=CN,1=T2,...,6=T7 */
    const dayOfWeek = now.getDay();
    const allowedDays = rule.allowedDayOfWeek ?? [1, 2, 3, 4, 5];
    const isDayAllowed = allowedDays.includes(dayOfWeek);

    /* [KO] 5단계: 시간 검증 - HH:mm 문자열 범위 비교 */
    /* [VI] Buoc 5: Kiem tra gio - so sanh chuoi HH:mm */
    const timeStart = rule.allowedTimeStart ?? '06:00';
    const timeEnd = rule.allowedTimeEnd ?? '22:00';
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isTimeInRange = hhmm >= timeStart && hhmm <= timeEnd;

    /* [KO] 6단계: 결과 반환 / [VI] Buoc 6: Tra ve ket qua */
    return {
      policyId: chosen.id,
      dailyLimitVnd: chosen.dailyLimitVnd,
      maxPerTransactionVnd: chosen.maxPerTransactionVnd,
      allowSplitPayment: chosen.allowSplitPayment,
      isTimeWindowValid: isDayAllowed && isTimeInRange,
      allowedMerchantCategoryIds: rule.merchantCategoryRestrictions ?? [],
    };
  }
}
