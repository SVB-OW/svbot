import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'
import type { Role } from 'discord.js'
import { getChannel } from '../validations'
import { rankResolver } from '../helpers'

module.exports = new Command({
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

		const member = await ia.guild.members.fetch(foundSignup.discordId)

		// Remove roles
		await member.roles.remove(ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET') as Role)
		await member.roles.set(
			Array.from(member.roles.cache.values())
				.filter(r => !rankResolver(r.name.toUpperCase().replace('GAUNTLET ', '')))
				.map(r => r.id),
		)

		// Delete signup
		await mongoSignups.deleteOne({ discordId })

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
