/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item.
 */
export default class ItemT2K extends Item {
	/**
	 * Augments the basic Item data model with additional dynamic data.
	 * @override
	 */
	prepareData() {
		super.prepareData();

		const itemData = this.data;
		const actorData = this.actor ? this.actor.data : {};
		const data = itemData.data;

		if (this.type === 'specialty') {
			data.modifiersDescription = this._getModifiersDescription(data);
		}
	}

	/**
	 * Returns a string resuming the modifiers.
	 * @param {Object} data 
	 * @returns {string}
	 * @private
	 */
	_getModifiersDescription(data) {
		if (!data.modifiers) return;
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