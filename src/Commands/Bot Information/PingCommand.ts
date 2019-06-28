import { Command } from "../../Models/Command";
import { Client, Message } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";

export default class PingCommand extends Command {
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
				color: 0xe5cc0b,
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
				color: 0xe5cc0b,
				title: `${client.user.tag} Ping Statistics`,
				description: `🏓 Pong!`,
				fields: [{
					name: 'Latency',
					value: "```css\n" + `${(responseMessage.createdTimestamp - message.createdTimestamp).toFixed(2)}` + "ms```",
				},
				{
					name: 'WebSocket/API Ping',
					value: "```css\n" + `${(client.ping).toFixed(2)}` + "ms```",
					inline: true
				},
				{
					name: 'Average Latency',
					value: "```css\n" + `${this.pingTimes.length === 0 ? Math.round(responseMessage.createdTimestamp - message.createdTimestamp).toFixed(2) : (this.pingTimes.reduce((p, c) => { return p + c }) / this.pingTimes.length).toFixed(2)}` + "ms```",
				},
				{
					name: 'Average Websocket/API Ping',
					value: "```css\n" + `${this.apiTimes.length === 0 ? Math.round(client.ping).toFixed(2) : (this.apiTimes.reduce((p, c) => { return p + c }) / this.apiTimes.length).toFixed(2)}` + "ms```",
					inline: true
				}
				],
				timestamp: new Date(),
			}
		});
	}
}