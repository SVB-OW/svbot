import { Command, Signup } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'migrate',
	description: "If you don't know what this does, don't use it",
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia, mongoSignups }) {
		ia.deferReply()
		const guildMembers = await ia.guild.members.fetch()

		const requests = guildMembers.map(async member => {
			let findSignup = await mongoSignups.findOne({ discordId: member.id })
			if (!findSignup) return

			findSignup = Object.assign({}, new Signup(), findSignup)
			findSignup.discordName = member.displayName.split('#')[0]

			return mongoSignups.updateOne({ discordId: member.id }, { $set: findSignup })
		})
		await Promise.all(requests)
		ia.editReply('Migration complete')
	},
})
