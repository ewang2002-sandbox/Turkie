import { Client, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { EnhancedDates } from "../Utility/EnhancedDates";
import { Colors } from "../Configuration/Configuration";
import MessageFunctions from "../Utility/MessageFunctions";

module.exports.run = async (client: Client, member: GuildMember): Promise<void> => {
	TurkieBotGuild.findOne({ guildID: member.guild.id }, async (err: any, data: GuildInterface) => {
		if (err) {
			throw new Error(err);
		}

		const date: EnhancedDates = new EnhancedDates();
		if (data.serverConfiguration.serverLogs.joinLeaveLogs.isEnabled) {
			const left: MessageEmbed = new MessageEmbed()
				.setAuthor(member.user.tag, member.user.avatarURL({ format: "png" }))
				.setTitle("📤 Member Left")
				.setDescription(`${member} has left ${member.guild.name}`)
				.addField("User ID", MessageFunctions.codeBlockIt(member.id), true)
				.setThumbnail(member.user.avatarURL({ format: "png" }))
				.setTimestamp()
				.setColor(Colors.randomElement())
				.setFooter("Turkie");

			const chan = member.guild.channels.get(data.serverConfiguration.serverLogs.joinLeaveLogs.channel) as TextChannel;

			if (chan) {
				chan.send(left).catch(e => { });
			}
		}
	});
}