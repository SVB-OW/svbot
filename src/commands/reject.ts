import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'reject',
	description: 'Removes a players signup from the database',
	props: [{ name: 'discord_id', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)

		const res = await mongoSignups.deleteOne({ discordId })

		if (res.deletedCount === 0) throw new ClientError(ia, `Signup for ${discordId} was not found`)
		ia.reply('Removed signup for ' + discordId)
	},
})
