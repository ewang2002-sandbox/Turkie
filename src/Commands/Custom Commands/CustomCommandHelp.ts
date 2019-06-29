import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration.Sample";

export default class CustomCommandHelp extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "helpcc",
			aliases: ["cchelp", "welcomemsghelp", "helpwelcomemsg"],
			description: "Get help on custom commands and welcome messages.",
			usage: [],
			example: []
		}, {
			commandName: "Custom Command Help",
			botPermissions: [],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const instructions: [string, string, string, string, boolean][] = [
			[
				"Mention Author",
				"`{author}`",
				"Mentions the author of the message.",
				"`Hey {author}, how are you?`",
				true
			],
			[
				"Get Nickname",
				"`{authorNickname}`",
				"Puts the author's nickname in the message.",
				"`Your name is {authorNickName}.`",
				true
			],
			[
				"Get Discriminator",
				"`{authorDiscrim}`",
				"Puts the author's discriminator in the message.",
				"`Your discriminator is {authorDiscrim}.`",
				true
			],
			[
				"Mention Channel",
				"`{channel}`",
				"Mentions the channel the message originated from.",
				"`You sent this message in {channel}!`",
				false
			],
			[
				"Get Server Name",
				"`{serverName}`",
				"Gets the name of the server.",
				"`You sent this message in the server {serverName}!`",
				true

			],
			[
				"Get ID",
				"`{authorID} {channelID} {serverID}`",
				"Gets the ID of the author, channel, or server, respectively. `{channelID}` cannot be used in welcome messages.",
				"`Your ID is {authorID}.`",
				true
			]
		];
		const d: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setColor(Colors.randomElement())
			.setTitle("Custom Commands & Welcome Message Help")
			.setDescription("Custom commands are a way for you to make basic commands for your server. It's like an auto-responder, but with a prefix so the message author expects it.\
			\nWhen creating a custom command, mention a person/channel/role the way you normally do in a regular message. However, if you want to add some special properties, please read below.");

		for (let i = 0; i < instructions.length; i++) {
			d.addField(`**${instructions[i][0]}**`, `Syntax: ${instructions[i][1]}\nDescription: ${instructions[i][2]}\nExample: ${instructions[i][3]}\nWelcome Message? ${instructions[i][4] ? "Allowed" : "No"}`);
		}

		message.channel.send(d).catch(e => { });
	}
}