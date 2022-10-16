import { Command } from '../types'
import { EmbedBuilder } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'getunconfirmed',
	description: 'Gets X unconfirmed users',
	props: [{ name: 'count', type: 'number' }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const unconfirmCount = Math.min(ia.options.getNumber('count') || 5, 10)

		const embed = new EmbedBuilder().setTitle('Unconfirmed users').setTimestamp()

		const signups = await mongoSignups.find({ confirmedBy: '' }, { limit: unconfirmCount }).toArray()
		signups.forEach(s => {
			embed.addFields([
				{ name: 'DiscordID', value: s.discordId, inline: true },
				{ name: 'BattleTag', value: s.battleTag, inline: true },
				{ name: 'Screenshot', value: s.screenshot, inline: true },
			])
		})

		if (!signups.length) {
			await ia.reply('No more unconfirmed users left!')
		} else {
			embed.setFooter({ text: 'Use /confirm as normal to confirm these users' })
			await ia.reply({ embeds: [embed] })
		}
	},
})
