import { Command, ClientError } from '../types'

module.exports = new Command({
	name: 'countdown',
	description: 'Decrements the played count of one or more player',
	props: [{ name: 'discordIds', required: true }],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		if (ia.options.data.length === 0) throw new ClientError(ia, 'Command must include at least one user id')

		ia.options.data.forEach(async (value) => {
			const uid = value.user?.id
			const foundUser = await mongoSignups.findOne({ discordId: uid })
			if (!foundUser) throw new ClientError(ia, `Signup for ${uid} was not found`)

			foundUser.gamesPlayed--
			mongoSignups.updateOne({ discordId: uid }, { $set: foundUser })
		})
	},
})
