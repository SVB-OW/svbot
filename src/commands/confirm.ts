import { Role, TextChannel } from 'discord.js'
import { Command, ClientError } from '../types'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'confirm',
	description: 'Confirms a signup entry',
	props: [
		{ name: 'signupMsgId', required: true },
		{ name: 'tankRank', required: true },
		{ name: 'dpsRank', required: true },
		{ name: 'supportRank', required: true },
	],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		if (ia.options.data.length < 4) throw new ClientError(ia, 'Invalid number of arguments. Format is "!confirm <msgId> <tankRank> <dpsRank> <supportRank>')

		const msgId = ia.options.data[0].value!.toString()
		const tankRank = ia.options.data[1].value!.toString()
		const dpsRank = ia.options.data[2].value!.toString()
		const supportRank = ia.options.data[3].value!.toString()

		const signupChannel = ia.guild!.channels.cache.find((c) => c.name === 'signup') as TextChannel
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
		const member = await ia.guild!.members.fetch(foundSignupByMsgId.discordId)
		if (foundSignupByMsgId.tankRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundSignupByMsgId.tankRank) as Role)

		if (foundSignupByMsgId.damageRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundSignupByMsgId.damageRank) as Role)

		if (foundSignupByMsgId.supportRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundSignupByMsgId.supportRank) as Role)

		// TODO: Old messages might not be fetchable
		signupChannel.messages.fetch(foundSignupByMsgId.signupMsgId).then((oldMsg) => {
			oldMsg.react('👍')
		})

		await ia.reply('Signup successfully validated')
	},
})
