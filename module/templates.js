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
		// 'systems/t2k4e/templates/chat/roll.hbs',
		// 'systems/t2k4e/templates/chat/weapon-chat.hbs',
		// 'systems/t2k4e/templates/chat/armor-chat.hbs',
	]);
}

/**
 * Defines Handlebars custom Helpers and Partials.
 */
export function registerHandlebars() {
	/* -------------------------------------------- */
	/*  HandlebarsJS Custom Helpers                 */
	/* -------------------------------------------- */

	Handlebars.registerHelper('concat', function() {
		let str = '';
		for (const arg in arguments) {
			if (typeof arguments[arg] !== 'object') {
				str += arguments[arg];
			}
		}
		return str;
	});
	
	Handlebars.registerHelper('toLowerCase', function(str) {
		return str.toLowerCase();
	});

	Handlebars.registerHelper('times', function(n, content) {
		let str = '';
		for (let i = 0; i < n; i++) {
			content.data.max = n;
			content.data.index = i + 1;
			str += content.fn(i);
		}
		return str;
	});

	Handlebars.registerHelper('add', function(a, b) {
		return a + b;
	});

	Handlebars.registerHelper('divide', function(a, b) {
		return a / b;
	});

	Handlebars.registerHelper('multiply', function(a, b) {
		return a * b;
	});

	Handlebars.registerHelper('ratio', function(a, b) {
		return (a / b) * 100;
	});

	/**
	 * Templates for a die Score selector.
	 * Parameters:
	 * * `name` - The name of the affected variable.
	 * * `selected` - The current selected value.
	 */
	Handlebars.registerPartial(
		'scoreSelector',
		`<select name="{{name}}" class="score-selector">
			{{#select selected}}
			{{#each @root.config.dieScores}}
			<option value="{{.}}">{{.}}</option>
			{{/each}}
			{{/select}}
		</select>`
	);
}