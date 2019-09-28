import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, Channel, TextChannel, CategoryChannel, GuildChannel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class ConfigLogging extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configmodmail",
			aliases: ["configuremodmail"],
			description: "Configures modmail for this server.",
			usage: ["configmodmail", "configmodmail <Category Name | Category ID>"],
			example: ["configmodmail", "configmodmail [Modmail]", "configmodmail 488892402573246474"]
		}, {
			commandName: "Configure Moderation Mail System",
			botPermissions: ["MANAGE_CHANNELS"],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const category: string = args.join(" ").trim();
		// make sure we're not just enabling or disabling
		if (category.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$set: {
					"serverConfiguration.modMail.isEnabled": !guildInfo.serverConfiguration.modMail.isEnabled
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Toggled Moderation Mail", `${!guildInfo.serverConfiguration.modMail.isEnabled ? "Moderation mail is now enabled for this server. Ensure you have a category set up for moderation mail to work properly.)." : "Moderation mail has been disabled."}`);
				MessageFunctions.sendRichEmbed(message, embed);
			});
		}
		let resolvedCategory: GuildChannel;
		// because of the way js checks equality
		// 123 == "123" => true
		// @ts-ignore 
		if (category == parsedID) {
			// it's an id (duh)
			resolvedCategory = message.guild.channels.filter(x => x.type === "category").has(category)
				? message.guild.channels.get(category)
				: null;
		} 
		else {
			// it's a name
			resolvedCategory = message.guild.channels
				.filter(x => x.type === "category")
				.find(x => x.name.toLowerCase() === category.toLowerCase());
		}

		if (!resolvedCategory || !(resolvedCategory instanceof CategoryChannel)) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Invalid Query", "Please input a valid category name or ID."));
			return;
		}
		
		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			$set: {
				"serverConfiguration.modMail.category": resolvedCategory.id
			}
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			}
			const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Moderation Mail Category Set", `From now on, if someone uses modmail, the bot will create a channel under the __**${resolvedCategory.name}**__ category.`);
			MessageFunctions.sendRichEmbed(message, embed);
		});
		
	}
}