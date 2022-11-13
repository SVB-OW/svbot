import { ClientError, Command, type Signup } from '../types'
import type { Role, TextChannel, VoiceChannel } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { sortPlayers } from '../helpers'

module.exports = new Command({
	name: 'another',
	description: 'Get another player for chosen role pinged',
	props: [{ name: 'role', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups, mongoLobbies }) {
		//#region Validations
		if ((await mongoLobbies.countDocuments()) === 0) throw new ClientError(ia, 'No ping has occurred yet')

		const ingameRole = ia.guild.roles.cache.find(r => r.name.toLowerCase() === 'ingame') as Role
		if (!ingameRole) throw new ClientError(ia, 'Ingame role does not exist')
		const hostRole = ia.guild.roles.cache.find(r => r.name.toLowerCase() === 'lobby host') as Role
		if (!hostRole) throw new ClientError(ia, 'Lobby Host role does not exist')

		const mmChannel = ia.guild.channels.cache.find(c => c.name === 'matchmaker') as TextChannel
		if (!mmChannel) throw new ClientError(ia, 'Channel matchmaker does not exist')
		const pingsChannel = ia.guild.channels.cache.find(c => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(ia, 'Channel player-pings does not exist')
		const lobbyChannel = ia.guild.channels.cache.find(c => c.name.toLowerCase() === 'waiting lobby') as VoiceChannel
		if (!lobbyChannel) throw new ClientError(ia, 'Waiting Lobby channel does not exist')
		//#endregion

		const additionalRole = ia.options.getString('role', true).toLowerCase()
		if (!['tank', 'damage', 'support'].includes(additionalRole)) throw new ClientError(ia, 'Requested role not valid')

		// Fetch ping msg from newest lobby in db
		const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } })
		if (!lobby) throw new ClientError(ia, 'Lobby not found')
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId)
		if (!pingMsg) throw new ClientError(ia, 'Ping message not found. Please create another ping')

		const guildMembers = await ia.guild.members.fetch()

		let foundPlayer: Signup | undefined

		if (additionalRole === 'tank') {
			lobby.tankPlayers.sort((a, b) => sortPlayers(a, b, lobby))

			// loop through players to find first player without ingame
			foundPlayer = lobby.tankPlayers.find(p => {
				!guildMembers.get(p.discordId)?.roles.cache.has(ingameRole.id)
			})
		}

		if (additionalRole === 'damage') {
			lobby.damagePlayers.sort((a, b) => sortPlayers(a, b, lobby))

			// loop through players to find first player without ingame
			foundPlayer = lobby.damagePlayers.find(p => {
				!guildMembers.get(p.discordId)?.roles.cache.has(ingameRole.id)
			})
		}

		if (additionalRole === 'support') {
			lobby.supportPlayers.sort((a, b) => sortPlayers(a, b, lobby))

			// loop through players to find first player without ingame
			foundPlayer = lobby.supportPlayers.find(p => {
				!guildMembers.get(p.discordId)?.roles.cache.has(ingameRole.id)
			})
		}

		// check we've got one!
		if (foundPlayer === undefined) {
			throw new ClientError(ia, `No additional ${additionalRole} players available!`)
		}

		guildMembers.get(foundPlayer.discordId)?.roles.add(ingameRole)
		await mongoSignups.updateOne({ discordId: foundPlayer.discordId }, { $inc: { gamesPlayed: 1 } })

		const btagMessage = `**Additional ${additionalRole} selected <@&${hostRole.id}>**
${foundPlayer.battleTag}`

		const playerMessage = `**Lobby Announcement**
${foundPlayer.discordId}, we need another ${additionalRole}!
Please urgently join the <#${lobbyChannel.id}> channel, start the game and wait for an invite to the custom game lobby.`

		await mmChannel.send(btagMessage)
		await pingsChannel.send(playerMessage)

		await mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })

		await ia.reply('Additional player ping sent')
	},
})
