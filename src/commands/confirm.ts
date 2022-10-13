import { ClientError, Command } from '../types'
import type { Role, TextChannel } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'confirm',
	description: 'Confirms a signup entry',
	props: [
		{ name: 'discord_id', required: true },
		{ name: 'tank_rank', required: true },
		{ name: 'dps_rank', required: true },
		{ name: 'support_rank', required: true },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const tankRank = ia.options.getString('tank_rank', true)
		const dpsRank = ia.options.getString('dps_rank', true)
		const supportRank = ia.options.getString('support_rank', true)

		const signupChannel = ia.guild.channels.cache.find(c => c.name === 'signup') as TextChannel
		if (!signupChannel) throw new ClientError(ia, 'Signup channel does not exist')

		const foundSignup = await mongoSignups.findOne({ discordId })
		if (!foundSignup) throw new ClientError(ia, 'MsgId was not found in DB')

		if (!rankResolver(tankRank)) throw new ClientError(ia, 'Tank rank is invalid')

		if (!rankResolver(dpsRank)) throw new ClientError(ia, 'Damage rank is invalid')

		if (!rankResolver(supportRank)) throw new ClientError(ia, 'Support rank is invalid')

		foundSignup.tankRank = rankResolver(tankRank) as string
		foundSignup.damageRank = rankResolver(dpsRank) as string
		foundSignup.supportRank = rankResolver(supportRank) as string
		foundSignup.confirmedBy = ia.user.id
		foundSignup.confirmedOn = new Date(ia.createdTimestamp).toISOString()

		await mongoSignups.updateOne({ discordId }, { $set: foundSignup })

		// Assign rank roles on confirm
		const member = await ia.guild.members.fetch(foundSignup.discordId)
		if (foundSignup.tankRank !== '-')
			await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignup.tankRank) as Role)

		if (foundSignup.damageRank !== '-')
			await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignup.damageRank) as Role)

		if (foundSignup.supportRank !== '-')
			await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignup.supportRank) as Role)

		signupChannel.messages.fetch(foundSignup.signupMsgId).then(oldMsg => {
			oldMsg.edit('Signup has been received and accepted by an event moderator')
			oldMsg.react('👍')
		})

		await ia.reply(`Signup for ${member.displayName} successfully validated`)
	},
})
