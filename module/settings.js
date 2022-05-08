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

  game.settings.register('t2k4e', 'trackPcAmmo', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackPcAmmo.name',
    hint: 'SETTINGS.trackPcAmmo.label',
    type: Boolean,
    default: true,
  });

  game.settings.register('t2k4e', 'trackNpcAmmo', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackNpcAmmo.name',
    hint: 'SETTINGS.trackNpcAmmo.label',
    type: Boolean,
    default: false,
  });

  game.settings.register('t2k4e', 'trackVehicleAmmo', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackVehicleAmmo.name',
    hint: 'SETTINGS.trackVehicleAmmo.label',
    type: Boolean,
    default: true,
  });

  game.settings.register('t2k4e', 'showTaskCheckOptions', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showTaskCheckOptions.name',
    hint: 'SETTINGS.showTaskCheckOptions.label',
    type: Boolean,
    default: true,
  });

  game.settings.register('t2k4e', 'closeRollTooltipDelay', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.closeRollTooltipDelay.name',
    hint: 'SETTINGS.closeRollTooltipDelay.label',
    type: Number,
    default: 60,
  });

  game.settings.register('t2k4e', 'defaultCharTokenSize', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.defaultCharTokenSize.name',
    hint: 'SETTINGS.defaultCharTokenSize.label',
    type: Number,
    default: 1,
  });

  game.settings.register('t2k4e', 'travelRollAllowPush', {
    config: false,
    scope: 'world',
    name: 'FLPS.SETTINGS.ALLOW_PUSH',
    hint: 'FLPS.SETTINGS.ALLOW_PUSH_HINT',
    type: Boolean,
    default: false,
  });
}