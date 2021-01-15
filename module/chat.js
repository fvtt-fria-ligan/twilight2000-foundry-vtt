import * as Dice from './dice.js';

/**
 * Adds Event Listeners to the Chat log.
 * @param {Object} html The DOM
 */
export function addChatListeners(html) {
	html.on('click', 'button.weapon-attack', _onAttack);
	html.on('click', 'button.weapon-reload', _onReload);
	html.on('click', 'button.roll-push', _onRollPush);
}

function _onAttack(event) {
	event.preventDefault();
	const card = event.currentTarget.closest('.weapon');
	const attacker = game.actors.get(card.dataset.ownerId);
	const weapon = attacker.getOwnedItem(card.dataset.itemId);
	return Dice.Attack(attacker, weapon);
}

function _onReload(event) {
	event.preventDefault();
	const card = event.currentTarget.closest('.weapon');
	const attacker = game.actors.get(card.dataset.ownerId);
	const weapon = attacker.getOwnedItem(card.dataset.itemId);
	// return Dice.Reload(attacker, weapon);
	return weapon.reload();
}

function _onRollPush(event) {
	event.preventDefault();
	const card = event.currentTarget.closest('.roll-card');
	const owner = game.actors.get(card.dataset.ownerId);
	return Dice.Push(owner, event.currentTarget.dataset.rollId);
}

export function addChatMessageContextOptions(html, options) {
	// TODO: See Part 6, 6:55
}