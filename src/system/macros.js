import { T2K4E } from './config';
import { getActiveActor } from '@utils/get-actor';

/**
 * Creates a Macro from an Item or stat (attribute/skill) drop.
 * Gets an existing item macro if one exists, otherwise create a new one.
 * ! Do not return a Promise or conflict with Foundry's default drop
 * @param {Object} data The dropped data
 * @param {number} slot The hotbar slot to use
 */
export function createT2KMacro(data, slot) {
  if (data.type === 'Stat') {
    // ! Do not use await or conflict with Foundry
    _createT2KStatMacro(data, slot);
    return false;
  }
  // TODO
  // if (data.type === 'Action') {
  //   _createT2KActionMacro(data, slot);
  //   return false;
  // }
  if (data.type === 'Item' && typeof data.uuid === 'string') {
    if (!data.uuid.includes('Actor') && !data.uuid.includes('Token')) return;

    // ! Use synced method or conflict with Foundry
    // eslint-disable-next-line no-undef
    const item = fromUuidSync(data.uuid);
    if (!item) return;
    // if (!item.system.rollable) return;

    // ! Do not use await or conflict with Foundry
    _createT2KItemMacro(item, slot);
    return false;
  }
}

export async function setupMacroFolder() {
  if (!game.user.isGM) return;
  const folderName = T2K4E.systemMacroFolder;
  const folder = game.folders
    .filter(f => f.type === 'Macro')
    .find(f => f.name === folderName);

  if (!folder) {
    await Folder.create({
      name: folderName,
      type: 'Macro',
      parent: null,
    });
  }
}

/* ------------------------------------------ */
/*  Hotbar Macros                             */
/* ------------------------------------------ */

async function _createT2KStatMacro(data, slot) {
  const folder = game.folders.find(f => f.type === 'Macro' && f.name === T2K4E.systemMacroFolder);
  const command = `game.t2k4e.macros.rollStat("${data.attribute}"`
    + (data.skill ? `, "${data.skill}"` : '')
    + ');';
  const actor = await fromUuid(data.uuid);
  if (!actor) return;

  const commandName = game.i18n.format('T2K4E.MACRO.RollStat', {
    stat: game.i18n.localize(data.skill
      ? `T2K4E.SkillNames.${data.skill}`
      : `T2K4E.AttributeNames.${data.attribute}`,
    ),
  });

  let macro = findMacro(commandName, command);
  if (!macro) {
    macro = await Macro.create({
      name: commandName,
      type: 'script',
      img: 'icons/svg/dice-target.svg',
      command: command,
      flags: { 't2k4e.statMacro': true },
      folder: folder.id,
      'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}

// TODO
// async function _createT2KActionMacro(data, slot) {
//   const folder = game.folders.find(f => f.type === 'Macro' && f.name === T2K4E.systemMacroFolder);
//   const command = `game.t2k4e.macros.rollAction("${data.action}");`;
//   const actor = await fromUuid(data.uuid);
//   if (!actor) return;

//   const commandName = game.i18n.format('T2K4E.MACRO.RollAction', {
//     action: game.i18n.localize(T2K4E.actionSkillMap[data.action].label),
//   });

//   let macro = findMacro(commandName, command);
//   if (!macro) {
//     macro = await Macro.create({
//       name: commandName,
//       type: 'script',
//       img: 'icons/svg/dice-target.svg',
//       command: command,
//       flags: { 't2k4e.actionMacro': true },
//       folder: folder.id,
//       'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
//     });
//   }
//   game.user.assignHotbarMacro(macro, slot);
// }

async function _createT2KItemMacro(item, slot) {
  const folder = game.folders.find(f => f.type === 'Macro' && f.name === T2K4E.systemMacroFolder);
  const command = `game.t2k4e.macros.rollItem("${item.name}");`;
  let macro = findMacro(item.name, command);
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 't2k4e.itemMacro': true },
      folder: folder.id,
      'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}

/* ------------------------------------------ */

/**
 * Rolls a stat.
 * @param {string} attributeKey
 * @param {string} skillKey
 * @param {Object} options
 */
export async function rollStat(attributeKey, skillKey, options) {
  const actor = await getActiveActor();
  // TODO
  // if (actor) return actor.rollStat(attributeKey, skillKey, options);
}

/* ------------------------------------------ */

/**
 * Performs an action.
 * @param {string} actionKey
 */
export async function rollAction(actionKey) {
  // TODO
  // const action = T2K4E.actionSkillsMap[actionKey];
  // if (!action) return;
  // if (typeof action.callback === 'function') {
  //   return action.callback(await getActiveActor());
  // }

  // const skillKey = action.skill;
  // const attributeKey = T2K4E.skillsMap[skillKey];
  // const title = game.i18n.localize(action.label)
  //   + ` (${game.i18n.localize(`T2K4E.SkillNames.${skillKey}`)})`;

  // return rollStat(attributeKey, skillKey, { title });
}

/* ------------------------------------------ */

/**
 * Rolls an item.
 * @param {string} itemName
 */
export async function rollItem(itemName) {
  const actor = await getActiveActor();

  // Gets matching items.
  const items = actor ? actor.items.filter(i => i.name === itemName) : [];
  if (items.length > 1) {
    ui.notifications.warn(game.i18n.format('T2K4E.MACRO.MultipleItems', {
      actor: actor.name,
      item: itemName,
    }));
  }
  else if (items.length === 0) {
    return ui.notifications.warn(game.i18n.format('T2K4E.MACRO.NoItem', {
      actor: actor.name,
      item: itemName,
    }));
  }

  return items[0].roll({ actor });
}

/* ------------------------------------------ */
/*  Utilities                                 */
/* ------------------------------------------ */

export function findMacro(commandName, command) {
  return game.macros.find(m => (
    m.name === commandName &&
    m.command === command &&
    (
      m.author === game.user.id ||
      m.ownership.default >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER ||
      m.ownership[game.user.id] >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
    )
  ));
}
