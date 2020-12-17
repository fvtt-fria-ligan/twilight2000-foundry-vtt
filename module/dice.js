import { T2K4E } from './config.js';

/**
 * Gets the range of a die from its rating.
 * @param {string} score A, B, C, D or F
 */
export function getDieSize(score) {
	if (typeof score !== 'string') throw new TypeError(`Die Score Not a String: "${score}"`);
	if (score.length !== 1) throw new SyntaxError(`Die Score Incorrect: "${score}"`);

	const range = T2K4E.dieSizesMap.get(score);

	if (range == undefined) throw new RangeError(`Die Size Not Found! Score: "${score}"`);

	return range;
}