import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration.Sample";

export default class ViewConfiguration extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "viewconfiguration",
			aliases: ["currentconfig"],
			description: "Allows you to check your current server configuration. You will want to execute the command beforehand to see all possible options.",
			usage: [],
			example: []
		}, {
			commandName: "View Server Configuration",
			botPermissions: [],
			userPermissions: ["VIEW_AUDIT_LOG"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	// TODO: add prettified version

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let choices: string[] = await this.getChoices(message),
			query: string;

		if (!choices.includes(args[0])) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", ...choices));
			return;
		} else {
			query = args[0];
		}

		await this.serverSettings(message, query).then(async (embed: RichEmbed) => {
			await message.channel.send(embed);
		});
	}

	/**Gets the server settings. */
	private serverSettings(message: Message, query: string): Promise<RichEmbed> {
		// wait a minute
		// i could have just done a for loop through the guildInfo obj.
		// welp im an idiot
		// TODO fix
		return new Promise((resolve, reject) => {
			const settings = new RichEmbed()
				.setColor(Colors.randomElement())
				.setAuthor(message.author.tag, message.author.avatarURL)
				.setTimestamp()
				.setFooter("Turkie Settings")
				.setTitle(`Server Settings: ${message.guild.name}`);
			let name: string = "",
				str: string = "";
			TurkieBotGuild.collection.find({ guildID: message.guild.id }).forEach(doc => {
				Object.keys(doc).forEach(key => {
					if (["__v", "_id", "__proto__", "guildID", "others", "customCommands"].includes(key)) {
						return;
					}
					if (!query.includes(key)) {
						return;
					}
					name = `Category Settings: **${key.splitAndTitle()}**`;
					Object.keys(doc[key]).forEach(prop => {
						if (["serverLogs", "autoRole"].includes(prop)) { 
							return; 
						}
						str += `**${prop.splitAndTitle()}**\n`;
						if (typeof doc[key][prop] === "object") {
							for (let field in doc[key][prop]) {
								if (typeof doc[key][prop][field] === 'object') {
									continue;
								} else {
									// test to see if bool
									if (typeof doc[key][prop][field] === "boolean") {
										str += `» ${field.splitAndTitle()}\n\`\`\`\n${doc[key][prop][field] ? "Yes" : "No"}\`\`\`\n`;
									} else {
										str += `» ${field.splitAndTitle()}\n\`\`\`\n${String(doc[key][prop][field]).trim().length > 0 ? doc[key][prop][field] : "N/A"}\`\`\`\n`;
									}
								}
							}
						} else {
							if (typeof doc[key][prop] === "boolean") {
								str += `\`\`\`\n${doc[key][prop] ? "Yes" : "No"}\`\`\`\n`;
							} else {
								str += `\`\`\`\n${String(doc[key][prop]).trim().length > 0 ? doc[key][prop] : "N/A"}\`\`\`\n`;
							}
						}
						
					});
					str = str.replace("undefined", "");
					if (str.trim().length !== 0) {
						settings.addField(name, str.trim());
					}
					str = "", name = "";
				});
				resolve(settings);
			});
		});
	}
	
	/**Gets the possible choices. */
	private getChoices(message: Message): Promise<string[]> {
		return new Promise((resolve, reject) => {
			let posChoice: string[] = [];
			TurkieBotGuild.collection.find({ guildID: message.guild.id }).forEach(doc => {
				Object.keys(doc).forEach(key => {
					if (["__v", "_id", "__proto__", "guildID", "others", "customCommands"].includes(key)) {
						return;
					}
					posChoice.push(key);
				});
				resolve(posChoice);
			});
		});
	}
}