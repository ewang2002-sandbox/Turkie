/**EnhancedDates Class: More stuff added to dates. */
export class EnhancedDates extends Date {
	public constructor(value?: string | number | Date) {
		value ? super(value) : super();
	}

	/**
	 * Formats the date into a readable string.
	 * @param {number} time The UTC time, in milliseconds.
	 */
	public static formatUTCDate(time: number): string {
		let d = new Date(time);
		let str = `${this.addZero(d.getUTCMonth() + 1)}/${this.addZero(d.getUTCDate())}/${d.getUTCFullYear()} at ${this.addZero(d.getUTCHours())}:${this.addZero(d.getUTCMinutes())}:${this.addZero(d.getUTCSeconds())} UTC`;
		return str;
	}

	/**Adds a zero if the number is single-digit. */
	private static addZero(num: number): string {
		return (num >= 0 && num < 10) ? "0" + num : String(num);
	}
}

