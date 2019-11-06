import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";

export default class BotInvite extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "invite",
			aliases: [],
			description: "Gives you a bot invite link and the support link so you can invite Turkie.",
			usage: [],
			example: []
		}, {
			commandName: "Invite",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const embed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setTitle("**Invite Link: Turkie**")
			.setDescription("Thank you for trying out Turkie!")
			.addField("Bot Invite Link", "Click [Here](https://discordapp.com/api/oauth2/authorize?client_id=594006522816626690&permissions=8&scope=bot)")
			.addField("Discord Support Server Link", "Click [Here](https://discord.gg/6eBTTDM)")
			.setColor(Colors.randomElement())
			.setFooter("Turkie")
			.setTimestamp();
		message.channel.send(embed).catch(e => { });
	}
}