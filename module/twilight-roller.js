
import YZRoll from '../lib/yearzero-roll.js';

/**
 * A T2K Year Zero Roll object.
 * @extends {YZRoll}
 */
export default class T2KRoll extends YZRoll {
	/**
	 * 
	 * @param {?string} name The name of the roll
	 * @param {?number} attribute The value of the attribute die
	 * @param {?number} skill The value of the skill die
	 * @param {?number} rof Rate of Fire - The quantity of ammo dice
	 * @param {?number} modifier Any additional modifiers, if any
	 */
	constructor({ name = null, attribute = 6, skill = 0, rof = 0, modifier = 0} = {}) {
		super('t2k', null, name);
		this.addDice('base', 1, attribute);
		if (skill > 0) this.addDice('base', 1, skill);
		if (rof > 0) this.addDice('ammo', rof, 6);
		if (modifier !== 0) this.modify(modifier);
	}

	/**
	 * @type {YZDie[]}
	 * @readonly
	 */
	get baseDice() {
		return this.getDice('base');
	}

	/**
	 * @type {YZDie[]}
	 * @readonly
	 */
	get ammoDice() {
		return this.getDice('ammo');
	}

	async send() {}

	toJSON() {
		console.warn('stringifying');
		// Starts with an empty object.
		// const json = JSON.stringify(this);
		const json = Object.assign({}, this);

		// Adds all properties.
		const proto = Object.getPrototypeOf(this);
		for (const key of Object.getOwnPropertyNames(proto)) {
			const desc = Object.getOwnPropertyDescriptor(proto, key);
			const hasGetter = desc && typeof desc.get === 'function';
			if (hasGetter) {
				json[key] = this[key];
			}
		}
		return json;
	}
}