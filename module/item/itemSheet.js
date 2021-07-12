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
      inActor: this.item.actor ? true : false,
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
    const itemData = this.item.data.data;
    const ammoType = itemData.ammo;
    if (!ammoType) return {};

    const actor = this.item.actor;
    if (!actor) return {};

    return actor.itemTypes.ammunition.reduce((ammo, i) => {
      if (i.data.data.itemType === ammoType) {
        ammo[i.id] = i.detailedName;
      }
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

    // // Owner-only listeners.
    // // if (this.actor.isOwner) {
    // // }
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
}