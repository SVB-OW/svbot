import { Command, ClientError } from '../types'
import { EmbedBuilder } from 'discord.js'

module.exports = new Command({
	name: 'log',
	description: 'Logs the first db entry or optionally a specific entry by signupId',
	props: [{ name: 'discordId | discordTag', required: true }],
	allowedChannels: ['bot-commands'],
	async execute({ msg, args, mongoSignups }) {
		if (!args[0]) throw new ClientError(msg, 'Parameter discordId | discordTag is required')

		const found = await mongoSignups.findOne({
			discordId: args[0].replace(/[<>@!]/g, ''),
		})
		if (!found) throw new ClientError(msg, 'Signup not found')

		await msg.channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(args[0])
					.setTimestamp()
					.addFields(
						Object.keys(found).map((key) => ({
							name: key,
							value: found[key] || '-',
						})),
					),
			],
		})
	},
})