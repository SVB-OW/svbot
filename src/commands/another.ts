import { ClientError, Command } from '../types'
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

		const additionalRole = ia.options.getString('role', true).toLowerCase()
		if (!['tank', 'dps', 'support'].includes(additionalRole)) throw new ClientError(ia, 'Requested role not valid')

		// Fetch ping msg from newest lobby in db
		const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } })
		if (!lobby) throw new ClientError(ia, 'Lobby not found')
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId)
		if (!pingMsg) throw new ClientError(ia, 'Ping message not found. Please create another ping')

		const guildMembers = await ia.guild.members.fetch()

		lobby.tankPlayers.sort((a, b) => sortPlayers(a, b, lobby))
		lobby.damagePlayers.sort((a, b) => sortPlayers(a, b, lobby))
		lobby.supportPlayers.sort((a, b) => sortPlayers(a, b, lobby))

		const topTanks = lobby.tankPlayers.slice(1)
		const topDps = lobby.damagePlayers.slice(1)
		const topSupports = lobby.supportPlayers.slice(1)
		let playerMsg = ``
		let btagMsg = ``

		if (additionalRole === 'tank') {
			topTanks.forEach(s => {
				guildMembers.get(s.discordId)?.roles.add(ingameRole)
				mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
			})
			playerMsg = `${topTanks.map(p => `<@${p.discordId}>`)}`
			btagMsg = `${topTanks.map(p => `<@${p.battleTag}>`)}`
		}

		if (additionalRole === 'dps') {
			topDps.forEach(s => {
				guildMembers.get(s.discordId)?.roles.add(ingameRole)
				mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
			})
			playerMsg = `${topDps.map(p => `<@${p.discordId}>`)}`
			btagMsg = `${topDps.map(p => `<@${p.battleTag}>`)}`
		}

		if (additionalRole === 'support') {
			topSupports.forEach(s => {
				guildMembers.get(s.discordId)?.roles.add(ingameRole)
				mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 } })
			})
			playerMsg = `${topSupports.map(p => `<@${p.discordId}>`)}`
			btagMsg = `${topSupports.map(p => `<@${p.battleTag}>`)}`
		}

		const btagMessage = `**Additional ${additionalRole} selected <@&${hostRole.id}>**
${btagMsg}`

		const playerMessage = `**Lobby Announcement**
${playerMsg}, we need another ${additionalRole}!
Please urgently join the <#${lobbyChannel.id}> channel, start the game and wait for an invite to the custom game lobby.`

		mmChannel.send(btagMessage)
		pingsChannel.send(playerMessage)

		delete lobby.pingMsg
		lobby.pingAnnounced = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby }) // not sure if we need this?

		ia.reply('Additional player ping sent')
	},
})
