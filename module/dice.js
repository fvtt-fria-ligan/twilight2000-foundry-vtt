import { T2K4E } from './config.js';

/**
 * Gets the size of a die from its rating.
 * @param {string} score A, B, C, D or F
 */
export function getDieSize(score) {
	if (typeof score !== 'string') throw new TypeError(`Die Score Not a String: "${score}"`);
	if (score.length !== 1) throw new SyntaxError(`Die Score Incorrect: "${score}"`);

	const size = T2K4E.dieSizesMap.get(score);

	if (size == undefined) throw new RangeError(`Die Size Not Found! Score: "${score}"`);

	return size;
}