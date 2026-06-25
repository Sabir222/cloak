-- Migration: Add skills, agent_products, pack_skills, pack_personas tables
-- Rename agents → personas, pack_agents → pack_personas
-- Update purchases with skillId and agentProductId

-- Create personas table (replaces agents)
CREATE TABLE IF NOT EXISTS "personas" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "division" varchar(100) NOT NULL,
  "emoji" varchar(10),
  "file_path" varchar(500) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "personas_slug_unique" UNIQUE("slug")
);

-- Create skills table
CREATE TABLE IF NOT EXISTS "skills" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "price_cents" integer NOT NULL,
  "stripe_price_id" varchar(255),
  "file_path" varchar(500) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);

-- Create agent_products table (zip-based products like TroveScout)
CREATE TABLE IF NOT EXISTS "agent_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "version" varchar(50),
  "price_cents" integer NOT NULL,
  "stripe_price_id" varchar(255),
  "zip_path" varchar(500) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "agent_products_slug_unique" UNIQUE("slug")
);

-- Create pack_skills join table
CREATE TABLE IF NOT EXISTS "pack_skills" (
  "pack_id" integer NOT NULL REFERENCES "packs"("id") ON DELETE CASCADE,
  "skill_id" integer NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE
);

-- Create pack_personas join table
CREATE TABLE IF NOT EXISTS "pack_personas" (
  "pack_id" integer NOT NULL REFERENCES "packs"("id") ON DELETE CASCADE,
  "persona_id" integer NOT NULL REFERENCES "personas"("id") ON DELETE CASCADE
);

-- Update purchases table
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "persona_ids" jsonb;
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "skill_id" integer REFERENCES "skills"("id");
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "agent_product_id" integer REFERENCES "agent_products"("id");

-- Migrate existing agents data to personas
INSERT INTO "personas" ("slug", "name", "description", "division", "emoji", "file_path", "created_at")
SELECT "slug", "name", "description", "division", "emoji", "file_path", "created_at" FROM "agents";

-- Migrate existing pack_agents to pack_personas
INSERT INTO "pack_personas" ("pack_id", "persona_id")
SELECT pa."pack_id", p."id"
FROM "pack_agents" pa
INNER JOIN "personas" p ON p."slug" = (SELECT a."slug" FROM "agents" a WHERE a."id" = pa."agent_id");

-- Migrate existing purchase agentIds to personaIds
UPDATE "purchases" SET "persona_ids" = "agent_ids" WHERE "agent_ids" IS NOT NULL;

-- Update packs default bundle_type
ALTER TABLE "packs" ALTER COLUMN "bundle_type" SET DEFAULT 'skill-pack';
