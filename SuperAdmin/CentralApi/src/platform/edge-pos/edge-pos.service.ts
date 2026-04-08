/**
 * 한국어: Edge POS 터미널 서비스.
 *   Edge POS 단말기 엔티티의 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 EdgePosTerminal 테이블에 접근한다.
 *   지점(Branch) 소속별 필터링 조회와 상태 업데이트를 지원한다.
 *   CentralApi에서 각 Edge POS 기기의 등록/상태/해제를 중앙 관리한다.
 *
 * Tiếng Việt: Service Terminal Edge POS.
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD của entity thiết bị Edge POS.
 *   Truy cập bảng EdgePosTerminal trong PostgreSQL thông qua Prisma ORM.
 *   Hỗ trợ truy vấn lọc theo chi nhánh (Branch) sở thuộc và cập nhật trạng thái.
 *   CentralApi quản lý tập trung việc đăng ký/trạng thái/hủy đăng ký của từng thiết bị Edge POS.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/prisma.service';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import {
  branchScopeWhere,
  combineWhere,
  edgePosScopeWhere,
} from '@core/tenancy/tenant-scope';
import { PermissionService } from '@core/rbac/permission.service';
import { RegisterEdgePosInput } from './dto/register-edge-pos.input';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class EdgePosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
  ) {}

  private evalCtxFor(user: JwtPayload, branchId?: string | null, brandHqId?: string | null) {
    return {
      userType: user.userType,
      userId: user.sub,
      distributorId: user.tenantContext?.distributorId ?? null,
      brandHqId: brandHqId ?? user.tenantContext?.brandHQId ?? null,
      branchId: branchId ?? user.tenantContext?.branchId ?? null,
      corporateId: user.tenantContext?.corporateId ?? null,
    };
  }

  private async ensureAccessibleBranch(branchId: string, user?: JwtPayload) {
    const branch = await this.prisma.branch.findFirst({
      where: combineWhere<Prisma.BranchWhereInput>(
        { id: branchId, deletedAt: null },
        branchScopeWhere(user),
      ),
    });

    if (!branch) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Branch is outside caller scope' } });
    }

    return branch;
  }

  private async ensureAccessibleTerminal(id: string, user?: JwtPayload) {
    const terminal = await this.prisma.edgePosTerminal.findFirst({
      where: combineWhere<Prisma.EdgePosTerminalWhereInput>(
        { id, deletedAt: null },
        edgePosScopeWhere(user),
      ),
    });

    if (!terminal) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Edge POS terminal is outside caller scope' } });
    }

    return terminal;
  }

  /**
   * 한국어: 전체 Edge POS 터미널 목록을 페이지네이션으로 조회한다.
   *   소프트 삭제된 레코드는 제외하며, 생성일 기준 내림차순 정렬한다.
   *
   * Tiếng Việt: Truy vấn danh sách tất cả Edge POS terminal với phân trang.
   *   Loại trừ bản ghi đã bị xóa mềm, sắp xếp theo ngày tạo giảm dần.
   */
  async findAll(skip: number, take: number, user?: JwtPayload) {
    return this.prisma.edgePosTerminal.findMany({
      where: combineWhere<Prisma.EdgePosTerminalWhereInput>(
        { deletedAt: null },
        edgePosScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: ID로 Edge POS 터미널을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn Edge POS terminal theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.edgePosTerminal.findFirst({
      where: combineWhere<Prisma.EdgePosTerminalWhereInput>(
        { id, deletedAt: null },
        edgePosScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 특정 지점에 소속된 Edge POS 터미널 목록을 페이지네이션으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách Edge POS terminal thuộc chi nhánh cụ thể với phân trang.
   */
  async findByBranch(branchId: string, skip: number, take: number, user?: JwtPayload) {
    return this.prisma.edgePosTerminal.findMany({
      where: combineWhere<Prisma.EdgePosTerminalWhereInput>(
        { branchId, deletedAt: null },
        edgePosScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 새 Edge POS 터미널을 등록한다.
   *   terminalRole이 미지정이면 'Main'(주 POS)을 기본값으로 사용한다.
   *
   * Tiếng Việt: Đăng ký Edge POS terminal mới.
   *   Nếu terminalRole không được chỉ định, sử dụng 'Main' (POS chính) làm giá trị mặc định.
   */
  async create(input: RegisterEdgePosInput, user?: JwtPayload) {
    const branch = await this.ensureAccessibleBranch(input.branchId, user);
    if (user) await this.permission.require(this.evalCtxFor(user, branch.id, branch.brandHQId), 'edgepos.terminal.write');

    return this.prisma.edgePosTerminal.create({
      data: {
        branchId: branch.id,
        terminalCode: input.terminalCode,
        terminalName: input.terminalName,
        // 한국어: 터미널 역할 미지정 시 'Main'(주 POS) 기본값 적용
        // Tiếng Việt: Áp dụng mặc định 'Main' (POS chính) nếu vai trò terminal không được chỉ định
        terminalRole: input.terminalRole ?? 'MAIN',
        appVersion: input.appVersion,
        dbVersion: input.dbVersion,
      },
    });
  }

  /**
   * 한국어: Edge POS 터미널의 상태를 업데이트한다.
   *   예: 'Active' -> 'Offline', 'Decommissioned' 등
   *
   * Tiếng Việt: Cập nhật trạng thái của Edge POS terminal.
   *   Ví dụ: 'Active' -> 'Offline', 'Decommissioned', v.v.
   */
  async updateStatus(id: string, status: string, user?: JwtPayload) {
    const terminal = await this.ensureAccessibleTerminal(id, user);
    if (user) await this.permission.require(this.evalCtxFor(user, terminal.branchId), 'edgepos.terminal.write');

    return this.prisma.edgePosTerminal.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * 한국어: Edge POS 터미널을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm Edge POS terminal. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    const terminal = await this.ensureAccessibleTerminal(id, user);
    if (user) await this.permission.require(this.evalCtxFor(user, terminal.branchId), 'edgepos.terminal.write');

    await this.prisma.edgePosTerminal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
