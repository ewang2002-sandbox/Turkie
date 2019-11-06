import { Message, MessageEmbed } from "discord.js";
import { Colors } from "../Configuration/Configuration";

type Tag = "INVALID_NUMBER_INPUT" | "INVALID_CHOICE_INPUT" | "INVALID_INVITE_INPUT" | "NO_MENTIONS_FOUND" | "NO_CHANNELS_FOUND" | "NO_CHAN_PERMISSIONS" | "NO_NEGATIVE_NUMBER" | "NO_ZERO_NUMBER" | "INVALID_ID" | "NO_USERS_FOUND" | "NOT_IN_VC" | "MSG_TOO_LONG" | "NOT_ENABLED" | "NO_ROLE_FOUND";

export default class MessageFunctions {
	/**
	 * Produces a simple embed.
	 * @param {Message} message The message object.
	 * @param {string} title The title for the embed.
	 * @param {string} desc The description for the embed.
	 * @param {EmbedField[]} [fields] The fields for the embed.
	 * @param {string} [footer] The footer for the field.
	 * @param {string} [image] The image.
	 * @param {string} [thumbnail] The thumbnail.
	 * @returns {MessageEmbed} The MessageEmbed.
	 * @static
	 */
	public static createMsgEmbed(message: Message, title: string, desc: string, fields: EmbedField[] = [], footer?: string, image?: string, thumbnail?: string): MessageEmbed {
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setTitle(title)
			.setDescription(desc)
			.setColor(Colors.randomElement())
			.setTimestamp();
		for (let i = 0; i < fields.length; i++) {
			embed.addField(fields[i].name, fields[i].value, fields[i].inline ? fields[i].inline : false);
		}
		if (image && image.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
			embed.setImage(image);
		}
		if (thumbnail && thumbnail.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
			embed.setThumbnail(thumbnail);
		}
		if (footer) {
			embed.setFooter(footer);
		}
		return embed;
	}

	/**
	 * Finds a message embed based on the tag.
	 * @param {Message} message The message.
	 * @param {string} tag The tag to look for.
	 * @param {string[]} [misc] Any extra arguments.
	 * @returns {MessageEmbed}
	 * @static
	 */
	public static msgConditions(message: Message, tag: Tag, ...misc: string[]): MessageEmbed {
		const embed: MessageEmbed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setColor(Colors.randomElement())
			.setTimestamp();

		switch (tag) {
			// invalid input
			case ("INVALID_NUMBER_INPUT"): {
				embed.setTitle("Invalid Number Input");
				embed.setDescription("Please input a valid numerical value.");
				break;
			}
			case ("INVALID_CHOICE_INPUT"): {
				embed.setTitle("Invalid Input");
				embed.setDescription(`Please input a valid choice. Valid choices are: \`${misc.join(", ")}\`.`);
				break;
			}
			case ("INVALID_INVITE_INPUT"): {
				embed.setTitle("Invalid Invite Input");
				embed.setDescription("You did not input a valid invite link or code. Try a different link or code, or ensure the invite was correctly typed.");
				break;
			}
			case ("NO_MENTIONS_FOUND"): {
				embed.setTitle("No Mentions Found");
				embed.setDescription("You did not @Mention anyone. Please be sure you mention users.");
				break;
			}
			case ("NO_CHANNELS_FOUND"): {
				embed.setTitle("No Channels Found");
				embed.setDescription("You did not mention a channel. Please be sure you mention the channel you want to use.");
				break;
			}
			case ("NO_CHAN_PERMISSIONS"): {
				embed.setTitle("No Permissions");
				embed.setDescription(`The channel you specified does not grant certain permissions for me. I need the following permissions: ${misc.join(", ")}`);
				break;
			}
			case ("NO_NEGATIVE_NUMBER"): {
				embed.setTitle("No Negative Numbers Allowed")
				embed.setDescription("You cannot input a negative number. Please try again.");
				break;
			}
			case ("NO_ZERO_NUMBER"): {
				embed.setTitle("No Zeros Allowed");
				embed.setDescription("You cannot input zero as a number choice. Please try again.");
				break;
			}
			case ("INVALID_ID"): {
				embed.setTitle("Invalid ID Given");
				embed.setDescription(`Please input a valid ${misc[0]} ID.`);
				break;
			}
			case ("NO_USERS_FOUND"): {
				embed.setTitle("No Users Found")
				embed.setDescription(`I could find a user by the ${misc[0]} \`${misc[1]}\`.`)
				break;
			}
			case ("NOT_IN_VC"): {
				embed.setTitle("Not In Voice Channel")
				embed.setDescription("You must be in a voice channel. Please join one and try again!");
				break;
			}
			case ("MSG_TOO_LONG"): {
				embed.setTitle("Too Long!");
				embed.setDescription(`Your ${misc[0]} is too long to process. The maximum amount of characters allowed is ${misc[1]} characters.`);
				break;
			}
			case ("NOT_ENABLED"): {
				embed.setTitle("Not Enabled!");
				embed.setDescription(`The service, \`${misc[0]}\`, is not enabled at this time. Please try again later, or enable it if you have the permissions.`);
				break;
			}
			case ("NO_ROLE_FOUND"): {
				embed.setTitle("Invalid Role Inputted");
				embed.setDescription("Please input a valid role ID or mention.");
				break;
			}
		}

		return embed;
	}

	/**
	 * Sends a message with a deletion time. 5 seconds is default.
	 * @param {Message} message The message.
	 * @param {MessageEmbed} re The embed to send.
	 * @param {number} [deleteIn] The amount of time to delete the message in ms.
	 * @returns {Promise<Message>}
	 * @static
	 */
	public static async sendRichEmbed(message: Message, re: MessageEmbed, deleteIn: number = 5000): Promise<Message> {
		return new Promise((resolve, reject) => {
			message.channel.send(re)
				.then((msg) => {
					msg = msg as Message;
					msg.delete({ timeout: deleteIn });
					resolve(msg);
				}).catch(e => { });
		});

	}

	/**
	 * Applies code blocks to a string.
	 * @param {string} content The content to apply code blocks to.
	 * @param {string} code The code for the code blocks. Default is `css`.
	 * @returns {string} The code blocks.
	 */
	public static codeBlockIt(content: string, code: string = "css"): string {
		return "```" + code + "\n" + (content) + "```";
	}
}

interface EmbedField {
	name: string;
	value: string;
	inline?: boolean;
}