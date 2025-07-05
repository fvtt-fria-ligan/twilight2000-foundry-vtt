import { T2K4E } from '../system/config.js';
import T2KDialog from '../components/dialog/dialog.js';
import { getAttributeAndSkill, T2KRoller } from '../components/roll/dice.js';
import { enrichTextFields } from '@utils/utils.js';

/**
 * Twilight 2000 Actor Sheet.
 * @extends {foundry.appv1.sheets.ActorSheet} Extends the basic ActorSheet
 */
export default class ActorSheetT2K extends foundry.appv1.sheets.ActorSheet {
  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'main' }],
    });
  }

  /** @override */
  get template() {
    if (this.actor.type === 'npc') {
      return 'systems/t2k4e/templates/actor/character/character-sheet.hbs';
    }
    return `systems/t2k4e/templates/actor/${this.actor.type}/${this.actor.type}-sheet.hbs`;
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  /** @override */
  async getData() {
    // const baseData = super.getData();
    const sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: foundry.utils.deepClone(this.actor),
      system: foundry.utils.deepClone(this.actor.system),
      config: T2K4E,
      hideCapacitiesButtons: !game.user.isGM && game.settings.get('t2k4e', 'hideCapacitiesButtons'),
    };
    await enrichTextFields(sheetData, ['system.description']);
    return sheetData;
  }

  /* -------------------------------------------- */
  /*  Filtering Dropped Items                     */
  /* -------------------------------------------- */

  /** @override */
  async _onDropItemCreate(itemData) {
    const type = itemData.type;
    const alwaysAllowedItems = T2K4E.physicalItems;
    const allowedItems = {
      character: ['specialty', 'injury'],
      npc: ['specialty'],
      vehicle: [],
    };
    let allowed = true;

    if (this.actor.type === 'unit') {
      allowed = false;
    }
    else if (this.actor.type === 'party') {
      allowed = false;
    }
    else if (!alwaysAllowedItems.includes(type)) {
      if (!allowedItems[this.actor.type].includes(type)) {
        allowed = false;
      }
    }

    if (!allowed) {
      const msg = game.i18n.format('T2K4E.ActorSheet.NotifWrongItemType', {
        type: game.i18n.localize(`T2K4E.ItemTypes.${type}`),
        actor: game.i18n.localize(`T2K4E.ActorTypes.${this.actor.type}`),
      });
      console.warn(`t2k4e | ${msg}`);
      ui.notifications.warn(msg);
      return false;
    }
    return super._onDropItemCreate(itemData);
  }

  /* -------------------------------------------- */
  /*  Actor Rolls                                 */
  /* -------------------------------------------- */

  rollAction(actionName, _itemId) {
    const skillName = T2K4E.actionSkillsMap[actionName];
    const statData = getAttributeAndSkill(skillName, this.actor.system);
    statData.title += ` (${this.actor.name})`;
    const isRangedSkill = skillName === 'rangedCombat' || skillName === 'heavyWeapons';
    return T2KRoller.taskCheck({
      ...statData,
      actor: this.actor,
      rof: isRangedSkill ? 6 : 0,
    });
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
    html.find('.item-chat').click(this._onItemChat.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.item-equip').click(this._onItemEquip.bind(this));
    html.find('.item-backpack').click(this._onItemStore.bind(this));
    // html.find('.item-mag .weapon-edit-ammo').change(this._onWeaponAmmoChange.bind(this));

    // Owner-only listeners.
    if (this.actor.isOwner) {
      html.find('.item-roll').click(this._onItemRoll.bind(this));
      html.find('.item[data-item-id]').each((_index, elem) => {
        elem.setAttribute('draggable', true);
        elem.addEventListener('dragstart', ev => this._onDragStart(ev), false);
      });
    }
  }

  /* ------------------------------------------- */

  async _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    // Specific item click on Vehicles.
    if (this.actor.type === 'vehicle' && item.type === 'weapon') {
      const actors = this.actor.system.crew.occupants.reduce((data, o) => {
        const a = game.actors.get(o.id);
        if (!a) return data;
        const nm = `${a.name} (${game.i18n.localize(T2K4E.vehicle.crewPositionFlagsLocalized[o.position])})`;
        data[o.id] = nm;
        return data;
      }, {});

      const opts = await T2KDialog.chooseActor(actors);
      if (opts.cancelled) return;

      const actorId = opts.actor;
      const actor = game.actors.get(actorId); // this.actor.getCrew().get(actorId);
      // if (!actor) {
      //   ui.notifications.warn('Actor does not exist.');
      //   return;
      // }
      return item.rollAttack(null, actor);
    }

    // Global action for item click.
    // return item.roll();
    return item.roll({ askForOptions: event.shiftKey }, this.actor);
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
    return (
      this.actor
        .createEmbeddedDocuments('Item', [itemData])
        // Displays the sheet of the newly created item.
        .then(itmData => {
          const itemId = itmData[0].id;
          const item = this.actor.items.get(itemId);
          item.sheet.render(true);
        })
    );
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

  _onItemChat(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.displayCard();
  }

  _onItemEquip(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const equipped = item.system.equipped;
    const updateData = { 'system.equipped': !equipped };
    if (!equipped && item.system.backpack) updateData['system.backpack'] = false;
    return item.update(updateData);
  }

  _onItemStore(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const stored = item.system.backpack;
    const updateData = { 'system.backpack': !stored };
    if (!stored && item.system.equipped) updateData['system.equipped'] = false;
    return item.update(updateData);
  }

  /* ------------------------------------------- */

  _onWeaponAmmoChange(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const itemId = elem.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const value = +elem.value;
    return item.update({ 'system.mag.value': value });
  }

  /* ------------------------------------------- */

  /** Left-clic: +1, Right-clic: -1 */
  _onValueChange(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const min = +elem.dataset.min || 0;
    const max = +elem.dataset.max || 10;
    const field = elem.dataset.field;
    const currentCount = foundry.utils.getProperty(this.actor, `system.${field}`) || 0;
    let newCount = currentCount;

    if (event.type === 'click') newCount++;
    else newCount--; // contextmenu
    newCount = Math.clamped(newCount, min, max);

    return this.actor.update({ [`system.${field}`]: newCount });
  }
}
