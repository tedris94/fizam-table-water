import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`analytics_events\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`type\` text NOT NULL,
    \`path\` text,
    \`referrer\` text,
    \`session_id\` text,
    \`visitor_id\` text,
    \`user_id\` numeric,
    \`user_email\` text,
    \`target\` text,
    \`resource_type\` text,
    \`metric_name\` text,
    \`metric_value\` numeric,
    \`rating\` text,
    \`user_agent\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE INDEX \`analytics_events_type_idx\` ON \`analytics_events\` (\`type\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_path_idx\` ON \`analytics_events\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_session_id_idx\` ON \`analytics_events\` (\`session_id\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_visitor_id_idx\` ON \`analytics_events\` (\`visitor_id\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_updated_at_idx\` ON \`analytics_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_created_at_idx\` ON \`analytics_events\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`analytics_events\`;`)
}
