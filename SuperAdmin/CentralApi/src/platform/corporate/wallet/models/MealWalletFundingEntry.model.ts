/**
 * [KO] MealWalletFundingEntry GraphQL 모델 (지갑 입출금 원장 항목)
 *      지갑에 돈이 들어오거나 환불될 때마다 한 건의 FundingEntry가 생성됩니다.
 *      이 모델은 "누가, 언제, 얼마를, 어떤 출처로" 입금했는지를 추적하는 원장(ledger) 역할을 합니다.
 *      sourceType 필드로 회사 지원금(COMPANY_ALLOWANCE)인지 개인 충전(PERSONAL_TOP_UP)인지 구분합니다.
 *
 * [VI] Model GraphQL MealWalletFundingEntry (mục sổ cái nạp/rút ví)
 *      Mỗi khi tiền được nạp vào hoặc hoàn trả từ ví, một FundingEntry mới được tạo.
 *      Model này đóng vai trò sổ cái (ledger) để theo dõi "ai, khi nào, bao nhiêu, từ nguồn nào".
 *      Trường sourceType phân biệt trợ cấp công ty (COMPANY_ALLOWANCE) và nạp cá nhân (PERSONAL_TOP_UP).
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealWalletFundingEntryModel {
  /** [KO] 원장 항목 고유 ID (UUID) / [VI] ID duy nhất của mục sổ cái (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 이 항목이 속하는 지갑 ID / [VI] ID ví mà mục này thuộc về */
  @Field() walletId!: string;

  /**
   * [KO] 입금 출처 유형 — 'COMPANY_ALLOWANCE'(회사 지원금) 또는 'PERSONAL_TOP_UP'(개인 충전)
   * [VI] Loại nguồn nạp — 'COMPANY_ALLOWANCE' (trợ cấp công ty) hoặc 'PERSONAL_TOP_UP' (nạp cá nhân)
   */
  @Field() sourceType!: string;

  /**
   * [KO] 항목 상태 — 'POSTED'(확정), 'REVERSED'(취소/환불) 등
   * [VI] Trạng thái mục — 'POSTED' (đã xác nhận), 'REVERSED' (đã hủy/hoàn trả), v.v.
   */
  @Field() status!: string;

  /**
   * [KO] 입금 금액 (VND) — 양수는 입금, 음수는 차감을 의미합니다.
   * [VI] Số tiền nạp (VND) — số dương là nạp vào, số âm là trừ đi.
   */
  @Field(() => GraphQLBigInt) amountVnd!: bigint;

  /**
   * [KO] 일괄 지원금 배치 ID — 회사가 여러 직원에게 동시에 지원금을 지급할 때의 배치 식별자.
   *      개인 충전인 경우 null 입니다.
   * [VI] ID lô trợ cấp hàng loạt — khi công ty phát trợ cấp cho nhiều nhân viên cùng lúc.
   *      Trường hợp nạp cá nhân thì giá trị là null.
   */
  @Field(() => String, { nullable: true }) sourceBatchId?: string | null;

  /**
   * [KO] 외부 결제 참조 ID — 개인 충전 시 PG(결제대행사) 거래 번호 등.
   *      회사 지원금인 경우 null 입니다.
   * [VI] ID tham chiếu thanh toán bên ngoài — số giao dịch PG khi nạp cá nhân.
   *      Trường hợp trợ cấp công ty thì giá trị là null.
   */
  @Field(() => String, { nullable: true }) sourceReferenceId?: string | null;

  /** [KO] 관리자 메모 (선택) / [VI] Ghi chú quản trị viên (tùy chọn) */
  @Field(() => String, { nullable: true }) note?: string | null;

  /**
   * [KO] 입금 확정 시각 — 실제 잔액에 반영된 시점.
   * [VI] Thời điểm xác nhận nạp — thời điểm số dư thực sự được cập nhật.
   */
  @Field(() => Date, { nullable: true }) postedAt?: Date | null;

  /**
   * [KO] 취소/환불 시각 — 이 항목이 되돌려진 시점. null이면 아직 유효한 항목입니다.
   * [VI] Thời điểm hủy/hoàn trả — thời điểm mục này bị đảo ngược. Null nghĩa là mục vẫn còn hiệu lực.
   */
  @Field(() => Date, { nullable: true }) reversedAt?: Date | null;

  /** [KO] 항목 생성 시각 / [VI] Thời điểm tạo mục */
  @Field() createdAt!: Date;
}
