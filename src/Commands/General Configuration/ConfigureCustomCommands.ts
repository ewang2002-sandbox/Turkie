import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigureCustomCommands extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configcustomcommands",
			aliases: ["customcommands", "configurecustomcommands"],
			description: "Enables or disables custom commands.",
			usage: ["configcustomcommands"],
			example: []
		}, {
			commandName: "Enable or Disable Custom Commands",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"customCommands.isEnabled": !guildInfo.customCommands.isEnabled
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Custom Commands Updated", `${!guildInfo.customCommands.isEnabled ? "This server can now create custom commands." : "This server cannot use any custom commands."}`);
				MessageFunctions.sendRichEmbed(message, embed);
			}
		});
	}
}