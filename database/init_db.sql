CREATE SCHEMA "public";
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"serial_number" varchar(100) NOT NULL CONSTRAINT "assets_serial_number_key" UNIQUE,
	"category" varchar(100),
	"assigned_to_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"status" varchar(20),
	CONSTRAINT "assets_status_check" CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'ASSIGNED'::character varying, 'DEFECTIVE'::character varying])::text[])))
);
CREATE TABLE "complaint_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"complaint_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
CREATE TABLE "complaint_feedbacks" (
	"id" uuid PRIMARY KEY,
	"complaint_id" uuid NOT NULL CONSTRAINT "complaint_feedbacks_complaint_id_key" UNIQUE,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone NOT NULL
);
CREATE TABLE "complaint_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL CONSTRAINT "complaint_statuses_code_key" UNIQUE,
	"description" text,
	"is_terminal" boolean DEFAULT false,
	"sort_order" smallint DEFAULT 0
);
CREATE TABLE "complaint_workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"complaint_id" uuid NOT NULL,
	"changed_by_id" uuid NOT NULL,
	"old_status_id" uuid,
	"new_status_id" uuid NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticket_number" serial CONSTRAINT "complaints_ticket_number_key" UNIQUE,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"asset_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"status_id" uuid NOT NULL,
	"assigned_to_id" uuid,
	"priority" varchar(20) DEFAULT 'MEDIUM',
	"due_date" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"is_escalated" boolean DEFAULT false,
	CONSTRAINT "complaints_priority_check" CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying, 'CRITICAL'::character varying])::text[])))
);
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"manager_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL CONSTRAINT "employees_email_key" UNIQUE,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"department_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"employee_number" varchar(50) NOT NULL CONSTRAINT "employees_employee_number_key" UNIQUE,
	"password_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY,
	"token" varchar(255) NOT NULL CONSTRAINT "password_reset_tokens_token_key" UNIQUE,
	"employee_id" uuid NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL
);
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL CONSTRAINT "roles_code_key" UNIQUE,
	"description" text
);
CREATE UNIQUE INDEX "assets_pkey" ON "assets" ("id");
CREATE UNIQUE INDEX "assets_serial_number_key" ON "assets" ("serial_number");
CREATE INDEX "idx_asset_serial" ON "assets" ("serial_number");
CREATE UNIQUE INDEX "complaint_comments_pkey" ON "complaint_comments" ("id");
CREATE INDEX "idx_comment_complaint" ON "complaint_comments" ("complaint_id");
CREATE UNIQUE INDEX "complaint_feedbacks_complaint_id_key" ON "complaint_feedbacks" ("complaint_id");
CREATE UNIQUE INDEX "complaint_feedbacks_pkey" ON "complaint_feedbacks" ("id");
CREATE UNIQUE INDEX "complaint_statuses_code_key" ON "complaint_statuses" ("code");
CREATE UNIQUE INDEX "complaint_statuses_pkey" ON "complaint_statuses" ("id");
CREATE UNIQUE INDEX "complaint_workflow_pkey" ON "complaint_workflow" ("id");
CREATE INDEX "idx_wf_complaint" ON "complaint_workflow" ("complaint_id","created_at");
CREATE UNIQUE INDEX "complaints_pkey" ON "complaints" ("id");
CREATE UNIQUE INDEX "complaints_ticket_number_key" ON "complaints" ("ticket_number");
CREATE INDEX "idx_complaint_asset" ON "complaints" ("asset_id");
CREATE INDEX "idx_complaint_author" ON "complaints" ("author_id");
CREATE INDEX "idx_complaint_handler" ON "complaints" ("assigned_to_id");
CREATE INDEX "idx_complaint_priority" ON "complaints" ("priority","status_id");
CREATE INDEX "idx_complaint_status" ON "complaints" ("status_id");
CREATE UNIQUE INDEX "departments_pkey" ON "departments" ("id");
CREATE UNIQUE INDEX "employees_email_key" ON "employees" ("email");
CREATE UNIQUE INDEX "employees_employee_number_key" ON "employees" ("employee_number");
CREATE UNIQUE INDEX "employees_pkey" ON "employees" ("id");
CREATE INDEX "idx_emp_dept" ON "employees" ("department_id");
CREATE INDEX "idx_emp_email" ON "employees" ("email");
CREATE INDEX "idx_notif_user_unread" ON "notifications" ("user_id");
CREATE UNIQUE INDEX "notifications_pkey" ON "notifications" ("id");
CREATE UNIQUE INDEX "password_reset_tokens_pkey" ON "password_reset_tokens" ("id");
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens" ("token");
CREATE UNIQUE INDEX "roles_code_key" ON "roles" ("code");
CREATE UNIQUE INDEX "roles_pkey" ON "roles" ("id");
ALTER TABLE "assets" ADD CONSTRAINT "fk_asset_employee" FOREIGN KEY ("assigned_to_id") REFERENCES "employees"("id");
ALTER TABLE "complaint_comments" ADD CONSTRAINT "fk_comment_author" FOREIGN KEY ("author_id") REFERENCES "employees"("id");
ALTER TABLE "complaint_comments" ADD CONSTRAINT "fk_comment_complaint" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE;
ALTER TABLE "complaint_feedbacks" ADD CONSTRAINT "fk_complaint_feedback" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id");
ALTER TABLE "complaint_workflow" ADD CONSTRAINT "fk_wf_author" FOREIGN KEY ("changed_by_id") REFERENCES "employees"("id");
ALTER TABLE "complaint_workflow" ADD CONSTRAINT "fk_wf_complaint" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE;
ALTER TABLE "complaint_workflow" ADD CONSTRAINT "fk_wf_new_status" FOREIGN KEY ("new_status_id") REFERENCES "complaint_statuses"("id");
ALTER TABLE "complaint_workflow" ADD CONSTRAINT "fk_wf_old_status" FOREIGN KEY ("old_status_id") REFERENCES "complaint_statuses"("id");
ALTER TABLE "complaints" ADD CONSTRAINT "fk_complaint_asset" FOREIGN KEY ("asset_id") REFERENCES "assets"("id");
ALTER TABLE "complaints" ADD CONSTRAINT "fk_complaint_author" FOREIGN KEY ("author_id") REFERENCES "employees"("id");
ALTER TABLE "complaints" ADD CONSTRAINT "fk_complaint_handler" FOREIGN KEY ("assigned_to_id") REFERENCES "employees"("id");
ALTER TABLE "complaints" ADD CONSTRAINT "fk_complaint_status" FOREIGN KEY ("status_id") REFERENCES "complaint_statuses"("id");
ALTER TABLE "departments" ADD CONSTRAINT "fk_dept_manager" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL;
ALTER TABLE "employees" ADD CONSTRAINT "fk_employee_dept" FOREIGN KEY ("department_id") REFERENCES "departments"("id");
ALTER TABLE "employees" ADD CONSTRAINT "fk_employee_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notification_user" FOREIGN KEY ("user_id") REFERENCES "employees"("id") ON DELETE CASCADE;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "fk_employee_password_token" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE;
CREATE VIEW "v_dashboard_stats" TABLESPACE public AS (SELECT ( SELECT count(*) AS count FROM assets WHERE assets.deleted_at IS NULL) AS total_assets, ( SELECT count(*) AS count FROM assets WHERE assets.assigned_to_id IS NOT NULL AND assets.deleted_at IS NULL) AS allocated_assets, ( SELECT count(*) AS count FROM assets WHERE assets.assigned_to_id IS NULL AND assets.deleted_at IS NULL) AS available_assets, ( SELECT count(DISTINCT a.id) AS count FROM assets a JOIN complaints c ON a.id = c.asset_id JOIN complaint_statuses cs ON c.status_id = cs.id WHERE cs.is_terminal = false AND c.deleted_at IS NULL AND a.deleted_at IS NULL) AS broken_assets, ( SELECT count(*) AS count FROM assets WHERE assets.deleted_at IS NOT NULL) AS deleted_assets, ( SELECT count(*) AS count FROM complaints WHERE complaints.deleted_at IS NULL) AS total_tickets, ( SELECT count(*) AS count FROM complaints c JOIN complaint_statuses cs ON c.status_id = cs.id WHERE cs.code::text = 'NEW'::text AND c.deleted_at IS NULL) AS new_tickets, ( SELECT count(*) AS count FROM complaints c JOIN complaint_statuses cs ON c.status_id = cs.id WHERE cs.code::text = 'IN_PROGRESS'::text AND c.deleted_at IS NULL) AS in_progress_tickets, ( SELECT count(*) AS count FROM complaints c JOIN complaint_statuses cs ON c.status_id = cs.id WHERE cs.code::text = 'RESOLVED'::text AND c.deleted_at IS NULL) AS resolved_tickets, ( SELECT count(*) AS count FROM complaints WHERE complaints.deleted_at IS NOT NULL) AS deleted_tickets);
