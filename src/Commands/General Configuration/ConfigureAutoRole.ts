import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, Role } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigureAutoRole extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configwelcomerole",
			aliases: ["welcomerole", "configautorole", "autorole", "autoroles", "welcomeroles"],
			description: "Enables or disables autorole; if enabled, the bot will give new members up to 5 roles.",
			usage: ["configwelcomerole <add | remove> <Role Mention | ID>"],
			example: ["configwelcomerole add 493282293499297812"]
		}, {
			commandName: "Manage Automatic/Welcome Roles",
			botPermissions: ["MANAGE_ROLES"],
			userPermissions: ["MANAGE_ROLES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"serverConfiguration.autoRole.isEnabled": !guildInfo.serverConfiguration.autoRole.isEnabled
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Configured AutoRole", `${!guildInfo.serverConfiguration.autoRole.isEnabled ? "AutoRole has been enabled. Make sure you get some roles ready!" : "AutoRoles has been disabled."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				}	
			});
			return;
		}

		let role: Role | string = message.mentions.roles.first() || args.slice(1).join(" ");
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

		// proceed to remove the role.
		if (guildInfo.serverConfiguration.autoRole.roles.includes(resolvedRole.id)) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$pull: {
					"serverConfiguration.autoRole.roles": resolvedRole.id
				}	
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Removed Role Successfully", `The role, ${resolvedRole}, was removed from auto-role. Members that join will no longer receive this role.`));
			});
			return;
		} else {
			// add the role
			if (guildInfo.serverConfiguration.autoRole.roles.length + 1 > 5) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Too Many Roles", "There are too many roles in auto-role. Auto-role only supports up to 5 roles."));
				return;
			}

			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$push: {
					"serverConfiguration.autoRole.roles": resolvedRole.id
				}	
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Added Role Successfully", `The role, ${resolvedRole}, was added to auto-role. Members that join will receive this role.`));
			});
			return;
		}
	}
}