/**
 * [KO] 식권 가맹점 수수료율(Commission Rate) 모델
 *      Enrollment(가맹점 등록)에 연결된 수수료율 설정을 표현하는 GraphQL 응답 모델입니다.
 *      하나의 Enrollment 에 기간별로 여러 수수료율 레코드가 존재할 수 있으며,
 *      특정 시점에 유효한 레코드를 getActiveCommissionRate() 로 조회합니다.
 *
 *      수수료율 필드 설명:
 *        - baseRatePct         : 기본 수수료율(%). 모든 가맹점에 공통 적용.
 *                                 예: 3.5 이면 거래 금액의 3.5% 를 플랫폼이 수수료로 차감.
 *        - specialZoneRatePct  : 특별 구역 수수료율(%). 공단·특수지역 등 정부 지원 구역의
 *                                 가맹점에 적용되는 할인/할증 수수료율. null 이면 미적용.
 *                                 예: 산업단지 내 식당에 1.5% 우대 수수료를 적용할 때 사용.
 *        - franchiseFlatRatePct: 프랜차이즈 고정 수수료율(%). 프랜차이즈 본사와 협의된
 *                                 브랜드 전체 균일 수수료율. null 이면 미적용.
 *                                 예: 대형 프랜차이즈가 본사 단위로 2.0% 균일 수수료 계약.
 *
 *      적용 우선순위: franchiseFlatRatePct > specialZoneRatePct > baseRatePct
 *      (정산 시 더 구체적인 수수료율이 우선 적용됩니다)
 *
 * [VI] Model tỷ lệ hoa hồng (Commission Rate) merchant phiếu ăn
 *      Model GraphQL biểu diễn cài đặt hoa hồng gắn với Enrollment (đăng ký merchant).
 *      Một Enrollment có thể có nhiều bản ghi hoa hồng theo từng giai đoạn,
 *      bản ghi hiệu lực tại thời điểm cụ thể được truy vấn qua getActiveCommissionRate().
 *
 *      Giải thích các trường hoa hồng:
 *        - baseRatePct         : Tỷ lệ hoa hồng cơ bản (%). Áp dụng chung cho tất cả merchant.
 *                                 Ví dụ: 3.5 nghĩa là nền tảng khấu trừ 3.5% trên mỗi giao dịch.
 *        - specialZoneRatePct  : Tỷ lệ hoa hồng vùng đặc biệt (%). Áp dụng cho merchant trong
 *                                 khu công nghiệp hoặc vùng được chính phủ hỗ trợ. null = không áp dụng.
 *                                 Ví dụ: nhà hàng trong KCN được ưu đãi 1.5%.
 *        - franchiseFlatRatePct: Tỷ lệ hoa hồng cố định franchise (%). Tỷ lệ đồng nhất được
 *                                 thỏa thuận với trụ sở franchise. null = không áp dụng.
 *                                 Ví dụ: chuỗi franchise lớn ký hợp đồng 2.0% đồng nhất.
 *
 *      Thứ tự ưu tiên: franchiseFlatRatePct > specialZoneRatePct > baseRatePct
 */
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantCommissionRateModel {
  /** [KO] 수수료율 레코드 고유 ID / [VI] ID duy nhất bản ghi hoa hồng */
  @Field(() => ID) id!: string;

  /** [KO] 연결된 가맹점 등록 ID / [VI] ID enrollment liên kết */
  @Field() enrollmentId!: string;

  /** [KO] 수수료율 적용 시작일 / [VI] Ngày bắt đầu hiệu lực hoa hồng */
  @Field() effectiveFrom!: Date;

  /**
   * [KO] 수수료율 적용 종료일. null 이면 무기한 적용(현재 유효).
   * [VI] Ngày kết thúc hiệu lực. null = áp dụng vô thời hạn (đang hiệu lực).
   */
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;

  /**
   * [KO] 기본 수수료율(%). 모든 거래에 적용되는 기본 비율.
   *      예: 3.5 = 거래 금액의 3.5%
   * [VI] Tỷ lệ hoa hồng cơ bản (%). Áp dụng cho mọi giao dịch.
   *      Ví dụ: 3.5 = 3.5% giá trị giao dịch.
   */
  @Field(() => Float) baseRatePct!: number;

  /**
   * [KO] 특별 구역 수수료율(%). 공단/특수지역 가맹점에만 적용. null 이면 미해당.
   * [VI] Tỷ lệ hoa hồng vùng đặc biệt (%). Chỉ áp dụng cho merchant KCN/vùng đặc biệt. null = không áp dụng.
   */
  @Field(() => Float, { nullable: true }) specialZoneRatePct?: number | null;

  /**
   * [KO] 프랜차이즈 고정 수수료율(%). 프랜차이즈 본사 단위 균일 계약 비율. null 이면 미해당.
   * [VI] Tỷ lệ hoa hồng cố định franchise (%). Tỷ lệ đồng nhất theo hợp đồng trụ sở. null = không áp dụng.
   */
  @Field(() => Float, { nullable: true }) franchiseFlatRatePct?: number | null;

  /** [KO] 레코드 생성 일시 / [VI] Ngày giờ tạo bản ghi */
  @Field() createdAt!: Date;
}
