import { Client, GuildMember, RichEmbed, TextChannel, Collection, Invite, Guild, Role } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { EnhancedDates } from "../Utility/EnhancedDates";
import { Colors } from "../Configuration/Configuration";
import MessageFunctions from "../Utility/MessageFunctions";

const antiRaid: {
	[name: string]: GuildMember[]
} = {};

module.exports.run = async (client: Client, member: GuildMember): Promise<void> => {
	TurkieBotGuild.findOne({ guildID: member.guild.id }, async (err: any, data: GuildInterface) => {
		if (err) {
			return;		
		}
		// check inv filter.
		let isKicked = false;
		if (data.moderation.serverLockdown.isEnabled) {
			if (data.moderation.serverLockdown.allInvites) {
				await member.kick("Server on lockdown.");
				isKicked = true;
			} else {
				const invites: Collection<string, Invite> = await member.guild.fetchInvites();
				for (let [code, invite] of invites) {
					for (let i = 0; i < data.moderation.serverLockdown.specificInvites.length; i++) {
						if (invite.code === data.moderation.serverLockdown.specificInvites[i].code
							&& data.moderation.serverLockdown.specificInvites[i].uses + 1 <= invite.uses) { 
							// we use <= in case the bot went offline and didn't register the invites being used
							isKicked = true;
							await member.kick("Server on lockdown.");
							await updateInviteUses(member.guild, code, invite.uses);
						}
					}
				}
			}
		}

		if (isKicked) {
			return;
		}

		// antiraid
		if (data.moderation.antiRaid.isEnabled) {
			const membersPermitted: number = data.moderation.antiRaid.amount;
			const time: number = data.moderation.antiRaid.timeAllowed;
			if (!antiRaid[member.guild.id]) {
				antiRaid[member.guild.id] = [];
			}
			antiRaid[member.guild.id].push(member);
			if (antiRaid[member.guild.id].length >= membersPermitted) {
				antiRaid[member.guild.id].forEach(async member => {
					await member.ban("Anti-raid is enabled and was triggered.");
				});
			}

			let timeOut: NodeJS.Timeout = setTimeout(async () => {
				antiRaid[member.guild.id].splice(antiRaid[member.guild.id].indexOf(member), 1);
				if (antiRaid[member.guild.id].length === 0) {
					clearTimeout(timeOut);
				}
			}, time);
		}

		// welcome msg
		if (data.serverConfiguration.welcomeMessage.isEnabled
			&& data.serverConfiguration.welcomeMessage.message.length !== 0) {
			let toSend: RichEmbed | string;
			let textToSend: string = data.serverConfiguration.welcomeMessage.message
				.replace(/{author}/g, member.user.toString())
				.replace(/{authorNickName}/g, member.displayName)
				.replace(/{authorDiscrim}/g, member.user.discriminator)
				.replace(/{serverName}/g, member.guild.name)
				.replace(/{authorID}/g, member.user.id)
				.replace(/{serverID}/g, member.guild.id);
			if (data.serverConfiguration.welcomeMessage.embed) {
				toSend = new RichEmbed()
					.setAuthor(member.guild.name, member.guild.iconURL)
					.setColor(Colors.randomElement())
					.setDescription(textToSend);
			} else {
				toSend = data.serverConfiguration.welcomeMessage.message;
			}
			member.send(toSend).catch(e => { });
		}

		// auto role
		if (data.serverConfiguration.autoRole.isEnabled
			&& data.serverConfiguration.autoRole.roles.length !== 0) {
			let roles: Role[] = [];
			for (let i = 0; i < data.serverConfiguration.autoRole.roles.length; i++) {
				if (member.guild.roles.has(data.serverConfiguration.autoRole.roles[i])) {
					roles.push(member.guild.roles.get(data.serverConfiguration.autoRole.roles[i]));
				}
			}
			// add bulk roles.
			member.addRoles(roles).catch(e => { });
		}

		// log
		const date: EnhancedDates = new EnhancedDates();
		if (data.serverConfiguration.serverLogs.joinLeaveLogs.isEnabled) {
			const joinEmbed = new RichEmbed()
				.setAuthor(member.user.tag, member.user.displayAvatarURL)
				.setTitle("📥 New Member Joined")
				.setDescription(`${member} has joined ${member.guild.name}`)
				.addField("Joined Server", MessageFunctions.codeBlockIt(EnhancedDates.formatUTCDate(member.joinedTimestamp)))
				.addField("Registered Account", MessageFunctions.codeBlockIt(EnhancedDates.formatUTCDate(member.user.createdTimestamp)))
				.addField("User ID", MessageFunctions.codeBlockIt(member.id))
				.setThumbnail(member.user.displayAvatarURL)
				.setTimestamp()
				.setColor(Colors.randomElement())
				.setFooter("Turkie");
			let chan: TextChannel = client.channels.get(data.serverConfiguration.serverLogs.joinLeaveLogs.channel) as TextChannel;

			if (chan) {
				chan.send(joinEmbed).catch(e => { });
			}
		}
	});
}

async function updateInviteUses(guild: Guild, code: string, uses: number): Promise<boolean> {
	return new Promise((resolve, reject) => {
		TurkieBotGuild.updateOne({ guildID: guild.id, "moderation.serverLockdown.specificInvites.code": code}, {
			"moderation.serverLockdown.specificInvites.$.uses": uses
		}, (err, d) => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}