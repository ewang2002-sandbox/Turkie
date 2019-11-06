import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { readdirSync, unlinkSync, existsSync } from "fs";

export default class GetErrorLogs extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "errorlogs",
			aliases: [],
			description: "Get or clear the error logs.",
			usage: ["geterrors get", "geterrors clear"],
			example: []
		}, {
			commandName: "Get or Clear Errors",
			botPermissions: [],
			userPermissions: [],
			argsLength: 1,
			guildOnly: false,
			botOwnerOnly: true
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args[0] === "get") {
			if (existsSync("./logs/ErrorLogs.txt")) {
				message.author.send(`The error log file has been attached.`, {
					files: ["./logs/ErrorLogs.txt"],
				});
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "No Error Logs", "There are no error logs available. Maybe you're actually a good programmer?"));
			}
		} else if (args[0] === "clear") {
			if (existsSync("./logs/ErrorLogs.txt")) {
				unlinkSync("./logs/ErrorLogs.txt");
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Deleted Error Log", "The error log file has been deleted."));
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "No Error Logs", "There are no error logs available. Maybe you're actually a good programmer?"));
			}
		} else {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "get", "clear"));
		}
	}
}