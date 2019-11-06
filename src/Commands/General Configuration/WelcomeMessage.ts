import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed } from "discord.js";
import TurkieBotGuild, { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { MongoDB } from "../../Handlers/MongoDBHandler";

export default class WelcomeMessage extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "configwelcomemsg",
			aliases: ["welcomemsg"],
			description: "Configures the welcome message for the server. Custom command syntax handling is currently not supported.",
			usage: ["configwelcomemsg <Message> [--embed]"],
			example: ["configwelcomemsg Welcome to the server! --embed", "configwelcomemsg Welcome!"]
		}, {
			commandName: "Configure Server Welcome Message",
			botPermissions: [],
			userPermissions: ["MANAGE_GUILD"],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		if (args.length === 0) {
			TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
				"serverConfiguration.welcomeMessage.isEnabled": !guildInfo.serverConfiguration.welcomeMessage.isEnabled
			}, (err, raw) => {
				if (err) {
					MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
					return;
				} else {
					const embed: MessageEmbed = MessageFunctions.createMsgEmbed(message, "Configured Welcome Message", `${!guildInfo.serverConfiguration.welcomeMessage.isEnabled ? "The welcome message notification has been enabled. Make sure you have a message set!" : "Welcome message notification has been disabled."}`);
					MessageFunctions.sendRichEmbed(message, embed);
				}
			});
			return;
		}
		let welcomeMsg: string = args.join(" ");

		if (welcomeMsg.length > 1800) {
			MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "MSG_TOO_LONG", "1800"));
			return
		}
		let embed: boolean = false;

		if (welcomeMsg.includes("--embed")) {
			welcomeMsg = welcomeMsg.replace("--embed", "");
			embed = true;
		}

		TurkieBotGuild.updateOne({ guildID: message.guild.id }, {
			$set: {
				"serverConfiguration.welcomeMessage.message": welcomeMsg,
				"serverConfiguration.welcomeMessage.embed": embed
			}
		}, async (err, data) => {
			if (err) {
				MongoDB.MongoDBGuildHandler.sendErrorEmbed(message);
				return;
			}
			MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Welcome Message Set", "The welcome message has been changed.", [
				{
					name: "Content",
					value: `${welcomeMsg.length < 1000 ? welcomeMsg : welcomeMsg.slice(0, 1000) + "..."}`
				},
				{
					name: "Embed?",
					value: MessageFunctions.codeBlockIt(embed ? "Yes" : "No")
				}
			]), 10000);
		});
	}


}