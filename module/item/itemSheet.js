/**
 * Twilight 2000 Item Sheet.
 * @extends {ItemSheet} Extends the basic ItemSheet
 */
export default class ItemSheetT2K extends ItemSheet {

  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'item'],
      width: 400,
      height: 550,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'features' }],
    });
  }

  /** @override */
  get template() {
    return `systems/t2k4e/templates/items/${this.item.type}-sheet.hbs`;
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  /** @override */
  getData() {
    const baseData = super.getData();
    const sheetData = {
      owner: this.item.isOwner,
      editable: this.isEditable,
      item: baseData.item,
      data: baseData.item.data.data,
      config: CONFIG.T2K4E,
      hideWeaponProps: !game.user.isGM && game.settings.get('t2k4e', 'hideWeaponProps'),
      // QoL getters
      inActor: this.item.actor ? true : false,
      inVehicle: this.item.actor?.type === 'vehicle',
    };

    if (['weapon', 'ammunition'].includes(this.item.type)) {
      // Potential Ammo Targets
      sheetData.availableAmmoTypes = this._getAvailableAmmoTypes();
    }
    if (this.item.type === 'weapon') {
      sheetData.ammunitionTargets = this._getItemAmmunitionTargets();
    }

    return sheetData;
  }

  /* ------------------------------------------- */

  _getAvailableAmmoTypes() {
    let ammoTypes = this._extractAmmoTypes(game.items.contents);
    const actor = this.item.actor;
    if (actor) {
      ammoTypes = this._extractAmmoTypes(actor.items.contents, ammoTypes);
    }
    return [...ammoTypes].sort();
  }

  /* ------------------------------------------- */

  /**
   * Extracts the ammo types stored in the items provided.
   * @param   {Item[]} items      List of items
   * @param   {Set}   [ammoTypes] A collection of ammo types
   * @returns {Set<string>} Returns a Set object because it removes the duplicates.
   * @private
   */
  _extractAmmoTypes(items = [], ammoTypes = new Set()) {
    if (!items.length) return ammoTypes;
    return items.reduce((ammo, i) => {
      if (i.type === 'ammunition') {
        ammo.add(i.data.data.itemType);
      }
      else if (i.type === 'weapon') {
        const t = i.data.data.ammo;
        if (t) ammo.add(t);
      }
      return ammo;
    }, ammoTypes);
  }

  /* ------------------------------------------- */

  /**
   * Gets the valid item consumption targets which exist on the actor.
   * @return {{string: string}} An object of potential consumption targets
   * @private
   */
  _getItemAmmunitionTargets() {
    // TODO clean this code
    const itemData = this.item.data.data;
    // const ammoType = itemData.ammo;
    // if (!ammoType) return {};

    const actor = this.item.actor;
    if (!actor) return {};

    return actor.itemTypes.ammunition.reduce((ammo, i) => {
      // if (i.data.data.itemType === ammoType) {
      ammo[i.id] = i.detailedName;
      // }
      return ammo;
    }, { [this.item.id]: `${this.item.name} (${itemData.qty})` });
  }

  /* ------------------------------------------- */
  /*  Sheet Listeners                            */
  /* ------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Editable-only Listeners
    if (!this.options.editable) return;
    if (!this.isEditable) return;

    // Input Focus & Update
    const inputs = html.find('input');
    inputs.focus(ev => ev.currentTarget.select());
    inputs.addBack().find('[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));

    // Roll Modifiers
    html.find('.add-modifier').click(this._onAddModifier.bind(this));
    html.find('.delete-modifier').click(this._onDeleteModifier.bind(this));

    // Ammo Generation
    if (this.item.actor) {
      html.find('button.create-ammo').click(this._onCreateAmmo.bind(this));
    }
  }

  /* ------------------------------------------- */

  /**
   * Changes the value based on an input delta.
   * @param {Event} event
   */
  _onChangeInputDelta(event) {
    event.preventDefault();
    const input = event.target;
    const value = input.value;
    if (value[0] === '+' || value[0] === '-') {
      const delta = parseFloat(value);
      input.value = foundry.utils.getProperty(this.item.data, input.name) + delta;
    }
    else if (value[0] === '=') {
      input.value = value.slice(1);
    }
  }

  /* ------------------------------------------- */

  _onAddModifier(event) {
    event.preventDefault();
    const rollModifiers = foundry.utils.duplicate(this.item.data.data.rollModifiers ?? {});
    const modifierId = Math.max(-1, ...Object.getOwnPropertyNames(rollModifiers)) + 1;
    return this.item.update({ [`data.rollModifiers.${modifierId}`]: { name: '', value: '+1' } });
  }

  _onDeleteModifier(event) {
    event.preventDefault();
    const modifierId = event.currentTarget.dataset.modifierId;
    if (this.item.data.data.rollModifiers[modifierId]) {
      this.item.update({ [`data.rollModifiers.-=${modifierId}`]: null });
    }
  }

  /* ------------------------------------------- */

  async _onCreateAmmo(event) {
    event.preventDefault();
    if (!this.item.hasAmmo) return;
    if (!this.item.actor) return;

    const button = event.currentTarget;
    button.disabled = true;

    let ammo = this.item.data.data.ammo;
    if (ammo.match(/\d{2}$/)) ammo += 'mm';

    const size = this.item.data.data.mag.max;
    const mag = size > 40 ? (size > 55 ? (size > 150 ? 'Box' : 'Belt') : 'Drum') : 'Mag';

    const itemData = {
      name: `${ammo}, ${size}-round ${mag}`,
      type: 'ammunition',
      'data.ammo': { value: size, max: size },
    };

    const [ammunition] = await this.item.actor.createEmbeddedDocuments('Item', [itemData]);
    const msg = game.i18n.format('T2K4E.ItemSheet.CreateAmmoNotif', {
      ammo: ammunition.name,
      weapon: this.item.name,
    });
    ui.notifications.info(msg);
    await this.item.update({ 'data.mag.target': ammunition.id });

    button.disabled = false;
    return ammunition;
  }
}