import { clamp } from '../../utils.js';

/**
 * Twilight 2000 Actor Sheet.
 * @extends {ActorSheet} Extends the basic ActorSheet.
 */
export default class ActorSheetT2K extends ActorSheet {

	// itemContextMenuDelete = [
	// 	{
	// 		name: game.i18n.localize('T2KLANG.ActorSheet.Delete'),
	// 		icon: '<i class="fas fa-trash"></i>',
	// 		callback: elem => {
	// 			const itemId = elem.closest('.item').dataset.itemId;
	// 			this.actor.deleteOwnedItem(itemId);
	// 		}
	// 	}
	// ];

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'combat'}]
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
		// data.itemType = game.i18n.localize(`T2KLANG.ItemTypes.${data.item.type}`);

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

		// new ContextMenu(html, 'a.item-button.item-delete', this.itemContextMenuDelete);

		html.find('.item-create').click(this._onItemCreate.bind(this));
		html.find('.item-edit').click(this._onItemEdit.bind(this));
		html.find('.item-delete').click(this._onItemDelete.bind(this));
		html.find('.boxes-radiation').on('click contextmenu', this._onValueChange.bind(this));
		html.find('.boxes-capacity').on('click contextmenu', this._onCapacityChange.bind(this));
		html.find('.capacity-increase').click(this._onCapacityIncrease.bind(this));
		html.find('.capacity-decrease').click(this._onCapacityDecrease.bind(this));
	}

	_onItemCreate(event) {
		event.preventDefault();
		const elem = event.currentTarget;

		const type = elem.dataset.type;

		const itemData = {
			name: game.i18n.localize(`T2KLANG.ActorSheet.NewItem.${type}`),
			type
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

		item.sheet.render(true);
	}

	_onItemDelete(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const itemId = elem.closest('.item').dataset.itemId;
		return this.actor.deleteOwnedItem(itemId);
	}

	/**
	 * Left click: +1
	 * Right click: -1
	 */
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

		this.actor.update({ ['data.'+field]: newCount });
	}

	_onCapacityChange(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const min = +elem.dataset.min || 0;
		const max = +elem.dataset.max || 10;
		const field = elem.dataset.field;
		const currentCount = getProperty(this.actor, `data.data.${field}.value`) || 0;
		let newCount = currentCount;

		if (event.type === 'click') newCount--;
		else newCount++; // contextmenu

		newCount = clamp(newCount, min, max);

		this.actor.update({ [`data.${field}.value`]: newCount });
	}

	_onCapacityIncrease(event) {
		this._changeCapacityModifier(event, 1);
	}

	_onCapacityDecrease(event) {
		this._changeCapacityModifier(event, -1);
	}

	_changeCapacityModifier(event, mod) {
		event.preventDefault();
		const elem = event.currentTarget;
		const field = elem.dataset.field;

		const maxi = getProperty(this.actor, `data.data.${field}.max`);
		if (mod < 0 && maxi < 2) return;
		if (mod > 0 && maxi > 11) return;

		const min = -12;
		const max = 12;
		const currentMod = getProperty(this.actor, `data.data.${field}.modifier`) || 0;
		const newMod = clamp(currentMod + mod, min, max);

		this.actor.update({ [`data.${field}.modifier`]: newMod});
	}
}