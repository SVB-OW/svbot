import { ClientError, Command, Lobby } from '../types'
import type { Role, TextChannel, VoiceChannel } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import type { Signup } from '../types'
import { sortPlayers } from '../helpers'

module.exports = new Command({
	name: 'announce',
	description: 'Post player list in #matchmaker',
	props: [
		{ name: 'tank_players_count', type: 'number' },
		{ name: 'damage_players_count', type: 'number' },
		{ name: 'support_players_count', type: 'number' },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups, mongoLobbies }) {
		//#region Validations
		if ((await mongoLobbies.countDocuments()) === 0) throw new ClientError(ia, 'No ping has occurred yet')

		const ingameRole = ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'INGAME') as Role
		if (!ingameRole) throw new ClientError(ia, 'Ingame role does not exist')
		const hostRole = ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'LOBBY HOST') as Role
		if (!hostRole) throw new ClientError(ia, 'Lobby Host role does not exist')

		const mmChannel = ia.guild.channels.cache.find(c => c.name === 'matchmaker') as TextChannel
		if (!mmChannel) throw new ClientError(ia, 'Channel matchmaker does not exist')
		const pingsChannel = ia.guild.channels.cache.find(c => c.name === 'player-pings') as TextChannel
		if (!pingsChannel) throw new ClientError(ia, 'Channel player-pings does not exist')
		const lobbyChannel = ia.guild.channels.cache.find(c => c.name.toLowerCase() === 'waiting lobby') as VoiceChannel
		if (!lobbyChannel) throw new ClientError(ia, 'Waiting Lobby channel does not exist')
		//#endregion

		const counts = {
			tank: ia.options.getNumber('tank_players_count') ?? 2,
			damage: ia.options.getNumber('damage_players_count') ?? 4,
			support: ia.options.getNumber('support_players_count') ?? 4,
		}

		// Fetch ping msg from newst lobby in db
		const lobby = (await mongoLobbies.findOne({}, { sort: { $natural: -1 } })) || new Lobby()
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId).catch(() => {
			throw new ClientError(ia, 'Ping message not found. Please create another ping')
		})

		lobby.tankPlayers = []
		lobby.damagePlayers = []
		lobby.supportPlayers = []
		console.log('lobby', lobby)

		// Collection of players who reacted to ping message
		// const msgReactionUsers = (await pingMsg.reactions.cache.get('👍')?.users.fetch())?.filter(user => !user.bot) || []
		const msgReactionUsers = await mongoSignups.find({}).toArray()

		const guildMembers = await ia.guild.members.fetch()

		// Iterate list of users who reacted
		for (const user of msgReactionUsers) {
			// Find singup for current user
			const findSignup = user //await mongoSignups.findOne({ discordId: user.userId })

			// Check that signup exists, was confirmed and the user is still in the server
			if (findSignup && findSignup.confirmedOn) {
				// Add user to role pool, if they have a role placed in the correct rank
				if (findSignup.tankRank === lobby.rank) lobby.tankPlayers.push(findSignup)
				if (findSignup.damageRank === lobby.rank) lobby.damagePlayers.push(findSignup)
				if (findSignup.supportRank === lobby.rank) lobby.supportPlayers.push(findSignup)
			}
		}

		// Sort roles by which has the least players already
		const rolePools = Object.fromEntries(
			Object.entries({
				tank: { arr: lobby.tankPlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				damage: { arr: lobby.damagePlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				support: { arr: lobby.supportPlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
			}).sort((a, b) => {
				if (a[1].arr.length < b[1].arr.length) return -1
				if (a[1].arr.length > b[1].arr.length) return 1

				return 0
			}),
		)

		Object.entries(rolePools).forEach(([name, rolePool]) => {
			// Sort and filter those who aren't locked
			rolePool.arr.sort((a, b) => sortPlayers(a, b, lobby))
			rolePool.possibleArr = rolePool.arr.filter(signup => !signup.playing)
			rolePool.lockedArr = rolePool.possibleArr.slice(0, counts[name as keyof typeof counts])
			rolePool.lockedArr.forEach(signup => (signup.playing = true))

			// Add ingame roles and update db
			rolePool.lockedArr.forEach(s => {
				guildMembers.get(s.discordId)?.roles.add(ingameRole)
				mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 }, $set: { playing: true } })
			})
		})

		const btagMessage = `**Next lobby <@&${hostRole.id}>**
*Tank*
${rolePools.tank.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n ') || 'none'}
*Damage*
${rolePools.damage.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n ') || 'none'}
*Support*
${rolePools.support.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n ') || 'none'}
`

		const playerMessage = `**Lobby Announcement**
The following players have been selected for the next game.
If you are listed below, please join the <#${
			lobbyChannel.id
		}> channel, start the game and wait for an invite to the custom game lobby.

*Tank*
${rolePools.tank.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n ') || 'none'}

*Damage*
${rolePools.damage.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n ') || 'none'}

*Support*
${rolePools.support.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n ') || 'none'}
`

		mmChannel.send(btagMessage)
		pingsChannel.send(playerMessage)

		delete lobby.pingMsg
		lobby.pingAnnounced = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })

		ia.reply('Lobby ping announced')
	},
})
