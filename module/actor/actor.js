import { getDieSize } from '../dice.js';
import { clamp } from '../utils.js';

/**
 * Twilight 2000 Actor.
 * @extends {Actor} Extends the basic Actor.
 */
export default class ActorT2K extends Actor {
	/**
	 * Augments the basic Actor data model with additional dynamic data.
	 * @override
	 */
	prepareData() {
		super.prepareData();

		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags;

		// Makes separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		switch (actorData.type) {
			case 'character': this._prepareCharacterData(actorData); break;
			case 'npc': this._prepareNpcData(actorData); break;
			case 'vehicle': this._prepareVehicleData(actorData); break;
			default: throw new TypeError(`Unknown Actor Type: "${actorData.type}"`);
		}

		console.log('t2k4e | Updated Actor: ', this.name, this._id);
	}

	/* ------------------------------------------- */
	/*  Character & NPC                            */
	/* ------------------------------------------- */

	/**
	 * Prepares Character type specific data.
	 * @param {Object} actorData The Actor's data
	 * @private
	 */
	_prepareCharacterData(actorData) {
		const data = actorData.data;

		// Gets the attributes and skills values from their scores.
		this._prepareScores(data.attributes);
		this._prepareScores(data.skills);
		if (data.cuf) this._prepareScores(data.cuf);
		if (data.unitMorale) this._prepareScores(data.unitMorale);

		this._prepareCapacities(data);
		this._prepareEncumbrance(data, actorData.items);
		this._prepareArmorRating(data, actorData.items.filter(i => i.type === 'armor'));
	}

	/**
	 * Prepares NPC type specific data.
	 * @param {Object} actorData The Actor's data
	 * @private
	 */
	_prepareNpcData(actorData) {
		this._prepareCharacterData(actorData);
	}

	/**
	 * Adds a `value` property for the die's size equal to its score.
	 * @param {Object} obj data.attributes OR data.skills OR any object with a "score" property
	 * @private
	 */
	_prepareScores(obj) {
		if ('score' in obj) {
			obj.value = getDieSize(obj.score);
		}
		else {
			for (const [, o] of Object.entries(obj)) {
				o.value = getDieSize(o.score);
			}
		}
		if ('maxScore' in obj) {
			obj.max = getDieSize(obj.maxScore);
		}
	}

	/**
	 * Adds Hit & Stress Capacities properties to the Actor.
	 * Adds also a Health property (with value and max) for token bars.
	 * @param {Object} data The Actor's data.data
	 * @private
	 */
	_prepareCapacities(data) {
		// Capacities are done like this because we want
		// a Health bar for tokens.
		// Only `.value` & `.modifier` should be modified in the Actor's sheet.
		data.health.max = this._getHitCapacity(data) + data.health.modifier;
		data.health.trauma = Math.max(0, data.health.max - data.health.value);
		data.hitCapacity = data.health.max;
		data.damage = data.health.trauma;

		data.sanity.max = this._getStressCapacity(data) + data.sanity.modifier;
		data.sanity.trauma = Math.max(0, data.sanity.max - data.sanity.value);
		data.stressCapacity = data.sanity.max;
		data.stress = data.sanity.trauma;
	}

	/**
	 * Calculates the Hit Capacity.
	 * @param {Object} data The Actor's data.data
	 * @returns {number}
	 * @private
	 */
	_getHitCapacity(data) {
		const str = data.attributes.str.value;
		const agl = data.attributes.agl.value;
		return Math.ceil((str + agl) / 4);
	}

	/**
	 * Calculates the Stress Capacity.
	 * @param {Object} data The Actors's data.data
	 * @returns {number}
	 * @private
	 */
	_getStressCapacity(data) {
		const int = data.attributes.int.value;
		const emp = data.attributes.emp.value;
		return Math.ceil((int + emp) / 4);
	}

	/**
	 * Adds Emcumbrance properties to the Actor.
	 * @param {Object} data   The Actor's data.data
	 * @param {Item[]} items  Array of items
	 * @private
	 */
	_prepareEncumbrance(data, items) {
		// Computes the Encumbrance.
		const val1 = (
			items
				.filter(i => !i.data.backpack && i.type !== 'specialty')
				.reduce((sum, i) => sum + i.data.encumbrance, 0)
			) || 0;

		data.encumbrance = {
			value: val1,
			max: data.attributes.str.value,
			pct: clamp((val1 / data.attributes.str.value) * 100, 0, 100),
			encumbered: val1 > data.attributes.str.value,
		};

		// Computes the Backpack.
		const val2 = (
			items
				.filter(i => i.data.backpack && i.type !== 'specialty')
				.reduce((sum, i) => sum + i.data.encumbrance, 0)
			) || 0;

		data.encumbrance.backpack = {
			value: val2,
			max: data.attributes.str.value,
			pct: clamp((val2 / data.attributes.str.value) * 100, 0, 100),
			encumbered: val2 > data.attributes.str.value,
		};
	}

	/**
	 * Adds Armor Ratings properties to the Actor.
	 * @param {Object} data    The Actor's data.data
	 * @param {Item[]} armors  An array containing the Actor's armors
	 * @private
	 */
	_prepareArmorRating(data, armors) {
		const ratings = armors.reduce((o, i) => {
			if (!i.data.equipped) return o;
			for (const [loc, isProtected] of Object.entries(i.data.location)) {
				if (!(loc in o)) o[loc] = 0;
				if (isProtected) {
					o[loc] = Math.max(o[loc], i.data.rating.value);
				}
			}
			return o;
		}, {});
		data.armorRating = ratings;
	}

	/* ------------------------------------------- */
	/*  Vehicle                                    */
	/* ------------------------------------------- */

	/**
	 * Prepares Vehicle type specific data.
	 * @param {Object} actorData The Actor's data
	 * @private
	 */
	_prepareVehicleData(actorData) {
		const data = actorData.data;
		this._prepareScores(data.reliability);
		this._computeVehicleEncumbrance(data, actorData.items);
	}

	/**
	 * Adds Emcumbrance properties a vehicle.
	 * @param {Object} data   The Actor's data.data
	 * @param {Item[]} items  Array of items
	 * @private
	 */
	_computeVehicleEncumbrance(data, items) {
		const val = (
			items
				.filter(i => !i.data.isMounted && i.type !== 'specialty')
				.reduce((sum, i) => sum + i.data.encumbrance, 0)
			) || 0;

		const max = data.cargo - (data.crew.driver * 25) + (data.trailer ? data.cargo : 0);

		data.encumbrance = {
			value: val,
			max,
			pct: clamp((val / max) * 100, 0, 100),
			encumbered: val > max,
		};
	}
}