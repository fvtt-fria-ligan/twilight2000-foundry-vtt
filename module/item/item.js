import { YearZeroRoll } from '../../lib/yzur.js';
import { getChatCardActor } from '../chat.js';
import { T2K4E } from '../config.js';
import { T2KRoller } from '../dice.js';

/**
 * Twilight 2000 Item.
 * @extends {Item} Extends the basic Item
 */
export default class ItemT2K extends Item {

  /* ------------------------------------------- */
  /*  Properties                                 */
  /* ------------------------------------------- */

  get qty() {
    return this.data.data.qty;
  }

  get isPhysical() {
    return T2K4E.physicalItems.includes(this.type);
  }

  get hasDamage() {
    return !!this.data.data.damage;
  }

  get hasAttack() {
    return this.hasDamage || this.hasAmmo;
  }

  get isStashed() {
    if (this.isPhysical) return this.data.data.backpack;
    return null;
  }

  get isEquipped() {
    return this.data.data.equipped;
  }

  get isMounted() {
    if (this.data.data.props?.mounted == undefined) return null;
    return this.isEquipped && this.data.data.props?.mounted;
  }

  get hasAmmo() {
    return this.data.data.ammo && !!this.data.data.mag?.max;
  }

  get hasReliability() {
    return !!this.data.data.reliability?.max;
  }

  get hasModifier() {
    if (!this.data.data.rollModifiers) return false;
    return !foundry.utils.isObjectEmpty(this.data.data.rollModifiers);
    // return Object.keys(this.data.data.rollModifiers).length > 0;
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
      const ammo = this.data.data.ammo;
      str += ` [${ammo.value}/${ammo.max}]`;
    }
    else if (this.type === 'weapon' && this.actor?.type === 'vehicle') {
      const ffv = [];
      for (const [k, v] of Object.entries(this.data.data.featuresForVehicle)) {
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
    return this._getModifiersDescription(this.data.data.rollModifiers);
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

    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;

    this._prepareEncumbrance(this.type, data);

    switch (this.type) {
      case 'weapon': this._prepareWeapon(data, actorData);
    }
  }

  /* ------------------------------------------- */

  /**
   * Prepares weapon data.
   * @param {Object} data       Item's data data
   * @param {Object} actorData  Actor's data (1x)
   * @private
   */
  _prepareWeapon(data, actorData = {}) {
    // Adds "data.mount: [number]" property.
    if (actorData.type === 'vehicle') {
      if (data.equipped && data.props?.mounted) {
        data.isMounted = true;
      }
      else {
        data.isMounted = false;
      }
    }
  }

  /* ------------------------------------------- */

  /**
   * Calculates a custom encumbrance for items.
   * @param {string} type  Item type
   * @param {Object} data  Item's data
   * @private
   */
  _prepareEncumbrance(type, data) {
    let weight = 0;
    if (type === 'ammunition' && !data.props.magazine) {
      weight = data.qty * data.weight * data.ammo.value;
    }
    else {
      weight = data.qty * data.weight;
    }
    if (!weight) data.encumbrance = 0;
    else data.encumbrance = weight;
  }

  /* ------------------------------------------- */

  /**
   * Returns a string resuming the modifiers.
   * @param {Object} modifiersData Item's data
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
          case 'attribute': type = 'Attribute'; break;
          case 'constant': type = 'Constant'; break;
          case 'skill': type = 'Skill'; break;
          case 'action': type = 'Action'; break;
          case 'travel': type = 'TravelTask'; break;
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
        let healTime = this.data.data.healTime;
        if (healTime) {
          try {
            const roll = Roll.create(healTime);
            await roll.evaluate({ async: true });
            healTime = roll.terms.reduce((sum, t) => sum + t.values.reduce((tot, v) => tot + v, 0), 0);
            healTime = `${healTime} ${game.i18n.localize(`T2K4E.InjurySheet.day${healTime > 1 ? 's' : ''}`)}`;
            this.update({ 'data.healTime': healTime });
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
   * @param {boolean} [configureDialog] Display a configuration dialog for the item roll, if applicable?
   * @param {string}  [rollMode]        The roll display mode with which to display (or not) the card
   * @param {boolean} [sendMessage]     Whether to automatically create a chat message (if true) or simply return
   *                                    the prepared chat message data (if false).
   * @return {Promise<ChatMessage|object>}
   * @async
   */
  async roll({ configureDialog = true, rollMode, sendMessage = true } = {}) {
    // const itemData = this.data.data;
    // const actor = this.actor;
    // const actorData = actor.data.data;

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
    if (!this.hasAttack) throw new Error('You may not place an Attack Roll with this Item.');
    if (!this.actor) throw new Error('This weapon has no bearer.');
    if (this.hasReliability && this.data.data.reliability.value <= 0) {
      return ui.notifications.warn(
        game.i18n.localize('T2K4E.Chat.Roll.NoReliabilityNotif'),
      );
    }

    // Prepares data.
    const itemData = this.data.data;
    let title = game.i18n.format('T2K4E.Combat.Attack', { weapon: this.name });
    let qty = itemData.qty;
    const attributeName = itemData.attribute;
    const skillName = itemData.skill;
    const isDisposable = itemData.props.disposable;

    // Prepares values.
    if (!actor) actor = this.actor;
    const actorData = actor.data.data;
    const attribute = actorData.attributes?.[attributeName]?.value ?? 0;
    const skill = actorData.skills?.[skillName]?.value ?? 0;
    let rof = itemData.rof;

    // Gets the magazine.
    const track = (this.actor.type === 'character' && game.settings.get('t2k4e', 'trackPcAmmo'))
      || (this.actor.type === 'npc' && game.settings.get('t2k4e', 'trackNpcAmmo'))
      || (this.actor.type === 'vehicle' && game.settings.get('t2k4e', 'trackVehicleAmmo'));

    let ammo = null;
    if (track && this.hasAmmo) {
      ammo = this.actor.items.get(this.data.data.mag.target);
      if (ammo?.data) {
        const ammoLeft = ammo.data.data.ammo.value ?? ammo.data.data.qty;
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

    // Handles unit consumption.
    if (isDisposable) {
      if (qty <= 0) {
        ui.notifications.warn(game.i18n.format('T2K4E.Combat.NoQuantityLeft', { weapon: this.name }));
        return;
      }
      else {
        qty--;
        // No need to await for this update.
        this.update({ 'data.qty': qty });
      }
    }

    // Composes the options for the task check.
    const rollConfig = foundry.utils.mergeObject({
      title, attributeName, skillName,
      attribute, skill, rof,
      locate: true,
    }, options);
    // Better to not put them in a mergeObject:
    rollConfig.actor = actor;
    rollConfig.item = this;

    // Performs the task check.
    const message = await T2KRoller.taskCheck(rollConfig);
    if (!message) return;
    if (message instanceof YearZeroRoll) return message;

    const roll = message.roll;

    const flagData = {};

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
    if (!foundry.utils.isObjectEmpty(flagData)) {
      await message.setFlag('t2k4e', 'data', flagData);
    }

    return message;

    // ! Gets the defenders, if any.
    //const defenders = [];
    // if (game.user.targets.size) {
    //   for (const token of game.user.targets.values()) {
    //     defenders.push(token.actor);
    //   }
    // }

    // return this.actor.attack(this, defenders, {
    //   // title,
    //   //rollMode: game.settings.get('core', 'rollMode'),
    //   askForOptions: options?.event?.shiftKey,
    // });
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
    const val = this.data.data.reliability.value;
    const max = this.data.data.reliability.max;
    const rel = Math.clamped(val + jam, 0, max);
    if (update && rel !== val) await this.update({ 'data.reliability.value': rel })
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
    ammo = ammo ?? this.actor.items.get(this.data.data.mag.target);
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
      ammoData = this.data.data.ammo;
    }
    else if (this.type === 'weapon') {
      ammoData = {
        value: this.data.data.qty,
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
        case 'ammunition': await this.update({ 'data.ammo.value': newAmmoValue }); break;
        case 'weapon': await this.update({ 'data.qty': newAmmoValue }); break;
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
      ...this.data,
      actorId: this.actor.id,
      tokenId: token ? `${token.parent.id}.${token.id}` : null,
      owner: game.user.id,
      config: CONFIG.T2K4E,
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

  // TODO Reload weapon

  // /**
  //  * Reloads a weapon.
  //  * TODO
  //  * @async
  //  */
  // async reload() {
  //   TaskCheck({
  //     name: game.i18n.localize('T2K4E.Chat.Actions.Reload'),
  //     attribute: this.actor?.data.data.attributes.agl.value,
  //     skill: this.actor?.data.data.skills.rangedCombat.value,
  //     actor: this.actor,
  //     item: this,
  //   });
  //   console.warn('t2k4e | RELOAD => Function not implemented yet! — Planned for a future release.');
  //   return;
  //   if (this.type !== 'weapon') return;
  //   if (!this.actor) return;

  //   const actorData = this.actor ? this.actor.data : {};

  //   const itemData = this.data;
  //   const data = itemData.data;

  //   // We don't need to reload the weapon if it's already full.
  //   if (data.mag?.value === data.mag?.max) {
  //   }

  //   let ammoMissing = data.mag.max - data.mag.value;

  //   while (ammoMissing > 0) {
  //     // Filters all magazines in the actor's inventory.
  //     const ammunitions = this.actor.items.filter(i => i.type === 'ammunition');

  //     // If it's empty, we cannot reload the weapon.
  //     if (ammunitions.length <= 0) {
  //     }

  //     // Filters the right ammo type.
  //     const ammoType = this.ammo;
  //     const munitions = ammunitions.filter(i => i.data.itemType === ammoType);

  //     // If it's empty, we cannot -again- reload the weapon, obviously.
  //     if (munitions.length <= 0) {
  //     }

  //     // Gets the first corresponding.
  //     const ammo = munitions[0];
  //   }
  // }

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
      return ui.notifications.error(
        game.i18n.localize('T2K4E.Chat.Roll.NoItemNotif'),
      );
    }

    // Handles different actions.
    const askForOptions = event.shiftKey;
    switch (action) {
      case 'attack': await item.rollAttack({ askForOptions }); break;
      // ! case 'reload': await item.rollReload({ askForOptions }); break;
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
  'weapon': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
  'grenade': 'systems/t2k4e/templates/chat/weapon-chat.hbs',
  'armor': 'systems/t2k4e/templates/chat/armor-chat.hbs',
  'gear': 'systems/t2k4e/templates/chat/gear-chat.hbs',
  'ammunition': 'systems/t2k4e/templates/chat/gear-chat.hbs',
  // TODO injury template
  // TODO better templates
};