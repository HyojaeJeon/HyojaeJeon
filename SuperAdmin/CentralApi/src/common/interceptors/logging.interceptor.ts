/**
 * 한국어: GraphQL 요청/응답의 실행 시간을 측정하고 로깅하는 인터셉터.
 *   모든 GraphQL 리졸버 호출에 대해 작업명(operationType.fieldName)과
 *   처리 소요 시간(ms)을 NestJS Logger를 통해 기록한다.
 *   성능 모니터링, 느린 쿼리 탐지, 디버깅에 활용한다.
 *
 * Tiếng Việt: Interceptor đo lường và ghi log thời gian thực thi của yêu cầu/phản hồi GraphQL.
 *   Ghi lại tên thao tác (operationType.fieldName) và thời gian xử lý (ms)
 *   cho mọi lời gọi GraphQL resolver thông qua NestJS Logger.
 *   Sử dụng để giám sát hiệu suất, phát hiện truy vấn chậm, và gỡ lỗi.
 */
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * 한국어: 'GraphQL' 컨텍스트명으로 Logger 인스턴스를 생성한다.
   *   로그 출력 시 [GraphQL] 접두사가 붙어 GraphQL 관련 로그임을 쉽게 식별할 수 있다.
   *
   * Tiếng Việt: Tạo instance Logger với tên ngữ cảnh 'GraphQL'.
   *   Khi xuất log sẽ có tiền tố [GraphQL] giúp dễ dàng nhận diện log liên quan đến GraphQL.
   */
  private readonly logger = new Logger('GraphQL');

  /**
   * 한국어: 요청 처리 파이프라인에 끼어들어 실행 시간을 측정하는 메서드.
   *   1. GraphQL 실행 컨텍스트에서 작업 정보(fieldName, parentType)를 추출한다.
   *   2. 현재 시각을 기록하여 시작 시점을 저장한다.
   *   3. 응답 Observable의 tap 연산자로 완료 시점에 소요 시간을 계산하여 로깅한다.
   *   출력 형식: "Query.users — 42ms" 또는 "Mutation.createBranch — 120ms"
   *
   * Tiếng Việt: Phương thức xen vào pipeline xử lý yêu cầu để đo thời gian thực thi.
   *   1. Trích xuất thông tin thao tác (fieldName, parentType) từ ngữ cảnh thực thi GraphQL.
   *   2. Ghi lại thời điểm hiện tại làm mốc bắt đầu.
   *   3. Dùng toán tử tap của Observable phản hồi để tính thời gian xử lý tại thời điểm hoàn thành và ghi log.
   *   Định dạng đầu ra: "Query.users — 42ms" hoặc "Mutation.createBranch — 120ms"
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    // 한국어: GraphQL 필드명과 부모 타입(Query/Mutation/Subscription)을 추출
    // Tiếng Việt: Trích xuất tên trường GraphQL và kiểu cha (Query/Mutation/Subscription)
    const operationName = info?.fieldName ?? 'unknown';
    const parentType = info?.parentType?.name ?? 'unknown';

    // 한국어: 요청 시작 시각 기록 (밀리초 단위)
    // Tiếng Việt: Ghi lại thời điểm bắt đầu yêu cầu (đơn vị mili giây)
    const now = Date.now();

    return next.handle().pipe(
      // 한국어: 응답 완료 후 소요 시간을 계산하여 로그 출력
      // Tiếng Việt: Sau khi phản hồi hoàn thành, tính thời gian xử lý và xuất log
      tap(() => {
        this.logger.log(`${parentType}.${operationName} — ${Date.now() - now}ms`);
      }),
    );
  }
}
