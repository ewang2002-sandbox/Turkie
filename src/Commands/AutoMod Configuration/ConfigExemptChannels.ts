import { Command } from "../../Models/Command";
import { Client, Message, Role, Channel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigExemptChannels extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configexemptchannels",
			aliases: ["exemptchannels"],
			description: "Configures the exempt channels. Automod will not check exempt channels for possible offenses.",
			usage: ["configexemptchannels <Channel Mention | ID>"],
			example: ["configexemptchannels #advertising"]
		}, {
			commandName: "Configure Exempt Channels",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let chan: Channel | string = message.mentions.channels.first() || args.join(" ");
		let resolvedChannel: Channel;

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

		
		if (guildInfo.moderation.moderationConfiguration.exemptChannel.includes(resolvedChannel.id)) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$pull: {
					"moderation.moderationConfiguration.exemptChannel": resolvedChannel.id
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Removed Exempt Channel Successfully", `The channel, ${resolvedChannel}, was removed from the list of exempt channels.`));
			});
			return;
		} else {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$push: {
					"moderation.moderationConfiguration.exemptChannel": resolvedChannel.id
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Added Channel Successfully", `The channel, ${resolvedChannel}, was added to the list of exempt channels.`));
			});
			return;
		}

	}
}