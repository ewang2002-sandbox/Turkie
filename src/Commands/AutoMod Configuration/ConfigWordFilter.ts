import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed, Guild } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigWordFilter extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configwordfilter",
			aliases: ["wordfilter"],
			description: "Configures the word filter. Members that use a filtered word will be issued a strike. No arguments means the bot will enable or disable wordfilter.",
			usage: ["configwordfilter", "configwordfilter view", "configwordfilter <Word: STRING>"],
			example: []
		}, {
			commandName: "Configure Word Filter",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		// no arguments, basically just on or off.
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.wordFilter.isEnabled": !guildInfo.moderation.wordFilter.isEnabled
			}, (err, data) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, `Word Filter ${!guildInfo.moderation.wordFilter.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.wordFilter.isEnabled ? "The word filter has been enabled successfully." : "The word filter has been disabled successfully."}`);
					MessageFunctions.sendRichEmbed(message, embed);
					return;
				}
			});
			return;
		} else if (["view", "words", "list"].includes(args.join(" "))) {
			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
				.setTitle("**Current Filtered Words**")
				.setColor(Colors.randomElement())
				.setDescription(guildInfo.moderation.wordFilter.words.join(", ").length > 2048 ? guildInfo.moderation.wordFilter.words.join(", ").slice(0, 2040) + "..." : guildInfo.moderation.wordFilter.words.join(", "))
				.setFooter(`${guildInfo.moderation.wordFilter.words.length} Words In Filter`)
			message.channel.send(embed).catch(e => { });
			return;
		} else {
			let word: string = args.join(" ");
			if (guildInfo.moderation.wordFilter.words.includes(word)) {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					$pull: {
						"moderation.wordFilter.words": word
					}
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Word Removed", `The word, \`${word}\`, was removed from the word filter.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			} else {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					$push: {
						"moderation.wordFilter.words": word
					}
				}, (err, raw) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Word Added", `The word, \`${word}\`, was added to the word filter.`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			}
		}
	}
}