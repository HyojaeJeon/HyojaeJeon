/**
 * 한국어: License 리졸버 — 플랫폼 라이선스 관리 GraphQL Query/Mutation 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 역할만 접근 가능하며, 라이선스 조회(전체/스코프별/단건) 및
 *         논리 삭제(soft-delete) 기능을 제공한다.
 * Tiếng Việt: Resolver License — endpoint GraphQL Query/Mutation quản lý license nền tảng.
 *             Chỉ vai trò PLATFORM_SUPER_ADMIN được phép truy cập, cung cấp các chức năng
 *             truy vấn license (tất cả/theo scope/đơn lẻ) và xóa logic (soft-delete).
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LicenseService } from '../services/license.service';
import { PlatformLicenseModel } from '../models/platform-license.model';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => PlatformLicenseModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class LicenseResolver {
  constructor(private readonly service: LicenseService) {}

  /**
   * 한국어: 전체 라이선스 페이지네이션 조회. skip/take 파라미터로 페이징.
   * Tiếng Việt: Truy vấn phân trang tất cả license. Phân trang bằng tham số skip/take.
   */
  @Query(() => [PlatformLicenseModel])
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async licenses(@Args() pagination: PaginationArgs) {
    return this.service.findAll(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 특정 스코프(scopeType + scopeId)에 속한 라이선스 목록 조회.
   *         예: scopeType='BrandHQ', scopeId='uuid-xxx' → 해당 브랜드 본사의 라이선스 반환.
   * Tiếng Việt: Truy vấn danh sách license thuộc scope cụ thể (scopeType + scopeId).
   *             Ví dụ: scopeType='BrandHQ', scopeId='uuid-xxx' → trả về license của trụ sở thương hiệu đó.
   */
  @Query(() => [PlatformLicenseModel])
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async licensesByScope(
    @Args('scopeType') scopeType: string,
    @Args('scopeId', { type: () => ID }) scopeId: string,
  ) {
    return this.service.findByScope(scopeType, scopeId);
  }

  /**
   * 한국어: 라이선스 단건 조회 (ID 기준). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ license (theo ID). Trả về null nếu không tồn tại.
   */
  @Query(() => PlatformLicenseModel, { nullable: true })
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async license(@Args('id', { type: () => ID }) id: string) {
    return this.service.findById(id);
  }

  /**
   * 한국어: 라이선스 논리 삭제 — 실제 DB 레코드를 지우지 않고 deletedAt을 기록한다.
   *         감사(audit) 추적을 위해 물리 삭제 대신 논리 삭제를 사용한다.
   * Tiếng Việt: Xóa logic license — không xóa bản ghi DB thực tế mà ghi lại deletedAt.
   *             Sử dụng xóa logic thay vì xóa vật lý để theo dõi kiểm toán (audit).
   */
  @Mutation(() => Boolean)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async deleteLicense(@Args('id', { type: () => ID }) id: string) {
    return this.service.softDelete(id);
  }
}
