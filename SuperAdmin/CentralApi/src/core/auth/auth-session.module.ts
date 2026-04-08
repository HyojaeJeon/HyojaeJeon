import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { TenancyModule } from '@core/tenancy/tenancy.module';
import { AuthSessionService } from './auth-session.service';

@Global()
@Module({
  imports: [PrismaModule, TenancyModule],
  providers: [AuthSessionService],
  exports: [AuthSessionService],
})
export class AuthSessionModule {}
