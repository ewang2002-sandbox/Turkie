import { Command } from "../../Models/Command";
import { Client, Message, Collection, MessageEmbed, TextChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";

export default class Clear extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "clear",
			aliases: ["purge"],
			description: "Clears up to 100 messages in a channel. This command will ignore pinned messages unless otherwise specified.",
			usage: ["purge <1-100> [@Mention] [clearpin] [bot]"],
			example: ["purge 10", "purge 53 @Console#8939", "purge 94 clearpin bot", "purge 15 clearpin", "purge 34 bot"]
		}, {
			commandName: "Clear Messages",
			botPermissions: ["MANAGE_MESSAGES"],
			userPermissions: ["MANAGE_MESSAGES"],
			argsLength: 1,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		await message.delete().catch(error => { });
        const messagetoDelete: string = args[0];
        let parseArguments: string = args.slice(1).join(' ');

        if (Number.isNaN(Number.parseInt(messagetoDelete))) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_NUMBER_INPUT"));
			return;
		}

		let amtMessages: number = Number.parseInt(messagetoDelete);
		
        let messages: Collection<string, Message> = await message.channel.messages.fetch({
            limit: amtMessages && amtMessages <= 100 ? amtMessages : 100
        });

		let pBot: boolean = false;
		let pUser: boolean = false;
		let purgePin: boolean = false;

		if (!parseArguments.toLowerCase().includes('clearpin')) {
			messages = messages.filter(message => !message.pinned);
			purgePin = true;
		}

        if (parseArguments.toLowerCase().includes('bot')) {
			messages = messages.filter(message => message.author.bot);
			pBot = true;
        } else if (message.mentions.users.size > 0) {
            let user = message.mentions.users.first();
			messages = messages.filter(message => message.author.id === user.id);
			pUser = true;
        }
		
		let resultantMsgs = await message.channel.bulkDelete(messages, true).catch(e => { });

		const embed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setTitle("♻ **Purge Successful!**")
			.setDescription(`${resultantMsgs ? `${resultantMsgs.size} messages have been cleared.` : "No messages have been cleared."}`)
			.addField("Moderator", `${message.author} (${message.author.id})`)
			.addField("Server", message.guild.name)
			.setFooter("Turkie Moderation")
			.setColor(Colors.randomElement());
		if (resultantMsgs) {
			if (pBot) {
				embed.addField("Purged Bot Messages?", "Yes");
			}
			if (pUser) {
				embed.addField("Purged User Messages?", `Purged ${message.mentions.users.first()}`);
			}
			if (!purgePin) {
				embed.addField("Purged Pins?", "Yes");
			}
		}
		// make sure we can send to modlogs
		if (ModerationEnforcement.configuredModLogs(message, guildInfo)) {
			(message.guild.channels.get(guildInfo.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embed);
		}
	}
}