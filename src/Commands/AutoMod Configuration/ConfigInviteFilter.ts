import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigInviteFilter extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configinvitefilter",
			aliases: ["invitefilter"],
			description: "Configures the invite filter. If enabled and an invite link is sent, the person that sent the invite link will be issued a strike.",
			usage: [],
			example: []
		}, {
			commandName: "Configure Invite Filter",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"moderation.inviteFilter.isEnabled": !guildInfo.moderation.inviteFilter.isEnabled
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, `Invite Filter ${!guildInfo.moderation.inviteFilter.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.inviteFilter.isEnabled ? "The invite filter has been enabled." : "The invite filter has been disabled."}`);
				MessageFunctions.sendRichEmbed(message, embed);
				return;
			}
		});
	}
}

