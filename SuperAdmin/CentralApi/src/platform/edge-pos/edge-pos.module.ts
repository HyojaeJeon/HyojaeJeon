/**
 * 한국어: EdgePos 모듈 — Edge POS 단말기 도메인 단일 leaf.
 *   GraphQL resolver (등록/조회/삭제) + REST controller (POS 단말 인증) 를 묶는다.
 *
 * Tiếng Việt: Module EdgePos — leaf duy nhất domain thiết bị Edge POS.
 */
import { Module } from '@nestjs/common';
import { EdgePosResolver } from './edge-pos.resolver';
import { EdgePosService } from './edge-pos.service';
import { EdgePosAuthController } from './edge-pos-auth.controller';
import { AuthModule } from '@platform/superadmin/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EdgePosAuthController],
  providers: [EdgePosResolver, EdgePosService],
  exports: [EdgePosService],
})
export class EdgePosModule {}
