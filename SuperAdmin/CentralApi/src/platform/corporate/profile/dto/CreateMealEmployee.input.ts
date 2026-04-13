/**
 * [KO] CreateMealEmployee 입력 DTO
 *      새 임직원(Employee)을 생성할 때 클라이언트가 보내는 GraphQL Mutation 입력 데이터.
 *      소속 기업 ID, 부서 ID(선택), 사번, 이름, 이메일(선택), 전화번호(선택), RFID(선택)를 포함한다.
 *
 * [VI] DTO đầu vào CreateMealEmployee
 *      Dữ liệu đầu vào GraphQL Mutation mà client gửi khi tạo nhân viên (Employee) mới.
 *      Bao gồm ID doanh nghiệp, ID phòng ban (tùy chọn), mã nhân viên, họ tên, email (tùy chọn),
 *      số điện thoại (tùy chọn), mã RFID (tùy chọn).
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMealEmployeeInput {
  /**
   * [KO] 소속 기업 ID. 임직원이 소속될 기업의 UUID.
   *      검증: UUID 형식 필수.
   * [VI] ID doanh nghiệp. UUID của doanh nghiệp mà nhân viên sẽ thuộc về.
   *      Xác thực: bắt buộc định dạng UUID.
   */
  @Field(() => ID) @IsUUID() corporateId!: string;

  /**
   * [KO] 소속 부서 ID (선택사항). 임직원을 특정 부서에 배정할 때 사용. 생략 시 부서 미배정.
   *      검증: 입력 시 UUID 형식 필수, 생략 가능.
   * [VI] ID phòng ban (tùy chọn). Dùng khi phân bổ nhân viên vào phòng ban cụ thể. Bỏ qua thì không phân bổ phòng ban.
   *      Xác thực: nếu có thì phải là UUID, có thể bỏ qua.
   */
  @Field(() => ID, { nullable: true }) @IsOptional() @IsUUID() departmentId?: string;

  /**
   * [KO] 사번. 기업 내부에서 임직원을 식별하는 고유 코드 (예: 'EMP-001').
   *      검증: 비어있지 않은 문자열 필수.
   * [VI] Mã nhân viên. Mã duy nhất để nhận diện nhân viên trong doanh nghiệp (ví dụ: 'EMP-001').
   *      Xác thực: bắt buộc chuỗi không rỗng.
   */
  @Field() @IsString() employeeCode!: string;

  /**
   * [KO] 임직원 성명. 전체 이름(풀네임).
   *      검증: 비어있지 않은 문자열 필수.
   * [VI] Họ và tên nhân viên. Tên đầy đủ.
   *      Xác thực: bắt buộc chuỗi không rỗng.
   */
  @Field() @IsString() fullName!: string;

  /**
   * [KO] 이메일 주소 (선택사항). 임직원의 이메일.
   *      검증: 생략 가능. (별도 이메일 형식 검증 없음)
   * [VI] Địa chỉ email (tùy chọn). Email của nhân viên.
   *      Xác thực: có thể bỏ qua. (Không có xác thực định dạng email riêng)
   */
  @Field(() => String, { nullable: true }) @IsOptional() email?: string;

  /**
   * [KO] 전화번호 (선택사항). 임직원의 연락처.
   *      검증: 생략 가능.
   * [VI] Số điện thoại (tùy chọn). Số liên lạc của nhân viên.
   *      Xác thực: có thể bỏ qua.
   */
  @Field(() => String, { nullable: true }) @IsOptional() phone?: string;

  /**
   * [KO] RFID 배지 코드 (선택사항). 식권 결제 시 POS 단말기에서 태그하는 RFID 카드 고유번호.
   *      검증: 생략 가능.
   * [VI] Mã thẻ RFID (tùy chọn). Mã duy nhất của thẻ RFID dùng để quẹt tại máy POS khi thanh toán phiếu ăn.
   *      Xác thực: có thể bỏ qua.
   */
  @Field(() => String, { nullable: true }) @IsOptional() badgeRfid?: string;
}
