/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item.
 */
export default class ItemT2K extends Item {

	chatTemplate = {
		'weapon': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
		'grenade': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
	};

	async roll() {
		const chatData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker()
		};

		const cardData = {
			...this.data,
			owner: this.actor.id
		};

		chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
		chatData.roll = true;

		return ChatMessage.create(chatData);
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
		console.log('t2k4e | Updated Item: ', this.name, this._id);
	}

	/**
	 * Calculates a custom encumbrance for Ammunition items.
	 * @param {string} type Item type.
	 * @param {Object} data item.data.data.
	 */
	_prepareEncumbrance(type, data) {
		let weight = 0;
		if (type === 'ammunition' && !data.props.magazine) {
			weight = data.qty * data.weight * data.ammo.value;
		}
		else {
			weight = data.qty * data.weight;
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
				const str = game.i18n.localize(`T2KLANG.AttributeNames.${attr}`)
					+ ` ${val > 0 ? '+' : ''}${val}`;
				out.push(str);
			}
		}
		for (const [sk, val] of Object.entries(data.modifiers.skills)) {
			if (val !== 0) {
				const str = game.i18n.localize(`T2KLANG.SkillNames.${sk}`)
					+ ` ${val > 0 ? '+' : ''}${val}`;
				out.push(str);
			}
		}

		return out.join(', ');
	}
}