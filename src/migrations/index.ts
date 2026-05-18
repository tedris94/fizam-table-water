import * as migration_20260518_164830_initial from './20260518_164830_initial';
import * as migration_20260518_232649_site_settings_seo_fields from './20260518_232649_site_settings_seo_fields';

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
];
