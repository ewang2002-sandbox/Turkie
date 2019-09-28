import { Client, Message, GuildMember, User } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { MongoDB } from "../Handlers/MongoDBHandler";
import { ModerationEnforcement } from "../Handlers/ModerationEnforcement";
import { AutoModHandler } from "../Handlers/AutoModHandler";
import { CommandHandler } from "../Handlers/CommandHandler";

module.exports.run = async (client: Client, message: Message): Promise<void> => {
	// no bot
	if (message.author.bot) {
		return;
	}

	// no webhooks allowed.
	if (message.webhookID || message.type === "GUILD_MEMBER_JOIN") {
		return;
	}

	const person = await getMember(client, message);

	if (message.guild) {
		// we know this is a guild member.
		const member: GuildMember = person as GuildMember;
		TurkieBotGuild.findOne({ guildID: message.guild.id }, async (err: any, res: GuildInterface) => {
			if (!res) {
				const newInformation: MongoDB.MongoDBGuildHandler = new MongoDB.MongoDBGuildHandler(message.guild.id);
				await newInformation.createData();
			}

			if (res.serverConfiguration.deletePinNotifications && message.type === "PINS_ADD") {
				await message.delete().catch(e => { });
				return;
			}

			// get the exempt roles
			let exemptRole: boolean = member.roles.some(x => res.moderation.moderationConfiguration.exemptRole.includes(x.id));

			let isOwner: boolean = member.id === message.guild.owner.user.id;
			let isAdmin: boolean = member.hasPermission("ADMINISTRATOR");
			let exemptFromFilter: boolean = (exemptRole || isOwner || isAdmin);

			// if not exempt
			if (!exemptFromFilter && !res.moderation.moderationConfiguration.exemptChannel.includes(message.channel.id)) {
				const modEnf: ModerationEnforcement = new ModerationEnforcement(message, res, [message.member]);

				// word filter
				if (res.moderation.wordFilter.isEnabled && res.moderation.wordFilter.words.length !== 0) {
					const wFilter: string[] = AutoModHandler.wordFilter(message, res);
					if (wFilter.length !== 0) {
						modEnf.wordFilter();
						return;
					}
				}

				// invite filter
				if (res.moderation.inviteFilter.isEnabled) {
					const iFilter: string[] = await AutoModHandler.checkInviteLink(message, res);
					if (iFilter && iFilter.length !== 0) {
						modEnf.inviteLinkFilter();
						return;
					}
				}

				// antimention
				if (res.moderation.antiMention.isEnabled) {
					const mFilter: boolean = AutoModHandler.checkMentionSpam(message, res);
					if (mFilter) {
						modEnf.mentionSpam();
						return;
					}
				}

				// antispam
				if (res.moderation.antiSpam.isEnabled) {
					const sFilter: boolean = await AutoModHandler.checkMessageSpam(message, res);
					if (sFilter) {
						modEnf.messageSpam();
						return;
					}
				}
			}

			const cmdHandler = new CommandHandler(message, res);
			cmdHandler.executeCommand();
		});
	} else {
		const cmdHandler = new CommandHandler(message, null);
		cmdHandler.executeCommand();
	}
}

/**Gets the member and stores it in cache. */
async function getMember(client: Client, message: Message): Promise<GuildMember | User> {
	return new Promise((resolve, reject) => {
		if (message.guild) {
			client.fetchUser(message.author.id).then(async user => {
				message.guild.fetchMember(user.id).then(async author => {
					return resolve(author);
				});
			});
		} else {
			client.fetchUser(message.author.id).then(async user => {
				return resolve(user);
			});
		}
	});
}