import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`default_keywords\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`google_site_verification\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`default_keywords\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`google_site_verification\`;`)
}
