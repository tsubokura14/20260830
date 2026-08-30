CREATE TYPE "public"."achievement_type" AS ENUM('input', 'output');--> statement-breakpoint
CREATE TABLE "achievement_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(300) NOT NULL,
	"color" varchar DEFAULT 'slate' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"type" "achievement_type" NOT NULL,
	"theme" varchar(300) NOT NULL,
	"content" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"password_hash" varchar NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "achievement_groups" ADD CONSTRAINT "achievement_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_group_id_achievement_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."achievement_groups"("id") ON DELETE restrict ON UPDATE no action;