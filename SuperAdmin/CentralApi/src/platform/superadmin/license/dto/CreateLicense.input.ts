/**
 * 한국어: 라이선스 생성 입력 DTO — createLicense 뮤테이션에 필요한 필드를 정의한다.
 *         scopeType/scopeId로 대상 스코프를 지정하고, 라이선스 코드·유형·유효기간 등을 입력받는다.
 * Tiếng Việt: DTO đầu vào tạo license — định nghĩa các trường cần thiết cho mutation createLicense.
 *             Chỉ định scope đích bằng scopeType/scopeId, nhận mã license, loại, thời hạn hiệu lực v.v.
 */
import { Field, ID, InputType, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateLicenseInput {
  /** 한국어: 스코프 유형 (예: 'BRAND_HQ', 'BRANCH') / Tiếng Việt: Loại scope (ví dụ: 'BRAND_HQ', 'BRANCH') */
  @Field() scopeType!: string;

  /** 한국어: 스코프 대상 엔티티 ID / Tiếng Việt: ID entity đích của scope */
  @Field(() => ID) scopeId!: string;

  /** 한국어: 라이선스 유형 / Tiếng Việt: Loại license */
  @Field() licenseType!: string;

  /** 한국어: 라이선스 시작일 / Tiếng Việt: Ngày bắt đầu hiệu lực license */
  @Field(() => GraphQLISODateTime) effectiveFrom!: Date;

  /** 한국어: 라이선스 종료일 (미지정 시 무기한) / Tiếng Việt: Ngày kết thúc hiệu lực (không giới hạn nếu không chỉ định) */
  @Field(() => GraphQLISODateTime, { nullable: true }) effectiveTo?: Date;

  /** 한국어: 최대 지점 수 (기본 0) / Tiếng Việt: Số chi nhánh tối đa (mặc định 0) */
  @Field(() => Int, { defaultValue: 0 }) maxBranchCount!: number;

  /** 한국어: 최대 터미널 수 (기본 0) / Tiếng Việt: Số terminal tối đa (mặc định 0) */
  @Field(() => Int, { defaultValue: 0 }) maxTerminalCount!: number;

  /** 한국어: 허용 국가 코드 (예: 'VN', 'KR') / Tiếng Việt: Mã quốc gia cho phép (ví dụ: 'VN', 'KR') */
  @Field({ nullable: true }) allowedCountryCode?: string;

  /** 한국어: 라이선스 추가 페이로드 JSON / Tiếng Việt: JSON payload bổ sung của license */
  @Field(() => GraphQLJSON, { nullable: true }) licensePayloadJson?: object;
}
