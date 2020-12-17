/**
 * Defines a set of template paths to pre-load.
 * Pre-loaded templates are compiled and cached for fast access when rendering.
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([

	// Shared Partial


	// Actor Sheet Partial


	// Item Sheet Partial
	"systems/t2k4e/templates/items/parts/item-header.hbs",
	"systems/t2k4e/templates/items/parts/item-description.hbs"
	
	]);
}
