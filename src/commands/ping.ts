import { ClientError, Command, Lobby, Rank, Region } from '../types/index.js'
import { PermissionFlagsBits } from 'discord.js'
import type { WithId } from 'mongodb'
import { getChannel } from '../validations.js'

export default new Command({
	name: 'ping',
	description: 'Ping rank role with streamer and region in #player-pings',
	props: [
		{ name: 'streamer', required: true },
		{ name: 'region', required: true, choices: Region },
		{ name: 'rank1', required: true, choices: Rank },
		{ name: 'rank2', choices: Rank },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoLobbies }) {
		// Validate
		const pingsChannel = getChannel(ia, 'player-pings')

		const pingStreamer = ia.options.getString('streamer', true)
		const pingRegion = ia.options.getString('region', true)
		const pingRank1 = ia.options.getString('rank1', true)
		const pingRank2 = ia.options.getString('rank2')

		const lobby = new Lobby() as WithId<Lobby>
		lobby.streamer = pingStreamer
		lobby.region = pingRegion.toUpperCase() as Region
		lobby.rank = pingRank1 as Rank
		lobby.rank2 = (pingRank2 as Rank | null) || lobby.rank

		const roleByName = ia.guild.roles.cache.find(item => item.name.toUpperCase() === 'GAUNTLET ' + lobby.rank)
		const role2ByName = ia.guild.roles.cache.find(item => item.name.toUpperCase() === 'GAUNTLET ' + lobby.rank2)
		if (!roleByName) throw new ClientError(ia, `Role ${lobby.rank} does not exist`)
		if (pingRank2 && !role2ByName) throw new ClientError(ia, `Role ${lobby.rank2} does not exist`)

		let pingMsgText = ''
		if (!pingRank2)
			pingMsgText = `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`
		else
			pingMsgText = `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby and <@&${role2ByName?.id}> for their enemies on the ${lobby.region} servers. Please react with 👍`

		const pingMsg = await pingsChannel.send(pingMsgText)

		await pingMsg.react('👍')

		lobby.pingMsgId = pingMsg.id
		await mongoLobbies.insertOne(lobby)
		ia.reply(
			`Ping sent out for ${lobby.streamer} playing ${lobby.rank} ${pingRank2 ? '/ ' + lobby.rank2 + ' ' : ''}on ${
				lobby.region
			}`,
		)
	},
})
