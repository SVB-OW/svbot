import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'
import { getRole } from '../validations'

module.exports = new Command({
	name: 'clear',
	description: 'Kicks all players with @Ingame from voice lobbies and removes their role',
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoLobbies, mongoSignups }) {
		const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } })
		if (!lobby) throw new ClientError(ia, 'No lobby was announced yet')

		const role = getRole(ia, 'INGAME')

		lobby.pingCleared = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })
		mongoSignups.updateMany({ playing: true }, { $set: { playing: false } })

		const ingamePlayers = role.members
		ingamePlayers?.forEach(value => value.roles.remove(role))
		ia.reply('Ingame role cleared')
	},
})
