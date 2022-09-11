/* eslint-disable no-shadow */
/**
 * A class representing a roll modifier with many properties and automatic label.
 * @class
 */
export default class Modifier {
  /**
   * @param {string}        key     The key that will be parsed to identify the modifier.
   * @param {number|string} value   The modification value of the modifier. (If a string, will be parsed)
   * @param {Item}         [item]   The item that is the source of the modifier.
   * @param {boolean}      [active] Whether the modifier is active.
   * @param {string}       [name]   Alternative name for the modifier, if you don't want to use the item's name.
   * @param {string}       [type]   Alternative type for the modifier, if you don't want to use the item's type.
   * @param {string}       [description]   Alternative description for the modifier.
   */
  constructor(key, value, item = {}, { active, name, type, description } = {}) {
    /**
     * The item that holds the modifier.
     * @type {Item}
     */
    this.item = item;

    this._name = name ?? item.name;
    this._type = type ?? item.type;
    this._description = description ?? item.data?.data?.description;

    /**
     * The key that will be parsed to identify the modifier.
     * @type {string}
     * @private
     */
    this._key = key;

    /**
     * The modification value of the modifier.
     * @type {number}
     */
    this.value = +value || 0;

    const keys = key.split('.');
    if (keys.length !== 2) {
      throw new SyntaxError(`Modifier "${this.name}" | key#length not equal to 2: "${key}" | You must choose a name.`);
    }

    /**
     * The category of the target. Either "attribute", "skill", "action", "constant", or "travel".
     * @type {string}
     */
    this.category = keys[0];
    if (!this.constructor.ALLOWED_CATEGORIES.includes(this.category)) {
      throw new TypeError(`Modifier "${this.name}" | Illegal target category: "${this.category}"`);
    }

    /**
     * The target that is modified by the modifier.
     * @type {string}
     */
    this.target = keys[1];

    /**
     * Whether the modifier is active.
     * @type {boolean}
     */
    this.active = active ?? (this.value <= 0);
  }

  /* ------------------------------------------- */
  /*  Getters                                    */
  /* ------------------------------------------- */

  /**
   * The item's name that is the source of the modifier.
   * @type {string}
   * @readonly
   */
  get name() {
    return this._name ?? this.item?.name;
  }

  /**
   * The Item's type that was the source of the modifier.
   * Useful for sorting.
   * @type {string}
   * @readonly
   */
  get type() {
    return this._type ?? this.item?.type;
  }

  /**
   * The value, with a sign.
   * @type {string|null}
   * @readonly
   */
  get signedValue() {
    if (this.value !== 0 && !this.value) return null;
    return (this.value >= 0 ? '+' : '−') + Math.abs(this.value);
  }

  /**
   * The localized label of the modifier.
   * @type {string}
   * @readonly
   */
  get label() {
    return this.name + (this.value ? ` ${this.signedValue}` : '');
  }

  /**
   * The description of the item that is the source of the modifier.
   * @type {string}
   * @readonly
   */
  get description() {
    const str = this._description ?? this.item.data?.data?.description ?? '';
    return str.replace(/<[^>]*>?/gm, '');
  }
}

/* ------------------------------------------- */

Modifier.ALLOWED_CATEGORIES = [
  'attribute',
  'skill',
  'action',
  'constant',
  'travel',
];