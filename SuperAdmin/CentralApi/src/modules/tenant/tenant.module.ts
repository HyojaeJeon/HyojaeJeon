/**
 * 한국어: 테넌트(Tenant) 모듈.
 *   플랫폼의 멀티테넌트 구조를 관리하는 NestJS 모듈이다.
 *   대리점(Distributor), 브랜드(Brand), 지점(Branch), Edge POS 터미널의
 *   리졸버(Resolver)와 서비스(Service)를 등록하고 내보낸다.
 *   계층 구조: Distributor -> Brand -> Branch -> EdgePosTerminal
 *
 * Tiếng Việt: Module Tenant (Đối tác thuê).
 *   Module NestJS quản lý cấu trúc multi-tenant của nền tảng.
 *   Đăng ký và export các Resolver và Service cho Distributor (Đại lý),
 *   Brand (Thương hiệu), Branch (Chi nhánh), và Edge POS Terminal.
 *   Cấu trúc phân cấp: Distributor -> Brand -> Branch -> EdgePosTerminal
 */
import { Module } from '@nestjs/common';
import { DistributorResolver } from './resolvers/distributor.resolver';
import { BrandResolver } from './resolvers/brand.resolver';
import { BranchResolver } from './resolvers/branch.resolver';
import { EdgePosResolver } from './resolvers/edge-pos.resolver';
import { DistributorService } from './services/distributor.service';
import { BrandService } from './services/brand.service';
import { BranchService } from './services/branch.service';
import { EdgePosService } from './services/edge-pos.service';

@Module({
  providers: [
    // 한국어: GraphQL 리졸버 등록 / Tiếng Việt: Đăng ký các GraphQL resolver
    DistributorResolver,
    BrandResolver,
    BranchResolver,
    EdgePosResolver,
    // 한국어: 비즈니스 로직 서비스 등록 / Tiếng Việt: Đăng ký các service logic nghiệp vụ
    DistributorService,
    BrandService,
    BranchService,
    EdgePosService,
  ],
  // 한국어: 다른 모듈에서 사용할 수 있도록 서비스를 내보냄
  // Tiếng Việt: Export các service để có thể sử dụng từ các module khác
  exports: [DistributorService, BrandService, BranchService, EdgePosService],
})
export class TenantModule {}
