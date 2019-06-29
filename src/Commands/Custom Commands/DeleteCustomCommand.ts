import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import { MongoDB } from "../../Handlers/MongoDBHandler";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class DeleteCustomCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "deletecc",
			aliases: ["ccdelete"],
			description: "Deletes the custom command.",
			usage: ["deletecc <Command Name>"],
			example: ["deletecc rules"]
		}, {
			commandName: "FORMAL COMMAND NAME",
			botPermissions: [],
			userPermissions: ["MANAGE_MESSAGES"],
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

		let cmdName: string = args.join(" ").toLowerCase();
		let isFound: boolean = false;
		for (let i = 0; i < guildInfo.customCommands.customCommands.length; i++) {
			if (guildInfo.customCommands.customCommands[i].name === cmdName) {
				isFound = true;
				break;
			}
		}

		if (isFound) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				$pull: {
					"customCommands.customCommands": {
						name: cmdName
					}
				}
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				}
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Deleted Custom Command", `The custom command, \`${cmdName}\`, has been deleted`));
			});
		} else {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Custom Command Not Found", "The command was not found. Try again."));
		}
	}
}