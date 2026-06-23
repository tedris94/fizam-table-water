import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`email_templates\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text NOT NULL,
    \`name\` text NOT NULL,
    \`description\` text,
    \`category\` text NOT NULL,
    \`layout\` text DEFAULT 'careers' NOT NULL,
    \`subject\` text NOT NULL,
    \`text_body\` text NOT NULL,
    \`html_body\` text NOT NULL,
    \`variables_help\` text,
    \`enabled\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX \`email_templates_slug_idx\` ON \`email_templates\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`email_templates_updated_at_idx\` ON \`email_templates\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`email_templates_created_at_idx\` ON \`email_templates\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`email_templates\`;`)
}
