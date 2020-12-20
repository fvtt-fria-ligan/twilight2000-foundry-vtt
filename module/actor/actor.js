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
	 * @param {*} actorData 
	 */
	_prepareCharacterData(actorData) {
		const data = actorData.data;

		// Gets the attributes and skills values from their scores.
		for (const [, attribute] of Object.entries(data.attributes)) {
			attribute.value = getDieSize(attribute.score);
		}
		for (const [, skill] of Object.entries(data.skills)) {
			skill.value = getDieSize(skill.score);
		}
	}
}