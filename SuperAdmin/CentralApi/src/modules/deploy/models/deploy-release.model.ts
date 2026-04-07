/**
 * 한국어: DeployRelease GraphQL 모델 — 배포 릴리스 엔티티의 GraphQL ObjectType 정의.
 *         특정 패키지(DeployPackage)를 특정 스코프(Distributor/BrandHQ/Branch)에 배포한 이력을 추적한다.
 *         rollbackPackageId로 롤백 대상 패키지를 참조하며, releaseNote로 배포 사유를 기록한다.
 * Tiếng Việt: Model GraphQL DeployRelease — định nghĩa ObjectType GraphQL cho entity bản phát hành.
 *             Theo dõi lịch sử triển khai package (DeployPackage) cụ thể đến scope cụ thể (Distributor/BrandHQ/Branch).
 *             rollbackPackageId tham chiếu package rollback, releaseNote ghi lại lý do triển khai.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DeployReleaseModel {
  /** 한국어: 릴리스 고유 ID (UUID) / Tiếng Việt: ID duy nhất của release (UUID) */
  @Field(() => ID) id!: string;

  /** 한국어: 배포 패키지 ID (DeployPackage FK) / Tiếng Việt: ID gói triển khai (FK đến DeployPackage) */
  @Field() packageId!: string;

  /** 한국어: 배포 대상 스코프 유형 (예: 'BrandHQ', 'Branch') / Tiếng Việt: Loại scope đích triển khai (ví dụ: 'BrandHQ', 'Branch') */
  @Field() scopeType!: string;

  /** 한국어: 배포 대상 스코프 ID / Tiếng Việt: ID scope đích triển khai */
  @Field() scopeId!: string;

  /**
   * 한국어: 릴리스 상태 — 'Planned' → 'Deploying' → 'Deployed' 또는 'RolledBack' 등의 상태 전이.
   * Tiếng Việt: Trạng thái release — chuyển đổi trạng thái: 'Planned' → 'Deploying' → 'Deployed' hoặc 'RolledBack'.
   */
  @Field() releaseStatus!: string;

  /** 한국어: 예약 배포 일시 (null이면 즉시 배포) / Tiếng Việt: Thời gian triển khai theo lịch (null = triển khai ngay) */
  @Field(() => Date, { nullable: true }) scheduledAt?: Date | null;

  /** 한국어: 실제 배포 완료 일시 / Tiếng Việt: Thời gian triển khai thực tế hoàn tất */
  @Field(() => Date, { nullable: true }) deployedAt?: Date | null;

  /** 한국어: 롤백 대상 패키지 ID (롤백 시에만 설정) / Tiếng Việt: ID package rollback (chỉ đặt khi rollback) */
  @Field(() => String, { nullable: true }) rollbackPackageId?: string | null;

  /** 한국어: 배포 사유/릴리스 노트 / Tiếng Việt: Lý do triển khai / ghi chú release */
  @Field(() => String, { nullable: true }) releaseNote?: string | null;

  /** 한국어: 생성 일시 / Tiếng Việt: Thời gian tạo */
  @Field() createdAt!: Date;

  /** 한국어: 수정 일시 / Tiếng Việt: Thời gian cập nhật */
  @Field() updatedAt!: Date;
}
