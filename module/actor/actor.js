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
		if (actorData.type === 'character') this._prepareCharacterData(actorData);
		else if (actorData.type === 'npc') this._prepareNpcData(actorData);
		// else if (actorData.type === 'animal') this._prepareCharacterData(actorData);
	}

	/**
	 * Prepares Character type specific data.
	 * @param {Object} actorData Actor's data.
	 * @private
	 */
	_prepareCharacterData(actorData) {
		const data = actorData.data;

		// Gets the attributes and skills values from their scores.
		this._prepareScores(data.attributes);
		this._prepareScores(data.skills);
		if (data.cuf) this._prepareScores(data.cuf);
		if (data.unitMorale) this._prepareScores(data.unitMorale);

		this._computeEncumbrance(data, actorData.items);

		data.hitCapacity = this._getHitCapacity(data);
		data.stressCapacity = this._getStressCapacity(data);
	}

	_prepareNpcData(actorData) {
		this._prepareCharacterData(actorData);
	}

	/**
	 * Prepares attributes or skills data.
	 * The function adds a `value` property for the die's size equal to its score.
	 * @param {Object} obj data.attributes OR data.skills OR any object with a "score" property.
	 * @private
	 */
	_prepareScores(obj) {
		if ('score' in obj) {
			obj.value = getDieSize(obj.score);
			return;
		}
		for (const [, o] of Object.entries(obj)) {
			o.value = getDieSize(o.score);
		}
	}

	/**
	 * Calculates the Hit Capacity.
	 * @param {Object} data The Actors's data.
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
	 * @param {Object} data The Actors's data.
	 * @returns {number}
	 * @private
	 */
	_getStressCapacity(data) {
		const int = data.attributes.int.value;
		const emp = data.attributes.emp.value;
		return Math.ceil((int + emp) / 4);
	}

	/**
	 * Adds Emcumbrance properties to the actor.
	 * @param {Object} data The Actor's data.
	 * @param {Item[]} items Array of items.
	 * @private
	 */
	_computeEncumbrance(data, items) {
		data.encumbrance = {
			get value() {
				const count = (items
					.filter(i => i.type !== 'specialty')
					.reduce((sum, i) => sum + (i.data.qty * i.data.weight), 0)
				) || 0;

				return count;
			},
			get max() {
				return data.attributes.str.value;
			}
		};

		data.overEncumbered = data.encumbrance.value > data.encumbrance.max;
	}
}