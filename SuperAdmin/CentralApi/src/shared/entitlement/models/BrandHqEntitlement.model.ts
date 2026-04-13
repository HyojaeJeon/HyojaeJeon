/**
 * 한국어: BrandHqEntitlement GraphQL 모델.
 * Tiếng Việt: Model GraphQL của BrandHqEntitlement.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BrandHqEntitlementModel {
  @Field(() => ID)
  id!: string;

  @Field()
  brandHqId!: string;

  @Field()
  capability!: string; // 'POS' | 'MEAL_TICKET' | ...

  @Field()
  status!: string; // 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED' | 'REVOKED'

  @Field()
  activatedAt!: Date;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null;

  @Field()
  grantedBySuperAdminId!: string;

  @Field(() => Date, { nullable: true })
  revokedAt?: Date | null;

  @Field(() => String, { nullable: true })
  revokeReason?: string | null;

  @Field(() => String, { nullable: true })
  contractRef?: string | null;

  @Field(() => String, { nullable: true })
  licenseId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
