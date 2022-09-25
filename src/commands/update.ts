import { EmbedBuilder, Role } from 'discord.js'
import { rankResolver } from '../helpers'
import { ClientError, Command, Signup } from '../types'

module.exports = new Command({
	name: 'update',
	description: 'Updates a property of one or more users',
	props: [
		{ name: 'property', required: true },
		{ name: 'value', required: true },
		{ name: 'discordIds', required: true },
	],
	allowedChannels: ['bot-commands'],
	async execute({ ia, mongoSignups }) {
		if (ia.options.data.length < 3) throw new ClientError(ia, 'Too few arguments. Format is !update <property> <value> <discordIds...>')

		let propVal = ia.options.data[0].value.toString()
		if (!new Signup().hasOwnProperty(propVal)) throw new ClientError(ia, 'Property does not exist')

		let newVal = ia.options.data[1].value.toString()
		let updateRoles = false
		if (['tankRank', 'damageRank', 'supportRank'].includes(propVal)) {
			if (!rankResolver(newVal)) throw new ClientError(ia, 'Invalid rank')
			newVal = rankResolver(newVal) as string
			updateRoles = true
		}

		let userIds = ia.options.data.slice(2)

		await userIds.forEach(async (id) => {
			const foundUser = await mongoSignups.findOne({ discordId: id })
			if (!foundUser) throw new ClientError(ia, `Signup for ${id} was not found`)

			foundUser[propVal] = newVal
			mongoSignups.updateOne({ discordId: id }, { $set: foundUser })

			const member = await ia.guild!.members.fetch(foundUser.discordId)
			if (member.roles.cache.find((r) => r.name === 'Admin')) throw new ClientError(ia, 'Roles for admins cannot be changed automatically')

			if (updateRoles) {
				// Remove all rank roles (doesn't work with admins)
				await member.roles.set(
					Object.values(member.roles)
						.filter((r: Role) => !rankResolver(r.name))
						.map((r: Role) => r.id),
				)

				// Assign rank roles on confirm
				if (foundUser.tankRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.tankRank) as Role)

				if (foundUser.damageRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.damageRank) as Role)

				if (foundUser.supportRank !== '-') member.roles.add(ia.guild!.roles.cache.find((r) => r.name.toUpperCase() === foundUser.supportRank) as Role)
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
		})
	},
})
