import { Command } from "../../Models/Command";
import { Client, Message, Collection, GuildMember, Guild, MessageCollector, RichEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class IssueStrikes extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "issuestrikes",
			aliases: ["strikes", "strike"],
			description: "Issues a specific amount of strikes.",
			usage: ["issuestrikes <@Mentions> [@Mentions...] <Amount of Strikes: NUMBER>"],
			example: ["issuestrikes @User#0001 1", "issuestrikes @User#0001 @User#0002 3", "issuestrikes @User#0001 @User#0002 @User#9999 -1"]
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
		// start collector
		const collector: MessageCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
			time: 300000
		});

		const membersToPunish: GuildMember[] = [];
		for (let member of members) {
			let isFound = false;
			for (let i = 0; i < guildInfo.moderation.moderationConfiguration.currentStrikes.length; i++) {
				if (guildInfo.moderation.moderationConfiguration.currentStrikes[i].id === member.id
					&& guildInfo.moderation.moderationConfiguration.currentStrikes[i].strikes + strikes >= 0) {
					membersToPunish.push(member);
					isFound = true;
					break;
				} 
			}
			if (!isFound) {
				membersToPunish.push(member);
			}
		}

		if (membersToPunish.length === 0) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "No Members To Strike", "The bot will only remove strikes if the final strike value is not less than zero."));
			return;
		}

		const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Specify Reason For Strike(s)", "Please input a reason for the strikes. If you do not want to give a reason, please type `none`. To cancel this process, type `cancel`.", [
			{
				name: "Users To Strike",
				value: membersToPunish.join(" ")
			},
			{
				name: "Issued Strikes",
				value: "```css\n" + strikes + "```"
			}
		]);
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
				punishmentManager.strikeManagement(false, reason, strikes);
			});
		});
	}
}