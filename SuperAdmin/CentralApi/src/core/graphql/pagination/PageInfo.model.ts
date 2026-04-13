/**
 * 한국어:
 *   페이지네이션 메타데이터 모델.
 *   목록(list) 조회 응답에 함께 반환되어, 클라이언트(프론트엔드)에게
 *   "다음 페이지가 있는지", "이전 페이지가 있는지", "어디서부터 이어서 조회할지"를 알려줍니다.
 *
 * Tiếng Việt:
 *   Mô hình metadata phân trang.
 *   Được trả về cùng với phản hồi truy vấn danh sách, giúp client (frontend) biết
 *   "có trang tiếp theo không", "có trang trước không", và "bắt đầu truy vấn tiếp từ đâu".
 */
import { Field, ObjectType } from '@nestjs/graphql';

// 한국어: @ObjectType() — 이 클래스가 GraphQL 응답(output)으로 사용되는 타입임을 선언합니다.
// Tiếng Việt: @ObjectType() — Khai báo lớp này là kiểu dữ liệu đầu ra (output) trong GraphQL.
@ObjectType()
export class PageInfoModel {
  /**
   * 한국어: 다음 페이지가 존재하는지 여부. true이면 더 가져올 데이터가 있습니다.
   * Tiếng Việt: Có trang tiếp theo hay không. Nếu true, còn dữ liệu để lấy thêm.
   */
  @Field()
  hasNextPage!: boolean;

  /**
   * 한국어: 이전 페이지가 존재하는지 여부. true이면 앞쪽에 더 데이터가 있습니다.
   * Tiếng Việt: Có trang trước hay không. Nếu true, có dữ liệu phía trước.
   */
  @Field()
  hasPreviousPage!: boolean;

  /**
   * 한국어: 현재 페이지의 첫 번째 항목을 가리키는 커서(책갈피). 이전 페이지로 이동할 때 사용합니다.
   * Tiếng Việt: Con trỏ (dấu trang) trỏ đến mục đầu tiên của trang hiện tại. Dùng khi muốn quay lại trang trước.
   */
  @Field(() => String, { nullable: true })
  startCursor?: string | null;

  /**
   * 한국어: 현재 페이지의 마지막 항목을 가리키는 커서(책갈피). 다음 페이지를 요청할 때 이 값을 after에 넣습니다.
   * Tiếng Việt: Con trỏ (dấu trang) trỏ đến mục cuối cùng của trang hiện tại. Truyền giá trị này vào after khi yêu cầu trang tiếp theo.
   */
  @Field(() => String, { nullable: true })
  endCursor?: string | null;
}
