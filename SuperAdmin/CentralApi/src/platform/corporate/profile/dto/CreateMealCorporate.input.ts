/**
 * [KO] CreateMealCorporate 입력 DTO
 *      새 고객 기업(Corporate)을 생성할 때 클라이언트가 보내는 GraphQL Mutation 입력 데이터.
 *      테넌트 코드, 회사명, 세금 코드, 자금 조달 모델, 월간 예산, 여신 한도, 담당자 정보를 포함한다.
 *      SUPER_ADMIN 권한을 가진 사용자만 이 입력을 통해 기업을 생성할 수 있다.
 *
 * [VI] DTO đầu vào CreateMealCorporate
 *      Dữ liệu đầu vào GraphQL Mutation mà client gửi khi tạo doanh nghiệp khách hàng (Corporate) mới.
 *      Bao gồm mã tenant, tên công ty, mã số thuế, mô hình tài trợ, ngân sách hàng tháng,
 *      hạn mức tín dụng, thông tin người liên hệ.
 *      Chỉ người dùng có quyền SUPER_ADMIN mới có thể tạo doanh nghiệp qua đầu vào này.
 */
import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsBigIntMax, IsBigIntMin } from '@core/validation/bigintValidators';

/**
 * [KO] 월간 예산 및 여신 한도의 상한 값 (10조 VND).
 *      거대 기업 대상이므로 기본 max보다 여유롭게 설정.
 * [VI] Giá trị trần cho ngân sách hàng tháng và hạn mức tín dụng (10 nghìn tỷ VND).
 *      Được đặt rộng rãi hơn mặc định vì dành cho doanh nghiệp lớn.
 */
// P2-4: 월간 예산/여신 한도 상한. 거대 기업 대상이므로 기본 max 보다 여유롭게 10조 VND.
const MAX_CORP_AMOUNT_VND: bigint = 10_000_000_000_000n;

@InputType()
export class CreateMealCorporateInput {
  /**
   * [KO] 테넌트 코드. 멀티테넌시 환경에서 기업을 구분하는 고유 코드.
   *      검증: 비어있지 않은 문자열 필수, 최대 50자.
   * [VI] Mã tenant. Mã duy nhất phân biệt doanh nghiệp trong môi trường multi-tenancy.
   *      Xác thực: bắt buộc chuỗi không rỗng, tối đa 50 ký tự.
   */
  @Field() @IsString() @IsNotEmpty() @MaxLength(50) tenantCode!: string;

  /**
   * [KO] 회사명. 고객 기업의 공식 상호명.
   *      검증: 비어있지 않은 문자열 필수, 최대 200자.
   * [VI] Tên công ty. Tên thương mại chính thức của doanh nghiệp khách hàng.
   *      Xác thực: bắt buộc chuỗi không rỗng, tối đa 200 ký tự.
   */
  @Field() @IsString() @IsNotEmpty() @MaxLength(200) companyName!: string;

  /**
   * [KO] 세금 코드(사업자등록번호). 베트남 세무 당국에 등록된 고유 세금 코드.
   *      검증: 비어있지 않은 문자열 필수, 최대 50자.
   * [VI] Mã số thuế. Mã số thuế duy nhất đã đăng ký với cơ quan thuế Việt Nam.
   *      Xác thực: bắt buộc chuỗi không rỗng, tối đa 50 ký tự.
   */
  @Field() @IsString() @IsNotEmpty() @MaxLength(50) taxCode!: string;

  /**
   * [KO] 자금 조달 모델. 기업의 식권 서비스 결제 방식.
   *      검증: 'PREPAID_DEPOSIT' (선불 예치) | 'CREDIT_NET15' (15일 후불) | 'CREDIT_NET30' (30일 후불) 중 하나.
   *      기본값: 'PREPAID_DEPOSIT'.
   * [VI] Mô hình tài trợ. Phương thức thanh toán dịch vụ phiếu ăn của doanh nghiệp.
   *      Xác thực: một trong 'PREPAID_DEPOSIT' (trả trước) | 'CREDIT_NET15' (trả sau 15 ngày) | 'CREDIT_NET30' (trả sau 30 ngày).
   *      Mặc định: 'PREPAID_DEPOSIT'.
   */
  @Field({ defaultValue: 'PREPAID_DEPOSIT' })
  @IsIn(['PREPAID_DEPOSIT', 'CREDIT_NET15', 'CREDIT_NET30'])
  fundingModel!: string;

  /**
   * [KO] 월간 예산 (VND). 기업이 한 달에 사용할 수 있는 최대 식권 예산.
   *      검증: 0 이상, 최대 10조 VND (10,000,000,000,000). 기본값: 0.
   * [VI] Ngân sách hàng tháng (VND). Ngân sách phiếu ăn tối đa doanh nghiệp có thể sử dụng mỗi tháng.
   *      Xác thực: tối thiểu 0, tối đa 10 nghìn tỷ VND (10.000.000.000.000). Mặc định: 0.
   */
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  monthlyBudgetVnd!: bigint;

  /**
   * [KO] 여신 한도 (VND). 후불 모델에서 기업이 사용할 수 있는 최대 미결제 금액.
   *      검증: 0 이상, 최대 10조 VND. 기본값: 0.
   * [VI] Hạn mức tín dụng (VND). Số tiền chưa thanh toán tối đa doanh nghiệp có thể sử dụng trong mô hình trả sau.
   *      Xác thực: tối thiểu 0, tối đa 10 nghìn tỷ VND. Mặc định: 0.
   */
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  creditLimitVnd!: bigint;

  /**
   * [KO] 담당자 이름 (선택사항). 기업 측 계약/운영 담당자.
   *      검증: 생략 가능, 입력 시 최대 100자.
   * [VI] Tên người liên hệ (tùy chọn). Người phụ trách hợp đồng/vận hành của doanh nghiệp.
   *      Xác thực: có thể bỏ qua, nếu có tối đa 100 ký tự.
   */
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(100) contactName?: string;

  /**
   * [KO] 담당자 이메일 (선택사항). 기업 담당자의 이메일 주소.
   *      검증: 생략 가능, 입력 시 이메일 형식(@IsEmail) 필수.
   * [VI] Email người liên hệ (tùy chọn). Địa chỉ email của người phụ trách doanh nghiệp.
   *      Xác thực: có thể bỏ qua, nếu có phải đúng định dạng email (@IsEmail).
   */
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() contactEmail?: string;

  /**
   * [KO] 담당자 전화번호 (선택사항). 기업 담당자의 전화번호.
   *      검증: 생략 가능, 입력 시 최대 30자.
   * [VI] Số điện thoại người liên hệ (tùy chọn). Số điện thoại của người phụ trách doanh nghiệp.
   *      Xác thực: có thể bỏ qua, nếu có tối đa 30 ký tự.
   */
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(30) contactPhone?: string;
}
