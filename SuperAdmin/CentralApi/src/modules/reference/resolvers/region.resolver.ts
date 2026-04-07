/**
 * 한국어: Region 리졸버 — 지역 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록 조회(regions)와 단건 조회(region)는 @Public()으로 인증 없이 접근 가능하다.
 *         지역 생성(createRegion)과 수정(updateRegion)은 PLATFORM_SUPER_ADMIN 역할만 허용한다.
 * Tiếng Việt: Resolver Region — endpoint GraphQL Query/Mutation quản lý khu vực.
 *             Truy vấn danh sách (regions) và đơn lẻ (region) có thể truy cập không cần xác thực qua @Public().
 *             Tạo (createRegion) và sửa (updateRegion) khu vực chỉ cho phép vai trò PLATFORM_SUPER_ADMIN.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReferenceService } from '../reference.service';
import { RegionModel } from '../models/region.model';
import { CreateRegionInput } from '../dto/create-region.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => RegionModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class RegionResolver {
  constructor(private readonly referenceService: ReferenceService) {}

  /**
   * 한국어: 전체 지역 페이지네이션 조회 (공개 API — 인증 불필요).
   *         클라이언트가 사용 가능한 지역/국가 목록을 가져올 수 있다.
   * Tiếng Việt: Truy vấn phân trang tất cả khu vực (API công khai — không cần xác thực).
   *             Client có thể lấy danh sách khu vực/quốc gia khả dụng.
   */
  @Public()
  @Query(() => [RegionModel])
  async regions(@Args() pagination: PaginationArgs): Promise<RegionModel[]> {
    return this.referenceService.findAllRegions(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 지역 단건 조회 (공개 API — 인증 불필요). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ khu vực (API công khai — không cần xác thực). Trả về null nếu không tồn tại.
   */
  @Public()
  @Query(() => RegionModel, { nullable: true })
  async region(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RegionModel | null> {
    return this.referenceService.findRegion(id);
  }

  /**
   * 한국어: 새 지역 생성 — PLATFORM_SUPER_ADMIN 전용.
   * Tiếng Việt: Tạo khu vực mới — chỉ dành cho PLATFORM_SUPER_ADMIN.
   */
  @Mutation(() => RegionModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async createRegion(
    @Args('input') input: CreateRegionInput,
  ): Promise<RegionModel> {
    return this.referenceService.createRegion(input);
  }

  /**
   * 한국어: 지역 수정 — PLATFORM_SUPER_ADMIN 전용. ID로 대상을 지정한다.
   * Tiếng Việt: Cập nhật khu vực — chỉ dành cho PLATFORM_SUPER_ADMIN. Chỉ định đối tượng bằng ID.
   */
  @Mutation(() => RegionModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async updateRegion(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateRegionInput,
  ): Promise<RegionModel> {
    return this.referenceService.updateRegion(id, input);
  }
}
