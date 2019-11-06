import { Client, Guild, MessageEmbed, Message, TextChannel } from "discord.js";
import { EnhancedDates } from "../Utility/EnhancedDates";
import { LogGuildAddRemove } from "../Configuration/Constants";
import { MongoDB } from "../Handlers/MongoDBHandler";
import { Colors } from "../Configuration/Configuration";

module.exports.run = async (client: Client, guild: Guild): Promise<void> => {
	const time: EnhancedDates = new EnhancedDates();
	const embed: MessageEmbed = new MessageEmbed()
		.setAuthor(guild.name, guild.iconURL({ format: "png" }))
		.setTitle("📤 Left Guild")
		.setDescription(`The bot was kicked at ${EnhancedDates.formatUTCDate(time.getTime())}.`)
		.addField("Member Count", guild.memberCount, true)
		.addField("Server Owner", (`${guild.owner} ${guild.owner.id}`), true)
		.setColor(Colors.randomElement());
	if (LogGuildAddRemove && client.channels.has(LogGuildAddRemove)) {
		(client.channels.get(LogGuildAddRemove) as TextChannel).send(embed).catch(e => { });
	}

	const mdHandler = new MongoDB.MongoDBGuildHandler(guild.id);
	mdHandler.deleteData();
}