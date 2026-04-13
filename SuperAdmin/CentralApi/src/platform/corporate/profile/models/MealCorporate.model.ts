/**
 * [KO] MealCorporate GraphQL 모델
 *      식권(Meal Voucher) 서비스를 이용하는 고객 기업(Corporate)의 프로필 정보를 나타낸다.
 *      회사명, 세금 코드, 자금 조달 모델(선불 예치/후불 여신), 월간 예산, 예치금 잔액,
 *      여신 한도, 담당자 연락처, 상태 등을 포함한다.
 *      이 모델은 GraphQL Query/Mutation 응답으로 클라이언트에 전달된다.
 *
 * [VI] Model GraphQL MealCorporate
 *      Đại diện thông tin hồ sơ của doanh nghiệp khách hàng (Corporate) sử dụng dịch vụ phiếu ăn.
 *      Bao gồm tên công ty, mã số thuế, mô hình tài trợ (trả trước/tín dụng), ngân sách hàng tháng,
 *      số dư tiền gửi, hạn mức tín dụng, thông tin liên hệ, trạng thái, v.v.
 *      Model này được trả về cho client qua phản hồi GraphQL Query/Mutation.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealCorporateModel {
  /**
   * [KO] 기업 고유 식별자 (UUID). DB 기본키.
   * [VI] Mã định danh duy nhất của doanh nghiệp (UUID). Khóa chính DB.
   */
  @Field(() => ID) id!: string;

  /**
   * [KO] 테넌트 코드. 멀티테넌시 환경에서 기업을 구분하는 고유 코드.
   * [VI] Mã tenant. Mã duy nhất phân biệt doanh nghiệp trong môi trường multi-tenancy.
   */
  @Field() tenantCode!: string;

  /**
   * [KO] 회사명. 고객 기업의 공식 상호명.
   * [VI] Tên công ty. Tên thương mại chính thức của doanh nghiệp khách hàng.
   */
  @Field() companyName!: string;

  /**
   * [KO] 세금 코드(사업자등록번호). 베트남 세무 당국에 등록된 기업의 고유 세금 코드.
   * [VI] Mã số thuế. Mã số thuế duy nhất của doanh nghiệp đã đăng ký với cơ quan thuế Việt Nam.
   */
  @Field() taxCode!: string;

  /**
   * [KO] 자금 조달 모델. 기업이 식권 서비스 대금을 결제하는 방식을 결정한다.
   *      값: 'PREPAID_DEPOSIT' (선불 예치금) | 'CREDIT_NET15' (15일 후불) | 'CREDIT_NET30' (30일 후불)
   * [VI] Mô hình tài trợ. Xác định cách doanh nghiệp thanh toán dịch vụ phiếu ăn.
   *      Giá trị: 'PREPAID_DEPOSIT' (đặt cọc trả trước) | 'CREDIT_NET15' (trả sau 15 ngày) | 'CREDIT_NET30' (trả sau 30 ngày)
   */
  @Field() fundingModel!: string;

  /**
   * [KO] 월간 예산 (VND). 기업이 한 달에 식권 서비스에 사용할 수 있는 최대 금액. BigInt로 표현.
   * [VI] Ngân sách hàng tháng (VND). Số tiền tối đa doanh nghiệp có thể chi cho dịch vụ phiếu ăn mỗi tháng. Biểu diễn bằng BigInt.
   */
  @Field(() => GraphQLBigInt) monthlyBudgetVnd!: bigint;

  /**
   * [KO] 예치금 잔액 (VND). 선불 모델(PREPAID_DEPOSIT)에서 기업이 미리 입금한 금액의 현재 잔액.
   * [VI] Số dư tiền gửi (VND). Số dư hiện tại của khoản tiền doanh nghiệp đã nạp trước trong mô hình trả trước (PREPAID_DEPOSIT).
   */
  @Field(() => GraphQLBigInt) depositBalanceVnd!: bigint;

  /**
   * [KO] 여신 한도 (VND). 후불 모델(CREDIT_NET15/NET30)에서 기업이 사용할 수 있는 최대 미결제 금액.
   * [VI] Hạn mức tín dụng (VND). Số tiền chưa thanh toán tối đa doanh nghiệp có thể sử dụng trong mô hình trả sau (CREDIT_NET15/NET30).
   */
  @Field(() => GraphQLBigInt) creditLimitVnd!: bigint;

  /**
   * [KO] 담당자 이름. 기업 측 계약 담당자 또는 운영 담당자의 이름 (선택사항).
   * [VI] Tên người liên hệ. Tên người phụ trách hợp đồng hoặc vận hành của doanh nghiệp (tùy chọn).
   */
  @Field(() => String, { nullable: true }) contactName?: string | null;

  /**
   * [KO] 담당자 이메일. 기업 측 담당자의 이메일 주소 (선택사항).
   * [VI] Email người liên hệ. Địa chỉ email của người phụ trách doanh nghiệp (tùy chọn).
   */
  @Field(() => String, { nullable: true }) contactEmail?: string | null;

  /**
   * [KO] 담당자 전화번호. 기업 측 담당자의 전화번호 (선택사항).
   * [VI] Số điện thoại người liên hệ. Số điện thoại của người phụ trách doanh nghiệp (tùy chọn).
   */
  @Field(() => String, { nullable: true }) contactPhone?: string | null;

  /**
   * [KO] 기업 상태. 값: 'ACTIVE' (활성) | 'SUSPENDED' (일시정지) | 'TERMINATED' (해지) | 'DELETED' (삭제)
   * [VI] Trạng thái doanh nghiệp. Giá trị: 'ACTIVE' (hoạt động) | 'SUSPENDED' (tạm ngưng) | 'TERMINATED' (chấm dứt) | 'DELETED' (đã xóa)
   */
  @Field() status!: string;

  /**
   * [KO] 레코드 생성 일시.
   * [VI] Thời điểm tạo bản ghi.
   */
  @Field() createdAt!: Date;

  /**
   * [KO] 레코드 최종 수정 일시.
   * [VI] Thời điểm cập nhật bản ghi gần nhất.
   */
  @Field() updatedAt!: Date;
}
