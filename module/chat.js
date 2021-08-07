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
  const roll = message.roll;
  return rollPush(roll, { message });
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
 */
export function addChatMessageContextOptions(html, options) {
  // TODO: See Part 6, 6:55
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
export function hideChatActionButtons(html) {
  const chatCard = html.find('.t2k4e.chat-card');

  // Exits early if no chatCard were found.
  if (chatCard.length <= 0) return;

  // Hides buttons.
  const actor = game.actors.get(chatCard.attr('data-actor-id'));
  const buttons = chatCard.find('button');
  for (const btn of buttons) {
    if (actor && !actor.isOwner) btn.style.display = 'none';
  }
}