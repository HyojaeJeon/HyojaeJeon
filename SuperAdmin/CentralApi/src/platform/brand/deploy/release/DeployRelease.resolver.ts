/**
 * 한국어: DeployRelease 리졸버 — 배포 릴리스 조회 GraphQL Query 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 역할만 접근 가능하며, 특정 스코프의 릴리스 목록 및 단건 조회를 제공한다.
 *         릴리스 생성/상태 변경은 별도 Mutation 또는 내부 서비스 호출로 처리한다.
 * Tiếng Việt: Resolver DeployRelease — endpoint GraphQL Query truy vấn bản phát hành.
 *             Chỉ vai trò PLATFORM_SUPER_ADMIN được phép truy cập, cung cấp truy vấn danh sách release
 *             theo scope cụ thể và truy vấn đơn lẻ.
 *             Tạo release/thay đổi trạng thái được xử lý qua Mutation riêng hoặc gọi service nội bộ.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DeployReleaseService } from './DeployRelease.service';
import { DeployReleaseModel } from './models/DeployRelease.model';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const DeployReleaseModel__ListResp = createListResponse(DeployReleaseModel, 'DeployReleaseModelListResponse');
const DeployReleaseModel__Resp = createObjectResponse(DeployReleaseModel, 'DeployReleaseModelResponse');

@Resolver(() => DeployReleaseModel)

export class DeployReleaseResolver {
  constructor(private readonly service: DeployReleaseService) {}

  /**
   * 한국어: 특정 스코프(scopeType + scopeId)의 릴리스 목록 페이지네이션 조회.
   *         예: scopeType='BRANCH', scopeId='uuid-xxx' → 해당 지점의 배포 이력 반환.
   * Tiếng Việt: Truy vấn phân trang danh sách release của scope cụ thể (scopeType + scopeId).
   *             Ví dụ: scopeType='Branch', scopeId='uuid-xxx' → trả về lịch sử triển khai của chi nhánh đó.
   */
  @Query(() => DeployReleaseModel__ListResp)
  async deployReleases(
    @Args('scopeType') scopeType: string,
    @Args('scopeId', { type: () => ID }) scopeId: string,
    @Args() pagination: PaginationArgs,
  ) {
    return this.service.findByScope(scopeType, scopeId, pagination.skip, pagination.take);
  }

  /**
   * 한국어: 릴리스 단건 조회 (ID 기준). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ release (theo ID). Trả về null nếu không tồn tại.
   */
  @Query(() => DeployReleaseModel__Resp, { nullable: true })
  async deployRelease(@Args('id', { type: () => ID }) id: string) {
    return this.service.findById(id);
  }
}
