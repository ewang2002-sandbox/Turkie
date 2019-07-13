import { Command } from "../../Models/Command";
import { Client, Message, GuildMember, PermissionObject, RichEmbed, PermissionResolvable } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { OtherUtilities } from "../../Utility/OtherUtilities";
import { ModerationEnforcement } from "../../Handlers/ModerationEnforcement";
import MessageFunctions from "../../Utility/MessageFunctions";
import { EnhancedDates } from "../../Utility/EnhancedDates";
import { Colors } from "../../Configuration/Configuration.Sample";

export default class UserInformation extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "userinfo",
			aliases: ["whois"],
			description: "Gets information on a user.",
			usage: [],
			example: []
		}, {
			commandName: "FORMAL COMMAND NAME",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
        let member: GuildMember;
        if (message.mentions.users.size > 0) {
            member = await ModerationEnforcement.fetchMember(message, message.mentions.users.first().id);
        } else if (args.join(" ")) {
			if (OtherUtilities.checkSnowflake(args[0]) && message.guild.members.has(args[0])) {
				member = await ModerationEnforcement.fetchMember(message, args[0]);
			} else {
				MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_ID", "user"));
				return;
			}
        }

        if (!member) {
            member = message.member;
        }

        let nick = message.member.displayName;
        if (!nick) {
            nick = '-';
        }
		let statusType = member.user.presence.status;
		let status: string = "";
        if (statusType === 'online') {
            status = 'Online';
        } else if (statusType === 'idle') {
            status = 'Idle';
        } else if (statusType === 'dnd') {
            status = 'Do Not Disturb';
        } else {
            status = 'Offline';
        }
        let userRoles = "";
		for (let [id, roles] of member.roles) {
			userRoles += `${roles}, `;
		}
        userRoles = userRoles.replace(/,\s*$/, "");

		let perms: [string, boolean][] = Object.entries(member.permissions.serialize());
		let permName: string = "";
		for (let i = 0; i < perms.length; i++) {
			if (perms[i][1]) {
				permName += `${this.modifyTxt(perms[i][0].replace(/_/g, ' '))}, `;
			}
		}
		permName = permName.replace(/,\s*$/, "");


        let p: string = "";
        if (member.user.presence.game) {
            p = member.user.presence.game.name;
        } else {
            p = "None";
		}
		
        const userInfo = new RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setTitle(`User Information: ${member.user.tag}`)
            .setDescription("Some basic user information.")
            .setThumbnail(member.user.displayAvatarURL)
            .setColor(Colors.randomElement())
            .addField("Name", member.user.tag, true)
            .addField("User ID", member.user.id, true)
            .addField("Nickname", nick, true)
            .addField("Roles", userRoles)
            .addField("Permission", permName)
            .addField("Joined Server", EnhancedDates.formatUTCDate(member.joinedTimestamp), true)
            .addField("Joined Discord", EnhancedDates.formatUTCDate(member.user.createdTimestamp), true)
            .addField("Default Avatar", `[Click Here](${member.user.defaultAvatarURL})`, true)
            .addField("Current Avatar", `[Click Here](${member.user.displayAvatarURL})`, true)
            .addField("Status", status, true)
            .addField("Game", p, true)
			.setFooter(`${message.guild.ownerID === member.user.id ? 'Server Owner' : ''}`);
		message.channel.send(userInfo);
        return;
	}

	private modifyTxt(permission: string) {
		return permission.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	}
}