import * as migration_20260908_115900_initial from './20260908_115900_initial';

export const migrations = [
  {
    up: migration_20260908_115900_initial.up,
    down: migration_20260908_115900_initial.down,
    name: '20260908_115900_initial'
  },
];
