import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed, TextChannel, User } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";
import MessageFunctions from "../../Utility/MessageFunctions";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";

export default class Unban extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "unban",
			aliases: [],
			description: "Unbans a user by tag or ID. Tags do not support spaces yet.",
			usage: ["unban <Discord Tag | ID> [Reason]"],
			example: ["unban User#0001 Oops."]
		}, {
			commandName: "Unban",
			botPermissions: ["BAN_MEMBERS"],
			userPermissions: ["BAN_MEMBERS"],
			argsLength: 1,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let idOrUser: string = args[0];
		let reason: string = args.slice(1).join(" ").trim().length > 0 ? args.slice(1).join(" ").trim() : "No reason provided.";

		message.guild.fetchBans().then(async bans => {
			let isFound: boolean = false;
			let userUnbanned: User;
			for (let [id, user] of bans) {
				if (user.user.tag === idOrUser || id === idOrUser) {
					isFound = true;
					userUnbanned = user.user
					await message.guild.members.unban(user.user, reason).catch(e => { });
					break;
				}
			}

			if (isFound) {
				const embed: MessageEmbed = new MessageEmbed()
					.setTitle("**Unban Successful!**")
					.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
					.setDescription("The user has been unbanned successfully.")
					.addField("Unbanned User", `${userUnbanned} (${userUnbanned.id})`)
					.addField("Moderator", `${message.author} (${message.author.id})`)
					.addField("Reason", reason)
					.addField("Server", message.guild.name)
					.setFooter("Turkie Moderation")
					.setColor(Colors.randomElement());
				MessageFunctions.sendRichEmbed(message, embed);
				// make sure we can send to modlogs
				if (ModerationEnforcement.configuredModLogs(message, guildInfo)) {
					(message.guild.channels.get(guildInfo.serverConfiguration.serverLogs.modLogs.channel) as TextChannel).send(embed);
				}
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_USERS_FOUND", "ID or tag of", idOrUser));
				return;
			}
		});
	}
}