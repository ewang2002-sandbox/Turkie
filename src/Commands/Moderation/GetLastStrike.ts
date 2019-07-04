import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, GuildMember } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import { Colors } from "../../Configuration/Configuration";
import { EnhancedDates } from "../../Utility/EnhancedDates";

export default class GetLastStrike extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "getlaststrike",
			aliases: ["strikehistory"],
			description: "Gets information on the last strike that was issued.",
			usage: ["getlaststrike <@Mention>"],
			example: ["getlaststrike @User#0001"]
		}, {
			commandName: "Get Strike Information",
			botPermissions: [],
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

		const resultEmbed: RichEmbed = new RichEmbed()
			.setAuthor(member.user.tag, member.user.displayAvatarURL)
			.setTitle(`🚩 **Strike History**: ${member.user.tag} (${member.user.id})`)
			.setColor(Colors.randomElement())

		let data;
		for (let i = 0; i < guildInfo.moderation.moderationConfiguration.currentStrikes.length; i++) {
			if (guildInfo.moderation.moderationConfiguration.currentStrikes[i].id === member.id) {
				data = guildInfo.moderation.moderationConfiguration.currentStrikes[i];
			}
		}

		if (data) {
			const mod: GuildMember = await ModerationEnforcement.fetchMember(message, data.moderator);
			const d: EnhancedDates = new EnhancedDates();
			resultEmbed.addField("Current Strikes", MessageFunctions.codeBlockIt(data.strikes.toString()));
			resultEmbed.addField("Date Issued", MessageFunctions.codeBlockIt(d.formatUTCDate(data.dateIssued)));
			resultEmbed.addField("Moderator", mod ? mod : MessageFunctions.codeBlockIt(data.moderator));
			resultEmbed.addField("Reason", MessageFunctions.codeBlockIt(data.reason));
		} else {
			resultEmbed.addField("Error", "No history was found for this user. Why don't you check your moderation logs?");
		}
		message.channel.send(resultEmbed).catch(e => { });
	}
}