/* ===============================================================================
 * TWILIGHT 2000 4E
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ===============================================================================
 * System Version: 0.0.1
 * Last Update:    20.12.2020
 * ===============================================================================
 * Contributing: https://github.com/Stefouch/t2k4e
 * ===============================================================================
 * Creator: Stefouch
 * Patreon: https://www.patreon.com/Stefouch
 * ===============================================================================
 */

// Imports Modules.
import { T2K4E } from './module/config.js';
import { preloadHandlebarsTemplates } from './module/templates.js';

// Imports Entities.
import ActorT2K from './module/actor/actor.js';
import ItemT2K from './module/item/item.js';

// Imports Applications.
import ItemSheetT2K from './module/item/itemSheet.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function() {
	console.log(`t2k4e | Initializing the Twilight 2000 4E Game System\n${T2K4E.ASCII}`);

	// Creates a namespace within the game global.
	// Places our classes in their own namespace for later reference.
	game.t2k4e = {
		applications: {
			ItemSheetT2K
		},
		config: T2K4E,
		entities: {
			ActorT2K,
			ItemT2K
		}
	};

	// Records configuration values.
	CONFIG.T2K4E = T2K4E;
	CONFIG.Actor.entityClass = ActorT2K;
	CONFIG.Item.entityClass = ItemT2K;

	// Patches Core functions.
	CONFIG.Combat.initiative = {
		formula: '1d10 + @data.attributes.agl.value / 10',
		decimals: 1
	}

	// Registers sheet application classes. 
	// This will stop using the core sheets and instead use our customized versions.
	// Actors.unregisterSheet('core', ActorSheet);
	// Actors.registerSheet('t2k4e', ActorSheetT2K, { makeDefault: true });
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('t2k4e', ItemSheetT2K, { makeDefault: true });

	preloadHandlebarsTemplates();

	/* -------------------------------------------- */
	/*  HandlebarsJS Custom Helpers                 */
	/* -------------------------------------------- */

	Handlebars.registerHelper('concat', function() {
		let str = '';
		for (const arg in arguments) {
			if (typeof arguments[arg] !== 'object') {
				str += arguments[arg];
			}
		}
		return str;
	});
	
	Handlebars.registerHelper('toLowerCase', function(str) {
		return str.toLowerCase();
	});

	Handlebars.registerHelper('times', function(n, content) {
		let str = '';
		for (; n > 0; n--) str += content.fn(n);
		return str;
	});

	/**
	 * Templates for a die Score selector.
	 * Parameters:
	 * * `name` - The name of the affected variable.
	 * * `selected` - The current selected value.
	 */
	Handlebars.registerPartial(
		'scoreSelector',
		`<select name="{{name}}" class="score-selector">
			{{#select selected}}
			{{#each config.dieScores}}
			<option value="{{.}}">{{.}}</option>
			{{/each}}
			{{/select}}
		</select>`
	);
});