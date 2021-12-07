/*
 * ===============================================================================
 *  YZUR
 *    YEAR ZERO UNIVERSAL DICE ROLLER FOR THE FOUNDRY VTT
 * ===============================================================================
 * Author: @Stefouch
 * Version: 2.1.1     for:     Foundry VTT V8 (0.8.8)
 * Licence: MIT
 * ===============================================================================
 * Content:
 * 
 * - YearZeroRollManager: Interface for registering dice.
 * 
 * - YearZeroRoll: Custom implementation of the default Foundry Roll class,
 *     with many extra getters and utility functions.
 * 
 * - YearZeroDie: Custom implementation of the default Foundry DieTerm class,
 *     also with many extra getters.
 * 
 * - (Base/Skill/Gear/etc..)Die: Extends of the YearZeroDie class with specific
 *     DENOMINATION and LOCKED_VALUE constants.
 * 
 * - CONFIG.YZUR.game: The name of the game stored in the Foundry config.
 * 
 * - CONFIG.YZUR.DICE.ICONS.{..}: The dice labels stored in the Foundry config.
 * 
 * ===============================================================================
 */


/* -------------------------------------------- */
/*  Definitions                                 */
/* -------------------------------------------- */

/**
 * Defines a Year Zero game.
 * - `myz`: Mutant Year Zero
 * - `fbl`: Forbidden Lands
 * - `alien`: Alien RPG
 * - `cor`: Coriolis The Third Horizon
 * - `tales`: Tales From the Loop & Things From the Flood
 * - `vae`: Vaesen
 * - `t2k`: Twilight 2000
 * @typedef {string} GameTypeString
 */

/**
 * Defines a type of a YZ die.
 * - `base`: Base Die (locked on 1 and 6, trauma on 1)
 * - `skill`: Skill Die (locked on 6)
 * - `gear`: Gear Die (locked on 1 and 6, gear damage on 1)
 * - `neg`: Negative Die (locked on 6, negative success)
 * - `stress`: Stress Die (locked on 1 and 6, stress, panic)
 * - `artoD8`: D8 Artifact Die (locked on 6+, multiple successes)
 * - `artoD10`: D10 Artifact Die (locked on 6+, multiple successes)
 * - `artoD12`: D12 Artifact Die (locked on 6+, multiple successes)
 * - `a`: T2K D12 Die (locked on 1 and 6+, multiple successes)
 * - `b`: T2K D10 Die (locked on 1 and 6+, multiple successes)
 * - `c`: T2K D8 Die (locked on 1 and 6+)
 * - `d`: T2K D6 Die (locked on 1 and 6+)
 * - `ammo`: T2K Ammo Die (locked on 1 and 6, not success but hit)
 * - `loc`: Location Die
 * @typedef {string} DieTypeString
 */

/**
 * Defines a YZ die's denomination.
 * @typedef {string} DieDeno
 */

/**
 * An object with quantities of dice.
 * @typedef {Object<DieTypeString, number>} DiceQuantities
 * @property {?number}  base     The quantity of base dice
 * @property {?number}  skill    The quantity of skill dice
 * @property {?number}  gear     The quantity of gear dice
 * @property {?number}  neg      The quantity of negative dice
 * @property {?number}  stress   The quantity of stress dice
 * @property {?number}  artoD8   The quantity of artoD8 dice
 * @property {?number}  artoD10  The quantity of artoD10 dice
 * @property {?number}  artoD12  The quantity of artoD12 dice
 * @property {?number}  a        The quantity of T2K D12 dice
 * @property {?number}  b        The quantity of T2K D10 dice
 * @property {?number}  c        The quantity of T2K D8 dice
 * @property {?number}  d        The quantity of T2K D6 dice
 * @property {?number}  ammo     The quantity of ammo dice
 * @property {?number}  loc      The quantity of location dice
 */


/* -------------------------------------------- */
/*  Custom Dice Registration                    */
/* -------------------------------------------- */

/**
 * Interface for registering Year Zero dice.
 * 
 * To register the game and its dice,
 * call the static `YearZeroRollManager.register()` method
 * at the start of the `init` Hooks.
 * 
 * @abstract
 * @interface
 * 
 * @example
 * import { YearZeroRollManager } from './lib/yzur.js';
 * Hooks.once('init', function() {
 *   YearZeroRollManager.register('yourgame', { options });
 *   ...
 * });
 * 
 */
export class YearZeroRollManager {
  /**
   * Registers the Year Zero dice for the specified game
   * 
   * You must call this method in `Hooks.once('init')`.
   * 
   * @param {GameTypeString}  yzGame  The game used (for the choice of die types to register).
   * @param {string}         [config] Custom config to merge with the initial config.
   * @static
   */
  static register(yzGame, config) {
    // Registers the config.
    YearZeroRollManager.registerConfig(config);
    // Registers the YZ game.
    YearZeroRollManager._initialize(yzGame);
    // Registers the dice.
    YearZeroRollManager.registerDice(yzGame);
    console.log(`${YearZeroRollManager.name} | Registration complete!`);
  }

  /**
   * Registers the Year Zero Universal Roller config.
   * *(See the config details at the very bottom of this file.)*
   * @param {string} [config] Custom config to merge with the initial config.
   * @static
   */
  static registerConfig(config) {
    CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config);
  }

  /**
   * Registers all the Year Zero Dice.
   * @param {?GameTypeString} yzGame The game used (for the choice of die types to register)
   * @static
   */
  static registerDice(yzGame) {
    // Registers all the dice if `game` is omitted.
    if (!yzGame) throw new SyntaxError(`${YearZeroRollManager.name} | A game must be specified for the registration.`);

    // Checks the game validity.
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Registers the game's dice.
    const diceTypes = YearZeroRollManager.DIE_TYPES_MAP[yzGame];
    for (const type of diceTypes) YearZeroRollManager.registerDie(type);

    // Finally, registers our custom Roll class for Year Zero games.
    YearZeroRollManager.registerRoll();
  }

  /**
   * Registers the roll.
   * @param {class}  [cls] YearZeroRoll class
   * @param {number} [i=0] Index of the registration
   * @static
   */
  static registerRoll(cls = YearZeroRoll, i = 0) {
    CONFIG.Dice.rolls[i] = cls;
    CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.ROLL.chatTemplate;
    CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.ROLL.tooltipTemplate;
    CONFIG.YZUR.ROLL.index = i;
  }

  /**
   * Registers a die in Foundry.
   * @param {DieTypeString} type Type of die to register
   * @static
   */
  static registerDie(type) {
    const cls = CONFIG.YZUR.DICE.DIE_TYPES[type];
    if (!cls) throw new DieTypeError(type);

    const deno = cls.DENOMINATION;
    if (!deno) {
      throw new SyntaxError(`Undefined DENOMINATION for "${cls.name}".`);
    }

    // Registers the die in the Foundry CONFIG.
    const reg = CONFIG.Dice.terms[deno];
    if (reg) {
      console.warn(
        `${YearZeroRollManager.name} | Die Registration: "${deno}" | Overwritting ${reg.name} with "${cls.name}".`,
      );
    }
    else {
      console.log(`${YearZeroRollManager.name} | Die Registration: "${deno}" with ${cls.name}.`);
    }
    CONFIG.Dice.terms[deno] = cls;
  }

  /**
   * @param {GameTypeString} yzGame The game used (for the choice of die types to register)
   * @private
   * @static
   */
  static _initialize(yzGame) {
    if (!CONFIG.YZUR) throw new ReferenceError('CONFIG.YZUR does not exists!');
    if (CONFIG.YZUR.game) {
      console.warn(
        `${YearZeroRollManager.name} | Overwritting the default Year Zero game "${CONFIG.YZUR.game}" with: "${yzGame}"`,
      );
    }
    CONFIG.YZUR.game = yzGame;
    console.log(`${YearZeroRollManager.name} | The name of the Year Zero game is: "${yzGame}".`);
  }
}

/* -------------------------------------------- */

/**
 * Die Types mapped with Games.
 * Used by the register method to choose which dice to activate.
 * @type {Object<GameTypeString, DieTypeString[]>}
 * @constant
 */
YearZeroRollManager.DIE_TYPES_MAP = {
  // Mutant Year Zero
  'myz': ['base', 'skill', 'gear', 'neg'],
  // Forbidden Lands
  'fbl': ['base', 'skill', 'gear', 'neg', 'artoD8', 'artoD10', 'artoD12'],
  // Alien RPG
  'alien': ['skill', 'stress'],
  // Tales From the Loop
  'tales': ['skill'],
  // Coriolis
  'cor': ['skill'],
  // Vaesen
  'vae': ['skill'],
  // Twilight 2000
  't2k': ['a', 'b', 'c', 'd', 'ammo', 'loc'],
};

/** @type {GameTypeString} */
YearZeroRollManager.GAMES = Object.keys(YearZeroRollManager.DIE_TYPES_MAP);

// TODO clean this code
// YearZeroRollManager.DIE_TYPES_SWAP = {
//   'alien': { base: 'skill', gear: 'skill' },
//   'tales': { base: 'skill', gear: 'skill' },
//   'cor': { base: 'skill', gear: 'skill' },
//   'vae': { base: 'skill', gear: 'skill' },
//   't2k': { base: 'b', skill: 'd', gear: 'ammo' },
// };

/* -------------------------------------------- */
/*  Custom Roll Class                           */
/* -------------------------------------------- */

/**
 * Custom Roll class for Year Zero games.
 * @extends {Roll} The Foundry Roll class
 */
export class YearZeroRoll extends Roll {
  /**
   * @param {string} formula  The string formula to parse
   * @param {Object} data     The data object against which to parse attributes within the formula
   * @param {string} data.game     The game used
   * @param {string} data.name     The name of the roll
   * @param {number} data.maxPush  The maximum number of times the roll can be pushed
   */
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
    if (!this.game) this.game = CONFIG.YZUR.game ?? 'myz';
    if (data.maxPush != undefined) this.maxPush = data.maxPush;
  }

  /* -------------------------------------------- */

  /**
   * The game used.
   * @type {string}
   * @readonly
   */
  get game() { return this.data.game; }
  set game(yzGame) { this.data.game = yzGame; }

  /**
   * The name of the roll.
   * @type {string}
   * @readonly
   */
  get name() { return this.data.name; }
  set name(str) { this.data.name = str; }

  /**
   * The maximum number of pushes.
   * @type {number}
   */
  set maxPush(n) {
    this.data.maxPush = n;
    for (const t of this.terms) {
      if (t instanceof YearZeroDie) {
        t.maxPush = n;
      }
    }
  }
  // TODO clean
  // get maxPush() { return this.data.maxPush; }
  get maxPush() {
    return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, 0);
  }

  /**
   * The total number of dice in the roll.
   * @type {number}
   * @readonly
   */
  get size() {
    return this.terms.reduce((s, t) => t instanceof YearZeroDie ? s + t.number : s, 0);
  }

  /**
   * The number of times the roll has been pushed.
   * @type {number}
   * @readonly
   */
  get pushCount() {
    return this.terms.reduce((c, t) => Math.max(c, t.pushCount || 0), 0);
  }

  /**
   * Whether the roll was pushed or not.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.pushCount > 0;
  }

  /**
   * Tells if the roll is pushable.
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    return (
      this.pushCount < this.maxPush
      && this.terms.some(t => t.pushable)
      // && !this.mishap
    );
  }

  /**
   * The quantity of successes.
   * @type {number}
   * @readonly
   */
  get successCount() {
    return this.terms.reduce((sc, t) => sc + (t.success ?? 0), 0);
  }

  /**
   * The quantity of ones (banes).
   * @type {number}
   * @readonly
   */
  get baneCount() {
    // return this.terms.reduce((bc, t) => bc + t.failure, 0);
    const banableTypes = ['base', 'gear', 'stress', 'ammo'];
    let count = 0;
    for (const bt of banableTypes) {
      count += this.count(bt, 1);
    }
    return count;
  }

  /**
   * The quantity of traumas ("1" on base dice).
   * @type {number}
   * @readonly
   */
  get attributeTrauma() {
    return this.count('base', 1);
  }

  /**
   * The quantity of gear damage ("1" on gear dice).
   * @type {number}
   * @readonly
   */
  get gearDamage() {
    return this.count('gear', 1);
  }

  /**
   * The quantity of stress dice.
   * @type {number}
   * @readonly
   */
  get stress() {
    return this.count('stress');
  }

  /**
   * The quantity of panic ("1" on stress dice).
   * @type {number}
   * @readonly
   */
  get panic() {
    return this.count('stress', 1);
  }

  /**
   * Tells if the roll is a mishap (double 1's).
   * @type {boolean}
   * @readonly
   */
  get mishap() {
    // if (this.game !== 't2k') return false;
    // return this.baneCount >= 2 || this.baneCount >= this.size;
    console.warn('YZRoll | YearZeroRoll#mishap is deprecated.');
    return false;
  }

  /**
   * The quantity of ammo spent. Equal to the sum of the ammo dice.
   * @type {number}
   * @readonly
   */
  get ammoSpent() {
    const mt = this.getTerms('ammo');
    if (!mt.length) return 0;
    return mt.reduce((tot, t) => tot + t.values.reduce((a, b) => a + b, 0), 0);
  }

  /**
   * The quantity of successes on ammo dice.
   * @type {number}
   * @readonly
   */
  get hitCount() {
    return this.count('ammo', 6);
  }

  /**
   * The quantity of ones (banes) on base dice and ammo dice.
   * @type {number}
   * @readonly
   */
  get jamCount() {
    const n = this.count('ammo', 1);
    return n > 0 ? n + this.attributeTrauma : 0;
  }

  /**
   * Tells if the roll caused a weapon jam.
   * @type {boolean}
   * @readonly
   */
  get jammed() {
    return this.pushed ? (this.jamCount >= 2) : false;
  }

  /**
   * The total successes produced by base dice.
   * @type {number}
   * @readonly
   */
  get baseSuccessQty() {
    return this.successCount - this.hitCount;
  }

  /**
   * The rolled hit locations.
   * @type {number[]}
   * @readonly
   */
  get hitLocations() {
    const lt = this.getTerms('loc');
    if (!lt.length) return [];
    return lt.reduce((tot, t) => tot.concat(t.values), []);
  }

  /**
   * The best rolled hit location.
   * @type {number}
   * @readonly
   */
  get bestHitLocation() {
    if (!this.hitLocations.length) return undefined;
    return Math.max(...this.hitLocations);
  }

  /* -------------------------------------------- */

  /**
   * Generates a roll based on the number of dice.
   * @param {DiceQuantities}  dice        An object with quantities of dice
   * @param {string}         [title]      The name of the roll
   * @param {GameTypeString} [yzGame]     The game used
   * @param {number}         [maxPush=1]  The maximum number of pushes
   * @param {boolean}        [push=false] Whether to add a push modifier to the roll
   * @override
   */
  static createFromDiceQuantities(dice = {}, { title, yzGame = null, maxPush = 1, push = false } = {}) {
    // Checks the game.
    yzGame = yzGame ?? CONFIG.YZUR?.game;
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Builds the formula.
    const out = [];
    for (const [type, n] of Object.entries(dice)) {
      if (n <= 0) continue;
      let deno = CONFIG.YZUR.DICE.DIE_TYPES[type].DENOMINATION;
      const cls = CONFIG.Dice.terms[deno];
      deno = cls.DENOMINATION;
      const str = `${n}d${deno}${push ? 'p' : ''}`;
      out.push(str);
    }
    let formula = out.join(' + ');

    if (!YearZeroRoll.validate(formula)) {
      // throw new RollError(`Invalid roll formula: "${formula}"`, dice);
      console.warn(`${YearZeroRoll.name} | Invalid roll formula: "${formula}"`);
      formula = yzGame === 't2k' ? '1d6' : '1ds';
    }

    // Creates the roll.
    const roll = new YearZeroRoll(formula, { name: title, game: yzGame, maxPush });
    if (CONFIG.debug.dice) console.log(roll);
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Pushes the roll, following the YZ rules.
   * @param {DiceQuantities} extraDice
   * @param {object} [options={}] Options which inform how the Roll is evaluated
   * @param {boolean} [options.async=false] Evaluate the roll asynchronously, receiving a Promise as the returned value.
   * @returns {YearZeroRoll} The roll instance, pushed
   */
  // TODO support for additional dice when pushing
  push2(extraDice = {}, { async } = {}) {
    // // Step 0 — Prepares extra dice.
    // const extraRoll = YearZeroRoll.createFromDiceQuantities(extraDice);
    // extraRoll.roll();
    // // Step
    // if (!this._evaluated) this.evaluate();
    // if (!this.pushable) return this;
  }
  async push({ async } = {}) {
    if (!this._evaluated) await this.evaluate({ async });
    if (!this.pushable) return this;

    // Step 1 — Pushes the terms.
    this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t);

    // Step 2 — Re-evaluates all pushed terms.
    //   The evaluate() method iterates each terms and runs only
    //   the die's own evaluate() method on new (pushed) dice.
    this._evaluated = false;
    await this.evaluate({ async });

    return this;
  }

  /* -------------------------------------------- */

  /**
   * Gets all the dice terms of a certain type.
   * @param {DieTypeString} type Die type to search
   * @returns {YearZeroDie[]|DiceTerm[]}
   */
  getTerms(type) {
    return this.terms.filter(t => t.type === type);
  }

  /**
   * Counts the values of a certain type in the roll.
   * If `seed` is omitted, counts all the dice of a certain type.
   * @param {DieTypeString} type  The type of the die
   * @param {number}       [seed] The number to search, if any
   * @param {string}       [comparison='='] The comparison to use against the seed: `>`, `<`, or `=`
   * @returns {number} Total count
   */
  count(type, seed, comparison = '=') {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        for (const r of t.results) {
          if (!r.active) continue;
          if (seed != null) {
            if (comparison === '>') {
              if (r.result > seed) c++;
            }
            else if (comparison === '<') {
              if (r.result < seed) c++;
            }
            else if (r.result === seed) {
              c++;
            }
          }
          else {
            c += t.number;
          }
        }
      }
      return c;
    }, 0);
  }

  /**
   * Gets the quantities of each die type.
   * @returns {DiceQuantities}
   */
  // TODO Why did I put a todo tag here?
  getDiceQuantities() {
    return this.terms.reduce((dice, t) => {
      if (t instanceof YearZeroDie) {
        const clsName = t.constructor.name;
        const type = CONFIG.YZUR.DICE.DIE_TYPES_BY_CLASS[clsName];
        if (type) dice[type] = t.number;
      }
      return dice;
    }, {});
  }

  /* -------------------------------------------- */

  /**
   * Applies a difficulty modifier to the roll.
   * @param {number} mod Difficulty modifier (bonus or malus)
   * @returns {YearZeroRoll} A new roll instance, modified
   */
  modify(mod) {
    // Exits early if no modifier.
    if (!mod) return this.duplicate();

    // Gets the dice quantities.
    const dice = this.getDiceQuantities();

    let occurenceNb = 0;
    while (mod !== 0) {
      // Failsafe – Watches the number of occurences to avoid infinite loops.
      occurenceNb++;
      if (occurenceNb >= 100) throw new RangeError(`${this.constructor.name} | Infinite modify loop!`);

      // TWILIGHT 2000
      if (this.game === 't2k') {
        const dieTypes = ['d', 'c', 'b', 'a'];

        // Creates a dice pool array and finds the total quantities of each die.
        const pool = Object.entries(dice).reduce((arr, [k, v]) => {
          if (dieTypes.includes(k)) {
            for (; v > 0; v--) arr.push(k);
          }
          return arr;
        }, []);
        const n = pool.length;

        // Early exits.
        if (mod > 0) {
          if (n > 2) break;
          if (pool.filter(t => t === 'a').length >= 2) break;
          if (n === 1) {
            dice.d += 1;
            mod--;
            if (mod === 0) break;
            pool.push('d');
          }
        }
        else if (n === 0) {
          dice.d = 1;
          break;
        }
        else if (n === 1 && pool.includes('d')) {
          break;
        }
        else if (n === 2 && pool.filter(t => t === 'd').length >= 2) {
          dice.d = 1;
          break;
        }

        // Initializes null dice.
        for (const type of dieTypes) if (!dice[type]) dice[type] = 0;

        // Gets the die to modify.
        // For a positive modifier, we take the lowest die.
        // For a negative modifier, we take the highest one.
        const die = pool.reduce((a, b) => {
          if (mod > 0) {
            if (b === 'a') return a;
            return a > b ? a : b;
          }
          return a < b ? a : b;
        }, undefined);

        // Modifies the range.
        const currentRangeIndex = dieTypes.indexOf(die);
        let newDie;
        if (currentRangeIndex >= 0) {
          var temp_mod = 0;
          // Increase or decrease just by one and modify `mod` accordingly 
          if (mod > 0) {
            temp_mod = 1;
            mod--;
          } else {
            temp_mod = -1;
            mod++;
          }
          const maxRangeIndex = dieTypes.length - 1;
          const rangeIndex = currentRangeIndex + temp_mod;
          const newRangeIndex = Math.clamped(rangeIndex, 0, maxRangeIndex);
          newDie = dieTypes[newRangeIndex];
          dice[die]--;
          dice[newDie]++;
        }
      }
      // MUTANT YEAR ZERO & FORBIDDEN LANDS
      else if (this.game === 'myz' || this.game === 'fbl') {
        // Balances skill & neg dice.
        if (dice.skill > 0 && dice.neg > 0) {
          while (dice.skill > 0 && dice.neg > 0) {
            dice.skill--;
            dice.neg--;
          }
        }
        if (!dice.skill) dice.skill = 0;
        const neg = Math.max(0, -mod - dice.skill);
        dice.skill = Math.max(0, dice.skill + mod);
        if (neg > 0) {
          if (!dice.neg) dice.neg = 0;
          dice.neg += neg;
        }
        mod = 0;
      }
      // ALL OTHER GAMES
      else {
        if (!dice.skill) dice.skill = 0;
        dice.skill = Math.max(1, dice.skill + mod);
        mod = 0;
      }
    }

    // Builds the new roll instance.
    return YearZeroRoll.createFromDiceQuantities(dice, {
      yzGame: this.game,
      maxPush: this.maxPush,
      title: this.name,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData())
    // ==>
      .sort((a, b) => {
        const sorts = CONFIG?.YZUR?.CHAT?.diceSorting
          || YZUR.CHAT.diceSorting
          || [];
        if (!sorts.length) return 0;
        const at = sorts.indexOf(a.type);
        const bt = sorts.indexOf(b.type);
        return at - bt;
      });
    // <==
    // TODO clean this commented-out code at next Foundry version.
    // const parts = this.dice.map(d => {
    //   const cls = d.constructor;
    //   return {
    //     formula: d.formula,
    //     total: d.total,
    //     faces: d.faces,
    //     // ==>
    //     // // flavor: d.options.flavor,
    //     flavor: d.options.flavor || (
    //       CONFIG.YZUR?.DICE?.localizeDieTypes
    //         ? game.i18n.localize(`YZUR.DIETYPES.${cls.name}`)
    //         : null
    //     ),
    //     number: d.number,
    //     // // rolls: d.results.map(r => {
    //     rolls: d.results.map((r, i) => {
    //       // <==
    //       const hasSuccess = r.success !== undefined;
    //       const hasFailure = r.failure !== undefined;
    //       // ==>
    //       // // const isMax = r.result === d.faces;
    //       // // const isMin = r.result === 1;
    //       let isMax = false, isMin = false;
    //       if (d.type === 'neg') {
    //         isMax = false;
    //         isMin = r.result === 6;
    //       }
    //       else {
    //         isMax = r.result === d.faces || r.count >= 1;
    //         isMin = r.result === 1 && d.type !== 'skill' && d.type !== 'loc';
    //       }
    //       // <==
    //       return {
    //         result: cls.getResultLabel(r.result),
    //         // ==>
    //         row: r.indexPush,
    //         col: r.indexResult,
    //         // <==
    //         classes: [
    //           cls.name.toLowerCase(),
    //           'd' + d.faces,
    //           r.success ? 'success' : null,
    //           r.failure ? 'failure' : null,
    //           r.rerolled ? 'rerolled' : null,
    //           r.exploded ? 'exploded' : null,
    //           r.discarded ? 'discarded' : null,
    //           // ==>
    //           r.pushed ? 'pushed' : null,
    //           // <==
    //           !(hasSuccess || hasFailure) && isMin ? 'min' : null,
    //           !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    //         ].filter(c => c).join(' '),
    //       };
    //     }),
    //   };
    // });
    // START MODIFIED PART ==>
    if (this.pushed) {
      // Converts "parts.rolls" into a matrix.
      for (const part of parts) {
        // Builds the matrix;
        const matrix = [];
        const n = part.number;
        let p = this.pushCount;
        for (; p >= 0; p--) matrix[p] = new Array(n).fill(undefined);

        // Fills the matrix.
        for (const r of part.rolls) {
          const row = r.row || 0;
          const col = r.col || 0;
          matrix[row][col] = r;
        }
        part.rolls = matrix;
      }
    }
    // // return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts,
      pushed: this.pushed,
      pushCounts: this.pushed
        ? [...Array(this.pushCount + 1).keys()].sort((a, b) => b - a)
        : undefined,
      config: CONFIG.YZUR ?? {},
    });
    // <== END MODIFIED PART
  }

  /* -------------------------------------------- */

  /**
   * Renders the infos of a Year Zero roll.
   * @param {string} [template] The path to the template
   * @returns {Promise<HTMLElement>}
   */
  getRollInfos(template = null) {
    template = template ?? CONFIG.YZUR?.ROLL?.infosTemplate;
    const context = { roll: this };
    return renderTemplate(template, context);
  }

  /* -------------------------------------------- */

  /** @override */
  async render(chatOptions = {}) {
    if (CONFIG.debug.dice) console.warn(this);

    chatOptions = foundry.utils.mergeObject({
      user: game.user.id,
      flavor: this.name,
      template: this.constructor.CHAT_TEMPLATE,
      blind: false,
    }, chatOptions);
    const isPrivate = chatOptions.isPrivate;

    // Executes the roll, if needed.
    if (!this._evaluated) await this.evaluate();

    // Defines chat data.
    const chatData = {
      formula: isPrivate ? '???' : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
      success: isPrivate ? '?' : this.successCount,
      showInfos: isPrivate ? false : CONFIG.YZUR?.CHAT?.showInfos,
      infos: isPrivate ? null : await this.getRollInfos(chatOptions.infosTemplate),
      pushable: isPrivate ? false : this.pushable,
      roll: this,
    };

    // Renders the roll display template.
    return renderTemplate(chatOptions.template, chatData);
  }

  /* -------------------------------------------- */

  /** @override */
  async toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: this.total,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      // sound: CONFIG.sounds.dice, // Already added in super.
    }, messageData);
    // messageData.roll = this; // Already added in super.
    return await super.toMessage(messageData, { rollMode, create });
  }

  /* -------------------------------------------- */

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll.data = data.data ?? {};
    return roll;
  }

  /** @override */
  toJSON() {
    return {
      ...super.toJSON(),
      data: this.data,
    };
  }

  /**
   * Creates a copy of the roll.
   * @returns {YearZeroRoll} A copy of this roll instance
   */
  duplicate() {
    return this.constructor.fromData(this.toJSON());
  }
}

/* -------------------------------------------- */
/*  Custom Dice classes                         */
/* -------------------------------------------- */

export class YearZeroDie extends Die {
  constructor(termData = {}) {
    termData.faces = termData.faces || 6;
    super(termData);

    if (this.maxPush == undefined) {
      this.maxPush = termData.maxPush ?? 1;
    }
    // TODO add support for a default flavor?
    // if (!this.options.flavor) {
    //   const clsName = this.constructor.name;
    //   this.options.flavor = game.i18n.localize(`YZDIE.${clsName}`);
    // }
  }

  /**
   * The type of the die.
   * @type {DieTypeString}
   * @readonly
   */
  get type() {
    return this.constructor.TYPE;
  }

  /**
   * Whether the die can be pushed (according to its type).
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    if (this.pushCount >= this.maxPush) return false;
    for (const r of this.results) {
      if (!r.active || r.discarded) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Number of times this die has been pushed.
   * @type {number}
   * @readonly
   */
  get pushCount() {
    return this.results.reduce((c, r) => Math.max(c, r.indexPush || 0), 0);
  }

  /**
   * Whether this die has been pushed.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.pushCount > 0;
  }

  /**
   * Tells if it's a YearZero Die.
   * @type {boolean}
   * @readonly
   */
  get isYearZeroDie() {
    return this instanceof YearZeroDie;
  }

  /**
   * Number of successes rolled.
   * @type {number}
   * @readonly
   */
  get success() {
    if (!this._evaluated) return undefined;
    const s = this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      if (r.count !== undefined) return tot + r.count;
      if (this.constructor.SUCCESS_TABLE) {
        return tot + this.constructor.SUCCESS_TABLE[r.result];
      }
      return tot + (r.result >= 6 ? 1 : 0);
    }, 0);
    return this.type === 'neg' ? -s : s;
  }

  /**
   * Number of banes rolled.
   * @type {number}
   * @readonly
   */
  get failure() {
    if (!this._evaluated) return undefined;
    return this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      return tot + (r.result <= 1);
    }, 0);
  }

  /* -------------------------------------------- */

  /** @override */
  roll(options) {
    // Modifies the result.
    const roll = super.roll(options);
    // TODO clean this line
    // roll.count = roll.result >= 6 ? 1 : 0;

    // Stores indexes
    roll.indexResult = options.indexResult;
    if (roll.indexResult == undefined) {
      roll.indexResult = 1 + this.results.reduce((c, r) => {
        let i = r.indexResult;
        if (i == undefined) i = -1;
        return Math.max(c, i);
      }, -1);
    }
    roll.indexPush = options.indexPush ?? this.pushCount;

    // Overwrites the result.
    this.results[this.results.length - 1] = roll;
    return roll;
  }

  /**
   * Counts the number of times a single value appears.
   * @param {number} n The single value to count
   * @returns {number}
   */
  count(n) {
    return this.values.filter(v => v === n).length;
  }

  /**
   * Pushes the dice.
   * @returns {YearZeroDie} this dice, pushed
   */
  push() {
    if (!this.pushable) return this;
    const indexPush = this.pushCount + 1;
    const indexesResult = [];
    for (const r of this.results) {
      if (!r.active) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        // Removes the die from the total score.
        r.active = false;
        // Greys-out the die in the chat tooltip.
        r.discarded = true;
        // Marks the die as pushed.
        r.pushed = true;
        // Hides the die for DsN.
        r.hidden = true;
        // Stores the die's index for the chat tooltip.
        indexesResult.push(r.indexResult);
      }
      else {
        // Hides the die for DsN.
        r.hidden = true;
      }
    }

    // Then, rolls a new die for each pushed die.
    // With the indexes as options.
    for (let i = 0; i < indexesResult.length; i++) {
      this.roll({
        indexResult: indexesResult[i],
        indexPush,
      });
    }
    return this;
  }

  /* -------------------------------------------- */
  /*  Term Modifiers                              */
  /* -------------------------------------------- */

  /**
   * Roll Modifier method that blocks pushes.
   */
  nopush() {
    this.maxPush = 0;
  }

  setpush(modifier) {
    const rgx = /p([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [, max] = match;
    max = parseInt(max) ?? 1;
    this.maxPush = max;
  }

  /* -------------------------------------------- */
  /*  Dice Term Methods                           */
  /* -------------------------------------------- */

  /** @override */
  getResultLabel(result) {
    // Do not forget to stringify the label because
    // numbers return an error with DiceSoNice!
    return CONFIG.YZUR.DICE.ICONS.getLabel(
      this.constructor.TYPE,
      result.result,
    );
  }

  /** @override */
  getResultCSS(result) {
    // This is copy-pasted from the source code,
    // with modified parts between ==> arrows <==.
    const hasSuccess = result.success !== undefined;
    const hasFailure = result.failure !== undefined;
    //* Refactors the isMin & isMax for YZE dice.
    // const isMax = result.result === this.faces;
    // const isMin = result.result === 1;
    let isMax = false, isMin = false;
    if (this.type === 'neg') {
      isMax = false;
      isMin = result.result === 6;
    }
    else if (this instanceof YearZeroDie) {
      const noMin = ['skill', 'arto', 'loc'];
      isMax = result.result === this.faces || result.result >= 6;
      isMin = result.result === 1 && !noMin.includes(this.type);
    }
    else {
      isMax = result.result === this.faces;
      isMin = result.result === 1;
    }
    //* <==
    return [
      this.constructor.name.toLowerCase(),
      'd' + this.faces,
      //* ==>
      // result.success ? 'success' : null,
      // result.failure ? 'failure' : null,
      hasSuccess ? 'success' : null,
      hasFailure ? 'failure' : null,
      //* <==
      result.rerolled ? 'rerolled' : null,
      result.exploded ? 'exploded' : null,
      result.discarded ? 'discarded' : null,
      //* ==>
      //* Adds a CSS property for pushed dice.
      result.pushed ? 'pushed' : null,
      //* <==
      !(hasSuccess || hasFailure) && isMin ? 'min' : null,
      !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    ];
  }

  /** @override */
  getTooltipData() {
    // This is copy-pasted from the source code,
    // with modified parts between ==> arrows <==.
    return {
      formula: this.expression,
      //* ==>
      // total: this.total,
      total: this.success,
      banes: this.failure,
      //* <==
      faces: this.faces,
      //* ==>
      //* Adds the number of dice, used in the chat for the pushed dice matrix.
      number: this.number,
      //* Adds the type, for sorting options.
      type: this.type,
      //* Adds whether its a YearZeroDie.
      isYearZeroDie: this.isYearZeroDie,
      //* Adds a default flavor for the die.
      // flavor: this.flavor,
      flavor: this.options.flavor ?? (
        CONFIG.YZUR?.DICE?.localizeDieTypes
          ? game.i18n.localize(`YZUR.DIETYPES.${this.constructor.name}`)
          : null
      ),
      //* <==
      rolls: this.results.map(r => {
        return {
          result: this.getResultLabel(r),
          classes: this.getResultCSS(r).filterJoin(' '),
          //* ==>
          //* Adds row and col indexes.
          row: r.indexPush,
          col: r.indexResult,
          //* <==
        };
      }),
    };
  }
}
YearZeroDie.TYPE = 'blank';
YearZeroDie.LOCKED_VALUES = [6];
YearZeroDie.SERIALIZE_ATTRIBUTES.push('maxPush');

/** @inheritdoc */
YearZeroDie.MODIFIERS = foundry.utils.mergeObject(
  {
    'p' : 'setpush',
    'np': 'nopush',
  },
  Die.MODIFIERS,
);

/* -------------------------------------------- */

/**
 * Base Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class BaseDie extends YearZeroDie {}
BaseDie.TYPE = 'base';
BaseDie.DENOMINATION = 'b';
BaseDie.LOCKED_VALUES = [1, 6];

/**
 * Skill Die: 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class SkillDie extends YearZeroDie {}
SkillDie.TYPE = 'skill';
SkillDie.DENOMINATION = 's';

/**
 * Gear Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class GearDie extends YearZeroDie {}
GearDie.TYPE = 'gear';
GearDie.DENOMINATION = 'g';
GearDie.LOCKED_VALUES = [1, 6];

/**
 * Negative Die: 6 cannot be re-rolled.
 * @extends {SkillDie}
 */
export class NegativeDie extends SkillDie {
  // TODO clean this code
  // /** @override */
  // roll(options) {
  //   const roll = super.roll(options);
  //   roll.count = roll.result >= 6 ? -1 : 0;
  //   this.results[this.results.length - 1] = roll;
  //   return roll;
  // }
}
NegativeDie.TYPE = 'neg';
NegativeDie.DENOMINATION = 'n';

/* -------------------------------------------- */

/**
 * Stress Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class StressDie extends YearZeroDie {}
StressDie.TYPE = 'stress';
StressDie.DENOMINATION = 'z';
StressDie.LOCKED_VALUES = [1, 6];

/* -------------------------------------------- */

/**
 * Artifact Die: 6+ cannot be re-rolled.
 * @extends {SkillDie}
 */
export class ArtifactDie extends SkillDie {
  // TODO clean this code
  // /** @override */
  // roll(options) {
  //   const roll = super.roll(options);
  //   if (roll.result < this.constructor.SUCCESS_TABLE.length) {
  //     roll.count = this.constructor.SUCCESS_TABLE[roll.result];
  //   }
  //   this.results[this.results.length - 1] = roll;
  //   return roll;
  // }
  /** @override */
  getResultLabel(result) {
    return CONFIG.YZUR.DICE.ICONS.getLabel(
      `d${this.constructor.DENOMINATION}`,
      result.result,
    );
  }
}
ArtifactDie.TYPE = 'arto';
ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];

export class D8ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8ArtifactDie.DENOMINATION = '8';

export class D10ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10ArtifactDie.DENOMINATION = '10';

export class D12ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12ArtifactDie.DENOMINATION = '12';

/* -------------------------------------------- */

/**
 * Twilight Die: 1 & 6+ cannot be re-rolled.
 * @extends {ArtifactDie} But LOCKED_VALUES are not the same
 */
export class TwilightDie extends ArtifactDie {
  /** @override */
  getResultLabel(result) {
    return CONFIG.YZUR.DICE.ICONS.getLabel('base', result.result);
  }
}
TwilightDie.TYPE = 'base';
TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];

export class D6TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
D6TwilightDie.DENOMINATION = '6';

export class D8TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8TwilightDie.DENOMINATION = '8';

export class D10TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10TwilightDie.DENOMINATION = '10';

export class D12TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12TwilightDie.DENOMINATION = '12';

/* -------------------------------------------- */

export class AmmoDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
AmmoDie.TYPE = 'ammo';
AmmoDie.DENOMINATION = 'm';
AmmoDie.LOCKED_VALUES = [1, 6];

/* -------------------------------------------- */

export class LocationDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
  /** @override */
  get pushable() { return false; }

  /** @override */
  roll(options) {
    const roll = super.roll(options);
    roll.count = 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
}
LocationDie.TYPE = 'loc';
LocationDie.DENOMINATION = 'l';
LocationDie.LOCKED_VALUES = [1, 2, 3, 4, 5, 6];

/* -------------------------------------------- */
/*  Custom Config                               */
/*                                              */
/*  To change dice labels, you just need to     */
/*  edit CONFIG.YZUR.DICE.ICONS.<your game>     */
/* -------------------------------------------- */

const YZUR = {
  game: '',
  CHAT: {
    showInfos: true,
    diceSorting: ['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo'],
  },
  ROLL: {
    chatTemplate: 'templates/dice/roll.html',
    tooltipTemplate: 'templates/dice/tooltip.html',
    infosTemplate: 'templates/dice/infos.hbs',
  },
  DICE: {
    localizeDieTypes: true,
    DIE_TYPES: {
      'base': BaseDie,
      'skill': SkillDie,
      'neg': NegativeDie,
      'gear': GearDie,
      'stress': StressDie,
      'artoD8': D8ArtifactDie,
      'artoD10': D10ArtifactDie,
      'artoD12': D12ArtifactDie,
      'a': D12TwilightDie,
      'b': D10TwilightDie,
      'c': D8TwilightDie,
      'd': D6TwilightDie,
      'ammo': AmmoDie,
      'loc': LocationDie,
    },
    ICONS: {
      /**
       * A customizable helper function for creating the labels of the die.
       * Note: You must return a string or DsN will throw an error.
       * @param {DieTypeString} type
       * @param {number} result
       * @returns {string}
       */
      getLabel: function(type, result) {
        const arto = ['d8', 'd10', 'd12'];
        if (arto.includes(type)) type = 'arto';
        return String(this[CONFIG.YZUR.game][type][result]);
      },
      myz: {
        base: {
          '1': '☣',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '☢',
        },
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '☢',
        },
        neg: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '➖',
        },
        gear: {
          '1': '💥',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '☢',
        },
      },
      fbl: {
        base: {
          '1': '☠',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '⚔️',
        },
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '⚔️',
        },
        neg: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '➖',
        },
        gear: {
          '1': '💥',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '⚔️',
        },
        arto: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          '11': 11,
          '12': 12,
        },
      },
      alien: {
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '💠', // '❇',
        },
        stress: {
          '1': '😱', // '⚠',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '💠',
        },
      },
      tales: {
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '⚛️', // '👑',
        },
      },
      cor: {
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '🐞',
        },
      },
      vae: {
        skill: {
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '🦋',
        },
      },
      t2k: {
        base: {
          '1': '💥',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          '11': 11,
          '12': 12,
        },
        ammo: {
          '1': '💥',
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': '🎯',
        },
        loc: {
          '1': 'L',
          '2': 'T',
          '3': 'T',
          '4': 'T',
          '5': 'A',
          '6': 'H',
        },
      },
    },
  },
};

YZUR.DICE.DIE_TYPES_BY_CLASS = Object.entries(YZUR.DICE.DIE_TYPES).reduce((dieTypes, [type, cls]) => {
  dieTypes[cls.name] = type;
  return dieTypes;
}, {});

/* -------------------------------------------- */
/*  Custom Dialog                               */
/* -------------------------------------------- */

export class YZRollDialog extends Dialog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('input').focus(ev => ev.currentTarget.select());
  }
}

/* -------------------------------------------- */
/*  Custom Errors                               */
/* -------------------------------------------- */

class GameTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(', ')}.`);
    this.name = 'YZ GameType Error';
  }
}

class DieTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown die type: "${msg}". Allowed types are: ${Object.keys(CONFIG.YZUR.DICE.DIE_TYPES).join(', ')}.`);
    this.name = 'YZ DieType Error';
  }
}

// class RollError extends SyntaxError {
//   constructor(msg, obj) {
//     super(msg);
//     this.name = 'YZ Roll Error';
//     if (obj) console.error(obj);
//   }
// }
