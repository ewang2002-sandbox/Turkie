import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class SetPrefix extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configprefix",
			aliases: ["prefix"],
			description: "Sets the prefix for the server.",
			usage: ["configprefix"],
			example: []
		}, {
			commandName: "Set Prefix",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let newPrefix: string = args[0];

		if (message.mentions.members.size > 0 ||
			message.mentions.everyone ||
			message.mentions.roles.size > 0 ||
			message.mentions.users.size > 0 ||
			message.mentions.channels.size > 0) {
			const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Invalid Prefix", "The prefix you provided is not allowed. Please do not use mentions.");
			message.channel.send(embed)
				.then(msg => {
					msg = msg as Message;
					msg.delete({
						timeout: 5000
					});
				})
				.catch(e => { });
			return;
		}

		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			"serverConfiguration.prefix": newPrefix
		}, (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			} else {
				const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Prefix Saved", `Your new prefix has been saved to \`${newPrefix}\`.`);
				MessageFunctions.sendRichEmbed(message, embed);
			}
		});
	}
}