import { YearZeroRoll } from 'yzur';

export default class Armor {
  // eslint-disable-next-line no-shadow
  constructor(rating, name, modifier = 0) {
    this.rating = rating;
    this.value = rating;
    this.name = name ?? 'Armor';
    this.modifier = modifier;
    this.penetrated = false;
    this.damage = 0;
  }

  /* ------------------------------------------- */
  /*  Getters                                    */
  /* ------------------------------------------- */

  get label() {
    return `${this.name} [${this.rating}]`;
  }

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
    const initialAmount = amount;
    if (modifier) this.modify(modifier);
    if (!this.isPenetratedByDamage(baseDamage)) amount = 0;
    else amount = Math.max(0, amount - this.level);
    this.damage += initialAmount - amount;
    if (amount > 0) {
      this.penetrated = true;
      await this.ablation();
    }
    this.modify(this._modifier);
    return amount;
  }

  async ablation() {
    const roll = new YearZeroRoll('1d6np');
    await roll.roll();
    if (roll.total === 1) {
      this.value = Math.max(0, this.value - 1);
      return true;
    }
    return false;
  }
}
