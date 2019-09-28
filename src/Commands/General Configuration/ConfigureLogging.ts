import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, Channel, TextChannel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigLogging extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configlogging",
			aliases: ["logging", "configurelogging"],
			description: "Configures logging for the server.",
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

		let chan: Channel | string = message.mentions.channels.first() || key;
		let resolvedChannel: Channel;

		if (key) {
			if (typeof chan === "string") {
				if (message.guild.channels.has(chan)) {
					resolvedChannel = message.guild.channels.get(chan);
				}
			} else {
				resolvedChannel = chan;
			}

			if (!resolvedChannel) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHANNELS_FOUND"));
				return;
			}
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
				// no chans
				if ((resolvedChannel as TextChannel).permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
					TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
						"serverConfiguration.serverLogs.joinLeaveLogs.channel": resolvedChannel.id
					}, (err, raw) => {
						if (err) {
							MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
							return;
						}
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Join & Leave", `The bot will now route all join/leave log messages to ${resolvedChannel}.`);
						MessageFunctions.sendRichEmbed(message, embed);
					});
				} else {
					MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
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
				// make sure it has perms
				if ((resolvedChannel as TextChannel).permissionsFor(client.user).has(["SEND_MESSAGES", "READ_MESSAGES"])) {
					TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
						"serverConfiguration.serverLogs.modLogs.channel": resolvedChannel.id
					}, (err, raw) => {
						if (err) {
							MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
							return;
						}
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Changed Server Logging Channel: Moderation", `The bot will now route all moderation log messages to ${resolvedChannel}.`);
						MessageFunctions.sendRichEmbed(message, embed);
					});
				} else {
					MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
				}
			}
		}
	}
}