import { getDieSize, T2KRoller } from '../dice.js';
import { T2K4E } from '../config.js';

/**
 * Twilight 2000 Actor.
 * @extends {Actor} Extends the basic Actor.
 */
export default class ActorT2K extends Actor {

  /* ------------------------------------------- */
  /*  Properties                                 */
  /* ------------------------------------------- */

  get inCombat() {
    return game.combat?.combatants?.some(c => c.actor.id === this.id);
  }

  get hasReliability() {
    return !!this.data.data.reliability?.max;
  }

  /* ------------------------------------------- */
  /*  Data Preparation                           */
  /* ------------------------------------------- */

  /**
   * Augments the basic Actor data model with additional dynamic data.
   * @override
   */
  prepareData() {
    super.prepareData();
    const actorData = this.data;

    // Makes separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch (actorData.type) {
      case 'character': this._prepareCharacterData(actorData); break;
      case 'npc': this._prepareNpcData(actorData); break;
      case 'vehicle': this._prepareVehicleData(actorData); break;
      default: throw new TypeError(`Unknown Actor Type: "${actorData.type}"`);
    }

    console.log('t2k4e | Updated Actor: ', this.name, this.id);
  }

  /** @override */
  get itemTypes() {
    if (this.type === 'vehicle') {
      const types = Object.fromEntries(game.system.entityTypes.Item.map(t => [t, []]));
      for (const i of this.items.values()) {
        // Excludes mounted weapons from the vehicle's cargo.
        if (i.data.data.isMounted) continue;
        types[i.data.type].push(i);
      }
      return types;
    }
    return super.itemTypes;
  }

  /* ------------------------------------------- */
  /*  Data Preparation                           */
  /*   → Character & NPC                         */
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

  /* ------------------------------------------- */

  /**
   * Prepares NPC type specific data.
   * @param {Object} actorData The Actor's data
   * @private
   */
  _prepareNpcData(actorData) {
    this._prepareCharacterData(actorData);
  }

  /* ------------------------------------------- */

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
    // if ('maxScore' in obj) {
    //   obj.max = getDieSize(obj.maxScore);
    // }
  }

  /* ------------------------------------------- */

  /**
   * Adds Hit & Stress Capacities properties to the Actor.
   * Adds also a Health property (with value and max) for token bars.
   * @param {Object} data The Actor's data.data
   * @private
   */
  _prepareCapacities(data) {
    // Capacities are done like this because we want a Health bar for tokens.
    // Only `.value` & `.modifier` should be modified in the Actor's sheet.
    data.health.max = this._getHitCapacity(data) + data.health.modifier;
    data.health.trauma = Math.max(0, data.health.max - data.health.value);
    data.hitCapacity = data.health.max;
    data.damage = data.health.trauma;

    data.sanity.max = this._getStressCapacity(data) + data.sanity.modifier;
    data.sanity.trauma = Math.max(0, data.sanity.max - data.sanity.value);
    data.stressCapacity = data.sanity.max;
    data.stress = data.sanity.trauma;
    return data;
  }

  /* ------------------------------------------- */

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

  /* ------------------------------------------- */

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

  /* ------------------------------------------- */

  /**
   * Adds Emcumbrance properties to the Actor.
   * @param {Object} data   The Actor's data.data
   * @param {Item[]} items  Array of items
   * @private
   */
  _prepareEncumbrance(data, items) {
    // Computes the Encumbrance.
    const val1 = (items
      .filter(i => !i.data.data.backpack && i.type !== 'specialty')
      .reduce((sum, i) => sum + i.data.data.encumbrance, 0)
    ) ?? 0;

    data.encumbrance = {
      value: val1,
      max: data.attributes.str.value,
      pct: Math.clamped((val1 / data.attributes.str.value) * 100, 0, 100),
      encumbered: val1 > data.attributes.str.value,
    };

    // Computes the Backpack.
    const val2 = (items
      .filter(i => i.data.data.backpack && i.type !== 'specialty')
      .reduce((sum, i) => sum + i.data.data.encumbrance, 0)
    ) ?? 0;

    data.encumbrance.backpack = {
      value: val2,
      max: data.attributes.str.value,
      pct: Math.clamped((val2 / data.attributes.str.value) * 100, 0, 100),
      encumbered: val2 > data.attributes.str.value,
    };
    return data;
  }

  /* ------------------------------------------- */

  /**
   * Adds Armor Ratings properties to the Actor.
   * @param {Object} data    The Actor's data.data
   * @param {Item[]} armors  An array containing the Actor's armors
   * @private
   */
  _prepareArmorRating(data, armors) {
    const ratings = armors.reduce((o, i) => {
      if (!i.data.data.equipped) return o;
      for (const [loc, isProtected] of Object.entries(i.data.data.location)) {
        if (!(loc in o)) o[loc] = 0;
        if (isProtected) {
          o[loc] = Math.max(o[loc], i.data.data.rating.value);
        }
      }
      return o;
    }, {});
    data.armorRating = ratings;
    return data;
  }

  /* ------------------------------------------- */
  /*  Data Preparation                           */
  /*   → Vehicle                                 */
  /* ------------------------------------------- */

  /**
   * Prepares Vehicle type specific data.
   * @param {Object} actorData The Actor's data
   * @private
   */
  _prepareVehicleData(actorData) {
    const data = actorData.data;
    this._computeVehicleEncumbrance(data, actorData.items);
  }

  /* ------------------------------------------- */

  /**
   * Adds Emcumbrance properties a vehicle.
   * @param {Object} data   The Actor's data.data
   * @param {Item[]} items  Array of items
   * @private
   */
  _computeVehicleEncumbrance(data, items) {
    let val = (items
      .filter(i => !i.data.data.isMounted && i.type !== 'specialty')
      .reduce((sum, i) => sum + i.data.data.encumbrance, 0)
    ) ?? 0;

    const maxCrewQty = data.crew.qty + data.crew.passengerQty;
    const crewCount = data.crew.occupants.length;
    const emptySeatCount = Math.max(0, maxCrewQty - crewCount);
    const emptySeatWeight = emptySeatCount * T2K4E.vehicle.emptySeatEncumbrance;
    const extraPassengerCount = -Math.min(0, maxCrewQty - crewCount);
    const extraPassengerWeight = extraPassengerCount * T2K4E.vehicle.extraPassengerEncumbrance;

    const max = data.cargo + emptySeatWeight + (data.trailer ? data.cargo : 0);
    val += extraPassengerWeight;

    data.encumbrance = {
      value: val,
      max,
      pct: Math.clamped((val / max) * 100, 0, 100),
      encumbered: val > max,
    };
    return data;
  }

  /* ------------------------------------------- */
  /*  Vehicle: Crew Management                   */
  /* ------------------------------------------- */

  /**
   * Adds an occupant to the vehicle.
   * @param {string}  crewId              The id of the added actor
   * @param {string}  [position='PASSENGER'] Crew position flag ('PASSENGER', 'DRIVER', 'GUNNER', or 'COMMANDER')
   * @param {boolean} [isExposed=false]   Whether it's an exposed position
   * @returns {VehicleOccupant}
   */
  addVehicleOccupant(crewId, position = 'PASSENGER', isExposed = false) {
    if (this.type !== 'vehicle') return;
    if (!T2K4E.vehicle.crewPositionFlags.includes(position)) {
      throw new TypeError(`t2k4e | addVehicleOccupant | Wrong position flag: ${position}`);
    }
    const data = this.data.data;
    // if (!(data.crew.occupants instanceof Array)) {
    //   data.crew.occupants = [];
    // }
    const occupant = {
      id: crewId,
      position,
      exposed: isExposed,
    };
    // Removes duplicates.
    if (data.crew.occupants.some(o => o.id === crewId)) this.removeVehicleOccupant(crewId);
    // Adds the new occupant.
    data.crew.occupants.push(occupant);
    this.update({ 'data.crew.occupants': data.crew.occupants });
    return occupant;
  }

  /* ------------------------------------------- */

  /**
   * Removes an occupant from the vehicle.
   * @param {string} crewId The id of the occupant to remove
   * @return {VehicleOccupant[]}
   */
  removeVehicleOccupant(crewId) {
    if (this.type !== 'vehicle') return;
    const crew = this.data.data.crew;
    crew.occupants = crew.occupants.filter(o => o.id !== crewId);
    return crew.occupants;
  }

  /* ------------------------------------------- */

  /**
   * Gets a specific occupant in the vehicle.
   * @param {string} crewId The id of the occupant to find
   * @returns {VehicleOccupant|undefined}
   */
  getVehicleOccupant(crewId) {
    if (this.type !== 'vehicle') return;
    return this.data.data.crew.occupants.find(o => o.id === crewId);
  }

  /* ------------------------------------------- */

  /**
   * Gets a collection of crewed actors.
   * @returns {Collection<string, Actor>} [id, actor]
   */
  getCrew() {
    if (this.type !== 'vehicle') return undefined;
    const c = new foundry.utils.Collection();
    for (const o of this.data.data.crew.occupants) {
      c.set(o.id, game.actors.get(o.id));
    }
    return c;
  }

  /* ------------------------------------------- */
  /*  Radiation Roll                             */
  /* ------------------------------------------- */

  /**
   * Rolls a radiation attack for this character.
   * @param {object} options Additional task check options
   * @returns {Promise<import('../../lib/yzur.js').YearZeroRoll|ChatMessage>}
   */
  async rollRadiationAttack(options) {
    if (this.type !== 'character') return;

    const data = this.data.data;
    const rads = data.rads || {};
    const sievert = rads.temporary + rads.permanent;

    if (sievert <= 0) return;

    const rollConfig = foundry.utils.mergeObject({
      title: game.i18n.localize('T2K4E.ActorSheet.RadiationRoll'),
      actor: this,
      attribute: data.attributes.str.value,
      skill: data.skills.stamina.value,
      modifier: T2K4E.radiationVirulence - sievert,
    }, options);

    return T2KRoller.taskCheck(rollConfig);
  }

  /* ------------------------------------------- */
  /*  Chat Card Actions                          */
  /* ------------------------------------------- */

  static chatListeners(html) {}
}

/* ------------------------------------------- */

/**
 * @typedef {object} VehicleOccupant
 * An object defining an occupant of a vehicle.
 * @property {string}  id       The id of the actor
 * @property {string}  position Its position in the vehicle
 * @property {boolean} exposed  Whether it's an exposed position
 * @property {Actor?}  actor    A shortcut to the actor
 */