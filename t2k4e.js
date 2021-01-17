/* ===============================================================================
 * TWILIGHT 2000 4E
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ===============================================================================
 * Contributing: https://github.com/Stefouch/t2k4e
 * ===============================================================================
 * Creator: Stefouch
 * Patreon: https://www.patreon.com/Stefouch
 * ===============================================================================
 */

// Imports Modules.
import { T2K4E } from './module/config.js';
import { registerSystemSettings } from './module/settings.js';
import { preloadHandlebarsTemplates, registerHandlebars } from './module/templates.js';
import * as Chat from './module/chat.js';
import { registerDice } from './module/dice.js';

// Imports Entities.
import ActorT2K from './module/actor/actor.js';
import ItemT2K from './module/item/item.js';

// Imports Applications.
import ActorSheetT2KCharacter from './module/actor/sheets/character.js';
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
			ActorSheetT2KCharacter,
			ItemSheetT2K
		},
		config: T2K4E,
		entities: {
			ActorT2K,
			ItemT2K
		},
		// Cache for pushable rolls.
		rolls: new Collection(),
	};

	// Records configuration values.
	// CONFIG.debug.hooks = true;
	CONFIG.T2K4E = T2K4E;
	CONFIG.Actor.entityClass = ActorT2K;
	CONFIG.Item.entityClass = ItemT2K;

	// Patches Core functions.
	CONFIG.Combat.initiative = {
		formula: '1d10 + (@attributes.agl.value / 100)',
		decimals: 2,
	}

	// Registers sheet application classes. 
	// This will stop using the core sheets and instead use our customized versions.
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('t2k4e', ActorSheetT2KCharacter, {
		types: ['character', 'npc'],
		makeDefault: true,
		label: 'T2K4E.SheetClassCharacter',
	});

	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('t2k4e', ItemSheetT2K, { makeDefault: true });

	registerSystemSettings();
	registerDice();
	registerHandlebars();
	preloadHandlebarsTemplates();
});

Hooks.once('ready', function() {
	console.warn('t2k4e | READY!');

	/**
	 * @type {Actor}
	 *
	const startingActor = game.actors.get('PD9O4dYhP1ED6Pmp');
	startingActor.sheet.render(true);//*/

	/**
	 * @type {Item}
	 *
	const startingItem = game.items.get('63JHOmp3e1HLbdrL');
	startingItem.sheet.render(true);//*/
});

Hooks.on('renderChatLog', (app, html, data) => Chat.addChatListeners(html));
Hooks.on('getChatLogEntryContext', Chat.addChatMessageContextOptions);
Hooks.on('renderChatMessage', (app, html, data) => Chat.hideChatActionButtons(app, html, data));