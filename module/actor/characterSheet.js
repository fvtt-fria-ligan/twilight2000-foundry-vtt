import ActorSheetT2K from './actorSheet.js';
import { T2KRoller, getAttributeAndSkill } from '../dice.js';

/**
 * Twilight 2000 Actor Sheet for Character.
 * @extends {ActorSheetT2K} Extends the T2K ActorSheet
 */
export default class ActorSheetT2KCharacter extends ActorSheetT2K {

  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'actor', 'character'],
      width: 550,
      height: 715,
    });
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  // /** @override */
  // getData() {
  //   const data = super.getData();
  //   return data;
  // }

  /* ------------------------------------------- */
  /*  Sheet Listeners                            */
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
    if (this.actor.isOwner) {
      html.find('.attribute-roll').click(this._onAttributeRoll.bind(this));
      html.find('.skill-roll').click(this._onSkillRoll.bind(this));
      html.find('.cuf-roll').click(this._onCoolnessRoll.bind(this));
      html.find('.unit-morale-roll').click(this._onUnitMoraleRoll.bind(this));
      html.find('.radiation-roll').click(this._onRadiationRoll.bind(this));
    }
  }

  // TODO Update actor HP when attribute are changed.
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

  /* ------------------------------------------- */

  _onAttributeRoll(event) {
    event.preventDefault();
    const attributeName = event.currentTarget.dataset.attribute;
    const attribute = this.actor.data.data.attributes[attributeName].value;
    const title = game.i18n.localize(CONFIG.T2K4E.attributes[attributeName]);
    return T2KRoller.taskCheck({
      title,
      attributeName,
      actor: this.actor,
      attribute,
      skill: 0,
      askForOptions: event.shiftKey,
    });
  }

  /* ------------------------------------------- */

  _onSkillRoll(event) {
    event.preventDefault();
    const skillName = event.currentTarget.dataset.skill;
    const statData = getAttributeAndSkill(skillName, this.actor.data.data);
    const isRangedSkill = (skillName === 'rangedCombat' || skillName === 'heavyWeapons');
    return T2KRoller.taskCheck({
      ...statData,
      actor: this.actor,
      askForOptions: event.shiftKey,
      rof: isRangedSkill ? 6 : 0,
    });
  }

  /* ------------------------------------------- */

  _onCoolnessRoll(event) {
    event.preventDefault();
    const stat = event.currentTarget.closest('.stat');
    const type = stat.dataset.type;
    return this._onMoraleRoll(type);
  }

  _onUnitMoraleRoll(event) {
    event.preventDefault();
    const stat = event.currentTarget.closest('.stat');
    const type = stat.dataset.type;
    return this._onMoraleRoll(type);
  }

  _onMoraleRoll(type) {
    return T2KRoller.cufCheck({
      actor: this.actor,
      unitMorale: type === 'cuf' ? false : true,
    });
  }

  /* ------------------------------------------- */

  _onRadiationRoll(event) {
    event.preventDefault();
    return this.actor.rollRadiationAttack({ askForOptions: event.shiftKey });
  }

  /* ------------------------------------------- */

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
    newCount = Math.clamped(newCount, min, max);

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
    const newMod = Math.clamped(currentMod + mod, min, max);

    return this.actor.update({ [`data.${field}.modifier`]: newMod });
  }
}