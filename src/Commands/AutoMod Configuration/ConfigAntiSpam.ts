import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigAntiSpam extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configantispam",
			aliases: ["antispam"],
			description: "Configures anti-spam for the server.",
			usage: ["configantispam", "configantispam msg <Amount: NUMBER>", "configantispam time <Time: NUMBER in SECONDS>"],
			example: ["configantispam msg 10", "configantispam time 3"]
		}, {
			commandName: "Configure AntiSpam",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.antiSpam.isEnabled": !guildInfo.moderation.antiSpam.isEnabled
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, `AntiSpam ${!guildInfo.moderation.antiSpam.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.antiSpam.isEnabled ? "AntiSpam has been enabled." : "AntiSpam has been disabled."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				}
			});
		} else {
			const num: number = Number.parseInt(args[args.length - 1]);
			if (Number.isNaN(num)) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_NUMBER_INPUT"));
				return;			
			}

			if (!["msg", "time"].includes(args[0])) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "msg", "time"))
				return;	
			}
			
			if (args[0] === "msg") {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.antiSpam.amount": num
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "AntiSpam Module Updated", `The AntiSpam module will be triggered when ${num} messages are sent within ${guildInfo.moderation.antiSpam.time} milliseconds.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			} else if (args[0] === "time") {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.antiSpam.time": num * 1000
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "AntiSpam Module Updated", `The AntiSpam module will be triggered when ${guildInfo.moderation.antiSpam.amount} messages are sent within ${num} seconds.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			}
		}
	}
}