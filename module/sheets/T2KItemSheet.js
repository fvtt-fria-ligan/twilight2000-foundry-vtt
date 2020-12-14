export default class T2KItemSheet extends ItemSheet {
	get template() {
		return `systems/frialigant2k4e/templates/sheets/${this.item.data.type}-sheet.html`;
	}

	getDate() {
		const data = super.getData();
		data.config = CONFIG.t2k4e;
		return data;
	}
}