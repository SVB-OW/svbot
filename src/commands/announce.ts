import { ClientError, Command, Lobby } from '../types'
import type { Role, TextChannel, VoiceChannel } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { sortPlayers } from '../helpers'

module.exports = new Command({
	name: 'announce',
	description: 'Post player list in #matchmaker',
	props: [
		{ name: 'tank_players_count', type: 'number' },
		{ name: 'dps_players_count', type: 'number' },
		{ name: 'support_players_count', type: 'number' },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups, mongoLobbies }) {
		//#region Validations
		if ((await mongoLobbies.countDocuments()) === 0) throw new ClientError(ia, 'No ping has occurred yet')

		const ingameRole = ia.guild.roles.cache.find(r => r.name === 'Ingame') as Role
		if (!ingameRole) throw new ClientError(ia, 'Ingame role does not exist')
		const hostRole = ia.guild.roles.cache.find(r => r.name === 'Lobby Host') as Role
		if (!hostRole) throw new ClientError(ia, 'Lobby Host role does not exist')

		const mmChannel = ia.guild.channels.cache.find(c => c.name === 'matchmaker') as TextChannel
		if (!mmChannel) throw new ClientError(ia, 'Channel matchmaker does not exist')
		const pingsChannel = ia.guild.channels.cache.find(c => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(ia, 'Channel player-pings does not exist')
		const lobbyChannel = ia.guild.channels.cache.find(c => c.name === 'waiting lobby') as VoiceChannel
		if (!lobbyChannel) throw new ClientError(ia, 'Waiting Lobby channel does not exist')
		//#endregion

		const tankCount = ia.options.getNumber('tank_players_count') ?? 2
		const dpsCount = ia.options.getNumber('dps_players_count') ?? 4
		const suppCount = ia.options.getNumber('support_players_count') ?? 4

		// Fetch ping msg from newst lobby in db
		const lobby = (await mongoLobbies.findOne({}, { sort: { $natural: -1 } })) || new Lobby()
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId)
		if (!pingMsg) throw new ClientError(ia, 'Ping message not found. Please create another ping')

		// Collection of players who reacted to ping message
		const msgReactionUsers = (await pingMsg.reactions.cache.get('👍')?.users.fetch())?.filter(user => !user.bot) || []

		const guildMembers = await ia.guild.members.fetch()

		// Iterate list of users who reacted
		for (const [userId] of msgReactionUsers) {
			// Find singup for current user
			const findSignup = await mongoSignups.findOne({ discordId: userId })

			// Check that signup exists, was confirmed and the user is still in the server
			if (findSignup && findSignup.confirmedOn && guildMembers.get(findSignup.discordId)) {
				// Sort roles by which has the least players already
				const rolePools = [
					{ name: 'tank', arr: lobby.tankPlayers },
					{ name: 'damage', arr: lobby.damagePlayers },
					{ name: 'support', arr: lobby.supportPlayers },
				].sort((a, b) => {
					if (a.arr.length < b.arr.length) return -1
					if (a.arr.length > b.arr.length) return 1

					return 0
				})

				if (findSignup[rolePools[0].name + 'Rank'] === lobby.rank) {
					lobby[rolePools[0].name + 'Players'].push(findSignup)
					continue
				}

				if (findSignup[rolePools[1].name + 'Rank'] === lobby.rank) {
					lobby[rolePools[1].name + 'Players'].push(findSignup)
					continue
				}

				if (findSignup[rolePools[2].name + 'Rank'] === lobby.rank) {
					lobby[rolePools[2].name + 'Players'].push(findSignup)
					continue
				}
			}
		}

		lobby.tankPlayers.sort((a, b) => sortPlayers(a, b, lobby))
		lobby.damagePlayers.sort((a, b) => sortPlayers(a, b, lobby))
		lobby.supportPlayers.sort((a, b) => sortPlayers(a, b, lobby))

		const topTanks = lobby.tankPlayers.slice(0, tankCount)
		const topDps = lobby.damagePlayers.slice(0, dpsCount)
		const topSupports = lobby.supportPlayers.slice(0, suppCount)

		topTanks.forEach(s => {
			guildMembers.get(s.discordId)?.roles.add(ingameRole)
			mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
		})

		topDps.forEach(s => {
			guildMembers.get(s.discordId)?.roles.add(ingameRole)
			mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
		})

		topSupports.forEach(s => {
			guildMembers.get(s.discordId)?.roles.add(ingameRole)
			mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
		})

		const btagMessage = `**Next lobby <@&${hostRole.id}>**
*Tank*
${topTanks.map(p => p.battleTag).join(', ') || 'none'}
*Damage*
${topDps.map(p => p.battleTag).join(', ') || 'none'}
*Support*
${topSupports.map(p => p.battleTag).join(', ') || 'none'}
`

		const playerMessage = `**Lobby Announcement**
The following players have been selected for the next game.
If you are listed below, please join the <#${
			lobbyChannel.id
		}> channel, start the game and wait for an invite to the custom game lobby.

*Tank*
${topTanks.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Damage*
${topDps.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Support*
${topSupports.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
`

		mmChannel.send(btagMessage)
		pingsChannel.send(playerMessage)

		delete lobby.pingMsg
		lobby.pingAnnounced = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })

		ia.reply('Lobby ping announced')
	},
})
