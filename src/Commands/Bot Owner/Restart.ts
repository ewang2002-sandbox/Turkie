import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Token } from "../../Configuration/Configuration";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class Restart extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "restart",
			aliases: [],
			description: "Restarts the bot.",
			usage: [],
			example: []
		}, {
			commandName: "Restart",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: true
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let msg = await MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Bot Restart Pending", "The bot restart is now pending."));

		setTimeout(async () => {
			client.destroy();
			await client.login(Token);
			await MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Bot Restart Complete", "The bot restart has been completed."));
			await msg.delete().catch(e => { });
		}, 500);
	}
}