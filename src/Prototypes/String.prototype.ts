interface String {
	/**
	 * Makes every first letter of each word capital.
	 * @returns {string} The string with title case.
	 */
	toTitleCase(): string;
	/**
	 * Splits the string based on lowercase/uppercase association.
	 * @returns {string} The split string.
	 */
	splitAndTitle(): string;
}

String.prototype.toTitleCase = function () {
	let str = this.split(' ');
	for (let i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
};

String.prototype.splitAndTitle = function () {
	let strToSplit = this.split(/(?=[A-Z])/).join(" ");
	let firstLetter = strToSplit.charAt(0).toUpperCase();
	return firstLetter + strToSplit.slice(1);
};