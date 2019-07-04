import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import { Colors } from "../../Configuration/Configuration";
import MessageFunctions from "../../Utility/MessageFunctions";

export default class BotPing extends Command {
	private readonly pingTimes: number[] = [];
	private readonly apiTimes: number[] = [];

	public constructor(client: Client) {
		super(client, {
			name: "ping",
			aliases: [],
			description: "Gets the ping information.",
			usage: ["ping"],
			example: ["ping"]
		}, {
			commandName: "Ping Information",
			botPermissions: [],
			userPermissions: [],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		})
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		let responseMessage: any = await message.channel.send({
			embed: {
				color: Colors.randomElement(),
				description: '🏓 Pinging!'
			}
		});

		await this.pingTimes.push(responseMessage.createdTimestamp - message.createdTimestamp);
		await this.apiTimes.push(client.ping);

		await responseMessage.edit({
			embed: {
				author: {
					name: message.author.tag,
					icon_url: message.author.displayAvatarURL
				},
				color: Colors.randomElement(),
				title: `${client.user.tag} Ping Statistics`,
				description: `🏓 Pong!`,
				fields: [{
					name: 'Latency',
					value: MessageFunctions.codeBlockIt(`${(responseMessage.createdTimestamp - message.createdTimestamp).toFixed(2)} MS`),
				},
				{
					name: 'WebSocket/API Ping',
					value: MessageFunctions.codeBlockIt(`${(client.ping).toFixed(2)} MS`),
					inline: true
				},
				{
					name: 'Average Latency',
					value: MessageFunctions.codeBlockIt(`${this.pingTimes.length === 0 ? Math.round(responseMessage.createdTimestamp - message.createdTimestamp).toFixed(2) : (this.pingTimes.reduce((p, c) => { return p + c }) / this.pingTimes.length).toFixed(2)} MS`),
				},
				{
					name: 'Average Websocket/API Ping',
					value: MessageFunctions.codeBlockIt(`${this.apiTimes.length === 0 ? Math.round(client.ping).toFixed(2) : (this.apiTimes.reduce((p, c) => { return p + c }) / this.apiTimes.length).toFixed(2)} MS`),
					inline: true
				}
				],
				timestamp: new Date(),
			}
		});
	}
}