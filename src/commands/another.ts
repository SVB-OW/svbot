import { ClientError, Command, Rank, type Signup } from '../types/index.js'
import { getChannel, getRole, getVoiceChannel } from '../validations.js'
import { PermissionFlagsBits } from 'discord.js'
import { sortPlayers } from '../helpers.js'

export default new Command({
	name: 'another',
	description: 'Get another player for chosen role pinged',
	props: [
		{
			name: 'role',
			required: true,
			choices: {
				tank: 'tank',
				damage: 'damage',
				support: 'support',
			},
		},
		{ name: 'rank', required: true, choices: Rank },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups, mongoLobbies }) {
		//#region Validations
		if ((await mongoLobbies.countDocuments()) === 0) throw new ClientError(ia, 'No ping has occurred yet')

		const ingameRole = getRole(ia, 'INGAME')
		const hostRole = getRole(ia, 'LOBBY HOST')

		const mmChannel = getChannel(ia, 'matchmaker')
		const pingsChannel = getChannel(ia, 'player-pings')
		const lobbyChannel = getVoiceChannel(ia, 'waiting lobby')
		//#endregion

		const additionalRole = ia.options.getString('role', true).toLowerCase()
		if (!['tank', 'damage', 'support'].includes(additionalRole)) throw new ClientError(ia, 'Requested role not valid')
		const rank = ia.options.getString('rank', true) as Rank

		// Fetch ping msg from newest lobby in db
		const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } })
		if (!lobby) throw new ClientError(ia, 'Lobby not found')
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId)
		if (!pingMsg) throw new ClientError(ia, 'Ping message not found. Please create another ping')

		const guildMembers = await ia.guild.members.fetch()

		let foundPlayer: Signup | undefined

		if (additionalRole === 'tank') {
			lobby.tankPlayers.sort((a, b) => sortPlayers(a, b, lobby.region, rank))

			// loop through players to find first player without ingame
			foundPlayer = lobby.tankPlayers.find(p => {
				!guildMembers.get(p.discordId)?.roles.cache.has(ingameRole.id)
			})
		}

		if (additionalRole === 'damage') {
			lobby.damagePlayers.sort((a, b) => sortPlayers(a, b, lobby.region, rank))

			// loop through players to find first player without ingame
			foundPlayer = lobby.damagePlayers.find(p => {
				!guildMembers.get(p.discordId)?.roles.cache.has(ingameRole.id)
			})
		}

		if (additionalRole === 'support') {
			lobby.supportPlayers.sort((a, b) => sortPlayers(a, b, lobby.region, rank))

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
