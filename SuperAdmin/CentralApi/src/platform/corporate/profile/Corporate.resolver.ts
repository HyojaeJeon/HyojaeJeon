/**
 * [KO] MealCorporate GraphQL 리졸버
 *      식권 고객 기업(Corporate) / 부서(Department) / 임직원(Employee) / 청구서 스케줄에 대한
 *      GraphQL Query와 Mutation 핸들러를 정의한다.
 *      모든 핸들러는 JWT에서 추출한 사용자 정보로 MealCallerCtx를 생성하여
 *      서비스 계층에 전달함으로써 corporate scope를 강제한다.
 *
 *      각 핸들러에 @RequirePermission 데코레이터가 적용되어 RBAC 권한 검증이 수행된다.
 *
 * [VI] GraphQL Resolver MealCorporate
 *      Định nghĩa các handler GraphQL Query và Mutation cho doanh nghiệp khách hàng (Corporate) /
 *      phòng ban (Department) / nhân viên (Employee) / lịch hóa đơn.
 *      Mọi handler đều tạo MealCallerCtx từ thông tin người dùng trích xuất từ JWT
 *      và truyền cho tầng service để bắt buộc phạm vi corporate.
 *
 *      Mỗi handler được áp dụng decorator @RequirePermission để xác minh quyền RBAC.
 */
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { Public } from '@core/auth/decorators/Public.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { MealCorporateService } from './Corporate.service';
import { MealCorporateModel } from './models/MealCorporate.model';
import { MealCorporateDepartmentModel } from './models/MealCorporateDepartment.model';
import { MealEmployeeModel } from './models/MealEmployee.model';
import { MealEmployeeLoginPayload } from './models/MealEmployeeLogin.model';
import { CorporateAdminUserModel } from './models/CorporateAdminUser.model';
import { CreateMealCorporateInput } from './dto/CreateMealCorporate.input';
import { UpdateMealCorporateInput } from './dto/UpdateMealCorporate.input';
import { CreateMealDepartmentInput } from './dto/CreateMealDepartment.input';
import { CreateMealEmployeeInput } from './dto/CreateMealEmployee.input';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] GraphQL 응답 래퍼 타입 정의
 *      createListResponse: 목록 조회용 (data 배열 + totalCount 포함)
 *      createObjectResponse: 단건 조회/생성/수정용 (단일 data 객체 포함)
 *
 * [VI] Định nghĩa các kiểu bọc phản hồi GraphQL
 *      createListResponse: cho truy vấn danh sách (mảng data + totalCount)
 *      createObjectResponse: cho truy vấn chi tiết/tạo/cập nhật (đối tượng data đơn lẻ)
 */
const MealCorporateDepartmentModel__ListResp = createListResponse(MealCorporateDepartmentModel, 'MealCorporateDepartmentModelListResponse');
const MealCorporateDepartmentModel__Resp = createObjectResponse(MealCorporateDepartmentModel, 'MealCorporateDepartmentModelResponse');
const MealCorporateModel__ListResp = createListResponse(MealCorporateModel, 'MealCorporateModelListResponse');
const MealCorporateModel__Resp = createObjectResponse(MealCorporateModel, 'MealCorporateModelResponse');
const MealEmployeeModel__ListResp = createListResponse(MealEmployeeModel, 'MealEmployeeModelListResponse');
const MealEmployeeModel__Resp = createObjectResponse(MealEmployeeModel, 'MealEmployeeModelResponse');
const MealEmployeeLoginResp = createObjectResponse(MealEmployeeLoginPayload, 'MealEmployeeLoginResponse');
const CorporateAdminUserModel__ListResp = createListResponse(CorporateAdminUserModel, 'CorporateAdminUserModelListResponse');

@Resolver(() => MealCorporateModel)
export class MealCorporateResolver {
  constructor(private readonly service: MealCorporateService) {}

  /**
   * [KO] Query: mealCorporates - 기업 목록 조회
   *      필요 권한: corporates:read
   *      페이지네이션(skip/take)으로 기업 목록을 반환한다.
   *
   * [VI] Query: mealCorporates - Truy vấn danh sách doanh nghiệp
   *      Quyền cần: corporates:read
   *      Trả về danh sách doanh nghiệp với phân trang (skip/take).
   */
  @RequirePermission('corporates:read')
  @Query(() => MealCorporateModel__ListResp, { name: 'mealCorporates' })
  list(@Args() pagination: PaginationArgs, @CurrentUser() user: JwtPayload) {
    return this.service.list(mealCtxFromUser(user), pagination.skip, pagination.take);
  }

  /**
   * [KO] Query: mealCorporate - 기업 단건 조회
   *      필요 권한: corporates:read
   *      ID를 인자로 받아 해당 기업의 상세 정보를 반환한다.
   *
   * [VI] Query: mealCorporate - Truy vấn chi tiết doanh nghiệp
   *      Quyền cần: corporates:read
   *      Nhận ID làm tham số và trả về thông tin chi tiết doanh nghiệp.
   */
  @RequirePermission('corporates:read')
  @Query(() => MealCorporateModel__Resp, { name: 'mealCorporate' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] Mutation: mealCorporateCreate - 새 기업 생성
   *      필요 권한: corporates:update (+ 서비스 내부에서 SUPER_ADMIN 여부 추가 검증)
   *      CreateMealCorporateInput을 입력으로 받아 새 기업을 생성한다.
   *
   * [VI] Mutation: mealCorporateCreate - Tạo doanh nghiệp mới
   *      Quyền cần: corporates:update (+ kiểm tra thêm SUPER_ADMIN trong service)
   *      Nhận CreateMealCorporateInput làm đầu vào để tạo doanh nghiệp mới.
   */
  @RequirePermission('corporates:update')
  @Mutation(() => MealCorporateModel__Resp)
  mealCorporateCreate(
    @Args('input') input: CreateMealCorporateInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  /**
   * [KO] Mutation: mealCorporateUpdate - 기업 정보 수정
   *      필요 권한: corporates:update
   *      ID와 UpdateMealCorporateInput을 입력으로 받아 기업 정보를 수정한다.
   *
   * [VI] Mutation: mealCorporateUpdate - Cập nhật thông tin doanh nghiệp
   *      Quyền cần: corporates:update
   *      Nhận ID và UpdateMealCorporateInput làm đầu vào để cập nhật thông tin doanh nghiệp.
   */
  @RequirePermission('corporates:update')
  @Mutation(() => MealCorporateModel__Resp)
  mealCorporateUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMealCorporateInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(mealCtxFromUser(user), id, input);
  }

  /**
   * [KO] Mutation: mealCorporateDelete - 기업 소프트 삭제
   *      필요 권한: corporates:update
   *      ID를 인자로 받아 해당 기업을 소프트 삭제하고, 성공 여부(boolean)를 반환한다.
   *
   * [VI] Mutation: mealCorporateDelete - Xóa mềm doanh nghiệp
   *      Quyền cần: corporates:update
   *      Nhận ID làm tham số, xóa mềm doanh nghiệp và trả về kết quả thành công (boolean).
   */
  @RequirePermission('corporates:update')
  @Mutation(() => BooleanResponse)
  mealCorporateDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(mealCtxFromUser(user), id);
  }

  /**
   * [KO] Query: mealDepartment - 부서 단건 조회
   *      필요 권한: departments:read
   *      ID를 인자로 받아 부서 상세 정보(상위 부서명, 소속 임직원 수 포함)를 반환한다.
   *
   * [VI] Query: mealDepartment - Truy vấn chi tiết phòng ban
   *      Quyền cần: departments:read
   *      Nhận ID làm tham số và trả về chi tiết phòng ban (bao gồm tên phòng ban cha, số nhân viên).
   */
  @RequirePermission('departments:read')
  @Query(() => MealCorporateDepartmentModel__Resp, { name: 'mealDepartment' })
  findDepartment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findDepartment(mealCtxFromUser(user), id);
  }

  /**
   * [KO] Query: mealDepartments - 부서 목록 조회
   *      필요 권한: departments:read
   *      corporateId를 인자로 받아 해당 기업의 전체 부서 목록을 반환한다.
   *
   * [VI] Query: mealDepartments - Truy vấn danh sách phòng ban
   *      Quyền cần: departments:read
   *      Nhận corporateId làm tham số và trả về toàn bộ danh sách phòng ban của doanh nghiệp.
   */
  @RequirePermission('departments:read')
  @Query(() => MealCorporateDepartmentModel__ListResp, { name: 'mealDepartments' })
  listDepartments(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listDepartments(mealCtxFromUser(user), corporateId);
  }

  /**
   * [KO] Mutation: mealDepartmentCreate - 새 부서 생성
   *      필요 권한: departments:update
   *      CreateMealDepartmentInput을 입력으로 받아 새 부서를 생성한다.
   *
   * [VI] Mutation: mealDepartmentCreate - Tạo phòng ban mới
   *      Quyền cần: departments:update
   *      Nhận CreateMealDepartmentInput làm đầu vào để tạo phòng ban mới.
   */
  @RequirePermission('departments:update')
  @Mutation(() => MealCorporateDepartmentModel__Resp)
  mealDepartmentCreate(
    @Args('input') input: CreateMealDepartmentInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createDepartment(mealCtxFromUser(user), input);
  }

  /**
   * [KO] Query: mealEmployee - 임직원 단건 조회
   *      필요 권한: employees:read
   *      ID를 인자로 받아 임직원 상세 정보를 반환한다.
   *
   * [VI] Query: mealEmployee - Truy vấn chi tiết nhân viên
   *      Quyền cần: employees:read
   *      Nhận ID làm tham số và trả về thông tin chi tiết nhân viên.
   */
  @RequirePermission('employees:read')
  @Query(() => MealEmployeeModel__Resp, { name: 'mealEmployee' })
  findEmployee(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findEmployee(mealCtxFromUser(user), id);
  }

  /**
   * [KO] Query: mealEmployees - 임직원 목록 조회 (페이지네이션)
   *      필요 권한: employees:read
   *      corporateId와 페이지네이션(skip/take)을 인자로 받아 임직원 목록과 총 건수를 반환한다.
   *
   * [VI] Query: mealEmployees - Truy vấn danh sách nhân viên (phân trang)
   *      Quyền cần: employees:read
   *      Nhận corporateId và phân trang (skip/take) làm tham số, trả về danh sách nhân viên và tổng số.
   */
  @RequirePermission('employees:read')
  @Query(() => MealEmployeeModel__ListResp, { name: 'mealEmployees' })
  async listEmployees(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    const ctx = mealCtxFromUser(user);
    const [data, totalCount] = await this.service.listEmployeesWithCount(
      ctx,
      corporateId,
      pagination.skip,
      pagination.take,
    );
    return { data, totalCount };
  }

  /**
   * [KO] Mutation: mealEmployeeCreate - 새 임직원 생성
   *      필요 권한: employees:update
   *      CreateMealEmployeeInput을 입력으로 받아 새 임직원을 생성한다.
   *
   * [VI] Mutation: mealEmployeeCreate - Tạo nhân viên mới
   *      Quyền cần: employees:update
   *      Nhận CreateMealEmployeeInput làm đầu vào để tạo nhân viên mới.
   */
  @RequirePermission('employees:update')
  @Mutation(() => MealEmployeeModel__Resp)
  mealEmployeeCreate(
    @Args('input') input: CreateMealEmployeeInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createEmployee(mealCtxFromUser(user), input);
  }

  @RequirePermission('employees:update')
  @Mutation(() => MealEmployeeModel__Resp, { name: 'mealEmployeeUpdate' })
  async mealEmployeeUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('fullName', { type: () => String, nullable: true }) fullName: string | null,
    @Args('email', { type: () => String, nullable: true }) email: string | null,
    @Args('phone', { type: () => String, nullable: true }) phone: string | null,
    @Args('departmentId', { type: () => String, nullable: true }) departmentId: string | null,
    @CurrentUser() user: JwtPayload,
  ) {
    const data: Record<string, string | null | undefined> = {};
    if (fullName !== null) data.fullName = fullName;
    if (email !== null) data.email = email;
    if (phone !== null) data.phone = phone;
    if (departmentId !== undefined) data.departmentId = departmentId;
    return this.service.updateEmployee(mealCtxFromUser(user), id, data);
  }

  @RequirePermission('employees:update')
  @Mutation(() => MealEmployeeModel__Resp, { name: 'mealEmployeeSuspend' })
  mealEmployeeSuspend(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.suspendEmployee(mealCtxFromUser(user), id);
  }

  @RequirePermission('employees:update')
  @Mutation(() => MealEmployeeModel__Resp, { name: 'mealEmployeeTerminate' })
  mealEmployeeTerminate(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.terminateEmployee(mealCtxFromUser(user), id);
  }

  // ─── Invoice Schedule ───

  /**
   * [KO] Mutation: mealCorporateUpdateInvoiceSchedule - 청구서 스케줄 설정 업데이트
   *      필요 권한: corp_policies:update
   *      기업의 청구서 자동 발행 스케줄(유형, 기준일, 자동 생성/제출 여부, 알림 이메일)을 수정한다.
   *      인자:
   *      - corporateId: 대상 기업 ID
   *      - scheduleType: 스케줄 유형 (MONTHLY/WEEKLY/BIWEEKLY/CUSTOM)
   *      - scheduleDay: 발행 기준일 (1~28, nullable)
   *      - autoGenerate: 자동 생성 여부 (nullable)
   *      - autoSubmit: 자동 제출 여부 (nullable)
   *      - notifyEmail: 알림 이메일 (nullable)
   *
   * [VI] Mutation: mealCorporateUpdateInvoiceSchedule - Cập nhật thiết lập lịch hóa đơn
   *      Quyền cần: corp_policies:update
   *      Cập nhật lịch phát hành hóa đơn tự động (loại, ngày cơ sở, tự động tạo/gửi, email thông báo).
   *      Tham số:
   *      - corporateId: ID doanh nghiệp đích
   *      - scheduleType: Loại lịch (MONTHLY/WEEKLY/BIWEEKLY/CUSTOM)
   *      - scheduleDay: Ngày phát hành cơ sở (1~28, nullable)
   *      - autoGenerate: Tự động tạo hay không (nullable)
   *      - autoSubmit: Tự động gửi hay không (nullable)
   *      - notifyEmail: Email thông báo (nullable)
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealCorporateModel__Resp)
  mealCorporateUpdateInvoiceSchedule(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args('scheduleType', { type: () => String }) scheduleType: string,
    @Args('scheduleDay', { type: () => Int, nullable: true }) scheduleDay: number | null,
    @Args('autoGenerate', { type: () => Boolean, nullable: true }) autoGenerate: boolean | undefined,
    @Args('autoSubmit', { type: () => Boolean, nullable: true }) autoSubmit: boolean | undefined,
    @Args('notifyEmail', { type: () => String, nullable: true }) notifyEmail: string | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateInvoiceSchedule(
      mealCtxFromUser(user),
      corporateId,
      scheduleType,
      scheduleDay,
      autoGenerate,
      autoSubmit,
      notifyEmail,
    );
  }

  // ─── VMealApp Employee Login (dev-friendly, phone-based) ───

  /**
   * [KO] Mutation: mealEmployeeLogin - 임직원 전화번호 로그인 (VMealApp 전용)
   *      인증 불필요(@Public). 전화번호 + corporateId로 임직원을 조회하여 JWT를 발급한다.
   *
   * [VI] Mutation: mealEmployeeLogin - Dang nhap nhan vien bang so dien thoai (danh cho VMealApp)
   *      Khong can xac thuc (@Public). Tim nhan vien bang so dien thoai + corporateId va cap JWT.
   */
  @Public()
  @Mutation(() => MealEmployeeLoginResp)
  async mealEmployeeLogin(
    @Args('phone', { type: () => String }) phone: string,
    @Args('corporateId', { type: () => ID }) corporateId: string,
  ) {
    return this.service.employeeLogin(phone, corporateId);
  }

  // ───── Corporate Admins

  @Query(() => CorporateAdminUserModel__ListResp, { name: 'corporateAdmins' })
  async corporateAdmins(
    @Args('corporateId', { type: () => ID }) corporateId: string,
  ) {
    return this.service.listAdmins(corporateId);
  }
}
