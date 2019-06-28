import { createWriteStream } from "fs";
import { EnhancedDates } from "./EnhancedDates";

/**
 * The logging class.
 */
export default class Log {
	/**The message. */
	private message: Error | string;

	/**The constructor for this method. */
	public constructor(message: Error | string) {
		this.message = message;
	}

	/**
	 * Logs error messages.
	 */
	public logErrorMessage(): void {
		let errmsg: Error | string;
		// check to make sure this is an error.
		if (this.message instanceof Error) {
			if (this.message.stack) {
				errmsg = this.message.stack;
			} else {
				errmsg = this.message.name;
			}
		} else {
			errmsg = this.message;
		}

		const stream = createWriteStream('./logs/ErrorLogs.txt', {
			flags: 'a'
		});

		const date = new EnhancedDates();
		stream.write(`${date.formatUTCDate(date.getTime())}\n    > ${errmsg}\n\n`);
		stream.end();

		console.error(`[ERROR] ${errmsg}`);
	}
}