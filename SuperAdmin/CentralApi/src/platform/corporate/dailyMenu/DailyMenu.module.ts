/**
 * [KO] 일일 메뉴 및 사전 주문 NestJS 모듈
 *
 * 이 모듈은 일일 메뉴(MealDailyMenu)와 사전 주문(MealPreOrder) 도메인의
 * provider를 등록하고 외부에 공개한다.
 *
 * 구성:
 * - providers:
 *   - MealDailyMenuService: 일일 메뉴 CRUD + 사전 주문 비즈니스 로직
 *   - MealDailyMenuResolver: GraphQL 쿼리/뮤테이션 진입점
 * - exports:
 *   - MealDailyMenuService: 다른 모듈에서 일일 메뉴/사전 주문 서비스를 사용할 수 있도록 공개
 *
 * 이 모듈은 corporate 그룹의 leaf 모듈이다.
 * PrismaService 등 의존성은 상위 모듈에서 전역으로 등록되어 자동 주입된다.
 *
 * [VI] Module NestJS thuc don hang ngay va dat hang truoc
 *
 * Module nay dang ky cac provider cua domain thuc don hang ngay (MealDailyMenu)
 * va dat hang truoc (MealPreOrder) roi cong khai ra ngoai.
 *
 * Cau hinh:
 * - providers:
 *   - MealDailyMenuService: logic nghiep vu CRUD thuc don + dat truoc
 *   - MealDailyMenuResolver: diem vao GraphQL query/mutation
 * - exports:
 *   - MealDailyMenuService: cong khai de cac module khac su dung
 *
 * Day la leaf module trong nhom corporate.
 * Cac dependency nhu PrismaService duoc dang ky toan cuc tu module cha va tu dong inject.
 */
import { Module } from '@nestjs/common';
import { MealDailyMenuService } from './DailyMenu.service';
import { MealDailyMenuResolver } from './DailyMenu.resolver';

@Module({
  providers: [MealDailyMenuService, MealDailyMenuResolver],
  exports: [MealDailyMenuService],
})
export class DailyMenuModule {}
