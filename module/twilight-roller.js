import YZRoll from '../lib/yearzero-roll.js';
import { randomID } from './utils.js';
import { AmmoDie } from './dice.js';

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

		/**
		 * Identifier of the roll.
		 * @type {string}
		 * @private
		 */
		this._id = randomID(8);

		// Adds dice based on constructor's parameters.
		this.addDice('base', 1, attribute);
		if (skill > 0) this.addDice('base', 1, skill);
		if (rof > 0) this.addDice('ammo', rof, 6);
		if (modifier !== 0) this.modify(modifier);
	}

	get formula() {
		let out = [];
		for (const die of this.baseDice) {
			out.push(`1d${this.constructor.TERMS[die.range]}`);
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
	 * Twilight 2000 Dice custom Terms.
	 * @type {Object<number, string>}
	 * @constant
	 * @readonly
	 * @static
	 */
	static get TERMS() {
		return { '6': 'd', '8': 'c', '10': 'b', '12': 'a' }
	};

	/**
	 * Sends the roll to the Chat.
	 * @param {Actor} actor The actor that rolled the dice, if any
	 * @async
	 */
	async send(actor = null) {
		// Records the YZRoll into the actor.
		if (actor) actor.data.lastRoll = this;

		const chatRollTemplate = 'systems/t2k4e/templates/chat/roll.hbs';
		const forgeRoll = this.createFoundryRoll();
		const renderedRoll = await forgeRoll.render();
		const templateContext = {
			actor: actor.data,
			owner: game.user._id,
			yzroll: this,
			roll: renderedRoll,
		};
		const chatData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			roll: forgeRoll,
			content: await renderTemplate(chatRollTemplate, templateContext),
			sound: CONFIG.sounds.dice,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			// whisper: // TODO: See Part 6, 12:08
		};
		return await ChatMessage.create(chatData);


		// // const rollData = JSON.stringify(this);
		// // const html = await renderTemplate(hbs, rollData);
		// const roll = this.createFoundryRoll();

		// // const roll = Roll.fromData(fakeRoll);
		// console.warn('t2k4e | Created roll:', roll);
		// // roll._total = this.successCount;
		// // roll._dice = [];
		// // roll.pushable = this.pushable;

		// // const renderedRoll = await roll.render({ template: chatRollTemplate });

		// const messageData = {
		// 	user: game.user._id,
		// 	speaker: ChatMessage.getSpeaker(),
		// 	// sound: 'sounds/dice.wav',
		// 	content: await roll.render({ template: chatRollTemplate }),
		// 	// roll: JSON.stringify(fakeRoll),
		// 	pushable: this.pushable,
		// };
		// // ChatMessage.create(messageData);
		// roll.toMessage(messageData);

	}

	/**
	 * Creates a Foundry Roll base on this roll.
	 * @returns {Roll}
	 */
	createFoundryRoll() {
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
			terms.push(termData);//(Die.fromData(termData));
		}
		return Roll.fromData({
			formula: this.formula,
			results: this.dice.map(d => d.result),
			total: this.successCount,
			dice: [],
			terms,
		});
		// roll._dice = [];
		// roll.pushable = this.pushable;
		// return roll;
		// return {
		// 	class: 'Roll',
		// 	dice: [],
		// 	formula: this.formula,
		// 	terms
		// };
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

	/**
	 * Gets a T2K/YZRoll from a Foundry Roll's data.
	 * @param {Object} data Roll data
	 * @returns {T2KRoll}
	 * @static
	 */
	static fromFoundryData(data) {
		const forgeRoll = Roll.fromData(data);
		return this.fromFoundryRoll(forgeRoll);
	}

	/**
	 * Gets a T2KRoll/YZRoll from a Foundry Roll.
	 * @param {Roll} forgeRoll Foundry Roll
	 * @returns {T2KRoll}
	 * @static
	 */
	static fromFoundryRoll(forgeRoll) {
		const roll = new this();
		for (const t of forgeRoll.terms) {
			const type = t instanceof AmmoDie ? 'ammo' : 'base';
			roll.addDice(type, t.number, t.faces, t.total);
		}
		return roll;
	}
}