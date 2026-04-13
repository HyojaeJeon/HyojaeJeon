/**
 * [KO] CreateMealWallet 입력 DTO — 직원에게 새 식권 지갑을 발급할 때 사용합니다.
 *      employeeId로 대상 직원을 지정하고, dailyLimitVnd로 일일 사용 한도를 설정합니다.
 *      서비스 레이어에서 해당 직원의 corporateId를 조회하여 멀티테넌시 스코프를 검증합니다.
 *
 * [VI] DTO đầu vào CreateMealWallet — dùng khi phát hành ví phiếu ăn mới cho nhân viên.
 *      Chỉ định nhân viên bằng employeeId và đặt giới hạn sử dụng hàng ngày bằng dailyLimitVnd.
 *      Tầng service sẽ tra cứu corporateId của nhân viên để xác minh phạm vi multi-tenancy.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsUUID } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigintValidators';

@InputType()
export class CreateMealWalletInput {
  /**
   * [KO] 지갑을 발급할 직원의 UUID — 직원이 존재하고 활성 상태여야 합니다.
   * [VI] UUID của nhân viên được phát ví — nhân viên phải tồn tại và đang hoạt động.
   */
  @Field(() => ID) @IsUUID() employeeId!: string;

  /**
   * [KO] 일일 사용 한도 (VND) — 0이면 한도 없음을 의미합니다.
   *      음수나 과도하게 큰 값은 class-validator 데코레이터가 차단합니다.
   * [VI] Giới hạn sử dụng hàng ngày (VND) — 0 nghĩa là không giới hạn.
   *      Giá trị âm hoặc quá lớn sẽ bị chặn bởi class-validator decorator.
   */
  // P2-4: 일일 한도는 0 허용 (제한 없음 의미), 음수/과도한 값 차단
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  dailyLimitVnd!: bigint;
}
