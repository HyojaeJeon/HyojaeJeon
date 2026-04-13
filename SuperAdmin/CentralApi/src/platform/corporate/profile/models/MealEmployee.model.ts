/**
 * [KO] MealEmployee GraphQL 모델
 *      식권 서비스를 이용하는 기업 소속 임직원(Employee) 정보를 나타낸다.
 *      임직원은 반드시 하나의 기업(Corporate)에 소속되며, 선택적으로 부서(Department)에 배정된다.
 *      사번, 이름, 이메일, 전화번호, RFID 배지 정보 등을 포함한다.
 *
 * [VI] Model GraphQL MealEmployee
 *      Đại diện thông tin nhân viên (Employee) thuộc doanh nghiệp sử dụng dịch vụ phiếu ăn.
 *      Nhân viên bắt buộc thuộc một doanh nghiệp (Corporate), và tùy chọn được phân bổ vào phòng ban (Department).
 *      Bao gồm mã nhân viên, họ tên, email, số điện thoại, thông tin thẻ RFID, v.v.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealEmployeeModel {
  /**
   * [KO] 임직원 고유 식별자 (UUID). DB 기본키.
   * [VI] Mã định danh duy nhất của nhân viên (UUID). Khóa chính DB.
   */
  @Field(() => ID) id!: string;

  /**
   * [KO] 소속 기업 ID. 이 임직원이 속한 MealCorporate의 ID (외래키).
   * [VI] ID doanh nghiệp. ID của MealCorporate mà nhân viên này thuộc về (khóa ngoại).
   */
  @Field() corporateId!: string;

  /**
   * [KO] 소속 부서 ID. 임직원이 배정된 부서의 ID (선택사항, null이면 부서 미배정).
   * [VI] ID phòng ban. ID phòng ban mà nhân viên được phân bổ (tùy chọn, null nếu chưa phân bổ phòng ban).
   */
  @Field(() => String, { nullable: true }) departmentId?: string | null;

  /**
   * [KO] 사번. 기업 내부에서 임직원을 식별하는 고유 코드 (예: 'EMP-001').
   * [VI] Mã nhân viên. Mã duy nhất để nhận diện nhân viên trong doanh nghiệp (ví dụ: 'EMP-001').
   */
  @Field() employeeCode!: string;

  /**
   * [KO] 임직원 성명. 전체 이름(풀네임).
   * [VI] Họ và tên nhân viên. Tên đầy đủ.
   */
  @Field() fullName!: string;

  /**
   * [KO] 이메일 주소 (선택사항). 임직원 개인 또는 업무용 이메일.
   * [VI] Địa chỉ email (tùy chọn). Email cá nhân hoặc công việc của nhân viên.
   */
  @Field(() => String, { nullable: true }) email?: string | null;

  /**
   * [KO] 전화번호 (선택사항). 임직원의 연락 가능한 전화번호.
   * [VI] Số điện thoại (tùy chọn). Số điện thoại liên lạc được của nhân viên.
   */
  @Field(() => String, { nullable: true }) phone?: string | null;

  /**
   * [KO] RFID 배지 코드 (선택사항). 식권 결제 시 POS 단말기에서 태그하는 RFID 카드 고유번호.
   * [VI] Mã thẻ RFID (tùy chọn). Mã duy nhất của thẻ RFID dùng để quẹt tại máy POS khi thanh toán phiếu ăn.
   */
  @Field(() => String, { nullable: true }) badgeRfid?: string | null;

  /**
   * [KO] 임직원 상태. 값: 'ACTIVE' (활성) | 'INACTIVE' (비활성) 등.
   * [VI] Trạng thái nhân viên. Giá trị: 'ACTIVE' (hoạt động) | 'INACTIVE' (không hoạt động), v.v.
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
