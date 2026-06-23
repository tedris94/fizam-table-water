import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`product_categories\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text NOT NULL,
    \`label\` text NOT NULL,
    \`sort_order\` numeric DEFAULT 100,
    \`is_active\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_slug_idx\` ON \`product_categories\` (\`slug\`);`)

  await db.run(sql`CREATE TABLE \`product_sizes\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text NOT NULL,
    \`category_slug\` text NOT NULL,
    \`sort_order\` numeric DEFAULT 100,
    \`is_active\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE INDEX \`product_sizes_category_slug_idx\` ON \`product_sizes\` (\`category_slug\`);`)

  await db.run(sql`CREATE TABLE \`product_tags\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text NOT NULL,
    \`label\` text NOT NULL,
    \`sort_order\` numeric DEFAULT 100,
    \`is_active\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX \`product_tags_slug_idx\` ON \`product_tags\` (\`slug\`);`)

  await db.run(sql`CREATE TABLE \`products_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`product_tags_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`product_tags_id\`) REFERENCES \`product_tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`product_tags\`;`)
  await db.run(sql`DROP TABLE \`product_sizes\`;`)
  await db.run(sql`DROP TABLE \`product_categories\`;`)
}
