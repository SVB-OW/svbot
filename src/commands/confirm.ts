import { ClientError, Command } from '../types'
import type { Role, TextChannel } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'confirm',
	description: 'Confirms a signup entry',
	props: [
		{ name: 'signup_msg_id', required: true },
		{ name: 'tank_rank', required: true },
		{ name: 'dps_rank', required: true },
		{ name: 'support_rank', required: true },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const msgId = ia.options.getString('signup_msg_id', true)
		const tankRank = ia.options.getString('tank_rank', true)
		const dpsRank = ia.options.getString('dps_rank', true)
		const supportRank = ia.options.getString('support_rank', true)

		const signupChannel = ia.guild.channels.cache.find(c => c.name === 'signup') as TextChannel
		if (!signupChannel) throw new ClientError(ia, 'Signup channel does not exist')

		const foundSignupByMsgId = await mongoSignups.findOne({
			signupMsgId: msgId,
		})
		if (!foundSignupByMsgId) throw new ClientError(ia, 'MsgId was not found in DB')

		if (!rankResolver(tankRank)) throw new ClientError(ia, 'Tank rank is invalid')

		if (!rankResolver(dpsRank)) throw new ClientError(ia, 'Damage rank is invalid')

		if (!rankResolver(supportRank)) throw new ClientError(ia, 'Support rank is invalid')

		foundSignupByMsgId.tankRank = rankResolver(tankRank) as string
		foundSignupByMsgId.damageRank = rankResolver(dpsRank) as string
		foundSignupByMsgId.supportRank = rankResolver(supportRank) as string
		foundSignupByMsgId.confirmedBy = ia.user.id
		foundSignupByMsgId.confirmedOn = new Date(ia.createdTimestamp).toISOString()

		await mongoSignups.updateOne({ signupMsgId: msgId }, { $set: foundSignupByMsgId })

		// Assign rank roles on confirm
		const member = await ia.guild.members.fetch(foundSignupByMsgId.discordId)
		if (foundSignupByMsgId.tankRank !== '-')
			await member.roles.add(
				ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignupByMsgId.tankRank) as Role,
			)

		if (foundSignupByMsgId.damageRank !== '-')
			await member.roles.add(
				ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignupByMsgId.damageRank) as Role,
			)

		if (foundSignupByMsgId.supportRank !== '-')
			await member.roles.add(
				ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundSignupByMsgId.supportRank) as Role,
			)

		// TODO: Old messages might not be fetchable
		signupChannel.messages.fetch(foundSignupByMsgId.signupMsgId).then(oldMsg => {
			oldMsg.react('👍')
		})

		await ia.reply('Signup successfully validated')
	},
})
