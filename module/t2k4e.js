/* ===============================================================================
 * TWILIGHT 2000 4E
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ===============================================================================
 * System Version: 0.0.1
 * Last Update:    14.12.2020
 * ===============================================================================
 * Contributing:
 * Please use the following repository.
 * Github: https://github.com/Stefouch/xxxx
 * ===============================================================================
 * Creator: Stefouch
 * Patreon: https://www.patreon.com/Stefouch
 * ===============================================================================
 */
import { T2K4E } from './config.js';
import T2KItemSheet from './sheets/T2KItemSheet.js';

Hooks.once('init', function() {
	console.log('t2k4e | Initializing Twilight 2000 4E System');

	// Places our classes in their own namespace for later reference.
	game.t2k4e = {
		T2KItemSheet
	};

	CONFIG.T2K4E = T2K4E;

	// Registers sheet application classes. This will stop using the core sheets and
	// instead use our customized versions.
	Actors.unregisterSheet('core', ActorSheet);
	// Actors.registerSheet('t2k4e', T2KActorSheet, { makeDefault: true });
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('t2k4e', T2KItemSheet, { makeDefault: true });

	// If you need to add Handlebars helpers, here are a few useful examples:
	Handlebars.registerHelper('concat', () => {
		let outStr = '';
		for (const arg in arguments) {
			if (typeof arguments[arg] !== 'object') {
				outStr += arguments[arg];
			}
		}
		return outStr;
	});
	
	Handlebars.registerHelper('toLowerCase', str => str.toLowerCase());
});