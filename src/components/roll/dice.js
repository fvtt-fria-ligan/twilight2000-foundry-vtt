import T2KDialog from '../dialog/dialog.js';
import { YearZeroRoll } from 'yzur';
import { T2K4E } from '../../system/config.js';
import { range } from '@utils/utils.js';

/* -------------------------------------------- */
/*  Custom Dice Roller Interface                */
/* -------------------------------------------- */

/**
 * Interface for performing tasks and rolling dice.
 * @abstract
 * @interface
 */
export class T2KRoller {
  constructor() {
    throw new SyntaxError(`${this.constructor.name} cannot be instanciated. Use static methods instead.`);
  }

  /* -------------------------------------------- */

  /**
   * Rolls dice for T2K.
   * @param {string?}  title                The title of the roll
   * @param {Actor?}   actor                The actor who rolled the dice, if any
   * @param {Item?}    item                 The item used to roll the dice, if any
   * @param {string?}  attributeName        The name of the attribute used (important for modifiers)
   * @param {string?}  skillName            The name of the skill used (important for modifiers)
   * @param {number}  [attribute=0]         The attribute's size
   * @param {number}  [skill=0]             The skill's size
   * @param {number}  [rof=0]               The RoF's value
   * @param {number}  [modifier=0]          The task modifier
   * @param {boolean} [locate=false]        Whether to roll a Location die
   * @param {number}  [maxPush=1]           The maximum number of pushes (default is 1)
   * @param {string?}  rollMode             Dice roll visibility mode @see DICE_ROLL_MODES
   * @param {boolean} [askForOptions=false] Whether to show a Dialog for roll options
   * @param {boolean} [skipDialog=false]    Whether to force skip the Dialog for roll options
   * @param {boolean} [sendMessage=true]    Whether the message should be sent
   * @returns {Promise<YearZeroRoll|ChatMessage>} If sendMessage=true, returns the ChatMessage,
   *      otherwise returns the YearZeroRoll.
   * @static
   * @async
   */
  static async taskCheck({
    title = 'Twilight 2000 4E – Task Check',
    actor = null,
    item = null,
    attributeName = null,
    skillName = null,
    attribute = 0,
    skill = 0,
    rof = 0,
    modifier = 0,
    locate = false,
    maxPush = 1,
    rollMode = null,
    askForOptions = false,
    skipDialog = false,
    sendMessage = true,
  } = {}) {
    // 1 — Prepares data.
    rollMode = rollMode ?? game.settings.get('core', 'rollMode');

    // 2 — Checks if we ask for options (roll dialog).
    const showTaskCheckOptions = game.settings.get('t2k4e', 'showTaskCheckOptions');
    if (!skipDialog && askForOptions !== showTaskCheckOptions) {
      // 2.1 — Prepares a formula.
      const formula = YearZeroRoll.forge(
        getDiceQuantities(attribute, skill),
      ).formula;

      // 2.2 — Handles roll modifiers.
      let modifiers;
      if (actor) {
        modifiers = actor.getRollModifiers();
        if (skillName || attributeName) {
          modifiers = modifiers.filter(m => m.target === skillName || m.target === attributeName);
        }
        if (modifiers.length) {
          modifier += modifiers.reduce((sum, m) => sum + (m.active ? m.value : 0), 0);
        }
      }

      // 2.3 — Renders the dialog.
      const opts = await T2KDialog.askRollOptions({
        title, attribute, skill, rof, modifier, modifiers, locate,
        maxPush, rollMode, formula,
      });

      // 2.3.5 — Exits early if the dialog was cancelled.
      if (opts.cancelled) return null;

      // 2.4 — Uses options from the roll dialog.
      if (!attribute && !skill) {
        attribute = opts.attribute;
        skill = opts.skill;
      }
      rof = opts.rof;
      modifier = opts.modifier;
      locate = opts.locate;
      maxPush = opts.maxPush;
      rollMode = opts.rollMode;
    }
    // 3 — Clamps values.
    attribute = Math.clamp(attribute, 0, 12);
    skill = Math.clamp(skill, 0, 12);
    modifier = Math.clamp(modifier, -100, 100);
    maxPush = Math.clamp(maxPush, 0, 100);

    // 4 — Creates the roll.
    const dice = getDiceQuantities(attribute, skill, rof, locate);
    let roll = YearZeroRoll.forge(dice, { maxPush });
    roll.name = title;

    // 5 — Modifies the roll.
    if (modifier) {
      roll = await roll.modify(modifier);
    }

    // 6 — Adds actor/token/item IDs.
    // These are added to `roll.options` which is conserved.
    if (actor) {
      roll.options.actorId = actor.id;
      const token = actor.token;
      if (token) {
        roll.options.sceneId = token.parent.id;
        roll.options.tokenId = token.id;
        roll.options.tokenKey = `${token.parent.id}.${token.id}`;
      }
    }
    if (item) {
      roll.options.itemId = item.id;
    }

    // 7 — Evaluates the roll.
    await roll.roll({ async: true });
    console.log('t2k4e | ROLL', roll.name, roll);

    // 8 — Sends the message and returns.
    if (sendMessage) {
      return roll.toMessage(null, { rollMode });
    }
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Rolls dice for a Coolness Under Fire test.
   * @returns {Promise<YearZeroRoll|ChatMessage>}
   */
  static async cufCheck({
    title = game.i18n.localize('T2K4E.Dialog.CuF.CoolnessUnderFire'),
    actor = null,
    unitMorale = false,
    modifier = 0,
    maxPush = 1,
    rollMode = null,
    sendMessage = true,
  } = {}) {
    if (!actor) return;
    rollMode = rollMode ?? game.settings.get('core', 'rollMode');
    const modifiers = actor.getRollModifiers().filter(m => m.target === 'cuf');
    const opts = await T2KDialog.askCuFOptions({ title, unitMorale, modifier, modifiers, maxPush, rollMode });

    // Exits early if the dialog was cancelled.
    if (opts.cancelled) return null;

    // Uses options from the CuF dialog.
    unitMorale = opts.unitMorale;
    rollMode = opts.rollMode;
    modifier = opts.modifier;
    maxPush = opts.maxPush;

    // Gets attributes' values.
    const cuf = actor.system.cuf.value;
    const um = actor.system.unitMorale.value;

    return this.taskCheck({
      title,
      // actor,
      // attributeName: 'cuf',
      attribute: cuf,
      skill: unitMorale ? um : 0,
      modifier, maxPush, rollMode,
      skipDialog: true,
      sendMessage,
    });
  }
}

/* -------------------------------------------- */
/*  Roll Push                                   */
/* -------------------------------------------- */

/**
 * Pushes a roll.
 * @param {YearZeroRoll} roll     The roll to push
 * @param {ChatMessage} [message] The message holding the roll that will be deleted
 * @returns {Promise<YearZeroRoll|ChatMessage>}
 * @async
 */
export async function rollPush(roll, { message } = {}) {
  if (!roll.pushable) return roll;

  // Copies the roll.
  roll = roll.duplicate();

  // Pushes the roll.
  await roll.push({ async: true });

  // Returns the pushed roll if there is no message.
  if (!message) return roll.toMessage();

  // Gets all the message's flags.
  const flags = message.getFlag('t2k4e', 'data') ?? {};
  const oldAmmoSpent = flags.ammoSpent || 0;
  let newAmmoSpent = -Math.max(1, roll.ammoSpent + 1);
  const actorId = roll.options.actorId;
  const tokenKey = roll.options.tokenKey;
  const actor = getRollingActor({ actorId, tokenKey });
  const itemId = roll.options.itemId;
  const item = actor ? actor.items.get(itemId) : game.items.get(itemId);
  const ammoId = flags.ammo ?? (item ? item.system.mag?.target : '');
  const ammo = actor ? actor.items.get(ammoId) : game.items.get(ammoId);

  // No need to await the deletion.
  message.delete();

  const m = await roll.toMessage();

  const flagData = {};

  // Updates the reliability.
  if (item?.hasReliability && roll.jamCount) {
    const oldJam = flags.reliabilityChange ?? 0;
    const newJam = -roll.jamCount;

    if (oldJam !== newJam) {
      const relChange = await item.updateReliability(newJam - oldJam);
      flagData.reliabilityChange = oldJam + relChange;
    }
  }

  // Updates the ammunition.
  if (ammo) {
    const track = (actor.type === 'character' && game.settings.get('t2k4e', 'trackPcAmmo'))
      || (actor.type === 'npc' && game.settings.get('t2k4e', 'trackNpcAmmo'))
      || (actor.type === 'vehicle' && game.settings.get('t2k4e', 'trackVehicleAmmo'));

    if (track) {
      flagData.ammoSpent = oldAmmoSpent;

      if (oldAmmoSpent !== newAmmoSpent) {
        newAmmoSpent = await ammo.updateAmmo(newAmmoSpent - oldAmmoSpent);
        flagData.ammoSpent = oldAmmoSpent + newAmmoSpent;
      }
      flagData.ammo = ammo.id;
    }
  }

  // Updates message's flags.
  if (!foundry.utils.isEmpty(flagData)) {
    await m.setFlag('t2k4e', 'data', flagData);
  }

  return m;
}

/* -------------------------------------------- */
/*  Dice Utility Functions                      */
/* -------------------------------------------- */

/**
 * Gets the size of a die from its rating.
 * @param {string} score A, B, C, D or F
 */
export function getDieSize(score) {
  if (typeof score !== 'string') throw new TypeError(`Die Score Not a String: "${score}"`);
  if (score.length !== 1) throw new SyntaxError(`Die Score Incorrect: "${score}"`);
  const size = T2K4E.dieSizesMap.get(score);
  if (size == undefined) throw new RangeError(`Die Size Not Found! Score: "${score}"`);
  return size;
}

/* -------------------------------------------- */

/**
 * Gets the Attribute and Skill values (+ the skill's name).
 * @param {string} skillName The code of the skill
 * @param {Object} system Actor's system
 * @param {string} [attributeName] The code of the attribute if different from the linked skill
 * @returns {{ title: string, attribute: number, skill: number }}
 */
export function getAttributeAndSkill(skillName, system, attributeName = null) {
  const skill = system.skills[skillName].value;
  attributeName = attributeName ?? T2K4E.skillsMap[skillName];
  const attribute = system.attributes[attributeName].value;
  const title = game.i18n.localize(T2K4E.skills[skillName]);
  return { title, attribute, skill, attributeName, skillName };
}

/* -------------------------------------------- */

/**
 * Gets a DiceQuantities object from given values.
 * @param {number}   attribute     The attribute's size
 * @param {number}  [skill=0]      The skill's size
 * @param {number}  [rof=0]        The RoF's value
 * @param {number}  [modifier=0]   The task modifier
 * @param {boolean} [locate=false] Whether to roll a Location die
 * @see {YearZeroRoll}
 * @returns {Array.<import('../lib/yzur.js').TermBlok>}
 */
export function getDiceQuantities(attribute, skill = 0, rof = 0, locate = false) {
  const dice = [];
  if (attribute > 0) dice.push({ term: attribute, number: 1 });
  if (skill > 0) dice.push({ term: skill, number: 1 });
  if (rof > 0) dice.push({ term: 'm', number: rof });
  if (locate) dice.push({ term: 'l', number: 1 });
  return dice;
}
/* ------------------------------------------- */

/**
 * Gets the Actor which is the source of a roll.
 * @param {string} [actorId]
 * @param {string} [tokenKey]
 * @return {Actor}
 */
export function getRollingActor({ actorId, tokenKey } = {}) {
  // Case 1 — A Synthetic Actor from a Token
  if (tokenKey) {
    const [sceneId, tokenId] = tokenKey.split('.');
    const scene = game.scenes.get(sceneId);
    if (!scene) return null;
    const token = scene.getEmbeddedDocument('Token', tokenId);
    // if (!tokenData) return null;
    // const token = new Token(tokenData);
    return token.actor;
  }

  // Case 2 — Use Actor ID instead
  return game.actors.get(actorId);
}

/* -------------------------------------------- */
/*  Dice So Nice Registration                   */
/* -------------------------------------------- */
// https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Customization

export function registerDsN(dice3d) {
  dice3d.addSystem({
    id: 't2k4e',
    name: 'Twilight 2000 4E',
  }, 'preferred');

  dice3d.addColorset({
    name: 't2k-base',
    category: 'Twilight 2000 4E',
    description: 'T2K Base Die',
    foreground: '#E2C45F', // '#cfa826', // '#E2C45F',
    background: '#4E5B31', // '#262c23', // '#4C5847', // '#44544c',
    outline: 'none',
    // edge: '#000',
    texture: 'none',
    material: 'metal',
    font: 'DaisyWheel',
  }, 'default');

  dice3d.addColorset({
    name: 't2k-ammo',
    category: 'Twilight 2000 4E',
    description: 'T2K Ammo Die',
    foreground: '#000',
    background: '#A3904D', // '#726435', // '#A3904D',
    outline: 'none',
    // edge: '#000',
    texture: 'bronze01',
    material: 'metal',
    font: 'DaisyWheel',
    fontScale: { dm: 0.75, d6: 0.75 },
  }, 'default');

  dice3d.addColorset({
    name: 't2k-loc',
    category: 'Twilight 2000 4E',
    description: 'T2K Hit Location Die',
    foreground: '#000',
    background: '#fff', // '#9b978e', // '#DED8CC',
    outline: 'none',
    // edge: '#000',
    texture: 'none',
    material: 'glass',
    font: 'DaisyWheel',
  }, 'default');

  dice3d.addDicePreset({
    type: 'd6',
    labels: [
      'systems/t2k4e/assets/dice/d6/t2k_d6_1_dsn.png',
      '2',
      '3',
      '4',
      '5',
      'systems/t2k4e/assets/dice/d6/t2k_d6_6_dsn.png',
    ],
    // eslint-disable-next-line no-sparse-arrays
    bumpMaps: [
      'systems/t2k4e/assets/dice/d6/t2k_d6_1_dsn_bump.png',,,,,
      'systems/t2k4e/assets/dice/d6/t2k_d6_6_dsn_bump.png',
    ],
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd6');

  dice3d.addDicePreset({
    type: 'd8',
    labels: [
      'systems/t2k4e/assets/dice/d8/t2k_d8_1_dsn.png',
      '2',
      '3',
      '4',
      '5',
      'systems/t2k4e/assets/dice/d8/t2k_d8_6_dsn.png',
      'systems/t2k4e/assets/dice/d8/t2k_d8_7_dsn.png',
      'systems/t2k4e/assets/dice/d8/t2k_d8_8_dsn.png',
    ],
    // eslint-disable-next-line no-sparse-arrays
    bumpMaps: [
      'systems/t2k4e/assets/dice/d8/t2k_d8_1_dsn_bump.png',,,,,
      'systems/t2k4e/assets/dice/d8/t2k_d8_6_dsn_bump.png',
      'systems/t2k4e/assets/dice/d8/t2k_d8_7_dsn_bump.png',
      'systems/t2k4e/assets/dice/d8/t2k_d8_8_dsn_bump.png',
    ],
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd8');

  dice3d.addDicePreset({
    type: 'd10',
    labels: [
      'systems/t2k4e/assets/dice/d10/t2k_d10_1_dsn.png',
      '2',
      '3',
      '4',
      '5',
      'systems/t2k4e/assets/dice/d10/t2k_d10_6_dsn.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_7_dsn.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_8_dsn.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_9_dsn.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_10_dsn.png',
    ],
    // eslint-disable-next-line no-sparse-arrays
    bumpMaps: [
      'systems/t2k4e/assets/dice/d10/t2k_d10_1_dsn_bump.png',,,,,
      'systems/t2k4e/assets/dice/d10/t2k_d10_6_dsn_bump.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_7_dsn_bump.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_8_dsn_bump.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_9_dsn_bump.png',
      'systems/t2k4e/assets/dice/d10/t2k_d10_10_dsn_bump.png',
    ],
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd10');

  dice3d.addDicePreset({
    type: 'd12',
    labels: [
      'systems/t2k4e/assets/dice/d12/t2k_d12_1_dsn.png',
      '2',
      '3',
      '4',
      '5',
      'systems/t2k4e/assets/dice/d12/t2k_d12_6_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_7_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_8_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_9_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_10_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_11_dsn.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_12_dsn.png',
    ],
    // eslint-disable-next-line no-sparse-arrays
    bumpMaps: [
      'systems/t2k4e/assets/dice/d12/t2k_d12_1_dsn_bump.png',,,,,
      'systems/t2k4e/assets/dice/d12/t2k_d12_6_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_7_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_8_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_9_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_10_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_11_dsn_bump.png',
      'systems/t2k4e/assets/dice/d12/t2k_d12_12_dsn_bump.png',
    ],
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd12');

  dice3d.addDicePreset({
    type: 'dm',
    labels: [
      'systems/t2k4e/assets/dice/dm/t2k_dm_1_dsn.png',
      '2',
      '3',
      '4',
      '5',
      'systems/t2k4e/assets/dice/dm/t2k_dm_6_dsn.png',
    ],
    // eslint-disable-next-line no-sparse-arrays
    bumpMaps: [
      'systems/t2k4e/assets/dice/dm/t2k_dm_1_dsn.png',,,,,
      'systems/t2k4e/assets/dice/dm/t2k_dm_6_dsn.png',
    ],
    system: 't2k4e',
    colorset: 't2k-ammo',
  }, 'd6');

  dice3d.addDicePreset({
    type: 'dl',
    labels: [
      'systems/t2k4e/assets/dice/dl/hit_L.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_A.png',
      'systems/t2k4e/assets/dice/dl/hit_H.png',
    ],
    bumpMaps: [
      'systems/t2k4e/assets/dice/dl/hit_L.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_T.png',
      'systems/t2k4e/assets/dice/dl/hit_A.png',
      'systems/t2k4e/assets/dice/dl/hit_H.png',
    ],
    system: 't2k4e',
    colorset: 't2k-loc',
  }, 'd6');

  dice3d.addDicePreset({
    type: 'd2',
    labels: range(2),
    system: 't2k4e',
    colorset: 't2k-ammo',
  }, 'd2');

  dice3d.addDicePreset({
    type: 'd4',
    labels: range(4),
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd4');

  dice3d.addDicePreset({
    type: 'd100',
    labels: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '00'],
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd100');

  dice3d.addDicePreset({
    type: 'd20',
    labels: range(20),
    system: 't2k4e',
    colorset: 't2k-base',
  }, 'd20');
}
