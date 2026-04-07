/**
 * 한국어: SuperAdmin 사용자 GraphQL 모델.
 *   GraphQL 스키마에서 SuperAdminUser 엔티티를 표현하는 ObjectType이다.
 *   Prisma의 SuperAdminUser 테이블 레코드와 1:1 대응한다.
 *   인증 관련 민감 필드(passwordHash 등)는 제외되어 있다.
 *
 * Tiếng Việt: Model GraphQL người dùng SuperAdmin.
 *   ObjectType biểu diễn entity SuperAdminUser trong schema GraphQL.
 *   Tương ứng 1:1 với bản ghi bảng SuperAdminUser của Prisma.
 *   Các trường nhạy cảm liên quan đến xác thực (passwordHash, v.v.) đã bị loại trừ.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SuperAdminUserModel {
  /** 한국어: 사용자 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất người dùng (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 로그인 ID / Tiếng Việt: ID đăng nhập */
  @Field()
  loginId!: string;

  /** 한국어: 화면 표시 이름 / Tiếng Việt: Tên hiển thị */
  @Field()
  displayName!: string;

  /** 한국어: 이메일 주소 (선택) / Tiếng Việt: Địa chỉ email (tùy chọn) */
  @Field(() => String, { nullable: true })
  email?: string | null;

  /** 한국어: 전화번호 (선택) / Tiếng Việt: Số điện thoại (tùy chọn) */
  @Field(() => String, { nullable: true })
  phone?: string | null;

  /** 한국어: 역할 코드 (RoleCode enum 값) / Tiếng Việt: Mã vai trò (giá trị enum RoleCode) */
  @Field()
  roleCode!: string;

  /** 한국어: 계정 상태 (예: Active, Suspended) / Tiếng Việt: Trạng thái tài khoản (vd: Active, Suspended) */
  @Field()
  status!: string;

  /** 한국어: 마지막 로그인 시각 (선택) / Tiếng Việt: Thời gian đăng nhập cuối (tùy chọn) */
  @Field(() => Date, { nullable: true })
  lastLoginAt?: Date | null;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;
}
