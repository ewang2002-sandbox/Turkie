import mongoose from "mongoose";
import { DefaultPrefix } from "../Configuration/Configuration";
import { MongoError } from "mongodb";
import TurkieBotGuild, { GuildInterface } from "../Models/TurkieBotGuild";
import { MessageEmbed, Message } from "discord.js";
import MessageFunctions from "../Utility/MessageFunctions";
import TurkieBotUser, { UserInterface } from "../Models/TurkieBotUser";

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

	abstract class MongoDBBase {
		/**
		 * Checks to see if the data exists; if not, 
		 * creates a new data object.
		 * @returns {Promise<boolean>} If the data was found or was created.
		 */
		public abstract async createData(): Promise<boolean>;

		/**
		 * Deletes the data if it exists.
		 * @returns {Promise<boolean>} If the data was deleted.
		 */
		public abstract async deleteData(): Promise<boolean>;

		/**
		 * Sends the error message stating that the bot could not save the data.
		 * @param {Message} message The message. 
		 * @returns {void}
		 */
		public static sendErrorEmbed(message: Message): void {
			const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Database Error", "The bot was unable to save your data. Please try again later.");
			message.channel.send(embed)
				.then(msg => {
					msg = msg as Message;
					msg.delete({ timeout: 5000 });
				})
				.catch(e => { });
			return;
		}
	}

	/**
	 * The MongoDB guild handler.
	 */
	export class MongoDBGuildHandler extends MongoDBBase {
		/**
		 * The guild ID.
		 */
		private guildID: string;

		/**
		 * The constructor.
		 * @param {string} guildID The guild ID. 
		 */
		public constructor(guildID: string) {
			super();
			this.guildID = guildID;
		}

		public async createData(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				TurkieBotGuild.findOne({ guildID: this.guildID }, (err: any, data: GuildInterface) => {
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
								},
								modMail: {
									isEnabled: false,
									category: "",
									activeSessions: []
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

		public async deleteData(): Promise<boolean> {
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
	}

	export class MongoDBUserHandler extends MongoDBBase {
		/**
		 * The user ID.
		 */
		private userID: string;

		/**
		 * Constructor.
		 * @param {string} userID The user ID.
		 */
		public constructor(userID: string) {
			super();
			this.userID = userID;
		}

		public async createData(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				TurkieBotUser.findOne({ userID: this.userID }, (err: any, data: UserInterface) => {
					if (err) {
						return resolve(false);
					} 
					if (!data) {
						const newData = new TurkieBotUser({
							_id: mongoose.Types.ObjectId(),
							userID: this.userID,
							punishmentLogs: []
						});
						newData.save().catch(e => {
							return resolve(false);
						});
					}
					resolve(true);
				});
			});
		}

		public async deleteData(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				TurkieBotUser.deleteOne({ userID: this.userID }, (err) => {
					if (err) {
						resolve(false);
					} else {
						resolve(true);
					}
				});
			});
		}
	}
}