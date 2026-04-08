/**
 * 한국어: Currency 리졸버 — 통화 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록/단건 조회는 @Public(), 생성/수정은 PLATFORM_SUPER_ADMIN 전용.
 *
 * Tiếng Việt: Resolver Currency — endpoint GraphQL Query/Mutation quản lý tiền tệ.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';
import { CurrencyModel } from './models/currency.model';
import { CreateCurrencyInput } from './dto/create-currency.input';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { Public } from '@core/auth/decorators/public.decorator';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const CurrencyModel__ListResp = createListResponse(CurrencyModel, 'CurrencyModelListResponse');
const CurrencyModel__Resp = createObjectResponse(CurrencyModel, 'CurrencyModelResponse');

@Resolver(() => CurrencyModel)
export class CurrencyResolver {
  constructor(private readonly currencyService: CurrencyService) {}

  @Public()
  @Query(() => CurrencyModel__ListResp)
  async currencies(@Args() pagination: PaginationArgs): Promise<CurrencyModel[]> {
    return this.currencyService.findAll(pagination.skip, pagination.take);
  }

  @Public()
  @Query(() => CurrencyModel__Resp, { nullable: true })
  async currency(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CurrencyModel | null> {
    return this.currencyService.findById(id);
  }

  @Mutation(() => CurrencyModel__Resp)
  async createCurrency(
    @Args('input') input: CreateCurrencyInput,
  ): Promise<CurrencyModel> {
    return this.currencyService.create(input);
  }

  @Mutation(() => CurrencyModel__Resp)
  async updateCurrency(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateCurrencyInput,
  ): Promise<CurrencyModel> {
    return this.currencyService.update(id, input);
  }
}
