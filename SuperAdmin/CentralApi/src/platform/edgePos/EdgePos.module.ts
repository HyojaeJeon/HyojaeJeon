/**
 * 한국어: EdgePos 모듈 — Edge POS 단말기 도메인 단일 leaf.
 *   GraphQL resolver (등록/조회/삭제) + REST controller (POS 단말 인증) 를 묶는다.
 *
 * Tiếng Việt: Module EdgePos — leaf duy nhất domain thiết bị Edge POS.
 */
import { Module } from '@nestjs/common';
import { EdgePosResolver } from './EdgePos.resolver';
import { EdgePosService } from './EdgePos.service';
import { EdgePosAuthController } from './EdgePosAuth.controller';
import { AuthModule } from '@platform/superadmin/auth/Auth.module';
import { LicenseModule } from '@platform/superadmin/license/License.module';

@Module({
  imports: [AuthModule, LicenseModule],
  controllers: [EdgePosAuthController],
  providers: [EdgePosResolver, EdgePosService],
  exports: [EdgePosService],
})
export class EdgePosModule {}
