import { T2K4E } from './config.js';
import T2KRoll from './twilight-roller.js';

/**
 * Rolls dice for T2K.
 * @param {string} name        The title of the roll
 * @param {Object} actorData    The Actor's data
 * @param {number} attribute    The attribute's value
 * @param {number} skill        The skill's value
 * @param {number} rof          The RoF's value (for weapons)
 * @param {number[]} modifiers  An array of modifiers
 * @async
 */
export async function RollTwilight(
	{
		name = 'Unnamed Roll',
		actorData = {},
		attribute = 6,
		skill = 0,
		rof = 0,
		modifiers = [],
	} = {}
) {
	// Uses of my YZRoll library (NPM package "yearzero-roll")
	// for correctly constructing the roll and modifying it properly.
	const roll = new T2KRoll({
		name,
		attribute,
		skill,
		rof,
		modifier: modifiers.reduce((a, b) => a + b, 0),
	});

	// Logs to the console.
	console.log('t2k4e | ROLL: ', roll.toString());
	console.warn(roll);
	console.warn('toPhrase:', roll.toPhrase());
	console.warn('toValues:', roll.toValues());
	console.warn(JSON.stringify(roll));

	roll.send();

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
	CONFIG.Dice.terms['6'] = BaseDieD6;
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