import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const POLICIES_QUERY = gql`
  query Policies($corporateId: ID!) {
    mealPoliciesByCorporate(corporateId: $corporateId) {
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

export const POLICY_DETAIL_QUERY = gql`
  query PolicyDetail($id: ID!) {
    mealPolicy(id: $id) {
      success {
        data {
          id
          corporateId
          policyCode
          policyName
          dailyLimitVnd
          maxPerTransactionVnd
          allowSplitPayment
          appliesToDepartmentIds
          appliesToRoleCodes
          allowedMealTypes
          allowedDayOfWeek
          allowedTimeStart
          allowedTimeEnd
          merchantCategoryRestrictions
          status
          effectiveFrom
          effectiveTo
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

/* ─────────────────────────── Mutations ─────────────────────────── */

export const CREATE_POLICY_MUTATION = gql`
  mutation CreatePolicy($input: CreateMealPolicyInput!) {
    mealPolicyCreate(input: $input) {
      success {
        data {
          id
          policyCode
          policyName
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

export const UPDATE_POLICY_MUTATION = gql`
  mutation UpdatePolicy($id: ID!, $input: UpdateMealPolicyInput!) {
    mealPolicyUpdate(id: $id, input: $input) {
      success {
        data {
          id
          policyCode
          policyName
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

export const PUBLISH_POLICY_MUTATION = gql`
  mutation PublishPolicy($id: ID!) {
    mealPolicyPublish(id: $id) {
      success {
        data {
          id
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

export const PAUSE_POLICY_MUTATION = gql`
  mutation PausePolicy($id: ID!) {
    mealPolicyPause(id: $id) {
      success {
        data {
          id
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

export const DEACTIVATE_POLICY_MUTATION = gql`
  mutation DeactivatePolicy($id: ID!) {
    mealPolicyDeactivate(id: $id) {
      success {
        data {
          id
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

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface PolicyRow {
  id: string;
  policyCode: string;
  policyName: string;
  dailyLimitVnd: string | null;
  maxPerTransactionVnd: string | null;
  allowSplitPayment: boolean;
  appliesToDepartmentIds: string[];
  appliesToRoleCodes: string[];
  status: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export interface PolicyDetail extends PolicyRow {
  corporateId: string;
  allowedMealTypes: string[] | null;
  allowedDayOfWeek: number[] | null;
  allowedTimeStart: string | null;
  allowedTimeEnd: string | null;
  merchantCategoryRestrictions: string[] | null;
  updatedAt: string;
}

export interface PoliciesData {
  mealPoliciesByCorporate: {
    success: { data: PolicyRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface PolicyDetailData {
  mealPolicy: {
    success: { data: PolicyDetail } | null;
    error: { code: string; message: string } | null;
  };
}

export interface CreatePolicyData {
  mealPolicyCreate: {
    success: { data: { id: string; policyCode: string; policyName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface UpdatePolicyData {
  mealPolicyUpdate: {
    success: { data: { id: string; policyCode: string; policyName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface PublishPolicyData {
  mealPolicyPublish: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface PausePolicyData {
  mealPolicyPause: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface DeactivatePolicyData {
  mealPolicyDeactivate: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}
