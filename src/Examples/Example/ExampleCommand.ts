import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";

export default class ExampleCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "COMMANDNAME",
			aliases: [],
			description: "Your description.",
			usage: [],
			example: []
		}, {
			commandName: "FORMAL COMMAND NAME",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {

	}
}