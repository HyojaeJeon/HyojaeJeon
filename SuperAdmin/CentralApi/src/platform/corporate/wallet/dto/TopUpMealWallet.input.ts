/**
 * [KO] TopUpMealWallet 입력 DTO — 직원이 개인적으로 지갑에 충전할 때 사용합니다.
 *      PG(결제대행사)를 통한 결제 승인 이후 호출되며,
 *      금액은 personalTopUpVnd 버킷에 적립됩니다.
 *      회사 지원금이 부족할 때 split payment의 자금 원천이 됩니다.
 *
 * [VI] DTO đầu vào TopUpMealWallet — dùng khi nhân viên tự nạp tiền vào ví.
 *      Được gọi sau khi thanh toán qua PG (cổng thanh toán) được chấp thuận.
 *      Số tiền sẽ được nạp vào bucket personalTopUpVnd.
 *      Đây là nguồn vốn cho split payment khi trợ cấp công ty không đủ.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigintValidators';

@InputType()
export class TopUpMealWalletInput {
  /**
   * [KO] 충전할 대상 지갑 ID (UUID)
   * [VI] ID ví đích để nạp tiền (UUID)
   */
  @Field(() => ID) @IsUUID() walletId!: string;

  /**
   * [KO] 충전 금액 (VND) — 반드시 1 이상의 양수여야 합니다.
   *      과도한 금액(DEFAULT_MAX_VND_AMOUNT 초과)도 차단됩니다.
   * [VI] Số tiền nạp (VND) — phải là số dương tối thiểu 1.
   *      Số tiền vượt quá DEFAULT_MAX_VND_AMOUNT cũng bị chặn.
   */
  // P2-4: 개인 충전은 양수 필수, 과도한 금액 차단
  @Field(() => GraphQLBigInt)
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  amountVnd!: bigint;

  /**
   * [KO] PG 결제 참조 ID (선택) — 외부 결제대행사의 거래 번호.
   *      결제 추적 및 환불 시 사용됩니다.
   * [VI] ID tham chiếu thanh toán PG (tùy chọn) — số giao dịch từ cổng thanh toán bên ngoài.
   *      Được sử dụng để theo dõi thanh toán và hoàn tiền.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentReferenceId?: string;
}
