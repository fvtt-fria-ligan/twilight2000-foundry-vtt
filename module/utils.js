/**
 * Generates a random integer between [min, max] (included).
 * @param {number} min Minimum threshold
 * @param {number} max Maximum threshold
 * @returns {number} The randomized integer
 */
export function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Clamps a value to ensure it sits within a designated range.
 *
 * Called with no arguments, this function returns a value to fall
 * between 0 - 1, offering a useful shorthand for validating multipliers.
 *
 * @param {number} input Value to operate upon
 * @param {number} min Lower threshold; defaults to 0
 * @param {number} max Upper threshold; defaults to 1
 * @return {number}
 */
export function clamp(input, min, max) {
	return Math.min(Math.max(input, min || 0), undefined === max ? 1 : max);
}