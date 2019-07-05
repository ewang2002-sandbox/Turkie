import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, MessageReaction, User, ReactionCollector, MessageCollector, Channel, TextChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";

export default class SendEmbed extends Command {
	private readonly maximumFields = 25;
	private readonly maximumCharacters = 6000;
	private readonly introEmbed = new RichEmbed()
		.setTitle("🛠 **Creating Your Embed**")
		.setDescription("Your embed preview is above.\n\nReact With ✏ to customize the title.\nReact With 📝 to customize the description\nReact With 🙍 to customize the author.\nReact With 📎 to add or remove embed fields.\nReact With 📕 to customize the footer.\nReact With 🖌 to customize the thumbnail.\nReact With 📷 to customize the image.\nReact with 🌈 to edit the embed color.\nReact With 💾 to send this embed.\nReact With ❌ to cancel the embed-making process.")
		.setFooter("Turkie: Creating Embed Message")
		.setColor(Colors.randomElement())
		.setTimestamp();

	public constructor(client: Client) {
		super(client, {
			name: "sendembed",
			aliases: [],
			description: "Uses a wizard to customize the looks of your embed. Then, allows you to send the embed to a channel of your choice.",
			usage: ["sendembed"],
			example: []
		}, {
				commandName: "Send Embed Message",
				botPermissions: ["EMBED_LINKS"],
				userPermissions: [],
				argsLength: 0,
				guildOnly: true,
				botOwnerOnly: false
			});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let isChanging = false;
		const embed: RichEmbed = new RichEmbed();

		let fields: number = 0;

		let embedMessage: Message = await message.channel.send(embed) as Message;

		message.channel.send(this.editEmbedWithLimit(this.introEmbed, embed)).then(async msg => {
			msg = msg as Message;
			await msg.react("✏").catch(e => { });
			await msg.react("📝").catch(e => { });
			await msg.react("🙍").catch(e => { });
			await msg.react("📎").catch(e => { });
			await msg.react("📕").catch(e => { });
			await msg.react("🖌").catch(e => { });
			await msg.react("📷").catch(e => { });
			await msg.react("🌈").catch(e => { });
			await msg.react("💾").catch(e => { });
			await msg.react("❌").catch(e => { });

			// filters
			const interactFilters = (reaction: MessageReaction, user: User) => (
				reaction.emoji.name === '✏'
				|| reaction.emoji.name === '📝'
				|| reaction.emoji.name === '🙍'
				|| reaction.emoji.name === '📎'
				|| reaction.emoji.name === '📕'
				|| reaction.emoji.name === '🖌'
				|| reaction.emoji.name === '📷'
				|| reaction.emoji.name === '🌈'
				|| reaction.emoji.name === '💾'
				|| reaction.emoji.name === '❌'
			) && user.id === message.author.id;

			const interact: ReactionCollector = msg.createReactionCollector(interactFilters, {
				time: 1800000
			});

			interact.on("collect", async r => {
				r.remove(message.author.id).catch(e => { });
				if (isChanging) {
					return;
				}
				// for some reason i have to do this twice
				msg = msg as Message;
				isChanging = true;

				if (r.emoji.name === "✏") {
					// customize title
					const resp: string = await this.waitForTextResponse(msg, "What should the title of this embed be?", 256, message);
					// edit
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}
					if (this.exceedsLimit(embed, embed.title, resp)) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Character Limit Exceeded!", "Your embed will exceed the 6,000 character limit with the addition or edit of this item. Please try again."));
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}
					embed.setTitle(resp);
				} else if (r.emoji.name === "📝") {
					// customize desc
					const resp: string = await this.waitForTextResponse(msg, "What should the description of this embed be?", 2048, message);
					// edit
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}
					embed.setDescription(resp);
				} else if (r.emoji.name === "🙍") {
					// customize author
					const resp: string = await this.waitForTextResponse(msg, "What or who should the author of this embed be? Type `tag` to use your Discord tag and profile picture; type `nick` to use your server nickname and profile picture. Type `server` to use the server name and server picture. Type anything else to use whatever you said.", 256, message);
					// edit
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}

					if (this.exceedsLimit(embed, embed.author ? embed.author.name : "", 256)) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Character Limit Exceeded!", "Your embed will exceed the 6,000 character limit with the addition or edit of this item. Please try again."));
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}

					if (resp === "nick") {
						embed.setAuthor(message.member.displayName, message.author.displayAvatarURL);
					} else if (resp === "tag") {
						embed.setAuthor(message.author.tag, message.author.displayAvatarURL);
					} else if (resp === "server") {
						embed.setAuthor(message.guild.name, message.guild.iconURL);
					} else {
						embed.setAuthor(resp);
					}
				} else if (r.emoji.name === "📎") {
					// customize fields
					let add: boolean = false;
					while (true) {
						let qString: string;
						if (this.maximumFields > fields) {
							qString = "Do you want to add or remove a field? Type `add` to add one; `remove` to remove one.";
						} else {
							qString = "You have too many fields; you must remove a field. Type `remove` now.";
						}
						const resp: string = await this.waitForTextResponse(msg, qString, 10000, message);
						if (!this.evaluateResponse(resp)) {
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							isChanging = false;
							return;
						}
						if (resp === "add" && this.maximumFields > fields) {
							add = true;
							break;
						} else if (resp === "remove") {
							add = false;
							break;
						} else {
							if (this.maximumFields > fields) {
								MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "add", "remove"), 3000);
							} else {
								MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "remove"), 3000);
							}
						}
					}

					if (add) {
						const title: string = await this.waitForTextResponse(msg, "What should the name of this field be?", 256, message);
						const value: string = await this.waitForTextResponse(msg, "What should the value of this field be?", 1024, message);
						if (!this.evaluateResponse(title) || !this.evaluateResponse(value)) {
							isChanging = false;
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							return;
						}

						if (this.exceedsLimit(embed, null, 256)) {
							MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Character Limit Exceeded!", "Your embed will exceed the 6,000 character limit with the addition or edit of this item. Please try again."));
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							isChanging = false;
							return;
						}

						let inline: boolean = false;
						while (true) {
							const inlineField: string = await this.waitForTextResponse(msg, "Do you want to make this field inline? Type `yes` or `no`.", 5, message);
							if (!this.evaluateResponse(inlineField)) {
								isChanging = false;
								return;
							}
							if (inlineField === "yes") {
								inline = true;
								break;
							} else if (inlineField === "no") {
								inline = false;
								break;
							} else {
								MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_CHOICE_INPUT", "yes", "no"), 3000);
							}
						}
						embed.addField(title, value, inline);
					} else {
						const prompt: string = await this.waitForTextResponse(msg, "Please type the name of the field you want to remove. Be as specific as possible.", 256, message);
						for (let i = 0; i < embed.fields.length; i++) {
							if (embed.fields[i].name.includes(prompt)) {
								embed.fields.splice(i, 1);
								break;
							}
						}
					}
				} else if (r.emoji.name === "📕") {
					// customize footer
					const resp: string = await this.waitForTextResponse(msg, "What should the footer of this embed be?", 2048, message);
					// edit
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}

					if (this.exceedsLimit(embed, embed.footer ? embed.footer.text : "", 256)) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Character Limit Exceeded!", "Your embed will exceed the 6,000 character limit with the addition or edit of this item. Please try again."));
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}
					embed.setFooter(resp);
				} else if (r.emoji.name === "🖌") {
					// customize thumbnail
					const resp: string = await this.waitForTextResponse(msg, "What should the thumbnail of this embed be? Input a URL.", 10000, message);
					// edit
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}

					if (resp === "guild") {
						embed.setThumbnail(message.guild.iconURL);
					} else if (resp === "me") {
						embed.setThumbnail(message.author.displayAvatarURL);
					} else {
						if (this.checkURL(resp)) {
							embed.setThumbnail(resp);
						} else {
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							isChanging = false;
							return;
						}
					}
				} else if (r.emoji.name === "📷") {
					// customize image
					const resp: string = await this.waitForTextResponse(msg, "What should the image of this embed be? Input a URL.", 10000, message);
					if (!this.evaluateResponse(resp)) {
						await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
						isChanging = false;
						return;
					}

					if (resp === "guild") {
						embed.setImage(message.guild.iconURL);
					} else if (resp === "me") {
						embed.setImage(message.author.displayAvatarURL);
					} else {
						if (this.checkURL(resp)) {
							embed.setThumbnail(resp);
						} else {
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							isChanging = false;
							return;
						}
					}
				} else if (r.emoji.name === "🌈") {
					// customize desc
					let response: number;
					let resp: string;
					while (true) {
						resp = await this.waitForTextResponse(msg, "What should the color of this embed be? Please input a HEX value (search up `color picker` on Google).", 100, message);
						if (!this.evaluateResponse(resp)) {
							await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
							isChanging = false;
							return;
						}
						if (resp.includes("#")) {
							response = this.HEXToVBColor(resp);
							break;
						} else {
							MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Invalid Color Added", "Please input a valid color HEX value. Color HEX values start with a #."));
						}
					}
					// edit
					await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
					embed.setColor(response);
				} else if (r.emoji.name === "💾") {
					await msg.delete().catch(e => { });
					await embedMessage.delete().catch(e => { });
					await interact.stop();
					const embedPrompt: RichEmbed = MessageFunctions.createMsgEmbed(message, "Select Location To Send", "Please mention a channel or give me the ID of the channel where you want this embed to be sent to. To cancel, type `cancel`.");
					message.channel.send(embedPrompt).then(promptMsg => {
						const collector: MessageCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
							time: 600000
						});
						collector.on("collect", async m => {
							if (m.content === "cancel") {
								collector.stop();
								return;
							}

							let chan: Channel | string = m.mentions.channels.first() || m.content;
							let resolvedChannel: Channel;

							if (typeof chan === "string") {
								if (message.guild.channels.has(chan)) {
									resolvedChannel = message.guild.channels.get(chan);
								}
							} else {
								resolvedChannel = chan;
							}

							if (!resolvedChannel) {
								MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHANNELS_FOUND"));
								return;
							}

							if (!(resolvedChannel as TextChannel).permissionsFor(message.guild.me).has(["READ_MESSAGES", "SEND_MESSAGES"])) {
								MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "READ_MESSAGES", "SEND_MESSAGES"));
								return;
							}

							(resolvedChannel as TextChannel).send(embed).catch(e => { });
							(promptMsg as Message).delete().catch(e => { });
							collector.stop();
						});

						collector.on("end", (message, reason) => {
							(promptMsg as Message).delete().catch(e => { });
						});
					});
					return;
				} else if (r.emoji.name === "❌") {
					await msg.delete().catch(e => { });
					embedMessage.delete().catch(e => { });
					await interact.stop();
					return;
				}

				await embedMessage.edit(embed);
				isChanging = false;
				await msg.edit(this.editEmbedWithLimit(this.introEmbed, embed)).catch(e => { });
				return;
			});

			interact.on("end", async (elem, reason) => {
				if (reason === "time") {
					await (msg as Message).delete().catch(e => { });
					embedMessage.delete().catch(e => { });
					return;
				}
			});
		});
	}

	/**Checks if a URL is an image or not. */
	private checkURL(url: string) {
		return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}

	/**Evaluates a response and checks to make sure system didn't end it. */
	private evaluateResponse(resp: string): boolean {
		if (resp === "CANCEL_PROCESS"
			|| resp === "NO_RESP") {
			return false;
		}
		return true;
	}

	/**Waits for a text response then returns it. This will edit the original embed to show the question. */
	private async waitForTextResponse(message: Message, prompt: string, limit: number, origMessage: Message): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const collector: MessageCollector = new MessageCollector(message.channel, m => m.author.id === origMessage.author.id, {
				time: 120000
			});

			await message.edit(MessageFunctions.createMsgEmbed(message, "Prompt", prompt));
			collector.on("collect", async m => {
				await m.delete().catch(e => { });
				if (m.content === "cancel") {
					resolve("CANCEL_PROCESS");
				}

				if (m.content.length > limit) {
					MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "MSG_TOO_LONG", limit.toString()));
					return;
				}
				collector.stop();
				resolve(m.content);
			});

			collector.on("end", (collected, reason) => {
				if (reason === "time") {
					resolve("NO_RESP")
				}
			})
		});
	}

	/**Checks to see if the embed size is exceeded. */
	private exceedsLimit(embed: RichEmbed, item: string, resp: string | number): boolean {
		return embed.length - (item ? item.length : 0) + (typeof resp === "string" ? resp.length : resp) > this.maximumCharacters;
	}

	/**Edits the introduction embed with info from the resultant embed. */
	private editEmbedWithLimit(embed: RichEmbed, rEmbed: RichEmbed): RichEmbed {
		embed.setFooter(`Fields Used: ${rEmbed.fields.length}/25 • Characters Used: ${rEmbed.length}/6000`);
		return embed;
	}

	/**Converts HEX value to its respective integer value. */
	private HEXToVBColor(rrggbb: string): number {
		return parseInt(rrggbb.replace(/^#/, ''), 16);
	}
}
