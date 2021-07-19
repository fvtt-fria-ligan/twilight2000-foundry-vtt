/* ============================================================================
 * TWILIGHT 2000 4E
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ============================================================================
 * Contributing: https://github.com/Stefouch/t2k4e
 * ============================================================================
 * Creator: Stefouch
 * Patreon: https://www.patreon.com/Stefouch
 * ============================================================================
 * Source Code License: GPL-3.0-or-later
 * 
 * Foundry License: Foundry Virtual Tabletop End User License Agreement
 *   https://foundryvtt.com/article/license/
 * 
 * ============================================================================
 */

// Imports Modules.
import { T2K4E } from './module/config.js';
import { registerDsN, T2KRoller } from './module/dice.js';
import { registerSystemSettings } from './module/settings.js';
import { preloadHandlebarsTemplates, registerHandlebars } from './module/templates.js';
import * as Chat from './module/chat.js';

// Imports Documents.
import ActorT2K from './module/actor/actor.js';
import ItemT2K from './module/item/item.js';

// Imports Applications.
import ActorSheetT2KCharacter from './module/actor/characterSheet.js';
import ActorSheetT2KVehicle from './module/actor/vehicleSheet.js';
import ItemSheetT2K from './module/item/itemSheet.js';

// Imports Helpers.
import { checkMigration } from './module/migration.js';
import { YearZeroRollManager } from './lib/yzur.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function() {
  console.log(`t2k4e | Initializing the Twilight 2000 4E Game System\n${T2K4E.ASCII}`);

  // Registers dice.
  YearZeroRollManager.register('t2k', {
    'ROLL.chatTemplate': 'systems/t2k4e/templates/dice/roll.hbs',
    'ROLL.tooltipTemplate': 'systems/t2k4e/templates/dice/tooltip.hbs',
    'ROLL.infosTemplate': 'systems/t2k4e/templates/dice/infos.hbs',
    'CHAT.showInfos': true,
    'DICE.ICONS.t2k.ammo.6': '<img src="systems/t2k4e/assets/icons/bullet2.png"/>',
  });

  // Creates a namespace within the game global.
  // Places our classes in their own namespace for later reference.
  game.t2k4e = {
    applications: {
      ActorSheetT2KCharacter,
      ActorSheetT2KVehicle,
      ItemSheetT2K,
    },
    config: T2K4E,
    entities: {
      ActorT2K,
      ItemT2K,
    },
    roller: T2KRoller,
  };

  // Records configuration values.
  CONFIG.T2K4E = T2K4E;
  CONFIG.Actor.documentClass = ActorT2K;
  CONFIG.Item.documentClass = ItemT2K;

  // Patches Core functions.
  CONFIG.Combat.initiative = {
    formula: '1d10 + (@attributes.agl.value / 100)',
    decimals: 2,
  };

  // Registers sheet application classes. 
  // This will stop using the core sheets and instead use our customized versions.
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('t2k4e', ActorSheetT2KCharacter, {
    types: ['character', 'npc'],
    makeDefault: true,
    label: 'T2K4E.SheetClassCharacter',
  });
  Actors.registerSheet('t2k4e', ActorSheetT2KVehicle, {
    types: ['vehicle'],
    makeDefault: true,
    label: 'T2K4E.SheetClassVehicle',
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('t2k4e', ItemSheetT2K, { makeDefault: true });

  registerSystemSettings();
  registerHandlebars();
  preloadHandlebarsTemplates();
});

Hooks.once('ready', function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  // Hooks.on('hotbarDrop', (bar, data, slot) => macros.create5eMacro(data, slot));

  // Determines whether a system migration is required and feasible.
  checkMigration();

  console.warn('t2k4e | READY!');

  // Debugging
  if (game.userId === 'OPqJPiI75DlhwfVv') {
    CONFIG.debug.hooks = true;
    try {
      // Renders a starting actor or item.
      /** @type {Actor} */
      const startingActor = game.actors.getName('Stefouch');
      // startingActor.sheet.render(true);
      console.warn(startingActor);
      /** @type {Actor} */
      const startingVehicle = game.actors.getName('T-80');
      // startingVehicle.sheet.render(true);
      console.warn(startingVehicle);
      /** @type {Item} */
      const startingItem = game.items.getName('FN FAL');
      // startingItem.sheet.render(true);
      console.warn(startingItem);
    }
    catch (error) {
      console.warn('t2k4e | DEBUG | Cannot find starting Entity.', error);
    }
  }
  else {
    // TODO clean this code when official release
    // Introductory dialog for the beta.
    const disclaimerContent = `<h1>Welcome</h1>
    <p>This is the beta version of the <b>Twilight 2000 4E</b> game system for the Foundry VTT.</p>
    <p>Thank you for playtesting this unreleased version!
    <br/>Please report any bugs, rules errors, feedback and feature requests at the github repository: 
    <a href="https://github.com/Stefouch/t2k4e/issues">https://github.com/Stefouch/t2k4e/issues</a></p>
    <hr/>
    <p><u>Important Note</u>:&nbsp;Do not share this system on social media until the official release. Thank you.</p>`;
    new Dialog({
      title: 'T2K4E — Message',
      content: disclaimerContent,
      buttons: {
        ok: {
          label: 'OK',
        },
      },
    }).render(true);
  }
});

Hooks.once('diceSoNiceReady', dice3d => registerDsN(dice3d));

Hooks.on('renderChatLog', (app, html, data) => Chat.addChatListeners(html));
Hooks.on('getChatLogEntryContext', Chat.addChatMessageContextOptions);
Hooks.on('renderChatMessage', (app, html, data) => Chat.hideChatActionButtons(app, html, data));

Hooks.on('dropActorSheetData', (actor, sheet, data) => {
  // When dropping something on a vehicle sheet.
  if (actor.type === 'vehicle') {
    // When dropping an actor on a vehicle sheet.
    if (data.type === 'Actor') sheet.dropCrew(data.id);
  }
});