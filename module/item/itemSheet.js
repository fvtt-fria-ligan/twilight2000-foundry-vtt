/**
 * Twilight 2000 Item Sheet.
 * @extends {ItemSheet} Extends the basic ItemSheet
 */
export default class ItemSheetT2K extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'item'],
      width: 400,
      height: 520,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'features' }],
    });
  }

  /** @override */
  get template() {
    return `systems/t2k4e/templates/items/${this.item.type}-sheet.hbs`;
  }

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
    return sheetData;
  }

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