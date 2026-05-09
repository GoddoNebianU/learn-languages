ALTER TABLE "system_config" ALTER COLUMN "tier" DROP DEFAULT,
  ALTER COLUMN "tier" TYPE TEXT USING "tier"::text;
ALTER TABLE "system_config" ALTER COLUMN "tier" SET DEFAULT 'SINGLE';

ALTER TABLE "tier_capabilities" ALTER COLUMN "tier" TYPE TEXT USING "tier"::text;

DROP TYPE IF EXISTS "DeploymentTier";
