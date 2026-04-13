import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const INVOICES_QUERY = gql`
  query Invoices($corporateId: ID!, $skip: Int!, $take: Int!, $status: String) {
    eInvoicesByCorporate(corporateId: $corporateId, skip: $skip, take: $take, status: $status) {
      success {
        data {
          id
          subjectType
          subjectId
          issuanceMode
          periodStart
          periodEnd
          status
          totAmountVnd
          totDiscountVnd
          totVatAmountVnd
          totPayableVnd
          consolidationStrategy
          sourceTransactionCount
          sellerTaxCode
          sellerCompanyName
          buyerTaxCode
          buyerCompanyName
          invoiceNo
          serialNo
          formNo
          gdtReceiptNo
          invoiceIssuedAt
          reviewDueAt
          autoPromoted
          createdAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const INVOICE_DETAIL_QUERY = gql`
  query InvoiceDetail($id: ID!) {
    eInvoice(id: $id) {
      success {
        data {
          id
          subjectType
          subjectId
          issuanceMode
          periodStart
          periodEnd
          status
          totAmountVnd
          totDiscountVnd
          totVatAmountVnd
          totPayableVnd
          consolidationStrategy
          sourceTransactionCount
          sellerTaxCode
          sellerCompanyName
          sellerAddress
          sellerEmail
          buyerTaxCode
          buyerCompanyName
          buyerAddress
          buyerEmail
          reviewDueAt
          requestedByAdminId
          requestedAt
          disputedByAdminId
          disputedAt
          disputeReason
          autoPromoted
          submittedByAdminId
          submittedAt
          invoiceIssuedAt
          signedAt
          acceptedAt
          rejectedAt
          rejectionReason
          replacedByInvoiceId
          adjustmentOfInvoiceId
          cancellationDecisionRef
          cancellationReason
          cancelledAt
          refId
          cqtCode
          isCqtCertified
          formNo
          serialNo
          invoiceNo
          lookupCode
          gdtReceiptNo
          xmlPayloadRef
          transType
          currencyCode
          exchangeRate
          paymentMethod
          providerType
          createdAt
          updatedAt
          lines {
            id
            seq
            itemCode
            itemName
            uom
            quantity
            unitPriceVnd
            vatTreatment
            vatRatePct
            amountVnd
            vatAmountVnd
            payAmountVnd
            feature
            dcRate
            dcAmountVnd
          }
          submissionLogs {
            id
            attempt
            providerType
            environment
            status
            errorCode
            errorMessage
            durationMs
            createdAt
          }
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const INVOICE_DOWNLOAD_PDF_QUERY = gql`
  query InvoiceDownloadPdf($id: ID!) {
    eInvoiceDownloadPdf(id: $id) {
      success {
        data {
          url
          fileName
          expiresAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const INVOICE_DOWNLOAD_XML_QUERY = gql`
  query InvoiceDownloadXml($id: ID!) {
    eInvoiceDownloadXml(id: $id) {
      success {
        data {
          url
          fileName
          expiresAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Mutations ─────────────────────────── */

export const REQUEST_ISSUANCE_MUTATION = gql`
  mutation RequestIssuance($id: ID!) {
    eInvoiceRequestIssuance(id: $id) {
      success {
        data {
          id
          status
          requestedAt
          requestedByAdminId
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const DISPUTE_MUTATION = gql`
  mutation DisputeInvoice($id: ID!, $reason: String!) {
    eInvoiceDispute(id: $id, reason: $reason) {
      success {
        data {
          id
          status
          disputedAt
          disputedByAdminId
          disputeReason
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_INVOICE_SCHEDULE_MUTATION = gql`
  mutation UpdateInvoiceSchedule(
    $corporateId: ID!
    $scheduleType: String!
    $scheduleDay: Int
    $autoGenerate: Boolean
    $autoSubmit: Boolean
    $notifyEmail: String
  ) {
    mealCorporateUpdateInvoiceSchedule(
      corporateId: $corporateId
      scheduleType: $scheduleType
      scheduleDay: $scheduleDay
      autoGenerate: $autoGenerate
      autoSubmit: $autoSubmit
      notifyEmail: $notifyEmail
    ) {
      success {
        data {
          id
          invoiceScheduleType
          invoiceScheduleDay
          invoiceAutoGenerate
          invoiceAutoSubmit
          invoiceNotifyEmail
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface InvoiceRow {
  id: string;
  subjectType: string;
  subjectId: string;
  issuanceMode: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totAmountVnd: string;
  totDiscountVnd: string;
  totVatAmountVnd: string;
  totPayableVnd: string;
  consolidationStrategy: string | null;
  sourceTransactionCount: number | null;
  sellerTaxCode: string | null;
  sellerCompanyName: string | null;
  buyerTaxCode: string | null;
  buyerCompanyName: string | null;
  invoiceNo: string | null;
  serialNo: string | null;
  formNo: string | null;
  gdtReceiptNo: string | null;
  invoiceIssuedAt: string | null;
  reviewDueAt: string | null;
  autoPromoted: boolean;
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  seq: number;
  itemCode: string | null;
  itemName: string;
  uom: string;
  quantity: string;
  unitPriceVnd: string;
  vatTreatment: string;
  vatRatePct: string;
  amountVnd: string;
  vatAmountVnd: string;
  payAmountVnd: string;
  feature: string;
  dcRate: string | null;
  dcAmountVnd: string | null;
}

export interface InvoiceSubmissionLog {
  id: string;
  attempt: number;
  providerType: string;
  environment: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface InvoiceDetail extends InvoiceRow {
  sellerAddress: string | null;
  sellerEmail: string | null;
  buyerAddress: string | null;
  buyerEmail: string | null;
  requestedByAdminId: string | null;
  requestedAt: string | null;
  disputedByAdminId: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  submittedByAdminId: string | null;
  submittedAt: string | null;
  signedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  replacedByInvoiceId: string | null;
  adjustmentOfInvoiceId: string | null;
  cancellationDecisionRef: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  refId: string | null;
  cqtCode: string | null;
  isCqtCertified: boolean;
  lookupCode: string | null;
  xmlPayloadRef: string | null;
  transType: string | null;
  currencyCode: string | null;
  exchangeRate: string | null;
  paymentMethod: string | null;
  providerType: string | null;
  updatedAt: string;
  lines: InvoiceLine[];
  submissionLogs: InvoiceSubmissionLog[];
}

export interface InvoicesData {
  eInvoicesByCorporate: {
    success: { data: InvoiceRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface InvoiceDetailData {
  eInvoice: {
    success: { data: InvoiceDetail } | null;
    error: { code: string; message: string } | null;
  };
}

export interface InvoiceDownloadData {
  url: string;
  fileName: string;
  expiresAt: string;
}

export interface InvoiceDownloadPdfData {
  eInvoiceDownloadPdf: {
    success: { data: InvoiceDownloadData } | null;
    error: { code: string; message: string } | null;
  };
}

export interface InvoiceDownloadXmlData {
  eInvoiceDownloadXml: {
    success: { data: InvoiceDownloadData } | null;
    error: { code: string; message: string } | null;
  };
}

export interface RequestIssuanceData {
  eInvoiceRequestIssuance: {
    success: {
      data: {
        id: string;
        status: string;
        requestedAt: string;
        requestedByAdminId: string;
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

export interface DisputeInvoiceData {
  eInvoiceDispute: {
    success: {
      data: {
        id: string;
        status: string;
        disputedAt: string;
        disputedByAdminId: string;
        disputeReason: string;
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

export interface InvoiceScheduleData {
  id: string;
  invoiceScheduleType: string;
  invoiceScheduleDay: number | null;
  invoiceAutoGenerate: boolean;
  invoiceAutoSubmit: boolean;
  invoiceNotifyEmail: string | null;
}

export interface UpdateInvoiceScheduleData {
  mealCorporateUpdateInvoiceSchedule: {
    success: { data: InvoiceScheduleData } | null;
    error: { code: string; message: string } | null;
  };
}
