import { Client, Message, PermissionResolvable } from "discord.js";
import { GuildInterface } from "./TurkieBotGuild";

/**
 * Command help interface. The information here does not directly affect how a command is executed.
 */
export interface CommandHelp {
	name: string;
	aliases: string[];
	description: string;
	usage: string[];
	example: string[];
}

/**
 * Command configuration interface. The information here does affect how a command is executed.
 */
export interface CommandConfig {
	commandName: string;
	botPermissions: PermissionResolvable[];
	userPermissions: PermissionResolvable[];
	argsLength: number;
	guildOnly: boolean;
	botOwnerOnly: boolean;
}

/**
 * Command class.
 */
export abstract class Command implements CommandConfig, CommandHelp {
	/**The client. */
	public client: Client;
	/**The name of the command. Also the initial caller. */
	public name: string;
	/**The aliases of this command, if any. Alternative ways to call this command. */
	public aliases: string[];
	/**Description of the command, */
	public description: string;
	/**Command usage information. */
	public usage: string[];
	/**Command usage examples. */
	public example: string[];
	/**Command formal name. */
	public commandName: string;
	/**Required permissions from the bot. */
	public botPermissions: PermissionResolvable[];
	/**Required permissions from the user. */
	public userPermissions: PermissionResolvable[];
	/**The definitions for the argument. */
	public argsLength: number;
	/**Whether this command can only be run in the guild. */
	public guildOnly: boolean;
	/**Whether this command can only be run by the bot owner. */
	public botOwnerOnly: boolean;

	/**
	 * The constructor for the command.
	 * @param {Client} client The client.
	 * @param {CommandHelp} cmdHelp The command help interface.
	 * @param {CommandConfig} cmdConfig The command configuration interface.
	 */
	public constructor(client: Client, cmdHelp: CommandHelp, cmdConfig: CommandConfig) {
		this.client = client;
		this.name = cmdHelp.name;
		this.aliases = cmdHelp.aliases;
		this.description = cmdHelp.description;
		this.usage = cmdHelp.usage;
		this.example = cmdHelp.example;
		this.commandName = cmdConfig.commandName;
		this.botPermissions = cmdConfig.botPermissions;
		this.userPermissions = cmdConfig.userPermissions;
		this.argsLength = cmdConfig.argsLength;
		this.guildOnly = cmdConfig.guildOnly;
		this.botOwnerOnly = cmdConfig.botOwnerOnly;
	}

	/**
	 * The actual command code.
	 * @param {Client} client The client.
	 * @param {Message} message The message.
	 * @param {string[]} args The arguments.
	 * @param {GuildInterface} guildInfo The guild data.
	 * @abstract
	 */
	public async abstract execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void>;
}