import { SnowflakeUtil, DeconstructedSnowflake } from "discord.js";

export class OtherUtilities {
	public static checkSnowflake(snowflake: string): boolean {
		let deconstructedSnowflake: DeconstructedSnowflake = SnowflakeUtil.deconstruct(snowflake);
		let timestamp = deconstructedSnowflake.timestamp;
		if (timestamp > 1420070400000 && timestamp <= 3619093655551) {
			return true;
		}
		return false;
	}
}