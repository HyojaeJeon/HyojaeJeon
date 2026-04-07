/**
 * 한국어: SuperAdmin 인증 GraphQL 리졸버.
 *   로그인, 사용자 조회, 사용자 생성/수정/삭제, 비밀번호 변경 등의
 *   GraphQL Query 및 Mutation 엔드포인트를 정의한다.
 *   GqlAuthGuard와 RolesGuard를 통해 인증 및 역할 기반 접근 제어를 적용한다.
 *
 * Tiếng Việt: GraphQL resolver xác thực SuperAdmin.
 *   Định nghĩa các endpoint GraphQL Query và Mutation cho đăng nhập,
 *   truy vấn người dùng, tạo/cập nhật/xóa người dùng, và thay đổi mật khẩu.
 *   Áp dụng xác thực và kiểm soát truy cập dựa trên vai trò thông qua GqlAuthGuard và RolesGuard.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SuperAdminUserModel } from './models/super-admin-user.model';
import { AuthPayload } from './models/auth-payload.model';
import { LoginInput } from './dto/login.input';
import { CreateSuperAdminUserInput } from './dto/create-user.input';
import { UpdateSuperAdminUserInput } from './dto/update-user.input';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleCode } from './constants/roles.constant';

/**
 * 한국어: SuperAdminUserModel을 대상으로 하는 GraphQL 리졸버.
 *   기본적으로 모든 엔드포인트에 GqlAuthGuard(JWT 인증)와 RolesGuard(역할 검증)를 적용한다.
 *
 * Tiếng Việt: GraphQL resolver nhắm đến SuperAdminUserModel.
 *   Mặc định áp dụng GqlAuthGuard (xác thực JWT) và RolesGuard (xác minh vai trò) cho tất cả endpoint.
 */
@Resolver(() => SuperAdminUserModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * 한국어: 로그인 Mutation. @Public() 데코레이터로 인증 없이 접근 가능하다.
   *   loginId와 password를 받아 JWT 토큰과 사용자 정보를 반환한다.
   *
   * Tiếng Việt: Mutation đăng nhập. Có thể truy cập không cần xác thực nhờ decorator @Public().
   *   Nhận loginId và password, trả về JWT token và thông tin người dùng.
   */
  @Public()
  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.loginId, input.password);
  }

  /**
   * 한국어: 현재 로그인한 사용자의 정보를 조회하는 Query.
   *   JWT 토큰에서 추출한 사용자 ID(sub)로 DB에서 사용자를 찾는다.
   *
   * Tiếng Việt: Query truy vấn thông tin người dùng đang đăng nhập.
   *   Tìm người dùng từ DB bằng user ID (sub) trích xuất từ JWT token.
   */
  @Query(() => SuperAdminUserModel)
  async me(@CurrentUser() user: JwtPayload): Promise<SuperAdminUserModel> {
    const found = await this.authService.findById(user.sub);
    if (!found) throw new Error('User not found');
    return found;
  }

  /**
   * 한국어: 전체 SuperAdmin 사용자 목록을 조회하는 Query.
   *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다.
   *
   * Tiếng Việt: Query truy vấn danh sách tất cả người dùng SuperAdmin.
   *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập.
   */
  @Query(() => [SuperAdminUserModel])
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async superAdminUsers(@Args() pagination: PaginationArgs): Promise<SuperAdminUserModel[]> {
    return this.authService.findAll(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 특정 SuperAdmin 사용자를 ID로 조회하는 Query.
   *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다. 결과가 없으면 null을 반환한다.
   *
   * Tiếng Việt: Query truy vấn người dùng SuperAdmin cụ thể theo ID.
   *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập. Trả về null nếu không tìm thấy.
   */
  @Query(() => SuperAdminUserModel, { nullable: true })
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async superAdminUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SuperAdminUserModel | null> {
    return this.authService.findById(id);
  }

  /**
   * 한국어: 새 SuperAdmin 사용자를 생성하는 Mutation.
   *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다.
   *
   * Tiếng Việt: Mutation tạo người dùng SuperAdmin mới.
   *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập.
   */
  @Mutation(() => SuperAdminUserModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async createSuperAdminUser(
    @Args('input') input: CreateSuperAdminUserInput,
  ): Promise<SuperAdminUserModel> {
    return this.authService.create(input);
  }

  /**
   * 한국어: 기존 SuperAdmin 사용자의 정보를 수정하는 Mutation.
   *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다.
   *
   * Tiếng Việt: Mutation cập nhật thông tin người dùng SuperAdmin hiện tại.
   *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập.
   */
  @Mutation(() => SuperAdminUserModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async updateSuperAdminUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSuperAdminUserInput,
  ): Promise<SuperAdminUserModel> {
    return this.authService.update(id, input);
  }

  /**
   * 한국어: SuperAdmin 사용자를 소프트 삭제하는 Mutation.
   *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다. 실제 삭제가 아닌 deletedAt 설정 방식이다.
   *
   * Tiếng Việt: Mutation xóa mềm người dùng SuperAdmin.
   *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập. Không xóa thực tế mà đặt deletedAt.
   */
  @Mutation(() => Boolean)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async deleteSuperAdminUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.authService.softDelete(id);
  }

  /**
   * 한국어: 현재 로그인한 사용자의 비밀번호를 변경하는 Mutation.
   *   현재 비밀번호 검증 후 새 비밀번호로 변경한다.
   *
   * Tiếng Việt: Mutation thay đổi mật khẩu của người dùng đang đăng nhập.
   *   Thay đổi sang mật khẩu mới sau khi xác minh mật khẩu hiện tại.
   */
  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.authService.changePassword(user.sub, currentPassword, newPassword);
  }
}
