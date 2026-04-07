/**
 * 한국어: 카탈로그(Catalog) 모듈.
 *   브랜드 본사의 메뉴 카테고리, 메뉴 항목, 가격 정책, 프로모션을 관리하는 NestJS 모듈이다.
 *   각 도메인별 리졸버(Resolver)와 서비스(Service)를 등록하고 내보낸다.
 *   이 모듈의 데이터는 브랜드 본사(BrandHQ) 단위로 관리되며,
 *   Edge POS로 동기화될 마스터 데이터의 원본이다.
 *
 * Tiếng Việt: Module Danh mục (Catalog).
 *   Module NestJS quản lý danh mục menu, mục menu, chính sách giá, và khuyến mãi
 *   của trụ sở thương hiệu. Đăng ký và export các Resolver và Service theo từng domain.
 *   Dữ liệu của module này được quản lý theo đơn vị trụ sở thương hiệu (BrandHQ),
 *   và là nguồn gốc của master data sẽ được đồng bộ sang Edge POS.
 */
import { Module } from '@nestjs/common';
import { MenuCategoryResolver } from './resolvers/menu-category.resolver';
import { MenuItemResolver } from './resolvers/menu-item.resolver';
import { PricePolicyResolver } from './resolvers/price-policy.resolver';
import { PromotionResolver } from './resolvers/promotion.resolver';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuItemService } from './services/menu-item.service';
import { PricePolicyService } from './services/price-policy.service';
import { PromotionService } from './services/promotion.service';

@Module({
  providers: [
    // 한국어: GraphQL 리졸버 등록 / Tiếng Việt: Đăng ký các GraphQL resolver
    MenuCategoryResolver,
    MenuItemResolver,
    PricePolicyResolver,
    PromotionResolver,
    // 한국어: 비즈니스 로직 서비스 등록 / Tiếng Việt: Đăng ký các service logic nghiệp vụ
    MenuCategoryService,
    MenuItemService,
    PricePolicyService,
    PromotionService,
  ],
  // 한국어: 다른 모듈에서 사용할 수 있도록 서비스를 내보냄
  // Tiếng Việt: Export các service để có thể sử dụng từ các module khác
  exports: [MenuCategoryService, MenuItemService, PricePolicyService, PromotionService],
})
export class CatalogModule {}
