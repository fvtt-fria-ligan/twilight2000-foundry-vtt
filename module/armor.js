import { YearZeroRoll } from '../lib/yzur.js';

export default class Armor {
  constructor(rating, modifier = 0) {
    this.rating = rating;
    this.value = rating;
    this.modifier = modifier;
  }

  /* ------------------------------------------- */
  /*  Getters                                    */
  /* ------------------------------------------- */

  get level() {
    return this.value > 0 ? Math.max(0, this.value + this.modifier) : 0;
  }

  get penetrationLimit() {
    return this.level - 2;
  }

  get damaged() {
    return this.value < this.rating;
  }

  /* ------------------------------------------- */
  /*  Methods                                    */
  /* ------------------------------------------- */

  modify(n) {
    this._modifier = this.modifier;
    this.modifier = +n;
  }

  isPenetratedByDamage(baseDamage) {
    return baseDamage > this.penetrationLimit;
  }

  async penetration(amount, baseDamage, modifier) {
    if (modifier) this.modify(modifier);
    if (!this.isPenetratedByDamage(baseDamage)) return 0;
    amount -= this.level;
    if (amount > 0) await this.ablation();
    this.modifier = this._modifier;
    return amount;
  }

  async ablation() {
    const roll = new YearZeroRoll('1d6np');
    await roll.roll({ async: true });
    if (roll.total === 1) {
      this.value = Math.max(0, this.value - 1);
      return true;
    }
    return false;
  }
}