/* eslint-disable no-unused-vars */
/* ============================================================================
 * TWILIGHT 2000 4E
 * Official website: https://frialigan.se/en/games/twilight-2000/
 * ============================================================================
 * Contributing: https://github.com/fvtt-fria-ligan/twilight2000-foundry-vtt
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
import { T2K4E } from './system/config.js';
import { registerDsN, T2KRoller } from './components/roll/dice.js';
import { registerSystemSettings } from './system/settings.js';
import { registerStatusEffects } from './system/statusEffects.js';
import { enrichTextEditors } from './system/enricher.js';
import { preloadHandlebarsTemplates, registerHandlebars } from './system/handlebars.js';
import { createT2KMacro, rollItem, setupMacroFolder } from './system/macros.js';
import displayMessages from './components/message-system.js';
// import * as Chat from './components/chat/chat.js';
import ChatMessageTW2K4E from './components/chat/chat.js';

// Imports Documents.
import ActorT2K from './actor/actor.js';
import ItemT2K from './item/item.js';

// Imports Applications.
import ActorSheetT2KCharacter from './actor/character/characterSheet.js';
import ActorSheetT2KVehicle from './actor/vehicle/vehicleSheet.js';
import ActorSheetT2KUnit from './actor/unit/unitSheet.js';
import ActorSheetT2KParty from './actor/party/partySheet.js';
import ItemSheetT2K from './item/itemSheet.js';

// Imports Helpers.
import { checkMigration } from './system/migration.js';
import * as YZUR from 'yzur';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function () {
  console.log(`t2k4e | Initializing the Twilight 2000 4E Game System\n${T2K4E.ASCII}`);

  // Registers dice.
  YZUR.YearZeroRollManager.register('t2k', {
    'Roll.chatTemplate': 'systems/t2k4e/templates/components/roll/roll.hbs',
    'Roll.tooltipTemplate': 'systems/t2k4e/templates/components/roll/tooltip.hbs',
    'Roll.infosTemplate': 'systems/t2k4e/templates/components/roll/infos.hbs',
    'Chat.showInfos': true,
    'Icons.t2k.ammo.6': '<img src="systems/t2k4e/assets/icons/bullet2.png"/>',
  });
  // console.warn(CONFIG.Dice.terms);
  game.yzur = YZUR;

  // Creates a namespace within the game global.
  // Places our classes in their own namespace for later reference.
  game.t2k4e = {
    applications: {
      ActorSheetT2KCharacter,
      ActorSheetT2KVehicle,
      ActorSheetT2KUnit,
      ActorSheetT2KParty,
      ItemSheetT2K,
    },
    config: T2K4E,
    entities: {
      ActorT2K,
      ItemT2K,
    },
    macros: {
      rollItem,
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

  // Registers fonts.
  CONFIG.fontDefinitions['Nunito Sans'] = {
    editor: true,
    fonts: [
      { urls: ['systems/t2k4e/fonts/NunitoSans-ExtraBold.woff'], weight: 800 },
    ],
  };
  CONFIG.fontDefinitions['Blue Highway'] = {
    editor: true,
    fonts: [
      { urls: ['systems/t2k4e/fonts/BlueHighway-Bold.woff'], weight: 700 },
    ],
  };
  CONFIG.fontDefinitions.Mukta = {
    editor: true,
    fonts: [
      { urls: ['systems/t2k4e/fonts/Mukta-Medium.woff'], weight: 500 },
      { urls: ['systems/t2k4e/fonts/Mukta-Bold.woff'], weight: 700 },
    ],
  };
  CONFIG.fontDefinitions.DaisyWheel = {
    editor: true,
    fonts: [
      { urls: ['systems/t2k4e/fonts/daisywheel.otf'], weight: 400 },
    ],
  };
  CONFIG.fontDefinitions['T2K4E Symbols'] = {
    editor: true,
    fonts: [
      { urls: ['systems/t2k4e/fonts/T2K4-Symbols.ttf'] },
    ],
  };

  // Registers sheet application classes.
  // This will stop using the core sheets and instead use our customized versions.
  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('t2k4e', ActorSheetT2KCharacter, {
    types: ['character', 'npc'],
    makeDefault: true,
    label: 'T2K4E.SheetClassCharacter',
  });
  foundry.documents.collections.Actors.registerSheet('t2k4e', ActorSheetT2KVehicle, {
    types: ['vehicle'],
    makeDefault: true,
    label: 'T2K4E.SheetClassVehicle',
  });
  foundry.documents.collections.Actors.registerSheet('t2k4e', ActorSheetT2KUnit, {
    types: ['unit'],
    makeDefault: true,
    label: 'T2K4E.SheetClassUnit',
  });
  foundry.documents.collections.Actors.registerSheet('t2k4e', ActorSheetT2KParty, {
    types: ['party'],
    makeDefault: true,
    label: 'T2K4E.SheetClassParty',
  });

  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet('t2k4e', ItemSheetT2K, { makeDefault: true });

  registerSystemSettings();
  enrichTextEditors();
  registerHandlebars();
  preloadHandlebarsTemplates();

  // Defines custom T2K status effects.
  registerStatusEffects();
});

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to.
  setupMacroFolder();
  Hooks.on('hotbarDrop', (_bar, data, slot) => createT2KMacro(data, slot));

  // Determines whether a system migration is required and feasible.
  checkMigration();

  // Displays starting messages.
  displayMessages();

  console.log('t2k4e | Ready!');
  Hooks.callAll('t2k4eReady', game.t2k4e, CONFIG.T2K4E);
});

/* -------------------------------------------- */
/*  Foundry VTT Hooks                           */
/* -------------------------------------------- */

Hooks.once('diceSoNiceReady', dice3d => registerDsN(dice3d));

/* -------------------------------------------- */

Hooks.on('renderChatMessageHTML', (app, html, data) => {
  ChatMessageTW2K4E.addChatListeners(html);
  // Hides chat action buttons.
  ChatMessageTW2K4E.hideChatActionButtons(html);

  // Automatically closes dice results tooltips.
  // let delay = game.settings.get('t2k4e', 'closeRollTooltipDelay');
  // if (delay >= 0) {
  //   delay = Math.min(delay, 15 * 60);
  //   ChatMessageTW2K4E.closeRollTooltip(html, delay * 1000);
  // }
});

/* -------------------------------------------- */

Hooks.on('getChatLogEntryContext', ChatMessageTW2K4E.addChatMessageContextOptions);


/* -------------------------------------------- */

Hooks.on('dropActorSheetData', (actor, sheet, data) => {
  // When dropping something on a vehicle sheet.
  if (actor.type === 'vehicle') {
    // When dropping an actor on a vehicle sheet.
    if (data.type === 'Actor') {
      const id = data.uuid?.replace('Actor.', '');
      sheet.dropCrew(id);
    }
  }
});

/* -------------------------------------------- */

Hooks.on('createToken', (token, _data, _userId) => {
  // When creating a Unit token.
  if (token.actor.type === 'unit') {
    const updateData = {};

    // Uses abbreviation (info) in place of name.
    const nm = token.actor.system.info;
    if (nm) updateData.name = nm;

    // Uses default affiliation.
    const afl = token.actor.system.unitAffiliation;
    if (afl) {
      let disposition;
      switch (afl) {
        case 'friendly':
          disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
          break;
        case 'hostile':
          disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
          break;
        case 'neutral':
          disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
          break;
        default:
          disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
      }
      if (disposition !== token.disposition) updateData.disposition = disposition;
    }

    // Updates the token.
    if (!foundry.utils.isEmpty(updateData)) {
      token.update(updateData);
    }
  }
});

/* -------------------------------------------- */

Hooks.on('renderItemSheet', function (app, _html) {
  app._element[0].style.height = 'auto';
});
