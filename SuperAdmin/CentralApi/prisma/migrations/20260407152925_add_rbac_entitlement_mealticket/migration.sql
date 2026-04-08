-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "branchType" SET DEFAULT 'STORE',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "BranchOverride" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "BrandAssignment" ALTER COLUMN "assignmentType" SET DEFAULT 'PRIMARY',
ALTER COLUMN "assignmentStatus" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "BrandMenuItem" ALTER COLUMN "itemType" SET DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "BrandProfile" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ChannelUser" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "DeployRelease" ALTER COLUMN "releaseStatus" SET DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "DeploymentScope" ALTER COLUMN "versionPolicy" SET DEFAULT 'LATEST_STABLE';

-- AlterTable
ALTER TABLE "DistributorContract" ALTER COLUMN "supportLevel" SET DEFAULT 'STANDARD',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "DistributorProfile" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "EdgePosTerminal" ALTER COLUMN "terminalRole" SET DEFAULT 'MAIN',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "OperatorTemplate" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "PlatformLicense" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "PricePolicy" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "SuperAdminUser" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Territory" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "permissionKey" VARCHAR(120) NOT NULL,
    "domain" VARCHAR(40) NOT NULL,
    "description" VARCHAR(500),
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "roleCode" VARCHAR(80) NOT NULL,
    "roleName" VARCHAR(200) NOT NULL,
    "scope" VARCHAR(30) NOT NULL DEFAULT 'PLATFORM',
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "grantedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" UUID,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" UUID NOT NULL,
    "userType" VARCHAR(30) NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "scopeBrandHqId" UUID,
    "scopeCorporateId" UUID,
    "scopeBranchId" UUID,
    "grantedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" UUID,
    "expiresAt" TIMESTAMPTZ,
    "revokedAt" TIMESTAMPTZ,
    "revokeReason" VARCHAR(500),

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandHqEntitlement" (
    "id" UUID NOT NULL,
    "brandHqId" UUID NOT NULL,
    "capability" VARCHAR(40) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "activatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ,
    "grantedBySuperAdminId" UUID NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "revokeReason" VARCHAR(500),
    "contractRef" VARCHAR(200),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "BrandHqEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealCorporate" (
    "id" UUID NOT NULL,
    "tenantCode" VARCHAR(60) NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    "taxCode" VARCHAR(50) NOT NULL,
    "fundingModel" VARCHAR(30) NOT NULL DEFAULT 'PREPAID_DEPOSIT',
    "monthlyBudgetVnd" BIGINT NOT NULL DEFAULT 0,
    "depositBalanceVnd" BIGINT NOT NULL DEFAULT 0,
    "creditLimitVnd" BIGINT NOT NULL DEFAULT 0,
    "contactName" VARCHAR(120),
    "contactEmail" VARCHAR(200),
    "contactPhone" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "MealCorporate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealCorporateDepartment" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "departmentCode" VARCHAR(60) NOT NULL,
    "departmentName" VARCHAR(200) NOT NULL,
    "parentDepartmentId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "MealCorporateDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEmployee" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "departmentId" UUID,
    "employeeCode" VARCHAR(60) NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200),
    "phone" VARCHAR(30),
    "badgeRfid" VARCHAR(120),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "MealEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealWallet" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "balanceVnd" BIGINT NOT NULL DEFAULT 0,
    "dailyLimitVnd" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPolicy" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "policyCode" VARCHAR(60) NOT NULL,
    "policyName" VARCHAR(200) NOT NULL,
    "appliesToDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "appliesToRoleCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ruleJson" JSONB NOT NULL DEFAULT '{}',
    "maxPerTransactionVnd" BIGINT NOT NULL DEFAULT 0,
    "dailyLimitVnd" BIGINT NOT NULL DEFAULT 0,
    "allowSplitPayment" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "MealPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealFundingAccount" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "fundingModel" VARCHAR(30) NOT NULL,
    "bankCode" VARCHAR(50),
    "bankAccountNo" VARCHAR(50),
    "balanceVnd" BIGINT NOT NULL DEFAULT 0,
    "creditLimitVnd" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealFundingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealMerchantEnrollment" (
    "id" UUID NOT NULL,
    "brandHqId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "loopType" VARCHAR(20) NOT NULL DEFAULT 'OPEN_LOOP',
    "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractEndsAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealMerchantEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealMerchantCommissionRate" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "baseRatePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "specialZoneRatePct" DECIMAL(5,2),
    "franchiseFlatRatePct" DECIMAL(5,2),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealMerchantCommissionRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealMerchantSettlementAccount" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "bankCode" VARCHAR(50) NOT NULL,
    "bankAccountNumber" VARCHAR(50) NOT NULL,
    "bankAccountHolder" VARCHAR(200) NOT NULL,
    "taxCode" VARCHAR(50) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealMerchantSettlementAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealTransaction" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "brandHqId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "terminalId" UUID,
    "loopType" VARCHAR(20) NOT NULL,
    "authMethod" VARCHAR(30) NOT NULL,
    "requestedAmountVnd" BIGINT NOT NULL,
    "approvedAmountVnd" BIGINT NOT NULL DEFAULT 0,
    "employeeShareVnd" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "declineReason" VARCHAR(50),
    "idempotencyKey" VARCHAR(120) NOT NULL,
    "authorizedAt" TIMESTAMPTZ,
    "settledAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealSettlementBatch" (
    "id" UUID NOT NULL,
    "brandHqId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "grossAmountVnd" BIGINT NOT NULL DEFAULT 0,
    "commissionAmountVnd" BIGINT NOT NULL DEFAULT 0,
    "netPayableVnd" BIGINT NOT NULL DEFAULT 0,
    "threeWayMismatchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealSettlementBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealConsolidatedEInvoice" (
    "id" UUID NOT NULL,
    "corporateId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalAmountVnd" BIGINT NOT NULL DEFAULT 0,
    "vatAmountVnd" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "gdtReceiptNo" VARCHAR(120),
    "xmlPayloadRef" VARCHAR(500),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MealConsolidatedEInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permissionKey_key" ON "Permission"("permissionKey");

-- CreateIndex
CREATE INDEX "idx_perm_domain" ON "Permission"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleCode_key" ON "Role"("roleCode");

-- CreateIndex
CREATE INDEX "idx_role_scope" ON "Role"("scope");

-- CreateIndex
CREATE INDEX "idx_role_perm_role" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "idx_role_perm_perm" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "idx_uraa_user_status" ON "UserRoleAssignment"("userType", "userId", "status");

-- CreateIndex
CREATE INDEX "idx_uraa_role_status" ON "UserRoleAssignment"("roleId", "status");

-- CreateIndex
CREATE INDEX "idx_entitlement_brand_cap_status" ON "BrandHqEntitlement"("brandHqId", "capability", "status");

-- CreateIndex
CREATE INDEX "idx_entitlement_brand_status" ON "BrandHqEntitlement"("brandHqId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MealCorporate_tenantCode_key" ON "MealCorporate"("tenantCode");

-- CreateIndex
CREATE INDEX "idx_meal_corporate_status" ON "MealCorporate"("status");

-- CreateIndex
CREATE INDEX "idx_meal_dept_corp" ON "MealCorporateDepartment"("corporateId");

-- CreateIndex
CREATE UNIQUE INDEX "MealCorporateDepartment_corporateId_departmentCode_key" ON "MealCorporateDepartment"("corporateId", "departmentCode");

-- CreateIndex
CREATE INDEX "idx_meal_emp_corp_dept" ON "MealEmployee"("corporateId", "departmentId");

-- CreateIndex
CREATE INDEX "idx_meal_emp_badge" ON "MealEmployee"("badgeRfid");

-- CreateIndex
CREATE UNIQUE INDEX "MealEmployee_corporateId_employeeCode_key" ON "MealEmployee"("corporateId", "employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "MealWallet_employeeId_key" ON "MealWallet"("employeeId");

-- CreateIndex
CREATE INDEX "idx_meal_wallet_corp_status" ON "MealWallet"("corporateId", "status");

-- CreateIndex
CREATE INDEX "idx_meal_policy_corp" ON "MealPolicy"("corporateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MealPolicy_corporateId_policyCode_key" ON "MealPolicy"("corporateId", "policyCode");

-- CreateIndex
CREATE INDEX "idx_meal_funding_corp" ON "MealFundingAccount"("corporateId");

-- CreateIndex
CREATE UNIQUE INDEX "MealMerchantEnrollment_brandHqId_key" ON "MealMerchantEnrollment"("brandHqId");

-- CreateIndex
CREATE INDEX "idx_meal_merchant_active" ON "MealMerchantEnrollment"("isActive");

-- CreateIndex
CREATE INDEX "idx_meal_commission_enrollment" ON "MealMerchantCommissionRate"("enrollmentId", "effectiveFrom" DESC);

-- CreateIndex
CREATE INDEX "idx_meal_settlacc_enrollment" ON "MealMerchantSettlementAccount"("enrollmentId", "isPrimary");

-- CreateIndex
CREATE INDEX "idx_meal_tx_corp_status_time" ON "MealTransaction"("corporateId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_meal_tx_brand_status_time" ON "MealTransaction"("brandHqId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_meal_tx_wallet_time" ON "MealTransaction"("walletId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MealTransaction_idempotencyKey_key" ON "MealTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "idx_meal_settlement_brand_status" ON "MealSettlementBatch"("brandHqId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MealSettlementBatch_brandHqId_periodStart_periodEnd_key" ON "MealSettlementBatch"("brandHqId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "idx_meal_invoice_corp_status" ON "MealConsolidatedEInvoice"("corporateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MealConsolidatedEInvoice_corporateId_periodStart_periodEnd_key" ON "MealConsolidatedEInvoice"("corporateId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "idx_audit_cursor" ON "AuditLog"("createdAt" DESC, "id" DESC);

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealCorporateDepartment" ADD CONSTRAINT "MealCorporateDepartment_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "MealCorporate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEmployee" ADD CONSTRAINT "MealEmployee_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "MealCorporate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEmployee" ADD CONSTRAINT "MealEmployee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "MealCorporateDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealWallet" ADD CONSTRAINT "MealWallet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "MealEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPolicy" ADD CONSTRAINT "MealPolicy_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "MealCorporate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFundingAccount" ADD CONSTRAINT "MealFundingAccount_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "MealCorporate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealMerchantCommissionRate" ADD CONSTRAINT "MealMerchantCommissionRate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "MealMerchantEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealMerchantSettlementAccount" ADD CONSTRAINT "MealMerchantSettlementAccount_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "MealMerchantEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealConsolidatedEInvoice" ADD CONSTRAINT "MealConsolidatedEInvoice_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "MealCorporate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

