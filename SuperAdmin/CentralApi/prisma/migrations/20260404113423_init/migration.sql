-- CreateTable
CREATE TABLE "SuperAdminUser" (
    "id" UUID NOT NULL,
    "loginId" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(200),
    "phone" VARCHAR(30),
    "roleCode" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "lastLoginAt" TIMESTAMPTZ,
    "passwordChangedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "SuperAdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLicense" (
    "id" UUID NOT NULL,
    "scopeType" VARCHAR(30) NOT NULL,
    "scopeId" UUID NOT NULL,
    "licenseCode" VARCHAR(80) NOT NULL,
    "licenseType" VARCHAR(40) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "maxBranchCount" INTEGER NOT NULL DEFAULT 0,
    "maxTerminalCount" INTEGER NOT NULL DEFAULT 0,
    "allowedCountryCode" VARCHAR(10),
    "licensePayloadJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "PlatformLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPolicy" (
    "id" UUID NOT NULL,
    "policyKey" VARCHAR(120) NOT NULL,
    "scopeType" VARCHAR(30) NOT NULL,
    "scopeId" UUID,
    "policyValueJson" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PlatformPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorType" VARCHAR(30) NOT NULL,
    "actorId" UUID,
    "actionType" VARCHAR(80) NOT NULL,
    "targetType" VARCHAR(80) NOT NULL,
    "targetId" UUID,
    "requestId" VARCHAR(120),
    "beforeDataJson" JSONB,
    "afterDataJson" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployPackage" (
    "id" UUID NOT NULL,
    "packageCode" VARCHAR(80) NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "platformTarget" VARCHAR(30) NOT NULL,
    "artifactUrl" TEXT NOT NULL,
    "checksum" VARCHAR(128) NOT NULL,
    "releasedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "DeployPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployRelease" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "scopeType" VARCHAR(30) NOT NULL,
    "scopeId" UUID NOT NULL,
    "releaseStatus" VARCHAR(20) NOT NULL DEFAULT 'Planned',
    "scheduledAt" TIMESTAMPTZ,
    "deployedAt" TIMESTAMPTZ,
    "rollbackPackageId" UUID,
    "releaseNote" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "DeployRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributorProfile" (
    "id" UUID NOT NULL,
    "distributorCode" VARCHAR(50) NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    "legalName" VARCHAR(200),
    "businessNumber" VARCHAR(50),
    "countryCode" VARCHAR(10) NOT NULL,
    "territoryName" VARCHAR(120) NOT NULL,
    "defaultLanguageCode" VARCHAR(10) NOT NULL DEFAULT 'en-US',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "contactName" VARCHAR(120),
    "contactEmail" VARCHAR(200),
    "contactPhone" VARCHAR(30),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "DistributorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Territory" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "regionCode" VARCHAR(20),
    "territoryName" VARCHAR(120) NOT NULL,
    "currencyCode" CHAR(3) NOT NULL,
    "timeZoneCode" VARCHAR(50) NOT NULL,
    "isExclusive" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributorContract" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "contractNo" VARCHAR(80) NOT NULL,
    "contractType" VARCHAR(40) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "exclusiveFlag" BOOLEAN NOT NULL DEFAULT false,
    "revenueShareRate" DECIMAL(5,2),
    "supportLevel" VARCHAR(30) NOT NULL DEFAULT 'Standard',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "signedAt" TIMESTAMPTZ,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "DistributorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAssignment" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "assignmentType" VARCHAR(30) NOT NULL DEFAULT 'Primary',
    "assignmentStatus" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "accountManagerName" VARCHAR(120),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BrandAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentScope" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "brandHQId" UUID,
    "branchId" UUID,
    "edgePosId" UUID,
    "scopeType" VARCHAR(30) NOT NULL,
    "allowedAction" VARCHAR(80) NOT NULL,
    "versionPolicy" VARCHAR(50) NOT NULL DEFAULT 'LatestStable',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "DeploymentScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelUser" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "loginId" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(200),
    "roleCode" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "lastLoginAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "ChannelUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "brandCode" VARCHAR(50) NOT NULL,
    "brandName" VARCHAR(200) NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "defaultLanguageCode" VARCHAR(10) NOT NULL,
    "businessNumber" VARCHAR(50),
    "contactName" VARCHAR(120),
    "contactEmail" VARCHAR(200),
    "contactPhone" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "distributorId" UUID NOT NULL,
    "branchCode" VARCHAR(50) NOT NULL,
    "branchName" VARCHAR(200) NOT NULL,
    "branchType" VARCHAR(30) NOT NULL DEFAULT 'Store',
    "countryCode" VARCHAR(10) NOT NULL,
    "regionCode" VARCHAR(20),
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "postalCode" VARCHAR(20),
    "timeZoneCode" VARCHAR(50) NOT NULL,
    "defaultLanguageCode" VARCHAR(10) NOT NULL,
    "businessHoursJson" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "openingDate" DATE,
    "closingDate" DATE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMenuCategory" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "categoryCode" VARCHAR(60) NOT NULL,
    "categoryName" VARCHAR(200) NOT NULL,
    "parentCategoryId" UUID,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BrandMenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMenuItem" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "itemCode" VARCHAR(60) NOT NULL,
    "itemName" VARCHAR(200) NOT NULL,
    "categoryId" UUID NOT NULL,
    "itemType" VARCHAR(30) NOT NULL DEFAULT 'Standard',
    "basePrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "unitType" VARCHAR(20) NOT NULL DEFAULT 'EA',
    "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "searchKeywords" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BrandMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePolicy" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "policyCode" VARCHAR(60) NOT NULL,
    "policyName" VARCHAR(200) NOT NULL,
    "policyType" VARCHAR(30) NOT NULL,
    "ruleJson" JSONB NOT NULL DEFAULT '{}',
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "PricePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "promotionCode" VARCHAR(60) NOT NULL,
    "promotionName" VARCHAR(200) NOT NULL,
    "promotionType" VARCHAR(30) NOT NULL,
    "ruleJson" JSONB NOT NULL DEFAULT '{}',
    "startAt" TIMESTAMPTZ NOT NULL,
    "endAt" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchOverride" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "overrideKey" VARCHAR(120) NOT NULL,
    "overrideValueJson" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BranchOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorTemplate" (
    "id" UUID NOT NULL,
    "brandHQId" UUID NOT NULL,
    "templateCode" VARCHAR(60) NOT NULL,
    "templateName" VARCHAR(200) NOT NULL,
    "roleCode" VARCHAR(50) NOT NULL,
    "permissionJson" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "OperatorTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" UUID NOT NULL,
    "languageCode" VARCHAR(10) NOT NULL,
    "nativeName" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "direction" VARCHAR(5) NOT NULL DEFAULT 'LTR',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" UUID NOT NULL,
    "regionCode" VARCHAR(20) NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "regionName" VARCHAR(120) NOT NULL,
    "currencyCode" CHAR(3) NOT NULL,
    "timeZoneCode" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" UUID NOT NULL,
    "currencyCode" CHAR(3) NOT NULL,
    "currencyName" VARCHAR(80) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "decimalDigits" SMALLINT NOT NULL DEFAULT 2,
    "roundingMode" VARCHAR(20) NOT NULL DEFAULT 'HALF_UP',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdgePosTerminal" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "terminalCode" VARCHAR(50) NOT NULL,
    "terminalName" VARCHAR(200) NOT NULL,
    "terminalRole" VARCHAR(30) NOT NULL DEFAULT 'Main',
    "appVersion" VARCHAR(50) NOT NULL,
    "dbVersion" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "lastSyncAt" TIMESTAMPTZ,
    "lastHeartbeatAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "EdgePosTerminal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminUser_loginId_key" ON "SuperAdminUser"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminUser_email_key" ON "SuperAdminUser"("email");

-- CreateIndex
CREATE INDEX "idx_superadmin_role_status" ON "SuperAdminUser"("roleCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformLicense_licenseCode_key" ON "PlatformLicense"("licenseCode");

-- CreateIndex
CREATE INDEX "idx_license_scope" ON "PlatformLicense"("scopeType", "scopeId", "status");

-- CreateIndex
CREATE INDEX "idx_license_validity" ON "PlatformLicense"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "idx_policy_scope_key" ON "PlatformPolicy"("scopeType", "scopeId", "policyKey", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformPolicy_policyKey_scopeType_scopeId_version_key" ON "PlatformPolicy"("policyKey", "scopeType", "scopeId", "version");

-- CreateIndex
CREATE INDEX "idx_audit_target" ON "AuditLog"("targetType", "targetId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_actor" ON "AuditLog"("actorType", "actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_deploy_package_target" ON "DeployPackage"("platformTarget", "releasedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DeployPackage_packageCode_version_key" ON "DeployPackage"("packageCode", "version");

-- CreateIndex
CREATE INDEX "idx_deploy_release_scope" ON "DeployRelease"("scopeType", "scopeId", "releaseStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DistributorProfile_distributorCode_key" ON "DistributorProfile"("distributorCode");

-- CreateIndex
CREATE UNIQUE INDEX "DistributorProfile_businessNumber_key" ON "DistributorProfile"("businessNumber");

-- CreateIndex
CREATE INDEX "idx_distributor_country_status" ON "DistributorProfile"("countryCode", "status");

-- CreateIndex
CREATE INDEX "idx_territory_distributor" ON "Territory"("distributorId", "countryCode", "regionCode");

-- CreateIndex
CREATE UNIQUE INDEX "DistributorContract_contractNo_key" ON "DistributorContract"("contractNo");

-- CreateIndex
CREATE INDEX "idx_contract_distributor" ON "DistributorContract"("distributorId", "status", "endDate");

-- CreateIndex
CREATE INDEX "idx_brand_assignment" ON "BrandAssignment"("distributorId", "brandHQId", "assignmentStatus");

-- CreateIndex
CREATE INDEX "idx_deployment_scope" ON "DeploymentScope"("distributorId", "brandHQId", "branchId", "edgePosId");

-- CreateIndex
CREATE INDEX "idx_channel_user_distributor" ON "ChannelUser"("distributorId", "roleCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelUser_distributorId_loginId_key" ON "ChannelUser"("distributorId", "loginId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandProfile_brandCode_key" ON "BrandProfile"("brandCode");

-- CreateIndex
CREATE INDEX "idx_brand_distributor_status" ON "BrandProfile"("distributorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_branchCode_key" ON "Branch"("branchCode");

-- CreateIndex
CREATE INDEX "idx_branch_brand_status" ON "Branch"("brandHQId", "status");

-- CreateIndex
CREATE INDEX "idx_branch_distributor" ON "Branch"("distributorId", "regionCode");

-- CreateIndex
CREATE INDEX "idx_menu_category_brand" ON "BrandMenuCategory"("brandHQId", "parentCategoryId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMenuCategory_brandHQId_categoryCode_key" ON "BrandMenuCategory"("brandHQId", "categoryCode");

-- CreateIndex
CREATE INDEX "idx_menu_item_brand_category" ON "BrandMenuItem"("brandHQId", "categoryId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMenuItem_brandHQId_itemCode_key" ON "BrandMenuItem"("brandHQId", "itemCode");

-- CreateIndex
CREATE INDEX "idx_price_policy_brand" ON "PricePolicy"("brandHQId", "policyType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PricePolicy_brandHQId_policyCode_key" ON "PricePolicy"("brandHQId", "policyCode");

-- CreateIndex
CREATE INDEX "idx_promotion_brand" ON "Promotion"("brandHQId", "status", "startAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_brandHQId_promotionCode_key" ON "Promotion"("brandHQId", "promotionCode");

-- CreateIndex
CREATE INDEX "idx_branch_override" ON "BranchOverride"("branchId", "overrideKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BranchOverride_branchId_overrideKey_version_key" ON "BranchOverride"("branchId", "overrideKey", "version");

-- CreateIndex
CREATE INDEX "idx_operator_template_brand" ON "OperatorTemplate"("brandHQId", "roleCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorTemplate_brandHQId_templateCode_key" ON "OperatorTemplate"("brandHQId", "templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "Language_languageCode_key" ON "Language"("languageCode");

-- CreateIndex
CREATE INDEX "idx_language_is_active" ON "Language"("isActive", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Region_regionCode_key" ON "Region"("regionCode");

-- CreateIndex
CREATE INDEX "idx_region_country" ON "Region"("countryCode", "regionName");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_currencyCode_key" ON "Currency"("currencyCode");

-- CreateIndex
CREATE INDEX "idx_currency_default" ON "Currency"("isDefault", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EdgePosTerminal_terminalCode_key" ON "EdgePosTerminal"("terminalCode");

-- CreateIndex
CREATE INDEX "idx_terminal_branch_status" ON "EdgePosTerminal"("branchId", "status");

-- AddForeignKey
ALTER TABLE "DeployRelease" ADD CONSTRAINT "DeployRelease_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "DeployPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeployRelease" ADD CONSTRAINT "DeployRelease_rollbackPackageId_fkey" FOREIGN KEY ("rollbackPackageId") REFERENCES "DeployPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributorContract" ADD CONSTRAINT "DistributorContract_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAssignment" ADD CONSTRAINT "BrandAssignment_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAssignment" ADD CONSTRAINT "BrandAssignment_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentScope" ADD CONSTRAINT "DeploymentScope_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUser" ADD CONSTRAINT "ChannelUser_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "DistributorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMenuCategory" ADD CONSTRAINT "BrandMenuCategory_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMenuCategory" ADD CONSTRAINT "BrandMenuCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "BrandMenuCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMenuItem" ADD CONSTRAINT "BrandMenuItem_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMenuItem" ADD CONSTRAINT "BrandMenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BrandMenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePolicy" ADD CONSTRAINT "PricePolicy_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchOverride" ADD CONSTRAINT "BranchOverride_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorTemplate" ADD CONSTRAINT "OperatorTemplate_brandHQId_fkey" FOREIGN KEY ("brandHQId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgePosTerminal" ADD CONSTRAINT "EdgePosTerminal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
