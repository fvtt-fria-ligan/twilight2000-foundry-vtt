/**
 * Twilight 2000 Item Sheet.
 * @extends {ItemSheet} Extends the basic ItemSheet.
 */
export default class ItemSheetT2K extends ItemSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['t2k', 'sheet', 'item'],
			width: 650,
			height: 650,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description'}]
		})
	}

	/** @override */
	get template() {
		return `systems/t2k4e/templates/items/${this.item.data.type}-sheet.hbs`;
	}

	/** @override */
	getData() {
		const data = super.getData();
		data.config = CONFIG.T2K4E;
		data.itemType = game.i18n.localize(`T2KLANG.itemTypes.${data.item.type}`);
		return data;
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