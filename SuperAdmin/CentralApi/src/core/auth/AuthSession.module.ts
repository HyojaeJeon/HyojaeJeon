/**
 * 한국어:
 *   AuthSessionModule — 인증 세션 서비스를 조립하는 NestJS 모듈입니다.
 *   @Global() 데코레이터 덕분에 이 모듈을 다른 모듈에서 따로 import 하지 않아도
 *   앱 전체에서 AuthSessionService 를 주입(inject)받아 사용할 수 있습니다.
 *
 *   가져오는 모듈:
 *   - ConfigModule : .env 파일의 환경 변수(JWT_SECRET 등)를 읽기 위해
 *   - PrismaModule : 데이터베이스(DB)에 세션 레코드를 저장/조회하기 위해
 *   - TenancyModule : 멀티테넌트(여러 회사/브랜드) 스코프를 결정하기 위해
 *
 * Tiếng Việt:
 *   AuthSessionModule — Module NestJS lắp ráp dịch vụ phiên xác thực.
 *   Nhờ decorator @Global(), các module khác không cần import riêng —
 *   AuthSessionService có thể được inject ở bất kỳ đâu trong ứng dụng.
 *
 *   Các module được import:
 *   - ConfigModule : để đọc biến môi trường (.env) như JWT_SECRET
 *   - PrismaModule : để lưu/truy vấn bản ghi phiên trong cơ sở dữ liệu
 *   - TenancyModule : để xác định phạm vi multi-tenant (nhiều công ty/thương hiệu)
 */
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@core/prisma/Prisma.module';
import { TenancyModule } from '@core/tenancy/Tenancy.module';
import { AuthSessionService } from './AuthSession.service';

// @Global() — 이 모듈을 앱 전역에서 사용 가능하게 합니다 (다른 모듈에서 import 불필요)
// @Global() — Cho phép sử dụng module này trên toàn ứng dụng (không cần import ở module khác)
@Global()
@Module({
  imports: [ConfigModule, PrismaModule, TenancyModule],
  providers: [AuthSessionService],   // 이 모듈이 생성하는 서비스 / Dịch vụ mà module này tạo ra
  exports: [AuthSessionService],     // 외부에 공개하는 서비스 / Dịch vụ được export ra ngoài
})
export class AuthSessionModule {}
