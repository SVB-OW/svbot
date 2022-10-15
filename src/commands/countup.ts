import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'countup',
	description: 'Increments the games played count of a player',
	props: [{ name: 'discord_id', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const foundUser = await mongoSignups.findOne({ discordId })
		if (!foundUser) throw new ClientError(ia, `Signup for ${discordId} was not found`)

		foundUser.gamesPlayed++
		mongoSignups.updateOne({ discordId }, { $set: foundUser })
		await ia.reply('Games played increased!')
	},
})
