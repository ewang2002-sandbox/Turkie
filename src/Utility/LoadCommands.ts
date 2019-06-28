import { Client } from "discord.js";
import { readdirSync, statSync } from "fs";
import { resolve, basename } from "path";
import { Command } from "../Models/Command";

/**Loads all commands from the Commands folder. */
export class LoadCommands {
	/**The client. */
	private client: Client;
	/**Commands map. */
	private cmdMap: Map<string, Command> = new Map<string, Command>();
	/**Commands array. Just for length purpose, nothing special. */
	private commands: Command[] = [];

	/**The constructor. This should only be instantiated once. */
	public constructor(client: Client) {
		this.client = client;
	}

	/**
	 * Loads all comamnds and returns the map containing the commands.
	 */
	public loadCommands() {
		const cmdDir = resolve(__dirname, "../Commands/");

		const loadRecursive = (dir: string) => {
			console.log(`============\x1b[2m[FOLDER Set: ${dir}]\x1b[0m============`);
			readdirSync(dir).forEach((fileName: string) => {
				const file: string = `${dir}/${fileName}`;

				if (statSync(file).isDirectory()) {
					loadRecursive(file);
					return;
				}

				// require the file
				const classFile = require(file);
				if (classFile.default) {
					const cmd: Command = new classFile.default(this.client);
					this.commands.push(cmd);

					// Register main command name
					if (this.cmdMap.has(cmd.name.toLowerCase())) {
						console.error(`[ERROR] Duplicate Command Name Found: ${cmd.name}\nPATH: ${file}`);
						process.exit(1);
					}
					this.cmdMap.set(cmd.name.toLowerCase(), cmd);

					// Register aliases
					cmd.aliases.forEach(a => {
						if (this.cmdMap.has(a.toLowerCase())) {
							console.error(`Duplicate command alias ${a}`);
							process.exit(1);
						}
						this.cmdMap.set(a.toLowerCase(), cmd);
					});

					console.log(
						`Loaded \x1b[34m${cmd.name}\x1b[0m from ` +
						`\x1b[2m${basename(file)}\x1b[0m`
					);
				}
			});
		}

		loadRecursive(cmdDir);
		console.log(`Loaded \x1b[32m${this.commands.length}\x1b[0m commands!`);
		return this.cmdMap;
	}
}