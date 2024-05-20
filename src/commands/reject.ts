import { ClientError, Command } from '../types/index.js'
import { PermissionFlagsBits } from 'discord.js'
import { getChannel } from '../validations.js'

export default new Command({
	name: 'reject',
	description: 'Removes a players signup from the database',
	props: [{ name: 'discord_id', required: true }],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const discordId = ia.options.getString('discord_id', true)
		const signupChannel = getChannel(ia, 'signup')

		const foundSignup = await mongoSignups.findOne({ discordId })
		if (!foundSignup) throw new ClientError(ia, `Signup for ${discordId} was not found`)

		// Delete signup
		await mongoSignups.deleteOne({ discordId })

		const member = await ia.guild.members.fetch(foundSignup.discordId)

		// Remove roles
		await member.roles.set(
			Array.from(member.roles.cache.values())
				.filter(r => !r.name.match(/GAUNTLET/gi))
				.map(r => r.id),
		)

		// Delete message
		await signupChannel.messages.fetch(foundSignup.signupMsgId)
		const oldMsg = signupChannel.messages.cache.get(foundSignup.signupMsgId)
		if (oldMsg) {
			oldMsg.delete()
			ia.reply(`Signup for ${member.displayName} successfully deleted`)
		} else {
			throw new ClientError(ia, 'Signup message could not be fetched, but was deleted from db anyway')
		}
	},
})
