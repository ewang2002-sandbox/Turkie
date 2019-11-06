import { Client, Guild, User, MessageEmbed, TextChannel, GuildAuditLogsEntry } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { Colors } from "../Configuration/Configuration";
import MessageFunctions from "../Utility/MessageFunctions";

module.exports.run = async (client: Client, guild: Guild, user: User): Promise<void> => {
	TurkieBotGuild.findOne({ guildID: guild.id }, async (err: any, data: GuildInterface) => {
		if (data.serverConfiguration.serverLogs.modLogs.isEnabled) {
			guild.fetchAuditLogs({ limit: 5 }).then(logs => {
				let action = logs.entries.array()[0];
				
				if (action.executor.id === client.user.id) {
					return;
				}
				
				const banRemove: MessageEmbed = new MessageEmbed()
					.setAuthor(action.executor.tag, action.executor.avatarURL({ format: "png" }))
					.setTitle("➕ Member Unbanned")
					.setDescription(`${user} was unbanned from ${guild.name}`)
					.addField("User ID", MessageFunctions.codeBlockIt(user.id), true)
					.addField("Unbanned By", action.executor, true)
					.setThumbnail(user.avatarURL({ format: "png" }))
					.setTimestamp()
					.setColor(Colors.randomElement())
					.setFooter("Turkie");

				const chan = client.channels.get(data.serverConfiguration.serverLogs.modLogs.channel) as TextChannel;

				if (chan) {
					chan.send(banRemove).catch(e => { });
				}
			});
		}
	});
}