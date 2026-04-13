/**
 * [KO] 식권 정책(MealPolicy) GraphQL 응답 모델
 *
 * 기업(Corporate)이 직원에게 적용하는 식권 사용 정책의 조회 결과를 정의합니다.
 * DB의 MealPolicy 테이블과 1:1로 대응하며, ruleJson 컬럼에 저장된 세부 규칙을
 * 가상 필드(allowedDayOfWeek, allowedTimeStart 등)로 풀어서 클라이언트에 제공합니다.
 *
 * 주요 개념:
 * - 정책 1개는 특정 부서(appliesToDepartmentIds) 또는 직급(appliesToRoleCodes)에 적용됩니다.
 * - 1회 결제 한도(maxPerTransactionVnd)와 일일 한도(dailyLimitVnd)로 지출을 통제합니다.
 * - ruleJson 안에 시간대, 요일, 식사 유형, 가맹점 카테고리 제한이 들어 있습니다.
 *
 * [VI] Mô hinh GraphQL phan hoi cho chinh sach phieu an (MealPolicy)
 *
 * Dinh nghia ket qua truy van chinh sach su dung phieu an ma doanh nghiep (Corporate)
 * ap dung cho nhan vien. Tuong ung 1:1 voi bang MealPolicy trong DB, va cac quy tac
 * chi tiet luu trong cot ruleJson duoc trich xuat thanh cac truong ao
 * (allowedDayOfWeek, allowedTimeStart, v.v.) de cung cap cho client.
 *
 * Khai niem chinh:
 * - Moi chinh sach ap dung cho phong ban (appliesToDepartmentIds) hoac chuc vu (appliesToRoleCodes).
 * - Han muc moi giao dich (maxPerTransactionVnd) va han muc ngay (dailyLimitVnd) kiem soat chi tieu.
 * - Ben trong ruleJson chua cac rang buoc: khung gio, ngay trong tuan, loai bua an, danh muc cua hang.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

/**
 * [KO] MealPolicy GraphQL ObjectType - 클라이언트에 반환되는 정책 모델
 * [VI] MealPolicy GraphQL ObjectType - mo hinh chinh sach tra ve cho client
 */
@ObjectType()
export class MealPolicyModel {
  /**
   * [KO] 정책 고유 ID (UUID)
   * [VI] ID duy nhat cua chinh sach (UUID)
   */
  @Field(() => ID) id!: string;

  /**
   * [KO] 이 정책이 속한 기업(Corporate)의 ID
   *      예: 삼성전자 법인 ID, Vingroup 법인 ID
   * [VI] ID cua doanh nghiep (Corporate) so huu chinh sach nay
   *      Vi du: ID cua Samsung, Vingroup
   */
  @Field() corporateId!: string;

  /**
   * [KO] 정책 코드 - 기업 내에서 정책을 구분하는 고유 식별 코드
   *      예: "MEAL-STD-2024", "MEAL-VIP-2024"
   * [VI] Ma chinh sach - ma dinh danh duy nhat trong doanh nghiep
   *      Vi du: "MEAL-STD-2024", "MEAL-VIP-2024"
   */
  @Field() policyCode!: string;

  /**
   * [KO] 정책 이름 - 사람이 읽기 쉬운 정책명
   *      예: "일반 직원 점심 정책", "임원 식대 정책"
   * [VI] Ten chinh sach - ten de doc cho nguoi dung
   *      Vi du: "Chinh sach an trua nhan vien", "Chinh sach an quan ly"
   */
  @Field() policyName!: string;

  /**
   * [KO] 적용 대상 부서 ID 목록
   *      빈 배열이면 전체 부서에 적용 (fallback 정책)
   *      예: ["dept-001", "dept-002"] → 개발팀, 마케팅팀에만 적용
   * [VI] Danh sach ID phong ban ap dung
   *      Mang rong = ap dung cho tat ca phong ban (chinh sach du phong)
   *      Vi du: ["dept-001", "dept-002"] → chi ap dung cho phong Dev, Marketing
   */
  @Field(() => [String]) appliesToDepartmentIds!: string[];

  /**
   * [KO] 적용 대상 직급 코드 목록
   *      예: ["STAFF", "MANAGER"] → 일반직원, 매니저에게 적용
   * [VI] Danh sach ma chuc vu ap dung
   *      Vi du: ["STAFF", "MANAGER"] → ap dung cho nhan vien, quan ly
   */
  @Field(() => [String]) appliesToRoleCodes!: string[];

  /**
   * [KO] 1회 결제 최대 한도 (VND, 베트남 동)
   *      예: 200000n → 1회 식사에 최대 200,000 VND (약 11,000원)까지 사용 가능
   * [VI] Han muc toi da moi giao dich (VND)
   *      Vi du: 200000n → toi da 200.000 VND cho moi lan thanh toan
   */
  @Field(() => GraphQLBigInt) maxPerTransactionVnd!: bigint;

  /**
   * [KO] 일일 총 사용 한도 (VND)
   *      예: 500000n → 하루에 총 500,000 VND까지 사용 가능 (점심+저녁 합산)
   * [VI] Han muc tong su dung trong ngay (VND)
   *      Vi du: 500000n → toi da 500.000 VND moi ngay (trua + toi cong lai)
   */
  @Field(() => GraphQLBigInt) dailyLimitVnd!: bigint;

  /**
   * [KO] 분할 결제 허용 여부
   *      true = 한 번의 식사를 회사 지원금 + 개인 지갑으로 나눠 결제 가능
   *      false = 회사 지원금만으로 결제해야 함 (한도 초과 시 결제 거부)
   * [VI] Cho phep thanh toan chia nho (split payment)
   *      true = co the chia thanh toan giua tro cap cong ty + vi ca nhan
   *      false = chi dung tro cap cong ty (tu choi neu vuot han muc)
   */
  @Field() allowSplitPayment!: boolean;

  /**
   * [KO] 정책 상태
   *      상태 전이: DRAFT → ACTIVE ↔ PAUSED → EXPIRED → DELETED
   *      - DRAFT: 초안 (아직 미적용)
   *      - ACTIVE: 활성 (현재 직원에게 적용 중)
   *      - PAUSED: 일시 중지 (관리자가 임시로 비활성화)
   *      - EXPIRED: 만료 (관리자가 비활성화)
   *      - DELETED: 소프트 삭제됨
   * [VI] Trang thai chinh sach
   *      Chuyen trang thai: DRAFT → ACTIVE ↔ PAUSED → EXPIRED → DELETED
   *      - DRAFT: ban nhap (chua ap dung)
   *      - ACTIVE: dang hoat dong (dang ap dung cho nhan vien)
   *      - PAUSED: tam dung (quan tri vien vo hieu hoa tam thoi)
   *      - EXPIRED: het han (quan tri vien vo hieu hoa)
   *      - DELETED: da xoa mem
   */
  @Field() status!: string;

  /**
   * [KO] 정책 시작일 - 이 날짜부터 정책이 유효합니다
   *      예: 2024-01-01 → 2024년 1월 1일부터 적용 시작
   * [VI] Ngay bat dau chinh sach - chinh sach co hieu luc tu ngay nay
   *      Vi du: 2024-01-01 → bat dau ap dung tu ngay 1 thang 1 nam 2024
   */
  @Field() effectiveFrom!: Date;

  /**
   * [KO] 정책 종료일 (nullable) - null이면 무기한 유효
   *      예: 2024-12-31 → 2024년 12월 31일에 자동 만료
   * [VI] Ngay ket thuc chinh sach (nullable) - null nghia la vo thoi han
   *      Vi du: 2024-12-31 → tu dong het han vao ngay 31 thang 12 nam 2024
   */
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;

  /*───────────────────────────────────────────────────────────────────────────
   * [KO] ruleJson 가상 필드들
   *      DB에는 ruleJson(JSON 컬럼) 하나에 저장되지만,
   *      GraphQL 응답에서는 각각 별도 필드로 풀어서 제공합니다.
   *
   *      ruleJson 저장 예시:
   *      {
   *        "allowedDayOfWeek": [1, 2, 3, 4, 5],    // 월~금만 허용
   *        "allowedTimeStart": "11:00",              // 오전 11시부터
   *        "allowedTimeEnd": "14:00",                // 오후 2시까지
   *        "allowedMealTypes": ["LUNCH", "DINNER"],  // 점심, 저녁만
   *        "merchantCategoryRestrictions": ["KOREAN", "VIETNAMESE"]  // 한식, 베트남 음식점만
   *      }
   *
   * [VI] Cac truong ao tu ruleJson
   *      Trong DB luu thanh mot cot ruleJson (JSON), nhung trong GraphQL
   *      trich xuat thanh cac truong rieng biet.
   *
   *      Vi du ruleJson:
   *      {
   *        "allowedDayOfWeek": [1, 2, 3, 4, 5],    // chi cho phep thu 2 ~ thu 6
   *        "allowedTimeStart": "11:00",              // tu 11 gio sang
   *        "allowedTimeEnd": "14:00",                // den 2 gio chieu
   *        "allowedMealTypes": ["LUNCH", "DINNER"],  // chi an trua, an toi
   *        "merchantCategoryRestrictions": ["KOREAN", "VIETNAMESE"]  // chi nha hang Han, Viet
   *      }
   *───────────────────────────────────────────────────────────────────────────*/

  /**
   * [KO] 허용 요일 목록 (JS getDay() 기준: 0=일, 1=월, 2=화, ..., 6=토)
   *      예: [1,2,3,4,5] → 월요일~금요일만 식권 사용 가능
   *      예: [1,2,3,4,5,6] → 토요일까지 포함
   *      null이면 제한 없음
   * [VI] Danh sach ngay trong tuan duoc phep (JS getDay(): 0=CN, 1=T2, ..., 6=T7)
   *      Vi du: [1,2,3,4,5] → chi dung phieu an tu thu 2 den thu 6
   *      null = khong gioi han
   */
  @Field(() => [Int], { nullable: true }) allowedDayOfWeek?: number[] | null;

  /**
   * [KO] 허용 시간 시작 (HH:mm 형식)
   *      예: "11:00" → 오전 11시부터 식권 사용 가능
   *      null이면 제한 없음
   * [VI] Gio bat dau cho phep (dinh dang HH:mm)
   *      Vi du: "11:00" → duoc phep dung phieu tu 11 gio
   *      null = khong gioi han
   */
  @Field(() => String, { nullable: true }) allowedTimeStart?: string | null;

  /**
   * [KO] 허용 시간 종료 (HH:mm 형식)
   *      예: "14:00" → 오후 2시까지만 식권 사용 가능
   *      allowedTimeStart="11:00", allowedTimeEnd="14:00" → 점심 시간대만 허용
   *      null이면 제한 없음
   * [VI] Gio ket thuc cho phep (dinh dang HH:mm)
   *      Vi du: "14:00" → chi dung phieu den 14 gio
   *      allowedTimeStart="11:00", allowedTimeEnd="14:00" → chi gio an trua
   *      null = khong gioi han
   */
  @Field(() => String, { nullable: true }) allowedTimeEnd?: string | null;

  /**
   * [KO] 허용 식사 유형 목록
   *      예: ["LUNCH"] → 점심만, ["LUNCH", "DINNER"] → 점심+저녁
   *      null이면 제한 없음
   * [VI] Danh sach loai bua an duoc phep
   *      Vi du: ["LUNCH"] → chi an trua, ["LUNCH", "DINNER"] → trua + toi
   *      null = khong gioi han
   */
  @Field(() => [String], { nullable: true }) allowedMealTypes?: string[] | null;

  /**
   * [KO] 허용 가맹점 카테고리 제한 목록
   *      예: ["KOREAN", "VIETNAMESE", "JAPANESE"] → 한식, 베트남식, 일식 가맹점만 허용
   *      빈 배열이면 모든 카테고리 허용
   *      null이면 제한 없음
   * [VI] Danh sach gioi han danh muc cua hang
   *      Vi du: ["KOREAN", "VIETNAMESE", "JAPANESE"] → chi nha hang Han, Viet, Nhat
   *      Mang rong = cho phep tat ca danh muc
   *      null = khong gioi han
   */
  @Field(() => [String], { nullable: true }) merchantCategoryRestrictions?: string[] | null;

  /**
   * [KO] 레코드 생성 시각
   * [VI] Thoi gian tao ban ghi
   */
  @Field() createdAt!: Date;

  /**
   * [KO] 레코드 최종 수정 시각
   * [VI] Thoi gian cap nhat ban ghi lan cuoi
   */
  @Field() updatedAt!: Date;
}
