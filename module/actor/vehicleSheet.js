import ActorSheetT2K from './actorSheet.js';

/**
 * Twilight 2000 Actor Sheet for Vehicles.
 * @extends {ActorSheetT2K} Extends the T2K ActorSheet
 */
export default class ActorSheetT2KVehicle extends ActorSheetT2K {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'actor', 'vehicle'],
      width: 650,
      height: 715,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'combat'}],
    });
  }

  /* ------------------------------------------- */

  /** @override */
  getData() {
    const sheetData = super.getData();

    if (this.actor.data.type !== 'vehicle') return sheetData;

    sheetData.inVehicle = true;

    // this._prepareVehiclePassengers(sheetData);
    this._prepareMountedWeapons(sheetData);

    // switch (this.actor.data.type) {
    // 	case 'vehicle': this._prepareVehicleItems(data); break;
    // }

    return sheetData;
  }

  _prepareMountedWeapons(sheetData) {
    const m = (i, slot) => i.type === 'weapon'
      && i.data.data.isMounted
      && i.data.data.mountSlot === slot;

    sheetData.mountedWeapons = {
      primary: sheetData.actor.items.filter(i => m(i, 1)),
      secondary: sheetData.actor.items.filter(i => m(i, 2)),
    };
  }

  // _prepareVehiclePassengers(sheetData) {
  // 	sheetData.passengers = game.actors.filter(a => ['character', 'npc'].includes(a.data.type));
  // }

  /* ------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable.
    if (!this.options.editable) return;
    if (!this.isEditable) return;

    // html.find('.stat-score .score-selector').change(this._onAttributeChange.bind(this));
    // html.find('.item-backpack').click(this._onItemStore.bind(this));
    // html.find('.item-mag .weapon-edit-ammo').change(this._onWeaponAmmoChange.bind(this));
    // html.find('.boxes-radiation').on('click contextmenu', this._onValueChange.bind(this));
    // html.find('.boxes-capacity').on('click contextmenu', this._onCapacityChange.bind(this));

    // Owner-only listeners.
    if (this.actor.isOwner) {
      html.find('.item-mount').click(this._onWeaponMount.bind(this));
      html.find('.item-mount-move').click(this._onWeaponMountMove.bind(this));
    }
  }

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