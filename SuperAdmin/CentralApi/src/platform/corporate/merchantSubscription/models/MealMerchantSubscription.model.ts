/**
 * [KO] MealMerchantSubscription GraphQL 모델
 *      임직원이 특정 가맹점(Branch)의 일일 메뉴 알림을 구독한 레코드를 표현합니다.
 *      구독 단위는 (employeeId, branchId) 쌍이며 식사 유형별(아침/점심/저녁) 알림을 개별 토글합니다.
 *
 * [VI] Model GraphQL MealMerchantSubscription
 *      Biểu diễn bản ghi đăng ký nhận thông báo thực đơn hàng ngày
 *      của nhân viên tại một chi nhánh (Branch) cụ thể.
 *      Đơn vị đăng ký là cặp (employeeId, branchId), toggle thông báo riêng theo loại bữa ăn.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantSubscriptionModel {
  /** [KO] 구독 고유 ID (UUID) / [VI] ID duy nhất của đăng ký (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 구독한 직원 ID / [VI] ID nhân viên đăng ký */
  @Field() employeeId!: string;

  /** [KO] 구독 대상 지점(Branch) ID / [VI] ID chi nhánh đăng ký theo dõi */
  @Field() branchId!: string;

  /** [KO] 구독 활성 여부 / [VI] Trạng thái kích hoạt đăng ký */
  @Field() isActive!: boolean;

  /** [KO] 아침 메뉴 알림 수신 여부 / [VI] Nhận thông báo bữa sáng */
  @Field() notifyBreakfast!: boolean;

  /** [KO] 점심 메뉴 알림 수신 여부 / [VI] Nhận thông báo bữa trưa */
  @Field() notifyLunch!: boolean;

  /** [KO] 저녁 메뉴 알림 수신 여부 / [VI] Nhận thông báo bữa tối */
  @Field() notifyDinner!: boolean;

  /** [KO] 레코드 생성 시각 / [VI] Thời điểm tạo bản ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 시각 / [VI] Thời điểm cập nhật cuối */
  @Field() updatedAt!: Date;
}
