import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class DeleteCommandTrigger extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configdeletecommandtrigger",
			aliases: ["commandtrigger", "deletecommandtrigger"],
			description: "Configures whether messages that trigger commands should be deleted or not.",
			usage: ["configdeletecommandtrigger"],
			example: []
		}, {
			commandName: "Configure Command Trigger Deletion",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"serverConfiguration.commands.deleteCommandTrigger": !guildInfo.serverConfiguration.commands.deleteCommandTrigger
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Command Trigger Updated", `${!guildInfo.serverConfiguration.commands.deleteCommandTrigger ? "The bot will now delete all command trigger messages." : "The bot will no longer delete all command trigger messages."}`);
				MessageFunctions.sendRichEmbed(message, embed);
			}
		});
	}
}