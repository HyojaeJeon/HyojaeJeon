/**
 * 한국어: Contract 모듈 — 계약 lifecycle 관리.
 *   PrismaModule, AuditModule 은 @Global() 이므로 imports 불요.
 *   ContractService 를 export 하여 다른 모듈에서 주입 가능.
 *
 * Tiếng Việt: Module Contract — quản lý vòng đời hợp đồng.
 */
import { Module } from '@nestjs/common';
import { ContractService } from './Contract.service';
import { ContractResolver } from './Contract.resolver';

@Module({
  providers: [ContractService, ContractResolver],
  exports: [ContractService],
})
export class ContractModule {}
