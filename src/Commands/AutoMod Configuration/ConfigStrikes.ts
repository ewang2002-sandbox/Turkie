import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigStrikes extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configstrikes",
			aliases: [],
			description: "Configures the maximum amount of strikes a user can have before being punished and the punishment if users do meet or exceed the maximum strike amount.",
			usage: ["configstrikes <Maximum Strikes: NUMBER>", "configstrikes <Punishment: "],
			example: []
		}, {
			commandName: "Configure Strikes",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let toChange: string | number;
		if (!Number.isNaN(Number.parseInt(args.join(" ")))) {
			toChange = Number.parseInt(args.join(" "));
			// make sure the number inputted > 0
			// we dont want to have the maximum be 
			if (toChange < 0) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_NEGATIVE_NUMBER"));
				return;
			}
			if (toChange === 0) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_ZERO_NUMBER"));
				return;
			}
			// now continue
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.moderationConfiguration.maxStrikes": toChange
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Changed Maximum Strikes", `The maximum strikes a user can have has been changed to ${toChange.toString()} strikes.`));
			});
		} else if (["nothing", "mute", "kick", "ban"].includes(args.join(" "))) {
			toChange = args.join(" ");
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.moderationConfiguration.punishment": toChange
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Changed Punishment Type", `Users that exceed the strike limit will receive the punishment \`${toChange.toString().toUpperCase()}\`.`));
			});
		} else {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "nothing", "mute", "kick", "ban"));
		}
	}
}