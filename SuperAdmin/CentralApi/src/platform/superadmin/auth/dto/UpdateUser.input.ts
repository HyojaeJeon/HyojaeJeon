/**
 * 한국어: 공통 사용자 수정 입력 DTO.
 *   기존 사용자 정보를 부분 수정할 때 사용되는 GraphQL InputType이다.
 *   모든 필드가 선택(optional)이므로, 변경하고 싶은 필드만 전달하면 된다.
 *   roleCode는 DB Role 테이블에서 검증된다.
 *
 * Tiếng Việt: DTO đầu vào cập nhật người dùng SuperAdmin.
 *   Là GraphQL InputType được sử dụng khi cập nhật một phần thông tin người dùng SuperAdmin hiện tại.
 *   Tất cả các trường đều tùy chọn (optional), chỉ cần truyền các trường muốn thay đổi.
 *   roleCode được xác thực từ bảng Role trong DB.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateAuthAccountInput {
  /** 한국어: 화면 표시 이름 (선택) / Tiếng Việt: Tên hiển thị (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  /** 한국어: 이메일 주소 (선택, 형식 검증) / Tiếng Việt: Địa chỉ email (tùy chọn, kiểm tra định dạng) */
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  /** 한국어: 전화번호 (선택) / Tiếng Việt: Số điện thoại (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  /**
   * 변경할 Role 의 코드 (선택). 값이 들어오면 기존 글로벌 ACTIVE assignment 를 atomic 하게 회수하고
   * 새 Role 의 assignment 를 생성한다. DB Role 테이블에서 검증된다.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roleCode?: string;

  /** 한국어: 계정 상태 (선택, 예: 'Active', 'Suspended') / Tiếng Việt: Trạng thái tài khoản (tùy chọn, vd: 'Active', 'Suspended') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
