import * as migration_20260518_164830_initial from './20260518_164830_initial';

export const migrations = [
  {
    up: migration_20260518_164830_initial.up,
    down: migration_20260518_164830_initial.down,
    name: '20260518_164830_initial'
  },
];
