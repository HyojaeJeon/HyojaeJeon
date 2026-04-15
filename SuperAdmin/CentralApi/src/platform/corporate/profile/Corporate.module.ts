/**
 * [KO] CorporateModule - 식권 고객 기업 NestJS 모듈
 *      식권(Meal Voucher) 서비스의 고객 기업(Corporate) / 부서(Department) / 임직원(Employee) 도메인을 묶는다.
 *
 *      포함하는 프로바이더:
 *      - MealCorporateService: 기업/부서/임직원 CRUD 비즈니스 로직 서비스
 *      - MealCorporateResolver: GraphQL Query/Mutation 핸들러 (리졸버)
 *
 *      외부로 export하는 서비스:
 *      - MealCorporateService: 다른 모듈(예: wallet, settlement, einvoice)에서
 *        기업 정보를 조회할 때 사용할 수 있도록 export한다.
 *
 * [VI] CorporateModule - Module NestJS doanh nghiệp khách hàng phiếu ăn
 *      Gom nhóm domain doanh nghiệp (Corporate) / phòng ban (Department) / nhân viên (Employee)
 *      của dịch vụ phiếu ăn (Meal Voucher).
 *
 *      Provider bao gồm:
 *      - MealCorporateService: Service xử lý logic nghiệp vụ CRUD doanh nghiệp/phòng ban/nhân viên
 *      - MealCorporateResolver: Handler GraphQL Query/Mutation (resolver)
 *
 *      Service export ra ngoài:
 *      - MealCorporateService: Export để các module khác (ví dụ: wallet, settlement, einvoice)
 *        có thể tra cứu thông tin doanh nghiệp.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createJwtModuleOptions } from '@core/auth/JwtOptions.factory';
import { MealCorporateService } from './Corporate.service';
import { MealCorporateResolver } from './Corporate.resolver';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createJwtModuleOptions,
    }),
  ],
  providers: [MealCorporateService, MealCorporateResolver],
  exports: [MealCorporateService],
})
export class CorporateModule {}
