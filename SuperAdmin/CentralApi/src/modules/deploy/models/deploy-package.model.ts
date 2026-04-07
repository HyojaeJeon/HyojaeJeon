/**
 * 한국어: DeployPackage GraphQL 모델 — 배포 패키지 엔티티의 GraphQL ObjectType 정의.
 *         배포 패키지는 빌드된 아티팩트(실행 파일, 설치 패키지 등)의 메타데이터를 보관한다.
 *         checksum 필드로 아티팩트 무결성을 검증할 수 있다.
 * Tiếng Việt: Model GraphQL DeployPackage — định nghĩa ObjectType GraphQL cho entity gói triển khai.
 *             Gói triển khai lưu metadata của artifact đã build (file thực thi, gói cài đặt...).
 *             Có thể xác minh tính toàn vẹn artifact qua trường checksum.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DeployPackageModel {
  /** 한국어: 패키지 고유 ID (UUID) / Tiếng Việt: ID duy nhất của package (UUID) */
  @Field(() => ID) id!: string;

  /** 한국어: 패키지 코드 (예: 'BrandPosApp', 'PosUI') / Tiếng Việt: Mã package (ví dụ: 'BrandPosApp', 'PosUI') */
  @Field() packageCode!: string;

  /** 한국어: 패키지 버전 (SemVer 형식) / Tiếng Việt: Phiên bản package (định dạng SemVer) */
  @Field() version!: string;

  /** 한국어: 대상 플랫폼 (예: 'win-x86', 'win-x64') / Tiếng Việt: Nền tảng đích (ví dụ: 'win-x86', 'win-x64') */
  @Field() platformTarget!: string;

  /** 한국어: 아티팩트 다운로드 URL / Tiếng Việt: URL tải artifact */
  @Field() artifactUrl!: string;

  /** 한국어: 아티팩트 무결성 해시 (SHA-256) / Tiếng Việt: Hash toàn vẹn artifact (SHA-256) */
  @Field() checksum!: string;

  /** 한국어: 릴리스 완료 일시 (null이면 아직 미출시) / Tiếng Việt: Thời gian phát hành (null = chưa phát hành) */
  @Field(() => Date, { nullable: true }) releasedAt?: Date | null;

  /** 한국어: 생성 일시 / Tiếng Việt: Thời gian tạo */
  @Field() createdAt!: Date;

  /** 한국어: 수정 일시 / Tiếng Việt: Thời gian cập nhật */
  @Field() updatedAt!: Date;
}
