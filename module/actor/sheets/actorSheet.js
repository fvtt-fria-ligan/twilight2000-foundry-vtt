import { clamp } from '../../utils.js';

/**
 * Twilight 2000 Actor Sheet.
 * @extends {ActorSheet} Extends the basic ActorSheet
 */
export default class ActorSheetT2K extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'main'}]
		});
	}

	/** @override */
	get template() {
		if (this.actor.data.type === 'npc') {
			return 'systems/t2k4e/templates/actors/character-sheet.hbs';
		}
		return `systems/t2k4e/templates/actors/${this.actor.data.type}-sheet.hbs`;
	}

	/** @override */
	getData() {
		const data = super.getData();
		data.config = CONFIG.T2K4E;
		// data.itemType = game.i18n.localize(`T2K4E.ItemTypes.${data.item.type}`);

		// if (this.actor.data.type === 'character') {
		// 	this._prepareCharacterItems(data);
		// }

		return data;
	}

	/**
	 * Organizes and classifies Items for Character Sheets.
	 * @param {Object} sheetData The data to prepare.
	 * @private
	 */
	// _prepareCharacterItems(sheetData) {
	// 	const actorData = sheetData.actor;
	// 	const sortedItems = {};

	// 	for (const i of sheetData.items) {
	// 		// const item = i.data;
	// 		i.img = i.img || DEFAULT_TOKEN;
	// 		if (!sortedItems[i.type]) sortedItems[i.type] = [];
	// 		sortedItems.push(i);
	// 	}

	// 	actorData.gear = sortedItems;
	// }

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
		if (!this.isEditable) return;

		html.find('.item-create').click(this._onItemCreate.bind(this));
		html.find('.item-edit').click(this._onItemEdit.bind(this));
		html.find('.item-delete').click(this._onItemDelete.bind(this));
		html.find('.item-equip').click(this._onItemEquip.bind(this));
		html.find('.item-backpack').click(this._onItemStore.bind(this));
		html.find('.item-mag .weapon-edit-ammo').change(this._onWeaponAmmoChange.bind(this));

		// Owner-only listeners.
		if (this.actor.owner) {
			html.find('.item-roll').click(this._onItemRoll.bind(this));
		}
	}

	_onItemRoll(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest('.item').dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		return item.roll();
	}

	_onItemCreate(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const type = elem.dataset.type;
		const itemData = {
			name: game.i18n.localize(`T2K4E.ActorSheet.NewItem.${type}`),
			type,
		};
		return this.actor.createOwnedItem(itemData)
			// Displays the sheet of the newly created item.
			.then(itemData => {
				const item = this.actor.getOwnedItem(itemData._id);
				item.sheet.render(true);
			});
	}

	_onItemEdit(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const itemId = elem.closest('.item').dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		return item.sheet.render(true);
	}

	_onItemDelete(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const itemId = elem.closest('.item').dataset.itemId;
		return this.actor.deleteOwnedItem(itemId);
	}

	_onItemEquip(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest('.item').dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		const equipped = item.data.data.equipped;
		const updateData = { 'data.equipped': !equipped };
		if (!equipped && item.data.data.backpack) updateData['data.backpack'] = false;
		return item.update(updateData);
	}

	_onItemStore(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest('.item').dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		const stored = item.data.data.backpack;
		const updateData = { 'data.backpack': !stored };
		if (!stored && item.data.data.equipped) updateData['data.equipped'] = false;
		return item.update(updateData);
	}

	_onWeaponAmmoChange(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const itemId = elem.closest('.item').dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		const value = +elem.value;
		return item.update({ 'data.mag.value': value });
	}

	/** Left-clic: +1, Right-clic: -1 */
	_onValueChange(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const min = +elem.dataset.min || 0;
		const max = +elem.dataset.max || 10;
		const field = elem.dataset.field;
		const currentCount = getProperty(this.actor, `data.data.${field}`) || 0;
		let newCount = currentCount;

		if (event.type === 'click') newCount++;
		else newCount--; // contextmenu
		newCount = clamp(newCount, min, max);

		return this.actor.update({ ['data.'+field]: newCount });
	}
}