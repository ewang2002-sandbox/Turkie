import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, Guild, Invite, Collection } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class ConfigServerLockdown extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configserverlockdown",
			aliases: ["serverlockdown"],
			description: "Configures server lockdown. You can choose to enable the system so some invite links will result in an automatic kick (partial lockdown), or the entire server (lockdown).",
			usage: ["configserverlockdown", "configserverlockdown status", "configserverlockdown enableall", "configserverlockdown <Invite Code: STRING>"],
			example: []
		}, {
			commandName: "Configure Server Lockdown",
			botPermissions: ["KICK_MEMBERS"],
			userPermissions: ["MANAGE_CHANNELS", "KICK_MEMBERS"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		// no arguments, basically just on or off.
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"moderation.serverLockdown.isEnabled": !guildInfo.moderation.serverLockdown.isEnabled
			}, (err, data) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, `Server Lockdown ${!guildInfo.moderation.serverLockdown.isEnabled ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.serverLockdown.isEnabled ? `The server lockdown has been enabled successfully. Be sure to enable execute either \`${guildInfo.serverConfiguration.prefix}configserverlockdown enableall\` or add specific invite links.` : "The server lockdown has been disabled successfully."}`);
					message.channel.send(embed)
						.then(msg => {
							msg = msg as Message;
							msg.delete(5000);
						})
						.catch(e => { });
					return;
				}
			});
			return;
		} else {
			// load invites
			const invites: Collection<string, Invite> = await message.guild.fetchInvites();

			if (["status", "info"].includes(args.join(" "))) {
				let str = "";
				for (let i = 0; i < guildInfo.moderation.serverLockdown.specificInvites.length; i++) {
					const invCode: string = guildInfo.moderation.serverLockdown.specificInvites[i].code;
					const invUses: number = guildInfo.moderation.serverLockdown.specificInvites[i].uses;
					const inv: Invite = invites.get(invCode);
					if (!inv) {
						await this.removeInvFromDB(message, invCode);
					} else {
						str += `\`[${invCode}] - ${invUses} Uses\`\n`;
					}
				}

				// current status
				let status: string = "";
				if (guildInfo.moderation.serverLockdown.isEnabled) {
					status += "Enabled For Specific Invites";
					if (guildInfo.moderation.serverLockdown.allInvites) {
						status = "Enabled for All Invites";
					}
				}
				const embed: RichEmbed = new RichEmbed()
					.setAuthor(message.author.tag, message.author.avatarURL)
					.setTitle("**Server Lockdown Status**")
					.setDescription(str)
					.setColor(Colors.randomElement())
					.setFooter(`Lockdown Status: ${status}`)
				message.channel.send(embed).catch(e => { });
				return;
			} else if (["enableall"].includes(args.join(" "))) {
				TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
					"moderation.serverLockdown.allInvites": !guildInfo.moderation.serverLockdown.allInvites
				}, (err, data) => {
					if (err) {
						MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
						return;
					} else {
						const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, `Server Lockdown For All Invites ${!guildInfo.moderation.serverLockdown.allInvites ? "Enabled" : "Disabled"}`, `${!guildInfo.moderation.serverLockdown.allInvites ? "The server lockdown for all invites has been enabled successfully." : "The server lockdown for all invites has been disabled successfully."}`);
						MessageFunctions.sendRichEmbed(message, embed);
						return;
					}
				});
			} else {
				// get inv info
				let inviteCode: string = args.join(" ");
				if (inviteCode.includes("/")) {
					inviteCode = inviteCode.split("/")[inviteCode.split("/").length - 1];
				}
				const inviteClass: Invite = invites.get(inviteCode);
				if (!inviteClass) {
					const embed = MessageFunctions.msgConditions(message, "INVALID_INVITE_INPUT");
					MessageFunctions.sendRichEmbed(message, embed);
				}
				// just to make sure we get the code.
				inviteCode = inviteClass.code;

				// check to see if found
				let isFound: boolean = false;
				for (let i = 0; i < guildInfo.moderation.serverLockdown.specificInvites.length; i++) {
					if (inviteCode === guildInfo.moderation.serverLockdown.specificInvites[i].code) {
						isFound = true;
						break;
					}
				}

				if (isFound) {
					this.removeInvFromDB(message, inviteCode).then(result => {
						if (result) {
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Invite Code Removed", `The invite code, \`${inviteCode}\`, was removed.`);
							MessageFunctions.sendRichEmbed(message, embed);
							return;
						}
					})
				} else {
					TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
						$push: {
							"moderation.serverLockdown.specificInvites": {
								code: inviteCode,
								uses: inviteClass.uses
							}
						}
					}, (err, raw) => {
						if (err) {
							MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
							return;
						} else {
							const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Inivte Link Added", `The invite code, \`${inviteCode}\`, was added.`);
							MessageFunctions.sendRichEmbed(message, embed);
							return;
						}
					});
				}
			}
		}
	}

	private async removeInvFromDB(msg: Message, code: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			TurkieBotGuild.updateOne({ guildID: msg.guild.id }, {
				$pull: {
					"moderation.serverLockdown.specificInvites": {
						code: code
					}
				}
			}, async (err, result) => {
				if (!err) {
					resolve(true)
				} else {
					resolve(false);
				}
			});
		});
	}
}

