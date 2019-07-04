import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { CommandManager } from "../../Utility/CommandManager";
import path from "path";
import fs from "fs";
import NumberFunctions from "../../Utility/NumberFunctions";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { DefaultPrefix, Colors } from "../../Configuration/Configuration";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class BotHelp extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "help",
			aliases: [],
			description: "Get all the commands this bot has, or get specifics on one command.",
			usage: ["help [Command Name]"],
			example: ["help", "help ping"]
		}, 
		{
			commandName: "Help & Command Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		})
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let commandToSearchFor: string = args[0];
		// make new command class
		const command: CommandManager = new CommandManager(client, commandToSearchFor);

		// find command
		if (command.findCommand()) {
			message.channel.send(command.helpCommand());
			return;
		}

		let commands: string[] = [];
		let mods: string[] = [];
		let fields: [string, string, number][] = [];

		// Find all commands in the /Commands folder.
		const loadRecursive = (dir: string) => {
			fs.readdirSync(dir).forEach((fileName: string) => {
				const file = `${dir}/${fileName}`;
				if (fs.statSync(file).isDirectory()) {
					loadRecursive(file);
					return;
				}

				const classFile = require(file);
				if (classFile.default) {
					const cmd: Command = new classFile.default(client);
					commands.push(cmd.name);
				}
			});
			let directorypath = dir.split(/[\\/]/)[dir.split(/[\\/]/).length - 1];
			if (!directorypath.toLowerCase().includes("commands") || commands.length !== 0) {
				fields.push([directorypath, MessageFunctions.codeBlockIt(commands.join(" • ")), commands.length]);
				mods.push(directorypath);
			}
			commands = [];
			return {
				f: fields,
				m: mods
			}
		}

		const data = loadRecursive(path.resolve(__dirname, '../../Commands'));
		fields = data.f;

		const modToFind: string = args.join(" ");
		let isFound: boolean = false,
			len: number = null;

		var field: any[] = [];
		for (var i = 0; i < fields.length; i++) {
			if (fields[i][0].toLowerCase().includes(modToFind.toLowerCase())) {
				isFound = true;
				field.push({
					name: fields[i][0],
					value: fields[i][1]
				})
				len = fields[i][2];
				break;
			}
		}

		if (!modToFind || !isFound) {
			const d = new RichEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL)
				.setTitle("Bot Modules")
				.setDescription(`Command Usage: \`${guildInfo ? guildInfo.serverConfiguration.prefix : DefaultPrefix}help <Module>\`.`)
				.addField("Modules", `\`\`\`css\n${mods.join(" • ")}\`\`\``)
				.setColor(Colors.randomElement())
				.setTimestamp()
				.setFooter("Turkie")
			message.channel.send(d).catch(e => { })
			return;
		}

		message.channel.send({
            embed: {
				color: NumberFunctions.randomInt(100000, 16777215),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL
				},
                title: 'Bot Commands List',
                description: `Use \`${guildInfo ? guildInfo.serverConfiguration.prefix : DefaultPrefix}help <Command Name>\` to learn how to use it.`,
                fields: field,
                footer: {
                    text: `Module: ${len} Commands`
                }
            }
        }).catch(e => { });
	}
}