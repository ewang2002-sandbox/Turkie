import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { CommandManager } from "../../Utility/CommandManager";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class EditCustomCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "editcc",
			aliases: ["ccedit"],
			description: "Edits a custom command for your server. For help, please refer to `-helpcc`.",
			usage: ["editcc <Name of Existing Custom Command> <Response of Custom Command> [--embed] [--dm]"],
			example: ["editcc rules Hey {user}! The only rule to follow is to be chill!", "editcc intro Hey {user}! --dm --embed", "editcc channels Here are some channels --dm"]
		}, {
			commandName: "Edit Custom Command",
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

		let isFound: boolean = false;
		let cmdInfo;
		for (let i = 0; i < guildInfo.customCommands.customCommands.length; i++) {
			if (guildInfo.customCommands.customCommands[i].name === commandName) {
				isFound = true;
				cmdInfo = guildInfo.customCommands.customCommands[i];
				break;
			}
		}

		if (!isFound) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "No Command Found", `The name you specified, \`${commandName}\`, does not exist. Please try a different name.`));		
			return;
		}

		let commandInfo: string = args.slice(1).join(" ");

		if (commandInfo.length > 2000) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "MSG_TOO_LONG", "custom command content", "2000"));
			return;
		}

		if (commandInfo.trim().length === 0) {
			commandInfo = cmdInfo.commandanswer;
		}

		let oldCommandAnswer: string = cmdInfo.commandanswer;
		let oldEmbed: boolean = cmdInfo.embed;
		let oldDM: boolean = cmdInfo.dm;

		let editDM: boolean = oldDM !== dm ? dm : oldDM;
		let editEmbed: boolean = oldEmbed !== embed ? embed : oldEmbed;
		let editResp: string = oldCommandAnswer !== commandInfo ? commandInfo : oldCommandAnswer;
		TurkieBotGuild.updateOne({ guildID: message.guild.id, "customCommands.customCommands.name": cmdInfo.name}, {
			$set: {
				"customCommands.customCommands.$.commandanswer": editResp,
				"customCommands.customCommands.$.embed": editEmbed,
				"customCommands.customCommands.$.dm": editDM
			}
		}, async (err, raw) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			}

			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Custom Command Edited", "You have edited a custom command.", [
				{
					name: "Command Name",
					value: "```css\n" + commandName + "```"
				},
				{
					name: "Response",
					value: `${editResp.length < 1000 ? editResp : editResp.slice(0, 1000) + "..."}`
				},
				{
					name: "Embed?",
					value: "```css\n" + (editEmbed ? "Yes" : "No") + "```"
				},
				{
					name: "Direct Message?",
					value: "```css\n" + (editDM ? "Yes" : "No") + "```"
				}
			]), 10000);
		});
	}
}