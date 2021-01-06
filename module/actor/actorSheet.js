/**
 * Twilight 2000 Actor Sheet.
 * @extends {ActorSheet} Extends the basic ActorSheet.
 */
export default class ActorSheetT2K extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['t2k4e', 'sheet', 'actor'],
			width: 600,
			height: 650,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'main'}]
		});
	}

	/** @override */
	// get template() {
	// 	return `systems/t2k4e/templates/items/${this.item.data.type}-sheet.hbs`;
	// }

	/** @override */
	getData() {
		const data = super.getData();
		data.config = CONFIG.T2K4E;
		// data.itemType = game.i18n.localize(`T2KLANG.ItemTypes.${data.item.type}`);

		if (this.actor.data.type === 'character') {
			this._prepareCharacterItems(data);
		}

		return data;
	}

	/**
	 * Organizes and classifies Items for Character Sheets.
	 * @param {Object} sheetData The data to prepare.
	 * @private
	 */
	_prepareCharacterItems(sheetData) {
		const actorData = sheetData.actor;
		const sortedItems = {};

		for (const i of sheetData.items) {
			// const item = i.data;
			i.img = i.img || DEFAULT_TOKEN;
			if (!sortedItems[i.type]) sortedItems[i.type] = [];
			sortedItems.push(i);
		}

		actorData.gear = sortedItems;
	}

	/** 
	 * Handles remembering the sheet's position.
	 * @override
	 */
	// setPosition(options = {}) {
	// 	const position = super.setPosition(options);
	// 	const sheetBody = this.element.find('.sheet-body');
	// 	const bodyHeight = position.height - 192;
	// 	sheetBody.css('height', bodyHeight);
	// 	return position;
	// }

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable.
		if (!this.options.editable) return;
	}
}