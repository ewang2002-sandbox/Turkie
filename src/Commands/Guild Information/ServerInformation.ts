import { Command } from "../../Models/Command";
import { Client, Message, Emoji, RichEmbed, Role } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { EnhancedDates } from "../../Utility/EnhancedDates";
import { Colors } from "../../Configuration/Configuration";

export default class ServerInformation extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "guildinfo",
			aliases: ["serverinfo"],
			description: "Gives somewhat basic information about the guild. :)",
			usage: [],
			example: []
		}, {
			commandName: "Server Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const online: Emoji = client.emojis.get("536442518317957130"); // 469647586912108547
		const idle: Emoji = client.emojis.get("536442519152754698"); // 469647586811183125
		const dnd: Emoji = client.emojis.get("536442519169531914"); // 469647586635153408
		const invisible: Emoji = client.emojis.get("536442518603038721"); // 469647586752462858
		const streaming: Emoji = client.emojis.get("536442518938845185"); // 529392778585571328

		let serverRoles: string = "@everyone, ";
		for (const [id, roles] of message.guild.roles) {
			serverRoles += `<@&${id}>, `;
		}
		serverRoles = serverRoles.replace(/,\s*$/, "");

		let onlineCount: number = message.guild.members.filter(m => m.user.presence.status === 'online').size;
		const offlineCount: number = message.guild.members.filter(m => m.user.presence.status === 'offline').size;
		const dndCount: number = message.guild.members.filter(m => m.user.presence.status === 'dnd').size;
		const idleCount: number = message.guild.members.filter(m => m.user.presence.status === 'idle').size;
		const streamingCount: number = message.guild.members.filter(m => m.user.presence.game ? m.user.presence.game.streaming === true : false).size;
		onlineCount = onlineCount - streamingCount;

		const embed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle(`Guild: **${message.guild.name}**`)
			.setColor(Colors.randomElement())
			.setFooter("Turkie")
			.setThumbnail(message.guild.iconURL)
			.setTimestamp()
			.setDescription(`This server was created on: ${EnhancedDates.formatUTCDate(message.guild.createdTimestamp)}`)
			.addField('Region', message.guild.region.replace(/\W/g, ' ').toUpperCase(), true)
			.addField('Owner', message.guild.owner.user, true)
			.addField('Server ID', message.guild.id, true)
			.addField('Verification Level', this.veriToText(message.guild.verificationLevel), true)
			.addField('Channels', `📁 Categories: ${message.guild.channels.filter(c => c.type !== 'voice' && c.type !== 'dm' && c.type !== 'group' && c.type !== 'text').size}\n#⃣ Text: ${message.guild.channels.filter(c => c.type === 'text').size}\n🎤 Voice: ${message.guild.channels.filter(c => c.type === 'voice').size}`, true)
			.addField(`Members (${message.guild.members.filter(member => !member.user.bot).size} | ${message.guild.members.size})`, `${online} ${onlineCount}\n${idle} ${idleCount}\n${dnd} ${dndCount}\n${streaming} ${streamingCount}\n${invisible} ${offlineCount}`, true);

		// Begin Emojis
		let emojis: Emoji[] = [];
		for (const [id, emoji] of message.guild.emojis) {
			emojis.push(emoji);
		}

		let i = 0;
		while (emojis.length > 0) {
			i++;
			embed.addField(`Emojis (Part ${i})`, emojis.slice(0, 20).join(" "), true);
			emojis = emojis.slice(20);
		}

		// Begin Roles
		let allRoles: Role[] = [];
		for (const [id, role] of message.guild.roles) {
			allRoles.push(role);
		}

		i = 0;
		while (allRoles.length > 0) {
			i++;
			embed.addField(`Roles (${message.guild.roles.size}) (Part ${i})`, allRoles.slice(0, 20).join(" "), true);
			allRoles = allRoles.slice(20);
		}


		await message.channel.send(embed).catch(e => { });
	}

	/**Gets the verification information from the text. */
	private veriToText(lvl: number): string {
		switch (lvl) {
			case 0:
				return "None";
			case 1:
				return "Verified Email";
			case 2:
				return "Verified Email & Registered on Discord for 5 Minutes or More.";
			case 3:
				return "Verified Email & Registered on Discord for 10 Minutes or More.";
			case 4:
				return "Verified Phone.";
			default:
				return "Ultra???";
		}
	}
}