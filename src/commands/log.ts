import { ClientError, Command } from '../types/index.js'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export default new Command({
	name: 'log',
	description: 'Logs the first db entry or optionally a specific entry by signupId',
	props: [{ name: 'discord_id', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const found = await mongoSignups.findOne({ discordId })
		if (!found) throw new ClientError(ia, 'Signup not found')

		ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(discordId)
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
