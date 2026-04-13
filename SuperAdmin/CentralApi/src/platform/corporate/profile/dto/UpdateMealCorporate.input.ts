/**
 * [KO] UpdateMealCorporate 입력 DTO
 *      기존 고객 기업(Corporate)의 정보를 수정할 때 클라이언트가 보내는 GraphQL Mutation 입력 데이터.
 *      모든 필드가 선택사항(nullable)이며, 전달된 필드만 업데이트된다 (Partial Update 패턴).
 *      tenantCode는 변경 불가하므로 이 DTO에 포함되지 않는다.
 *
 * [VI] DTO đầu vào UpdateMealCorporate
 *      Dữ liệu đầu vào GraphQL Mutation mà client gửi khi cập nhật thông tin doanh nghiệp (Corporate).
 *      Tất cả trường đều tùy chọn (nullable), chỉ những trường được gửi mới được cập nhật (Partial Update).
 *      tenantCode không thể thay đổi nên không có trong DTO này.
 */
import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsBigIntMax, IsBigIntMin } from '@core/validation/bigintValidators';

/**
 * [KO] 월간 예산 및 여신 한도의 상한 값 (10조 VND).
 * [VI] Giá trị trần cho ngân sách hàng tháng và hạn mức tín dụng (10 nghìn tỷ VND).
 */
const MAX_CORP_AMOUNT_VND: bigint = 10_000_000_000_000n;

@InputType()
export class UpdateMealCorporateInput {
  /**
   * [KO] 회사명 (선택사항). 변경할 기업의 새 상호명.
   *      검증: 생략 가능, 입력 시 최대 200자.
   * [VI] Tên công ty (tùy chọn). Tên thương mại mới của doanh nghiệp cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có tối đa 200 ký tự.
   */
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) companyName?: string;

  /**
   * [KO] 세금 코드 (선택사항). 변경할 새 세금 코드(사업자등록번호).
   *      검증: 생략 가능, 입력 시 최대 50자.
   * [VI] Mã số thuế (tùy chọn). Mã số thuế mới cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có tối đa 50 ký tự.
   */
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(50) taxCode?: string;

  /**
   * [KO] 자금 조달 모델 (선택사항). 변경할 새 결제 방식.
   *      검증: 생략 가능, 입력 시 'PREPAID_DEPOSIT' | 'CREDIT_NET15' | 'CREDIT_NET30' 중 하나.
   * [VI] Mô hình tài trợ (tùy chọn). Phương thức thanh toán mới cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có phải là 'PREPAID_DEPOSIT' | 'CREDIT_NET15' | 'CREDIT_NET30'.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['PREPAID_DEPOSIT', 'CREDIT_NET15', 'CREDIT_NET30'])
  fundingModel?: string;

  /**
   * [KO] 월간 예산 (VND, 선택사항). 변경할 새 월간 예산 금액.
   *      검증: 생략 가능, 입력 시 0 이상 ~ 10조 VND 이하.
   * [VI] Ngân sách hàng tháng (VND, tùy chọn). Số tiền ngân sách hàng tháng mới cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có phải từ 0 đến 10 nghìn tỷ VND.
   */
  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  monthlyBudgetVnd?: bigint;

  /**
   * [KO] 여신 한도 (VND, 선택사항). 변경할 새 여신 한도 금액.
   *      검증: 생략 가능, 입력 시 0 이상 ~ 10조 VND 이하.
   * [VI] Hạn mức tín dụng (VND, tùy chọn). Hạn mức tín dụng mới cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có phải từ 0 đến 10 nghìn tỷ VND.
   */
  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  creditLimitVnd?: bigint;

  /**
   * [KO] 기업 상태 (선택사항). 변경할 새 상태.
   *      검증: 생략 가능, 입력 시 'ACTIVE' (활성) | 'SUSPENDED' (일시정지) | 'TERMINATED' (해지) 중 하나.
   * [VI] Trạng thái doanh nghiệp (tùy chọn). Trạng thái mới cần thay đổi.
   *      Xác thực: có thể bỏ qua, nếu có phải là 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'TERMINATED'])
  status?: string;
}
