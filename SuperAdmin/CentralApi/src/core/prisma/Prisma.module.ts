/**
 * 한국어: Prisma ORM 서비스를 전역(Global) 모듈로 제공하는 NestJS 모듈.
 *   @Global() 데코레이터를 통해 애플리케이션 전체에서 PrismaService를 import 없이 주입받을 수 있다.
 *   AppModule에서 한 번만 import하면, 모든 하위 모듈의 서비스/리졸버에서
 *   PrismaService를 constructor 주입으로 사용할 수 있다.
 *   이는 중앙 PostgreSQL 데이터베이스와의 연결을 단일 지점에서 관리하기 위한 구조이다.
 *
 * Tiếng Việt: Module NestJS cung cấp dịch vụ Prisma ORM dưới dạng module toàn cục (Global).
 *   Thông qua decorator @Global(), PrismaService có thể được inject ở toàn bộ ứng dụng
 *   mà không cần import. Chỉ cần import một lần tại AppModule, tất cả service/resolver
 *   của các module con đều có thể sử dụng PrismaService qua constructor injection.
 *   Đây là cấu trúc để quản lý kết nối đến cơ sở dữ liệu PostgreSQL trung tâm tại một điểm duy nhất.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './Prisma.service';

@Global()
@Module({
  // 한국어: PrismaService를 이 모듈의 프로바이더로 등록
  // Tiếng Việt: Đăng ký PrismaService làm provider của module này
  providers: [PrismaService],

  // 한국어: PrismaService를 외부 모듈에서 사용할 수 있도록 내보내기
  // Tiếng Việt: Export PrismaService để các module bên ngoài có thể sử dụng
  exports: [PrismaService],
})
export class PrismaModule {}
