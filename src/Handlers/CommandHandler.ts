import { Message, RichEmbed, User, Client, OAuth2Application, Collection, Permissions, Guild } from 'discord.js';
import { DefaultPrefix } from "../Configuration/Configuration";
import { Command } from "../Models/Command";
import { CommandManager } from "../Utility/CommandManager";
import MessageFunctions from "../Utility/MessageFunctions";
import { GuildInterface } from '../Models/TurkieBotGuild';
import { Colors } from '../Configuration/Configuration.Sample';

export class CommandHandler {
	/**The "" + this.msg. */
	private msg: Message;
	private guildInfo: GuildInterface;

	/**The constructor. */
	public constructor(message: Message, guildInformation: GuildInterface) {
		this.msg = message;
		this.guildInfo = guildInformation;
	}

	/**
	 * Executes the command, if found.
	 */
	public async executeCommand(): Promise<void> {
		if (this.msg.author.bot) {
			return;
		}
		let app: OAuth2Application = await this.msg.client.fetchApplication();
		let owner: User = await this.msg.client.fetchUser(app.owner.id);

		let possPrefixes: string[];
		if (this.msg.guild) { // if guild load guild prefix.
			possPrefixes = [this.guildInfo.serverConfiguration.prefix, DefaultPrefix];
		} else { // only load default prefix.
			possPrefixes = [DefaultPrefix];
		}

		let prefix: string = null;
		for (const thisPrefix of possPrefixes) {
			if (this.msg.content.indexOf(thisPrefix) === 0) {
				prefix = thisPrefix;
				break;
			}
		}

		if (!prefix) return;

		let messageArray: string[] = this.msg.content.split(" ");
		let cmd: string = messageArray[0];
		let args: string[] = messageArray.slice(1);
		let commandfile: string = cmd.slice(DefaultPrefix.length);

		const cmdManager: CommandManager = new CommandManager(this.msg.client, commandfile);
		let execCommand: Command = cmdManager.findCommand();

		if (execCommand) {
			// check to see if the bot owner can use this command only.
			if (execCommand.botOwnerOnly) {
				if (this.msg.author.id !== owner.id) {
					let errNoOwner: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "Denied", "You are not the bot's owner.");
					this.msg.channel.send(errNoOwner).catch(e => { });
					return;
				}
			}

			// check to see if command is for guild only.
			if (execCommand.guildOnly && !this.msg.guild) {
				let cmdNoGuild: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "Command Guild Only", "The command can only be used in a guild.");
				this.msg.channel.send(cmdNoGuild).catch(e => { });
				return;
			}

			// check member perms
			if (this.msg.guild) {
				// check to see if msg can be deleted.
				if (this.guildInfo.serverConfiguration.commands.deleteCommandTrigger && this.msg.deletable) {
					await this.msg.delete();
				}
				
				// one role is enabled & the person has no role (@everyone is given to everyone and cannot be removed, so the size is 1.)
				if (this.guildInfo.serverConfiguration.commands.mustHaveOneRole && this.msg.member.roles.size === 1) {
					let lessThanReq: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "Need At Least One Role", "You must have at least one visible role on your account in this server to use commands");
					MessageFunctions.sendRichEmbed(this.msg, lessThanReq);
					return;
				}

				// must have one role
				if (this.guildInfo.serverConfiguration.commands.mustHaveOneRole && this.msg.member.roles.size === 0) {
					let noRoles: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "No Roles", "You must have at least one role to run this command.");
					MessageFunctions.sendRichEmbed(this.msg, noRoles);
					return;
				}

				let memberPerms: Permissions = this.msg.member.permissions,
					hasPermissions: boolean = false;
				if (execCommand.userPermissions.length !== 0) {
					for (let i = 0; i < execCommand.userPermissions.length; i++) {
						if (memberPerms.has(execCommand.userPermissions[i])) {
							hasPermissions = true;
							break;
						}
					}

					if (!hasPermissions) {
						let noPermissions: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "No Permissions", "You do not have permissions to run this command.");
						MessageFunctions.sendRichEmbed(this.msg, noPermissions);
						return;
					}
				}

				// check bot perms
				let botPerms: Permissions = this.msg.guild.me.permissions,
					hasNeededPerms: boolean = false;
				if (execCommand.botPermissions.length !== 0) {
					for (let i = 0; i < execCommand.botPermissions.length; i++) {
						if (botPerms.has(execCommand.botPermissions[i])) {
							hasNeededPerms = true;
							break;
						}
					}

					if (!hasNeededPerms) {
						let noPermissions: RichEmbed = MessageFunctions.createMsgEmbed(this.msg, "No Permissions", "The bot does not have permissions ");
						MessageFunctions.sendRichEmbed(this.msg, noPermissions);
						return;
					}
				}
			}

			// check arg length.
			if (execCommand.argsLength > args.length) {
				let helpErrEmbed: RichEmbed = cmdManager.helpCommand();
				MessageFunctions.sendRichEmbed(this.msg, helpErrEmbed);
				return;
			}

			// execution
			execCommand.execute(this.msg.client, this.msg, args, this.guildInfo);
		} else {
			// make sure it's a guild and cc is enabled
			if (this.msg.guild && this.guildInfo.customCommands.isEnabled) {
				let ccData;
				for (let i = 0; i < this.guildInfo.customCommands.customCommands.length; i++) {
					if (this.guildInfo.customCommands.customCommands[i].name === commandfile) {
						ccData = this.guildInfo.customCommands.customCommands[i];
						break;
					}
				}
	
				if (ccData) {
					if (this.guildInfo.serverConfiguration.commands.deleteCommandTrigger) {
						await this.msg.delete().catch(error => {});
					}
					let textToSend: string = ccData.commandanswer
						.replace(/{author}/g, "" + this.msg.author)
						.replace(/{authorNickname}/g,"" + this.msg.member.displayName)
						.replace(/{authorDiscrim}/g, "" + this.msg.author.discriminator)
						.replace(/{channel}/g, "" + this.msg.channel)
						.replace(/{serverName}/g, "" + this.msg.guild.name)
						.replace(/{authorID}/g, "" + this.msg.author.id)
						.replace(/{channelID}/g, "" + this.msg.channel.id)
						.replace(/{serverID}/g, "" + this.msg.guild.id);
	
	
					let toSend: string | RichEmbed;
					if (ccData.embed) {
						toSend = new RichEmbed()
							.setAuthor(this.msg.author.tag, this.msg.author.avatarURL)
							.setColor(Colors.randomElement())
							.setDescription(textToSend);
					} else {
						toSend = textToSend;
					}
	
					if (ccData.dm) {
						this.msg.author.send(toSend).catch(e => {});
					} else {
						this.msg.channel.send(toSend).catch(e => {});
					}
				}
			}
		}
	}
}