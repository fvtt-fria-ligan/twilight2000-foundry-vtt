/**
 * Twilight 2000 Actor Sheet.
 * @extends {ActorSheet} Extends the basic ActorSheet
 */
export default class ActorSheetT2K extends ActorSheet {

  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'main' }],
    });
  }

  /** @override */
  get template() {
    if (this.actor.type === 'npc') {
      return 'systems/t2k4e/templates/actors/character-sheet.hbs';
    }
    return `systems/t2k4e/templates/actors/${this.actor.type}-sheet.hbs`;
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  /** @override */
  getData() {
    const baseData = super.getData();
    const sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      data: baseData.actor.data.data,
      config: CONFIG.T2K4E,
    };
    return sheetData;
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
    // inputs.addBack().find('[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));

    // Item Management
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.item-equip').click(this._onItemEquip.bind(this));
    html.find('.item-backpack').click(this._onItemStore.bind(this));
    html.find('.item-mag .weapon-edit-ammo').change(this._onWeaponAmmoChange.bind(this));

    // Owner-only listeners.
    if (this.actor.isOwner) {
      html.find('.item-roll').click(this._onItemRoll.bind(this));
    }
  }

  /* ------------------------------------------- */

  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.roll();
  }

  /* ------------------------------------------- */

  _onItemCreate(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const type = elem.dataset.type;
    const itemData = {
      name: game.i18n.localize(`T2K4E.ActorSheet.NewItem.${type}`),
      type,
    };
    return this.actor.createEmbeddedDocuments('Item', [itemData])
      // Displays the sheet of the newly created item.
      .then(itmData => {
        const itemId = itmData[0].id;
        const item = this.actor.items.get(itemId);
        item.sheet.render(true);
      });
  }

  _onItemEdit(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    return this.actor.deleteEmbeddedDocuments('Item', [itemId]);
  }

  _onItemEquip(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const equipped = item.data.data.equipped;
    const updateData = { 'data.equipped': !equipped };
    if (!equipped && item.data.data.backpack) updateData['data.backpack'] = false;
    return item.update(updateData);
  }

  _onItemStore(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const stored = item.data.data.backpack;
    const updateData = { 'data.backpack': !stored };
    if (!stored && item.data.data.equipped) updateData['data.equipped'] = false;
    return item.update(updateData);
  }

  /* ------------------------------------------- */

  _onWeaponAmmoChange(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const value = +elem.value;
    return item.update({ 'data.mag.value': value });
  }

  /* ------------------------------------------- */

  /** Left-clic: +1, Right-clic: -1 */
  _onValueChange(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const min = +elem.dataset.min || 0;
    const max = +elem.dataset.max || 10;
    const field = elem.dataset.field;
    const currentCount = foundry.utils.getProperty(this.actor, `data.data.${field}`) || 0;
    let newCount = currentCount;

    if (event.type === 'click') newCount++;
    else newCount--; // contextmenu
    newCount = Math.clamped(newCount, min, max);

    return this.actor.update({ [`data.${field}`]: newCount });
  }
}