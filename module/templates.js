/**
 * Defines a set of template paths to pre-load.
 * Pre-loaded templates are compiled and cached for fast access when rendering.
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([
		// Shared Partial
		'templates/dice/roll.html',

		// Actor Sheet Partial
		'systems/t2k4e/templates/actors/parts/actor-stats.hbs',
		'systems/t2k4e/templates/actors/parts/actor-combat.hbs',
		'systems/t2k4e/templates/actors/parts/actor-equipment.hbs',
		'systems/t2k4e/templates/actors/parts/actor-description.hbs',
		'systems/t2k4e/templates/actors/parts/capacity-boxes.hbs',
		'systems/t2k4e/templates/actors/parts/radiation-boxes.hbs',
		'systems/t2k4e/templates/actors/parts/slots/slot-buttons.hbs',
		'systems/t2k4e/templates/actors/parts/slots/weapon-slot.hbs',
		'systems/t2k4e/templates/actors/parts/slots/weapon-slot-unarmed.hbs',
		'systems/t2k4e/templates/actors/parts/slots/armor-slot.hbs',
		'systems/t2k4e/templates/actors/parts/slots/gear-slot.hbs',
		'systems/t2k4e/templates/actors/parts/slots/ammo-slot.hbs',

		// Item Sheet Partial
		'systems/t2k4e/templates/items/parts/item-header.hbs',
		'systems/t2k4e/templates/items/parts/item-modifiers.hbs',
		'systems/t2k4e/templates/items/parts/item-description.hbs',
		
		// Chat Partials
		'systems/t2k4e/templates/chat/roll.hbs',
		'systems/t2k4e/templates/chat/weapon-chat.hbs',
	]);
}
