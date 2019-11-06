import { Client } from "discord.js";
import { Token } from "../Configuration/Configuration";

module.exports.run = async (client: Client): Promise<void> => {
	setTimeout(async () => {
		client.destroy();
		await client.login(Token);
	}, 5000);
}