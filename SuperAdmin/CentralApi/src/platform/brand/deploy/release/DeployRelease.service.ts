/**
 * 한국어: DeployRelease 서비스 — 배포 릴리스의 CRUD 및 상태 전이를 담당한다.
 *         릴리스는 특정 패키지를 특정 스코프(Distributor/BrandHQ/Branch)에 배포하는 이력이다.
 *         상태 전이: Planned → Deploying → Deployed / RolledBack / Failed.
 * Tiếng Việt: Service DeployRelease — phụ trách CRUD và chuyển đổi trạng thái bản phát hành.
 *             Release là lịch sử triển khai package cụ thể đến scope cụ thể (Distributor/BrandHQ/Branch).
 *             Chuyển đổi trạng thái: Planned → Deploying → Deployed / RolledBack / Failed.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';

@Injectable()
export class DeployReleaseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 한국어: 특정 스코프(scopeType + scopeId)의 릴리스 목록 페이지네이션 조회.
   *         최신 생성순 정렬.
   * Tiếng Việt: Truy vấn phân trang danh sách release của scope cụ thể (scopeType + scopeId).
   *             Sắp xếp theo thời gian tạo mới nhất.
   */
  async findByScope(scopeType: string, scopeId: string, skip: number, take: number) {
    return this.prisma.deployRelease.findMany({
      where: { scopeType, scopeId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 릴리스 단건 조회 (ID 기준).
   * Tiếng Việt: Truy vấn đơn lẻ release (theo ID).
   */
  async findById(id: string) {
    return this.prisma.deployRelease.findUnique({ where: { id } });
  }

  /**
   * 한국어: 새 릴리스 생성 — 초기 상태는 'Planned'. scheduledAt으로 예약 배포 가능.
   * Tiếng Việt: Tạo release mới — trạng thái ban đầu là 'Planned'. Có thể lên lịch triển khai qua scheduledAt.
   */
  async create(data: {
    packageId: string;
    scopeType: string;
    scopeId: string;
    scheduledAt?: Date;
    releaseNote?: string;
  }) {
    return this.prisma.deployRelease.create({
      data: {
        packageId: data.packageId,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        scheduledAt: data.scheduledAt,
        releaseNote: data.releaseNote,
        // 한국어: 신규 릴리스는 항상 'Planned' 상태로 시작
        // Tiếng Việt: Release mới luôn bắt đầu với trạng thái 'Planned'
        releaseStatus: 'PLANNED',
      },
    });
  }

  /**
   * 한국어: 릴리스 상태 변경. 'Deployed' 상태로 전환 시 deployedAt에 현재 시각을 자동 기록한다.
   * Tiếng Việt: Thay đổi trạng thái release. Khi chuyển sang 'Deployed', tự động ghi thời gian hiện tại vào deployedAt.
   */
  async updateStatus(id: string, status: string) {
    const data: Record<string, unknown> = { releaseStatus: status };
    // 한국어: 'Deployed' 상태일 때만 배포 완료 시각 기록
    // Tiếng Việt: Chỉ ghi thời gian hoàn tất triển khai khi trạng thái là 'Deployed'
    if (status === 'Deployed') data.deployedAt = new Date();
    return this.prisma.deployRelease.update({ where: { id }, data });
  }
}
