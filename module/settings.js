// config: true (visible)
// scope: world (gm), client (player)

/**
 * Registers system settings.
 */
export function registerSystemSettings() {
  // Tracks the system version.
  game.settings.register('t2k4e', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    name: 'System Migration Version',
    type: String,
    default: '',
  });

  game.settings.register('t2k4e', 'showTaskCheckOptions', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showTaskCheckOptions.name',
    hint: 'SETTINGS.showTaskCheckOptions.label',
    type: Boolean,
    default: true,
  });
}