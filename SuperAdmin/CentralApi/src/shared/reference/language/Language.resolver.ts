/**
 * 한국어: Language 리졸버 — 언어 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록/단건 조회는 @Public(), 생성/수정은 PLATFORM_SUPER_ADMIN 전용.
 *
 * Tiếng Việt: Resolver Language — endpoint GraphQL Query/Mutation quản lý ngôn ngữ.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LanguageService } from './Language.service';
import { LanguageModel } from './models/Language.model';
import { CreateLanguageInput } from './dto/CreateLanguage.input';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { Public } from '@core/auth/decorators/Public.decorator';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const LanguageModel__ListResp = createListResponse(LanguageModel, 'LanguageModelListResponse');
const LanguageModel__Resp = createObjectResponse(LanguageModel, 'LanguageModelResponse');

@Resolver(() => LanguageModel)
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Public()
  @Query(() => LanguageModel__ListResp)
  async languages(@Args() pagination: PaginationArgs): Promise<LanguageModel[]> {
    return this.languageService.findAll(pagination.skip, pagination.take);
  }

  @Public()
  @Query(() => LanguageModel__Resp, { nullable: true })
  async language(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LanguageModel | null> {
    return this.languageService.findById(id);
  }

  @Mutation(() => LanguageModel__Resp)
  async createLanguage(
    @Args('input') input: CreateLanguageInput,
  ): Promise<LanguageModel> {
    return this.languageService.create(input);
  }

  @Mutation(() => LanguageModel__Resp)
  async updateLanguage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateLanguageInput,
  ): Promise<LanguageModel> {
    return this.languageService.update(id, input);
  }
}
