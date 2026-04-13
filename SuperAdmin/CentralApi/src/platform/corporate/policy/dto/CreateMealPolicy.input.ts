/**
 * [KO] 식권 정책 생성 입력(Input) DTO
 *
 * 새 식권 정책을 만들 때 클라이언트가 보내는 GraphQL Input 타입입니다.
 * 정책은 항상 DRAFT 상태로 생성되며, 이후 publish 뮤테이션으로 ACTIVE로 전환합니다.
 *
 * 필수 필드: corporateId, policyCode, policyName, effectiveFrom
 * 선택 필드: 나머지 (각각 합리적인 기본값이 설정됨)
 *
 * 기본값 요약:
 * - appliesToDepartmentIds: [] (전체 부서 적용)
 * - appliesToRoleCodes: [] (전체 직급 적용)
 * - maxPerTransactionVnd: 0 (무제한)
 * - dailyLimitVnd: 0 (무제한)
 * - allowSplitPayment: true (분할 결제 허용)
 * - allowedDayOfWeek: [1,2,3,4,5] (평일만)
 * - allowedTimeStart: "06:00"
 * - allowedTimeEnd: "22:00"
 *
 * [VI] DTO Input tao chinh sach phieu an
 *
 * Kieu GraphQL Input ma client gui khi tao chinh sach phieu an moi.
 * Chinh sach luon duoc tao voi trang thai DRAFT, sau do chuyen sang ACTIVE
 * bang mutation publish.
 *
 * Truong bat buoc: corporateId, policyCode, policyName, effectiveFrom
 * Truong tuy chon: con lai (co gia tri mac dinh hop ly)
 *
 * Gia tri mac dinh:
 * - appliesToDepartmentIds: [] (ap dung tat ca phong ban)
 * - appliesToRoleCodes: [] (ap dung tat ca chuc vu)
 * - maxPerTransactionVnd: 0 (khong gioi han)
 * - dailyLimitVnd: 0 (khong gioi han)
 * - allowSplitPayment: true (cho phep chia thanh toan)
 * - allowedDayOfWeek: [1,2,3,4,5] (chi ngay lam viec)
 * - allowedTimeStart: "06:00"
 * - allowedTimeEnd: "22:00"
 */
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

/**
 * [KO] 식권 정책 생성용 GraphQL InputType
 * [VI] GraphQL InputType de tao chinh sach phieu an
 */
@InputType()
export class CreateMealPolicyInput {
  /**
   * [KO] 정책을 생성할 기업 ID (UUID 형식, 필수)
   *      예: "550e8400-e29b-41d4-a716-446655440000"
   * [VI] ID doanh nghiep can tao chinh sach (dinh dang UUID, bat buoc)
   *      Vi du: "550e8400-e29b-41d4-a716-446655440000"
   */
  @Field(() => ID) @IsUUID() corporateId!: string;

  /**
   * [KO] 정책 코드 - 기업 내 고유 식별 코드 (필수)
   *      예: "MEAL-STD-2024", "MEAL-EXEC-Q1"
   * [VI] Ma chinh sach - ma dinh danh duy nhat trong doanh nghiep (bat buoc)
   *      Vi du: "MEAL-STD-2024", "MEAL-EXEC-Q1"
   */
  @Field() @IsString() policyCode!: string;

  /**
   * [KO] 정책 이름 - 관리자가 구분할 수 있는 이름 (필수)
   *      예: "2024년 일반직원 점심 정책"
   * [VI] Ten chinh sach - ten de quan tri vien phan biet (bat buoc)
   *      Vi du: "Chinh sach an trua nhan vien 2024"
   */
  @Field() @IsString() policyName!: string;

  /**
   * [KO] 적용 대상 부서 ID 목록 (기본값: [] = 전체 부서)
   *      예: ["dept-dev", "dept-mkt"] → 개발팀, 마케팅팀에만 적용
   * [VI] Danh sach ID phong ban ap dung (mac dinh: [] = tat ca phong ban)
   *      Vi du: ["dept-dev", "dept-mkt"] → chi ap dung phong Dev, Marketing
   */
  @Field(() => [String], { defaultValue: [] }) appliesToDepartmentIds!: string[];

  /**
   * [KO] 적용 대상 직급 코드 목록 (기본값: [] = 전체 직급)
   *      예: ["STAFF", "INTERN"] → 일반직원, 인턴에게만 적용
   * [VI] Danh sach ma chuc vu ap dung (mac dinh: [] = tat ca chuc vu)
   *      Vi du: ["STAFF", "INTERN"] → chi ap dung cho nhan vien, thuc tap sinh
   */
  @Field(() => [String], { defaultValue: [] }) appliesToRoleCodes!: string[];

  /**
   * [KO] 1회 결제 최대 한도 VND (기본값: 0n = 무제한)
   *      예: 200000n → 1회 최대 200,000 VND
   * [VI] Han muc toi da moi giao dich VND (mac dinh: 0n = khong gioi han)
   *      Vi du: 200000n → toi da 200.000 VND moi lan
   */
  @Field(() => GraphQLBigInt, { defaultValue: 0n }) maxPerTransactionVnd!: bigint;

  /**
   * [KO] 일일 총 사용 한도 VND (기본값: 0n = 무제한)
   *      예: 500000n → 하루 최대 500,000 VND
   * [VI] Han muc tong moi ngay VND (mac dinh: 0n = khong gioi han)
   *      Vi du: 500000n → toi da 500.000 VND moi ngay
   */
  @Field(() => GraphQLBigInt, { defaultValue: 0n }) dailyLimitVnd!: bigint;

  /**
   * [KO] 분할 결제 허용 여부 (기본값: true)
   *      true = 회사 지원금 + 개인 금액으로 분할 결제 가능
   * [VI] Cho phep chia thanh toan (mac dinh: true)
   *      true = co the chia thanh toan giua tro cap cong ty + tien ca nhan
   */
  @Field({ defaultValue: true }) @IsBoolean() allowSplitPayment!: boolean;

  /**
   * [KO] 정책 시작일 (필수) - 이 날짜부터 정책이 유효
   * [VI] Ngay bat dau chinh sach (bat buoc) - chinh sach co hieu luc tu ngay nay
   */
  @Field() effectiveFrom!: Date;

  /**
   * [KO] 정책 종료일 (선택) - null이면 무기한
   * [VI] Ngay ket thuc chinh sach (tuy chon) - null = vo thoi han
   */
  @Field(() => Date, { nullable: true }) effectiveTo?: Date;

  /*───────────────────────────────────────────────────────────────────────────
   * [KO] ruleJson 에 저장될 시간대/가맹점 규칙 필드들
   *      이 필드들은 DB에 별도 컬럼이 아니라 ruleJson JSON 컬럼 안에 직렬화되어 저장됩니다.
   *      Service 계층의 buildRuleJson() 함수가 이 필드들을 모아서 JSON으로 변환합니다.
   *
   * [VI] Cac truong quy tac thoi gian/cua hang se luu vao ruleJson
   *      Cac truong nay khong phai cot rieng trong DB ma duoc serialize vao cot JSON ruleJson.
   *      Ham buildRuleJson() trong Service se gom cac truong nay thanh JSON.
   *───────────────────────────────────────────────────────────────────────────*/

  /**
   * [KO] 허용 요일 (기본값: [1,2,3,4,5] = 월~금)
   *      JS getDay() 기준: 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
   *      예: [1,2,3,4,5,6] → 토요일까지 포함
   * [VI] Ngay trong tuan duoc phep (mac dinh: [1,2,3,4,5] = thu 2~6)
   *      JS getDay(): 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
   *      Vi du: [1,2,3,4,5,6] → bao gom ca thu 7
   */
  @Field(() => [Int], { defaultValue: [1, 2, 3, 4, 5] }) allowedDayOfWeek!: number[];

  /**
   * [KO] 허용 시간 시작 (기본값: "06:00", HH:mm 형식)
   *      예: "11:00" → 오전 11시부터 사용 가능
   * [VI] Gio bat dau cho phep (mac dinh: "06:00", dinh dang HH:mm)
   *      Vi du: "11:00" → duoc phep tu 11 gio
   */
  @Field({ defaultValue: '06:00' }) @IsString() allowedTimeStart!: string;

  /**
   * [KO] 허용 시간 종료 (기본값: "22:00", HH:mm 형식)
   *      예: "14:00" → 오후 2시까지만 사용 가능
   * [VI] Gio ket thuc cho phep (mac dinh: "22:00", dinh dang HH:mm)
   *      Vi du: "14:00" → chi duoc phep den 14 gio
   */
  @Field({ defaultValue: '22:00' }) @IsString() allowedTimeEnd!: string;

  /**
   * [KO] 허용 식사 유형 (기본값: [] = 제한 없음)
   *      예: ["LUNCH", "DINNER"] → 점심, 저녁만 허용
   * [VI] Loai bua an duoc phep (mac dinh: [] = khong gioi han)
   *      Vi du: ["LUNCH", "DINNER"] → chi an trua va an toi
   */
  @Field(() => [String], { defaultValue: [] }) allowedMealTypes!: string[];

  /**
   * [KO] 가맹점 카테고리 제한 (기본값: [] = 모든 카테고리 허용)
   *      예: ["KOREAN", "VIETNAMESE"] → 한식, 베트남식 가맹점에서만 사용 가능
   * [VI] Gioi han danh muc cua hang (mac dinh: [] = cho phep tat ca)
   *      Vi du: ["KOREAN", "VIETNAMESE"] → chi dung tai nha hang Han, Viet
   */
  @Field(() => [String], { defaultValue: [] }) merchantCategoryRestrictions!: string[];
}
