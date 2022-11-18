import { ClientError, Command, Lobby } from '../types'
import type { Rank, Region } from '../types'
import { PermissionFlagsBits } from 'discord.js'
import type { TextChannel } from 'discord.js'
import type { WithId } from 'mongodb'
import { rankResolver } from '../helpers'
import { regionRegex } from '../config'

module.exports = new Command({
	name: 'ping',
	description: 'Ping rank role with streamer and region in #player-pings',
	props: [
		{ name: 'rank', required: true },
		{
			name: 'region',
			required: true,
			choices: {
				EU: 'EU',
				NA: 'NA',
			},
		},
		{ name: 'streamer', required: true },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoLobbies }) {
		// Validate
		const pingsChannel = ia.guild.channels.cache.find(c => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(ia, 'Channel player-pings does not exist')

		const pingRank = ia.options.getString('rank', true)
		const pingRegion = ia.options.getString('region', true)
		const pingStreamer = ia.options.getString('streamer', true)

		// Checks Rank
		if (!rankResolver(pingRank)) throw new ClientError(ia, 'Rank is invalid ' + pingRank)

		// Checks Region
		if (!regionRegex.test(pingRegion)) throw new ClientError(ia, 'Region is invalid ' + pingRegion)

		const lobby = new Lobby() as WithId<Lobby>
		lobby.rank = rankResolver(pingRank) as Rank
		lobby.region = pingRegion.toUpperCase() as Region
		lobby.streamer = pingStreamer

		const roleByName = ia.guild.roles.cache.find(item => item.name.toUpperCase() === 'GAUNTLET ' + lobby.rank)
		if (!roleByName) throw new ClientError(ia, `Role ${lobby.rank} does not exist`)
		const pingMsg = await pingsChannel.send(
			`${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`,
		)

		await pingMsg.react('👍')

		lobby.pingMsgId = pingMsg.id
		await mongoLobbies.insertOne(lobby)
		ia.reply(`Ping sent out for ${lobby.streamer} playing ${lobby.rank} on ${lobby.region}`)
	},
})
