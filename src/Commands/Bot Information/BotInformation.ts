import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";

export default class ExampleCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "botinfo",
			aliases: [],
			description: "Provides information about the bot.",
			usage: [],
			example: []
		}, {
				commandName: "Bot Information",
				botPermissions: [],
				userPermissions: [],
				argsLength: 0,
				guildOnly: false,
				botOwnerOnly: false
			});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let time = this.convertMS(client.uptime);
		const embed: RichEmbed = new RichEmbed()
			.setColor(Colors.randomElement())
			.setAuthor(client.user.tag, client.user.displayAvatarURL)
			.setTitle("**Bot Information: Turkie**")
			.setDescription("Turkie is a bot that primarily focuses on moderation. It was designed with the following ideas in mind.\n- To be free for everyone to use (i.e. no paywall behind features).\n- To be free of bloat (i.e. no useless commands that will slow the bot down).\n- To be clear, complete, and concise (i.e. easy to use).")
			.addField("Framework", "`Discord.JS` ⇨ [discord.js.org](https://discord.js.org/)", true)
			.addField("Language", "`TypeScript` ⇨ [typescriptlang.org](https://www.typescriptlang.org/)", true)
			.addField("Developer", "`Edward#7307` ⇨ [Github](https://github.com/ewang20027)", true)
			.addField("Repository", "`Turkie` ⇨ [Github](https://github.com/ewang20027/turkie)", true)
			.addBlankField()
			.addField("Uptime", "```css\n" + (`${time.day}:${time.hour}:${time.minute}:${time.seconds}`) + "```", true)
			.addField("Server Count", "```css\n" + client.guilds.size.toString() + "```", true)
			.addField("User Count", "```css\n" + client.users.size.toString() + "```", true)
			.addField("Channel Count", "```css\n" + client.channels.size.toString() + "```", true)
			.addField("Memory Usage", "```css\n" + (`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`) + "```", true);
		message.channel.send(embed).catch(e => { });
	}

	/**
	 * Formats milliseconds into duration.
	 * @param {number} t The amount of time in ms.
	 * @returns {string} The formatted elapsed duration.
	 */
	private convertMS(milliseconds: number): {
		day: number | string,
		hour: number | string,
		minute: number | string,
		seconds: number | string
	} {
		let day: number | string, 
			hour: number | string, 
			minute: number | string, 
			seconds: number | string;
		seconds = Math.floor(milliseconds / 1000);
		minute = Math.floor(seconds / 60);
		seconds = seconds % 60;
		hour = Math.floor(minute / 60);
		minute = minute % 60;
		day = Math.floor(hour / 24);
		hour = hour % 24;
		return {
			day: this.pad(day),
			hour: this.pad(hour),
			minute: this.pad(minute),
			seconds: this.pad(seconds)
		};
	}

	/**
	 * Appends a 0 if the amount is less than 10.
	 * @param {number} amt The number.
	 * @returns {number | string} The result.
	 */
	private pad(amt: number): number | string {
		return amt < 10 ? '0' + amt : amt; 
	}
}