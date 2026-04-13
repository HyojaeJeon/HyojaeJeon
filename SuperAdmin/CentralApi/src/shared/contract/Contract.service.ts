/**
 * 한국어: ContractService — 계약 lifecycle 관리 단일 서비스.
 *   가맹점(MERCHANT) / 대리점(DISTRIBUTOR) / 기업(CORPORATE) 3종 계약의
 *   생성, 본문 수정, 조건 수정, 상태 전이, 파일 업로드, 리비전 확인, 템플릿, 활동 로그를 처리한다.
 *
 * Tiếng Việt: ContractService — dịch vụ quản lý vòng đời hợp đồng đơn nhất.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/Prisma.service';
import { AuditService } from '@core/audit/Audit.service';
import { DomainError } from '@core/errors/DomainError';
import { CreateContractInput } from './dto/CreateContract.input';
import { CreateContractTemplateInput } from './dto/CreateContractTemplate.input';

/**
 * 한국어: 계약 상태 전이 맵 — 현재 상태 → 허용 다음 상태 목록.
 */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['DRAFT'],
  DRAFT: ['INTERNAL_REVIEW'],
  INTERNAL_REVIEW: ['SENT_TO_PARTY', 'DRAFT'],
  SENT_TO_PARTY: ['NEGOTIATING'],
  NEGOTIATING: ['AGREED', 'CANCELLED'],
  AGREED: ['PENDING_SIGNATURE'],
  PENDING_SIGNATURE: ['SIGNING'],
  SIGNING: ['EXCHANGING'],
  EXCHANGING: ['ACTIVE'],
  ACTIVE: ['EXPIRING', 'SUSPENDED', 'TERMINATED'],
  EXPIRING: ['RENEWED', 'TERMINATED'],
  SUSPENDED: ['ACTIVE', 'TERMINATED'],
};

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ───────────────────────────────────────── Query

  async listContracts(
    skip: number,
    take: number,
    filter?: {
      contractType?: string | null;
      status?: string | null;
      partyBType?: string | null;
      partyBId?: string | null;
    },
  ): Promise<{ data: unknown[]; totalCount: number }> {
    const where: Prisma.ContractWhereInput = {};
    if (filter?.contractType) where.contractType = filter.contractType;
    if (filter?.status) where.status = filter.status;
    if (filter?.partyBType) where.partyBType = filter.partyBType;
    if (filter?.partyBId) where.partyBId = filter.partyBId;

    const [data, totalCount] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { data, totalCount };
  }

  async findById(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        revisions: { orderBy: { revisionNo: 'desc' } },
        files: { orderBy: { uploadedAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!contract) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Contract' },
      });
    }
    return contract;
  }

  // ───────────────────────────────────────── Create

  async create(
    input: CreateContractInput,
    actorId: string,
    actorType: string,
  ) {
    const contractCode = await this.generateContractCode(input.contractType);

    const contract = await this.prisma.contract.create({
      data: {
        contractCode,
        contractType: input.contractType,
        partyAType: 'PLATFORM',
        partyAId: actorId, // platform legal entity — caller is the creator
        partyBType: input.partyBType,
        partyBId: input.partyBId,
        templateId: input.templateId ?? null,
        title: input.title,
        titleKo: input.titleKo ?? null,
        titleEn: input.titleEn ?? null,
        status: 'REQUESTED',
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        termsJson: (input.termsJson as Prisma.InputJsonValue) ?? {},
        createdBy: actorId,
      },
    });

    await this.prisma.contractActivity.create({
      data: {
        contractId: contract.id,
        activityType: 'CONTRACT_CREATED',
        toStatus: 'REQUESTED',
        actorId,
        actorType,
        summary: `Contract ${contractCode} created`,
      },
    });

    return contract;
  }

  // ───────────────────────────────────────── Update Body

  async updateBody(
    id: string,
    locale: string,
    html: string,
    text: string,
    actorId: string,
    actorType: string,
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Contract' },
      });
    }

    const oldBody = contract.bodyJson as Record<string, unknown>;
    const newBody = {
      ...oldBody,
      [locale]: { html, text },
    };

    const revisionNo = await this.nextRevisionNo(id);

    const [updated] = await this.prisma.$transaction([
      this.prisma.contract.update({
        where: { id },
        data: { bodyJson: newBody as Prisma.InputJsonValue },
      }),
      this.prisma.contractRevision.create({
        data: {
          contractId: id,
          revisionNo,
          modifiedBy: actorId,
          modifiedByType: actorType,
          locale,
          changeType: 'BODY_EDIT',
          fieldPath: `bodyJson.${locale}`,
          beforeValue: (oldBody[locale] as Prisma.InputJsonValue) ?? Prisma.DbNull,
          afterValue: { html, text } as unknown as Prisma.InputJsonValue,
        },
      }),
      this.prisma.contractActivity.create({
        data: {
          contractId: id,
          activityType: 'BODY_UPDATED',
          actorId,
          actorType,
          summary: `Body updated for locale ${locale} (revision #${revisionNo})`,
        },
      }),
    ]);

    return updated;
  }

  // ───────────────────────────────────────── Update Terms

  async updateTerms(
    id: string,
    termsJson: unknown,
    actorId: string,
    actorType: string,
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Contract' },
      });
    }

    const revisionNo = await this.nextRevisionNo(id);

    const [updated] = await this.prisma.$transaction([
      this.prisma.contract.update({
        where: { id },
        data: { termsJson: termsJson as Prisma.InputJsonValue },
      }),
      this.prisma.contractRevision.create({
        data: {
          contractId: id,
          revisionNo,
          modifiedBy: actorId,
          modifiedByType: actorType,
          locale: 'all',
          changeType: 'TERM_CHANGE',
          fieldPath: 'termsJson',
          beforeValue: contract.termsJson ?? Prisma.DbNull,
          afterValue: termsJson as Prisma.InputJsonValue,
        },
      }),
    ]);

    return updated;
  }

  // ───────────────────────────────────────── Status Transition

  async transitionStatus(
    id: string,
    toStatus: string,
    actorId: string,
    actorType: string,
    memo?: string | null,
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Contract' },
      });
    }

    const allowed = STATUS_TRANSITIONS[contract.status];
    if (!allowed || !allowed.includes(toStatus)) {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        params: {
          from: contract.status,
          to: toStatus,
          allowed: allowed ?? [],
        },
      });
    }

    const updateData: Prisma.ContractUpdateInput = {
      status: toStatus,
    };
    if (toStatus === 'ACTIVE' && contract.status === 'EXCHANGING') {
      updateData.signedAt = new Date();
    }
    if (toStatus === 'TERMINATED') {
      updateData.terminatedAt = new Date();
      if (memo) updateData.terminationReason = memo;
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.contractActivity.create({
      data: {
        contractId: id,
        activityType: 'STATUS_CHANGED',
        fromStatus: contract.status,
        toStatus,
        actorId,
        actorType,
        summary: memo
          ? `Status ${contract.status} -> ${toStatus}: ${memo}`
          : `Status ${contract.status} -> ${toStatus}`,
      },
    });

    await this.audit.log({
      actorId,
      actorType,
      actionType: 'CONTRACT_STATUS_CHANGED',
      targetType: 'Contract',
      targetId: contract.id,
      afterDataJson: { status: toStatus },
    });

    return updated;
  }

  // ───────────────────────────────────────── File Upload

  async uploadFile(
    id: string,
    fileType: string,
    locale: string,
    filePath: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string,
    actorType: string,
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Contract' },
      });
    }

    const file = await this.prisma.contractFile.create({
      data: {
        contractId: id,
        fileType,
        locale,
        filePath,
        fileName,
        fileSize,
        mimeType,
        uploadedBy,
      },
    });

    await this.prisma.contractActivity.create({
      data: {
        contractId: id,
        activityType: 'FILE_UPLOADED',
        actorId: uploadedBy,
        actorType,
        summary: `File uploaded: ${fileName} (${fileType}, ${locale})`,
      },
    });

    return file;
  }

  // ───────────────────────────────────────── Ack Revision

  async ackRevision(revisionId: string, ackBy: string) {
    const revision = await this.prisma.contractRevision.findUnique({
      where: { id: revisionId },
    });
    if (!revision) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'ContractRevision' },
      });
    }

    return this.prisma.contractRevision.update({
      where: { id: revisionId },
      data: {
        ackBy,
        ackAt: new Date(),
      },
    });
  }

  // ───────────────────────────────────────── Templates

  async listTemplates(contractType?: string | null) {
    const where: Prisma.ContractTemplateWhereInput = { isActive: true };
    if (contractType) where.contractType = contractType;

    return this.prisma.contractTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(input: CreateContractTemplateInput) {
    return this.prisma.contractTemplate.create({
      data: {
        templateCode: input.templateCode,
        contractType: input.contractType,
        title: input.title,
        titleKo: input.titleKo ?? null,
        titleEn: input.titleEn ?? null,
        bodyJson: input.bodyJson as Prisma.InputJsonValue,
        clausesJson: (input.clausesJson as Prisma.InputJsonValue) ?? {},
      },
    });
  }

  // ───────────────────────────────────────── Activities

  async getActivities(
    contractId: string,
    skip: number,
    take: number,
  ): Promise<{ data: unknown[]; totalCount: number }> {
    const where: Prisma.ContractActivityWhereInput = { contractId };

    const [data, totalCount] = await Promise.all([
      this.prisma.contractActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.contractActivity.count({ where }),
    ]);

    return { data, totalCount };
  }

  // ───────────────────────────────────────── Private helpers

  private async nextRevisionNo(contractId: string): Promise<number> {
    const last = await this.prisma.contractRevision.findFirst({
      where: { contractId },
      orderBy: { revisionNo: 'desc' },
      select: { revisionNo: true },
    });
    return (last?.revisionNo ?? 0) + 1;
  }

  private async generateContractCode(contractType: string): Promise<string> {
    const prefix =
      contractType === 'MERCHANT'
        ? 'CTR-M'
        : contractType === 'DISTRIBUTOR'
          ? 'CTR-D'
          : 'CTR-C';
    const count = await this.prisma.contract.count({
      where: { contractType },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `${prefix}-${seq}`;
  }
}
