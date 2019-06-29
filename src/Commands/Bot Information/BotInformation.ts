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
			.addField("Server Count", client.guilds.size.toLocaleString(), true)
			.addField("User Count", client.users.size.toLocaleString(), true)
			.addField("Channel Count", client.channels.size.toLocaleString(), true)
			.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true);
		message.channel.send(embed).catch(e => { });
	}
}