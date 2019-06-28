import { Command } from "../../Models/Command";
import { Client, Message, GuildMember, RichEmbed, TextChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";

export default class ExampleCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "kick",
			aliases: [],
			description: "Kicks a user from the server, with an optional reason.",
			usage: ["kick <@Mention> [Reason]"],
			example: ["kick @User#0001", "kick @User#0001 Spamming channels"]
		}, {
			commandName: "Kick",
			botPermissions: ["KICK_MEMBERS"],
			userPermissions: ["KICK_MEMBERS"],
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
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Kick Failed", `${message.author}, you need to tell me who to kick!`));
			return;
		}
		if (member.id === message.author.id) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Kick Failed", `${message.author}, why not just leave the server instead and come back later?`));
			return;
		}
		if (!member.kickable) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Kick Failed", `${message.author}, I am unable to kick ${member}!`));
			return;
		}
		let reason = args.slice(1).join(' ');
		if (!reason) {
			reason = "No reason provided";
		}

		if (message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(member.highestRole) <= 0) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Role Hierarchy Error", "The person you are attempting to kick has equal or higher role permissions than you."));
			return;
		}


		const d: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle(`**Kicked From: ${message.guild.name}**`)
			.addField("Moderator", `${message.author} (${message.author.id})`)
			.addField("Reason", reason)
			.addField("Server", message.guild.name)
			.setTimestamp()
			.setColor(Colors.randomElement())
			.setFooter("Turkie");
		await member.send(d).catch(e => { });
		await member.kick(`[${message.author.tag}] ${reason}`);

		const embed: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle("**Kick Successful!**")
			.setDescription("The user has been kicked successfully.")
			.addField("Kicked User", `${member} (${member.id})`)
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