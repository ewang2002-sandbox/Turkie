import { Message, GuildMember, Role, GuildChannel, PermissionObject, RichEmbed, TextChannel } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { Colors } from "../Configuration/Configuration";
import NumberFunctions from "../Utility/NumberFunctions";
import MessageFunctions from "../Utility/MessageFunctions";

/**
 * ModerationEnforcement is mainly designed with automoderation in mind. However, there are a few methods that can be utilized for public use.
 */
export class ModerationEnforcement {
	/**
	 * The message object.
	 */
	private msg: Message;
	/**
	 * The interface with respect to the schema for mongoDB
	 */
	private res: GuildInterface;
	/**
	 * The guild member(s) in question.
	 */
	private mem: GuildMember[];

	/**
	 * The moderation enforcement class.
	 * @param {Message} msg The message object. 
	 * @param {GuildInterface} res The guild data.
	 * @param {GuildMember[]} mem The guild member(s) to punish.
	 */
	public constructor(msg: Message, res: GuildInterface, mem: GuildMember[]) {
		this.msg = msg;
		this.res = res;
		this.mem = mem;
	}

	/**
	 * Word filter enforcement. 
	 * @returns {Promise<boolean>} Whether the operation was successful or not.
	 */
	public async wordFilter(): Promise<boolean> {
		if (this.msg.deletable) {
			this.msg.delete();
		}
		// lock channel down
		this.tempLockChannel(this.msg.channel as TextChannel);
		
		let resultant = await this.strikeManagement(true, "Sent bad words in a channel.");
		return resultant;
	}

	/**
	 * Invite link enforcement.
	 */
	public async inviteLinkFilter(): Promise<boolean> {
		if (this.msg.deletable) {
			this.msg.delete();
		}
		// lock channel down
		this.tempLockChannel(this.msg.channel as TextChannel);

		let resultant = await this.strikeManagement(true, "Sent an invite link to a channel.");
		return resultant;
	}

	/**
	 * Mention spam enforcement.
	 * @returns {Promise<boolean>} Whether the operation was successful or not.
	 */
	public async mentionSpam(): Promise<boolean> {
		if (this.msg.deletable) {
			this.msg.delete();
		}
		// lock channel down
		this.tempLockChannel(this.msg.channel as TextChannel);

		let resultant = await this.strikeManagement(true, "Spam mentioned.");
		return resultant;
	}

	/**
	 * Message spam enforcement.
	 * @returns {Promise<boolean>} Whether the operation was successful or not.
	 */
	public async messageSpam(): Promise<boolean> {
		if (this.msg.deletable) {
			this.msg.delete();
		}
		// lock channel down
		this.tempLockChannel(this.msg.channel as TextChannel);

		let resultant = await this.strikeManagement(true, "Spamming in chat.");
		return resultant;
	}

	/**
	 * Mutes the user, with an optional duration and reason. 
	 * @param {GuildMember} member The guild member.
	 * @param {number} [duration] The duration of the mute, in minutes. If indefinite, use `null`.
	 * @param {string} [reason] The reason. 
	 * @returns {Promise<void>}
	 */
	public async muteUser(member: GuildMember, duration?: number, reason: string = "No reason provided."): Promise<void> {
		// first, get the role.
		let mutedRole: Role = this.msg.guild.roles.get(this.res.moderation.moderationConfiguration.mutedRole);
		if (!mutedRole) {
			let muro = await this.msg.guild.createRole({
				name: 'Muted',
			});
			mutedRole = muro;
		}

		const permissionObject: PermissionObject = {
			SEND_MESSAGES: false, // can't send msgs, obviously.
			ADD_REACTIONS: false, // can't add reactions.
			CONNECT: false, // can't connect to vc.
			SPEAK: false, // can't speak in vc (if they can connect).
			MANAGE_CHANNELS: false // can't manage channel (so they can't just bypass).
		};

		// loop through each channel. Basically make sure every channel has the muted role.
		for (let channel of this.msg.guild.channels) {
			let gChan: GuildChannel = channel[1];
			if (!gChan.permissionOverwrites.get(mutedRole.id)) {
				await gChan.overwritePermissions(mutedRole, permissionObject, reason).catch(e => { });
			}
		}

		// apply a timeout to unmute the person if one is apparent.
		if (duration) {
			setTimeout(async () => {
				if (member.roles.has(mutedRole.id)) {
					this.unmuteUser(member, "Mute duration is over.");
				}
			}, duration * 60000);
		}

		// add the muted role.
		await member.addRole(mutedRole);

		// update the guild object if needed.
		if (this.res.moderation.moderationConfiguration.mutedRole !== mutedRole.id) {
			TurkieBotGuild.updateOne({ guildID: this.msg.guild.id }, {
				"moderation.moderationConfiguration.mutedRole": mutedRole.id
			}, (err: any, raw: any) => { });
		}
	}

	/**
	 * Unmutes a guild member.
	 * @param {GuildMember} member The guild member to unmute. 
	 * @param {string} [reason] The reason, if any. 
	 * @returns {boolean} Whether the member was unmuted successfully.
	 */
	public unmuteUser(member: GuildMember, reason: string = "No reason provided."): boolean {
		let mutedRole: Role = this.msg.guild.roles.get(this.res.moderation.moderationConfiguration.mutedRole);

		// check to see if role exists.
		if (!mutedRole) {
			return false;
		}

		// check to see if member is muted,
		if (!member.roles.has(mutedRole.id)) {
			return false;
		}

		// unmute.
		member.removeRole(mutedRole, reason);
		return true;
	}

	/**
	 * Kicks a user from the guild through automoderation.
	 * @param {GuildMember} member The member to kick.
	 * @param {string} [reason] The reason for the kick.
	 * @returns {Promise<boolean>} The result of the execution of the method.
	 */
	private async kickUser(member: GuildMember, reason: string = "No reason provided"): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			// get the user (in case they were invisible and discord didn't cache them)
			const gMember: GuildMember = await ModerationEnforcement.fetchMember(this.msg, member.id);

			if (!member.kickable) {
				return resolve(false);
			}

			await gMember.send(new RichEmbed()
				.setAuthor(this.msg.client.user, this.msg.client.user.displayAvatarURL)
				.setTitle("👢 **Kicked**")
				.setDescription(`You have been kicked from **${this.msg.guild.name}**.`)
				.addField("**Moderator**", `${this.msg.client.user} (${this.msg.client.user.id})`)
				.addField("**Reason**", reason)
				.setColor(Colors.randomElement())
				.setTimestamp());

			await gMember.kick(reason);
			// mod log it
			if (ModerationEnforcement.configuredModLogs(this.msg, this.res)) {
				const embed: RichEmbed = new RichEmbed()
					.setAuthor(this.msg.client.user, this.msg.client.user.displayAvatarURL)
					.setTitle("👢 **AutoMod Kick**")
					.setDescription("A member has been kicked from the server for activating automoderation.")
					.addField("Moderator", `${this.msg.client.user} (${this.msg.client.user.id})`)
					.addField("Reason", reason)
					.setColor(Colors.randomElement())
					.setTimestamp();

				(this.msg.guild.channels.get(this.res.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embed).catch(e => { });
			}
			return resolve(true);

		});
	}

	/**
	 * Bans a user from the guild through automoderation.
	 * @param {GuildMember} member The member to ban.
	 * @param {string} [reason] The reason for the ban.
	 * @returns {Promise<boolean>} The result of the execution of the method.
	 */
	private async banUser(member: GuildMember, reason: string = "No reason provided"): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			const gMember: GuildMember = await ModerationEnforcement.fetchMember(this.msg, member.id);

			if (!gMember.bannable) {
				return resolve(false);
			}

			await gMember.send(new RichEmbed()
				.setAuthor(this.msg.client.user, this.msg.client.user.displayAvatarURL)
				.setTitle("🔨 **Banned**")
				.setDescription(`You have been banned from **${this.msg.guild.name}**.`)
				.addField("**Moderator**", `${this.msg.client.user} (${this.msg.client.user.id})`)
				.addField("**Reason**", reason)
				.setColor(Colors.randomElement())
				.setTimestamp());

			await gMember.ban(reason);
			// mod log it
			if (ModerationEnforcement.configuredModLogs(this.msg, this.res)) {
				const embed: RichEmbed = new RichEmbed()
					.setAuthor(this.msg.client.user, this.msg.client.user.displayAvatarURL)
					.setTitle("🔨 **AutoMod Ban**")
					.setDescription("A member has been banned for from server for activating automoderation.")
					.addField("Moderator", `${this.msg.client.user} (${this.msg.client.user.id})`)
					.addField("Reason", reason)
					.setColor(Colors.randomElement())
					.setTimestamp();

				(this.msg.guild.channels.get(this.res.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embed).catch(e => { });
			}

			return resolve(true);
		});
	}

	/**
	 * Fetches a GuildMember from ID.
	 * @param {Message} message The message object.
	 * @param {string} id The member to fetch.
	 * @returns {Promise<GuildMember>}
	 * @static
	 */
	public static async fetchMember(message: Message, id: string): Promise<GuildMember> {
		return new Promise((resolve, reject) => {
			message.client.fetchUser(id).then(async user => {
				message.guild.fetchMember(user.id).then(async member => {
					return resolve(member);
				});
			});
		});
	}

	/**
	 * Strikes management.
	 * 
	 * @param {boolean} autoModeration Whether automoderation committed the task of adding strikes.
	 * @param {string} [reason] The reason for the strikes.
	 * @param {number} [strikeAmount = 1] The amount of strikes to assign. A negative value will remove the specified amount of strikes.
	 * @returns {Promise<boolean>} Whether the strikes were applied successfully. 
	 */
	public async strikeManagement(autoModeration: boolean, reason: string = "No reason specified", strikeAmount: number = 1): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let strikeHist = this.res.moderation.moderationConfiguration.currentStrikes;
			// if we have more than one member to punish
			// we're going to send a log of all the users affected.
			if (this.mem.length > 1) {
				this.issueStrikeAlertMultiple(this.mem, strikeAmount, reason);
			}
			for (let i = 0; i < this.mem.length; i++) {
				let resultantData: {
					id: string,
					strikes: number
				};

				// loop through the originating data.
				for (let j = 0; j < strikeHist.length; j++) {
					if (strikeHist[j].id === this.mem[i].id) {
						resultantData = strikeHist[j];
						break;
					}
				}

				// check to see if the data was found.
				if (resultantData) {
					if (resultantData.strikes + strikeAmount >= this.res.moderation.moderationConfiguration.maxStrikes
						|| resultantData.strikes + strikeAmount <= 0) {
						// reached strikes threshold.
						TurkieBotGuild.updateOne({ guildID: this.msg.guild.id }, {
							$pull: {
								"moderation.moderationConfiguration.currentStrikes": {
									id: this.mem[i].id
								}
							}
						}, (err, data) => {
							if (!err) {
								this.issueStrikeAlert(this.mem[i], strikeAmount, resultantData.strikes, autoModeration, this.mem.length > 1, true, reason);
								// because the person went down to 0
								// we want to remove their profile from array not punish them
								if (resultantData.strikes + strikeAmount <= 0) {
									return;
								}

								this.punishUser(this.mem[i]);
								resolve(true);
							} else {
								resolve(false);
							}
						});
					} else {
						// add one strike.
						TurkieBotGuild.updateOne({ guildID: this.msg.guild.id, "moderation.moderationConfiguration.currentStrikes.id": this.mem[i].id }, {
							$inc: {
								"moderation.moderationConfiguration.currentStrikes.$.strikes": strikeAmount
							}
						}, (err, raw) => {
							if (!err) {
								this.issueStrikeAlert(this.mem[i], strikeAmount, resultantData.strikes, autoModeration, this.mem.length > 1, false, reason);
								resolve(true);
							} else {
								resolve(false);
							}
						});
					}
				} else {
					// create new strike profile and add.
					// if more than one strike allowed
					if (this.res.moderation.moderationConfiguration.maxStrikes > 1
						&& strikeAmount < this.res.moderation.moderationConfiguration.maxStrikes) {
						TurkieBotGuild.updateOne({ guildID: this.msg.guild.id }, {
							$push: {
								"moderation.moderationConfiguration.currentStrikes": {
									id: this.mem[i].id,
									strikes: strikeAmount
								}
							}
						}, (err, raw) => {
							if (!err) {
								this.issueStrikeAlert(this.mem[i], strikeAmount, 0, autoModeration, this.mem.length > 1, false, reason);
								resolve(true);
							} else {
								resolve(false);
							}
						});
					} else {
						// go right to punishment.
						this.issueStrikeAlert(this.mem[i], strikeAmount, resultantData && resultantData.strikes ? resultantData.strikes : strikeAmount, autoModeration, this.mem.length > 1, true, reason);
						let punishmentSuccess: boolean = this.punishUser(this.mem[i]);
						resolve(punishmentSuccess);
					}
				}
			}
		});
	}

	/**
	 * Punishes the user using the strike system.
	 * @param {GuildMember} mem The guild member to punish.
	 * @returns {boolean} Whether the user was punished or not.
	 */
	private punishUser(mem: GuildMember): boolean {
		const punishment = this.res.moderation.moderationConfiguration.punishment;

		// decide what punishment will be.
		switch (punishment) {
			case ("nothing"): {
				return true;
			}
			case ("mute"): {
				this.muteUser(mem, null, "Strike limit reached.");
				return true;
			}
			case ("kick"): {
				this.kickUser(mem, "Strike limit reached.");
				return true;
			}
			case ("ban"): {
				this.banUser(mem, "Strike limit reached.");
				return true;
			}
			default: {
				return false;
			}
		}
	}

	/**
	 * Sends a message to the user, the channel (where the strike was issued), and the moderation logs regarding the strike.
	 * @param {GuildMember} mem The guild member to send the message to.
	 * @param {number} strikeAmount The amount of strikes the person was issued.
	 * @param {number} oldStr The old amount of strikes the person had.
	 * @param {boolean} autoMod Whether automoderation issued the strike. Automod will only ever target one user.
	 * @param {boolean} multiple Whether multiple people are involved.
	 * @param {boolean} last Whether this strike will result in a punishment or not.
	 * @param {string} reason The reason for the issuing of the strike.
	 */
	private issueStrikeAlert(mem: GuildMember, strikeAmount: number, oldStr: number, autoMod: boolean, multiple: boolean, last: boolean, reason: string): void {
		if (!last) {
			mem.send(new RichEmbed()
				.setAuthor(mem.user.tag, mem.user.displayAvatarURL)
				.setTitle(`🚩 **Strike(s) ${strikeAmount > 0 ? "Issued" : "Removed"}**`)
				.setColor(Colors.randomElement())
				.setDescription(`${strikeAmount > 0 ? `You have received \`${strikeAmount}\` strike(s) in \`${this.msg.guild.name}\`.` : `A moderator has removed \`${Math.abs(strikeAmount)}\` strike(s) from your profile in \`${this.msg.guild.name}\`.`}`)
				.addField("**Current Strikes**", `\`${oldStr}\` → \`${oldStr + strikeAmount}\``)
				.addField("**Moderator**", autoMod ? `${this.msg.client.user} (${this.msg.client.user.tag})` : `${this.msg.author} (${this.msg.author.tag})`)
				.addField("**Reason**", reason)
				.setFooter("Turkie Moderation"));
		}

		// make new embed for logging purposes
		const embedForSend = new RichEmbed()
			.setAuthor(this.msg.author.tag, this.msg.author.displayAvatarURL)
			.setTitle(`🚩 **${Math.abs(strikeAmount)} Strike(s) ${strikeAmount > 0 ? "Issued" : "Removed"}**`)
			.setColor(Colors.randomElement())
			.setDescription(`Reason: ${reason}`)
			.addField("User", `${mem} (${mem.id})`)
			.addField("Moderator", autoMod ? `${this.msg.client.user} (${this.msg.client.user.tag})` : `${this.msg.author} (${this.msg.author.tag})`)
			.addField("Current Strikes", `\`${oldStr}\` → \`${oldStr + strikeAmount}\``)
			.setFooter("Turkie Moderation");
		// we only want to send this msg if one user is affected.
		if (!multiple) {
			// automod will only ever target one user.
			if (!autoMod) {
				MessageFunctions.sendRichEmbed(this.msg, embedForSend);
			}

			if (ModerationEnforcement.configuredModLogs(this.msg, this.res)) {
				(this.msg.guild.channels.get(this.res.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embedForSend).catch(e => { });
			}
		}
	}

	/**
	 * Sends a message the channel (where the strike was issued) and the moderation logs regarding the strike.
	 * @param {GuildMember[]} mem The guild member that got the strike.
	 * @param {number} strikeAmount The amount of strikes the person was issued.
	 * @param {string} reason The reason for the issuing of the strike.
	 */
	private issueStrikeAlertMultiple(mem: GuildMember[], strikeAmount: number, reason: string): void {
		const embedForSend = new RichEmbed()
			.setAuthor(this.msg.author.tag, this.msg.author.displayAvatarURL)
			.setTitle(`🚩 **Strike(s) ${strikeAmount > 0 ? "Issued" : "Removed"}**`)
			.setColor(Colors.randomElement())
			.setDescription(`Reason: ${reason}`)
			.addField("Users", `${mem.join(" ")}`)
			.addField("Moderator", `${this.msg.author} (${this.msg.author.tag})`)
			.addField("Strikes", "```css\n" + strikeAmount + "```")
			.setFooter("Turkie Moderation");
		MessageFunctions.sendRichEmbed(this.msg, embedForSend);
		if (ModerationEnforcement.configuredModLogs(this.msg, this.res)) {
			(this.msg.guild.channels.get(this.res.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embedForSend).catch(e => { });
		}
	}

	/**
	 * Determines whether moderation logs were set up or not.
	 * @returns {boolean}
	 */
	public static configuredModLogs(msg: Message, res: GuildInterface): boolean {
		return res.serverConfiguration.serverLogs.modLogs.isEnabled && msg.guild.channels.has(res.serverConfiguration.serverLogs.modLogs.channel);
	}

	/**
	 * Locks the channel down for the 1 person, then reopens the channel.
	 * @param {TextChannel} chan The channel to lock down. 
	 */
	private tempLockChannel(chan: TextChannel): void {
		chan.overwritePermissions(this.mem[0], {
			SEND_MESSAGES: false
		}).then(async () => {
			setTimeout(() => {
				chan.overwritePermissions(this.mem[0], {
					SEND_MESSAGES: true
				})
			}, 5000);
		});
	}
}