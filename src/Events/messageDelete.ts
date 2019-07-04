import { Client, Message } from "discord.js";
import { EnhancedDates } from "../Utility/EnhancedDates";
import { ghostPings } from "../Handlers/UniversalVars";

module.exports.run = async (client: Client, message: Message): Promise<void> => {
	if (!message.guild) {
		return;
	}
	
	const d: EnhancedDates = new EnhancedDates();
	// who likes getting ghost pinged? not me, that's for sure. 
	if (message.mentions.members.size > 0 && message.createdTimestamp + 10000 >= d.getTime()) {
		ghostPings.push({
			id: message.author.id,
			content: message.content,
			sent: message.createdTimestamp,
			channel: message.channel.id
		});
		setTimeout(() => {
			ghostPings.splice(ghostPings.indexOf({
				id: message.author.id,
				content: message.content,
				sent: message.createdTimestamp,
				channel: message.channel.id
			}), 1);
		}, 7200000);
	}
}