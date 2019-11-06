import { TurkieBot } from "../TurkieBot";
import { Command } from "../Models/Command";
import { MessageEmbed, Client } from "discord.js";
import { Colors } from "../Configuration/Configuration";
import MessageFunctions from "./MessageFunctions";

/**
 * Command manager, the basis for most command-based functions.
 */
export class CommandManager {
	// The command query, if any.
	private command: string;
	// The command list (access static member of Turkie).
	private commandsList: Map<string, Command> = TurkieBot.commands;
	// The client.
	private client: Client;

	/**
	 * Constructor.
	 * @param command The command to look for, if needed.
	 */
	public constructor(client: Client, command: string) {
		this.client = client;
		this.command = command;
	}

	/**
	 * @method getCommands
	 * 
	 * Returns a map of all the commands the bot currently has.
	 */
	public getCommands(): Map<string, Command> {
		return this.commandsList;
	}

	/**
	 * @method findCommand
	 * 
	 * Finds a command and returns it, if any.
	 */
	public findCommand(): Command {
		if (this.commandsList.has(this.command)) {
			return this.commandsList.get(this.command);
		} else {
			return null;
		}
	}

	/**
	 * @method helpCommand
	 * 
	 * Gets help information on a command.
	 */
	public helpCommand(): MessageEmbed {
		const command: Command = this.findCommand();

		// honestly, probably unneeded
		if (!command) {
			const errNoCommandEmbed = new MessageEmbed()
				.setTitle("Command Not Found")
				.setAuthor(this.client.user.tag, this.client.user.avatarURL({ format: "png" }))
				.setDescription(`The command, \`${this.command}\`, was not found. Try again.`)
				.setColor(Colors.randomElement())
				.setFooter("⚠ Command Not Found");
			return errNoCommandEmbed;
		}

		const userperms = command.userPermissions.join(", ") || "-";
		const botperms = command.botPermissions.join(", ") || "-";
		const aliases = command.aliases.join(", ") || "-";
		const cmdusage = command.usage.join("\n") || "-";
		const examples = command.example.join("\n") || "-";
		const bowner = command.botOwnerOnly ? "Yes" : "No";
		const gonly = command.guildOnly ? "Yes" : "No";

		const helpEmbed = new MessageEmbed()
			.setAuthor(command.commandName, this.client.user.avatarURL({ format: "png" }))
			.setColor(Colors.randomElement())
			.setDescription(command.description)
			.setFooter("<> Indicate Required. [] Indicate Optional. Do NOT Include <> & [].")
			.addField("Command Name", MessageFunctions.codeBlockIt(command.name), true)
			.addField(`Aliases`, MessageFunctions.codeBlockIt(aliases), true)
			.addBlankField()
			.addField("Bot Owner Only?", MessageFunctions.codeBlockIt(bowner), true)
			.addField("Guild Only?", MessageFunctions.codeBlockIt(gonly), true)
			.addBlankField()
			.addField(`Arguments Required`, MessageFunctions.codeBlockIt(command.argsLength.toString()), true)
			.addField(`User Permissions`, MessageFunctions.codeBlockIt(userperms), true)
			.addField(`Bot Permissions`, MessageFunctions.codeBlockIt(botperms), true)
			.addBlankField()
			.addField(`Command Usage`, MessageFunctions.codeBlockIt(cmdusage), true)
			.addField(`Examples`, MessageFunctions.codeBlockIt(examples), true)
			.setTimestamp();

		return helpEmbed;
	}

}