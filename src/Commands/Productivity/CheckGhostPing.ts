import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { ghostPings } from "../../Handlers/UniversalVars";
import { EnhancedDates } from "../../Utility/EnhancedDates";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class CheckGhostPings extends Command {
	private readonly maxAmount: number = 5;

	public constructor(client: Client) {
		super(client, {
			name: "checkghostpings",
			aliases: ["ghostpings", "ghostping"],
			description: "Got a ghost ping? Use this command in the channel where you got the ghost ping to see who pinged you!",
			usage: ["checkghostpings"],
			example: []
		}, {
			commandName: "Check Ghost Pings",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: true,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let ghostPinged: string = "";
		let amount = 0;
		for (let i = 0; i < ghostPings.length; i++) {
			if (ghostPings[i].content.includes(message.author.id) && ghostPings[i].channel === message.channel.id) {
				console.log("X");
				ghostPinged += `User: <@${ghostPings[i].id}>\nTime: ${EnhancedDates.formatUTCDate(ghostPings[i].sent)}\n\n`;
				amount++;
			}

			if (amount >= this.maxAmount) {
				break;
			}
		}
		message.channel.send(MessageFunctions.createMsgEmbed(message, "Ghost-Pingers", ghostPinged.length > 0 ? ghostPinged : "No one ghost-pinged you here!"));
	}
}