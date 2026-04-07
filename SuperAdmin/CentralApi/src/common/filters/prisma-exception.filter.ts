/**
 * 한국어: Prisma ORM에서 발생하는 알려진 데이터베이스 오류를 GraphQL 표준 에러로 변환하는 예외 필터.
 *   Prisma의 PrismaClientKnownRequestError를 가로채어, 에러 코드에 따라
 *   적절한 HTTP 상태 코드와 GraphQL 에러 코드를 가진 GraphQLError로 변환한다.
 *   이를 통해 클라이언트에게 일관된 에러 응답 형식을 제공한다.
 *
 * Tiếng Việt: Bộ lọc ngoại lệ chuyển đổi các lỗi cơ sở dữ liệu đã biết từ Prisma ORM
 *   sang lỗi chuẩn GraphQL. Chặn PrismaClientKnownRequestError của Prisma và chuyển đổi
 *   thành GraphQLError với mã trạng thái HTTP và mã lỗi GraphQL phù hợp theo mã lỗi.
 *   Nhờ đó cung cấp định dạng phản hồi lỗi nhất quán cho phía client.
 */
import { Catch, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements GqlExceptionFilter {
  /**
   * 한국어: Prisma 오류 코드별로 적절한 GraphQL 에러를 생성하여 반환한다.
   *   - P2002: 유니크 제약 조건 위반 (CONFLICT, 409) - 중복 데이터 삽입 시도 시 발생
   *   - P2025: 레코드 미발견 (NOT_FOUND, 404) - 존재하지 않는 레코드 조회/수정 시 발생
   *   - P2003: 외래 키 제약 조건 실패 (BAD_REQUEST, 400) - 참조 무결성 위반 시 발생
   *   - 기타: 예상치 못한 DB 오류 (INTERNAL_SERVER_ERROR, 500)
   *
   * Tiếng Việt: Tạo và trả về GraphQL error phù hợp theo từng mã lỗi Prisma.
   *   - P2002: Vi phạm ràng buộc unique (CONFLICT, 409) - xảy ra khi cố chèn dữ liệu trùng lặp
   *   - P2025: Không tìm thấy bản ghi (NOT_FOUND, 404) - xảy ra khi truy vấn/sửa bản ghi không tồn tại
   *   - P2003: Lỗi ràng buộc khóa ngoại (BAD_REQUEST, 400) - xảy ra khi vi phạm tính toàn vẹn tham chiếu
   *   - Khác: Lỗi DB không mong đợi (INTERNAL_SERVER_ERROR, 500)
   */
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      // 한국어: P2002 - 유니크 제약 조건 위반. meta.target에서 위반된 필드명을 추출하여 에러 메시지에 포함.
      // Tiếng Việt: P2002 - Vi phạm ràng buộc unique. Trích xuất tên trường vi phạm từ meta.target để đưa vào thông báo lỗi.
      case 'P2002': {
        return new GraphQLError('Resource already exists', {
          extensions: { code: 'CONFLICT', http: { status: HttpStatus.CONFLICT } },
        });
      }
      // 한국어: P2025 - 조회/수정 대상 레코드가 존재하지 않음
      // Tiếng Việt: P2025 - Bản ghi cần truy vấn/sửa đổi không tồn tại
      case 'P2025':
        return new GraphQLError('Record not found', {
          extensions: { code: 'NOT_FOUND', http: { status: HttpStatus.NOT_FOUND } },
        });
      // 한국어: P2003 - 외래 키 참조 대상이 존재하지 않아 제약 조건 실패
      // Tiếng Việt: P2003 - Đối tượng tham chiếu khóa ngoại không tồn tại, ràng buộc thất bại
      case 'P2003':
        return new GraphQLError('Foreign key constraint failed', {
          extensions: { code: 'BAD_REQUEST', http: { status: HttpStatus.BAD_REQUEST } },
        });
      // 한국어: 기타 알려진 Prisma 에러 코드는 500으로 일괄 처리
      // Tiếng Việt: Các mã lỗi Prisma đã biết khác được xử lý chung là 500
      default:
        return new GraphQLError('Internal server error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR', http: { status: HttpStatus.INTERNAL_SERVER_ERROR } },
        });
    }
  }
}
