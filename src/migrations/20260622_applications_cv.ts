import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`applications\` ADD COLUMN \`professional_summary\` text;`)
  await db.run(sql`ALTER TABLE \`applications\` ADD COLUMN \`motivation_statement\` text;`)

  await db.run(sql`CREATE TABLE \`applications_education_history\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`qualification\` text,
    \`institution\` text,
    \`field_of_study\` text,
    \`start_year\` text,
    \`end_year\` text,
    \`grade\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`applications_education_history_order_idx\` ON \`applications_education_history\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`applications_education_history_parent_id_idx\` ON \`applications_education_history\` (\`_parent_id\`);`)

  await db.run(sql`CREATE TABLE \`applications_work_history\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`job_title\` text,
    \`company\` text,
    \`location\` text,
    \`start_date\` text,
    \`end_date\` text,
    \`current\` integer DEFAULT false,
    \`description\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`applications_work_history_order_idx\` ON \`applications_work_history\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`applications_work_history_parent_id_idx\` ON \`applications_work_history\` (\`_parent_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`applications_work_history\`;`)
  await db.run(sql`DROP TABLE \`applications_education_history\`;`)
  // SQLite does not support DROP COLUMN in older versions — leave summary columns.
}
