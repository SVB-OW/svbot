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
	async execute({ msg, args, mongoLobbies }) {
		// Validate
		const pingsChannel = msg.guild.channels.cache.find((c) => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(msg, 'Channel player-pings does not exist')
		// Checks Rank
		if (!args[0] || !rankResolver(args[0])) throw new ClientError(msg, 'Rank is invalid ' + args[0])
		// Checks Region
		if (!args[1] || !regionRegex.test(args[1])) throw new ClientError(msg, 'Region is invalid ' + args[1])
		// Checks Streamer
		if (!args[2]) throw new ClientError(msg, 'Streamer cannot be empty ' + args[2])

		const lobby = new Lobby() as WithId<Lobby>
		lobby.rank = rankResolver(args[0]) as Rank
		lobby.region = args[1].toUpperCase() as Region
		lobby.streamer = args[2]

		const roleByName = msg.guild.roles.cache.find((item) => item.name.toUpperCase() === lobby.rank)
		if (!roleByName) throw new ClientError(msg, `Role ${lobby.rank} does not exist`)
		const pingMsg = await pingsChannel.send(`${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`)

		await pingMsg.react('👍')

		lobby.pingMsgId = pingMsg.id
		mongoLobbies.insertOne(lobby)
	},
})
