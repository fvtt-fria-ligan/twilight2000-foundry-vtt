/* ===============================================================================
 * TWILIGHT 2000
 * Official game by Free League Publishing (Fria Ligan): https://www.frialigan.se
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ===============================================================================
 * System Version: 0.0.1
 * Last Update:    14.12.2020
 * ===============================================================================
 * Contributing:
 * Since Let's-Role doesn't support push request, please use the following
 * Github repository: https://github.com/Stefouch/xxxx
 * ===============================================================================
 * Creator: Stefouch
 * Patreon: https://www.patreon.com/Stefouch
 * ===============================================================================
 */

import { t2k4e } from './module/config.js';
import T2KItemSheet from './module/sheets/T2KItemSheet.js';

Hooks.once('init', function() {
	console.log('frialigant2k4e | Initializing Twilight 2000 4E System');

	CONFIG.t2k4e = t2k4e;

	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('frialigant2k4e', T2KItemSheet, { makeDefault: true });
});