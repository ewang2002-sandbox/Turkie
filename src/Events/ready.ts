import { Client, PresenceStatus, User, ActivityType, Guild, PresenceData, PresenceStatusData } from "discord.js";
import { EnhancedDates } from "../Utility/EnhancedDates";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { MongoDB } from "../Handlers/MongoDBHandler";

module.exports.run = async (client: Client): Promise<void> => {
	const statuses: PresenceData["activity"][] = [
		{
			"type": "PLAYING",
			"name": "Visual Studio Code"
		},
		{
			"type": "PLAYING",
			"name": "With My Best Friends"
		},
		{
			"type": "PLAYING",
			"name": "Minecraft"
		}
	];

	// possible presense for the bot.
	const presense: PresenceStatusData[] = [
		"online",
		"idle",
		"dnd"
	];

	// Choosing a random game every 30 seconds.
	setInterval(() => {
		const status = statuses.randomElement();
		client.user.setPresence({
			activity: {
				name: status["name"],
				type: status["type"]
			},
			status: presense.randomElement()
		});
	}, 3000)

	let date = new EnhancedDates();
	// get info
	let app = await client.fetchApplication();
	let owner: User = await client.users.fetch(app.owner.id);
	console.log('\x1b[36m%s\x1b[0m', `${client.user.tag} has started on ${EnhancedDates.formatUTCDate(date.getTime())}.\nBOT TAG: ${client.user.tag}\nBOT ID: ${client.user.id}\nOWNER TAG: ${owner.tag}\nOWNER ID: ${owner.id}`);



	// Guilds that the bot is in.
	let guilds = Array.from(client.guilds.values());
	let guildBots: string[] = [];
	guilds.forEach(guild => {
		guildBots.push(guild.id);
	});

	// Checking to see if a guild does NOT have a database.
	for (let i = 0; i < guildBots.length; i++) {
		const guildid = guildBots[i];
		TurkieBotGuild.findOne({ guildID: guildid }, (err, data: GuildInterface) => {
			if (err) {
				throw new Error(err);
			}
			if (!data) {
				const g = new MongoDB.MongoDBGuildHandler(guildid);
				g.createData();
			}
		});
	}

	// delete guilds that the bot isnt a member of
	TurkieBotGuild.find({}, (err, data: GuildInterface) => {
		if (!guildBots.includes(data.guildID)) {
			const g = new MongoDB.MongoDBGuildHandler(data.guildID);
			g.deleteData();
		}
	});
}