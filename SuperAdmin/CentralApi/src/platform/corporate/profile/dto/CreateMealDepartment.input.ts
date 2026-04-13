/**
 * [KO] CreateMealDepartment 입력 DTO
 *      새 부서(Department)를 생성할 때 클라이언트가 보내는 GraphQL Mutation 입력 데이터.
 *      소속 기업 ID, 부서 코드, 부서명, 상위 부서 ID(선택)를 포함한다.
 *
 * [VI] DTO đầu vào CreateMealDepartment
 *      Dữ liệu đầu vào GraphQL Mutation mà client gửi khi tạo phòng ban (Department) mới.
 *      Bao gồm ID doanh nghiệp, mã phòng ban, tên phòng ban, và ID phòng ban cha (tùy chọn).
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMealDepartmentInput {
  /**
   * [KO] 소속 기업 ID. 부서가 생성될 기업의 UUID.
   *      검증: UUID 형식 필수.
   * [VI] ID doanh nghiệp. UUID của doanh nghiệp nơi phòng ban sẽ được tạo.
   *      Xác thực: bắt buộc định dạng UUID.
   */
  @Field(() => ID) @IsUUID() corporateId!: string;

  /**
   * [KO] 부서 코드. 기업 내부에서 부서를 식별하는 고유 문자열 (예: 'DEV-01').
   *      검증: 비어있지 않은 문자열 필수.
   * [VI] Mã phòng ban. Chuỗi ký tự duy nhất để nhận diện phòng ban trong doanh nghiệp (ví dụ: 'DEV-01').
   *      Xác thực: bắt buộc chuỗi không rỗng.
   */
  @Field() @IsString() departmentCode!: string;

  /**
   * [KO] 부서명. 부서의 표시 이름 (예: '개발팀').
   *      검증: 비어있지 않은 문자열 필수.
   * [VI] Tên phòng ban. Tên hiển thị của phòng ban (ví dụ: 'Phòng Phát triển').
   *      Xác thực: bắt buộc chuỗi không rỗng.
   */
  @Field() @IsString() departmentName!: string;

  /**
   * [KO] 상위 부서 ID (선택사항). 계층 구조에서 상위 부서를 지정할 때 사용. 생략 시 최상위 부서로 생성.
   *      검증: 입력 시 UUID 형식 필수, 생략 가능.
   * [VI] ID phòng ban cha (tùy chọn). Dùng để chỉ định phòng ban cấp trên trong cấu trúc phân cấp. Bỏ qua thì tạo phòng ban cấp cao nhất.
   *      Xác thực: nếu có thì phải là UUID, có thể bỏ qua.
   */
  @Field(() => ID, { nullable: true }) @IsOptional() @IsUUID() parentDepartmentId?: string;
}
