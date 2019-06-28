import { Client, Guild, User, RichEmbed, TextChannel, GuildAuditLogsEntry } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { Colors } from "../Configuration/Configuration";

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

			const banAdd: RichEmbed = new RichEmbed()
				.setAuthor(user.tag, user.displayAvatarURL)
				.setTitle("🔨 Member Banned")
				.setDescription(`${user} was banned from ${guild.name}.`)
				.addField("User ID", "```css\n" + user.id + "```", true)
				.addField("Banned By", admin)
				.addField("Reason", entry.reason ? "```css\n" + entry.reason + "```" : "```css\n" + "None" + "```")
				.setThumbnail(user.displayAvatarURL)
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