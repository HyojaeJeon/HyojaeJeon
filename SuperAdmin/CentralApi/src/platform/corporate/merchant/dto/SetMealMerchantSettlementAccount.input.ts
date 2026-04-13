/**
 * [KO] 가맹점 정산 계좌 설정 입력 DTO
 *      기존 Enrollment 의 주 정산 계좌를 새로 등록할 때 사용합니다.
 *      트랜잭션 내에서 기존 isPrimary=true 계좌를 해제하고, 새 계좌를 isPrimary=true 로 생성합니다.
 *      이전 계좌 이력은 삭제되지 않고 isPrimary=false 로 보존됩니다.
 *
 * [VI] DTO đầu vào cài đặt tài khoản quyết toán merchant
 *      Dùng khi đăng ký tài khoản quyết toán chính mới cho Enrollment.
 *      Trong transaction: hủy isPrimary=true của tài khoản cũ, tạo tài khoản mới isPrimary=true.
 *      Lịch sử tài khoản cũ không bị xóa, được giữ lại với isPrimary=false.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class SetMealMerchantSettlementAccountInput {
  /** [KO] 대상 가맹점 등록 ID / [VI] ID enrollment merchant mục tiêu */
  @Field(() => ID) @IsUUID() enrollmentId!: string;

  /**
   * [KO] 은행 코드 (베트남 은행 식별 코드, 예: 'VCB', 'TCB', 'ACB')
   * [VI] Mã ngân hàng (mã định danh ngân hàng Việt Nam, ví dụ: 'VCB', 'TCB', 'ACB')
   */
  @Field() bankCode!: string;

  /** [KO] 은행 계좌 번호 / [VI] Số tài khoản ngân hàng */
  @Field() bankAccountNumber!: string;

  /** [KO] 예금주명 / [VI] Tên chủ tài khoản */
  @Field() bankAccountHolder!: string;

  /**
   * [KO] 세금 코드 (베트남 MST). 전자세금계산서 발행에 필수.
   * [VI] Mã số thuế (MST). Bắt buộc để phát hành hóa đơn điện tử.
   */
  @Field() taxCode!: string;
}
