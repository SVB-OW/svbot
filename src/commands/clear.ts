import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'
import type { Role } from 'discord.js'

module.exports = new Command({
	name: 'clear',
	description: 'Kicks all players with @Ingame from voice lobbies and removes their role',
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoLobbies }) {
		const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } })
		if (!lobby) throw new ClientError(ia, 'No lobby was announced yet')

		const role = ia.guild!.roles.cache.find((role) => role.name === 'Ingame') as Role
		if (!role) throw new ClientError(ia, 'Ingame role does not exist')

		lobby.pingCleared = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })

		const ingamePlayers = ia.guild!.roles.cache.get(role.id)?.members
		ingamePlayers?.forEach((value) => {
			value.voice.setChannel(null)
			value.roles.remove(role)
		})
		ia.reply('Ingame role cleared')
	},
})
