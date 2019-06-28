import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigLogging extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configlogging",
			aliases: ["logging"],
			description: "Your description.",
			usage: ["configlogging <Log Type: joinleave | moderation>", "configlogging <Log Type: joinleave | moderation> <Channel: #MENTION>"],
			example: []
		}, {
			commandName: "Configure Server Logging",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const prop: string = args[0];
		const key: string = args[1];
		if (!["joinleave", "moderation"].includes(prop)) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "joinleave", "moderation"));
			return;
		}
		if (prop === "joinleave") {
			if (!key) {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"serverConfiguration.serverLogs.joinLeaveLogs.isEnabled": !guildInfo.serverConfiguration.serverLogs.joinLeaveLogs.isEnabled
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					}
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Toggled Server Logging: Join & Leave", `${!guildInfo.serverConfiguration.serverLogs.joinLeaveLogs.isEnabled ? "The bot will now log all members joining and leaving the server (that is, if a channel is configured)." : "The bot will no longer log all members joining and leaving the server."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				});
			} else {
				if (message.mentions.channels.size > 0) {
					// make sure it has perms
					if (message.mentions.channels.first().permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
						TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
							"serverConfiguration.serverLogs.joinLeaveLogs.channel": message.mentions.channels.first().id
						}, (err, raw) => {
							if (err) {
								MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
								return;
							} 
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Join & Leave", `The bot will now route all join/leave log messages to ${message.mentions.channels.first()}.`);
							MessageFunctions.sendRichEmbed(message, embed);
						});
					} else {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
					}

				} else if (message.guild.channels.get(key)) {
					// make sure it has perms
					if (message.guild.channels.get(key).permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
						TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
							"serverConfiguration.serverLogs.joinLeaveLogs.channel": key
						}, (err, raw) => {
							if (err) {
								MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
								return;
							} 
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Join & Leave", `The bot will now route all join/leave log messages to ${message.mentions.channels.get(key)}.`);
							MessageFunctions.sendRichEmbed(message, embed);
						});
					} else {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
					}
				} else {
					MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHANNELS_FOUND"));
				}
			}
		} else if (prop === "moderation") { // modlogs
			if (!key) {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"serverConfiguration.serverLogs.modLogs.isEnabled": !guildInfo.serverConfiguration.serverLogs.modLogs.isEnabled
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					}
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Toggled Server Logging: Moderation", `${!guildInfo.serverConfiguration.serverLogs.modLogs.isEnabled ? "The bot will now log all bot-related moderation in the server (that is, if a channel is configured)." : "The bot will no longer log all bot-related moderation in the server."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				});
			} else {
				if (message.mentions.channels.size > 0) {
					// make sure it has perms
					if (message.mentions.channels.first().permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
						TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
							"serverConfiguration.serverLogs.modLogs.channel": message.mentions.channels.first().id
						}, (err, raw) => {
							if (err) {
								MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
								return;
							} 
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Moderation", `The bot will now route all moderation log messages to ${message.mentions.channels.first()}.`);
							MessageFunctions.sendRichEmbed(message, embed);
						});
					} else {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
					}

				} else if (message.guild.channels.get(key)) {
					// make sure it has perms
					if (message.guild.channels.get(key).permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
						TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
							"serverConfiguration.serverLogs.modLogs.channel": key
						}, (err, raw) => {
							if (err) {
								MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
								return;
							} 
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Moderation", `The bot will now route all moderation log messages to ${message.mentions.channels.get(key)}.`);
							MessageFunctions.sendRichEmbed(message, embed);
						});
					} else {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
					}
				} else {
					MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHANNELS_FOUND"));
				}
			}
		}
	}
}