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
		const foundUser = await mongoSignups.findOne({ discordId })
		if (!foundUser) throw new ClientError(ia, `Signup for ${discordId} was not found`)

		mongoSignups.deleteOne({ discordId })
		await ia.reply('Removed signup for BTag ' + foundUser.battleTag)
	},
})
