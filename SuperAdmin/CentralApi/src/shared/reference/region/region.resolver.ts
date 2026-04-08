/**
 * 한국어: Region 리졸버 — 지역 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록/단건 조회는 @Public(), 생성/수정은 PLATFORM_SUPER_ADMIN 전용.
 *
 * Tiếng Việt: Resolver Region — endpoint GraphQL Query/Mutation quản lý khu vực.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RegionService } from './region.service';
import { RegionModel } from './models/region.model';
import { CreateRegionInput } from './dto/create-region.input';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { Public } from '@core/auth/decorators/public.decorator';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const RegionModel__ListResp = createListResponse(RegionModel, 'RegionModelListResponse');
const RegionModel__Resp = createObjectResponse(RegionModel, 'RegionModelResponse');

@Resolver(() => RegionModel)
export class RegionResolver {
  constructor(private readonly regionService: RegionService) {}

  @Public()
  @Query(() => RegionModel__ListResp)
  async regions(@Args() pagination: PaginationArgs): Promise<RegionModel[]> {
    return this.regionService.findAll(pagination.skip, pagination.take);
  }

  @Public()
  @Query(() => RegionModel__Resp, { nullable: true })
  async region(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RegionModel | null> {
    return this.regionService.findById(id);
  }

  @Mutation(() => RegionModel__Resp)
  async createRegion(
    @Args('input') input: CreateRegionInput,
  ): Promise<RegionModel> {
    return this.regionService.create(input);
  }

  @Mutation(() => RegionModel__Resp)
  async updateRegion(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateRegionInput,
  ): Promise<RegionModel> {
    return this.regionService.update(id, input);
  }
}
