export default class NumberFunctions {
	/**
	 * @description Gets a random integer, inclusive.
	 * @param {number} min the minimum value.
	 * @param {number} max The maximum value.
	 * @returns {number} The random integer.
	 * 
	 * @example functions.randomInt(1, 5); // Returns (example): 4
	 */
	public static randomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
}