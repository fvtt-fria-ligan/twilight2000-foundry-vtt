import { T2K4E } from './config.js';

/**
 * Gets the range of a die from its rating.
 * @param {string} rating A, B, C, D or F
 */
export function getDieRangeFromRating(rating) {
	if (typeof rating !== 'string') throw new TypeError(`Die Rating Not a String: ${rating}`);
	if (rating.length !== 1) throw new SyntaxError(`Die Rating Incorrect: ${rating}`);

	const range = T2K4E.diceRangesMap.get(rating);

	if (range == undefined) throw new RangeError(`Die Rating Not Found: ${rating}`);

	return range;
}