ALTER TABLE "packs" ADD COLUMN "bundle_type" varchar(20) DEFAULT 'agent-pack' NOT NULL;--> statement-breakpoint
ALTER TABLE "packs" ADD COLUMN "data_path" varchar(500);