import { Command } from "../../Models/Command";
import { Client, Message, GuildMember, MessageEmbed, TextChannel, User } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import MessageFunctions from "../../Utility/MessageFunctions";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import { Colors } from "../../Configuration/Configuration";
import { getUserFromMention } from "../../Handlers/Util";

export default class Ban extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "ban",
			aliases: [],
			description: "Bans a user from the server, or an ID associated with a user.",
			usage: ["ban <@Mention> [Reason: STRING]"],
			example: ["ban @User#0001", "ban @User#0001 Spamming channels"]
		}, {
			commandName: "Ban",
			botPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let member: GuildMember | string;
		// get users
		if (message.mentions.users.size > 0) {
			let userMention: User = getUserFromMention(client, args[0])
			member = await ModerationEnforcement.fetchMember(message, userMention.id);
		} else {
			if (OtherUtilities.checkSnowflake(args[0])) {
				if (message.guild.members.has(args[0])) {
					member = await ModerationEnforcement.fetchMember(message, args[0]);
				} else {
					member = args[0];
				}
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_ID", "user"));
				return;
			}
		}

		// check to make sure the user isn't in guild
		if (typeof member === "string") {
			let isBanned = true;
			let reason = args.slice(1).join(' ').length > 0 ? args.slice(1).join(' ') : "No reason provided";
			await message.guild.members.ban(args[0], {
				days: 7,
				reason: `[${message.author.tag}] ${reason}`
			}).catch(e => {
				isBanned = false;
			});

			if (isBanned) {
				const embed: MessageEmbed = new MessageEmbed()
					.setTitle("🔨 **Ban Successful!**")
					.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
					.setDescription("The user has been banned successfully.")
					.addField("Banned ID", args[0])
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
		} else {
			if (!member) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Ban Failed", `${message.author}, you need to tell me who to ban!`));
				return;
			}			
			if (member.id === message.author.id) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Ban Failed", `${message.author}, why not just leave the server instead and never come back?`));
				return;
			}
			if (!member.bannable) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Ban Failed", `${message.author}, I am unable to ban ${member}!`));
				return;
			}
			let reason = args.slice(1).join(' ');
			if (!reason) {
				reason = "No reason provided";
			}

			if (message.author.id !== message.guild.ownerID && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Role Hierarchy Error", "The person you are attempting to ban has equal or higher role permissions than you."));
				return;
			}

			const d: MessageEmbed = new MessageEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
				.setTitle(`🔨 **Banned From: ${message.guild.name}**`)
				.addField("Moderator", `${message.author} (${message.author.id})`)
				.addField("Reason", reason)
				.addField("Server", message.guild.name)				
				.setTimestamp()
				.setColor(Colors.randomElement())
				.setFooter("Turkie");
			await member.send(d).catch(e => { });
			await message.guild.members.ban(member.id, {
				days: 7,
				reason: `[${message.author.tag}] ${reason}`
			});

			const embed: MessageEmbed = new MessageEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
				.setTitle("🔨 **Ban Successful!**")
				.setDescription("The user has been banned successfully.")
				.addField("Banned User", `${member} (${member.id})`)
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
		};
	}
}