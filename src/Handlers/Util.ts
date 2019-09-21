import { Client, User } from "discord.js";

/**
 * Uses RegExp to get the first expected mention (usually args[0]). 
 * @param {Client} client The client.
 * @param {string} mention The mention (usually an argument).
 * @returns {User} The user object or null (depending on what is found). 
 */
export function getUserFromMention(client: Client, mention: string): User {
	// The id is the first and only match found by the RegEx.
	const matches: RegExpMatchArray = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) {
		return null;
	}

	// However the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id: string = matches[1];

	return client.users.get(id);
}