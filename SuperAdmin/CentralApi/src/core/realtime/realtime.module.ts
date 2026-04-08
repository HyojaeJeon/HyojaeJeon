import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@core/redis/redis.module';
import { AuthSessionModule } from '@core/auth/auth-session.module';
import { createJwtModuleOptions } from '@core/auth/jwt-options.factory';
import { RealtimeService } from './realtime.service';
import { BrandRealtimePublisher } from './publishers/brand-realtime.publisher';
import { CorporateRealtimePublisher } from './publishers/corporate-realtime.publisher';
import { EdgePosRealtimePublisher } from './publishers/edge-pos-realtime.publisher';
import { CacheRealtimePublisher } from './publishers/cache-realtime.publisher';
import { SuperAdminRealtimePublisher } from './publishers/superadmin-realtime.publisher';
import { SyncRealtimePublisher } from './publishers/sync-realtime.publisher';

@Global()
@Module({
  imports: [
    RedisModule,
    AuthSessionModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createJwtModuleOptions,
    }),
  ],
  providers: [
    RealtimeService,
    SyncRealtimePublisher,
    BrandRealtimePublisher,
    CorporateRealtimePublisher,
    EdgePosRealtimePublisher,
    CacheRealtimePublisher,
    SuperAdminRealtimePublisher,
  ],
  exports: [
    RealtimeService,
    SyncRealtimePublisher,
    BrandRealtimePublisher,
    CorporateRealtimePublisher,
    EdgePosRealtimePublisher,
    CacheRealtimePublisher,
    SuperAdminRealtimePublisher,
  ],
})
export class RealtimeModule {}
