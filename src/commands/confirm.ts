import { ClientError, Command, Rank } from '../types'
import { getRankRoles, getSignupChannel } from '../validations'
import { PermissionFlagsBits } from 'discord.js'
import type { Role } from 'discord.js'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'confirm',
	description: 'Confirms a signup entry',
	props: [
		{ name: 'discord_id', required: true },
		{ name: 'tank_rank', required: true, choices: Rank },
		{ name: 'damage_rank', required: true, choices: Rank },
		{ name: 'support_rank', required: true, choices: Rank },
	],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const tankRank = ia.options.getString('tank_rank', true)
		const damageRank = ia.options.getString('damage_rank', true)
		const supportRank = ia.options.getString('support_rank', true)

		getSignupChannel(ia)
		getRankRoles(ia)

		const foundSignup = await mongoSignups.findOne({ discordId })
		if (!foundSignup) throw new ClientError(ia, 'MsgId was not found in DB')

		if (!rankResolver(tankRank)) throw new ClientError(ia, 'Tank rank is invalid')

		if (!rankResolver(damageRank)) throw new ClientError(ia, 'Damage rank is invalid')

		if (!rankResolver(supportRank)) throw new ClientError(ia, 'Support rank is invalid')

		foundSignup.tankRank = rankResolver(tankRank) as string
		foundSignup.damageRank = rankResolver(damageRank) as string
		foundSignup.supportRank = rankResolver(supportRank) as string
		foundSignup.confirmedBy = ia.user.username
		foundSignup.confirmedOn = new Date(ia.createdTimestamp).toISOString()

		await mongoSignups.updateOne({ discordId }, { $set: foundSignup })

		// Assign rank roles on confirm
		const member = await ia.guild.members.fetch(foundSignup.discordId)
		await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET') as Role)

		if (foundSignup.tankRank !== '-') await member.roles.add(getRankRoles(ia)[foundSignup.tankRank])

		if (foundSignup.damageRank !== '-') await member.roles.add(getRankRoles(ia)[foundSignup.damageRank])

		if (foundSignup.supportRank !== '-') await member.roles.add(getRankRoles(ia)[foundSignup.supportRank])

		const oldMsg = (await getSignupChannel(ia).messages.fetch()).get(foundSignup.signupMsgId)
		if (oldMsg) {
			oldMsg.edit({ content: 'Signup has been received and accepted by an event moderator' })
			oldMsg.react('👍')
			ia.reply(`Signup for ${member.displayName} successfully validated`)
		} else {
			throw new ClientError(ia, 'Signup message could not be fetched, but was validated anyway')
		}
	},
})
