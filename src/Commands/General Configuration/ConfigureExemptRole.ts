import { Command } from "../../Models/Command";
import { Client, Message, Role } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigExemptRole extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configexemptrole",
			aliases: ["exemptrole"],
			description: "Adds or removes an exempt role. If a user has an exempt role, he or she will not be punished by automoderation.",
			usage: ["configexemptrole <Role Mention | ID>"],
			example: ["configexemptrole @Exempt"]
		}, {
			commandName: "Configure Exempt Roles",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let role: Role | string = message.mentions.roles.first() || args.join(" ");
		let resolvedRole: Role;

		if (typeof role === "string") {
			if (message.guild.roles.has(role)) {
				resolvedRole = message.guild.roles.get(role);
			}
		} else {
			resolvedRole = role;
		}

		if (!resolvedRole) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_ROLE_FOUND"));
			return;
		}

		if (guildInfo.moderation.moderationConfiguration.exemptRole.includes(resolvedRole.id)) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$pull: {
					"moderation.moderationConfiguration.exemptRole": resolvedRole.id
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Removed Role Successfully", `The role, ${resolvedRole}, was removed from the list of exempt roles.`));
			});
			return;
		} else {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$push: {
					"moderation.moderationConfiguration.exemptRole": resolvedRole.id
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Added Role Successfully", `The role, ${resolvedRole}, was added to the list of exempt roles.`));
			});
			return;
		}
	}
}