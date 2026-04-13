/**
 * [KO] FundMealWallet 입력 DTO — 회사 지원금을 직원 지갑에 적립할 때 사용합니다.
 *      회사 예산(Funding Account)에서 직원 지갑의 companyAllowanceVnd 버킷으로 금액이 이동합니다.
 *      PREPAID_DEPOSIT 모델에서는 법인 예치금 잔액에서 차감되고,
 *      CREDIT_NET 모델에서는 잔액 검증 없이 외상으로 지급됩니다.
 *
 * [VI] DTO đầu vào FundMealWallet — dùng khi cấp trợ cấp công ty vào ví nhân viên.
 *      Số tiền chuyển từ ngân sách công ty (Funding Account) vào bucket companyAllowanceVnd của ví.
 *      Trong mô hình PREPAID_DEPOSIT, số tiền bị trừ từ khoản ký quỹ pháp nhân.
 *      Trong mô hình CREDIT_NET, cấp trợ cấp mà không cần kiểm tra số dư (ghi nợ).
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
export class FundMealWalletInput {
  /**
   * [KO] 지원금을 적립할 대상 지갑 ID (UUID)
   * [VI] ID ví đích để nạp trợ cấp (UUID)
   */
  @Field(() => ID) @IsUUID() walletId!: string;

  /**
   * [KO] 적립 금액 (VND) — 반드시 1 이상이어야 합니다. 0이나 음수는 거부됩니다.
   *      DEFAULT_MAX_VND_AMOUNT를 초과하는 과도한 금액도 차단됩니다.
   * [VI] Số tiền nạp (VND) — phải tối thiểu 1. Giá trị 0 hoặc âm bị từ chối.
   *      Số tiền vượt quá DEFAULT_MAX_VND_AMOUNT cũng bị chặn.
   */
  // P2-4: 음수 / 0 / 과도한 금액 차단
  @Field(() => GraphQLBigInt)
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  amountVnd!: bigint;

  /**
   * [KO] 일괄 지급 배치 ID (선택) — 회사가 여러 직원에게 한 번에 지원금을 지급할 때
   *      같은 배치에 속하는 항목을 묶기 위한 식별자입니다.
   * [VI] ID lô phát hàng loạt (tùy chọn) — khi công ty cấp trợ cấp cho nhiều nhân viên cùng lúc,
   *      đây là định danh để nhóm các mục thuộc cùng một lô.
   */
  @Field({ nullable: true }) @IsOptional() @IsString() sourceBatchId?: string;
}
