import { TaskCheck } from "../dice.js";

/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item
 */
export default class ItemT2K extends Item {

	chatTemplate = {
		'weapon': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
		'grenade': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
		'armor': 'systems/t2k4e/templates/chat/armor-chat.hbs',
		'gear': 'systems/t2k4e/templates/chat/gear-chat.hbs',
		'ammunition': 'systems/t2k4e/templates/chat/gear-chat.hbs',
	};

	// TODO
	async roll() {
		const chatData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker(),
		};

		const cardData = {
			...this.data,
			owner: this.actor.id,
		};

		chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
		chatData.roll = true;

		return ChatMessage.create(chatData);
	}

	/**
	 * Reloads a weapon.
	 * TODO
	 * @async
	 */
	async reload() {
		TaskCheck({
			name: game.i18n.localize('T2K4E.Chat.Actions.Reload'),
			attribute: this.actor?.data.data.attributes.agl.value,
			skill: this.actor?.data.data.skills.rangedCombat.value,
			actor: this.actor,
			item: this,
		});
		console.warn('t2k4e | RELOAD => Function not implemented yet! — Planned for a future release.');
		return;
		if (this.type !== 'weapon') return;
		if (!this.actor) return;

		const actorData = this.actor ? this.actor.data : {};

		const itemData = this.data;
		const data = itemData.data;

		// We don't need to reload the weapon if it's already full.
		if (data.mag?.value === data.mag?.max) {
		}

		let ammoMissing = data.mag.max - data.mag.value;

		while (ammoMissing > 0) {
			// Filters all magazines in the actor's inventory.
			const ammunitions = this.actor.items.filter(i => i.type === 'ammunition');

			// If it's empty, we cannot reload the weapon.
			if (ammunitions.length <= 0) {
			}

			// Filters the right ammo type.
			const ammoType = this.ammo;
			const munitions = ammunitions.filter(i => i.data.itemType === ammoType);

			// If it's empty, we cannot -again- reload the weapon, obviously.
			if (munitions.length <= 0) {
			}

			// Gets the first corresponding.
			const ammo = munitions[0];
		}
	}

	/**
	 * Augments the basic Item data model with additional dynamic data.
	 * @override
	 */
	prepareData() {
		super.prepareData();

		const itemData = this.data;
		const actorData = this.actor ? this.actor.data : {};
		const data = itemData.data;

		this._prepareEncumbrance(this.type, data);
		this._prepareModifiers(data);

		// switch (this.type) {
		// 	case 'ammunition': 
		// }
		// console.log('t2k4e | Updated Item: ', this.name, this._id);
	}

	/**
	 * Calculates a custom encumbrance for items.
	 * @param {string} type  Item type
	 * @param {Object} data  item.data.data
	 */
	_prepareEncumbrance(type, data) {
		let weight = 0;
		if (type === 'ammunition' && !data.props.magazine) {
			weight = data.qty * data.weight * data.ammo.value;
		}
		else {
			const belt = data.props?.ammoBelt ? 1 : 0;
			weight = data.qty * (data.weight + belt);
		}
		
		if (!weight) data.encumbrance = 0;
		else data.encumbrance = weight;
	}

	/**
	 * Adds more properties to the Modifiers prop.
	 * @param {Object} data
	 * @private
	 */
	_prepareModifiers(data) {
		if (!data.modifiers) return;
		data.modifiers.description = this._getModifiersDescription(data);
		data.modifiers.hasModifiers = data.modifiers.description.length > 0;
	}

	/**
	 * Returns a string resuming the modifiers.
	 * @param {Object} data 
	 * @returns {string}
	 * @private
	 */
	_getModifiersDescription(data) {
		const out = [];

		for (const [attr, val] of Object.entries(data.modifiers.attributes)) {
			if (val !== 0) {
				const str = game.i18n.localize(`T2K4E.AttributeNames.${attr}`)
					+ ` ${val > 0 ? '+' : ''}${val}`;
				out.push(str);
			}
		}
		for (const [sk, val] of Object.entries(data.modifiers.skills)) {
			if (val !== 0) {
				const str = game.i18n.localize(`T2K4E.SkillNames.${sk}`)
					+ ` ${val > 0 ? '+' : ''}${val}`;
				out.push(str);
			}
		}

		return out.join(', ');
	}
}