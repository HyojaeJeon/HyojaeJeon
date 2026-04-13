/**
 * [KO] 식권 가맹점 정산 계좌(Settlement Account) 모델
 *      가맹점이 정산 대금을 수령할 은행 계좌 정보를 표현하는 GraphQL 응답 모델입니다.
 *      하나의 Enrollment 에 여러 정산 계좌를 등록할 수 있지만,
 *      isPrimary=true 인 계좌는 항상 하나만 존재합니다 (새 계좌 등록 시 기존 primary 해제).
 *      정산 배치(Settlement Batch) 실행 시 isPrimary=true 계좌로 대금을 지급합니다.
 *
 * [VI] Model tài khoản quyết toán (Settlement Account) merchant phiếu ăn
 *      Model GraphQL chứa thông tin tài khoản ngân hàng nhận tiền quyết toán của merchant.
 *      Một Enrollment có thể có nhiều tài khoản, nhưng chỉ duy nhất một tài khoản
 *      isPrimary=true (khi thêm tài khoản mới, tài khoản primary cũ bị hủy).
 *      Batch quyết toán sẽ chuyển tiền vào tài khoản isPrimary=true.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantSettlementAccountModel {
  /** [KO] 정산 계좌 고유 ID / [VI] ID duy nhất tài khoản quyết toán */
  @Field(() => ID) id!: string;

  /** [KO] 연결된 가맹점 등록 ID / [VI] ID enrollment liên kết */
  @Field() enrollmentId!: string;

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
   * [KO] 세금 코드 (베트남 MST - Ma So Thue). 전자세금계산서(E-Invoice) 발행에 필요.
   * [VI] Mã số thuế (MST). Cần thiết để phát hành hóa đơn điện tử (E-Invoice).
   */
  @Field() taxCode!: string;

  /**
   * [KO] 주 계좌 여부. true 면 정산 시 이 계좌로 지급됩니다.
   *      하나의 Enrollment 에 isPrimary=true 계좌는 반드시 하나만 존재합니다.
   * [VI] Có phải tài khoản chính không. true = tiền quyết toán sẽ chuyển vào tài khoản này.
   *      Mỗi Enrollment chỉ có đúng một tài khoản isPrimary=true.
   */
  @Field() isPrimary!: boolean;

  /** [KO] 레코드 생성 일시 / [VI] Ngày giờ tạo bản ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 일시 / [VI] Ngày giờ cập nhật bản ghi lần cuối */
  @Field() updatedAt!: Date;
}
