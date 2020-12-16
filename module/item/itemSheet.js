/**
 * Twilight 2000 Item Sheet.
 * @extends {ItemSheet} Extends the basic ItemSheet.
 */
export default class ItemSheetT2K extends ItemSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['t2k4e', 'sheet', 'item'],
			width: 520,
			height: 480,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'features'}]
		})
	}

	get template() {
		return `systems/t2k4e/templates/items/${this.item.data.type}-sheet.hbs`;
	}

	/** @override */
	getData() {
		const data = super.getData();
		data.config = CONFIG.T2K4E;
		data.itemType = game.i18n.localize(`T2K4E.itemTypes.${data.item.type}`);
		return data;
	}

	/** 
	 * Handles remembering the sheet's position.
	 * @override
	 */
	setPosition(options = {}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find('.sheet-body');
		const bodyHeight = position.height - 192;
		sheetBody.css('height', bodyHeight);
		return position;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable.
		if (!this.options.editable) return;
	}
}