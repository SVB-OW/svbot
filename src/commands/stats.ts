import { Command, Rank, Region } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import type { Collection } from 'mongodb'
import type { Signup } from '../types'

function findPlayers(mongoSignups: Collection<Signup>, rank: string, region: string | null): Promise<number> {
	if (region)
		return mongoSignups.countDocuments({
			$and: [{ region: region }, { $or: [{ tankRank: rank }, { damageRank: rank }, { supportRank: rank }] }],
		})
	else
		return mongoSignups.countDocuments({
			$or: [{ tankRank: rank }, { damageRank: rank }, { supportRank: rank }],
		})
}

module.exports = new Command({
	name: 'stats',
	description: 'Display some stats for the event',
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	props: [{ name: 'region', required: false, choices: Region }],
	async execute({ ia, mongoSignups }) {
		// Get the stats!
		const totalPlayers = await mongoSignups.countDocuments()
		const confirmedPlayers = await mongoSignups.countDocuments({
			confirmedBy: { $ne: '' },
		})
		const unconfirmedPlayers = await mongoSignups.countDocuments({
			confirmedBy: '',
		})

		const region = ia.options.getString('region', false)

		const euPlayers = await mongoSignups.countDocuments({ region: Region.EU })
		const naPlayers = await mongoSignups.countDocuments({ region: Region.NA })

		const bronzePlayers = await findPlayers(mongoSignups, Rank.BRONZE, region)
		const silverPlayers = await findPlayers(mongoSignups, Rank.SILVER, region)
		const goldPlayers = await findPlayers(mongoSignups, Rank.GOLD, region)
		const platinumPlayers = await findPlayers(mongoSignups, Rank.PLATINUM, region)
		const diamondPlayers = await findPlayers(mongoSignups, Rank.DIAMOND, region)
		const masterPlayers = await findPlayers(mongoSignups, Rank.MASTER, region)
		const grandmasterPlayers = await findPlayers(mongoSignups, Rank.GRANDMASTER, region)
		const championPlayers = await findPlayers(mongoSignups, Rank.CHAMPION, region)

		const embed = new EmbedBuilder().setTitle('Event Stats').setTimestamp()
		if (ia.guild.iconURL()) embed.setThumbnail(ia.guild.iconURL() as string)

		embed.addFields([
			{ name: 'Total', value: totalPlayers.toString(), inline: true },
			{ name: 'Confirmed', value: confirmedPlayers.toString(), inline: true },
			{ name: 'Unconfirmed', value: unconfirmedPlayers.toString(), inline: true },

			{ name: 'EU Players', value: euPlayers.toString(), inline: true },
			{ name: 'NA Players', value: naPlayers.toString(), inline: true },
			{ name: 'Bronze', value: bronzePlayers.toString(), inline: true },

			{ name: 'Silver', value: silverPlayers.toString(), inline: true },
			{ name: 'Gold', value: goldPlayers.toString(), inline: true },
			{ name: 'Platinum', value: platinumPlayers.toString(), inline: true },

			{ name: 'Diamond', value: diamondPlayers.toString(), inline: true },
			{ name: 'Master', value: masterPlayers.toString(), inline: true },
			{ name: 'Grandmaster', value: grandmasterPlayers.toString(), inline: true },
			{ name: 'Champion', value: championPlayers.toString(), inline: true },
		])

		await ia.reply({ embeds: [embed] })
	},
})
