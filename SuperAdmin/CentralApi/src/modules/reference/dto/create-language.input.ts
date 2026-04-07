/**
 * 한국어: CreateLanguage 입력 DTO — 언어 생성/수정 시 사용하는 GraphQL InputType.
 *         languageCode, nativeName, displayName은 필수이며,
 *         direction('LTR'/'RTL'), isDefault, isActive는 선택적 필드로 기본값을 제공한다.
 * Tiếng Việt: DTO đầu vào CreateLanguage — GraphQL InputType dùng khi tạo/sửa ngôn ngữ.
 *             languageCode, nativeName, displayName là bắt buộc,
 *             direction ('LTR'/'RTL'), isDefault, isActive là trường tùy chọn với giá trị mặc định.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateLanguageInput {
  /** 한국어: 언어 코드 (BCP-47/ISO 639-1, 필수) / Tiếng Việt: Mã ngôn ngữ (BCP-47/ISO 639-1, bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  languageCode!: string;

  /** 한국어: 원어 이름 (필수, 예: '한국어', 'Tiếng Việt') / Tiếng Việt: Tên bản địa (bắt buộc, ví dụ: '한국어', 'Tiếng Việt') */
  @Field()
  @IsString()
  @IsNotEmpty()
  nativeName!: string;

  /** 한국어: 표시용 이름 (필수, 예: 'Korean', 'Vietnamese') / Tiếng Việt: Tên hiển thị (bắt buộc, ví dụ: 'Korean', 'Vietnamese') */
  @Field()
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  /** 한국어: 텍스트 방향 (기본값: 'LTR') / Tiếng Việt: Hướng văn bản (mặc định: 'LTR') */
  @Field({ nullable: true, defaultValue: 'LTR' })
  @IsOptional()
  @IsString()
  direction?: string;

  /** 한국어: 기본 언어 여부 (기본값: false) / Tiếng Việt: Có phải ngôn ngữ mặc định không (mặc định: false) */
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  /** 한국어: 활성 상태 (기본값: true) / Tiếng Việt: Trạng thái hoạt động (mặc định: true) */
  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
