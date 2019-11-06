import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigOneRole extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configonerole",
			aliases: ["onerole"],
			description: "Configures whether a person must have at least one role to run commands.",
			usage: ["configonerole"],
			example: []
		}, {
			commandName: "Command Trigger",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"serverConfiguration.commands.mustHaveOneRole": !guildInfo.serverConfiguration.commands.mustHaveOneRole
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Configured Role Setting", `${!guildInfo.serverConfiguration.commands.mustHaveOneRole ? "Members must now have at least one role to use this bot's commands." : "Members no longer need a role to use bot commands."}`);
				MessageFunctions.sendRichEmbed(message, embed);
			}	
		});
	}
}