import { Command } from "./Models/Command";
import { LoadCommands } from "./Utility/LoadCommands";
import fs from "fs";
import { Client } from "discord.js";
import { MongoDB } from "./Handlers/MongoDBHandler";
import { MongoDBConnectionURL } from "./Configuration/Configuration";

/**
 * The basis for the Discord bot.
 */
export class DiscordBot {
	private client: Client;
	private token: string;
	public static commands: Map<string, Command>;

	/**
	 * The basis for the Discord bot.
	 * @param {string} token The Discord token. 
	 */
	public constructor(token: string) {
		this.client = new Client({
			disabledEvents: [
				'USER_NOTE_UPDATE',
				'TYPING_START',
				'RELATIONSHIP_ADD',
				'RELATIONSHIP_REMOVE'
			]
		});
		this.token = token;
		DiscordBot.commands = this.loadCommands();
		this.connect();
		this.eventLoader();
	}

	/**
	 * All Discord.JS events are imported here. When an event is triggered, the event's respective file will run.
	 * @private
	 */
	private eventLoader(): void {
		fs.readdir(__dirname + "/Events/", (err, files) => {
			if (err) {
				console.log(err);
			}
			files.forEach((file: string) => {
				let eventFunc = require(`./Events/${file}`);
				let eventName = file.split(".")[0];
				this.client.on(eventName, (...args: any) => eventFunc.run(this.client, ...args));
			});
		});
	}

	/**
	 * Logs in to the Discord Bot and connects it to the API.
	 * @returns {Promise<string>} The bot token.
	 * @public
	 */
	public async login(): Promise<void> {
		this.client.login(this.token);
	}

	/**
	 * Loads all commands.
	 * @private
	 */
	private loadCommands(): Map<string, Command> {
		const cmd = new LoadCommands(this.client);
		let commands = cmd.loadCommands();
		return commands;
	}

	/**
	 * Reboots the bot. 
	 * @static
	 * @public
	 */
	public static async reboot(client: Client): Promise<void> {
		await client.destroy();
		setTimeout(() => {
			client.login();
		}, 3000);
	}

	/**
	 * Starts the MongoDB instance.
	 */
	public async connect(): Promise<void> {
		const mongo = new MongoDB.MongoDBHandler(MongoDBConnectionURL);
		mongo.connect();
	}
}
