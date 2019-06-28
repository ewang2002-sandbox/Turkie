import { Client } from "discord.js";
import Log from "../Utility/Log";

module.exports.run = async (client: Client, error: Error): Promise<void> => {
	const log = new Log(error);
	log.logErrorMessage();
	console.error(error);
}