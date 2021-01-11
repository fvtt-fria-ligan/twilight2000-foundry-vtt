import ActorSheetT2K from "./actorSheet.js";

/**
 * Twilight 2000 Actor Sheet for Character.
 * @extends {ActorSheet} Extends the T2K ActorSheet.
 */
export default class ActorSheetT2KCharacter extends ActorSheetT2K {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['t2k4e', 'sheet', 'actor', 'character'],
			width: 600,
			height: 650
		});
	}

	/** @override */
	getData() {
		const data = super.getData();
		// data.itemType = game.i18n.localize(`T2KLANG.ItemTypes.${data.item.type}`);

		switch (this.actor.data.type) {
			case 'character': this._prepareCharacterItems(data); break;
			case 'npc': this._prepareCharacterItems(data); break;
		}

		return data;
	}

	/**
	 * Organizes and classifies Items for Character Sheets.
	 * @param {Object} sheetData The data to prepare.
	 * @private
	 */
	_prepareCharacterItems(sheetData) {
		sheetData.weapons = sheetData.items.filter(i => i.type === 'weapon');
		sheetData.armors = sheetData.items.filter(i => i.type === 'armor');
		sheetData.grenades = sheetData.items.filter(i => i.type === 'grenade');
		sheetData.gears = sheetData.items.filter(i => i.type === 'gear');
		sheetData.ammunitions = sheetData.items.filter(i => i.type === 'ammunition');
		sheetData.specialties = sheetData.items.filter(i => i.type === 'specialty');

		// const actorData = sheetData.actor;
		// const sortedItems = {};

		// for (const i of sheetData.items) {
		// 	// const item = i.data;
		// 	i.img = i.img || DEFAULT_TOKEN;
		// 	if (!sortedItems[i.type]) sortedItems[i.type] = [];
		// 	sortedItems.push(i);
		// }

		// actorData.gear = sortedItems;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
	}
}