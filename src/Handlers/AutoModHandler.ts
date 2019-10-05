import { Message, Invite } from "discord.js";
import { GuildInterface } from "../Models/TurkieBotGuild";
import request from "request";
const spamMap: any = {};

export namespace AutoModHandler {

	/**
	 * Word filter checker.
	 * @param {Message} message The message.
	 * @param {GuildInterface} data The guild data.
	 * @returns {string[]} Any words that were caught. 
	 */
	export function wordFilter(message: Message, data: GuildInterface): string[] {
		let caughtWord = [];
		for (let i = 0; i < data.moderation.wordFilter.words.length; i++) {
			if (message.content.toLowerCase().includes(data.moderation.wordFilter.words[i].toLowerCase())) {
				caughtWord.push(data.moderation.wordFilter.words[i]);
				break;
			}
		}

		// combine the sentence together if needed and check.
		if (caughtWord.length === 0) {
			let messageContent: string = message.content.toLowerCase();
			for (let i = 0; i < data.moderation.wordFilter.words.length; i++) {
				if (messageContent.includes(data.moderation.wordFilter.words[i].toLowerCase())) {
					caughtWord.push(data.moderation.wordFilter.words[i]);
					break;
				}
			}
		}
		return caughtWord;
	}

	/**
	 * Checks to see if any invite links are sent.
	 * @param {Message} message The message.
	 * @param {GuildInterface} data The guild data.
	 * @returns {Promise<string[]>} Whether any invite links were sent.
	 */
	export async function checkInviteLink(message: Message, data: GuildInterface): Promise<string[]> {
		return new Promise(async (resolve, reject) => {
			let linksToCheck: RegExpMatchArray = message.content.match(/\bhttps?:\/\/\S+/gi) || [];
			if (linksToCheck.length === 0) {
				return resolve([]);
			}

			let links = await getPossInvLinks(linksToCheck, message);
			return resolve(links);
		});
	}

	/**
	 * Checks the amount of mentions and determines if a message has too many mentions.
	 * @param {Message} message The message.
	 * @param {GuildInterface} data The guild data.
	 * @returns {boolean} Whether the message has lots of mentions or not, enough to be considered "spam."
	 */
	export function checkMentionSpam(message: Message, data: GuildInterface): boolean {
		if (message.mentions.users.size >= data.moderation.antiMention.theshold ||
			message.mentions.roles.size >= data.moderation.antiMention.theshold ||
			message.mentions.roles.size + message.mentions.users.size >= data.moderation.antiMention.theshold) {
			return true;
		}

		return false;
	}

	/**
	 * Checks to see if spamming occurs.
	 * @param {Message} message The message.
	 * @param {GuildInterface} data The guild data.
	 * @returns {boolean} Whether there is spam going on.
	 */
	export function checkMessageSpam(message: Message, data: GuildInterface): boolean {
		const msgAMT: number = data.moderation.antiSpam.amount || 5;

		if (!spamMap[message.guild.id]) {
			spamMap[message.guild.id] = {};
		}

		if (!spamMap[message.guild.id][message.author.id]) {
			spamMap[message.guild.id][message.author.id] = {
				ID: message.author.id,
				Count: 0
			};
		}

		spamMap[message.guild.id][message.author.id]["Count"]++;

		if (spamMap[message.guild.id][message.author.id]["Count"] >= msgAMT) {
			if (!message.guild.roles.get(data.moderation.moderationConfiguration.mutedRole) || !message.member.roles.has(data.moderation.moderationConfiguration.mutedRole)) { // The mute role doesn't exist. Make one and mute the person.
				return true;
			}
		}

		let timeout = setTimeout(() => {
			spamMap[message.guild.id][message.author.id]["Count"]--;
			if (spamMap[message.guild.id][message.author.id]["Count"] <= 0) {
				delete spamMap[message.guild.id][message.author.id];
				clearTimeout(timeout);
			}
		}, data.moderation.antiSpam.time);

		return false;
	}
}

function getPossInvLinks(linksToCheck: RegExpMatchArray, message: Message): Promise<string[]> {
	return new Promise(async (resolve, reject) => {
		for (let link of linksToCheck) {
			let discordInvite: RegExp = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
			request.get({
				url: link,
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
				},
				followAllRedirects: true
			}, async function (err: Error, response: request.Response, data: string) {
				// stackoverflow: https://stackoverflow.com/questions/16687618/how-do-i-get-the-redirected-url-from-the-nodejs-request-module
				const resultUrl = response.request.uri.href;
				if (discordInvite.test(resultUrl)) {
					const invite: Invite | void = await message.client.fetchInvite(resultUrl).catch(e => { });
					if (invite && invite.guild.id !== message.guild.id) {
						return resolve([link, resultUrl]);
					}
				}
			});
		}
	});
}
