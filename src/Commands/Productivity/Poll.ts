import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration";

export default class Poll extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "poll",
			aliases: [],
			description: "Initiates a poll with question and choices (Up to 20 choices). If no choices are specified, the bot will use the Up/Down/Neutral poll setting.",
			usage: ["poll <Question>", "poll <Question>; <Choice>; [Choice]; [Choice]..."],
			example: ["Should we add this idea?", "poll Are turkeys amazing?; Yes; No; What is a turkey?; Why does this exist?"]
		}, {
			commandName: "Poll",
			botPermissions: ["ADD_REACTIONS"],
			userPermissions: [],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args.join(" ").indexOf(";") === -1) {
			const pollEmbed: MessageEmbed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL({ format: "png" }))
				.setColor(Colors.randomElement())
				.setDescription(args.join(" "))
				.setThumbnail(message.author.avatarURL({ format: "png" }))
				.setFooter('Turkie')
				.setTimestamp();
			message.channel.send(pollEmbed).then(async msg => {
				msg = msg as Message;
				await msg.react("⬇").catch(e => { });
				await msg.react("↔").catch(e => { });
				await msg.react("⬆").catch(e => { });
			});
			return;
		} else if (args.join(" ").split(";").length < 2) {
			const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Error", "You must input a question and at least one answer, separated by a semicolon (`;`).")
			message.channel.send(embed)						
				.then(msg => {
					msg = msg as Message;
					msg.delete({ timeout: 5000 });
				})
				.catch(e => { });
			return;
		}

		let word: string = args.join(" ");
		let options: string = "";
		let options2: string = "";

		let choices: string[] = word.split(/;/);
		let actualChoices: string[] = [];
		choices.forEach(c => {
			if (c !== "  " && c !== " " && c !== "") {
				actualChoices.push(c);
			}
		});

		
		if (actualChoices.length <= 21) {
			if (actualChoices.length <= 1) {
				const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Error", "None of your choices were valid. Please try again.");
				message.channel.send(embed)
					.then(msg => {
						msg = msg as Message;
						msg.delete({ timeout: 5000 });
					})
					.catch(e => { });
				return;
			}

			for (let i = 1; i < actualChoices.length; i++) {
				if (i < 11) {
					options += this.optionfinder(i, actualChoices) + "\n";
					continue;
				} else if (i >= 11) {
					options2 += this.optionfinder(i, actualChoices) + "\n";
					continue;
				}
			}

			const pollEmbed: MessageEmbed = new MessageEmbed()
				.setAuthor(`Poll Initiated By ${message.author.tag}!`, message.author.avatarURL({ format: "png" }))
				.setColor(Colors.randomElement())
				.setDescription(word.split(/;/)[0])
				.setThumbnail(message.author.avatarURL({ format: "png" }))
				.addField("Choices [I]", options)
				.setFooter('Turkie')
				.setTimestamp();

			if (actualChoices.length > 11) {
				pollEmbed.addField("Choices [II]", options2);
			}

			message.channel.send(pollEmbed).then(msg => {
				msg = msg as Message;
				this.react(0, actualChoices.length - 1, msg)
			});

			// poll = 1;
			// pollreact = word.split(/;/).length - 1;
		} else {
			const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, 'Poll Error', 'You can only input a maximum of 20 choices.');
			message.channel.send(embed)
				.then(msg => {
					msg = msg as Message;
					msg.delete({ timeout: 5000 });
				})
				.catch(e => { });
		}
	}

	/**Returns the emoji representation of the value `i` and the choice. */
	private optionfinder(i: number, actualChoices: string[]): string {
		switch (i) {
			case 1:
				return (":one: " + actualChoices[i]);
			case 2:
				return (":two: " + actualChoices[i]);
			case 3:
				return (":three: " + actualChoices[i]);
			case 4:
				return (":four: " + actualChoices[i]);
			case 5:
				return (":five: " + actualChoices[i]);
			case 6:
				return (":six: " + actualChoices[i]);
			case 7:
				return (":seven: " + actualChoices[i]);
			case 8:
				return (":eight: " + actualChoices[i]);
			case 9:
				return (":nine: " + actualChoices[i]);
			case 10:
				return (":keycap_ten: " + actualChoices[i]);
			case 11:
				return (":regional_indicator_a: " + actualChoices[i]);
			case 12:
				return (":regional_indicator_b: " + actualChoices[i]);
			case 13:
				return (":regional_indicator_c: " + actualChoices[i]);
			case 14:
				return (":regional_indicator_d: " + actualChoices[i]);
			case 15:
				return (":regional_indicator_e: " + actualChoices[i]);
			case 16:
				return (":regional_indicator_f: " + actualChoices[i]);
			case 17:
				return (":regional_indicator_g: " + actualChoices[i]);
			case 18:
				return (":regional_indicator_h: " + actualChoices[i]);
			case 19:
				return (":regional_indicator_i: " + actualChoices[i]);
			case 20:
				return (":regional_indicator_j: " + actualChoices[i]);
			default:
				return (":regional_indicator_k: " + actualChoices[i]); // shouldn't hit here
		}
	}

	/**Reacts to the message. */
	private react(reactnum: number, pollreact: number, message: Message) {
		const reactions = [
			"#⃣",
			"0⃣",
			"1⃣",
			"2⃣",
			"3⃣",
			"4⃣",
			"5⃣",
			"6⃣",
			"7⃣",
			"8⃣",
			"9⃣",
			"🔟",
			"🇦",
			"🇧",
			"🇨",
			"🇩",
			"🇪",
			"🇫",
			"🇬",
			"🇭",
			"🇮",
			"🇯"
		];
	
		if (pollreact > 0) {
			setInterval(function () {
				if (reactnum < pollreact) {
					reactnum++;
					message.react(reactions[reactnum + 1]);
				} else {
					clearInterval();
				}
			}, 500);
			let poll = 0;
		}
	}
}