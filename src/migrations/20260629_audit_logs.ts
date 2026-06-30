import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`audit_logs\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`action\` text NOT NULL,
    \`collection_slug\` text,
    \`document_id\` text,
    \`title\` text,
    \`user_id\` numeric,
    \`user_email\` text,
    \`user_role\` text,
    \`changes\` text,
    \`ip\` text,
    \`user_agent\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE INDEX \`audit_logs_action_idx\` ON \`audit_logs\` (\`action\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_collection_slug_idx\` ON \`audit_logs\` (\`collection_slug\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_user_email_idx\` ON \`audit_logs\` (\`user_email\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_updated_at_idx\` ON \`audit_logs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_created_at_idx\` ON \`audit_logs\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`audit_logs\`;`)
}
