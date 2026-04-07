/**
 * 한국어: Language 리졸버 — 언어 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록 조회(languages)와 단건 조회(language)는 @Public()으로 인증 없이 접근 가능하다.
 *         언어 생성(createLanguage)과 수정(updateLanguage)은 PLATFORM_SUPER_ADMIN 역할만 허용한다.
 * Tiếng Việt: Resolver Language — endpoint GraphQL Query/Mutation quản lý ngôn ngữ.
 *             Truy vấn danh sách (languages) và đơn lẻ (language) có thể truy cập không cần xác thực qua @Public().
 *             Tạo (createLanguage) và sửa (updateLanguage) ngôn ngữ chỉ cho phép vai trò PLATFORM_SUPER_ADMIN.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReferenceService } from '../reference.service';
import { LanguageModel } from '../models/language.model';
import { CreateLanguageInput } from '../dto/create-language.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => LanguageModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class LanguageResolver {
  constructor(private readonly referenceService: ReferenceService) {}

  /**
   * 한국어: 전체 언어 페이지네이션 조회 (공개 API — 인증 불필요).
   *         i18n 지원을 위해 클라이언트가 사용 가능한 언어 목록을 가져올 수 있다.
   * Tiếng Việt: Truy vấn phân trang tất cả ngôn ngữ (API công khai — không cần xác thực).
   *             Client có thể lấy danh sách ngôn ngữ khả dụng để hỗ trợ i18n.
   */
  @Public()
  @Query(() => [LanguageModel])
  async languages(@Args() pagination: PaginationArgs): Promise<LanguageModel[]> {
    return this.referenceService.findAllLanguages(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 언어 단건 조회 (공개 API — 인증 불필요). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ ngôn ngữ (API công khai — không cần xác thực). Trả về null nếu không tồn tại.
   */
  @Public()
  @Query(() => LanguageModel, { nullable: true })
  async language(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LanguageModel | null> {
    return this.referenceService.findLanguage(id);
  }

  /**
   * 한국어: 새 언어 생성 — PLATFORM_SUPER_ADMIN 전용.
   * Tiếng Việt: Tạo ngôn ngữ mới — chỉ dành cho PLATFORM_SUPER_ADMIN.
   */
  @Mutation(() => LanguageModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async createLanguage(
    @Args('input') input: CreateLanguageInput,
  ): Promise<LanguageModel> {
    return this.referenceService.createLanguage(input);
  }

  /**
   * 한국어: 언어 수정 — PLATFORM_SUPER_ADMIN 전용. ID로 대상을 지정한다.
   * Tiếng Việt: Cập nhật ngôn ngữ — chỉ dành cho PLATFORM_SUPER_ADMIN. Chỉ định đối tượng bằng ID.
   */
  @Mutation(() => LanguageModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async updateLanguage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateLanguageInput,
  ): Promise<LanguageModel> {
    return this.referenceService.updateLanguage(id, input);
  }
}
