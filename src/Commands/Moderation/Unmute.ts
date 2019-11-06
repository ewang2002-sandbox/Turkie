import { Command } from "../../Models/Command";
import { Client, Message, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";
import { getUserFromMention } from "../../Handlers/Util";

export default class Unmute extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "unmute",
			aliases: [],
			description: "Unmutes a user.",
			usage: ["unmute <@Mention> [Reason: STRING]"],
			example: ["unmute @User#0001", "unmute @User#0001 For behaving"]		
		}, {
			commandName: "Unmute",
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
			member = await ModerationEnforcement.fetchMember(message, getUserFromMention(client, args[0]).id);
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

		if (message.author.id !== message.guild.ownerID && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Role Hierarchy Error", "The person you are attempting to mute has equal or higher role permissions than you."));
			return;
		}

		// make sure the role is in guild and the member has it
		if (!(guildInfo.moderation.moderationConfiguration.mutedRole && message.guild.roles.has(guildInfo.moderation.moderationConfiguration.mutedRole) && member.roles.has(guildInfo.moderation.moderationConfiguration.mutedRole))) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Not Muted", `${member} is not muted.`));
			return;
		}
		
		let reason: string = args.slice(1).join(' ');

		if (!reason) {
			reason = 'No reason provided.';
		}

		const me: ModerationEnforcement = new ModerationEnforcement(message, guildInfo, []);
		me.unmuteUser(member, reason);

		// modlog
		const embed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setTitle("🔈 **Unmute Successful!**")
			.setDescription("The user has been unmuted successfully.")
			.addField("Muted User", `${member} (${member.id})`)
			.addField("Moderator", `${message.author} (${message.author.id})`)
			.addField("Reason", reason)
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