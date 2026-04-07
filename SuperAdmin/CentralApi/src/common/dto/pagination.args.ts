/**
 * 한국어: GraphQL 쿼리의 페이지네이션(오프셋 기반) 공통 인자 정의.
 *   목록 조회 리졸버에서 @Args()와 함께 사용하여 skip(건너뛸 개수)과 take(가져올 개수)를
 *   표준화된 방식으로 받을 수 있게 한다.
 *   class-validator 데코레이터를 통해 입력값 유효성 검증을 수행한다.
 *   - skip: 최소 0 (기본값 0)
 *   - take: 최소 1, 최대 100 (기본값 20) - 과도한 데이터 조회를 방지
 *
 * Tiếng Việt: Định nghĩa tham số phân trang (dựa trên offset) chung cho truy vấn GraphQL.
 *   Sử dụng cùng @Args() trong resolver truy vấn danh sách để nhận skip (số lượng bỏ qua)
 *   và take (số lượng lấy) theo cách chuẩn hóa.
 *   Thực hiện xác thực giá trị đầu vào thông qua decorator class-validator.
 *   - skip: Tối thiểu 0 (mặc định 0)
 *   - take: Tối thiểu 1, tối đa 100 (mặc định 20) - ngăn chặn truy vấn dữ liệu quá mức
 */
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  /**
   * 한국어: 건너뛸 레코드 수. 오프셋 기반 페이지네이션의 시작 위치를 결정한다.
   *   예: skip=20이면 처음 20개를 건너뛰고 21번째부터 반환한다.
   *
   * Tiếng Việt: Số bản ghi cần bỏ qua. Xác định vị trí bắt đầu của phân trang dựa trên offset.
   *   Ví dụ: skip=20 sẽ bỏ qua 20 bản ghi đầu tiên và trả về từ bản ghi thứ 21.
   */
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  /**
   * 한국어: 가져올 레코드 수. 한 페이지에 반환할 최대 레코드 개수를 결정한다.
   *   최대 100개로 제한하여 서버 과부하를 방지한다.
   *
   * Tiếng Việt: Số bản ghi cần lấy. Xác định số lượng bản ghi tối đa trả về trong một trang.
   *   Giới hạn tối đa 100 để ngăn quá tải máy chủ.
   */
  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;
}
