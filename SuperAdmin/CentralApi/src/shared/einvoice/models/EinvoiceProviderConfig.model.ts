import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EInvoiceProviderConfigModel {
  @Field(() => ID) id!: string;
  @Field() providerId!: string;
  @Field() environment!: string;
  @Field() baseUrl!: string;
  @Field() credentialsVaultRef!: string;
  @Field() defaultSerialPrefix!: string;
  @Field() defaultFormNo!: string;
  @Field() defaultSerialType!: string;
  @Field() defaultCurrencyCode!: string;
  @Field() defaultPaymentMethod!: string;
  @Field(() => String, { nullable: true }) failoverProviderId?: string | null;
  @Field() isActive!: boolean;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
