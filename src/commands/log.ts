import { ClientError, Command } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'log',
	description: 'Logs the first db entry or optionally a specific entry by signupId',
	props: [{ name: 'discord_id_or_tag', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const uid = ia.options.getString('discord_id_or_tag', true)
		const found = await mongoSignups.findOne({
			discordId: uid.replace(/[<>@!]/g, ''),
		})
		console.log('found', found)
		if (!found) throw new ClientError(ia, 'Signup not found')

		await ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(uid)
					.setTimestamp()
					.addFields(
						Object.keys(found).map(key => ({
							name: key,
							value: found[key]?.toString() || '-',
							inline: true,
						})),
					),
			],
		})
	},
})
