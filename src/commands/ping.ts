import { Command, ClientError, Lobby, Rank, Region } from '../types'
import { regionRegex } from '../config'
import { rankResolver } from '../helpers'
import { TextChannel } from 'discord.js'
import { WithId } from 'mongodb'

module.exports = new Command({
	name: 'ping',
	description: 'Ping rank role with streamer and region in #player-pings',
	props: [
		{ name: 'rank', required: true },
		{ name: 'region', required: true },
		{ name: 'streamer', required: true },
	],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoLobbies }) {
		// Validate
		const pingsChannel = ia.guild.channels.cache.find((c) => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(ia, 'Channel player-pings does not exist')

		if (ia.options.data.length < 3) throw new ClientError(ia, 'Invalid number of arguments. Format is "!ping <rank> <region> <streamer>')
		let rankPing = ia.options.data[0].value.toString()
		let regionPing = ia.options.data[1].value.toString()
		let streamerPing = ia.options.data[2].value.toString()

		// Checks Rank
		if (!rankResolver(rankPing)) throw new ClientError(ia, 'Rank is invalid ' + rankPing)

		// Checks Region
		if (!regionRegex.test(regionPing)) throw new ClientError(ia, 'Region is invalid ' + regionPing)

		const lobby = new Lobby() as WithId<Lobby>
		lobby.rank = rankResolver(rankPing) as Rank
		lobby.region = regionPing.toUpperCase() as Region
		lobby.streamer = streamerPing

		const roleByName = ia.guild.roles.cache.find((item) => item.name.toUpperCase() === lobby.rank)
		if (!roleByName) throw new ClientError(ia, `Role ${lobby.rank} does not exist`)
		const pingMsg = await pingsChannel.send(`${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`)

		await pingMsg.react('👍')

		lobby.pingMsgId = pingMsg.id
		await mongoLobbies.insertOne(lobby)
	},
})
