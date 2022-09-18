import { YearZeroRoll } from 'yzur';
import { getChatCardActor } from '../components/chat/chat.js';
import { T2K4E } from '../system/config.js';
import { T2KRoller } from '../components/roll/dice.js';
import T2KDialog from '../components/dialog/dialog.js';

/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item
 */
export default class ItemT2K extends Item {
  /* ------------------------------------------- */
  /*  Properties                                 */
  /* ------------------------------------------- */

  get qty() {
    return this.system.qty;
  }

  get isPhysical() {
    return T2K4E.physicalItems.includes(this.type);
  }

  get hasDamage() {
    return !!this.system.damage;
  }

  get hasAttack() {
    return this.hasDamage || this.hasAmmo;
  }

  get isStashed() {
    if (this.isPhysical) return this.system.backpack;
    return null;
  }

  get isEquipped() {
    return this.system.equipped;
  }

  get isDisposable() {
    return !!this.system.props?.disposable;
  }

  get isMounted() {
    if (this.system.props?.mounted == undefined) return null;
    return this.isEquipped && this.system.props?.mounted;
  }

  get hasAmmo() {
    return this.system.ammo && !!this.system.mag?.max;
  }

  get hasReliability() {
    return !!this.system.reliability?.max;
  }

  get hasModifier() {
    if (!this.system.rollModifiers) return false;
    return !foundry.utils.isEmpty(this.system.rollModifiers);
  }

  // get inVehicle() {
  //   return this.actor?.type === 'vehicle';
  // }

  /**
   * The name with a quantity in parentheses.
   * @type {string}
   * @readonly
   */
  get detailedName() {
    let str = this.name;
    if (this.type === 'ammunition') {
      const ammo = this.system.ammo;
      str += ` [${ammo.value}/${ammo.max}]`;
    }
    else if (this.type === 'weapon' && this.actor?.type === 'vehicle') {
      const ffv = [];
      for (const [k, v] of Object.entries(this.system.featuresForVehicle)) {
        if (v) ffv.push(k.toUpperCase());
      }
      if (ffv.length) str += ` (${ffv.join(', ')})`;
    }
    if (this.qty > 1) {
      str += ` (${this.qty})`;
    }
    return str;
  }

  get modifiersDescription() {
    if (!this.hasModifier) return undefined;
    return this._getModifiersDescription(this.system.rollModifiers);
  }

  get encumbranceModifiers() {
    if (!this.hasModifier) return 0;
    return this._getModifiersEncumbrance(this.system.rollModifiers);
  }

  /* ------------------------------------------- */
  /*  Data Preparation                           */
  /* ------------------------------------------- */

  /**
   * Augments the basic Item data model with additional dynamic data.
   * @override
   */
  prepareData() {
    super.prepareData();

    const actorData = this.actor ?? {};
    const system = this.system;

    this._prepareEncumbrance(this.type, system);

    switch (this.type) {
      case 'weapon':
        this._prepareWeapon(system, actorData);
    }
  }

  /* ------------------------------------------- */

  /**
   * Prepares weapon data.
   * @param {Object} system       Item's system
   * @param {Object} actorData  Actor's data (1x)
   * @private
   */
  _prepareWeapon(system, actorData = {}) {
    // Adds "data.mount: [number]" property.
    if (actorData.type === 'vehicle') {
      if (system.equipped && system.props?.mounted) {
        system.isMounted = true;
      }
      else {
        system.isMounted = false;
      }
    }
  }

  /* ------------------------------------------- */

  /**
   * Calculates a custom encumbrance for items.
   * @param {string} type  Item type
   * @param {Object} system  Item's system
   * @private
   */
  _prepareEncumbrance(type, system) {
    let weight = 0;
    if (type === 'ammunition' && !system.props.magazine) {
      weight = system.qty * system.weight * system.ammo.value;
    }
    else {
      weight = system.qty * system.weight;
    }
    if (!weight) system.encumbrance = 0;
    else system.encumbrance = weight;
  }

  /* ------------------------------------------- */

  /**
   * Returns a number summing all encumbrance modifiers from specialties.
   * @param {Object} modifiersData item.system.rollModifiers
   * @returns {number}
   */
  _getModifiersEncumbrance(modifiersData) {
    let out = 0;

    for (const m of Object.values(modifiersData)) {
      if (m && m.name === 'constant.encumbrance') {
        out += +m.value;
      }
    }
    return out;
  }

  /* ------------------------------------------- */

  /**
   * Returns a string resuming the modifiers.
   * @param {Object} modifiersData item.system.rollModifiers
   * @returns {string}
   * @private
   */
  _getModifiersDescription(modifiersData) {
    const out = [];

    for (const m of Object.values(modifiersData)) {
      if (m && m.name) {
        const [t, n] = m.name.split('.');
        let type = '';
        switch (t) {
          case 'attribute':
            type = 'Attribute';
            break;
          case 'constant':
            type = 'Constant';
            break;
          case 'skill':
            type = 'Skill';
            break;
          case 'action':
            type = 'Action';
            break;
          case 'travel':
            type = 'TravelTask';
            break;
        }
        const str = game.i18n.localize(`T2K4E.${type}Names.${n}`) + ` ${m.value}`;
        out.push(str);
      }
    }
    return out.join(', ');
  }

  /* ------------------------------------------- */
  /*  Event Handlers                             */
  /* ------------------------------------------- */

  /** @override */
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);

    // When creating an item in a character.
    if (this.actor && this.actor.type === 'character') {
      // When creating an injury in a character.
      if (this.type === 'injury') {
        // If there is a heal time set.
        let healTime = this.system.healTime;
        if (healTime) {
          try {
            const roll = Roll.create(healTime);
            await roll.evaluate({ async: true });
            healTime = roll.terms.reduce((sum, t) => sum + t.values.reduce((tot, v) => tot + v, 0), 0);
            healTime = `${healTime} ${game.i18n.localize(`T2K4E.InjurySheet.day${healTime > 1 ? 's' : ''}`)}`;
            this.update({ 'system.healTime': healTime });
          }
          catch (e) {
            console.warn('t2k4 | Item#_onCreate | Invalid formula for Injury heal time roll.');
          }
        }
      }
    }
  }

  /* ------------------------------------------- */
  /*  Item Roll                                  */
  /* ------------------------------------------- */

  /**
   * Roll the item to Chat, creating a chat card which contains follow up attack or reload roll options.
   * @param {string}  [rollMode]    The roll display mode with which to display (or not) the card
   * @param {Actor}   [actor]       The actor that rolled the item, if any
   * @param {boolean} [sendMessage] Whether to automatically create a chat message (if true) or simply return
   *   the prepared chat message data (if false).
   * @return {Promise<ChatMessage|object>}
   */
  async roll({ rollMode, actor = null, askForOptions = true, sendMessage = true } = {}) {
    if (['weapon', 'grenade'].includes(this.type)) {
      return this.rollAttack({ rollMode, sendMessage, askForOptions }, actor ?? this.actor);
    }
    else if (this.type === 'armor') {
      const mod = await T2KDialog.chooseValue({
        value: 0,
        title: game.i18n.format('T2K4E.Dialog.ChooseValue.Armor', {
          name: this.name,
        }),
      });
      return this.updateArmor(mod?.value ?? 0);
    }
    else if (this.type === 'ammunition') {
      const mod = await T2KDialog.chooseValue({
        value: 0,
        title: game.i18n.format('T2K4E.Dialog.ChooseValue.Ammo', { name: this.name }),
      });
      return this.updateAmmo(mod?.value ?? 0);
    }
    else if (this.isDisposable) {
      const mod = await T2KDialog.chooseValue({
        value: 0,
        title: game.i18n.format('T2K4E.Dialog.ChooseValue.Qty', { name: this.name }),
      });
      if (mod?.value) {
        return this.update({ 'sytem.qty': this.qty + mod.value });
      }
      else return;
    }
    // Creates or returns the chat message data.
    return this.displayCard({ rollMode, sendMessage });
  }

  /* ------------------------------------------- */

  /**
   * Places an attack using an item (weapon, grenade, or equipment).
   * @param {object} options Roll options which are configured and provided to the task check
   * @param {Actor}  actor   (for Vehicles) You can define another actor that holds the weapon
   * @returns {Promise<YearZeroRoll|ChatMessage>}
   * @async
   */
  async rollAttack(options = {}, actor = null) {
    if (!this.hasAttack && !this.actor) {
      throw new Error('You may not place an Attack Roll with this Item.');
    }
    // if (!this.hasAttack) {
    //   // If no attack, instead perform a skill roll.
    //   if (this.actor) {
    //     const statData = getAttributeAndSkill(
    //       this.system.skill,
    //       this.actor.system,
    //       this.system.attribute,
    //     );
    //     return T2KRoller.taskCheck({
    //       ...statData,
    //       ...options,
    //       actor: this.actor,
    //     });
    //   }
    //   else {
    //     throw new Error('You may not place an Attack Roll with this Item.');
    //   }
    // }
    if (!this.actor) throw new Error('This weapon has no bearer.');
    if (this.hasReliability && this.system.reliability.value <= 0) {
      return ui.notifications.warn(game.i18n.localize('T2K4E.Chat.Roll.NoReliabilityNotif'));
    }

    // Prepares data.
    const itemData = this.system;
    let title = game.i18n.format('T2K4E.Combat.Attack', { weapon: this.name });
    let qty = itemData.qty;
    const attributeName = itemData.attribute;
    const skillName = itemData.skill;
    const isDisposable = itemData.props.disposable;

    // Prepares values.
    if (!actor) actor = this.actor;
    const actorData = actor.system;
    const attribute = actorData.attributes?.[attributeName]?.value ?? 0;
    const skill = actorData.skills?.[skillName]?.value ?? 0;
    let rof = itemData.rof;

    // Gets the magazine.
    const track =
      (this.actor.type === 'character' && game.settings.get('t2k4e', 'trackPcAmmo')) ||
      (this.actor.type === 'npc' && game.settings.get('t2k4e', 'trackNpcAmmo')) ||
      (this.actor.type === 'vehicle' && game.settings.get('t2k4e', 'trackVehicleAmmo'));

    let ammo = null;
    if (track && this.hasAmmo) {
      ammo = this.actor.items.get(this.system.mag.target);
      if (ammo?.system) {
        const ammoLeft = ammo.system.ammo.value ?? ammo.system.qty;
        if (ammoLeft <= 0) {
          ui.notifications.warn(game.i18n.format('T2K4E.Combat.NoAmmoLeft', { weapon: this.name }));
          return;
        }
        title += ` [${ammo.name}]`;
        rof = Math.min(rof, ammoLeft);
      }
      else {
        ui.notifications.warn(game.i18n.format('T2K4E.Combat.NoMag', { weapon: this.name }));
        return;
      }
    }

    // Checks unit quantity.
    if (track && isDisposable && qty <= 0) {
      ui.notifications.warn(game.i18n.format('T2K4E.Combat.NoQuantityLeft', { weapon: this.name }));
      return;
    }

    // Composes the options for the task check.
    const rollConfig = foundry.utils.mergeObject(
      {
        title,
        attributeName,
        skillName,
        attribute,
        skill,
        rof,
        locate: true,
      },
      options,
    );
    // Better to not put them in a mergeObject:
    rollConfig.actor = actor;
    rollConfig.item = this;

    // Performs the task check.
    const message = await T2KRoller.taskCheck(rollConfig);
    if (!message) return;
    if (message instanceof YearZeroRoll) return message;

    const roll = message.rolls[0];

    const flagData = {};

    // Consumes unit(s).
    if (track && isDisposable && qty > 0) {
      qty--;
      await this.update({ 'system.qty': qty });
    }

    // Consumes ammo.
    if (ammo) {
      const ammoDiff = await this.consumeAmmo(Math.max(1, roll.ammoSpent), ammo);
      flagData.ammoSpent = ammoDiff;
      flagData.ammo = ammo.id;
    }

    // ? There is no jam on unpushed rolls.
    // Decreases reliability.
    // if (this.hasReliability && roll.jamCount) {
    //   const newRel = await this.updateReliability(-roll.jamCount);
    //   if (newRel) flagData.reliability = newRel;
    // }

    // Updates message's flags.
    if (!foundry.utils.isEmpty(flagData)) {
      await message.setFlag('t2k4e', 'data', flagData);
    }

    return message;
  }

  /* ------------------------------------------- */

  /**
   * Updates the reliability value of an item based on its interval [0, max].
   * @param {number}   jam          How much to modify the reliability
   * @param {boolean} [update=true] Whether to update the item
   * @returns {number} The real difference applied
   * @async
   */
  async updateReliability(jam, update = true) {
    if (jam === 0) return 0;
    if (!this.hasReliability) return 0;
    const val = this.system.reliability.value;
    const max = this.system.reliability.max;
    const rel = Math.clamped(val + jam, 0, max);
    if (update && rel !== val) await this.update({ 'system.reliability.value': rel });
    return rel - val;
  }

  /* ------------------------------------------- */

  /**
   * Updates the armor rating of an armor based on its interval [0, max].
   * @param {number}   mod          How much to modify the armor rating
   * @param {boolean} [update=true] Whether to update the item
   * @returns {number} The real difference applied
   * @async
   */
  async updateArmor(mod, update = true) {
    if (mod === 0) return 0;
    if (!this.type === 'armor') return 0;
    const val = this.system.rating.value;
    const max = this.system.rating.max;
    const rel = Math.clamped(val + mod, 0, max);
    if (update && rel !== val) await this.update({ 'system.rating.value': rel });
    return rel - val;
  }

  /* ------------------------------------------- */

  /**
   * Consumes a quantity of ammo from the weapon's magazine,
   * updates the weapon data, and return the quantity of ammo consumed.
   * If the quantity is negative, it will increase the ammo count.
   * @param {number}  qty   Quantity of ammo to consume
   * @param {Item?}  [ammo] The ammo item may be defined if you already have it
   * @returns {number} The real quantity of ammo consumed
   * @async
   */
  async consumeAmmo(qty, ammo) {
    if (!this.hasAmmo) return 0;
    ammo = ammo ?? this.actor.items.get(this.system.mag.target);
    return ammo.updateAmmo(-qty);
  }

  /* ------------------------------------------- */

  /**
   * Updates the ammo value of a magazine based on its interval [0, max].
   * @param {number}   modifier     How much to modify the magazine
   * @param {boolean} [update=true] Whether to update the ammo item
   * @returns {number} The real difference applied
   * @async
   */
  async updateAmmo(modifier, update = true) {
    if (modifier === 0) return 0;

    let ammoData = {};
    if (this.type === 'ammunition') {
      ammoData = this.system.ammo;
    }
    else if (this.type === 'weapon') {
      ammoData = {
        value: this.system.qty,
        max: 100000,
      };
    }
    else {
      throw new Error('t2k4e | ItemT2K#updateAmmo() | This is not an ammunition!');
    }
    const ammoValue = ammoData.value || 0;
    const ammoMax = ammoData.max;
    const newAmmoValue = Math.clamped(ammoValue + modifier, 0, ammoMax);

    if (update) {
      switch (this.type) {
        case 'ammunition':
          await this.update({ 'system.ammo.value': newAmmoValue });
          break;
        case 'weapon':
          await this.update({ 'system.qty': newAmmoValue });
          break;
      }
    }
    return newAmmoValue - ammoValue;
  }

  /* ------------------------------------------- */
  /*  Chat Card                                  */
  /* ------------------------------------------- */

  /**
   * Display the chat card for an Item as a Chat Message.
   * @param {string?}  rollMode          The message visibility mode to apply to the created card
   * @param {boolean} [sendMessage=true] Whether to send the message or return its data
   * @returns {Promise<ChatMessage|object>}
   * @async
   */
  async displayCard({ rollMode, sendMessage = true } = {}) {
    // Renders the chat card template.
    const token = this.actor.token;
    const cardData = {
      id: this.id,
      name: this.name,
      img: this.img,
      system: this.system,
      actorId: this.actor.id,
      tokenId: token ? `${token.parent.id}.${token.id}` : null,
      owner: game.user.id,
      config: T2K4E,
    };

    // Creates the ChatMessage data object.
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
      content: await renderTemplate(ItemT2K.CHAT_TEMPLATE[this.type], cardData),
      // flavor: this.name,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };

    // Apply the roll mode to adjust message visibility.
    ChatMessage.applyRollMode(chatData, rollMode || game.settings.get('core', 'rollMode'));

    // Creates the chat message or return its data.
    return sendMessage ? ChatMessage.create(chatData) : chatData;
  }

  /* ------------------------------------------- */
  /*  Chat Card Actions                          */
  /* ------------------------------------------- */

  static chatListeners(html) {
    html.on('click', '.card-buttons button', this._onChatCardAction.bind(this));
  }

  /* ------------------------------------------- */

  /**
   * Handles execution of a chat card action via a click event on one of the card buttons.
   * @param {Event} event The originating click event
   * @returns {Promise} A promise which resolves once the handler workflow is complete
   * @private
   * @static
   * @async
   */
  static async _onChatCardAction(event) {
    event.preventDefault();

    // Extracts the card's data.
    const button = event.currentTarget;
    button.disabled = true;
    const card = button.closest('.chat-card');
    const messageId = card.closest('.message').dataset.messageId;
    const message = game.messages.get(messageId);
    const action = button.dataset.action;
    const itemId = card.dataset.itemId;

    // Validates permission to proceed with the roll.
    if (!(game.user.isGM || message.isAuthor)) {
      button.style.display = 'none';
      return;
    }

    // Recovers the actor for the chat card.
    const actor = getChatCardActor(card);
    if (!actor) {
      button.style.display = 'none';
      return;
    }

    // Gets the item.
    const item = actor.items.get(itemId);
    if (!item) {
      return ui.notifications.error(game.i18n.localize('T2K4E.Chat.Roll.NoItemNotif'));
    }

    // Handles different actions.
    const askForOptions = event.shiftKey;
    switch (action) {
      case 'attack':
        await item.rollAttack({ askForOptions });
        break;
      // TODO case 'reload': await item.rollReload({ askForOptions }); break;
    }

    // Re-enables the button.
    button.disabled = false;
  }
}

/* ------------------------------------------- */

/**
 * Default templates for the items in the chat.
 * @constant
 */
ItemT2K.CHAT_TEMPLATE = {
  weapon: 'systems/t2k4e/templates/components/chat/weapon-chat.hbs',
  grenade: 'systems/t2k4e/templates/components/chat/weapon-chat.hbs',
  armor: 'systems/t2k4e/templates/components/chat/armor-chat.hbs',
  gear: 'systems/t2k4e/templates/components/chat/gear-chat.hbs',
  ammunition: 'systems/t2k4e/templates/components/chat/gear-chat.hbs',
  // TODO injury template
  // TODO better templates
};
