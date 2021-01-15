import YZRoll from '../lib/yearzero-roll.js';

/**
 * A T2K Year Zero Roll object.
 * @extends {YZRoll} The Sebedius Discord Bot's YZRoll class
 * @link https://stefouch.be
 */
export default class T2KRoll extends YZRoll {
	/**
	 * @param {?string} name       The name of the roll
	 * @param {?number} attribute  The value of the attribute die
	 * @param {?number} skill      The value of the skill die
	 * @param {?number} rof        Rate of Fire - The quantity of ammo dice
	 * @param {?number} modifier   Any additional modifiers, if any
	 */
	constructor({ name = null, attribute = 6, skill = 0, rof = 0, modifier = 0} = {}) {
		super('t2k', null, name);
		this.addDice('base', 1, attribute);
		if (skill > 0) this.addDice('base', 1, skill);
		if (rof > 0) this.addDice('ammo', rof, 6);
		if (modifier !== 0) this.modify(modifier);
	}

	get formula() {
		let out = [];
		for (const die of this.baseDice) {
			out.push(`1d${die.range}`);
		}
		const ammoDiceSize = this.ammoDice.length || 0;
		if (ammoDiceSize > 0) {
			out.push(`${ammoDiceSize}dm`);
		}
		return out.join('+');
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

	/**
	 * Sends the roll to the Chat.
	 * @async
	 */
	async send() {
		const hbs = 'systems/t2k4e/templates/chat/roll.hbs';
		const rollData = JSON.stringify(this);
		const html = await renderTemplate(hbs, rollData);
		const fakeRoll = this.createFakeRoll();

		const roll = Roll.fromData(fakeRoll);
		roll._total = this.successCount;

		const messageData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			sound: 'sounds/dice.wav',
			// content: html,
			// roll: JSON.stringify(fakeRoll),
		};
		// ChatMessage.create(messageData);
		roll.toMessage(messageData);

	}

	/**
	 * Creates a fake roll (for the Foundry's Roll class).
	 * @returns {Object}
	 */
	createFakeRoll() {
		const terms = [];
		for (const die of this.dice) {
			let dieClass = 'Die';
			switch (die.type) {
				case 'base': dieClass = `BaseDieD${die.range}`; break;
				case 'ammo': dieClass = 'AmmoDie'; break;
			}
			const termData = {
				class: dieClass,
				faces: die.range,
				number: 1,
				results: [{ result: die.result, active: true }],
			};
			terms.push(Die.fromData(termData));
		}
		return {
			class: 'Roll',
			dice: [],
			formula: this.formula,
			terms
		};
	}

	/**
	 * Custom JSON Stringifier to include getters.
	 * @returns {Object} JSON format-ready object
	 * @override
	 */
	toJSON() {
		const json = Object.assign({}, this);
		const proto1 = Object.getPrototypeOf(this);
		const proto2 = Object.getPrototypeOf(proto1);
		const protos = [proto1, proto2];
		for (const proto of protos) {
			for (const key of Object.getOwnPropertyNames(proto)) {
				const desc = Object.getOwnPropertyDescriptor(proto, key);
				const hasGetter = desc && typeof desc.get === 'function';
				if (hasGetter && json[key] == null) {
					try {
						const val = this[key];
						json[key] = val;
					}
					catch (error) {
						console.error(`Error calling getter: ${key}`, error);
					}
				}
			}
		}
		return json;
	}

	static fromFoundryData(data) {
		// const roll;
	}

	static fromFoundryRoll(roll) {
		// const friaLiganRoll = 0;
	}
}