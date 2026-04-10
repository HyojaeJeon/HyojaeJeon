import { gql } from '@apollo/client';

export const CORPORATE_LIST_QUERY = gql`
  query CorporateList($skip: Int!, $take: Int!) {
    mealCorporates(skip: $skip, take: $take) {
      success {
        data {
          id
          tenantCode
          companyName
          taxCode
          fundingModel
          status
          createdAt
        }
      }
      error { code message }
    }
  }
`;

export interface CorporateListRow {
  id: string;
  tenantCode: string;
  companyName: string;
  taxCode: string | null;
  fundingModel: string | null;
  status: string;
  createdAt: string;
}

export interface CorporateListData {
  mealCorporates: { success: { data: CorporateListRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Corporate Detail (1P1Q — profile + depts + policies + wallets + merchants + einvoices) ─────────────────────────── */

export const CORPORATE_DETAIL_QUERY = gql`
  query CorporateDetail($id: ID!) {
    mealCorporate(id: $id) {
      success {
        data {
          id
          tenantCode
          companyName
          taxCode
          fundingModel
          depositBalanceVnd
          creditLimitVnd
          monthlyBudgetVnd
          contactName
          contactEmail
          contactPhone
          status
          createdAt
          updatedAt
        }
      }
      error { code message }
    }
    mealDepartments(corporateId: $id) {
      success {
        data { id departmentCode departmentName }
      }
    }
    mealPoliciesByCorporate(corporateId: $id) {
      success {
        data {
          id
          policyCode
          policyName
          dailyLimitVnd
          maxPerTransactionVnd
          allowSplitPayment
          status
          effectiveFrom
          effectiveTo
        }
      }
    }
    mealWalletsByCorporate(corporateId: $id, skip: 0, take: 20) {
      success {
        data {
          id
          employeeId
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          status
        }
      }
    }
    mealEmployees(corporateId: $id, skip: 0, take: 20) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          status
        }
      }
    }
    mealTransactionsByCorporate(corporateId: $id, skip: 0, take: 10) {
      success {
        data {
          id
          approvedAmountVnd
          requestedAmountVnd
          companyShareVnd
          employeeShareVnd
          status
          createdAt
        }
      }
    }
    eInvoicesByCorporate(corporateId: $id) {
      success {
        data {
          id
          periodStart
          periodEnd
          totAmountVnd
          totDiscountVnd
          totVatAmountVnd
          totPayableVnd
          status
          invoiceNo
          serialNo
          gdtReceiptNo
          invoiceIssuedAt
          createdAt
        }
      }
    }
  }
`;

export interface CorporateDetailRow extends CorporateListRow {
  depositBalanceVnd: string | null;
  creditLimitVnd: string | null;
  monthlyBudgetVnd: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  updatedAt: string;
}

export interface CorporateDepartmentRow {
  id: string;
  departmentCode: string;
  departmentName: string;
}

export interface CorporatePolicyRow {
  id: string;
  policyCode: string;
  policyName: string;
  dailyLimitVnd: string | null;
  maxPerTransactionVnd: string | null;
  allowSplitPayment: boolean;
  status: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface CorporateWalletRow {
  id: string;
  employeeId: string;
  balanceVnd: string;
  companyAllowanceVnd: string;
  personalTopUpVnd: string;
  dailyLimitVnd: string | null;
  status: string;
}

export interface CorporateEmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  status: string;
}

export interface CorporateTransactionRow {
  id: string;
  approvedAmountVnd: string | null;
  requestedAmountVnd: string;
  companyShareVnd: string | null;
  employeeShareVnd: string | null;
  status: string;
  createdAt: string;
}

export interface CorporateInvoiceRow {
  id: string;
  periodStart: string;
  periodEnd: string;
  totAmountVnd: string;
  totDiscountVnd: string;
  totVatAmountVnd: string;
  totPayableVnd: string;
  status: string;
  invoiceNo: string | null;
  serialNo: string | null;
  gdtReceiptNo: string | null;
  invoiceIssuedAt: string | null;
  createdAt: string;
}

export interface CorporateDetailData {
  mealCorporate: { success: { data: CorporateDetailRow } | null; error: { code: string; message: string } | null };
  mealDepartments: { success: { data: CorporateDepartmentRow[] } | null };
  mealPoliciesByCorporate: { success: { data: CorporatePolicyRow[] } | null };
  mealWalletsByCorporate: { success: { data: CorporateWalletRow[] } | null };
  mealEmployees: { success: { data: CorporateEmployeeRow[] } | null };
  mealTransactionsByCorporate: { success: { data: CorporateTransactionRow[] } | null };
  eInvoicesByCorporate: { success: { data: CorporateInvoiceRow[] } | null };
}

/* ─────────────────────────── Mutations ─────────────────────────── */

export const CREATE_MEAL_CORPORATE_MUTATION = gql`
  mutation CreateMealCorporate($input: CreateMealCorporateInput!) {
    mealCorporateCreate(input: $input) {
      success { data { id tenantCode } }
      error { code message details }
    }
  }
`;

export const UPDATE_MEAL_CORPORATE_MUTATION = gql`
  mutation UpdateMealCorporate($id: ID!, $input: UpdateMealCorporateInput!) {
    mealCorporateUpdate(id: $id, input: $input) {
      success { data { id } }
      error { code message details }
    }
  }
`;

export const DELETE_MEAL_CORPORATE_MUTATION = gql`
  mutation DeleteMealCorporate($id: ID!) {
    mealCorporateDelete(id: $id) {
      success { data }
      error { code message }
    }
  }
`;

export const CREATE_MEAL_DEPARTMENT_MUTATION = gql`
  mutation CreateMealDepartment($input: CreateMealDepartmentInput!) {
    mealDepartmentCreate(input: $input) {
      success { data { id departmentCode } }
      error { code message }
    }
  }
`;

export const CREATE_MEAL_POLICY_MUTATION = gql`
  mutation CreateMealPolicy($input: CreateMealPolicyInput!) {
    mealPolicyCreate(input: $input) {
      success { data { id policyCode } }
      error { code message details }
    }
  }
`;

export const FUND_MEAL_WALLET_MUTATION = gql`
  mutation FundMealWallet($input: FundMealWalletInput!) {
    mealWalletFund(input: $input) {
      success { data { id balanceVnd } }
      error { code message }
    }
  }
`;

export const CREATE_MEAL_EMPLOYEE_MUTATION = gql`
  mutation CreateMealEmployee($input: CreateMealEmployeeInput!) {
    mealEmployeeCreate(input: $input) {
      success { data { id employeeCode } }
      error { code message }
    }
  }
`;

export const CREATE_MEAL_WALLET_MUTATION = gql`
  mutation CreateMealWallet($input: CreateMealWalletInput!) {
    mealWalletCreate(input: $input) {
      success { data { id } }
      error { code message }
    }
  }
`;

export const TOPUP_MEAL_WALLET_MUTATION = gql`
  mutation TopUpMealWallet($input: TopUpMealWalletInput!) {
    mealWalletTopUp(input: $input) {
      success { data { id balanceVnd personalTopUpVnd } }
      error { code message }
    }
  }
`;

export const DELETE_MEAL_POLICY_MUTATION = gql`
  mutation DeleteMealPolicy($id: ID!) {
    mealPolicyDelete(id: $id) {
      success { data }
      error { code message }
    }
  }
`;

export const GENERATE_CONSOLIDATED_INVOICE_MUTATION = gql`
  mutation GenerateConsolidatedInvoice($input: GenerateMealConsolidatedInvoiceInput!) {
    eInvoiceGenerate(input: $input) {
      success { data { id } }
      error { code message }
    }
  }
`;

/* ─────────────────────────── Sub-screen 1P1Q queries ─────────────────────────── */

export const CORPORATE_DEPARTMENTS_QUERY = gql`
  query CorporateDepartments($id: ID!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName } }
    }
    mealDepartments(corporateId: $id) {
      success { data { id departmentCode departmentName } }
      error { code message }
    }
  }
`;

export interface CorporateDepartmentsData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string } } | null };
  mealDepartments: { success: { data: CorporateDepartmentRow[] } | null; error: { code: string; message: string } | null };
}

export const CORPORATE_EMPLOYEES_QUERY = gql`
  query CorporateEmployees($id: ID!, $skip: Int!, $take: Int!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName } }
    }
    mealDepartments(corporateId: $id) {
      success { data { id departmentCode departmentName } }
    }
    mealEmployees(corporateId: $id, skip: $skip, take: $take) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          phone
          badgeRfid
          departmentId
          status
        }
      }
      error { code message }
    }
  }
`;

export interface EmployeeFullRow extends CorporateEmployeeRow {
  phone: string | null;
  badgeRfid: string | null;
  departmentId: string | null;
}

export interface CorporateEmployeesData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string } } | null };
  mealDepartments: { success: { data: CorporateDepartmentRow[] } | null };
  mealEmployees: { success: { data: EmployeeFullRow[] } | null; error: { code: string; message: string } | null };
}

export const CORPORATE_POLICIES_QUERY = gql`
  query CorporatePolicies($id: ID!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName } }
    }
    mealDepartments(corporateId: $id) {
      success { data { id departmentCode departmentName } }
    }
    mealPoliciesByCorporate(corporateId: $id) {
      success {
        data {
          id
          policyCode
          policyName
          dailyLimitVnd
          maxPerTransactionVnd
          allowSplitPayment
          appliesToDepartmentIds
          appliesToRoleCodes
          status
          effectiveFrom
          effectiveTo
        }
      }
      error { code message }
    }
  }
`;

export interface FullPolicyRow extends CorporatePolicyRow {
  appliesToDepartmentIds: string[];
  appliesToRoleCodes: string[];
}

export interface CorporatePoliciesData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string } } | null };
  mealDepartments: { success: { data: CorporateDepartmentRow[] } | null };
  mealPoliciesByCorporate: { success: { data: FullPolicyRow[] } | null; error: { code: string; message: string } | null };
}

export const CORPORATE_WALLETS_QUERY = gql`
  query CorporateWallets($id: ID!, $skip: Int!, $take: Int!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName depositBalanceVnd } }
    }
    mealEmployees(corporateId: $id, skip: 0, take: 100) {
      success { data { id employeeCode fullName } }
    }
    mealWalletsByCorporate(corporateId: $id, skip: $skip, take: $take) {
      success {
        data {
          id
          employeeId
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          status
        }
      }
      error { code message }
    }
  }
`;

export interface CorporateWalletsData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string; depositBalanceVnd: string | null } } | null };
  mealEmployees: { success: { data: Array<{ id: string; employeeCode: string; fullName: string }> } | null };
  mealWalletsByCorporate: {
    success: { data: CorporateWalletRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export const CORPORATE_EINVOICES_QUERY = gql`
  query CorporateEInvoices($id: ID!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName taxCode } }
    }
    eInvoicesByCorporate(corporateId: $id) {
      success {
        data {
          id
          periodStart
          periodEnd
          totAmountVnd
          totDiscountVnd
          totVatAmountVnd
          totPayableVnd
          status
          invoiceNo
          serialNo
          gdtReceiptNo
          invoiceIssuedAt
          createdAt
        }
      }
      error { code message }
    }
  }
`;

export interface CorporateEInvoicesData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string; taxCode: string | null } } | null };
  eInvoicesByCorporate: {
    success: { data: CorporateInvoiceRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

/* ─────────────────────────── Merchant enrollments ─────────────────────────── */

export const MERCHANT_ENROLLMENTS_QUERY = gql`
  query MerchantEnrollments($skip: Int!, $take: Int!) {
    mealMerchantEnrollments(skip: $skip, take: $take) {
      success {
        data {
          id
          brandHqId
          loopType
          isActive
          enrolledAt
          contractEndsAt
        }
      }
      error { code message }
    }
    brands(skip: 0, take: 100) {
      success { data { id brandCode brandName } }
    }
  }
`;

export interface MerchantEnrollmentRow {
  id: string;
  brandHqId: string;
  loopType: string;
  isActive: boolean;
  enrolledAt: string;
  contractEndsAt: string | null;
}

export interface MerchantEnrollmentsData {
  mealMerchantEnrollments: {
    success: { data: MerchantEnrollmentRow[] } | null;
    error: { code: string; message: string } | null;
  };
  brands: {
    success: { data: Array<{ id: string; brandCode: string; brandName: string }> } | null;
  };
}

export const ENROLL_MERCHANT_MUTATION = gql`
  mutation EnrollMerchant($input: EnrollMealMerchantInput!) {
    mealMerchantEnroll(input: $input) {
      success { data { id } }
      error { code message }
    }
  }
`;

export const ACTIVATE_MERCHANT_MUTATION = gql`
  mutation ActivateMerchant($enrollmentId: ID!) {
    mealMerchantActivate(enrollmentId: $enrollmentId) {
      success { data { id } }
      error { code message }
    }
  }
`;

export const DEACTIVATE_MERCHANT_MUTATION = gql`
  mutation DeactivateMerchant($enrollmentId: ID!) {
    mealMerchantDeactivate(enrollmentId: $enrollmentId) {
      success { data { id } }
      error { code message }
    }
  }
`;

/* ─────────────────────────── Corporate requests (audit filter) ─────────────────────────── */

export const CORPORATE_REQUESTS_QUERY = gql`
  query CorporateRequests($first: Int!, $targetId: String) {
    auditLogConnection(first: $first, targetId: $targetId) {
      success {
        data {
          edges {
            cursor
            node {
              id
              createdAt
              actorType
              actorId
              actionType
              targetType
              targetId
            }
          }
        }
      }
      error { code message }
    }
  }
`;

export interface CorporateRequestRow {
  id: string;
  createdAt: string;
  actorType: string;
  actorId: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
}

export interface CorporateRequestsData {
  auditLogConnection: {
    success: {
      data: {
        edges: Array<{ cursor: string; node: CorporateRequestRow }>;
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

/* ─────────────────────────── EInvoice 상세 (1P1Q) ─────────────────────────── */

export interface CorporateEInvoiceLineRow {
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

export interface CorporateEInvoiceSubmissionLogRow {
  id: string;
  attempt: number;
  providerType: string;
  environment: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  requestJson: unknown;
  responseJson: unknown;
  createdAt: string;
}

export interface CorporateEInvoiceDetailRow {
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
  // seller
  sellerTaxCode: string | null;
  sellerCompanyName: string | null;
  sellerAddress: string | null;
  sellerEmail: string | null;
  // buyer
  buyerTaxCode: string | null;
  buyerCompanyName: string | null;
  buyerAddress: string | null;
  buyerEmail: string | null;
  // workflow
  reviewDueAt: string | null;
  requestedByAdminId: string | null;
  requestedAt: string | null;
  disputedByAdminId: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  autoPromoted: boolean;
  submittedByAdminId: string | null;
  submittedAt: string | null;
  // legal timestamps
  invoiceIssuedAt: string | null;
  signedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  // cancellation/replacement/adjustment
  replacedByInvoiceId: string | null;
  adjustmentOfInvoiceId: string | null;
  cancellationDecisionRef: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  // wetax provider
  refId: string | null;
  cqtCode: string | null;
  isCqtCertified: boolean;
  formNo: string | null;
  serialNo: string | null;
  invoiceNo: string | null;
  lookupCode: string | null;
  gdtReceiptNo: string | null;
  xmlPayloadRef: string | null;
  transType: string | null;
  currencyCode: string | null;
  exchangeRate: string | null;
  paymentMethod: string | null;
  providerType: string | null;
  createdAt: string;
  updatedAt: string;
  // nested
  lines: CorporateEInvoiceLineRow[];
  submissionLogs: CorporateEInvoiceSubmissionLogRow[];
}

export const CORPORATE_EINVOICE_DETAIL_QUERY = gql`
  query CorporateEInvoiceDetail($id: ID!, $invoiceId: ID!) {
    mealCorporate(id: $id) {
      success { data { id tenantCode companyName taxCode } }
    }
    eInvoice(id: $invoiceId) {
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
            requestJson
            responseJson
            createdAt
          }
        }
      }
      error { code message }
    }
  }
`;

export interface CorporateEInvoiceDetailData {
  mealCorporate: { success: { data: { id: string; tenantCode: string; companyName: string; taxCode: string | null } } | null };
  eInvoice: {
    success: { data: CorporateEInvoiceDetailRow } | null;
    error: { code: string; message: string } | null;
  };
}

export const REQUEST_CONSOLIDATED_INVOICE_MUTATION = gql`
  mutation RequestConsolidatedInvoice($id: ID!) {
    eInvoiceRequestIssuance(id: $id) {
      success { data { id status } }
      error { code message }
    }
  }
`;

export const DISPUTE_CONSOLIDATED_INVOICE_MUTATION = gql`
  mutation DisputeConsolidatedInvoice($id: ID!, $reason: String!) {
    eInvoiceDispute(id: $id, reason: $reason) {
      success { data { id status } }
      error { code message }
    }
  }
`;

export const SUBMIT_CONSOLIDATED_INVOICE_MUTATION = gql`
  mutation SubmitConsolidatedInvoice($id: ID!) {
    eInvoiceSubmitForIssuance(id: $id) {
      success { data { id status } }
      error { code message }
    }
  }
`;
