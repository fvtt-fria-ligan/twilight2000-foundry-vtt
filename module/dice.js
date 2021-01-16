import { T2K4E } from './config.js';
import T2KRoll from './twilight-roller.js';

/**
 * Rolls dice for T2K.
 * @param {string} name            The title of the roll
 * @param {Actor} actor            An actor that rolled the dice, if any
 * @param {number} attribute       The attribute's value
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
	attribute = 6,
	skill = 0,
	rof = 0,
	modifiers = [],
	askForOptions = true,
	sendMessage = true,
} = {}) {
	// 1 - Checks if we send a Roll Dialog.
	const showTaskCheckOptions = game.settings.get('t2k4e', 'showTaskCheckOptions');
	if (askForOptions !== showTaskCheckOptions) {
		const opts = await GetTaskCheckOptions();

		// Exits early if the dialog was cancelled.
		if (opts.cancelled) return;

		// Uses options from the roll dialog.
		modifiers.push(opts.modifier);
	}
	// 2 - Uses of my YZRoll library (NPM package "yearzero-roll")
	// for correctly constructing the roll and modifying it properly.
	const roll = new T2KRoll({ name, attribute, skill, rof,
		modifier: modifiers.reduce((a, b) => a + b, 0),
	});
	console.warn('t2k4e | ROLL', roll.toString());

	// 3 - Sends the message and returns.
	if (sendMessage) await roll.send(actor);
	return roll;

	// Creates
	// const rollFormula = roll.toPhrase();
	// const rollData = {
	// 	...actorData,
	// 	title: roll.name,
	// 	yzroll: JSON.stringify(roll),
	// };

	// const rollResult = new Roll(rollFormula, rollData).roll();
	// const messageTemplate = 'systems/t2k4e/templates/chat/roll.hbs';
	// const renderedRoll = await rollResult.render({ template: messageTemplate });
	// const messageData = {
	// 	speaker: ChatMessage.getSpeaker(),
	// 	content: renderedRoll,
	// 	roll: JSON.stringify(roll),
	// };

	// rollResult.toMessage(messageData);
	// console.warn(rollResult);
}

export async function Attack(attacker, weapon) {
	const messageTemplate = 'systems/t2k4e/templates/chat/attack-roll.hbs';
	const skillName = weapon.data.data.attackWith;

	if (!skillName || skillName === 'none' || skillName === '–') {
		const msg = `No skill defined for the ${weapon.data.name}`;
		return ui.notifications.error(msg);
	}

	const statData = getAttributeAndSkill(skillName, attacker.data.data);

	const roll = await TaskCheck({
		...statData,
		rof: weapon.data.data.rof,
		sendMessage: false,
	});

	const forgeRoll = roll.createFoundryRoll();
	const renderedRoll = await forgeRoll.render();
	const templateContext = {
		owner: attacker._id,
		yzroll: roll,
		weapon: weapon.data,
		roll: renderedRoll,
	};
	const chatData = {
		user: game.user._id,
		speaker: ChatMessage.getSpeaker(),
		roll: forgeRoll,
		content: await renderTemplate(messageTemplate, templateContext),
		sound: CONFIG.sounds.dice,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
	};
	return await ChatMessage.create(chatData);
}

export function Push(actor, rollId) {
	// TODO
	const roll = actor.data.lastRoll;
	if (!roll) throw new Error('Pushing: Roll Not Found');
	if (!rollId) throw new Error('Pushing: no Roll ID');
	if (rollId !== roll._id) {
		ui.notifications.error('This roll cannot be pushed because it is not the last one of this actor!');
		return;
	}
	roll.push();

	roll.send(actor);
}

/* -------------------------------------------- */
/*  Roll Dialog                                 */
/* -------------------------------------------- */

async function GetTaskCheckOptions(taskType, item, specialties) {
	const template = 'systems/t2k4e/templates/dialog/roll-dialog.hbs';
	const html = await renderTemplate(template, {});

	return new Promise(resolve => {
		// Sets the data of the dialog.
		const data = {
			title: game.i18n.localize('T2K4E.Chat.Actions.Roll'),
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
	CONFIG.Dice.terms['12'] = BaseDieD12;
	CONFIG.Dice.terms['10'] = BaseDieD10;
	CONFIG.Dice.terms['8'] = BaseDieD8;
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