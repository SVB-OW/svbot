import { Command, Region } from '../types'
import { EmbedBuilder } from 'discord.js'

module.exports = new Command({
	name: 'stats',
	description: 'Display some stats for the event',
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		// Get the stats!
		const totalPlayers = await mongoSignups.countDocuments()
		const confirmedPlayers = await mongoSignups.countDocuments({
			confirmedBy: { $ne: '' },
		})
		const unconfirmedPlayers = await mongoSignups.countDocuments({
			confirmedBy: '',
		})

		const euPlayers = await mongoSignups.countDocuments({ region: Region.EU })
		const naPlayers = await mongoSignups.countDocuments({ region: Region.NA })

		let bronzePlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'BRONZE' }, { damageRank: 'BRONZE' }, { supportRank: 'BRONZE' }],
		})
		let silverPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'SILVER' }, { damageRank: 'SILVER' }, { supportRank: 'SILVER' }],
		})
		let goldPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'GOLD' }, { damageRank: 'GOLD' }, { supportRank: 'GOLD' }],
		})
		let platinumPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'PLATINUM' }, { damageRank: 'PLATINUM' }, { supportRank: 'PLATINUM' }],
		})
		let diamondPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'DIAMOND' }, { damageRank: 'DIAMOND' }, { supportRank: 'DIAMOND' }],
		})
		let masterPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'MASTER' }, { damageRank: 'MASTER' }, { supportRank: 'MASTER' }],
		})
		let grandmasterPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'GRANDMASTER' }, { damageRank: 'GRANDMASTER' }, { supportRank: 'GRANDMASTER' }],
		})

		const embed = new EmbedBuilder().setTitle('Event Stats').setTimestamp()
		if (ia.guild.iconURL()) embed.setThumbnail(ia.guild.iconURL() as string)

		embed.addFields([
			{ name: 'Confirmed', value: confirmedPlayers.toString(), inline: true },
			{ name: 'Unconfirmed', value: unconfirmedPlayers.toString(), inline: true },

			{ name: 'EU Players', value: euPlayers.toString().toString(), inline: true },
			{ name: 'NA Players', value: naPlayers.toString().toString(), inline: true },
			{ name: 'Bronze', value: bronzePlayers.toString().toString(), inline: true },

			{ name: 'Silver', value: silverPlayers.toString().toString(), inline: true },
			{ name: 'Gold', value: goldPlayers.toString().toString(), inline: true },
			{ name: 'Platinum', value: platinumPlayers.toString().toString(), inline: true },

			{ name: 'Diamond', value: diamondPlayers.toString().toString(), inline: true },
			{ name: 'Master', value: masterPlayers.toString().toString(), inline: true },
			{ name: 'Grandmaster', value: grandmasterPlayers.toString().toString(), inline: true },
		])

		await ia.reply({ embeds: [embed] })
	},
})
