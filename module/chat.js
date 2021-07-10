import ActorT2K from './actor/actor.js';
import ItemT2K from './item/item.js';
import { rollPush } from './dice.js';

/**
 * Adds Event Listeners to the Chat log.
 * @param {HTMLElement} html The DOM
 */
export function addChatListeners(html) {
  ActorT2K.chatListeners(html);
  ItemT2K.chatListeners(html);
  html.on('click', '.dice-button.push', _onRollPush);
}

/* ------------------------------------------- */
/*  Roll Push                                  */
/* ------------------------------------------- */

/**
 * Triggers a push from the chat.
 * @param {Event} event
 * @returns {Promise<import('../lib/yzur.js').YearZeroRoll>}
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
  const roll = message.roll;
  return rollPush(roll, message);
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
    // const scene = game.scenes.get(sceneId);
    // if (!scene) return null;
    // const tokenData = scene.getEmbeddedEntity('Token', tokenId);
    // if (!tokenData) return null;
    // const token = new Token(tokenData);
    const token = game.actors.tokens[tokenId];
    return token;
  }

  // Case 2 — Use Actor ID instead
  const actorId = card.dataset.actorId;
  return game.actors.get(actorId);
}

// function _onAttack(event) {
//   event.preventDefault();
//   const card = event.currentTarget.closest('.weapon');
//   const attacker = game.actors.get(card.dataset.ownerId);
//   const weapon = attacker.items.get(card.dataset.itemId);
//   return Dice.Attack(attacker, weapon);
// }

// function _onReload(event) {
//   event.preventDefault();
//   const card = event.currentTarget.closest('.weapon');
//   const attacker = game.actors.get(card.dataset.ownerId);
//   const weapon = attacker.items.get(card.dataset.itemId);
//   // return Dice.Reload(attacker, weapon);
//   return weapon.reload();
// }

// function _onRollPush(event) {
//   event.preventDefault();
//   const card = event.currentTarget.closest('.roll-card');
//   const actor = game.actors.get(card.dataset.actorId);
//   return Dice.Push(card.dataset.rollId, actor);
// }

/* ------------------------------------------- */
/*  Context Menu (right-clic)                  */
/* ------------------------------------------- */

/**
 * Adds a context menu (right-clic) to Chat messages.
 * @param {Object} html DOM
 * @param {Object} options Options
 */
export function addChatMessageContextOptions(html, options) {
  // TODO: See Part 6, 6:55
}

/* ------------------------------------------- */
/*  Hiding Buttons                             */
/* ------------------------------------------- */

/**
 * Hides buttons of Chat messages for non-owners.
 * @param {Object} message (app) Message
 * @param {Object} html DOM
 * @param {Object} data Additional data
 */
export function hideChatActionButtons(message, html, data) {
  return;
  const chatCard = html.find('.t2k4e.chat-card');

  // Exits early if no chatCard were found.
  if (chatCard.length <= 0) return;

  // Hides buttons.
  const pushable = game.t2k4e.rolls.has(chatCard.attr('data-roll-id'));
  const actor = game.actors.get(chatCard.attr('data-actor-id'));
  const buttons = chatCard.find('button');
  for (const btn of buttons) {
    if (actor && !actor.isOwner) btn.style.display = 'none';
    else if (btn.className === 'roll-push' && !pushable) btn.style.display = 'none';
  }

  // Hides buttons for non-owners.
  // const actor = game.actors.get(chatCard.attr('data-actor-id'));
  // if (actor && !actor.isOwner) {
  // 	const buttons = chatCard.find('button');
  // 	for (const btn of buttons) {
  // 		btn.style.display = 'none';
  // 	}
  // }

  // Hides push buttons for non-pushable rolls.
  // const pushButton = chatCard.find('button.roll-push')[0];
  // if (pushButton) {
  // 	pushButton.style.display = game.t2k4e.rolls.has(chatCard.attr('data-roll-id')) ? 'block' : 'none';
  // }
}