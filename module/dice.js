import { T2K4E } from './config.js';
import T2KRoll from './twilight-roller.js';

/**
 * Rolls dice for T2K.
 * @param {string} title The title of the roll.
 * @param {Object} actorData The Actor's data.
 * @param {number} attribute The attribute's value.
 * @param {number} skill The skill's value.
 * @param {number} rof The RoF's value (for weapons).
 * @param {number[]} modifiers An array of modifiers.
 * @async
 */
export async function TwilightRoll(
	{
		title = 'Unnamed Roll',
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
		name: title,
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

export class BaseDieD12 extends Die {
	constructor(termData) {
		termData.faces = 12;
		super(termData);
	}
	static DENOMINATION = 'a';
}

export class BaseDieD10 extends Die {
	constructor(termData) {
		termData.faces = 10;
		super(termData);
	}
	static DENOMINATION = 'b';
}

export class BaseDieD8 extends Die {
	constructor(termData) {
		termData.faces = 8;
		super(termData);
	}
	static DENOMINATION = 'c';
}

export class BaseDieD6 extends Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}
	static DENOMINATION = 'd';
}

export class AmmoDie extends Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}
	static DENOMINATION = 'm';
	static MODIFIERS = {
		'p': 'push',
	};
	push() {
		console.error('pushed');
	}
}