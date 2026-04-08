/**
 * 한국어: MealCorporate GraphQL 리졸버.
 *   모든 read/write 핸들러가 MealCallerCtx 를 service 에 전달하여 corporate scope 를 강제하도록 한다.
 * Tiếng Việt: GraphQL resolver MealCorporate — luôn truyền MealCallerCtx.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { mealCtxFromUser } from '../_internal/caller-ctx';
import { MealCorporateService } from './corporate.service';
import { MealCorporateModel } from './models/meal-corporate.model';
import { MealCorporateDepartmentModel } from './models/meal-corporate-department.model';
import { MealEmployeeModel } from './models/meal-employee.model';
import { CreateMealCorporateInput } from './dto/create-meal-corporate.input';
import { UpdateMealCorporateInput } from './dto/update-meal-corporate.input';
import { CreateMealDepartmentInput } from './dto/create-meal-department.input';
import { CreateMealEmployeeInput } from './dto/create-meal-employee.input';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const MealCorporateDepartmentModel__ListResp = createListResponse(MealCorporateDepartmentModel, 'MealCorporateDepartmentModelListResponse');
const MealCorporateDepartmentModel__Resp = createObjectResponse(MealCorporateDepartmentModel, 'MealCorporateDepartmentModelResponse');
const MealCorporateModel__ListResp = createListResponse(MealCorporateModel, 'MealCorporateModelListResponse');
const MealCorporateModel__Resp = createObjectResponse(MealCorporateModel, 'MealCorporateModelResponse');
const MealEmployeeModel__ListResp = createListResponse(MealEmployeeModel, 'MealEmployeeModelListResponse');
const MealEmployeeModel__Resp = createObjectResponse(MealEmployeeModel, 'MealEmployeeModelResponse');

@Resolver(() => MealCorporateModel)
export class MealCorporateResolver {
  constructor(private readonly service: MealCorporateService) {}

  @RequirePermission('corporate.profile.read')
  @Query(() => MealCorporateModel__ListResp, { name: 'mealCorporates' })
  list(@Args() pagination: PaginationArgs, @CurrentUser() user: JwtPayload) {
    return this.service.list(mealCtxFromUser(user), pagination.skip, pagination.take);
  }

  @RequirePermission('corporate.profile.read')
  @Query(() => MealCorporateModel__Resp, { name: 'mealCorporate' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.profile.write')
  @Mutation(() => MealCorporateModel__Resp)
  mealCorporateCreate(
    @Args('input') input: CreateMealCorporateInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.profile.write')
  @Mutation(() => MealCorporateModel__Resp)
  mealCorporateUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMealCorporateInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(mealCtxFromUser(user), id, input);
  }

  @RequirePermission('corporate.profile.write')
  @Mutation(() => BooleanResponse)
  mealCorporateDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(mealCtxFromUser(user), id);
  }

  @RequirePermission('corporate.department.read')
  @Query(() => MealCorporateDepartmentModel__ListResp, { name: 'mealDepartments' })
  listDepartments(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listDepartments(mealCtxFromUser(user), corporateId);
  }

  @RequirePermission('corporate.department.write')
  @Mutation(() => MealCorporateDepartmentModel__Resp)
  mealDepartmentCreate(
    @Args('input') input: CreateMealDepartmentInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createDepartment(mealCtxFromUser(user), input);
  }

  @RequirePermission('corporate.employee.read')
  @Query(() => MealEmployeeModel__ListResp, { name: 'mealEmployees' })
  listEmployees(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listEmployees(
      mealCtxFromUser(user),
      corporateId,
      pagination.skip,
      pagination.take,
    );
  }

  @RequirePermission('corporate.employee.write')
  @Mutation(() => MealEmployeeModel__Resp)
  mealEmployeeCreate(
    @Args('input') input: CreateMealEmployeeInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createEmployee(mealCtxFromUser(user), input);
  }
}
