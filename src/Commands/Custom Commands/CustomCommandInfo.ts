import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { EnhancedDates } from "../../Utility/EnhancedDates";
import { Colors } from "../../Configuration/Configuration";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class CustomCommandInfo extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "infocc",
			aliases: ["ccinfo"],
			description: "Searches all custom commands for a specific one. This command will display information about your command. If you need help with a built-in command, please use `-help <Command>`.",
			usage: ["ccinfo <Command Name>"],
			example: ["ccinfo rules"]
		}, {
			commandName: "Custom Command Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (!guildInfo.customCommands.isEnabled) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NOT_ENABLED", "Turkie Custom Commands", "20"));
			return;
		}

		const query: string = args.join(" ");

		let isFound = false;
		let info;
		for (let i = 0; i < guildInfo.customCommands.customCommands.length; i++) {
			if (guildInfo.customCommands.customCommands[i].name === query.toLowerCase()) {
				isFound = true;
				info = guildInfo.customCommands.customCommands[i];
				break;
			}
		}

		if (isFound) {
			const d: RichEmbed = new RichEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL)
				.setTitle("Custom Commands Information")
				.setDescription(`This command was created on ${EnhancedDates.formatUTCDate(info.commandCreatedAt)}.`)
				.setFooter("Custom Commands")
				.setColor(Colors.randomElement())
				.addField("Command Name", MessageFunctions.codeBlockIt(info.name))
				.addField("Author", MessageFunctions.codeBlockIt("" + client.users.get(info.creator)))
				.addField("Response", MessageFunctions.codeBlockIt((info.commandanswer.length > 1000) ? info.commandanswer.substring(0, 1000) + "..." : info.commandanswer))
				.addField("Is Embed", MessageFunctions.codeBlockIt(info.embed ? "Yes" : "No"))
				.addField("Is DM", MessageFunctions.codeBlockIt(info.dm ? "Yes" : "No"));
			message.channel.send(d).catch(e => { });
		} else {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Command Not Found", "The command you tried looking for wasn't found."));
		}
	}
}