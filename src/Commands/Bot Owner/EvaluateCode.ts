import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { inspect } from "util";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";

export default class EvaluateCode extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "eval",
			aliases: ["evaluate"],
			description: "Evaluates JavaScript code.",
			usage: ["eval <JavaScript Code>"],
			example: ["eval console.log(\"Hi\")"]
		}, {
			commandName: "JavaScript Code Evaluation",
			botPermissions: [],
			userPermissions: [],
			argsLength: 1,
			guildOnly: false,
			botOwnerOnly: true
		})
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const code: string = args.join(" ");

		const codeEmbed: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle('Eval Command Results')
			.setColor(Colors.randomElement())
			.addField('📥 Input', `\`\`\`\n${code}\n\`\`\``);
		try {
			let evaled: string = eval(code);
	
			if (typeof evaled !== "string") {
				evaled = inspect(evaled);
			}
	
			let i: number = 0;
			let length: number = 100;
	
			while (evaled.length > 0) {
				i++;
				if (length > 5000) break;
				codeEmbed.addField(`📤 Output (Part ${i})`, `\`\`\`xl\n${evaled.length < 1024 ? evaled : evaled.slice(0, 1010) + "..."}\n\`\`\``, true);
				evaled = evaled.slice(1010);
				length += evaled.slice(0, 1010).length;
			}
		} catch (err) {
			codeEmbed.addField('📤 Output Error', `\`\`\`xl\n${err}\n\`\`\``);
		} finally {
			message.channel.send(codeEmbed);
		}
	}
}