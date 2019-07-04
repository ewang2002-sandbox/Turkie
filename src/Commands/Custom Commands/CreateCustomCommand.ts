import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { CommandManager } from "../../Utility/CommandManager";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class CreateCustomCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "createcc",
			aliases: ["cccreate"],
			description: "Creates a custom command for your server. For help, please refer to `-helpcc`.",
			usage: ["createcc <Name of Custom Command> <Response of Custom Command> [--embed] [--dm]"],
			example: ["cccreate rules Hey {user}! The only rule to follow is to be chill!", "cccreate intro Hey {user}! --dm --embed", "cccreate channels Here are some channels --dm"]
		}, {
			commandName: "Create Custom Command",
			botPermissions: [],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 2,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (!guildInfo.customCommands.isEnabled) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NOT_ENABLED", "Turkie Custom Commands", "20"));
			return;
		}

		if (guildInfo.customCommands.customCommands.length + 1 > 50) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Too Many Custom Commands", "You can only have up to 50 custom commands. Try again!"));
			return;		
		}

		let embed: boolean = false;
		let dm: boolean = false;

		if (args.join(" ").includes("--embed")) {
			embed = true;
			args = args.join(" ").replace("--embed", "").split(" ");
		}

		if (args.join(" ").includes("--dm")) {
			dm = true;
			args = args.join(" ").replace("--dm", "").split(" ");
		}

		const commandName = args[0].toLowerCase();

		if (commandName.length > 20) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "MSG_TOO_LONG", "custom command name", "20"));
			return;
		}

		const cmdmgn: CommandManager = new CommandManager(client, commandName);
		let commandExists: boolean = false;
		if (cmdmgn.findCommand()) {
			commandExists = true
		}

		if (commandExists) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Command Name Exists", `The name you specified, \`${commandName}\`, exists as a bot command. Please try a different name.`));
			return;
		}

		let isFound: boolean = false;

		for (let i = 0; i < guildInfo.customCommands.customCommands.length; i++) {
			if (guildInfo.customCommands.customCommands[i].name === commandName) {
				isFound = true;
				break;
			}
		}

		if (isFound) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Command Name Exists", `The name you specified, \`${commandName}\`, exists as a custom command. Please try a different name.`));		
			return;
		}

		const commandInfo = args.slice(1).join(" ");

		if (commandInfo.length > 2000) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "MSG_TOO_LONG", "custom command content", "2000"));
			return;
		}

		const newcommandsettings = {
			name: commandName,
			creator: message.author.id,
			commandanswer: commandInfo,
			embed: embed,
			commandCreatedAt: Date.now(),
			dm: dm
		};

		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			$push: {
				"customCommands.customCommands": newcommandsettings
			}
		}, async (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			}
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Custom Command Created", "You have created a new custom command.", [
				{
					name: "Command Name",
					value: MessageFunctions.codeBlockIt(commandName)
				},
				{
					name: "Response",
					value: MessageFunctions.codeBlockIt(`${commandInfo.length < 1000 ? commandInfo : commandInfo.slice(0, 1000) + "..."}`)
				},
				{
					name: "Embed?",
					value: MessageFunctions.codeBlockIt(embed ? "Yes" : "No")
				},
				{
					name: "Direct Message?",
					value: MessageFunctions.codeBlockIt(dm ? "Yes" : "No")
				}
			]), 10000);
		});
	}
}