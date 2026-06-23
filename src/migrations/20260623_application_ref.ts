import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`applications\` ADD COLUMN \`application_ref\` text;`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`applications_application_ref_idx\` ON \`applications\` (\`application_ref\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`applications_application_ref_idx\`;`)
}
