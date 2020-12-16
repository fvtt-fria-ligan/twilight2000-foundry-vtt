/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item.
 */
export class ItemT2K extends Item {
	/**
	 * Augments the basic Item data model with additional dynamic data.
	 * @override
	 */
	prepareData() {
		super.prepareData();

		const itemData = this.data;
		const actorData = this.actor ? this.actor.data : {};
		const data = itemData.data;
	}
}