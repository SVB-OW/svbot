import { ClientError, Command } from '../types'
import type { Role, TextChannel } from 'discord.js'
import { DiscordjsTypeError } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'confirm',
	description: 'Confirms a signup entry',
	props: [
		{ name: 'discord_id', required: true },
		{ name: 'tank_rank', required: true },
		{ name: 'damage_rank', required: true },
		{ name: 'support_rank', required: true },
	],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const tankRank = ia.options.getString('tank_rank', true)
		const damageRank = ia.options.getString('damage_rank', true)
		const supportRank = ia.options.getString('support_rank', true)

		const signupChannel = ia.guild.channels.cache.find(c => c.name === 'signup') as TextChannel
		if (!signupChannel) throw new ClientError(ia, 'Signup channel does not exist')

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
		try {
			await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET') as Role)

			if (foundSignup.tankRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundSignup.tankRank) as Role,
				)

			if (foundSignup.damageRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundSignup.damageRank) as Role,
				)

			if (foundSignup.supportRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundSignup.supportRank) as Role,
				)
		} catch (e) {
			if (e instanceof DiscordjsTypeError) throw new ClientError(ia, 'Role does not exist')
			else throw e // let others bubble up
		}

		await signupChannel.messages.fetch(foundSignup.signupMsgId)
		const oldMsg = signupChannel.messages.cache.get(foundSignup.signupMsgId)
		if (oldMsg) {
			oldMsg.edit({ content: 'Signup has been received and accepted by an event moderator' })
			oldMsg.react('👍')
			ia.reply(`Signup for ${member.displayName} successfully validated`)
		} else {
			throw new ClientError(ia, 'Signup message could not be fetched, but was validated anyway')
		}
	},
})
