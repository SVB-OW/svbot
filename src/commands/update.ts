import { ClientError, Command, Signup } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'
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
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const propVal = ia.options.getString('property', true)
		let newVal = ia.options.getString('value', true)
		const discordId = ia.options.getString('discord_id', true)

		if (!new Signup().hasOwnProperty(propVal)) throw new ClientError(ia, 'Property does not exist')

		let updateRoles = false
		// Check if the property to update is a rank role property
		if (['tankRank', 'damageRank', 'supportRank'].includes(propVal)) {
			if (!rankResolver(newVal)) throw new ClientError(ia, 'Invalid rank')
			newVal = rankResolver(newVal) as string
			updateRoles = true
		}

		const foundUser = await mongoSignups.findOne({ discordId })
		if (!foundUser) throw new ClientError(ia, `Signup for ${discordId} was not found`)

		// Update the property and parse it to number if possible
		foundUser[propVal] = isNaN(parseInt(newVal)) ? newVal : parseInt(newVal)
		await mongoSignups.updateOne({ discordId }, { $set: foundUser })

		// Fetch guild member
		const member = await ia.guild.members.fetch(foundUser.discordId)

		if (updateRoles) {
			// Remove all rank roles
			await member.roles.set(
				Array.from(member.roles.cache.values())
					.filter(r => !rankResolver(r.name))
					.map(r => r.id),
			)

			// Assign rank roles
			if (foundUser.tankRank !== '-')
				await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundUser.tankRank) as Role)

			if (foundUser.damageRank !== '-')
				await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundUser.damageRank) as Role)

			if (foundUser.supportRank !== '-')
				await member.roles.add(ia.guild.roles.cache.find(r => r.name.toUpperCase() === foundUser.supportRank) as Role)
		}

		await ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Updated signup')
					.setDescription(
						member.permissions.has(PermissionFlagsBits.Administrator, true)
							? 'Roles for admins cannot be changed automatically!'
							: '',
					)
					.setTimestamp()
					.addFields(
						Object.keys(foundUser).map(key => ({
							name: key,
							value: foundUser[key].toString() || '-',
						})),
					),
			],
		})
	},
})
