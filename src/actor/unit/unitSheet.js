import ActorSheetT2K from '../actorSheet.js';
import { T2K4E } from '../../system/config.js';

/**
 * Twilight 2000 Actor Sheet for Units.
 * @extends {ActorSheetT2K} Extends the T2K ActorSheet
 */
export default class ActorSheetT2KUnit extends ActorSheetT2K {

  /* ------------------------------------------- */
  /*  Sheet Properties                           */
  /* ------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'item', 'unit'],
      width: 400,
      height: 550,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'features' }],
    });
  }

  /* ------------------------------------------- */
  /*  Sheet Data Preparation                     */
  /* ------------------------------------------- */

  // /** @override */
  // getData() {
  //   const sheetData = super.getData();
  //   return sheetData;
  // }

  /* ------------------------------------------- */

  /* ------------------------------------------- */
  /*  Sheet Listeners                            */
  /* ------------------------------------------- */

  // /** @override */
  // activateListeners(html) {
  //   super.activateListeners(html);

  //   // Everything below here is only needed if the sheet is editable.
  //   if (!this.options.editable) return;
  //   if (!this.isEditable) return;

  //   // Owner-only listeners.
  //   if (this.actor.isOwner) {}
  // }

  /* ------------------------------------------- */
}
