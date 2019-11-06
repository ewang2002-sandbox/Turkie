import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigAntiMention extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configantimention",
			aliases: ["antimention"],
			description: "Configures anti-mention for this server. If a user mentions a certain amount of unique roles or users, he or she will receive a strike.",
			usage: ["configantimention", "configantimention <Amount of Strikes: NUMBER>"],
			example: []
		}, {
			commandName: "Configure AntiMention",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		// on or off
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.antiMention.isEnabled": !guildInfo.moderation.antiMention.isEnabled
			}, (err, data) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, `AntiMention ${!guildInfo.moderation.antiMention.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.antiMention.isEnabled ? "AntiMention has been enabled successfully." : "AntiMention has been disabled successfully."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				}
			});
			return;
		} else {
			const num: number = Number.parseInt(args.join(" "));
			if (!Number.isNaN(num)) {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.antiMention.theshold": num
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "AntiMention Updated", `AntiMention will now be triggered at ${num} mentions.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "No Number Specified", "You need to input a number as an argument."));
				return;
			}
		}
	}
}