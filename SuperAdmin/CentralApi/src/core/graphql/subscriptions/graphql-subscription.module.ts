import { Global, Module } from '@nestjs/common';
import { GraphqlSubscriptionBusService } from './graphql-subscription-bus.service';

@Global()
@Module({
  providers: [GraphqlSubscriptionBusService],
  exports: [GraphqlSubscriptionBusService],
})
export class GraphqlSubscriptionModule {}
