import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateEInvoiceProviderConfigInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) baseUrl?: string;
  @Field({ nullable: true }) credentialsVaultRef?: string;
  @Field({ nullable: true }) defaultSerialPrefix?: string;
  @Field({ nullable: true }) defaultFormNo?: string;
  @Field({ nullable: true }) defaultSerialType?: string;
  @Field({ nullable: true }) defaultCurrencyCode?: string;
  @Field({ nullable: true }) defaultPaymentMethod?: string;
  @Field(() => ID, { nullable: true }) failoverProviderId?: string;
  @Field({ nullable: true }) isActive?: boolean;
}
