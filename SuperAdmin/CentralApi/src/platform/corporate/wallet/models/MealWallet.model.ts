/**
 * [KO] MealWallet GraphQL 모델 (직원 식권 지갑)
 *      직원 한 명에 하나의 지갑이 발급되며, 잔액은 2-Bucket 구조로 관리됩니다.
 *      - companyAllowanceVnd: 회사가 지원한 금액 (정책에 따라 사용처 제한 가능)
 *      - personalTopUpVnd: 직원이 개인적으로 충전한 금액
 *      - balanceVnd: 위 두 버킷의 합계 (실제 사용 가능 총액)
 *
 * [VI] Model GraphQL MealWallet (ví phiếu ăn nhân viên)
 *      Mỗi nhân viên được cấp một ví duy nhất, số dư được quản lý theo cấu trúc 2-Bucket.
 *      - companyAllowanceVnd: Số tiền công ty trợ cấp (có thể bị giới hạn theo chính sách)
 *      - personalTopUpVnd: Số tiền nhân viên tự nạp thêm
 *      - balanceVnd: Tổng của hai bucket trên (tổng số dư khả dụng)
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealWalletModel {
  /** [KO] 지갑 고유 ID (UUID) / [VI] ID duy nhất của ví (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 소속 법인 ID — 멀티테넌시 스코프 키 / [VI] ID pháp nhân sở hữu — khóa phạm vi multi-tenancy */
  @Field() corporateId!: string;

  /** [KO] 지갑 소유 직원 ID (1:1 관계) / [VI] ID nhân viên sở hữu ví (quan hệ 1:1) */
  @Field() employeeId!: string;

  /**
   * [KO] 지갑 상태 (예: 'ACTIVE', 'SUSPENDED', 'CLOSED')
   * [VI] Trạng thái ví (ví dụ: 'ACTIVE', 'SUSPENDED', 'CLOSED')
   */
  @Field() status!: string;

  /**
   * [KO] 총 잔액 (VND) — companyAllowanceVnd + personalTopUpVnd 의 합계.
   *      결제 시 이 값을 기준으로 잔액 부족 여부를 판단합니다.
   * [VI] Tổng số dư (VND) — tổng của companyAllowanceVnd + personalTopUpVnd.
   *      Khi thanh toán, giá trị này được dùng để kiểm tra đủ số dư hay không.
   */
  @Field(() => GraphQLBigInt) balanceVnd!: bigint;

  /**
   * [KO] 회사 지원금 잔액 (VND) — 회사 정책에 따라 사용처가 제한될 수 있습니다.
   *      예: 점심 식사만 가능, 특정 가맹점만 허용 등.
   * [VI] Số dư trợ cấp công ty (VND) — có thể bị giới hạn nơi sử dụng theo chính sách công ty.
   *      Ví dụ: chỉ dùng cho bữa trưa, chỉ tại cửa hàng được chấp nhận, v.v.
   */
  @Field(() => GraphQLBigInt) companyAllowanceVnd!: bigint;

  /**
   * [KO] 개인 충전 잔액 (VND) — 직원이 직접 충전한 금액.
   *      회사 지원금이 부족할 때 split payment로 사용됩니다.
   * [VI] Số dư nạp cá nhân (VND) — số tiền nhân viên tự nạp.
   *      Được sử dụng khi trợ cấp công ty không đủ thông qua split payment.
   */
  @Field(() => GraphQLBigInt) personalTopUpVnd!: bigint;

  /**
   * [KO] 일일 사용 한도 (VND) — 0이면 한도 없음을 의미합니다.
   * [VI] Giới hạn sử dụng hàng ngày (VND) — 0 nghĩa là không giới hạn.
   */
  @Field(() => GraphQLBigInt) dailyLimitVnd!: bigint;

  /** [KO] 지갑 생성 시각 / [VI] Thời điểm tạo ví */
  @Field() createdAt!: Date;

  /** [KO] 지갑 최종 수정 시각 / [VI] Thời điểm cập nhật ví lần cuối */
  @Field() updatedAt!: Date;
}
