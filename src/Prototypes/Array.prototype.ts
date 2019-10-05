// how to implement into code?
interface Array<T> {
	/**
	 * Returns a random array element from an array.
	 * @param {T[]} arr Array of elements.
	 * @returns {T} An element of that array.
	 */
	randomElement(): T;
	/**
	 * Returns an array with only unique elements (i.e. one of each element).
	 * @returns {T[]} The array with unique elements.
	 */
}

Array.prototype.randomElement = function () {
	return this[Math.floor(Math.random() * this.length)];
};
