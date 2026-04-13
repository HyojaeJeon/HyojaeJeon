import { gql } from '@apollo/client';

/* ─────────────────────────── Contract List ─────────────────────────── */

export const CONTRACT_LIST_QUERY = gql`
  query ContractList(
    $skip: Int!
    $take: Int!
    $contractType: String
    $status: String
  ) {
    contracts(skip: $skip, take: $take, contractType: $contractType, status: $status) {
      success {
        data {
          id
          contractCode
          contractType
          partyBType
          partyBId
          title
          status
          version
          effectiveFrom
          effectiveTo
          createdAt
        }
        totalCount
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Contract Detail ─���───────────────────────── */

export const CONTRACT_DETAIL_QUERY = gql`
  query ContractDetail($id: ID!) {
    contract(id: $id) {
      success {
        data {
          id
          contractCode
          contractType
          partyAType
          partyAId
          partyBType
          partyBId
          templateId
          title
          titleKo
          titleEn
          bodyJson
          termsJson
          status
          version
          parentContractId
          effectiveFrom
          effectiveTo
          reviewDeadlineAt
          signedAt
          terminatedAt
          terminationReason
          createdBy
          createdAt
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ��────────────────────────── Contract Revisions (via detail) ���────────────────────────── */

export const CONTRACT_REVISIONS_QUERY = gql`
  query ContractDetail_Revisions($id: ID!) {
    contract(id: $id) {
      success {
        data {
          id
          contractCode
          title
          status
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Contract Activities ─��───────────────────────── */

export const CONTRACT_ACTIVITIES_QUERY = gql`
  query ContractActivities($contractId: ID!, $skip: Int!, $take: Int!) {
    contractActivities(contractId: $contractId, skip: $skip, take: $take) {
      success {
        data {
          id
          contractId
          activityType
          fromStatus
          toStatus
          actorId
          actorType
          summary
          summaryKo
          summaryEn
          metadata
          createdAt
        }
        totalCount
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────���───────────────────── Contract Templates ─────���───────────────────── */

export const CONTRACT_TEMPLATES_QUERY = gql`
  query ContractTemplates($contractType: String) {
    contractTemplates(contractType: $contractType) {
      success {
        data {
          id
          templateCode
          contractType
          title
          titleKo
          titleEn
          version
          isActive
          createdAt
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ───��─────────────────────── Mutations ─────────────────────────── */

export const CONTRACT_CREATE_MUTATION = gql`
  mutation ContractCreate($input: CreateContractInput!) {
    contractCreate(input: $input) {
      success {
        data {
          id
          contractCode
          title
          status
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_UPDATE_BODY_MUTATION = gql`
  mutation ContractUpdateBody($id: ID!, $locale: String!, $html: String!, $text: String!) {
    contractUpdateBody(id: $id, locale: $locale, html: $html, text: $text) {
      success {
        data {
          id
          status
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_UPDATE_TERMS_MUTATION = gql`
  mutation ContractUpdateTerms($id: ID!, $termsJson: JSON!) {
    contractUpdateTerms(id: $id, termsJson: $termsJson) {
      success {
        data {
          id
          status
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_TRANSITION_STATUS_MUTATION = gql`
  mutation ContractTransitionStatus($id: ID!, $toStatus: String!, $memo: String) {
    contractTransitionStatus(id: $id, toStatus: $toStatus, memo: $memo) {
      success {
        data {
          id
          status
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_UPLOAD_FILE_MUTATION = gql`
  mutation ContractUploadFile(
    $id: ID!
    $fileType: String!
    $locale: String!
    $filePath: String!
    $fileName: String!
    $fileSize: Int!
    $mimeType: String!
  ) {
    contractUploadFile(
      id: $id
      fileType: $fileType
      locale: $locale
      filePath: $filePath
      fileName: $fileName
      fileSize: $fileSize
      mimeType: $mimeType
    ) {
      success {
        data {
          id
          contractId
          fileType
          locale
          filePath
          fileName
          fileSize
          mimeType
          uploadedBy
          uploadedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_ACK_REVISION_MUTATION = gql`
  mutation ContractAckRevision($revisionId: ID!) {
    contractAckRevision(revisionId: $revisionId) {
      success {
        data {
          id
          revisionNo
          ackBy
          ackAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const CONTRACT_TEMPLATE_CREATE_MUTATION = gql`
  mutation ContractTemplateCreate($input: CreateContractTemplateInput!) {
    contractTemplateCreate(input: $input) {
      success {
        data {
          id
          templateCode
          title
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────��───────────────────── TypeScript Interfaces ─────────────────────────── */

export type ContractType = 'MERCHANT' | 'DISTRIBUTOR' | 'CORPORATE';

export type ContractStatus =
  | 'REQUESTED'
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'SENT_TO_PARTY'
  | 'NEGOTIATING'
  | 'AGREED'
  | 'PENDING_SIGNATURE'
  | 'SIGNING'
  | 'EXCHANGING'
  | 'ACTIVE'
  | 'EXPIRING'
  | 'RENEWED'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'CANCELLED';

export interface ContractListItem {
  id: string;
  contractCode: string;
  contractType: ContractType;
  partyBType: string;
  partyBId: string;
  title: string;
  status: ContractStatus;
  version: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
}

export interface ContractListData {
  contracts: {
    success: { data: ContractListItem[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface ContractDetail {
  id: string;
  contractCode: string;
  contractType: ContractType;
  partyAType: string;
  partyAId: string;
  partyBType: string;
  partyBId: string;
  templateId: string | null;
  title: string;
  titleKo: string | null;
  titleEn: string | null;
  bodyJson: unknown;
  termsJson: unknown;
  status: ContractStatus;
  version: number;
  parentContractId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  reviewDeadlineAt: string | null;
  signedAt: string | null;
  terminatedAt: string | null;
  terminationReason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDetailData {
  contract: {
    success: { data: ContractDetail } | null;
    error: { code: string; message: string } | null;
  };
}

export interface ContractActivity {
  id: string;
  contractId: string;
  activityType: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorId: string;
  actorType: string;
  summary: string;
  summaryKo: string | null;
  summaryEn: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface ContractActivitiesData {
  contractActivities: {
    success: { data: ContractActivity[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface ContractRevision {
  id: string;
  contractId: string;
  revisionNo: number;
  modifiedBy: string;
  modifiedByType: string;
  locale: string;
  changeType: string;
  fieldPath: string;
  beforeValue: unknown;
  afterValue: unknown;
  reason: string | null;
  ackBy: string | null;
  ackAt: string | null;
  createdAt: string;
}

export interface ContractFile {
  id: string;
  contractId: string;
  fileType: string;
  locale: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ContractTemplate {
  id: string;
  templateCode: string;
  contractType: ContractType;
  title: string;
  titleKo: string | null;
  titleEn: string | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplatesData {
  contractTemplates: {
    success: { data: ContractTemplate[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface CreateContractInput {
  contractType: string;
  partyBType: string;
  partyBId: string;
  templateId?: string | null;
  title: string;
  titleKo?: string | null;
  titleEn?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  termsJson?: unknown;
}
