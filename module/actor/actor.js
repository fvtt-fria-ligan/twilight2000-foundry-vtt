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
		this._prepareScores(data.cuf);
		this._prepareScores(data.unitMorale);
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

	_computeHitCapacity(actorData) {}
	_computeStressCapacity(actorData) {}
	_computeEncumbrance(actorData) {}
}