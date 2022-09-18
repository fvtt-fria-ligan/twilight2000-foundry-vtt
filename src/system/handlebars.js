/**
 * Defines a set of template paths to pre-load.
 * Pre-loaded templates are compiled and cached for fast access when rendering.
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  // /* Esbuild defines the paths for us at build time. */
  // // eslint-disable-next-line no-undef
  // const paths = PATHS;
  // console.log('T2K4E | Loading Handlebars templates:', paths);
  // return loadTemplates(paths);
  return loadTemplates([
    // Shared Partials
    // 'templates/dice/roll.html',

    // Actor Sheet Partials
    'systems/t2k4e/templates/actor/parts/actor-stats.hbs',
    'systems/t2k4e/templates/actor/parts/actor-combat.hbs',
    'systems/t2k4e/templates/actor/parts/actor-equipment.hbs',
    'systems/t2k4e/templates/actor/parts/actor-description.hbs',
    'systems/t2k4e/templates/actor/parts/capacity-boxes.hbs',
    'systems/t2k4e/templates/actor/parts/radiation-boxes.hbs',
    'systems/t2k4e/templates/actor/parts/slots/slot-buttons.hbs',
    'systems/t2k4e/templates/actor/parts/slots/weapon-slot.hbs',
    'systems/t2k4e/templates/actor/parts/slots/armor-slot.hbs',
    'systems/t2k4e/templates/actor/parts/slots/gear-slot.hbs',
    'systems/t2k4e/templates/actor/parts/slots/ammo-slot.hbs',

    // Vehicle Sheet Partials
    'systems/t2k4e/templates/actor/parts/vehicle-crew.hbs',
    'systems/t2k4e/templates/actor/parts/vehicle-combat.hbs',
    'systems/t2k4e/templates/actor/parts/vehicle-cargo.hbs',
    'systems/t2k4e/templates/actor/parts/vehicle-components.hbs',
    'systems/t2k4e/templates/actor/parts/slots/vehicle-weapon-slot.hbs',

    // Party Sheet Partials
    'systems/t2k4e/templates/actor/party/sheet-tabs/main-tab.hbs',
    'systems/t2k4e/templates/actor/party/sheet-tabs/travel-tab.hbs',
    'systems/t2k4e/templates/actor/party/components/action-component.hbs',
    'systems/t2k4e/templates/actor/party/components/member-component.hbs',

    // Item Sheet Partials
    'systems/t2k4e/templates/item/parts/item-header.hbs',
    'systems/t2k4e/templates/item/parts/item-modifiers.hbs',
    'systems/t2k4e/templates/item/parts/item-description.hbs',

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
  Handlebars.registerHelper('concat', function () {
    let str = '';
    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        str += arguments[arg];
      }
    }
    return str;
  });

  Handlebars.registerHelper('capitalize', function (val) {
    return typeof val === 'string' && val.length > 0 ? val[0].toUpperCase() + val.slice(1) : val;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('toUpperCase', function (str) {
    return str.toUpperCase();
  });

  // Handlebars.registerHelper('flps_enrich', function (content) {
  //   // Enriches content.
  //   content = TextEditor.enrichHTML(content, { documents: true, async: true });
  //   return new Handlebars.SafeString(content);
  // });

  Handlebars.registerHelper('times', function (n, content) {
    let str = '';
    for (let i = 0; i < n; i++) {
      content.data.max = n;
      content.data.index = i + 1;
      str += content.fn(i);
    }
    return str;
  });

  Handlebars.registerHelper('mathMin', function (a, b) {
    return Math.min(a, b);
  });

  Handlebars.registerHelper('mathMax', function (a, b) {
    return Math.max(a, b);
  });

  Handlebars.registerHelper('add', function (a, b) {
    return a + b;
  });

  Handlebars.registerHelper('divide', function (a, b) {
    return a / b;
  });

  Handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
  });

  Handlebars.registerHelper('ratio', function (a, b) {
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
    </select>`,
  );
}
