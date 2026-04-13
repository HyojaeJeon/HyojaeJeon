/**
 * [KO] MealCorporateDepartment GraphQL 모델
 *      식권 고객 기업의 부서(Department) 정보를 나타낸다.
 *      부서는 계층 구조를 가질 수 있으며 (parentDepartmentId로 상위 부서 참조),
 *      부서별 소속 임직원 수(employeeCount)를 함께 제공한다.
 *
 * [VI] Model GraphQL MealCorporateDepartment
 *      Đại diện thông tin phòng ban (Department) của doanh nghiệp khách hàng dịch vụ phiếu ăn.
 *      Phòng ban có thể có cấu trúc phân cấp (tham chiếu phòng ban cha qua parentDepartmentId),
 *      và cung cấp số lượng nhân viên thuộc phòng ban (employeeCount).
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealCorporateDepartmentModel {
  /**
   * [KO] 부서 고유 식별자 (UUID). DB 기본키.
   * [VI] Mã định danh duy nhất của phòng ban (UUID). Khóa chính DB.
   */
  @Field(() => ID) id!: string;

  /**
   * [KO] 소속 기업 ID. 이 부서가 속한 MealCorporate의 ID (외래키).
   * [VI] ID doanh nghiệp. ID của MealCorporate mà phòng ban này thuộc về (khóa ngoại).
   */
  @Field() corporateId!: string;

  /**
   * [KO] 부서 코드. 기업 내부에서 부서를 식별하는 고유 코드 (예: 'DEV-01', 'HR-01').
   * [VI] Mã phòng ban. Mã duy nhất để nhận diện phòng ban trong doanh nghiệp (ví dụ: 'DEV-01', 'HR-01').
   */
  @Field() departmentCode!: string;

  /**
   * [KO] 부서명. 부서의 표시 이름 (예: '개발팀', '인사팀').
   * [VI] Tên phòng ban. Tên hiển thị của phòng ban (ví dụ: 'Phòng Phát triển', 'Phòng Nhân sự').
   */
  @Field() departmentName!: string;

  /**
   * [KO] 상위 부서 ID (선택사항). 계층 구조에서 이 부서의 상위 부서를 가리킨다. null이면 최상위 부서.
   * [VI] ID phòng ban cha (tùy chọn). Trong cấu trúc phân cấp, trỏ đến phòng ban cấp trên. Null nếu là phòng ban cấp cao nhất.
   */
  @Field(() => String, { nullable: true }) parentDepartmentId?: string | null;

  /**
   * [KO] 상위 부서명 (선택사항). parentDepartmentId에 해당하는 부서의 이름. 서비스에서 조회하여 채워준다.
   * [VI] Tên phòng ban cha (tùy chọn). Tên của phòng ban tương ứng với parentDepartmentId. Được service tra cứu và điền vào.
   */
  @Field(() => String, { nullable: true }) parentDepartmentName?: string | null;

  /**
   * [KO] 소속 임직원 수 (선택사항). 이 부서에 배정된 활성 임직원의 총 수. 서비스에서 집계하여 채워준다.
   * [VI] Số lượng nhân viên (tùy chọn). Tổng số nhân viên đang hoạt động được phân bổ vào phòng ban này. Được service tổng hợp và điền vào.
   */
  @Field(() => Int, { nullable: true }) employeeCount?: number | null;

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
