import { Command } from "../../Models/Command";
import { Client, Message, Collection, GuildMember, Guild, MessageCollector, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class IssueStrikes extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "issuestrikes",
			aliases: ["strikes", "strike", "issuestrike"],
			description: "Issues a specific amount of strikes. In order for the `--ignoreKickPerm` or `--silent` flag to work properly, you must have permission to manage the server.",
			usage: ["issuestrikes <@Mentions> [@Mentions...] <Amount of Strikes: NUMBER> [--ignoreKickPerm] [--silent]"],
			example: ["issuestrikes @User#0001 1 --ignoreKickPerm --silent", "issuestrikes @User#0001 @User#0002 3", "issuestrikes @User#0001 @User#0002 @User#9999 -1"]
		}, {
			commandName: "Issue Strikes",
			botPermissions: [],
			userPermissions: ["KICK_MEMBERS"],
			argsLength: 2,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		const mentions: Collection<string, GuildMember> = message.mentions.members;
		if (mentions.size === 0) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_MENTIONS_FOUND"));
			return;
		}
		
		// check to see if we can strike ppl even though they have kick perms
		let ignoreKick: boolean = false;
		if (args.join(" ").includes("--ignoreKickPerm") && message.member.hasPermission("MANAGE_GUILD")) {
			ignoreKick = true;
		}
		// check to see if we can strike ppl without knowledge
		let notifyUser: boolean = true;
		if (args.join(" ").includes("--silent") && message.member.hasPermission("MANAGE_GUILD")) {
			notifyUser = false;
		}
		args = args.join(" ")
			.replace("--ignoreKickPerms", "")
			.replace("--silent", "")
			.split(" ");

		// strike amount
		let strikes: number = Number.isNaN(Number.parseInt(args[args.length - 1]))
			? 1
			: Number.parseInt(args[args.length - 1]);
		// make sure the number inputted !== 0
		if (strikes === 0) {
			strikes = 1;
		}

		const members: GuildMember[] = [];
		for (let [id, member] of message.mentions.members) {
			members.push(member);
		}

		const membersToPunish: GuildMember[] = [];
		const membersWithKickPermissions: GuildMember[] = [];
		const membersThatIsBot: GuildMember[] = [];
		const membersHigherRole: GuildMember[] = [];

		for (let member of members) {
			let isFound = false;
			for (let i = 0; i < guildInfo.moderation.moderationConfiguration.currentStrikes.length; i++) {
				// check to make sure the profile doesn't exist in the array
				//if (guildInfo.moderation.moderationConfiguration.currentStrikes[i].id === member.id
				//	&& guildInfo.moderation.moderationConfiguration.currentStrikes[i].strikes + strikes >= 0) {
				if (guildInfo.moderation.moderationConfiguration.currentStrikes[i].id === member.id) {
					membersToPunish.push(member);
					isFound = true;
					break;
				}
			}
			if (!isFound && strikes > 0) {
				// make sure the member isn't a bot
				if (member.user.bot) {
					membersThatIsBot.push(member);
					continue;
				}

				// make sure not equal/above in role hierachy
				if (message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(member.highestRole) <= 0) {
					membersHigherRole.push(member);
					continue;
				}

				// make sure no perms
				if (member.hasPermission("KICK_MEMBERS") && !ignoreKick) {
					membersWithKickPermissions.push(member);
					continue;
				}

				membersToPunish.push(member);
			}
		}

		if (membersToPunish.length === 0) {
			const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "No Members To Strike", "You cannot add or remove strikes from members for the following reasons.\n- The member is a bot.\n- The member has the `Kick Members` Permission.\n- The member is equal or above you based on role hierachy.\n\nAlso remember that you cannot remove strikes from a user if he or she has no strikes.");
			if (membersWithKickPermissions.length > 0) {
				embed.addField("User(s) With **Kick Members** Permissions", membersWithKickPermissions.join(" "));
			}

			if (membersThatIsBot.length > 0) {
				embed.addField("Bot Accounts", membersThatIsBot.join(" "));
			}

			if (membersHigherRole.length > 0) {
				embed.addField("User(s) With Higher/Equal Role Position", membersHigherRole.join(" "));
			}
			MessageFunctions.sendRichEmbed(message, embed, 12000);
			return;
		}

		const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Specify Reason For Strike(s)", `Please input a reason for the strikes. If you do not want to give a reason, please type \`none\`. To cancel this process, type \`cancel\`.\n\n${membersWithKickPermissions.length > 0 ? "⚠ You are unable to strike members with the `Kick Members` permission.\n" : ""}${membersThatIsBot.length > 0 ? "⚠ You are unable to strike a bot.\n" : ""}${membersHigherRole.length > 0 ? "⚠ You are unable to strike members with equal or higher role positions than your position (based on role hierachy)." : ""}`, [
			{
				name: "Users To Strike",
				value: membersToPunish.join(" ")
			},
			{
				name: "Issued Strikes",
				value: MessageFunctions.codeBlockIt(strikes.toString())
			}
		], notifyUser ? "Notifying User" : "Silent Strike");

		if (membersWithKickPermissions.length > 0
			|| membersThatIsBot.length > 0
			|| membersHigherRole.length > 0) {
			embed.addBlankField();

			if (membersWithKickPermissions.length > 0) {
				embed.addField("Has Kick Members Permission", membersWithKickPermissions.join(" "));
			}

			if (membersThatIsBot.length > 0) {
				embed.addField("Is Bot", membersThatIsBot.join(" "));
			}

			if (membersHigherRole.length > 0) {
				embed.addField("Higher Role Position", membersHigherRole.join(" "));
			}
		}

		// start collector
		const collector: MessageCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
			time: 300000
		});

		message.channel.send(embed).then(async msg => {
			collector.on("collect", (m) => {
				if (m.content === "cancel") {
					collector.stop();
					(msg as Message).delete().catch(e => { });
					m.delete().catch(e => { });
					return;
				}

				let reason: string;

				if (m.content === "none") {
					reason = "No reason provided";
				} else {
					reason = m.content;
				}

				collector.stop();
				(msg as Message).delete().catch(e => { });
				m.delete().catch(e => { });

				const punishmentManager = new ModerationEnforcement(message, guildInfo, members);
				punishmentManager.strikeManagement(false, reason, strikes, notifyUser);
			});
		});
	}
}
