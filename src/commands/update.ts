import { ClientError, Command, Rank, Signup } from '../types'
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import type { Role } from 'discord.js'

module.exports = new Command({
	name: 'update',
	description: 'Updates a property of a user',
	props: [
		{
			name: 'property',
			required: true,
			// Creates an object with all the required properties of Signup but with it's key as the value
			choices: Object.assign({}, ...Object.keys(new Signup()).map(v => ({ [v]: v }))),
		},
		{ name: 'value', required: true },
		{ name: 'discord_id', required: true },
	],
	allowedChannels: ['bot-commands'],
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia, mongoSignups }) {
		const propVal = ia.options.getString('property', true)
		const newVal = ia.options.getString('value', true)
		const discordId = ia.options.getString('discord_id', true)

		if (!new Signup().hasOwnProperty(propVal)) throw new ClientError(ia, 'Property does not exist')

		let updateRoles = false
		// Check if the property to update is a rank role property
		if (['tankRank', 'damageRank', 'supportRank'].includes(propVal)) {
			if (!Object.values(Rank).includes(newVal as Rank)) throw new ClientError(ia, 'Invalid rank')
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
					.filter(r => !r.name.match(/GAUNTLET \w+/gi))
					.map(r => r.id),
			)

			// Assign rank roles
			if (foundUser.tankRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundUser.tankRank) as Role,
				)

			if (foundUser.damageRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundUser.damageRank) as Role,
				)

			if (foundUser.supportRank !== '-')
				await member.roles.add(
					ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET ' + foundUser.supportRank) as Role,
				)
		}

		await ia.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Updated signup')
					.setTimestamp()
					.addFields(
						Object.keys(foundUser).map(key => ({
							name: key,
							value: foundUser[key].toString() || '-',
							inline: true,
						})),
					),
			],
		})
	},
})
