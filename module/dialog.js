/**
 * Just a small extend of the default Foundry Dialog class with input focus.
 * @extends {Dialog}
 */
export default class T2KDialog extends Dialog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Input Focus
    html.find('input').focus(ev => ev.currentTarget.select());

    // Range Pickers
    html.find('input[type=range]').change(event => {
      event.preventDefault();
      const elem = event.currentTarget;
      const span = elem.nextElementSibling;
      if (['attribute', 'skill'].includes(elem.name)) {
        span.innerHTML = elem.value < 6 ? 0 : elem.value;
      }
      else {
        span.innerHTML = elem.value;
      }
    });

    // Modifier Buttons
    html.find('.modifier-change').click(event => {
      event.preventDefault();
      const elem = event.currentTarget;
      const target = html.find(`input[name="${elem.dataset.target}"]`)[0];
      let value = parseInt(target.value);
      switch (elem.dataset.change) {
        case 'plus': value++; break;
        case 'minus': value--; break;
      }
      target.value = value >= 0 ? `+${value}` : value;
    });

    html.find('input[type=checkbox].item-modifier').on('change', function() {
      const modifierInput = html.find('input[name=modifier]')[0];
      let value = +modifierInput.value;
      if (this.checked) value += +this.dataset.value;
      else value -= +this.dataset.value;
      modifierInput.value = value >= 0 ? `+${value}` : value;
    });
  }

  /* -------------------------------------------- */
  /*  Roll Dialog                                 */
  /* -------------------------------------------- */

  /**
   * Renders a dialog for roll options.
   * @param {object} rollData
   * @param {object} options
   * @returns {Promise}
   * @static
   * @async
   */
  static async askRollOptions(rollData, options) {
    const template = 'systems/t2k4e/templates/dialog/roll-dialog.hbs';
    const content = await renderTemplate(template, {
      data: rollData,
      config: CONFIG.T2K4E,
    });

    return new Promise(resolve => {
      // Sets the data of the dialog.
      const data = {
        title: rollData.title,
        content,
        buttons: {
          normal: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Normal'),
            callback: html => resolve(T2KDialog._processRollOptions(html[0].querySelector('form'))),
          },
          cancel: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Cancel'),
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: 'normal',
        close: () => resolve({ cancelled: true }),
      };
      // Renders the dialog.
      new this(data, options).render(true);
    });
  }

  static _processRollOptions(form) {
    return {
      attribute: parseInt(form.attribute?.value) || 0,
      skill: parseInt(form.skill?.value) || 0,
      rof: parseInt(form.rof?.value) || 0,
      modifier: parseInt(form.modifier.value) || 0,
      locate: form.locate.checked,
      maxPush: parseInt(form.maxPush.value) || 1,
      rollMode: form.rollMode.value,
    };
  }

  /* -------------------------------------------- */
  /*  CuF Dialog                                 */
  /* -------------------------------------------- */

  /**
   * Renders a dialog for CUF options.
   * @param {object} rollData
   * @param {object} options
   * @returns {Promise}
   * @static
   * @async
   */
  static async askCuFOptions(rollData, options) {
    const template = 'systems/t2k4e/templates/dialog/cuf-dialog.hbs';
    const content = await renderTemplate(template, {
      data: rollData,
      config: CONFIG.T2K4E,
    });

    return new Promise(resolve => {
      // Sets the data of the dialog.
      const data = {
        title: rollData.title,
        content,
        buttons: {
          normal: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Normal'),
            callback: html => resolve(T2KDialog._processCuFOptions(html[0].querySelector('form'))),
          },
          cancel: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Cancel'),
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: 'normal',
        close: () => resolve({ cancelled: true }),
      };
      // Renders the dialog.
      new this(data, options).render(true);
    });
  }

  static _processCuFOptions(form) {
    return {
      unitMorale: form.unitMorale.checked,
      modifier: parseInt(form.modifier.value) || 0,
      maxPush: parseInt(form.maxPush.value) || 1,
      rollMode: form.rollMode.value,
    };
  }

  /* -------------------------------------------- */
  /*  Actor Choice Dialog                         */
  /* -------------------------------------------- */

  /**
   * Renders a dialog for choosing an actor.
   * @param {Actor[]} actors
   * @param {object} options
   * @returns {Promise}
   * @static
   * @async
   */
  static async chooseActor(actors, options) {
    const template = 'systems/t2k4e/templates/dialog/actor-choice-dialog.hbs';
    const content = await renderTemplate(template, {
      actors,
      config: CONFIG.T2K4E,
    });

    return new Promise(resolve => {
      // Sets the data of the dialog.
      const data = {
        title: game.i18n.localize('T2K4E.Dialog.Actor.ChooseActor'),
        content,
        buttons: {
          ok: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Ok'),
            callback: html => resolve(T2KDialog._processActorChoice(html[0].querySelector('form'))),
          },
          cancel: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Cancel'),
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: 'ok',
        close: () => resolve({ cancelled: true }),
      };
      // Renders the dialog.
      new this(data, options).render(true);
    });
  }

  static _processActorChoice(form) {
    return {
      actor: form.actor.value,
    };
  }

  /* -------------------------------------------- */
  /*  Damage Choice Dialog                        */
  /* -------------------------------------------- */

  /**
   * Renders a dialog for choosing a quantity of damage.
   * @param {object} damageData
   * @param {object} options
   * @returns {Promise}
   * @static
   * @async
   */
  static async chooseDamage(damageData, options) {
    const template = 'systems/t2k4e/templates/dialog/damage-choice-dialog.hbs';
    const content = await renderTemplate(template, {
      data: damageData,
      config: CONFIG.T2K4E,
    });

    return new Promise(resolve => {
      // Sets the data of the dialog.
      const data = {
        title: game.i18n.localize('T2K4E.Dialog.Damage.ChooseDamage'),
        content,
        buttons: {
          ok: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Ok'),
            callback: html => resolve(T2KDialog._processDamageChoice(html[0].querySelector('form'))),
          },
          cancel: {
            label: game.i18n.localize('T2K4E.Dialog.Actions.Cancel'),
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: 'ok',
        close: () => resolve({ cancelled: true }),
      };
      // Renders the dialog.
      new this(data, options).render(true);
    });
  }

  static _processDamageChoice(form) {
    return {
      damage: parseInt(form.damage.value) || 0,
      hitCount: parseInt(form.hits?.value) || 0,
      barriers: form.barriers?.value,
    };
  }
}