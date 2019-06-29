import { Client, Guild, RichEmbed, Message, TextChannel } from "discord.js";
import { EnhancedDates } from "../Utility/EnhancedDates";
import { LogGuildAddRemove } from "../Configuration/Constants";
import { MongoDB } from "../Handlers/MongoDBHandler";
import { Colors } from "../Configuration/Configuration";

module.exports.run = async (client: Client, guild: Guild): Promise<void> => {
	const time: EnhancedDates = new EnhancedDates();
	const embed: RichEmbed = new RichEmbed()
		.setAuthor(guild.name, guild.iconURL)
		.setTitle("📥 New Guild Joined")
		.setDescription(`The bot was invited at ${time.formatUTCDate(time.getTime())}.`)
		.addField("Member Count", guild.memberCount, true)
		.addField("Server Owner", (`${guild.owner} ${guild.owner.id}`), true)
		.addField("Server Channels", guild.channels.size, true)
		.addField("Server Roles", guild.roles.size, true)
		.setColor(Colors.randomElement());
	if (LogGuildAddRemove && client.channels.has(LogGuildAddRemove)) {
		(client.channels.get(LogGuildAddRemove) as TextChannel).send(embed).catch(e => { });
	}

	const mdHandler = new MongoDB.MongoDBGuildHandler(guild.id);
	mdHandler.createGuildData();
}