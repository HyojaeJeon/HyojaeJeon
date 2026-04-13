import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EInvoiceProviderConfigModel } from './EinvoiceProviderConfig.model';

@ObjectType()
export class EInvoiceProviderModel {
  @Field(() => ID) id!: string;
  @Field() providerType!: string;
  @Field() displayName!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() isActive!: boolean;
  @Field(() => [EInvoiceProviderConfigModel]) configs!: EInvoiceProviderConfigModel[];
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
