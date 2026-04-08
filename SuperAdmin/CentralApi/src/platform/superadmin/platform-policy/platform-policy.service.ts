/**
 * PlatformPolicy 서비스
 * 한국어: 플랫폼 정책의 CRUD와 스코프 상속 모델을 구현한다.
 *         정책은 Global → RegionalDistributor → BrandHQ → Branch → EdgePos
 *         5단계 계층으로 상속되며, 하위 스코프가 상위를 오버라이드한다.
 * Tiếng Việt: Triển khai CRUD và mô hình kế thừa scope cho chính sách nền tảng.
 *             Chính sách được kế thừa qua 5 cấp: Global → RegionalDistributor → BrandHQ → Branch → EdgePos.
 *             Scope cấp dưới ghi đè scope cấp trên.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { AuditService } from '@core/audit/audit.service';

export interface PlatformPolicyActor {
  userType: string;
  userId: string;
}

@Injectable()
export class PlatformPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * 한국어: 특정 스코프의 활성 정책 목록을 조회한다 (버전 내림차순).
   * Tiếng Việt: Truy vấn danh sách chính sách đang hoạt động của scope cụ thể (giảm dần theo version).
   */
  async findByScope(scopeType: string, scopeId: string | null, skip: number, take: number) {
    return this.prisma.platformPolicy.findMany({
      where: { scopeType, scopeId, isActive: true },
      skip,
      take,
      orderBy: { version: 'desc' },
    });
  }

  /**
   * 한국어: 정책 단건 조회 (ID 기준). 비활성 버전도 포함하여 반환한다.
   * Tiếng Việt: Truy vấn đơn lẻ chính sách (theo ID). Trả về bao gồm cả phiên bản không hoạt động.
   */
  async findById(id: string) {
    return this.prisma.platformPolicy.findUnique({ where: { id } });
  }

  /**
   * 한국어: 특정 policyKey + scopeType + scopeId 조합의 최신 활성 정책을 조회한다.
   * Tiếng Việt: Truy vấn chính sách hoạt động mới nhất cho tổ hợp policyKey + scopeType + scopeId.
   */
  async findEffective(policyKey: string, scopeType: string, scopeId: string | null) {
    return this.prisma.platformPolicy.findFirst({
      where: { policyKey, scopeType, scopeId, isActive: true },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * 정책 상속 해결 (설계 기준서 Section 6 준수)
   *
   * 한국어: 요청된 스코프부터 시작하여 상위 계층으로 올라가며 첫 번째로 발견되는
   *         활성 정책을 반환한다. 계층 순서:
   *         EdgePos(5) → Branch(4) → BrandHQ(3) → RegionalDistributor(2) → Global(1)
   *         각 계층에서 해당 엔티티의 ID를 사용해야 하므로, 호출자가 scopeChain을 제공한다.
   *
   * Tiếng Việt: Bắt đầu từ scope được yêu cầu, đi lên các cấp cao hơn và trả về
   *             chính sách hoạt động đầu tiên tìm thấy. Thứ tự cấp bậc:
   *             EdgePos(5) → Branch(4) → BrandHQ(3) → RegionalDistributor(2) → Global(1)
   *             Mỗi cấp cần ID entity tương ứng, nên người gọi cung cấp scopeChain.
   *
   * @param policyKey - 정책 키 / Khóa chính sách
   * @param scopeChain - 스코프별 ID 매핑 (예: { EdgePos: 'xxx', Branch: 'yyy', ... })
   *                     Bản đồ ID theo scope (ví dụ: { EdgePos: 'xxx', Branch: 'yyy', ... })
   * @param startScope - 탐색 시작 스코프 / Scope bắt đầu tìm kiếm
   */
  async resolveEffectivePolicy(
    policyKey: string,
    startScope: string,
    scopeChain: Record<string, string | null>,
  ) {
    /**
     * 한국어: 설계 문서 기준 5단계 계층. 가장 구체적(EdgePos)에서 가장 일반적(Global)으로 탐색.
     * Tiếng Việt: 5 cấp theo tài liệu thiết kế. Tìm kiếm từ cụ thể nhất (EdgePos) đến chung nhất (Global).
     */
    const scopeHierarchy = ['EDGE_POS', 'BRANCH', 'BRAND_HQ', 'REGIONAL_DISTRIBUTOR', 'GLOBAL'];
    const startIndex = scopeHierarchy.indexOf(startScope);
    if (startIndex === -1) return null;

    for (let i = startIndex; i < scopeHierarchy.length; i++) {
      const currentScope = scopeHierarchy[i];
      const currentScopeId = scopeChain[currentScope] ?? null;
      const policy = await this.findEffective(policyKey, currentScope, currentScopeId);
      if (policy) return policy;
    }

    return null;
  }

  /**
   * 한국어: 새 정책 버전을 생성한다. 기존 활성 버전은 비활성화(isActive=false)하고
   *         새 버전 번호를 부여한다 (설계 기준서: 버전닝 정책).
   * Tiếng Việt: Tạo phiên bản chính sách mới. Phiên bản hoạt động hiện tại bị vô hiệu hóa (isActive=false)
   *             và gán số phiên bản mới (tài liệu thiết kế: chính sách phiên bản).
   */
  async create(
    data: {
      policyKey: string;
      scopeType: string;
      scopeId?: string;
      policyValueJson?: object;
    },
    actor?: PlatformPolicyActor,
  ) {
    const existing = await this.prisma.platformPolicy.findFirst({
      where: { policyKey: data.policyKey, scopeType: data.scopeType, scopeId: data.scopeId ?? null },
      orderBy: { version: 'desc' },
    });

    const nextVersion = existing ? existing.version + 1 : 1;

    // 한국어: 이전 버전 비활성화 / Tiếng Việt: Vô hiệu hóa phiên bản trước
    if (existing) {
      await this.prisma.platformPolicy.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
    }

    const created = await this.prisma.platformPolicy.create({
      data: {
        policyKey: data.policyKey,
        scopeType: data.scopeType,
        scopeId: data.scopeId ?? null,
        policyValueJson: data.policyValueJson ?? {},
        version: nextVersion,
        isActive: true,
      },
    });
    await this.audit.log({
      actorType: actor?.userType ?? 'SYSTEM',
      actorId: actor?.userId,
      actionType: 'PLATFORM_POLICY_CREATE',
      targetType: 'PlatformPolicy',
      targetId: created.id,
      beforeDataJson: existing as unknown as Record<string, unknown> ?? undefined,
      afterDataJson: created as unknown as Record<string, unknown>,
    });
    return created;
  }
}
