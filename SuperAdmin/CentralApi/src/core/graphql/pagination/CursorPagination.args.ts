/**
 * 한국어:
 *   커서 기반 페이지네이션(Cursor-based Pagination) 인자 클래스.
 *   "책갈피(bookmark)" 방식으로 동작합니다: "이 책갈피 이후의 항목 50개를 주세요" 같은 요청을 만듭니다.
 *
 *   오프셋 페이지네이션(OFFSET)과의 차이:
 *   - 오프셋: "100번째부터 50개" -> 데이터가 많아지면 느려짐 (앞의 100개를 건너뛰어야 함)
 *   - 커서: "이 지점 이후 50개" -> 데이터가 아무리 많아도 일정한 속도 유지
 *
 * Tiếng Việt:
 *   Lớp tham số phân trang dựa trên con trỏ (Cursor-based Pagination).
 *   Hoạt động giống như "dấu trang (bookmark)": "Cho tôi 50 mục sau dấu trang này".
 *
 *   So sánh với phân trang offset:
 *   - Offset: "Lấy 50 mục từ vị trí 100" -> chậm dần khi dữ liệu lớn (phải bỏ qua 100 mục đầu)
 *   - Cursor: "Lấy 50 mục sau điểm này" -> tốc độ ổn định dù dữ liệu rất lớn
 */
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// 한국어: @ArgsType() — 이 클래스의 필드들이 GraphQL 쿼리의 인자(arguments)로 사용됨을 선언합니다.
// Tiếng Việt: @ArgsType() — Khai báo các trường trong lớp này được dùng làm tham số (arguments) cho truy vấn GraphQL.
@ArgsType()
export class CursorPaginationArgs {
  /**
   * 한국어: 이전 페이지의 마지막 항목을 가리키는 커서(책갈피) 문자열.
   *   첫 페이지를 요청할 때는 비워두고, 다음 페이지를 요청할 때 이전 응답의 endCursor 값을 넣습니다.
   * Tiếng Việt: Chuỗi con trỏ (dấu trang) trỏ đến mục cuối cùng của trang trước.
   *   Để trống khi yêu cầu trang đầu tiên; khi yêu cầu trang tiếp theo, truyền giá trị endCursor từ phản hồi trước.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  /**
   * 한국어: 한 번에 가져올 항목 수. 기본값 50, 최소 1, 최대 200.
   *   서버 부하를 방지하기 위해 200개까지만 허용합니다.
   * Tiếng Việt: Số mục cần lấy mỗi lần. Mặc định 50, tối thiểu 1, tối đa 200.
   *   Giới hạn 200 để tránh quá tải server.
   */
  @Field(() => Int, { defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  first: number = 50;
}
