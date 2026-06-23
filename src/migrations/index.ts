import * as migration_20260518_164830_initial from './20260518_164830_initial';
import * as migration_20260518_232649_site_settings_seo_fields from './20260518_232649_site_settings_seo_fields';
import * as migration_20260619_products_category from './20260619_products_category';
import * as migration_20260621_product_taxonomy from './20260621_product_taxonomy';
import * as migration_20260622_applications_cv from './20260622_applications_cv';
import * as migration_20260623_application_ref from './20260623_application_ref';
import * as migration_20260624_email_templates from './20260624_email_templates';
import * as migration_20260625_dashboard_roles from './20260625_dashboard_roles';

export const migrations = [
  {
    up: migration_20260518_164830_initial.up,
    down: migration_20260518_164830_initial.down,
    name: '20260518_164830_initial',
  },
  {
    up: migration_20260518_232649_site_settings_seo_fields.up,
    down: migration_20260518_232649_site_settings_seo_fields.down,
    name: '20260518_232649_site_settings_seo_fields'
  },
  {
    up: migration_20260619_products_category.up,
    down: migration_20260619_products_category.down,
    name: '20260619_products_category',
  },
  {
    up: migration_20260621_product_taxonomy.up,
    down: migration_20260621_product_taxonomy.down,
    name: '20260621_product_taxonomy',
  },
  {
    up: migration_20260622_applications_cv.up,
    down: migration_20260622_applications_cv.down,
    name: '20260622_applications_cv',
  },
  {
    up: migration_20260623_application_ref.up,
    down: migration_20260623_application_ref.down,
    name: '20260623_application_ref',
  },
  {
    up: migration_20260624_email_templates.up,
    down: migration_20260624_email_templates.down,
    name: '20260624_email_templates',
  },
  {
    up: migration_20260625_dashboard_roles.up,
    down: migration_20260625_dashboard_roles.down,
    name: '20260625_dashboard_roles',
  },
];
