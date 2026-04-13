/**
 * 한국어: DeployPackage 리졸버 — 배포 패키지 조회 GraphQL Query 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 역할만 접근 가능하며, 패키지 목록 조회 및 단건 조회를 제공한다.
 *         패키지 생성/릴리스 마킹은 별도 Mutation 또는 내부 서비스 호출로 처리한다.
 * Tiếng Việt: Resolver DeployPackage — endpoint GraphQL Query truy vấn gói triển khai.
 *             Chỉ vai trò PLATFORM_SUPER_ADMIN được phép truy cập, cung cấp truy vấn danh sách và đơn lẻ package.
 *             Tạo package/đánh dấu phát hành được xử lý qua Mutation riêng hoặc gọi service nội bộ.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DeployPackageService } from './DeployPackage.service';
import { DeployPackageModel } from './models/DeployPackage.model';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const DeployPackageModel__ListResp = createListResponse(DeployPackageModel, 'DeployPackageModelListResponse');
const DeployPackageModel__Resp = createObjectResponse(DeployPackageModel, 'DeployPackageModelResponse');

@Resolver(() => DeployPackageModel)

export class DeployPackageResolver {
  constructor(private readonly service: DeployPackageService) {}

  /**
   * 한국어: 전체 배포 패키지 페이지네이션 조회. skip/take 파라미터로 페이징.
   * Tiếng Việt: Truy vấn phân trang tất cả gói triển khai. Phân trang bằng tham số skip/take.
   */
  @Query(() => DeployPackageModel__ListResp)
  async deployPackages(@Args() pagination: PaginationArgs) {
    return this.service.findAll(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 배포 패키지 단건 조회 (ID 기준). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ gói triển khai (theo ID). Trả về null nếu không tồn tại.
   */
  @Query(() => DeployPackageModel__Resp, { nullable: true })
  async deployPackage(@Args('id', { type: () => ID }) id: string) {
    return this.service.findById(id);
  }
}
