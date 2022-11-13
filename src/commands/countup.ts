import { ClientError, Command } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'

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
		const embed = new EmbedBuilder().setTitle('Games played increased').setTimestamp()
		embed.addFields([
			{ name: 'DiscordID', value: foundUser.discordId, inline: true },
			{ name: 'BattleTag', value: foundUser.battleTag, inline: true },
			{ name: '​', value: '​', inline: true },
			{ name: 'Old value', value: `${foundUser.gamesPlayed - 1}`, inline: true },
			{ name: 'New value', value: `${foundUser.gamesPlayed}`, inline: true },
			{ name: '​', value: '​', inline: true },
		])
		await ia.reply({ embeds: [embed] })
	},
})
