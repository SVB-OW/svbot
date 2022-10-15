import { Command, Signup } from '../types'
import { EmbedBuilder } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'getunconfirmed',
	description: 'Gets X unconfirmed users',
	props: [
		{ name: 'count', required: false },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const unconfirmCount = Math.max(ia.options.getNumber('count') || 5, 10)

		const embed = new EmbedBuilder().setTitle('Unconfirmed users').setTimestamp()
		if (ia.guild.iconURL()) embed.setThumbnail(ia.guild.iconURL() as string)

		mongoSignups.find({ confirmedBy: "" }, { limit: unconfirmCount }).toArray().then(async (signups: Signup[]) => {
			signups.forEach(s => {
				embed.addFields([
					{ name: 'DiscordID', value: s.discordId, inline: true },
					{ name: 'BattleTag', value: s.battleTag, inline: true },
					{ name: 'Screenshot', value: s.screenshot, inline: true }
				])
			})

			if (embed.toJSON().hasOwnProperty("fields") === false) {
				await ia.reply("No more unconfirmed users left!")
			} else {
				embed.setFooter({ text: "Use /confirm as normal to confirm these users" })
				await ia.reply({ embeds: [embed] })
			}
		})
	},
})
