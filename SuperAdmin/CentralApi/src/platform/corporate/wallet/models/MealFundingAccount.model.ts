/**
 * [KO] MealFundingAccount GraphQL 모델 (법인 충전 계좌)
 *      법인(Corporate)이 직원 지갑에 지원금을 지급하기 위한 자금 원천 계좌입니다.
 *      fundingModel에 따라 운영 방식이 달라집니다:
 *      - PREPAID_DEPOSIT: 법인이 미리 입금한 예치금에서 차감 (잔액 부족 시 지원 불가)
 *      - CREDIT_NET_*: 외상(후불) 방식 — 잔액 검증 없이 지원 가능, 월말 정산
 *
 * [VI] Model GraphQL MealFundingAccount (tài khoản nạp tiền pháp nhân)
 *      Đây là tài khoản nguồn vốn để pháp nhân (Corporate) cấp trợ cấp vào ví nhân viên.
 *      Cách vận hành khác nhau tùy theo fundingModel:
 *      - PREPAID_DEPOSIT: Trừ từ khoản ký quỹ đã nạp trước (không đủ số dư thì không cấp được)
 *      - CREDIT_NET_*: Hình thức ghi nợ (trả sau) — cấp trợ cấp không cần kiểm tra số dư, quyết toán cuối tháng
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealFundingAccountModel {
  /** [KO] 계좌 고유 ID (UUID) / [VI] ID duy nhất của tài khoản (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 소속 법인 ID — 멀티테넌시 스코프 키 / [VI] ID pháp nhân sở hữu — khóa phạm vi multi-tenancy */
  @Field() corporateId!: string;

  /**
   * [KO] 자금 운영 모델 — 'PREPAID_DEPOSIT'(선불 예치) 또는 'CREDIT_NET_*'(후불 외상)
   *      이 값에 따라 지원금 지급 시 잔액 차감 여부가 결정됩니다.
   * [VI] Mô hình vận hành vốn — 'PREPAID_DEPOSIT' (ký quỹ trả trước) hoặc 'CREDIT_NET_*' (ghi nợ trả sau)
   *      Giá trị này quyết định có trừ số dư khi cấp trợ cấp hay không.
   */
  @Field() fundingModel!: string;

  /**
   * [KO] 은행 코드 — 법인의 실제 은행 계좌 식별 (예: 'VCB', 'TCB').
   *      가상계좌를 사용하는 경우 null일 수 있습니다.
   * [VI] Mã ngân hàng — định danh tài khoản ngân hàng thực của pháp nhân (ví dụ: 'VCB', 'TCB').
   *      Có thể null nếu sử dụng tài khoản ảo.
   */
  @Field(() => String, { nullable: true }) bankCode?: string | null;

  /**
   * [KO] 은행 계좌 번호 — 법인의 실제 은행 계좌 번호.
   * [VI] Số tài khoản ngân hàng — số tài khoản ngân hàng thực của pháp nhân.
   */
  @Field(() => String, { nullable: true }) bankAccountNo?: string | null;

  /**
   * [KO] 예치금 잔액 (VND) — PREPAID_DEPOSIT 모델에서 현재 사용 가능한 잔액.
   *      지원금 지급 시 이 잔액에서 차감됩니다.
   * [VI] Số dư ký quỹ (VND) — số dư khả dụng hiện tại trong mô hình PREPAID_DEPOSIT.
   *      Khi cấp trợ cấp, số tiền sẽ bị trừ từ đây.
   */
  @Field(() => GraphQLBigInt) balanceVnd!: bigint;

  /**
   * [KO] 신용 한도 (VND) — CREDIT_NET 모델에서 허용된 최대 외상 금액.
   *      PREPAID_DEPOSIT 모델에서는 0일 수 있습니다.
   * [VI] Hạn mức tín dụng (VND) — số tiền ghi nợ tối đa trong mô hình CREDIT_NET.
   *      Trong mô hình PREPAID_DEPOSIT có thể là 0.
   */
  @Field(() => GraphQLBigInt) creditLimitVnd!: bigint;

  /**
   * [KO] 가상 계좌 번호 — 자동 입금 확인을 위한 가상 계좌.
   * [VI] Số tài khoản ảo — tài khoản ảo để xác nhận nạp tiền tự động.
   */
  @Field(() => String, { nullable: true }) virtualAccountNo?: string | null;

  /**
   * [KO] 가상 계좌 은행 코드 — 가상 계좌가 개설된 은행.
   * [VI] Mã ngân hàng tài khoản ảo — ngân hàng nơi mở tài khoản ảo.
   */
  @Field(() => String, { nullable: true }) virtualBankCode?: string | null;

  /**
   * [KO] 계좌 상태 — 'ACTIVE'(활성), 'SUSPENDED'(정지), 'CLOSED'(폐쇄)
   * [VI] Trạng thái tài khoản — 'ACTIVE' (hoạt động), 'SUSPENDED' (tạm dừng), 'CLOSED' (đã đóng)
   */
  @Field() status!: string;

  /** [KO] 계좌 생성 시각 / [VI] Thời điểm tạo tài khoản */
  @Field() createdAt!: Date;

  /** [KO] 계좌 최종 수정 시각 / [VI] Thời điểm cập nhật tài khoản lần cuối */
  @Field() updatedAt!: Date;
}
