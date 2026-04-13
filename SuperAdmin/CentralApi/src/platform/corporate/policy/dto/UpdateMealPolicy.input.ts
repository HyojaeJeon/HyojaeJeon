/**
 * [KO] 식권 정책 수정 입력(Input) DTO
 *
 * 기존 식권 정책을 부분 수정할 때 클라이언트가 보내는 GraphQL Input 타입입니다.
 * 모든 필드가 optional(nullable)이며, 전달된 필드만 업데이트됩니다 (PATCH 방식).
 *
 * 예시 시나리오:
 * - 한도만 변경: { maxPerTransactionVnd: 300000n }
 * - 시간대만 변경: { allowedTimeStart: "11:30", allowedTimeEnd: "13:30" }
 * - 부서 적용 대상 변경: { appliesToDepartmentIds: ["dept-new"] }
 *
 * ruleJson 가상 필드(allowedDayOfWeek 등)는 전달된 값만 기존 ruleJson에 병합(merge)됩니다.
 * 전달하지 않은 규칙은 기존 값을 유지합니다.
 *
 * [VI] DTO Input cap nhat chinh sach phieu an
 *
 * Kieu GraphQL Input ma client gui khi cap nhat mot phan chinh sach phieu an.
 * Tat ca cac truong deu la optional (nullable), chi cap nhat cac truong duoc gui (kieu PATCH).
 *
 * Vi du:
 * - Chi thay doi han muc: { maxPerTransactionVnd: 300000n }
 * - Chi thay doi khung gio: { allowedTimeStart: "11:30", allowedTimeEnd: "13:30" }
 * - Thay doi phong ban ap dung: { appliesToDepartmentIds: ["dept-new"] }
 *
 * Cac truong ao ruleJson (allowedDayOfWeek, v.v.) duoc merge voi ruleJson hien tai.
 * Truong khong gui se giu nguyen gia tri cu.
 */
import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * [KO] 식권 정책 부분 수정용 GraphQL InputType (모든 필드 선택적)
 * [VI] GraphQL InputType de cap nhat mot phan chinh sach phieu an (tat ca truong tuy chon)
 */
@InputType()
export class UpdateMealPolicyInput {
  /**
   * [KO] 정책 이름 변경 (선택)
   *      예: "2024년 임원 점심 정책 (수정)"
   * [VI] Thay doi ten chinh sach (tuy chon)
   *      Vi du: "Chinh sach an trua quan ly 2024 (cap nhat)"
   */
  @Field({ nullable: true }) @IsOptional() @IsString() policyName?: string;

  /**
   * [KO] 적용 대상 부서 ID 목록 변경 (선택)
   *      전달하면 기존 목록을 완전히 대체합니다 (배열 merge 아님)
   * [VI] Thay doi danh sach ID phong ban (tuy chon)
   *      Khi gui se thay the hoan toan danh sach cu (khong merge mang)
   */
  @Field(() => [String], { nullable: true }) @IsOptional() appliesToDepartmentIds?: string[];

  /**
   * [KO] 적용 대상 직급 코드 목록 변경 (선택)
   *      전달하면 기존 목록을 완전히 대체합니다
   * [VI] Thay doi danh sach ma chuc vu (tuy chon)
   *      Khi gui se thay the hoan toan danh sach cu
   */
  @Field(() => [String], { nullable: true }) @IsOptional() appliesToRoleCodes?: string[];

  /**
   * [KO] 1회 결제 최대 한도 VND 변경 (선택)
   *      예: 300000n → 1회 최대 300,000 VND로 변경
   * [VI] Thay doi han muc toi da moi giao dich VND (tuy chon)
   *      Vi du: 300000n → thay doi thanh toi da 300.000 VND moi lan
   */
  @Field(() => GraphQLBigInt, { nullable: true }) @IsOptional() maxPerTransactionVnd?: bigint;

  /**
   * [KO] 일일 총 사용 한도 VND 변경 (선택)
   *      예: 600000n → 일일 한도 600,000 VND로 변경
   * [VI] Thay doi han muc tong moi ngay VND (tuy chon)
   *      Vi du: 600000n → thay doi thanh toi da 600.000 VND moi ngay
   */
  @Field(() => GraphQLBigInt, { nullable: true }) @IsOptional() dailyLimitVnd?: bigint;

  /**
   * [KO] 분할 결제 허용 여부 변경 (선택)
   * [VI] Thay doi cho phep chia thanh toan (tuy chon)
   */
  @Field({ nullable: true }) @IsOptional() @IsBoolean() allowSplitPayment?: boolean;

  /**
   * [KO] 정책 시작일 변경 (선택)
   * [VI] Thay doi ngay bat dau chinh sach (tuy chon)
   */
  @Field({ nullable: true }) @IsOptional() effectiveFrom?: Date;

  /**
   * [KO] 정책 종료일 변경 (선택, null 전달 시 무기한으로 변경)
   * [VI] Thay doi ngay ket thuc chinh sach (tuy chon, gui null = vo thoi han)
   */
  @Field(() => Date, { nullable: true }) @IsOptional() effectiveTo?: Date | null;

  /*───────────────────────────────────────────────────────────────────────────
   * [KO] ruleJson 가상 필드 (선택)
   *      전달된 필드만 기존 ruleJson에 병합됩니다.
   *      예: allowedTimeStart만 보내면 → allowedTimeStart만 변경,
   *          나머지 ruleJson 값(allowedDayOfWeek 등)은 기존 값 유지
   *
   * [VI] Truong ao ruleJson (tuy chon)
   *      Chi merge cac truong duoc gui vao ruleJson hien tai.
   *      Vi du: chi gui allowedTimeStart → chi thay doi allowedTimeStart,
   *             cac gia tri khac (allowedDayOfWeek, v.v.) giu nguyen
   *───────────────────────────────────────────────────────────────────────────*/

  /**
   * [KO] 허용 요일 변경 (선택)
   *      예: [1,2,3,4,5,6] → 토요일까지 포함하도록 변경
   * [VI] Thay doi ngay trong tuan cho phep (tuy chon)
   *      Vi du: [1,2,3,4,5,6] → them thu 7
   */
  @Field(() => [Int], { nullable: true }) @IsOptional() allowedDayOfWeek?: number[];

  /**
   * [KO] 허용 시간 시작 변경 (선택, HH:mm)
   *      예: "11:30" → 오전 11시 30분부터로 변경
   * [VI] Thay doi gio bat dau cho phep (tuy chon, HH:mm)
   *      Vi du: "11:30" → thay doi bat dau tu 11 gio 30
   */
  @Field({ nullable: true }) @IsOptional() @IsString() allowedTimeStart?: string;

  /**
   * [KO] 허용 시간 종료 변경 (선택, HH:mm)
   *      예: "13:30" → 오후 1시 30분까지로 변경
   * [VI] Thay doi gio ket thuc cho phep (tuy chon, HH:mm)
   *      Vi du: "13:30" → thay doi ket thuc luc 13 gio 30
   */
  @Field({ nullable: true }) @IsOptional() @IsString() allowedTimeEnd?: string;

  /**
   * [KO] 허용 식사 유형 변경 (선택)
   *      예: ["LUNCH"] → 점심만 허용하도록 변경
   * [VI] Thay doi loai bua an cho phep (tuy chon)
   *      Vi du: ["LUNCH"] → chi cho phep an trua
   */
  @Field(() => [String], { nullable: true }) @IsOptional() allowedMealTypes?: string[];

  /**
   * [KO] 가맹점 카테고리 제한 변경 (선택)
   *      예: ["KOREAN"] → 한식 가맹점만 허용하도록 변경
   * [VI] Thay doi gioi han danh muc cua hang (tuy chon)
   *      Vi du: ["KOREAN"] → chi cho phep nha hang Han Quoc
   */
  @Field(() => [String], { nullable: true }) @IsOptional() merchantCategoryRestrictions?: string[];
}
