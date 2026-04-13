/**
 * 한국어: RBAC 권한 카탈로그 GraphQL 모델.
 *   Settings > RBAC Matrix 탭에서 표시하는 권한 카탈로그와 사이드바 트리 구조를
 *   `permissionCatalog` query 의 success.data 로 반환하기 위한 output 모델이다.
 *
 *   카탈로그는 고정 데이터(코드 정의)이므로 complexity 를 1 로 설정하여
 *   list 기본 10배 배수가 적용되지 않게 한다.
 *
 * Tiếng Việt: Model GraphQL cho catalog quyền RBAC.
 */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PermissionLabelModel {
  @Field({ complexity: 1 }) ko!: string;
  @Field({ complexity: 1 }) en!: string;
  @Field({ complexity: 1 }) vi!: string;
}

@ObjectType()
export class PermissionDefinitionModel {
  @Field({ complexity: 1 }) key!: string;
  @Field(() => PermissionLabelModel, { complexity: 1 }) label!: PermissionLabelModel;
}

@ObjectType()
export class PermissionCategoryModel {
  @Field({ complexity: 1 }) category!: string;
  @Field(() => PermissionLabelModel, { complexity: 1 }) label!: PermissionLabelModel;
  @Field(() => [PermissionDefinitionModel], { complexity: 1 }) permissions!: PermissionDefinitionModel[];
}

@ObjectType()
export class MenuPermissionNodeModel {
  @Field({ complexity: 1 }) id!: string;
  @Field({ complexity: 1 }) labelKey!: string;
  @Field(() => String, { nullable: true, complexity: 1 }) icon?: string | null;
  @Field(() => [String], { nullable: true, complexity: 1 }) categories?: string[] | null;
  @Field(() => [MenuPermissionNodeModel], { nullable: true, complexity: 1 }) children?: MenuPermissionNodeModel[] | null;
}

@ObjectType()
export class PermissionCatalogModel {
  @Field(() => [PermissionCategoryModel], { complexity: 1 }) categories!: PermissionCategoryModel[];
  @Field(() => [MenuPermissionNodeModel], { complexity: 1 }) menuStructure!: MenuPermissionNodeModel[];
}
