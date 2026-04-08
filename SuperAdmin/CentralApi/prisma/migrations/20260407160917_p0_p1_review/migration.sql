-- AlterTable
ALTER TABLE "BrandHqEntitlement" ADD COLUMN     "licenseId" UUID;

-- CreateTable
CREATE TABLE "SyncOutbox" (
    "id" UUID NOT NULL,
    "channel" VARCHAR(60) NOT NULL,
    "scopeType" VARCHAR(30) NOT NULL,
    "scopeId" UUID,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" VARCHAR(2000),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickedAt" TIMESTAMPTZ,
    "ackedAt" TIMESTAMPTZ,
    "workerId" VARCHAR(120),

    CONSTRAINT "SyncOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_sync_outbox_status_time" ON "SyncOutbox"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_sync_outbox_channel_status" ON "SyncOutbox"("channel", "status");

-- CreateIndex
CREATE INDEX "idx_sync_outbox_scope_status" ON "SyncOutbox"("scopeType", "scopeId", "status");

-- CreateIndex
CREATE INDEX "idx_entitlement_license" ON "BrandHqEntitlement"("licenseId");

-- AddForeignKey
ALTER TABLE "BrandHqEntitlement" ADD CONSTRAINT "BrandHqEntitlement_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "PlatformLicense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

