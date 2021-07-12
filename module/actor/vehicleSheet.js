import ActorSheetT2K from './actorSheet.js';
import { T2K4E } from '../config.js';

/**
 * Twilight 2000 Actor Sheet for Vehicles.
 * @extends {ActorSheetT2K} Extends the T2K ActorSheet
 */
export default class ActorSheetT2KVehicle extends ActorSheetT2K {

  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'actor', 'vehicle'],
      width: 650,
      height: 715,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'crew' }],
    });
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  /** @override */
  getData() {
    const sheetData = super.getData();

    if (this.actor.type === 'vehicle') {
      this._prepareCrew(sheetData);
      this._prepareMountedWeapons(sheetData);
      sheetData.inVehicle = true;
    }

    return sheetData;
  }

  /* ------------------------------------------- */

  _prepareCrew(sheetData) {
    sheetData.crew = sheetData.data.crew.occupants.reduce((arr, o) => {
      o.actor = game.actors.get(o.id);
      // TODO cleanse unexisting actors.
      if (o.actor) arr.push(o);
      return arr;
    }, []);
    sheetData.crew.sort((o1, o2) => {
      const pos1 = T2K4E.vehicle.crewPositionFlags.indexOf(o1.position);
      const pos2 = T2K4E.vehicle.crewPositionFlags.indexOf(o2.position);
      if (pos1 < pos2) return -1;
      if (pos1 > pos2) return 1;
      // If they are at the same position, sort by their actor's names.
      if (o1.actor.name < o2.actor.name) return -1;
      if (o1.actor.name > o2.actor.name) return 1;
      return 0;
    });
    return sheetData;
  }

  /* ------------------------------------------- */

  _prepareMountedWeapons(sheetData) {
    const m = (i, slot) => i.type === 'weapon'
      && i.data.data.isMounted
      && i.data.data.mountSlot === slot;

    sheetData.mountedWeapons = {
      primary: sheetData.actor.items.filter(i => m(i, 1)),
      secondary: sheetData.actor.items.filter(i => m(i, 2)),
    };
    return sheetData;
  }

  /* ------------------------------------------- */
  /*  Crew Management                            */
  /* ------------------------------------------- */

  dropCrew(actorId) {
    const crew = game.actors.get(actorId);
    if (!crew) return;
    if (crew.type !== 'character' && crew.type !== 'npc') return;
    return this.actor.addVehicleOccupant(actorId);
  }

  /* ------------------------------------------- */
  /*  Sheet Listeners                            */
  /* ------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable.
    if (!this.options.editable) return;
    if (!this.isEditable) return;

    // Owner-only listeners.
    if (this.actor.isOwner) {
      // Crew
      html.find('.crew-edit').click(this._onCrewEdit.bind(this));
      html.find('.crew-remove').click(this._onCrewRemove.bind(this));
      html.find('.crew-expose').click(this._onExposeCrew.bind(this));
      html.find('.crew-position').change(this._onChangePosition.bind(this));
      // Items
      html.find('.item-mount').click(this._onWeaponMount.bind(this));
      html.find('.item-mount-move').click(this._onWeaponMountMove.bind(this));
    }
  }

  /* ------------------------------------------- */

  /**
   * @param {Event} event
   * @private
   */
  _onCrewEdit(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const actor = game.actors.get(crewId);
    return actor.sheet.render(true);
  }

  _onCrewRemove(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const occupants = this.actor.removeVehicleOccupant(crewId);
    return this.actor.update({ 'data.crew.occupants': occupants });
  }

  _onExposeCrew(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const position = this.actor.getVehicleOccupant(crewId)?.position;
    const exposed = elem.checked;
    return this.actor.addVehicleOccupant(crewId, position, exposed);
  }

  _onChangePosition(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const position = elem.value;
    const exposed = this.actor.getVehicleOccupant(crewId)?.exposed;
    return this.actor.addVehicleOccupant(crewId, position, exposed);
  }

  /* ------------------------------------------- */

  _onWeaponMount(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item.data.data.isMounted) {
      return item.update({ 'data.equipped': false });
    }
    else {
      return item.update({
        'data.equipped': true,
        'data.props.mounted': true,
        'data.mountSlot': 1,
      });
    }
  }

  _onWeaponMountMove(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    let slot = item.data.data.mountSlot;

    if (slot > 1) slot--;
    else slot++;

    return item.update({ 'data.mountSlot': slot });
  }
}