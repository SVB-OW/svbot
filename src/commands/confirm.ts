import { ClientError, Command, Rank } from '../types/index.js'
import { getChannel, getRole } from '../validations.js'
import { PermissionFlagsBits } from 'discord.js'
import type { Role } from 'discord.js'

export default new Command({
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

		// Validating roles and channels exist
		getChannel(ia, 'signup')
		getRole(ia, 'GAUNTLET BRONZE')

		const foundSignup = await mongoSignups.findOne({ discordId })
		if (!foundSignup) throw new ClientError(ia, 'MsgId was not found in DB')

		foundSignup.tankRank = tankRank
		foundSignup.damageRank = damageRank
		foundSignup.supportRank = supportRank
		foundSignup.confirmedBy = ia.user.username
		foundSignup.confirmedOn = new Date(ia.createdTimestamp).toISOString()

		await mongoSignups.updateOne({ discordId }, { $set: foundSignup })

		// Assign rank roles on confirm
		const member = await ia.guild.members.fetch(foundSignup.discordId)
		await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET') as Role)

		if (foundSignup.tankRank !== '-') await member.roles.add(getRole(ia, ('GAUNTLET ' + foundSignup.tankRank) as any))

		if (foundSignup.damageRank !== '-')
			await member.roles.add(getRole(ia, ('GAUNTLET ' + foundSignup.damageRank) as any))

		if (foundSignup.supportRank !== '-')
			await member.roles.add(getRole(ia, ('GAUNTLET ' + foundSignup.supportRank) as any))

		const oldMsg = (await getChannel(ia, 'signup').messages.fetch()).get(foundSignup.signupMsgId)
		if (oldMsg) {
			oldMsg.edit({ content: 'Signup has been received and accepted by an event moderator' })
			oldMsg.react('👍')
			ia.reply(`Signup for ${member.displayName} successfully validated`)
		} else {
			throw new ClientError(ia, 'Signup message could not be fetched, but was validated anyway')
		}
	},
})
