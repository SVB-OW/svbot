import { ClientError, Command, Signup } from '../types'
import { EmbedBuilder } from 'discord.js'
import type { Role } from 'discord.js'
import { rankResolver } from '../helpers'

module.exports = new Command({
	name: 'update',
	description: 'Updates a property of a user',
	props: [
		{ name: 'property', required: true },
		{ name: 'value', required: true },
		{ name: 'discord_id', required: true },
	],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		const propVal = ia.options.getString('property', true)
		if (!new Signup().hasOwnProperty(propVal)) throw new ClientError(ia, 'Property does not exist')

		let newVal = ia.options.getString('value', true)
		let updateRoles = false
		if (['tankRank', 'damageRank', 'supportRank'].includes(propVal)) {
			if (!rankResolver(newVal)) throw new ClientError(ia, 'Invalid rank')
			newVal = rankResolver(newVal) as string
			updateRoles = true
		}

		const userId = ia.options.getString('discord_id', true)

		const foundUser = await mongoSignups.findOne({ discordId: userId })
		if (!foundUser) throw new ClientError(ia, `Signup for ${userId} was not found`)

		foundUser[propVal] = newVal
		await mongoSignups.updateOne({ discordId: userId }, { $set: foundUser })

		const member = await ia.guild!.members.fetch(foundUser.discordId)
		if (member.roles.cache.find((r) => r.name === 'Admin'))
			throw new ClientError(ia, 'Roles for admins cannot be changed automatically')

		if (updateRoles) {
			// Remove all rank roles (doesn't work with admins)
			await member.roles.set(
				Object.values(member.roles)
					.filter((r: Role) => !rankResolver(r.name))
					.map((r: Role) => r.id),
			)

			// Assign rank roles on confirm
			if (foundUser.tankRank !== '-')
				await member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.tankRank) as Role)

			if (foundUser.damageRank !== '-')
				await member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.damageRank) as Role)

			if (foundUser.supportRank !== '-')
				await member.roles.add(
					ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.supportRank) as Role,
				)
		}

		await ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Updated signup')
					.setTimestamp()
					.addFields(
						Object.keys(foundUser).map((key) => ({
							name: key,
							value: foundUser[key] || '-',
						})),
					),
			],
		})
	},
})
