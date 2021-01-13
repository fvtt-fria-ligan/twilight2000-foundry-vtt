import { getDieSize } from '../dice.js';

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
			default: throw new TypeError('Unknown Actor Type');
		}

		console.log('t2k4e | Updated Actor: ', this.id);
	}

	/**
	 * Prepares Character type specific data.
	 * @param {Object} actorData The Actor's data.
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
	 * @param {Object} actorData The Actor's data.
	 * @private
	 */
	_prepareNpcData(actorData) {
		this._prepareCharacterData(actorData);
	}

	/**
	 * Adds a `value` property for the die's size equal to its score.
	 * @param {Object} obj data.attributes OR data.skills OR any object with a "score" property.
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
	}

	/**
	 * Adds Hit & Stress Capacities properties to the Actor.
	 * Adds also a Health property (with value and max) for token bars.
	 * @param {Object} data The Actor's data.data.
	 * @private
	 */
	_prepareCapacities(data) {
		data.health.max = this._getHitCapacity(data) + data.health.modifier;
		data.health.trauma = data.health.max - data.health.value;
		data.hitCapacity = data.health.max;
		data.damage = data.health.trauma;

		data.sanity.max = this._getStressCapacity(data) + data.sanity.modifier;
		data.sanity.trauma = data.sanity.max - data.sanity.value;
		data.stressCapacity = data.sanity.max;
		data.stress = data.sanity.trauma;
	}

	/**
	 * Calculates the Hit Capacity.
	 * @param {Object} data The Actor's data.data.
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
	 * @param {Object} data The Actors's data.data.
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
	 * @param {Object} data The Actor's data.data.
	 * @param {Item[]} items Array of items.
	 * @private
	 */
	_prepareEncumbrance(data, items) {
		const value = (
			items
				.filter(i => i.type !== 'specialty')
				.reduce((sum, i) => {
					if (i.type === 'ammunition' && i.data.props.magazine) {
						return sum + i.data.weight;
					}
					return sum + (i.data.qty * i.data.weight);
				}, 0)
			) || 0;

		data.encumbrance = {
			value,
			max: data.attributes.str.value
		};

		data.overEncumbered = data.encumbrance.value > data.encumbrance.max;
	}

	/**
	 * Adds Armor Ratings properties to the Actor.
	 * @param {Object} data The Actor's data.data.
	 * @param {Item[]} armors An array containing the Actor's armors.
	 * @private
	 */
	_prepareArmorRating(data, armors) {
		const ratings = armors.reduce((o, i) => {
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
}