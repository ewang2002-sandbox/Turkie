import { Client } from "discord.js";
import { Token } from "../Configuration/Configuration";

module.exports.run = async (client: Client): Promise<void> => {
	setTimeout(() => {
		client.destroy().then(() => {
			client.login(Token);
		});
	});
}