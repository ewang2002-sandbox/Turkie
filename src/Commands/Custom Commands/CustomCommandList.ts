import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration.Sample";

export default class CustomCommandList extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "listcc",
			aliases: ["cclist"],
			description: "Lists all custom commands in this server.",
			usage: [],
			example: []
		}, {
			commandName: "List Server Custom Commands",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (!guildInfo.customCommands.isEnabled) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NOT_ENABLED", "Turkie Custom Commands", "20"));
			return;
		}

		let a: string[] = [];
		const d = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle(`Custom Commands For: ${message.guild.name}`)
			.setFooter("Custom Commands List")
			.setColor(Colors.randomElement());
		for (let i = 0; i < guildInfo.customCommands.customCommands.length; i++) {
			a.push(`\`${guildInfo.customCommands.customCommands[i].name}\``);
		}

		d.setDescription(a.join(", ").length > 0 ? a.join(", ") : "None! Add some using `-createcc`.");

		message.channel.send(d).catch(e => { });
	}
}