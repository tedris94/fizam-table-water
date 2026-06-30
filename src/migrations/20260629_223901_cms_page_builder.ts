import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`product_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 100,
  	\`is_active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_slug_idx\` ON \`product_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_updated_at_idx\` ON \`product_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_created_at_idx\` ON \`product_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`product_sizes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`category_slug\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 100,
  	\`is_active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`product_sizes_updated_at_idx\` ON \`product_sizes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_sizes_created_at_idx\` ON \`product_sizes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`product_tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 100,
  	\`is_active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`product_tags_slug_idx\` ON \`product_tags\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`product_tags_updated_at_idx\` ON \`product_tags\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_tags_created_at_idx\` ON \`product_tags\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`product_tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`product_tags_id\`) REFERENCES \`product_tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_product_tags_id_idx\` ON \`products_rels\` (\`product_tags_id\`);`)
  await db.run(sql`CREATE TABLE \`applications_education_history\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`qualification\` text NOT NULL,
  	\`institution\` text NOT NULL,
  	\`field_of_study\` text,
  	\`start_year\` text,
  	\`end_year\` text,
  	\`grade\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`applications_education_history_order_idx\` ON \`applications_education_history\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`applications_education_history_parent_id_idx\` ON \`applications_education_history\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`applications_work_history\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`job_title\` text NOT NULL,
  	\`company\` text NOT NULL,
  	\`location\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`current\` integer DEFAULT false,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`applications_work_history_order_idx\` ON \`applications_work_history\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`applications_work_history_parent_id_idx\` ON \`applications_work_history\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_idx\` ON \`pages_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'right',
  	\`cta_label\` text,
  	\`cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_order_idx\` ON \`pages_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_parent_id_idx\` ON \`pages_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_path_idx\` ON \`pages_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_image_idx\` ON \`pages_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_products_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`size\` text,
  	\`description\` text,
  	\`icon\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_products_items_order_idx\` ON \`pages_blocks_products_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_products_items_parent_id_idx\` ON \`pages_blocks_products_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_products\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`banner_heading\` text,
  	\`banner_body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_products_order_idx\` ON \`pages_blocks_products\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_products_parent_id_idx\` ON \`pages_blocks_products\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_products_path_idx\` ON \`pages_blocks_products\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_quality_certifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_quality\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_certifications_order_idx\` ON \`pages_blocks_quality_certifications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_certifications_parent_id_idx\` ON \`pages_blocks_quality_certifications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_quality_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_quality\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_steps_order_idx\` ON \`pages_blocks_quality_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_steps_parent_id_idx\` ON \`pages_blocks_quality_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_quality\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`heading\` text,
  	\`subheading\` text,
  	\`process_heading\` text,
  	\`guarantee_title\` text,
  	\`guarantee_body\` text,
  	\`stat_value\` text,
  	\`stat_label\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_order_idx\` ON \`pages_blocks_quality\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_parent_id_idx\` ON \`pages_blocks_quality\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quality_path_idx\` ON \`pages_blocks_quality\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_sales_channels_channels_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_sales_channels_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_channels_features_order_idx\` ON \`pages_blocks_sales_channels_channels_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_channels_features_parent_id_idx\` ON \`pages_blocks_sales_channels_channels_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_sales_channels_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_sales_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_channels_order_idx\` ON \`pages_blocks_sales_channels_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_channels_parent_id_idx\` ON \`pages_blocks_sales_channels_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_sales_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`cta_heading\` text,
  	\`cta_body\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_order_idx\` ON \`pages_blocks_sales_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_parent_id_idx\` ON \`pages_blocks_sales_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_sales_channels_path_idx\` ON \`pages_blocks_sales_channels\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact_why_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_contact\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_why_items_order_idx\` ON \`pages_blocks_contact_why_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_why_items_parent_id_idx\` ON \`pages_blocks_contact_why_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`phone\` text,
  	\`phone_href\` text,
  	\`email\` text,
  	\`address\` text,
  	\`hours\` text,
  	\`why_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_order_idx\` ON \`pages_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_parent_id_idx\` ON \`pages_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_path_idx\` ON \`pages_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_feature_grid_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_feature_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_feature_grid_features_order_idx\` ON \`pages_blocks_feature_grid_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_feature_grid_features_parent_id_idx\` ON \`pages_blocks_feature_grid_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_feature_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`columns\` text DEFAULT '4',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_feature_grid_order_idx\` ON \`pages_blocks_feature_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_feature_grid_parent_id_idx\` ON \`pages_blocks_feature_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_feature_grid_path_idx\` ON \`pages_blocks_feature_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_banner_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text,
  	\`style\` text DEFAULT 'primary',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_banner_buttons_order_idx\` ON \`pages_blocks_cta_banner_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_banner_buttons_parent_id_idx\` ON \`pages_blocks_cta_banner_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_banner_order_idx\` ON \`pages_blocks_cta_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_banner_parent_id_idx\` ON \`pages_blocks_cta_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_banner_path_idx\` ON \`pages_blocks_cta_banner\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_order_idx\` ON \`pages_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_parent_id_idx\` ON \`pages_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_path_idx\` ON \`pages_blocks_rich_text\` (\`_path\`);`)
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
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`email_templates_slug_idx\` ON \`email_templates\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`email_templates_updated_at_idx\` ON \`email_templates\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`email_templates_created_at_idx\` ON \`email_templates\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`dashboard_roles_capabilities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dashboard_roles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dashboard_roles_capabilities_order_idx\` ON \`dashboard_roles_capabilities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dashboard_roles_capabilities_parent_id_idx\` ON \`dashboard_roles_capabilities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dashboard_roles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`is_system\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`dashboard_roles_slug_idx\` ON \`dashboard_roles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`dashboard_roles_updated_at_idx\` ON \`dashboard_roles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`dashboard_roles_created_at_idx\` ON \`dashboard_roles\` (\`created_at\`);`)
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
  );
  `)
  await db.run(sql`CREATE INDEX \`analytics_events_type_idx\` ON \`analytics_events\` (\`type\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_path_idx\` ON \`analytics_events\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_session_id_idx\` ON \`analytics_events\` (\`session_id\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_visitor_id_idx\` ON \`analytics_events\` (\`visitor_id\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_updated_at_idx\` ON \`analytics_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`analytics_events_created_at_idx\` ON \`analytics_events\` (\`created_at\`);`)
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
  );
  `)
  await db.run(sql`CREATE INDEX \`audit_logs_action_idx\` ON \`audit_logs\` (\`action\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_collection_slug_idx\` ON \`audit_logs\` (\`collection_slug\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_user_email_idx\` ON \`audit_logs\` (\`user_email\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_updated_at_idx\` ON \`audit_logs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_created_at_idx\` ON \`audit_logs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_hero_order_idx\` ON \`home_page_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_hero_parent_id_idx\` ON \`home_page_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_hero_path_idx\` ON \`home_page_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_hero_image_idx\` ON \`home_page_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'right',
  	\`cta_label\` text,
  	\`cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_image_text_order_idx\` ON \`home_page_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_image_text_parent_id_idx\` ON \`home_page_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_image_text_path_idx\` ON \`home_page_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_image_text_image_idx\` ON \`home_page_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_products_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`size\` text,
  	\`description\` text,
  	\`icon\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_products_items_order_idx\` ON \`home_page_blocks_products_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_products_items_parent_id_idx\` ON \`home_page_blocks_products_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_products\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`banner_heading\` text,
  	\`banner_body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_products_order_idx\` ON \`home_page_blocks_products\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_products_parent_id_idx\` ON \`home_page_blocks_products\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_products_path_idx\` ON \`home_page_blocks_products\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_quality_certifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_quality\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_certifications_order_idx\` ON \`home_page_blocks_quality_certifications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_certifications_parent_id_idx\` ON \`home_page_blocks_quality_certifications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_quality_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_quality\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_steps_order_idx\` ON \`home_page_blocks_quality_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_steps_parent_id_idx\` ON \`home_page_blocks_quality_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_quality\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`heading\` text,
  	\`subheading\` text,
  	\`process_heading\` text,
  	\`guarantee_title\` text,
  	\`guarantee_body\` text,
  	\`stat_value\` text,
  	\`stat_label\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_order_idx\` ON \`home_page_blocks_quality\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_parent_id_idx\` ON \`home_page_blocks_quality\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_quality_path_idx\` ON \`home_page_blocks_quality\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_sales_channels_channels_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_sales_channels_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_channels_features_order_idx\` ON \`home_page_blocks_sales_channels_channels_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_channels_features_parent_id_idx\` ON \`home_page_blocks_sales_channels_channels_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_sales_channels_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_sales_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_channels_order_idx\` ON \`home_page_blocks_sales_channels_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_channels_parent_id_idx\` ON \`home_page_blocks_sales_channels_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_sales_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`cta_heading\` text,
  	\`cta_body\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_order_idx\` ON \`home_page_blocks_sales_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_parent_id_idx\` ON \`home_page_blocks_sales_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_sales_channels_path_idx\` ON \`home_page_blocks_sales_channels\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_contact_why_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_contact\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_contact_why_items_order_idx\` ON \`home_page_blocks_contact_why_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_contact_why_items_parent_id_idx\` ON \`home_page_blocks_contact_why_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`phone\` text,
  	\`phone_href\` text,
  	\`email\` text,
  	\`address\` text,
  	\`hours\` text,
  	\`why_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_contact_order_idx\` ON \`home_page_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_contact_parent_id_idx\` ON \`home_page_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_contact_path_idx\` ON \`home_page_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_feature_grid_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_feature_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_grid_features_order_idx\` ON \`home_page_blocks_feature_grid_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_grid_features_parent_id_idx\` ON \`home_page_blocks_feature_grid_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_feature_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`subheading\` text,
  	\`columns\` text DEFAULT '4',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_grid_order_idx\` ON \`home_page_blocks_feature_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_grid_parent_id_idx\` ON \`home_page_blocks_feature_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_grid_path_idx\` ON \`home_page_blocks_feature_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_cta_banner_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text,
  	\`style\` text DEFAULT 'primary',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_cta_banner\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_banner_buttons_order_idx\` ON \`home_page_blocks_cta_banner_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_banner_buttons_parent_id_idx\` ON \`home_page_blocks_cta_banner_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_cta_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_banner_order_idx\` ON \`home_page_blocks_cta_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_banner_parent_id_idx\` ON \`home_page_blocks_cta_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_banner_path_idx\` ON \`home_page_blocks_cta_banner\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_order_idx\` ON \`home_page_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_parent_id_idx\` ON \`home_page_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_path_idx\` ON \`home_page_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`header_nav_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_nav_links_order_idx\` ON \`header_nav_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_nav_links_parent_id_idx\` ON \`header_nav_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`brand_name\` text DEFAULT 'FIZAM Table Water',
  	\`cta_label\` text,
  	\`cta_href\` text,
  	\`show_login\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_links_order_idx\` ON \`footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_links_parent_id_idx\` ON \`footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_order_idx\` ON \`footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_parent_id_idx\` ON \`footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_contact_phones\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_contact_phones_order_idx\` ON \`footer_contact_phones\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_contact_phones_parent_id_idx\` ON \`footer_contact_phones\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_socials_order_idx\` ON \`footer_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_socials_parent_id_idx\` ON \`footer_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_legal_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_legal_links_order_idx\` ON \`footer_legal_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_legal_links_parent_id_idx\` ON \`footer_legal_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`about\` text,
  	\`contact_email\` text,
  	\`contact_address\` text,
  	\`copyright\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_title\` text DEFAULT 'Fizam: Pure hydration for every Nigerian home',
  	\`hero_subtitle\` text,
  	\`hero_image_id\` integer,
  	\`about_heading\` text,
  	\`about_body\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_title", "hero_subtitle", "hero_image_id", "about_heading", "about_body", "updated_at", "created_at") SELECT "id", "hero_title", "hero_subtitle", "hero_image_id", "about_heading", "about_body", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`category\` text DEFAULT 'table_water' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`applications\` ADD \`application_ref\` text;`)
  await db.run(sql`ALTER TABLE \`applications\` ADD \`professional_summary\` text;`)
  await db.run(sql`ALTER TABLE \`applications\` ADD \`motivation_statement\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`applications_application_ref_idx\` ON \`applications\` (\`application_ref\`);`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_categories_id\` integer REFERENCES product_categories(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_sizes_id\` integer REFERENCES product_sizes(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_tags_id\` integer REFERENCES product_tags(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`email_templates_id\` integer REFERENCES email_templates(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`dashboard_roles_id\` integer REFERENCES dashboard_roles(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`analytics_events_id\` integer REFERENCES analytics_events(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`audit_logs_id\` integer REFERENCES audit_logs(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`product_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_sizes_id_idx\` ON \`payload_locked_documents_rels\` (\`product_sizes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`product_tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_email_templates_id_idx\` ON \`payload_locked_documents_rels\` (\`email_templates_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_dashboard_roles_id_idx\` ON \`payload_locked_documents_rels\` (\`dashboard_roles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_analytics_events_id_idx\` ON \`payload_locked_documents_rels\` (\`analytics_events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_logs_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_logs_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`show_login_demo_card\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`product_categories\`;`)
  await db.run(sql`DROP TABLE \`product_sizes\`;`)
  await db.run(sql`DROP TABLE \`product_tags\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`applications_education_history\`;`)
  await db.run(sql`DROP TABLE \`applications_work_history\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_products_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_products\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_quality_certifications\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_quality_steps\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_quality\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_sales_channels_channels_features\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_sales_channels_channels\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_sales_channels\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact_why_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_feature_grid_features\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_feature_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_banner_buttons\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_banner\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`email_templates\`;`)
  await db.run(sql`DROP TABLE \`dashboard_roles_capabilities\`;`)
  await db.run(sql`DROP TABLE \`dashboard_roles\`;`)
  await db.run(sql`DROP TABLE \`analytics_events\`;`)
  await db.run(sql`DROP TABLE \`audit_logs\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_products_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_products\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_quality_certifications\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_quality_steps\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_quality\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_sales_channels_channels_features\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_sales_channels_channels\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_sales_channels\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_contact_why_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_feature_grid_features\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_feature_grid\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_cta_banner_buttons\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_cta_banner\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`header_nav_links\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`DROP TABLE \`footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`footer_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_contact_phones\`;`)
  await db.run(sql`DROP TABLE \`footer_socials\`;`)
  await db.run(sql`DROP TABLE \`footer_legal_links\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`products_id\` integer,
  	\`orders_id\` integer,
  	\`team_members_id\` integer,
  	\`jobs_id\` integer,
  	\`applications_id\` integer,
  	\`pages_id\` integer,
  	\`shipping_zones_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`orders_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`team_members_id\`) REFERENCES \`team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`jobs_id\`) REFERENCES \`jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`applications_id\`) REFERENCES \`applications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`shipping_zones_id\`) REFERENCES \`shipping_zones\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "products_id", "orders_id", "team_members_id", "jobs_id", "applications_id", "pages_id", "shipping_zones_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "products_id", "orders_id", "team_members_id", "jobs_id", "applications_id", "pages_id", "shipping_zones_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_team_members_id_idx\` ON \`payload_locked_documents_rels\` (\`team_members_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`jobs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_shipping_zones_id_idx\` ON \`payload_locked_documents_rels\` (\`shipping_zones_id\`);`)
  await db.run(sql`DROP INDEX \`applications_application_ref_idx\`;`)
  await db.run(sql`ALTER TABLE \`applications\` DROP COLUMN \`application_ref\`;`)
  await db.run(sql`ALTER TABLE \`applications\` DROP COLUMN \`professional_summary\`;`)
  await db.run(sql`ALTER TABLE \`applications\` DROP COLUMN \`motivation_statement\`;`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_title\` text DEFAULT 'Pure hydration for every Nigerian home',
  	\`hero_subtitle\` text,
  	\`hero_image_id\` integer,
  	\`about_heading\` text,
  	\`about_body\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_title", "hero_subtitle", "hero_image_id", "about_heading", "about_body", "updated_at", "created_at") SELECT "id", "hero_title", "hero_subtitle", "hero_image_id", "about_heading", "about_body", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`status\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`show_login_demo_card\`;`)
}
