import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'countdown',
	description: 'Decrements the played count of one or more player',
	props: [{ name: 'discord_ids', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		if (ia.options.data.length === 0) throw new ClientError(ia, 'Command must include at least one user id')

		ia.options.data.forEach(async value => {
			const uid = value.user?.id
			const foundUser = await mongoSignups.findOne({ discordId: uid })
			if (!foundUser) throw new ClientError(ia, `Signup for ${uid} was not found`)

			foundUser.gamesPlayed--
			mongoSignups.updateOne({ discordId: uid }, { $set: foundUser })
		})
	},
})
