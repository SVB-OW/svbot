import { Command, Region } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'stats',
	description: 'Display some stats for the event',
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
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

		const bronzePlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'BRONZE' }, { damageRank: 'BRONZE' }, { supportRank: 'BRONZE' }],
		})
		const silverPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'SILVER' }, { damageRank: 'SILVER' }, { supportRank: 'SILVER' }],
		})
		const goldPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'GOLD' }, { damageRank: 'GOLD' }, { supportRank: 'GOLD' }],
		})
		const platinumPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'PLATINUM' }, { damageRank: 'PLATINUM' }, { supportRank: 'PLATINUM' }],
		})
		const diamondPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'DIAMOND' }, { damageRank: 'DIAMOND' }, { supportRank: 'DIAMOND' }],
		})
		const masterPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'MASTER' }, { damageRank: 'MASTER' }, { supportRank: 'MASTER' }],
		})
		const grandmasterPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'GRANDMASTER' }, { damageRank: 'GRANDMASTER' }, { supportRank: 'GRANDMASTER' }],
		})
		const championPlayers = await mongoSignups.countDocuments({
			$or: [{ tankRank: 'CHAMPION' }, { damageRank: 'CHAMPION' }, { supportRank: 'CHAMPION' }],
		})

		const embed = new EmbedBuilder().setTitle('Event Stats').setTimestamp()
		if (ia.guild.iconURL()) embed.setThumbnail(ia.guild.iconURL() as string)

		embed.addFields([
			{ name: 'Total', value: totalPlayers.toString(), inline: true },
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
			{ name: 'Champion', value: championPlayers.toString().toString(), inline: true },
		])

		await ia.reply({ embeds: [embed] })
	},
})
