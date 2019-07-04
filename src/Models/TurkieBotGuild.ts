import { Document, Schema, model } from "mongoose";

export type PunishmentTypes = "nothing" | "mute" | "kick" | "ban";

export interface GuildInterface extends Document {
	guildID: string;
	// Moderation
	moderation: {
		moderationConfiguration: {
			// roles
			mutedRole: string;
			exemptRole: Array<string>;
			// disabled commands
			disabledCommands: Array<string>;
			// exempt channel
			exemptChannel: Array<string>;
			// strikes
			maxStrikes: number;
			currentStrikes: Array<{
				id: string;
				strikes: number;
				reason: string;
				moderator: string;
				dateIssued: number;
			}>;
			punishment: PunishmentTypes;
		};
		inviteFilter: {
			isEnabled: boolean;
		};
		wordFilter: {
			isEnabled: boolean
			words: Array<string>
		};
		antiMention: {
			isEnabled: boolean;
			theshold: number;
		};
		antiSpam: {
			isEnabled: boolean;
			amount: number;
			time: number;
		};
		antiRaid: {
			isEnabled: boolean;
			amount: number;
			timeAllowed: number;
			sysEnabled: boolean;
		};
		serverLockdown: {
			isEnabled: boolean;
			allInvites: boolean;
			specificInvites: Array<{
				code: string;
				uses: number
			}>;
		}
	};
	// Custom Commands
	customCommands: {
		isEnabled: boolean;
		customCommands: Array<{
			name: string;
			creator: string;
			commandanswer: string;
			embed: boolean;
			commandCreatedAt: number;
			dm: boolean;
		}>;
	}
	// Configuration
	serverConfiguration: {
		deletePinNotifications: boolean;
		prefix: string;
		commands: {
			mustHaveOneRole: boolean;
			commandAdminOnly: boolean;
			deleteCommandTrigger: boolean;
		}
		welcomeMessage: {
			isEnabled: boolean;
			message: string;
			embed: boolean;
		};
		autoRole: {
			isEnabled: boolean;
			roles: Array<string>;
		};
		serverLogs: {
			modLogs: {
				isEnabled: boolean;
				channel: string;
			};
			joinLeaveLogs: {
				isEnabled: boolean;
				channel: string;
			};
		}
	}
}

export const GuildSchema = new Schema({
	_id: Schema.Types.ObjectId,
	guildID: String,
	moderation: {
		moderationConfiguration: {
			mutedRole: String,
			exemptRole: [],
			disabledCommands: [],
			exemptChannel: [],
			maxStrikes: Number,
			currentStrikes: [],
			punishment: String,
		},
		inviteFilter: {
			isEnabled: Boolean,
		},
		wordFilter: {
			isEnabled: Boolean,
			words: []
		},
		antiMention: {
			isEnabled: Boolean,
			theshold: Number,
		},
		antiSpam: {
			isEnabled: Boolean,
			amount: Number,
			time: Number,
		},
		antiRaid: {
			isEnabled: Boolean,
			amount: Number,
			timeAllowed: Number,
			sysEnabled: Boolean
		},
		serverLockdown: {
			isEnabled: Boolean,
			allInvites: Boolean,
			specificInvites: []
		}
	},
	// Custom Commands
	customCommands: {
		isEnabled: Boolean,
		customCommands: [],
	},
	// Configuration
	serverConfiguration: {
		deletePinNotifications: Boolean,
		prefix: String,
		commands: {
			mustHaveOneRole: Boolean,
			commandAdminOnly: Boolean,
			deleteCommandTrigger: Boolean
		},
		welcomeMessage: {
			isEnabled: Boolean,
			message: String,
			embed: Boolean,
		},
		autoRole: {
			isEnabled: Boolean,
			roles: [],
		},
		serverLogs: {
			modLogs: {
				isEnabled: Boolean,
				channel: String,
			},
			joinLeaveLogs: {
				isEnabled: Boolean,
				channel: String,
			}
		}
	}
});

const TurkieBotGuild = model<GuildInterface>("TurkieBotGuild", GuildSchema);
export default TurkieBotGuild;