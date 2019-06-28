import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";

export default class Clear extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "clear",
			aliases: ["purge"],
			description: "Clears up to 100 messages in a channel.",
			usage: [],
			example: []
		}, {
			commandName: "Clear Messages",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 1,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {

	}
}