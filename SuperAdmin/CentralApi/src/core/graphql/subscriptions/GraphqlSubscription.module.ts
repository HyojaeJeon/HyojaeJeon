import { Global, Module } from '@nestjs/common';
import { GraphqlSubscriptionBusService } from './GraphqlSubscriptionBus.service';

@Global()
@Module({
  providers: [GraphqlSubscriptionBusService],
  exports: [GraphqlSubscriptionBusService],
})
export class GraphqlSubscriptionModule {}
