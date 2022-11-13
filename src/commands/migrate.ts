import { Command, Signup } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'migrate',
	description: 'Matches DB object to TS type',
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia, mongoSignups }) {
		ia.deferReply()
		const guildMembers = await ia.guild.members.fetch()

		guildMembers.forEach(async member => {
			let findSignup = await mongoSignups.findOne({ discordId: member.id })
			if (!findSignup) return

			findSignup.discordName = member.displayName.split('#')[0]
			findSignup = Object.assign({}, new Signup(), findSignup)

			mongoSignups.updateOne({ _id: member.id }, { $set: findSignup })
		})
		ia.editReply('Migration complete')
	},
})
