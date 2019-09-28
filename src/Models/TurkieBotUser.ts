import { Document, Schema, model } from "mongoose";

export interface UserInterface extends Document {
	userID: string;
	punishmentLogs: Array<{
		date: number; // use <Date>.getTime()
		modUserID: string; // moderator
		reason: string; // the reason (duh)
		actionTaken: string; // action (ex. STRIKE - 3, BAN - PERMANENT, MUTE - 24h)
		guildID: string; // where this occurred
	}>;
}

export const UserSchema = new Schema({
	_id: Schema.Types.ObjectId,
	userID: String,
	punishmentLogs: []
});

const TurkieBotUser = model<UserInterface>("TurkieBotUser", UserSchema);
export default TurkieBotUser;