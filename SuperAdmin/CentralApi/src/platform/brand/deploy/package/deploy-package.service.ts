/**
 * 한국어: DeployPackage 서비스 — 배포 패키지의 CRUD 및 릴리스 마킹을 담당한다.
 *         Prisma를 통해 PostgreSQL의 DeployPackage 테이블에 접근한다.
 *         soft-delete 필터(deletedAt: null)를 findById에 적용하여 삭제된 패키지를 제외한다.
 * Tiếng Việt: Service DeployPackage — phụ trách CRUD và đánh dấu phát hành cho gói triển khai.
 *             Truy cập bảng DeployPackage trong PostgreSQL thông qua Prisma.
 *             Áp dụng bộ lọc soft-delete (deletedAt: null) cho findById để loại trừ package đã xóa.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class DeployPackageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 한국어: 전체 패키지 페이지네이션 조회. 최신 생성순 정렬.
   * Tiếng Việt: Truy vấn phân trang tất cả package. Sắp xếp theo thời gian tạo mới nhất.
   */
  async findAll(skip: number, take: number) {
    return this.prisma.deployPackage.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
  }

  /**
   * 한국어: 패키지 단건 조회 — soft-delete 필터 적용 (deletedAt: null인 레코드만).
   * Tiếng Việt: Truy vấn đơn lẻ package — áp dụng bộ lọc soft-delete (chỉ bản ghi deletedAt: null).
   */
  async findById(id: string) {
    return this.prisma.deployPackage.findFirst({ where: { id, deletedAt: null } });
  }

  /**
   * 한국어: 새 배포 패키지 생성. packageCode, version, platformTarget, artifactUrl, checksum은 필수.
   * Tiếng Việt: Tạo gói triển khai mới. packageCode, version, platformTarget, artifactUrl, checksum là bắt buộc.
   */
  async create(data: {
    packageCode: string;
    version: string;
    platformTarget: string;
    artifactUrl: string;
    checksum: string;
  }) {
    return this.prisma.deployPackage.create({ data });
  }

  /**
   * 한국어: 패키지를 릴리스 완료 상태로 마킹 — releasedAt에 현재 시각을 기록한다.
   * Tiếng Việt: Đánh dấu package là đã phát hành — ghi thời gian hiện tại vào releasedAt.
   */
  async markReleased(id: string) {
    return this.prisma.deployPackage.update({
      where: { id },
      data: { releasedAt: new Date() },
    });
  }
}
