// config: true (visible)
// scope: world (gm), client (player)

/**
 * Registers system settings.
 */
export function registerSystemSettings() {
	game.settings.register('t2k4e', 'showTaskCheckOptions', {
		config: true,
		scope: 'client',
		name: 'SETTINGS.showTaskCheckOptions.name',
		hint: 'SETTINGS.showTaskCheckOptions.label',
		type: Boolean,
		default: true,
	});
}