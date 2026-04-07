/**
 * 한국어: Reference 모듈 — 플랫폼 공통 참조 데이터(언어, 지역, 통화)를 관리하는 NestJS 모듈.
 *         언어(Language), 지역(Region), 통화(Currency)는 플랫폼 전체에서 공유되는 마스터 데이터이며,
 *         각각 독립 GraphQL 리졸버를 통해 CRUD 엔드포인트를 노출한다.
 *         ReferenceService를 단일 서비스로 유지하여 3개 엔티티의 공통 CRUD 로직을 집중 관리한다.
 * Tiếng Việt: Module Reference — module NestJS quản lý dữ liệu tham chiếu chung nền tảng (ngôn ngữ, khu vực, tiền tệ).
 *             Ngôn ngữ (Language), Khu vực (Region), Tiền tệ (Currency) là dữ liệu master dùng chung toàn nền tảng,
 *             mỗi loại cung cấp endpoint CRUD qua resolver GraphQL độc lập.
 *             Duy trì ReferenceService như một service duy nhất để quản lý tập trung logic CRUD chung cho 3 entity.
 */
import { Module } from '@nestjs/common';
import { LanguageResolver } from './resolvers/language.resolver';
import { RegionResolver } from './resolvers/region.resolver';
import { CurrencyResolver } from './resolvers/currency.resolver';
import { ReferenceService } from './reference.service';

@Module({
  providers: [ReferenceService, LanguageResolver, RegionResolver, CurrencyResolver],
})
export class ReferenceModule {}
