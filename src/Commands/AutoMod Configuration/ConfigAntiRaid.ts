import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, TextChannel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigAntiRaid extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configantiraid",
			aliases: ["antiraid"],
			description: "Enables or disables the antiraid module. If it is enabled and is triggered, the bot will proceed to ban the people that triggered the module and kick anyone that joins afterwards for 10 seconds.",
			usage: ["configantiraid", "configantiraid amount [Members Allowed: NUMBER]", "configantiraid time [Time: NUMBER -> SECONDS]"],
			example: []
		}, {
			commandName: "Configure AntiRaid",
			botPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.antiRaid.isEnabled": !guildInfo.moderation.antiRaid.isEnabled
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, `AntiRaid ${!guildInfo.moderation.antiRaid.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.antiRaid.isEnabled ? "AntiRaid has been enabled." : "AntiRaid has been disabled."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				}
			});
		} else {
			const num: number = Number.parseInt(args[args.length - 1]);
			if (!Number.isNaN(num)) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_NUMBER_INPUT"));
				return;			
			}

			if (!["amount", "time"].includes(args[0])) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "amount", "time"))
				return;	
			}
			
			if (args[0] === "amount") {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.antiRaid.amount": num
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "AntiRaid Module Updated", `The AntiRaid system module will be triggered when ${num} members join within ${guildInfo.moderation.antiRaid.timeAllowed} milliseconds.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			} else if (args[0] === "time") {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.antiRaid.timeAllowed": num * 1000
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "AntiRaid Module Updated", `The AntiRaid system module will be triggered when ${guildInfo.moderation.antiRaid.amount} members join within ${num} milliseconds.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			}
		}
	}
}