import { Client, Guild, User, MessageEmbed, TextChannel, GuildAuditLogsEntry } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { Colors } from "../Configuration/Configuration";
import MessageFunctions from "../Utility/MessageFunctions";

module.exports.run = async (client: Client, guild: Guild, user: User): Promise<void> => {
	TurkieBotGuild.findOne({ guildID: guild.id }, async (err: any, data: GuildInterface) => {
		if (data.serverConfiguration.serverLogs.modLogs.isEnabled) {
			const entry: GuildAuditLogsEntry = await guild.fetchAuditLogs({
				type: "MEMBER_BAN_ADD"
			}).then(audit => audit.entries.first());

			// get admin
			let admin: User | string = "";
			if ((entry.executor)) {
				admin = entry.executor;
			} else {
				admin = "Unknown";
			}

			// because we don't really need to know that the bot banned the user when it has modlogs.
			if (admin instanceof User && admin.id === client.user.id) {
				return;
			}

			const banAdd: MessageEmbed = new MessageEmbed()
				.setAuthor(user.tag, user.avatarURL({ format: "png" }))
				.setTitle("🔨 Member Banned")
				.setDescription(`${user} was banned from ${guild.name}.`)
				.addField("User ID", MessageFunctions.codeBlockIt(user.id), true)
				.addField("Banned By", admin)
				.addField("Reason", entry.reason ? MessageFunctions.codeBlockIt(entry.reason) : MessageFunctions.codeBlockIt("None"))
				.setThumbnail(user.avatarURL({ format: "png" }))
				.setTimestamp()
				.setColor(Colors.randomElement())
				.setFooter("Turkie");
			const chan = client.channels.get(data.serverConfiguration.serverLogs.modLogs.channel) as TextChannel;
			if (chan) {
				chan.send(banAdd).catch(e => { });
			}
		}
	});
}