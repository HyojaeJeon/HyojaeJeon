/**
 * 한국어: Currency 리졸버 — 통화 관리 GraphQL Query/Mutation 엔드포인트.
 *         목록 조회(currencies)와 단건 조회(currency)는 @Public()으로 인증 없이 접근 가능하다.
 *         통화 생성(createCurrency)과 수정(updateCurrency)은 PLATFORM_SUPER_ADMIN 역할만 허용한다.
 * Tiếng Việt: Resolver Currency — endpoint GraphQL Query/Mutation quản lý tiền tệ.
 *             Truy vấn danh sách (currencies) và đơn lẻ (currency) có thể truy cập không cần xác thực qua @Public().
 *             Tạo (createCurrency) và sửa (updateCurrency) tiền tệ chỉ cho phép vai trò PLATFORM_SUPER_ADMIN.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReferenceService } from '../reference.service';
import { CurrencyModel } from '../models/currency.model';
import { CreateCurrencyInput } from '../dto/create-currency.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => CurrencyModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class CurrencyResolver {
  constructor(private readonly referenceService: ReferenceService) {}

  /**
   * 한국어: 전체 통화 페이지네이션 조회 (공개 API — 인증 불필요).
   *         참조 데이터이므로 누구나 조회 가능하다.
   * Tiếng Việt: Truy vấn phân trang tất cả tiền tệ (API công khai — không cần xác thực).
   *             Vì là dữ liệu tham chiếu nên ai cũng có thể truy vấn.
   */
  @Public()
  @Query(() => [CurrencyModel])
  async currencies(@Args() pagination: PaginationArgs): Promise<CurrencyModel[]> {
    return this.referenceService.findAllCurrencies(pagination.skip, pagination.take);
  }

  /**
   * 한국어: 통화 단건 조회 (공개 API — 인증 불필요). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ tiền tệ (API công khai — không cần xác thực). Trả về null nếu không tồn tại.
   */
  @Public()
  @Query(() => CurrencyModel, { nullable: true })
  async currency(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CurrencyModel | null> {
    return this.referenceService.findCurrency(id);
  }

  /**
   * 한국어: 새 통화 생성 — PLATFORM_SUPER_ADMIN 전용.
   * Tiếng Việt: Tạo tiền tệ mới — chỉ dành cho PLATFORM_SUPER_ADMIN.
   */
  @Mutation(() => CurrencyModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async createCurrency(
    @Args('input') input: CreateCurrencyInput,
  ): Promise<CurrencyModel> {
    return this.referenceService.createCurrency(input);
  }

  /**
   * 한국어: 통화 수정 — PLATFORM_SUPER_ADMIN 전용. ID로 대상을 지정한다.
   * Tiếng Việt: Cập nhật tiền tệ — chỉ dành cho PLATFORM_SUPER_ADMIN. Chỉ định đối tượng bằng ID.
   */
  @Mutation(() => CurrencyModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async updateCurrency(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateCurrencyInput,
  ): Promise<CurrencyModel> {
    return this.referenceService.updateCurrency(id, input);
  }
}
