import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class DeletePinNotification extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configpinnotification",
			aliases: ["pinnotification", "deletepinnotifications"],
			description: "Configures whether pinned message notifications should be deleted automatically.",
			usage: ["configpinnotification"],
			example: []
		}, {
			commandName: "Configure Deletion of Pin Notifications",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"serverConfiguration.deletePinNotifications": !guildInfo.serverConfiguration.deletePinNotifications
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Pin Notification Deletion Updated", `${!guildInfo.serverConfiguration.deletePinNotifications ? "The bot will now delete all pin notification messages." : "The bot will no longer delete all pin notification messages."}`);
				MessageFunctions.sendRichEmbed(message, embed);
			}
		});
	}
}