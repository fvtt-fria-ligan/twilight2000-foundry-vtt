import ActorT2K from '../../actor/actor.js';
import ItemT2K from '../../item/item.js';
import T2KDialog from '../dialog/dialog.js';
import { getRollingActor, rollPush } from '../roll/dice.js';
import { T2K4E } from '../../system/config.js';

export default class ChatMessageTW2K4E extends foundry.documents.ChatMessage {
  prepareData() {
    super.perpareData();
  }
  static addChatListeners(html) {
    ActorT2K.chatListeners(html);
    ItemT2K.chatListeners(html);

    const buttonsPush = html.querySelectorAll('.dice-button.push');
    for (let i = 0; i < buttonsPush.length; i++) {
      buttonsPush[i].addEventListener('click', _onRollPush);
    }
    const buttonsApply = html.querySelectorAll('.dice-button.accept');
    for (let i = 0; i < buttonsApply.length; i++) {
      buttonsApply[i].addEventListener('click', _onRollAccept);
    }
    // html.on('click', '.dice-button.push', _onRollPush);
    // html.on('click', '.dice-button.accept', _onRollAccept);
  }

  static hideChatActionButtons(html) {
    console.log('passed HTML: ', html);
    // const button = html.querySelectorAll('.card-buttons button');
    const chatCard = html.querySelectorAll('.t2k4e.chat-card');
    console.log('Gathered HTML: ', chatCard);

    // Exits early if no chatCard were found.
    if (chatCard.length <= 0) return;
    console.log('data-actor-id: ', chatCard[0].dataset.actorId);
    // Hides buttons.
    chatCard.forEach(card =>{
      const actor = game.actors.get(card.dataset.actorId);
      console.log('card: ', card);
      const buttons = card.querySelectorAll('button');
      console.log(actor);
      for (const btn of buttons) {
        if (actor && !actor.isOwner) btn.style.display = 'none';
      }
    });
  }

}

/**
 * Adds Event Listeners to the Chat log.
 * @param {HTMLElement} html The DOM
 */
// export function addChatListeners(html) {
//   ActorT2K.chatListeners(html);
//   ItemT2K.chatListeners(html);
//   html.on('click', '.dice-button.push', _onRollPush);
//   html.on('click', '.dice-button.accept', _onRollAccept);
// }

/* ------------------------------------------- */
/*  Roll Push                                  */
/* ------------------------------------------- */

/**
 * Triggers a push from the chat.
 * @param {Event} event
 * @returns {Promise<import('../lib/yzur.js').YearZeroRoll|ChatMessage>}
 */
function _onRollPush(event) {
  event.preventDefault();

  // Disables the button to avoid any tricky double push.
  const button = event.currentTarget;
  button.disabled = true;

  // Gets infos and requires a push.
  const chatCard = event.currentTarget.closest('.chat-message');
  const messageId = chatCard.dataset.messageId;
  const message = game.messages.get(messageId);
  const roll = message.rolls[0];
  return rollPush(roll, { message });
}

/* ------------------------------------------- */
/*  Roll Accept                                */
/* ------------------------------------------- */

/**
 * Accepts a roll in the chat.
 * @param {Event} event
 * @returns {Promise<import('../lib/yzur.js').YearZeroRoll|ChatMessage>}
 */
function _onRollAccept(event) {
  event.preventDefault();

  // Disables the button to avoid any tricky double push.
  const button = event.currentTarget;
  button.disabled = true;

  // Gets infos and requires a push.
  const chatCard = event.currentTarget.closest('.chat-message');
  const messageId = chatCard.dataset.messageId;
  const message = game.messages.get(messageId);
  /** @type {import('yzur').YearZeroRoll} */
  const roll = message.rolls[0];
  roll.maxPush = 0;
  return message.update({ rolls: [JSON.stringify(roll)] });
}

/* ------------------------------------------- */
/*  Utility Methods                            */
/* ------------------------------------------- */

/**
 * Gets the Actor which is the source of a chat card.
 * @param {HTMLElement} card The card being used
 * @return {Actor}
 */
export function getChatCardActor(card) {
  // Case 1 — A Synthetic Actor from a Token
  const tokenKey = card.dataset.tokenId;
  if (tokenKey) {
    const [sceneId, tokenId] = tokenKey.split('.');
    const scene = game.scenes.get(sceneId);
    if (!scene) return null;
    const token = scene.getEmbeddedDocument('Token', tokenId);
    // if (!tokenData) return null;
    // const token = new Token(tokenData);
    return token.actor;
  }

  // Case 2 — Use Actor ID instead
  const actorId = card.dataset.actorId;
  return game.actors.get(actorId);
}

/* ------------------------------------------- */
/*  Context Menu (right-clic)                  */
/* ------------------------------------------- */

/**
 * Adds a context menu (right-clic) to Chat messages.
 * @param {Object} html DOM
 * @param {Object} options Options
 * @link https://www.youtube.com/watch?v=uBC5DSci0NI
 */
export function addChatMessageContextOptions(html, options) {
  // TODO: See Part 6, 6:55
  // Allows only this menu option if we have selected some tokens
  // & the message contains some damage.
  const canDefend = li => game.user.targets.size && li.find('.dice-roll').length;
  options.push({
    name: game.i18n.localize('T2K4E.Chat.Actions.ApplyDamage'),
    icon: T2K4E.Icons.buttons.attack,
    condition: canDefend,
    callback: li => _applyDamage(li[0]),
  });
  return options;
}

/* ------------------------------------------- */

async function _applyDamage(messageElem) {
  const messageId = messageElem.dataset.messageId;
  const message = game.messages.get(messageId);
  /** @type {import('../lib/yzur.js').YearZeroRoll} */
  const roll = message.rolls[0];

  // Gets the weapon.
  const actorId = roll.options.actorId;
  const tokenKey = roll.options.tokenKey;
  const actor = getRollingActor({ actorId, tokenKey });
  const itemId = roll.options.itemId;
  const item = actor ? actor.items.get(itemId) : game.items.get(itemId);

  // Prepares the attack's data.
  let attackData = foundry.utils.duplicate(item.system);
  if (actor && item.hasAmmo) {
    const ammo = actor.items.get(item.system.mag.target);
    if (ammo && ammo.system.override) {
      const ammoData = foundry.utils.duplicate(ammo.system);
      attackData = foundry.utils.mergeObject(attackData, ammoData);
    }
  }
  const loc = roll.bestHitLocation;
  if (loc > 0) attackData.location = T2K4E.hitLocs[loc - 1];

  // Gets the selected tokens.
  const defenders = game.user.targets;
  for (const defender of defenders) {
    const s = roll.baseSuccessQty;
    let damage = s > 0 ? attackData.damage + 1 * (s - 1) : 0;
    const isGM = game.user.isGM;
    let hitCount = message.getFlag('t2k4e', 'hitCountLeft') ?? roll.hitCount;
    attackData.cover = defender.actor.cover;
    let barrier = 0;
    if (attackData.cover === 'fullCover') barrier = 2;
    else if (attackData.cover === 'partialCover') barrier = 1;
    if (isGM || hitCount) {
      const opts = await T2KDialog.chooseDamage({
        damage,
        hitCount,
        location: attackData.location,
        target: defender.name,
        barrier,
        isGM,
      });
      if (opts.cancelled) {
        return;
      }
      else {
        damage = opts.damage + opts.hitCount;
        if (opts.hitCount) {
          hitCount = Math.max(0, hitCount - opts.hitCount);
          await message.setFlag('t2k4e', 'hitCountLeft', hitCount);
        }
      }
      attackData.barriers = opts.barriers ? opts.barriers.split(',') : [];
    }
    await defender.actor.applyDamage(damage, attackData, damage !== 0);
  }
}

/* ------------------------------------------- */
/*  Auto-closing Roll Tooltip                  */
/* ------------------------------------------- */

/**
 * Closes the Roll tooltip
 * @param {ChatMessage} message The message
 * @param {HTMLElement} html DOM
 * @param {number} delay How many time to wait before closing the tooltips
 */
export function closeRollTooltip(message, html, delay = 60000) {
  if (!message.isRoll) return;
  const divs = html.find('.dice-result');
  if (!divs?.length) return;

  const div = divs[0];
  if (!div) return;

  setTimeout(() => {
    // tooltip.style.display = 'none';
    div.click();
  }, delay);
}

/* ------------------------------------------- */
/*  Hiding Buttons                             */
/* ------------------------------------------- */

/**
 * Hides buttons of Chat messages for non-owners.
 * @param {HTMLElement} html DOM
 */
