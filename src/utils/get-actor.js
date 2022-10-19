export async function getActiveActor() {
  let actor;
  if (canvas.tokens.controlled.length > 1) {
    return chooseActor(canvas.tokens.controlled.map(t => t.actor), {
      title: game.i18n.localize('T2K4E.MACRO.GetActorTitle'),
      notes: game.i18n.localize('T2K4E.MACRO.GetActorHint'),
    });
  }
  const speaker = ChatMessage.getSpeaker();
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (!actor) {
    ui.notifications.warn(game.i18n.format('T2K4E.MACRO.NoActor', {
      actor: JSON.stringify(speaker),
    }));
    return;
  }
  return actor;
}

/**
 * Displays a dialog for requesting the choice of an Actor.
 * @see {@link Dialog}
 * @param {Actor[]} actors
 * @param {Object} [options]
 * @param {string} [options.title]
 * @param {string} [options.notes]
 * @returns {Promise<Actor>} Selected Actor
 */
export async function chooseActor(actors = [], options = {}) {
  let content = '<form><div class="form-group">'
    + '<select name="actor" style="width: 100%;">';

  actors.forEach((a, i) => {
    content += `<option value="${a.id}"${i === 0 ? ' selected' : ''}>`
      + `<img src="${a.img}" width="24" height="24"/>`
      + `${a.name} (HP: ${a.health.value}/${a.health.max}) (ID: ${a.id})`
      + '</option>';
  });

  content += '</select>';
  if (options.notes) content += `<p class="notes">${options.notes}</p>`;
  content += '</div></form>';

  const actorId = await Dialog.prompt({
    title: options.title ?? 'Choose an Actor',
    content,
    label: game.i18n.localize('T2K4E.Dialog.Actions.Ok'),
    callback: html => html[0].querySelector('form').actor.value,
    rejectClose: false,
    options: {
      width: 400,
      classes: ['blade-runner', 'dialog'],
      minimizable: false,
    },
  });

  return actors.find(a => a.id === actorId);
}
