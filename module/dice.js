import { T2K4E } from './config.js';
import T2KRoll from './twilight-roller.js';

/**
 * Rolls dice for T2K.
 * @param {string} name            The title of the roll
 * @param {Actor} actor            The actor who rolled the dice, if any
 * @param {Item} item              The item used to roll the dice, if any
 * @param {string} attributeName   The attribute's codename (non-mandatory)
 * @param {number} attribute       The attribute's value
 * @param {string} skillName       The skill's codename (non-mandatory)
 * @param {number} skill           The skill's value
 * @param {number} rof             The RoF's value (for weapons)
 * @param {number[]} modifiers     An array of modifiers
 * @param {boolean} askForOptions  Whether to show a Dialog for roll options
 * @param {boolean} sendMessage    Whether the message should be sent
 * @returns {Promise<T2KRoll>}
 * @async
 */
export async function TaskCheck({
	name = 'Unnamed Roll',
	actor = null,
	item = null,
	attributeName = null,
	attribute = 6,
	skillName = null,
	skill = 0,
	rof = 0,
	modifiers = [],
	askForOptions = true,
	sendMessage = true,
} = {}) {
	// 1 — Checks if we ask for options (roll dialog).
	const showTaskCheckOptions = game.settings.get('t2k4e', 'showTaskCheckOptions');
	if (rof || askForOptions !== showTaskCheckOptions) {
		// 1.1 — Gets other applicable items with modifiers.
		let modifyingItems = [];
		// if (actor && (attributeName || skillName)) {
		// 	modifyingItems = actor.data.items.filter(i => {
		// 		const modifiers = i.data.modifiers;
		// 		if (!modifiers) return false;
		// 		if (attributeName) {
		// 			for (const [k, v] of Object.entries(modifiers.attributes)) {
		// 				if (v != null && v !== 0 && k === attributeName) return true;
		// 			}
		// 		}
		// 		if (skillName) {
		// 			for (const [k, v] of Object.entries(modifiers.skills)) {
		// 				if (v != null && v !== 0 && k === skillName) return true;
		// 			}
		// 		}
		// 		return false;
		// 	});
		// }

		// 1.2 – Renders the dialog.
		const opts = await GetTaskCheckOptions({ name, actor, item, modifyingItems });

		// Exits early if the dialog was cancelled.
		if (opts.cancelled) return;

		// 1.3 – Uses options from the roll dialog.
		modifiers.push(opts.modifier);
		rof = opts.rof;
	}
	// 2 — Uses of my YZRoll library (NPM package "yearzero-roll")
	// for correctly constructing the roll and modifying it properly.
	const roll = new T2KRoll({ name, attribute, skill, rof,
		modifier: modifiers.reduce((a, b) => a + b, 0),
	});
	console.log('t2k4e | ROLL', roll.toString());

	// 3 — Saves to roll to the system config.
	if (roll.pushable) game.t2k4e.rolls.set(roll._id, roll);

	// 4 — Sends the message and returns.
	if (sendMessage) await roll.send(actor);
	return roll;
}

/**
 * Attacks with a weapon.
 * @param {Actor} attacker  Attacking actor
 * @param {Item} weapon     Weapon used for the attack
 * @async
 */
export async function Attack(attacker, weapon) {
	const messageTemplate = 'systems/t2k4e/templates/chat/roll.hbs';
	const attributeName = weapon.data.data.attribute;
	const skillName = weapon.data.data.skill;

	// Exits early if no attack skill was found.
	if (!skillName || skillName === 'none' || skillName === '–') {
		const msg = `No skill defined for the ${weapon.data.name}`;
		return ui.notifications.error(msg);
	}

	const roll = await TaskCheck({
		name: game.i18n.format('T2K4E.Chat.Attack.Title', { weapon: weapon.data.name }),
		actor: attacker,
		item: weapon,
		attributeName,
		skillName,
		attribute: attacker.data.data.attributes[attributeName].value,
		skill: attacker.data.data.skills[skillName].value,
		rof: weapon.data.data.rof,
		askForOptions: true,
		sendMessage: true,
	});
	// TODO
	return;
	// // Exits if no roll (cancelled task check).
	// if (!roll) return;

	// const forgeRoll = roll.createFoundryRoll();
	// const renderedRoll = await forgeRoll.render();
	// const templateContext = {
	// 	owner: game.user._id,
	// 	yzroll: roll,
	// 	weapon: weapon.data,
	// 	roll: renderedRoll,
	// };
	// const chatData = {
	// 	user: game.user._id,
	// 	speaker: ChatMessage.getSpeaker(),
	// 	roll: forgeRoll,
	// 	content: await renderTemplate(messageTemplate, templateContext),
	// 	sound: CONFIG.sounds.dice,
	// 	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
	// };
	// return await ChatMessage.create(chatData);
}

/**
 * Pushes a Twilight Roll.
 * @param {string} rollId  ID of the roll to push
 * @param {Actor} actor    Actor, if any
 * @async
 */
export async function Push(rollId, actor = null) {
	// Retrieves the roll to push from the cache.
	const roll = game.t2k4e.rolls.get(rollId);
	
	// Exits early if the roll wasn't found or if it can't be pushed.
	if (!roll || !roll.pushable) {
		ui.notifications.error(game.i18n.localize('T2K4E.Chat.Roll.CannotPush'));
		return;
	}

	// Pushes the roll and sends the message.
	roll.name += game.i18n.localize('T2K4E.Chat.Roll.Pushed');
	roll.push();
	await roll.send(actor);

	// Damages the actor.
	// TODO
	if (actor && ['character', 'npc'].includes(actor.data.type)) {
		// TODO
	}

	// Clears the cache.
	if (!roll.pushable) game.t2k4e.rolls.delete(roll._id);
}

/* -------------------------------------------- */
/*  Roll Dialog                                 */
/* -------------------------------------------- */

/**
 * Renders a TaskCheck Options dialog.
 * @param {string} taskType        Unused for now
 * @param {string} name            The name of the roll (for the dialog's title)
 * @param {Actor} actor            The actor who rolled the dice, if any
 * @param {Item} item              The item used to roll the dice, if any
 * @param {Item[]} modifyingItems  Other items with applicable modifiers
 * @async
 */
async function GetTaskCheckOptions({ taskType, name, actor, item, modifyingItems = [] } = {}) {
	const template = 'systems/t2k4e/templates/dialog/roll-dialog.hbs';

	const html = await renderTemplate(template, {
		modifiers: modifyingItems,
		weapon: item?.data?.type === 'weapon' ? item.data : null,
	});

	return new Promise(resolve => {
		// Sets the data of the dialog.
		const data = {
			title: game.i18n.localize('T2K4E.Chat.Actions.Roll') + ' — ' + name,
			content: html,
			buttons: {
				normal: {
					label: game.i18n.localize('T2K4E.Chat.Actions.Roll'),
					callback: html => resolve(_processTaskCheckOptions(html[0].querySelector('form'))),
				},
				cancel: {
					label: game.i18n.localize('T2K4E.Dialog.Actions.Cancel'),
					callback: html => resolve({ cancelled: true }),
				}
			},
			default: 'normal',
			close: () => resolve({ cancelled: true }),
		};
		// Renders the dialog.
		new Dialog(data, null).render(true);
	});
}

function _processTaskCheckOptions(form) {
	return {
		modifier: parseInt(form.modifier.value),
		rof: form.rof ? parseInt(form.rof.value) : 0,
	};
}

/* -------------------------------------------- */
/*  Dice Utility functions                      */
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

/**
 * Gets the Attribute and Skill values (+ the skill's name).
 * @param {string} skillName The code of the skill
 * @param {Object} data Actor's data data
 * @returns {Object} `{ name, attribute, skill }`
 */
export function getAttributeAndSkill(skillName, data) {
	const skill = data.skills[skillName].value;
	const attributeName = T2K4E.skillsMap[skillName];
	const attribute = data.attributes[attributeName].value;
	const name = game.i18n.localize(T2K4E.skills[skillName]);
	return { name, attribute, skill };
}

/* -------------------------------------------- */
/*  Custom Dice Registration                    */
/* -------------------------------------------- */

export function registerDice() {
	CONFIG.Dice.terms.a = BaseDieD12;
	CONFIG.Dice.terms.b = BaseDieD10;
	CONFIG.Dice.terms.c = BaseDieD8;
	CONFIG.Dice.terms.d = BaseDieD6;
	// CONFIG.Dice.terms['12'] = BaseDieD12;
	// CONFIG.Dice.terms['10'] = BaseDieD10;
	// CONFIG.Dice.terms['8'] = BaseDieD8;
	// CONFIG.Dice.terms['6'] = BaseDieD6;
	CONFIG.Dice.terms.m = AmmoDie;
}

/* -------------------------------------------- */
/*  Custom Dice Classes                         */
/* -------------------------------------------- */

export class TwilightDie extends Die {
	/** @override */
	static getResultLabel(result) {
		// console.log('Result label:', result);
		return super.getResultLabel(result);
	}
}

export class BaseDieD12 extends TwilightDie {
	constructor(termData) {
		termData.faces = 12;
		super(termData);
	}
	static DENOMINATION = 'a';

	/** @override */
	static getResultLabel(result) {
		const ico = CONFIG.T2K4E.diceIcons.base.d12[result];
		const str = `<img src="systems/t2k4e/assets/icons/dice/${ico}" alt="${result}" title="${result}"/>`;
		return super.getResultLabel(str);
	}
}

export class BaseDieD10 extends TwilightDie {
	constructor(termData) {
		termData.faces = 10;
		super(termData);
	}
	static DENOMINATION = 'b';

	/** @override */
	static getResultLabel(result) {
		const ico = CONFIG.T2K4E.diceIcons.base.d10[result];
		const str = `<img src="systems/t2k4e/assets/icons/dice/${ico}" alt="${result}" title="${result}"/>`;
		return super.getResultLabel(str);
	}
}

export class BaseDieD8 extends TwilightDie {
	constructor(termData) {
		termData.faces = 8;
		super(termData);
	}
	static DENOMINATION = 'c';

	/** @override */
	static getResultLabel(result) {
		const ico = CONFIG.T2K4E.diceIcons.base.d8[result];
		const str = `<img src="systems/t2k4e/assets/icons/dice/${ico}" alt="${result}" title="${result}"/>`;
		return super.getResultLabel(str);
	}
}

export class BaseDieD6 extends TwilightDie {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}
	static DENOMINATION = 'd';

	/** @override */
	static getResultLabel(result) {
		const ico = CONFIG.T2K4E.diceIcons.base.d6[result];
		const str = `<img src="systems/t2k4e/assets/icons/dice/${ico}" alt="${result}" title="${result}"/>`;
		return super.getResultLabel(str);
	}
}

export class AmmoDie extends TwilightDie {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
		this.type = 'ammo';
	}
	static DENOMINATION = 'm';
	static MODIFIERS = {
		'm': 'mag',
	};

	mag(modifier) {
		console.warn('Magazine modifier:', modifier);
	}

	/** @override */
	static getResultLabel(result) {
		const ico = CONFIG.T2K4E.diceIcons.ammo.d6[result];
		const str = `<img src="systems/t2k4e/assets/icons/dice/${ico}" alt="${result}" title="${result}"/>`;
		return super.getResultLabel(str);
	}
}