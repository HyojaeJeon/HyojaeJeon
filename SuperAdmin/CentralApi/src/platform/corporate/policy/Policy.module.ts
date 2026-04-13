/**
 * [KO] 식권 정책(MealPolicy) NestJS 모듈
 *
 * 이 모듈은 식권 정책 도메인의 provider를 등록하고 외부에 공개합니다.
 *
 * 구성:
 * - providers:
 *   - MealPolicyService: 정책 CRUD, 상태 전이, 정책 평가 비즈니스 로직
 *   - MealPolicyResolver: GraphQL 쿼리/뮤테이션 진입점
 * - exports:
 *   - MealPolicyService: 다른 모듈(예: transaction 모듈)에서
 *     evaluateForEmployee()를 호출할 수 있도록 외부 공개
 *
 * 이 모듈은 corporate 그룹의 leaf 모듈입니다.
 * PrismaService, EntitlementService, PermissionService 등 의존성은
 * 상위 모듈(Corporate.module.ts)에서 전역으로 등록되어 자동 주입됩니다.
 *
 * [VI] Module NestJS chinh sach phieu an (MealPolicy)
 *
 * Module nay dang ky cac provider cua domain chinh sach phieu an va cong khai ra ngoai.
 *
 * Cau hinh:
 * - providers:
 *   - MealPolicyService: logic nghiep vu CRUD, chuyen trang thai, danh gia chinh sach
 *   - MealPolicyResolver: diem vao GraphQL query/mutation
 * - exports:
 *   - MealPolicyService: cong khai de cac module khac (vi du: transaction)
 *     co the goi evaluateForEmployee()
 *
 * Day la leaf module trong nhom corporate.
 * Cac dependency nhu PrismaService, EntitlementService, PermissionService
 * duoc dang ky toan cuc tu module cha (Corporate.module.ts) va tu dong inject.
 */
import { Module } from '@nestjs/common';
import { MealPolicyService } from './Policy.service';
import { MealPolicyResolver } from './Policy.resolver';

@Module({
  providers: [MealPolicyService, MealPolicyResolver],
  exports: [MealPolicyService],
})
export class PolicyModule {}
