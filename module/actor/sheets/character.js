import ActorSheetT2K from "./actorSheet.js";
import { clamp } from '../../utils.js';
import * as Dice from '../../dice.js';

/**
 * Twilight 2000 Actor Sheet for Character.
 * @extends {ActorSheetT2K} Extends the T2K ActorSheet
 */
export default class ActorSheetT2KCharacter extends ActorSheetT2K {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['t2k4e', 'sheet', 'actor', 'character'],
			width: 550,
			height: 715
		});
	}

	/* ------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		// data.itemType = game.i18n.localize(`T2K4E.ItemTypes.${data.item.type}`);

		switch (this.actor.data.type) {
			case 'character': this._prepareCharacterItems(data); break;
			case 'npc': this._prepareCharacterItems(data); break;
		}

		return data;
	}

	/**
	 * Organizes and classifies Items for Character Sheets.
	 * @param {Object} sheetData The data to prepare
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

	/* ------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable.
		if (!this.options.editable) return;
		if (!this.isEditable) return;

		// html.find('.stat-score .score-selector').change(this._onAttributeChange.bind(this));
		html.find('.boxes-radiation').on('click contextmenu', super._onValueChange.bind(this));
		html.find('.boxes-capacity').on('click contextmenu', this._onCapacityChange.bind(this));
		html.find('.capacity-increase').click(this._onCapacityIncrease.bind(this));
		html.find('.capacity-decrease').click(this._onCapacityDecrease.bind(this));

		// Owner-only listeners.
		if (this.actor.owner) {
			html.find('.attribute-roll').click(this._onAttributeRoll.bind(this));
			html.find('.skill-roll').click(this._onSkillRoll.bind(this));
			html.find('.cuf-roll').click(this._onCoolnessRoll.bind(this));
			html.find('.unit-morale-roll').click(this._onUnitMoraleRoll.bind(this));
		}
	}

	// TODO
	// _onAttributeChange(event) {
	// 	event.preventDefault();
	// 	console.warn('d');
	// 	const data = this.actor.data.data;
	// 	this.actor.update({
	// 		'data.health.value': data.health.max,
	// 		'data.sanity.value': data.sanity.max,
	// 		'data.health.modifier': 0,
	// 		'data.sanity.modifier': 0,
	// 		'data.health.trauma': 0,
	// 		'data.sanity.trauma': 0,
	// 	});
	// }

	_onAttributeRoll(event) {
		event.preventDefault();
		const attributeName = event.currentTarget.dataset.attribute;
		const attribute = this.actor.data.data.attributes[attributeName].value;
		const name = game.i18n.localize(CONFIG.T2K4E.attributes[attributeName]);
		return Dice.TaskCheck({
			name,
			attribute,
			attributeName,
			actor: this.actor,
			askForOptions: event.shiftKey,
		});
	}

	_onSkillRoll(event) {
		event.preventDefault();
		const skillName = event.currentTarget.dataset.skill;
		const statData = Dice.getAttributeAndSkill(skillName, this.actor.data.data);
		console.warn(event);
		return Dice.TaskCheck({
			...statData,
			skillName,
			actor: this.actor,
			askForOptions: event.shiftKey,
		});
	}

	_onCoolnessRoll(event) {
		event.preventDefault();
		const stat = event.currentTarget.closest('.stat');
		const type = stat.dataset.type;
		return this._onMoraleRoll(type, event.shiftKey);
	}

	_onUnitMoraleRoll(event) {
		event.preventDefault();
		const stat = event.currentTarget.closest('.stat');
		const type = stat.dataset.type;
		return this._onMoraleRoll(type, event.shiftKey);
	}

	_onMoraleRoll(type, askForOptions) {
		let value = 0;
		let name = '';
		if (type === 'cuf') {
			value = this.actor.data.data.cuf.value;
			name = game.i18n.localize('T2K4E.ActorSheet.CuF');
		}
		else {
			value = this.actor.data.data.unitMorale.value;
			name = game.i18n.localize('T2K4E.ActorSheet.UnitMorale');
		}
		return Dice.TaskCheck({
			name,
			attribute: value,
			actor: this.actor,
			askForOptions,
		});
	}

	/** Left-clic: -1, Right-clic: +1 */
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

		return this.actor.update({ [`data.${field}.value`]: newCount });
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

		return this.actor.update({ [`data.${field}.modifier`]: newMod});
	}
}