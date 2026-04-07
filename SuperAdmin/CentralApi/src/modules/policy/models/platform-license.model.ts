/**
 * 한국어: PlatformLicense GraphQL 모델 — 플랫폼 라이선스 엔티티의 GraphQL ObjectType 정의.
 *         scope-polymorphic 패턴으로 scopeType/scopeId 조합을 통해
 *         Distributor, BrandHQ, Branch 등 다양한 스코프에 공통 적용 가능하다.
 *         licensePayloadJson은 라이선스별 커스텀 설정을 JSON으로 저장한다.
 * Tiếng Việt: Model GraphQL PlatformLicense — định nghĩa ObjectType GraphQL cho entity license nền tảng.
 *             Áp dụng mẫu scope-polymorphic qua tổ hợp scopeType/scopeId,
 *             có thể áp dụng chung cho nhiều scope như Distributor, BrandHQ, Branch.
 *             licensePayloadJson lưu trữ cấu hình tùy chỉnh theo từng license dạng JSON.
 */
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class PlatformLicenseModel {
  /** 한국어: 라이선스 고유 ID (UUID) / Tiếng Việt: ID duy nhất của license (UUID) */
  @Field(() => ID) id!: string;

  /** 한국어: 스코프 유형 (예: 'Distributor', 'BrandHQ', 'Branch') / Tiếng Việt: Loại scope (ví dụ: 'Distributor', 'BrandHQ', 'Branch') */
  @Field() scopeType!: string;

  /** 한국어: 스코프 대상 엔티티 ID / Tiếng Việt: ID entity đích của scope */
  @Field() scopeId!: string;

  /** 한국어: 라이선스 코드 (고유 식별 문자열) / Tiếng Việt: Mã license (chuỗi định danh duy nhất) */
  @Field() licenseCode!: string;

  /** 한국어: 라이선스 유형 (예: 'Trial', 'Standard', 'Enterprise') / Tiếng Việt: Loại license (ví dụ: 'Trial', 'Standard', 'Enterprise') */
  @Field() licenseType!: string;

  /** 한국어: 라이선스 상태 (예: 'Active', 'Suspended', 'Expired') / Tiếng Việt: Trạng thái license (ví dụ: 'Active', 'Suspended', 'Expired') */
  @Field() status!: string;

  /** 한국어: 라이선스 유효 시작일 / Tiếng Việt: Ngày bắt đầu hiệu lực license */
  @Field() effectiveFrom!: Date;

  /** 한국어: 라이선스 유효 종료일 (null이면 무기한) / Tiếng Việt: Ngày kết thúc hiệu lực license (null = vô thời hạn) */
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;

  /** 한국어: 허용 최대 지점 수 / Tiếng Việt: Số chi nhánh tối đa được phép */
  @Field(() => Int) maxBranchCount!: number;

  /** 한국어: 허용 최대 단말기 수 / Tiếng Việt: Số terminal tối đa được phép */
  @Field(() => Int) maxTerminalCount!: number;

  /** 한국어: 허용 국가 코드 (null이면 전체 국가) / Tiếng Việt: Mã quốc gia được phép (null = tất cả quốc gia) */
  @Field(() => String, { nullable: true }) allowedCountryCode?: string | null;

  /** 한국어: 라이선스별 커스텀 JSON 페이로드 / Tiếng Việt: Payload JSON tùy chỉnh theo từng license */
  @Field(() => GraphQLJSON) licensePayloadJson!: unknown;

  /** 한국어: 생성 일시 / Tiếng Việt: Thời gian tạo */
  @Field() createdAt!: Date;

  /** 한국어: 수정 일시 / Tiếng Việt: Thời gian cập nhật */
  @Field() updatedAt!: Date;
}
