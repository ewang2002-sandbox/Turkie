import { Command } from "../../Models/Command";
import { Client, Message, MessageEmbed, GuildMember, MessageCollector, VoiceChannel } from "discord.js";
import { GuildInterface } from "../../Models/TurkieBotGuild";
import MessageFunctions from "../../Utility/MessageFunctions";
import { Colors } from "../../Configuration/Configuration.Sample";

export default class Move extends Command {
	public constructor(client: Client) {
		super(client, {
			name: "moveall",
			aliases: [],
			description: "Moves everyone from one voice channel to another.",
			usage: ["moveall"],
			example: []
		}, {
			commandName: "Move All Members",
			botPermissions: ["CONNECT", "MOVE_MEMBERS"],
			userPermissions: ["MOVE_MEMBERS"],
			argsLength: 0,
			guildOnly: false,
			botOwnerOnly: false
		});
	}

	public async execute(client: Client, message: Message, args: string[], guildInfo: GuildInterface): Promise<void> {
		// will fix later
		let voiceChannels: VoiceChannel[] = [];
		let allVOICECHANNELS: VoiceChannel[] = [];
		let TOMOVEVC: VoiceChannel[] = [];

		let allDescFields: string[] = [];
		for (let [id, vc] of message.guild.channels.filter(c => c.type === 'voice')) {
			if (vc.permissionsFor(message.guild.me).has("MOVE_MEMBERS")) {
				voiceChannels.push(vc as VoiceChannel);
				allVOICECHANNELS.push(vc as VoiceChannel);
				TOMOVEVC.push(vc as VoiceChannel);
			}
		}
		const d: MessageEmbed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
			.setTitle("Bulk Voice Channel Move")
			.setDescription(`Selected: **{Pending}**\nPlease type the number of the voice channel that you want to move people from (originating). The collector will automatically stop after 1 minute.\nIf you want to use your current voice channel, type \`current\` now.\nIf you want to cancel this process, type \`cancel\` now.`)
			.setFooter(`Selecting Originating Voice Channel`)
			.setColor(Colors.randomElement());
		let i: number = 0,
			k: number = 0,
			l: number = 0,
			str: string = "";
		while (voiceChannels.length > 0) {
			i++;
			for (let j = 0; j < voiceChannels.slice(0, 5).length; j++) {
				k = j + l;
				str += `\`[${k + 1}]\` ${voiceChannels[j].name}\n`;
			}

			l += 5;
			d.addField(`VC (Part ${i})`, str, true);
			allDescFields.push(str);
			voiceChannels = voiceChannels.slice(5);
			str = "";
		}

		message.channel.send(d).then(async msg => {
			const collector: MessageCollector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
				time: 60000
			});
			let originatingVC: VoiceChannel,
				num: number;
			collector.on("collect", async msgA => {
				await msgA.delete();
				if (msgA.content === "current") {
					if (!message.member.voice.channel) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NOT_IN_VC"));
						return;
					}
					originatingVC = message.member.voice.channel;
					if (!originatingVC.permissionsFor(message.guild.me).has("MOVE_MEMBERS")) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "NO_CHAN_PERMISSIONS", "MOVE_MEMBERS"));
						return;
					}
				} else if (msgA.content === "cancel") {
					collector.stop();
					await msg.delete().catch(e => { });
					return;
				} else {
					num = parseInt(msgA.content);
					if (isNaN(num)) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_NUMBER_INPUT"));
						return;
					}
					if (!allVOICECHANNELS[num - 1]) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Invalid Voice Channel", "That number is not linked to a voice channel. Try again."));
						return;
					}

					originatingVC = allVOICECHANNELS[num - 1];
				}

				collector.stop();

				const e: MessageEmbed = new MessageEmbed()
					.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
					.setTitle("Bulk Voice Channel Move")
					.setDescription(`Selected: **${originatingVC.name}**\nPlease type the number of the voice channel that you want to move people to (destination). The collector will automatically stop after 1 minute.`)
					.setFooter("Selecting Destination Voice Channel")
					.setColor(Colors.randomElement());

				let i = 0;
				while (allDescFields.length > 0) {
					i++;
					e.addField(`VC (Part ${i})`, allDescFields.slice(0, 1), true);
					allDescFields = allDescFields.slice(1);
				}

				await msg.edit(e).catch(e => { });

				const rcollector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
					time: 60000
				});

				rcollector.on('collect', async msgB => {
					await msgB.delete();
					num = parseInt(msgB.content);
					if (msgB.content === "cancel") {
						collector.stop();
						await msg.delete().catch(e => { });
						return;
					}
					if (isNaN(num)) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.msgConditions(message, "INVALID_NUMBER_INPUT"));
						return;
					}
					if (!allVOICECHANNELS[num - 1]) {
						MessageFunctions.sendRichEmbed(message, MessageFunctions.createMsgEmbed(message, "Invalid Voice Channel", "That number is not linked to a voice channel. Try again."));
						return;
					}

					rcollector.stop();

					// get destination vc
					let destinationVC = TOMOVEVC[num - 1];

					let people = originatingVC.members.array();
					let promises: any[] = [];
					people.forEach(person => {
						promises.push(person.voice.setChannel(destinationVC.id));
					});
					Promise.all(promises);

					const f: MessageEmbed = new MessageEmbed()
						.setAuthor(message.author.tag, message.author.avatarURL({ format: "png" }))
						.setTitle("Bulk Voice Channel Move")
						.setDescription("The members have been moved successfully.")
						.addField("Originating VC", originatingVC.name, true)
						.addField("Destination VC", destinationVC.name, true)
						.setFooter("Turkie")
						.setColor(Colors.randomElement())
						.setTimestamp();
					await msg.edit(f).catch(e => { });
				});
			});
		});
	}
}