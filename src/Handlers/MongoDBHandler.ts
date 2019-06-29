import mongoose from "mongoose";
import { DefaultPrefix } from "../Configuration/Configuration";
import { MongoError } from "mongodb";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { RichEmbed, Message } from "discord.js";
import MessageFunctions from "../Utility/MessageFunctions";

/**
 * MongoDB Handler
 */
export namespace MongoDB {
	export class MongoDBHandler {
		private dbPath: string;
	
		public constructor(dbPath: string) {
			this.dbPath = dbPath;
		}
	
		/**
		 * Connects to the database.
		 */
		public connect() {
			mongoose.connect(`${this.dbPath}/turkie`, {
				useNewUrlParser: true
			}).catch(e => {
				throw new Error(e);
			});
		}
	}
	
	/**
	 * The MongoDB guild handler.
	 */
	export class MongoDBGuildHandler {
		private guildID: string;
	
		/**
		 * The constructor.
		 * @param {string} guildID The guild ID. 
		 */
		public constructor(guildID: string) {
			this.guildID = guildID;
		}
	
		/**
		 * Checks to see if the data exists; if not, 
		 * creates a new guild data object.
		 * @returns {Promise<boolean>} If the data was found or was created.
		 */
		public async createGuildData(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				TurkieBotGuild.findOne({
					guildID: this.guildID
				}, (err: MongoError, data: GuildInterface) => {
					if (err) {
						return resolve(false);
					}
					if (!data) {
						const newData = new TurkieBotGuild({
							_id: mongoose.Types.ObjectId(),
							guildID: this.guildID,
							moderation: {
								moderationConfiguration: {
									mutedRole: "",
									exemptRole: [],
									disabledCommands: [],
									exemptChannel: [],
									maxStrikes: 5,
									currentStrikes: [],
									punishment: "kick",
								},
								inviteFilter: {
									isEnabled: false,
								},
								wordFilter: {
									isEnabled: false,
									words: []
								},
								antiMention: {
									isEnabled: false,
									theshold: 5,
								},
								antiSpam: {
									isEnabled: false,
									amount: 12,
									time: 4000,
								},
								antiRaid: {
									isEnabled: false,
									amount: 8,
									timeAllowed: 5000,
									sysEnabled: false
								},
								serverLockdown: {
									isEnabled: false,
									allInvites: false,
									specificInvites: []
								}
							},
							// Custom Commands
							customCommands: {
								isEnabled: false,
								customCommands: [],
							},
							// Configuration
							serverConfiguration: {
								deletePinNotifications: false,
								prefix: DefaultPrefix,
								commands: {
									mustHaveOneRole: false,
									deleteCommandTrigger: false,
									commandAdminOnly: false
								},
								welcomeMessage: {
									isEnabled: false,
									message: "",
									embed: false,
								},
								autoRole: {
									isEnabled: false,
									roles: [],
								},
								serverLogs: {
									modLogs: {
										isEnabled: false,
										channel: "",
									},
									joinLeaveLogs: {
										isEnabled: false,
										channel: "",
									}
								}
							}
						});
						newData.save().catch(e => {
							return resolve(false);
						});
					}
					resolve(true);
				});
			});
		}
	
		/**
		 * Deletes the guild data if it exists.
		 * @returns {Promise<boolean>} If the data was deleted.
		 */
		public async deleteGuildData(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				TurkieBotGuild.deleteOne({
					guildID: this.guildID
				}, (err) => {
					if (err) {
						resolve(false);
					} else {
						resolve(true);
					}
				});
			});
		}

		/**
		 * Sends the error message stating that the bot could not save the data.
		 * @param {Message} message The message. 
		 * @returns {void}
		 */
		public static sendErrorEmbed(message: Message): void {
			const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "Database Error", "The bot was unable to save your data. Please try again later.");
			message.channel.send(embed)
				.then(msg => {
					msg = msg as Message;
					msg.delete(5000);
				})
				.catch(e => { });
			return;
		}
	}
}