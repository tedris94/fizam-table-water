import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.run(
    sql`SELECT name FROM pragma_table_info('products') WHERE name = 'category'`,
  )
  if (!rows.length) {
    await db.run(sql`ALTER TABLE \`products\` ADD \`category\` text DEFAULT 'table_water';`)
  }
  await db.run(sql`UPDATE \`products\` SET \`category\` = 'sachet_water' WHERE lower(\`name\`) LIKE '%sachet%';`)
  await db.run(sql`UPDATE \`products\` SET \`category\` = 'dispenser' WHERE lower(\`name\`) LIKE '%dispenser%';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`category\`;`)
}
