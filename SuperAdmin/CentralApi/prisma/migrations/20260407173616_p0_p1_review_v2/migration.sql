-- AlterTable
ALTER TABLE "SuperAdminUser" DROP COLUMN "roleCode";

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_requestId_key" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "idx_superadmin_status" ON "SuperAdminUser"("status");

