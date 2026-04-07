/**
 * 한국어: CreateCurrency 입력 DTO — 통화 생성/수정 시 사용하는 GraphQL InputType.
 *         class-validator 데코레이터로 입력값의 유효성을 검증한다.
 *         decimalDigits는 0 이상의 정수만 허용한다 (예: KRW=0, USD=2).
 * Tiếng Việt: DTO đầu vào CreateCurrency — GraphQL InputType dùng khi tạo/sửa tiền tệ.
 *             Xác thực giá trị đầu vào bằng decorator class-validator.
 *             decimalDigits chỉ cho phép số nguyên >= 0 (ví dụ: KRW=0, USD=2).
 */
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateCurrencyInput {
  /** 한국어: 통화 코드 (ISO 4217, 필수) / Tiếng Việt: Mã tiền tệ (ISO 4217, bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  /** 한국어: 통화 이름 (필수) / Tiếng Việt: Tên tiền tệ (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  currencyName!: string;

  /** 한국어: 통화 심볼 (필수, 예: '₩', '₫') / Tiếng Việt: Ký hiệu tiền tệ (bắt buộc, ví dụ: '₩', '₫') */
  @Field()
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  /** 한국어: 소수점 자릿수 (정수, 0 이상) / Tiếng Việt: Số chữ số thập phân (số nguyên, >= 0) */
  @Field(() => Int)
  @IsInt()
  @Min(0)
  decimalDigits!: number;

  /** 한국어: 반올림 모드 (필수, 예: 'HALF_UP', 'FLOOR') / Tiếng Việt: Chế độ làm tròn (bắt buộc, ví dụ: 'HALF_UP', 'FLOOR') */
  @Field()
  @IsString()
  @IsNotEmpty()
  roundingMode!: string;
}
