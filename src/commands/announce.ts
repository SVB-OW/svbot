import { ClientError, Command, Lobby, Rank } from '../types/index.js'
import { getChannel, getRole, getVoiceChannel } from '../validations.js'
import { PermissionFlagsBits } from 'discord.js'
import type { Signup } from '../types/index.js'
import { sortPlayers } from '../helpers.js'

export default new Command({
	name: 'announce',
	description: 'Post player list in #matchmaker',
	props: [
		{ name: 'tank_players_count', type: 'number' },
		{ name: 'damage_players_count', type: 'number' },
		{ name: 'support_players_count', type: 'number' },
		{ name: 'tank_players_count_team2', type: 'number' },
		{ name: 'damage_players_count_team2', type: 'number' },
		{ name: 'support_players_count_team2', type: 'number' },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups, mongoLobbies }) {
		ia.deferReply()
		//#region Validations
		if ((await mongoLobbies.countDocuments()) === 0) throw new ClientError(ia, 'No ping has occurred yet')

		const ingameRole = getRole(ia, 'INGAME')
		const hostRole = getRole(ia, 'LOBBY HOST')

		const mmChannel = getChannel(ia, 'matchmaker')
		const pingsChannel = getChannel(ia, 'player-pings')
		const lobbyChannel = getVoiceChannel(ia, 'waiting lobby')
		//#endregion

		const counts = {
			tank: ia.options.getNumber('tank_players_count') ?? 1,
			damage: ia.options.getNumber('damage_players_count') ?? 2,
			support: ia.options.getNumber('support_players_count') ?? 2,
			tankTeam2: ia.options.getNumber('tank_players_count_team2') ?? 1,
			damageTeam2: ia.options.getNumber('damage_players_count_team2') ?? 2,
			supportTeam2: ia.options.getNumber('support_players_count_team2') ?? 2,
		}

		// Fetch ping msg from newst lobby in db
		const lobby = (await mongoLobbies.findOne({}, { sort: { $natural: -1 } })) || new Lobby()
		const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId).catch(() => {
			throw new ClientError(ia, 'Ping message not found. Please create another ping')
		})

		// Collection of players who reacted to ping message
		const msgReactionUsers = (await pingMsg.reactions.cache.get('👍')?.users.fetch())?.filter(user => !user.bot) || []

		const guildMembers = await ia.guild.members.fetch()

		// Iterate list of users who reacted
		for (const [userId] of msgReactionUsers) {
			// Find singup for current user
			const findSignup = await mongoSignups.findOne({ discordId: userId })

			// Check that signup exists, was confirmed and the user is still in the server
			if (findSignup && findSignup.confirmedOn && guildMembers.has(userId)) {
				// Add user to role pool, if they have a role placed in the correct rank
				if (findSignup.tankRank === lobby.rank) lobby.tankPlayers.push(findSignup)
				if (findSignup.damageRank === lobby.rank) lobby.damagePlayers.push(findSignup)
				if (findSignup.supportRank === lobby.rank) lobby.supportPlayers.push(findSignup)
				if (lobby.rank2 !== Rank['-'] && findSignup.tankRank === lobby.rank2) lobby.tankPlayersTeam2.push(findSignup)
				if (lobby.rank2 !== Rank['-'] && findSignup.damageRank === lobby.rank2)
					lobby.damagePlayersTeam2.push(findSignup)
				if (lobby.rank2 !== Rank['-'] && findSignup.supportRank === lobby.rank2)
					lobby.supportPlayersTeam2.push(findSignup)
			}
		}

		// Sort roles by which has the least players already
		const rolePools = Object.fromEntries(
			Object.entries({
				tank: { arr: lobby.tankPlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				damage: { arr: lobby.damagePlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				support: { arr: lobby.supportPlayers, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				tankTeam2: { arr: lobby.tankPlayersTeam2, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				damageTeam2: { arr: lobby.damagePlayersTeam2, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
				supportTeam2: { arr: lobby.supportPlayersTeam2, possibleArr: <Signup[]>[], lockedArr: <Signup[]>[] },
			}).sort((a, b) => {
				if (a[1].arr.length < b[1].arr.length) return -1
				if (a[1].arr.length > b[1].arr.length) return 1

				return 0
			}),
		)

		Object.entries(rolePools).forEach(([name, rolePool]) => {
			// Sort players in pool by games played, region and amount of roles in correct rank
			rolePool.arr.sort((a, b) => sortPlayers(a, b, lobby.region, name.includes('2') ? lobby.rank2 : lobby.rank))
			// Filter out players who were locked in a previous role
			rolePool.possibleArr = rolePool.arr.filter(signup => !signup.playing)
			// Lock desired amount of players
			rolePool.lockedArr = rolePool.possibleArr.slice(0, counts[name as keyof typeof counts])
			// Mark locked players as playing
			rolePool.lockedArr.forEach(signup => (signup.playing = true))

			// Add ingame roles and update db of all locked players
			rolePool.lockedArr.forEach(s => {
				guildMembers.get(s.discordId)?.roles.add(ingameRole)
				mongoSignups.updateOne({ discordId: s.discordId }, { $inc: { gamesPlayed: 1 }, $set: { playing: true } })
			})
		})

		const btagMessage = `**Next lobby <@&${hostRole.id}>**
*Tank Team 1*
${rolePools.tank.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}

*Damage Team 1*
${rolePools.damage.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}

*Support Team 1*
${rolePools.support.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}

*Tank Team 2*
${rolePools.tankTeam2.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}

*Damage Team 2*
${rolePools.damageTeam2.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}

*Support Team 2*
${rolePools.supportTeam2.lockedArr.map(p => `${p.battleTag} (${p.discordName})`).join('\n') || 'none'}
`

		const playerMessage = `**Lobby Announcement**
The following players have been selected for the next game.
If you are listed below, please join the <#${
			lobbyChannel.id
		}> channel, start the game and wait for an invite to the custom game lobby.

*Tank Team 1*
${rolePools.tank.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}

*Damage Team 1*
${rolePools.damage.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}

*Support Team 1*
${rolePools.support.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}

*Tank Team 2*
${rolePools.tankTeam2.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}

*Damage Team 2*
${rolePools.damageTeam2.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}

*Support Team 2*
${rolePools.supportTeam2.lockedArr.map(p => `<@${p.discordId}> (${p.battleTag})`).join('\n') || 'none'}
`

		mmChannel.send(btagMessage)
		pingsChannel.send(playerMessage)

		delete lobby.pingMsg
		lobby.pingAnnounced = true
		mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby })

		ia.editReply(
			`Lobby ping announced ${rolePools.tank.lockedArr.length}-${rolePools.damage.lockedArr.length}-${rolePools.support.lockedArr.length} / ${rolePools.tankTeam2.lockedArr.length}-${rolePools.damageTeam2.lockedArr.length}-${rolePools.supportTeam2.lockedArr.length}`,
		)
	},
})
