import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import { inspect } from "util";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";
import { promisify } from "util";
import { exec as execute } from "child_process";
const exec = promisify(execute);


export default class ExecuteTerminal extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "execute",
			aliases: ["exec"],
			description: "Executes a command in the Terminal (Linux or MacOS) or Command Prompt/Powershell (Windows) and shows the output, if any. The process will automatically terminate in one minute. Specifying --p in the arguments will make the bot print the text out without an embed, ideal if you want to see something visually pleasing.",
			usage: ["exec [--p] <Command>"],
			example: ["exec DIR /B"]
		}, {
			commandName: "Execute Commands in Shell",
			botPermissions: [],
			userPermissions: [],
			argsLength: 1,
			guildOnly: false,
			botOwnerOnly: true
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let toParse: string = "";
		let plainText: boolean = false;

		if (args[0] === "--p") {
			toParse = args.join(" ").replace("--p", "");
			plainText = true;
		} else {
			toParse = args.join(' ');
		}

		// begin try catch
		try {
			message.react("✅").catch(e => { });
			let msgToSend: MessageEmbed | string = "";
			if (args[0] === "--p") {
				toParse = args.join(" ").replace("--p", "");
				plainText = true;
			} else {
				toParse = args.join(' ');
			}

			// execute and see what to expect
			let { stdout, stderr } = await exec(toParse, { timeout: 60 * 1000 });

			if (!plainText) {
				msgToSend = new MessageEmbed()
					.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
					.setTitle('Results')
					.setColor(Colors.randomElement())
					.addField('📥 Input', `\`\`\`bash\n${args.join(" ")}\n\`\`\``);
			} else {
				msgToSend = "";
			}

			// if yes
			if (stdout) {
				if (!plainText) {
					await this.extend(msgToSend as MessageEmbed, stdout);
				} else {
					msgToSend = this.sanitize(stdout);
				}
			} else if (stderr) { // else if error
				if (!plainText) {
					await this.extend(msgToSend as MessageEmbed, stderr);
				} else {
					msgToSend = this.sanitize(stderr);
				}
			} else {
				if (!plainText) {
					(msgToSend as MessageEmbed).addField('📤 Output Successful', '```bash\n# Command executed successfully but returned no output.```');
				} else {
					msgToSend = '```bash\n# Command executed successfully but returned no output.```';
				}
			}

			message.channel.send(msgToSend).catch(e => { });
		} catch (e) {
			if (e.cmd) {
				let msgToSend: MessageEmbed | string;

				if (!plainText) {
					msgToSend = new MessageEmbed()
						.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
						.setTitle('Results')
						.setColor(Colors.randomElement())
						.addField('📥 Input', `\`\`\`bash\n${args}\n\`\`\``);
				} else {
					msgToSend = "";
				}

				if (e.stdout) {
					if (!plainText) {
						this.extend(msgToSend as MessageEmbed, e.stdout);
					} else {
						msgToSend = this.sanitize(e.stdout);
					}
				} else if (e.stderr) {
					if (!plainText) {
						await this.extend(msgToSend as MessageEmbed, e.stderr);
					} else {
						msgToSend = this.sanitize(e.stderr);
					}
				} else {
					if (!plainText) {
						(msgToSend as MessageEmbed).addField('📤 Output Time-Out', '```bash\n# Command was terminated after running for 1 minute and returned no output.```');
					} else {
						msgToSend = '```bash\n# Command was terminated after running for 1 minute and returned no output.```';
					}
				}

				message.channel.send(msgToSend);
			}
		}
	}

	/**
	* @param {MessageEmbed} msgToSend The MessageEmbed constructor. 
	* @param {string} string The string output from execution.
	* @returns {boolean} 
	*/
	private extend(msgToSend: MessageEmbed, string: string): boolean {
		let i = 0;
		let length = 100;
		while (string.length > 0) {
			i++;
			if (length > 5000) {
				break;
			}
			msgToSend.addField(`📤 Output (Part ${i})`, `\`\`\`xl\n${string.length < 1024 ? string : string.slice(0, 1010) + "..."}\n\`\`\``, true);
			string = string.slice(1010);
			length += string.slice(0, 1010).length;
		}
		return true;
	}

	/**
	 * Limits the string length to 2000 characters
	 * @function sanitize
	 * @param {string} text The stdout/stderr output
	 * @returns {string} Trimmed stdout/stderr string
	 */
	private sanitize(text: string): string {
		text = text.toString();
		if (text.length > 2000) {
			return `\`\`\`bash\n${text.substring(0, 1980) + "..."}\`\`\``;
		}
		return `\`\`\`bash\n${text.substring(0, 1985)}\`\`\``;
	}
}

