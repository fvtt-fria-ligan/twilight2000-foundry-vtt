/**
 * T2K Item Sheet
 * @extends {ItemSheet}
 */
export default class T2KItemSheet extends ItemSheet {
	get template() {
		return `systems/t2k4e/templates/sheets/${this.item.data.type}-sheet.hbs`;
	}

	getData() {
		const data = super.getData();
		data.config = CONFIG.T2K4E;
		return data;
	}
}