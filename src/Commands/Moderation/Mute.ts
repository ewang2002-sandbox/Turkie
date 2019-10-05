import { Command } from "../../Models/Command";
import { Client, Message, GuildMember, RichEmbed, TextChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";

export default class Mute extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "mute",
			aliases: [],
			description: "Mutes a user for a specified amount of time.",
			usage: ["mute <@Mention> [Time in Minutes: NUMBER] [Reason: STRING]"],
			example: ["mute @User#0001", "mute @User#0001 20", "mute @User#0001 12 Stop spamming channels"]
		}, {
			commandName: "Mute",
			botPermissions: ["MANAGE_ROLES"],
			userPermissions: ["MUTE_MEMBERS"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let member: GuildMember;
		if (message.mentions.users.size > 0) {
			member = await ModerationEnforcement.fetchMember(message, message.mentions.users.first().id);
		} else {
			if (OtherUtilities.checkSnowflake(args[0]) && message.guild.members.has(args[0])) {
				member = await ModerationEnforcement.fetchMember(message, args[0]);
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_ID", "user"));
				return;
			}
		}

		
		if (!member) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Mute Failed", `${message.author}, you need to tell me who to mute!`));
			return;
		}
		if (member.id === message.author.id) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Mute Failed", `${message.author}, why not just take a break from sending messages?`));
			return;
		}

		if (message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(member.highestRole) <= 0) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Role Hierarchy Error", "The person you are attempting to unmute has equal or higher role permissions than you."));
			return;
		}

		let reason: string,
			unmuteDuration: number;
		if (!isNaN(parseInt(args[1]))) {
			unmuteDuration = parseInt(args[1]);
			reason = args.slice(2).join(' ');
		} else {
			unmuteDuration = null;
			reason = args.slice(1).join(' ');
		}

		if (!reason) {
			reason = 'No reason provided.';
		}

		const me: ModerationEnforcement = new ModerationEnforcement(message, guildInfo, []);
		await me.muteUser(member, unmuteDuration, reason);

		// modlog
		const embed: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle("🔇 **Mute Successful!**")
			.setDescription("The user has been muted successfully.")
			.addField("Muted User", `${member} (${member.id})`)
			.addField("Moderator", `${message.author} (${message.author.id})`)
			.addField("Reason", reason)
			.addField("Duration", `${unmuteDuration ? `${unmuteDuration} Minutes`: "Indefinite"}`)
			.addField("Server", message.guild.name)
			.setFooter("Turkie Moderation")
			.setColor(Colors.randomElement());
		MessageFunctions.sendRichEmbed(message, embed);
		// make sure we can send to modlogs
		if (ModerationEnforcement.configuredModLogs(message, guildInfo)) {
			(message.guild.channels.get(guildInfo.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embed);
		}
	}
}