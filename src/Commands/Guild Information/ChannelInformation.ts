import { Command } from "../../Models/Command";
import { Client, Message, TextChannel, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { EnhancedDates } from "../../Utility/EnhancedDates";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";

export default class ChannelInformation extends Command {
	
	public constructor(client: Client) {
		super(client, {
			name: "channelinfo",
			aliases: [],
			description: "Provides information on a channel.",
			usage: ["channelinfo [#CHANNEL-MENTION]", "channelinfo [Channel ID]"],
			example: ["channelinfo #general", "channelinfo 488538699102027806"]
		}, {
			commandName: "Channel Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let channel: TextChannel = message.mentions.channels.first();
		if (!channel) {
			if (parseInt(args[0]) < 9223372036854775807) {
				channel = message.guild.channels.get(args[0]) as TextChannel;
			} else {
				channel = message.channel as TextChannel;
			};
		}

		if (channel) {
			const channelEmbed = new RichEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL)
				.setTitle(`Channel Information: #${channel.name}`)
				.setDescription((channel.topic === null || channel.topic.length < 2) ? 'No Channel Topic' : channel.topic)
				.addField("Channel ID", `${channel.id}`, true)
				.addField("Channel Members", channel.members.size, true)
				.addField("NSFW", (channel.nsfw) ? "Yes" : "No", true)
				.addField("Created On", `${EnhancedDates.formatUTCDate(channel.createdTimestamp)}`, true)
				.setTimestamp()
				.setFooter("Turkie")
				.setColor(Colors.randomElement());
			message.channel.send(channelEmbed);
		} else {
			const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "No Channel Found", "The channel you specified does not exist.");
			message.channel.send(embed).catch(e => { });
		}
	}
}