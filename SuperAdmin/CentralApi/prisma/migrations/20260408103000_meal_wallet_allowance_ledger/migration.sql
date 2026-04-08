-- MealWallet allowance ledger expansion
-- company allowance / personal top-up bucket split + funding audit entries + split-payment share tracking

DO $$
BEGIN
  CREATE TYPE "MealWalletFundingSourceType" AS ENUM ('COMPANY_ALLOWANCE', 'PERSONAL_TOP_UP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "MealWalletFundingStatus" AS ENUM ('PENDING', 'POSTED', 'REVERSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "MealWallet"
  ADD COLUMN IF NOT EXISTS "companyAllowanceVnd" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "personalTopUpVnd" BIGINT NOT NULL DEFAULT 0;

UPDATE "MealWallet"
SET "companyAllowanceVnd" = "balanceVnd"
WHERE "companyAllowanceVnd" = 0 AND "personalTopUpVnd" = 0;

ALTER TABLE "MealTransaction"
  ADD COLUMN IF NOT EXISTS "companyShareVnd" BIGINT NOT NULL DEFAULT 0;

UPDATE "MealTransaction"
SET "companyShareVnd" = "approvedAmountVnd"
WHERE "companyShareVnd" = 0 AND "status" = 'APPROVED';

CREATE TABLE IF NOT EXISTS "MealWalletFundingEntry" (
  "id" UUID NOT NULL,
  "walletId" UUID NOT NULL,
  "sourceType" "MealWalletFundingSourceType" NOT NULL,
  "status" "MealWalletFundingStatus" NOT NULL DEFAULT 'POSTED',
  "amountVnd" BIGINT NOT NULL,
  "sourceBatchId" VARCHAR(120),
  "sourceReferenceId" VARCHAR(120),
  "note" VARCHAR(500),
  "postedAt" TIMESTAMPTZ,
  "reversedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "MealWalletFundingEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_meal_wallet_entry_wallet_source"
  ON "MealWalletFundingEntry"("walletId", "sourceType");

CREATE INDEX IF NOT EXISTS "idx_meal_wallet_entry_wallet_status_time"
  ON "MealWalletFundingEntry"("walletId", "status", "createdAt" DESC);

ALTER TABLE "MealWalletFundingEntry"
  ADD CONSTRAINT "MealWalletFundingEntry_walletId_fkey"
  FOREIGN KEY ("walletId") REFERENCES "MealWallet"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
