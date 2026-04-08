-- 한국어: UserRoleAssignment 에 scopeDistributorId 컬럼 추가 (4축 tenancy: distributor/brand/branch/corporate).
-- Tiếng Việt: Thêm cột scopeDistributorId vào UserRoleAssignment cho 4 trục tenancy.

ALTER TABLE "UserRoleAssignment"
  ADD COLUMN "scopeDistributorId" UUID NULL;

CREATE INDEX IF NOT EXISTS "idx_uraa_scope_distributor"
  ON "UserRoleAssignment" ("scopeDistributorId")
  WHERE "scopeDistributorId" IS NOT NULL;
