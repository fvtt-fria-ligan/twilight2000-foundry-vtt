/**
 * Defines a set of template paths to pre-load.
 * Pre-loaded templates are compiled and cached for fast access when rendering.
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  return loadTemplates([
    // Shared Partials
    // 'templates/dice/roll.html',

    // Actor Sheet Partials
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

    // Vehicle Sheet Partials
    'systems/t2k4e/templates/actors/parts/vehicle-crew.hbs',
    'systems/t2k4e/templates/actors/parts/vehicle-combat.hbs',
    'systems/t2k4e/templates/actors/parts/vehicle-cargo.hbs',
    'systems/t2k4e/templates/actors/parts/vehicle-components.hbs',
    'systems/t2k4e/templates/actors/parts/slots/vehicle-weapon-slot.hbs',

    // Item Sheet Partials
    'systems/t2k4e/templates/items/parts/item-header.hbs',
    'systems/t2k4e/templates/items/parts/item-modifiers.hbs',
    'systems/t2k4e/templates/items/parts/item-description.hbs',

    // Chat Partials
  ]);
}

/* -------------------------------------------- */
/*  HandlebarsJS Custom Helpers                 */
/* -------------------------------------------- */

/**
 * Defines Handlebars custom Helpers and Partials.
 */
export function registerHandlebars() {

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

  Handlebars.registerHelper('toUpperCase', function(str) {
    return str.toUpperCase();
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

  Handlebars.registerHelper('mathMin', function(a, b) {
    return Math.min(a, b);
  });

  Handlebars.registerHelper('mathMax', function(a, b) {
    return Math.max(a, b);
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
  Handlebars.registerPartial('scoreSelector',
    `<select name="{{name}}" class="score-selector">
      {{#select selected}}
      {{#each @root.config.dieScores}}
      <option value="{{.}}">{{.}}</option>
      {{/each}}
      {{/select}}
    </select>`,
  );
}