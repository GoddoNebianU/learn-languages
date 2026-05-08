DROP INDEX IF EXISTS "tier_capabilities_tier_capability_key";

DROP TABLE IF EXISTS "tier_capabilities";

CREATE TABLE "tier_capabilities" (
    "tier" "DeploymentTier" NOT NULL,
    "signup" BOOLEAN NOT NULL DEFAULT true,
    "userProfile" BOOLEAN NOT NULL DEFAULT true,
    "social" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tier_capabilities_pkey" PRIMARY KEY ("tier")
);

INSERT INTO "tier_capabilities" ("tier", "signup", "userProfile", "social", "email") VALUES
    ('SINGLE', false, false, false, false),
    ('MULTI', true, true, true, true);
