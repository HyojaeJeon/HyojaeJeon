/**
 * 한국어: RolePermissionPair — Matrix 탭 bulk fetch 용 (roleId, permissionId) pair.
 * Tiếng Việt: Cặp (roleId, permissionId) để nạp hàng loạt cho tab Matrix.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RolePermissionPairModel {
  @Field(() => ID) roleId!: string;
  @Field(() => ID) permissionId!: string;
}
