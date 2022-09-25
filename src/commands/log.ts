import { Command, ClientError } from '../types'
import { EmbedBuilder } from 'discord.js'

module.exports = new Command({
	name: 'log',
	description: 'Logs the first db entry or optionally a specific entry by signupId',
	props: [{ name: 'discordId | discordTag', required: true }],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		if (ia.options.data.length != 1) throw new ClientError(ia, 'Parameter discordId | discordTag is required')

		const uid = ia.options.data[0].value.toString()
		const found = await mongoSignups.findOne({
			discordId: uid.replace(/[<>@!]/g, ''),
		})
		if (!found) throw new ClientError(ia, 'Signup not found')

		await ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(uid)
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
