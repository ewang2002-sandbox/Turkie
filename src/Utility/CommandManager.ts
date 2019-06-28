import { DiscordBot } from "../Bot";
import { Command } from "../Models/Command";
import { RichEmbed, Client } from "discord.js";
import { Colors } from "../Configuration/Configuration";

/**
 * Command manager, the basis for most command-based functions.
 */
export class CommandManager {
	// The command query, if any.
	private command: string;
	// The command list (access static member of DiscordBot).
	private commandsList: Map<string, Command> = DiscordBot.commands;
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
	public helpCommand(): RichEmbed {
		const command: Command = this.findCommand();

		// honestly, probably unneeded
		if (!command) {
			const errNoCommandEmbed = new RichEmbed()
				.setTitle("Command Not Found")
				.setDescription(`The command, \`${this.command}\`, was not found. Try again.`)
				.setColor(Colors.randomElement())
				.setFooter("⚠ Command Not Found")
			return errNoCommandEmbed;
		}

		const userperms = command.userPermissions.join(", ") || "-";
		const botperms = command.botPermissions.join(", ") || "-";
		const aliases = command.aliases.join(", ") || "-";
		const cmdusage = command.usage.join("\n") || "-";
		const examples = command.example.join("\n") || "-";
		const bowner = command.botOwnerOnly ? "Yes" : "No";
		const gonly = command.guildOnly ? "Yes" : "No";

		const helpEmbed = new RichEmbed()
			.setAuthor(command.commandName, this.client.user.avatarURL)
			.setColor(Colors.randomElement())
			.setDescription(command.description)
			.setFooter("<> Indicate Required. [] Indicate Optional. Do NOT Include <> & [].")
			.addField("Bot Owner Only?", "```css\n" + bowner + "```", true)
			.addField("Guild Only?", "```css\n" + gonly + "```", true)
			.addBlankField()
			.addField(`Arguments Required`, "```css\n" + command.argsLength + "```", true)
			.addField(`User Permissions`, "```css\n" + userperms + "```", true)
			.addField(`Bot Permissions`, "```css\n" + botperms + "```", true)
			.addBlankField()
			.addField(`Aliases`, "```css\n" + aliases + "```", true)
			.addField(`Command Usage`, "```css\n" + cmdusage + "```", true)
			.addField(`Examples`, "```css\n" + examples + "```", true)
			.setTimestamp();

		return helpEmbed;
	}

}