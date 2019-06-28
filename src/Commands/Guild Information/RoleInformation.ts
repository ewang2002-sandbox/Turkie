import { Command } from "../../Models/Command";
import { Client, Message, RichEmbed, Role, PermissionObject } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { EnhancedDates } from "../../Utility/EnhancedDates";

export default class ExampleCommand extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "roleinfo",
			aliases: [],
			description: "Provides information on a role.",
			usage: ["roleinfo <@ROLE MENTION>", "roleinfo <Role Name>"],
			example: ["roleinfo @Member", "roleinfo Administrator"]
		}, {
			commandName: "Role Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		// get date
		const date: EnhancedDates = new EnhancedDates();
		// get role
		let role: Role = message.mentions.roles.first();
		if (!role) {
			role = message.guild.roles.find(role => role.name === args.join(' '));
		}

		if (!role) {
			const embed: RichEmbed = MessageFunctions.createMsgEmbed(message, "No Role Found", "The role does not exist. Roles are sensitive, please make sure capitalization and spelling is correct.");
			message.channel.send(embed).catch(e => { });
			return;
		}

		let perms: [string, boolean][] = Object.entries(role.serialize());
		let permName: string = "";
		for (let i = 0; i < perms.length; i++) {
			if (perms[i][1]) {
				permName += `${this.modifyTxt(perms[i][0].replace(/_/g, ' '))}, `;
			}
		}

		// remove last comma from the string
		permName = permName.replace(/,\s*$/, "");


		const roleInfo: RichEmbed = new RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle(`Role Information: @${role.name}`)
			.addField("Role ID", `${role.id}`, true)
			.addField("Role Members", role.members.size, true)
			.addField("Mentionable", (role.mentionable) ? "Yes" : "No", true)
			.addField("Displayed (Hoisted)", (role.hoist) ? "Yes" : "No", true)
			.addField("Bot Role", (role.managed) ? "Yes" : "No", true)
			.addField("Role Color", `${role.hexColor} | ${role.color}`, true)
			.addField("Created On", `${date.formatUTCDate(role.createdTimestamp)}`, true)
			.addField("Permissions", permName.length !== 0 ? permName : "None", true)
			.setTimestamp()
			.setThumbnail(`https://dummyimage.com/250/${role.hexColor.slice(1)}/&text=%20`)
			.setFooter("Turkie")
			.setColor(role.color);
		message.channel.send(roleInfo).catch(e => { });
		return;
	}

	private modifyTxt(permission: string): string {
		return permission.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	}
}