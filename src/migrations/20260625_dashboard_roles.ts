import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`dashboard_roles\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text NOT NULL,
    \`name\` text NOT NULL,
    \`description\` text,
    \`is_system\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX \`dashboard_roles_slug_idx\` ON \`dashboard_roles\` (\`slug\`);`)

  await db.run(sql`CREATE TABLE \`dashboard_roles_capabilities\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`key\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`dashboard_roles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`dashboard_roles_capabilities_order_idx\` ON \`dashboard_roles_capabilities\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`dashboard_roles_capabilities_parent_id_idx\` ON \`dashboard_roles_capabilities\` (\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`dashboard_roles_capabilities\`;`)
  await db.run(sql`DROP TABLE \`dashboard_roles\`;`)
}
