// how to implement into code?
interface Array<T> {
	/**
	 * Adds an element at the specified index.
	 * @param {number} index The index.
	 * @param {any} value The value to add.
	 * @returns {number} The length.
	 */
	add(index: number, value: T): number;
	/**
	 * Shuffles the array elements.
	 * @returns {T[]} The array.
	 */
	shuffle(): Array<T>;
	/**
	 * Returns a random array element from an array.
	 * @param {T[]} arr Array of elements.
	 * @returns {T} An element of that array.
	 */
	randomElement(): T;
	/**
	 * Removes holes in an array, if any, and merges any arrays in the array as an element. This only works for `any[][]`.
	 * @returns {T[]} The flattened array.
	 */
	flatten(): Array<T>;
	/**
	 * Removes holes in an array, if any, and merges any arrays into the array as an element. This can work for `any[][]...[]`.
	 * @returns {T[]} The flattened array.
	 */
	flattenDeep(): Array<T>;
	/**
	 * Returns an array with only unique elements (i.e. one of each element).
	 * @returns {T[]} The array with unique elements.
	 */
	unique(): Array<T>;
}

Array.prototype.add = function (index: number, value: any) {
	if (this.length - 1 < index) {
		this.push(value);
	} else if (value < 0) {
		this.splice(0, 0, value);
	} else {
		this.splice(index, 0, value);
	}
	return this.length;
};

Array.prototype.shuffle = function () {
	let i = this.length;
	while (i) {
		let j = Math.floor(Math.random() * i);
		let t = this[--i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
};

Array.prototype.randomElement = function () {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.flatten = function () {
	return this.reduce((acc, val) => acc.concat(val), []);
};

Array.prototype.flattenDeep = function () {
	// Removes array holes too
	return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flattenDeep()) : acc.concat(val), []);
};

Array.prototype.unique = function () {
	return [...new Set(this)];
};