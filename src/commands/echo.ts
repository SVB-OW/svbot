import { ActionRowBuilder, PermissionFlagsBits, SelectMenuBuilder } from 'discord.js'
import { Command, Rank } from '../types'

module.exports = new Command({
	name: 'echo',
	description: 'Replies with the same params as you give it',
	props: [{ name: 'message' }],
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia }) {
		const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			new SelectMenuBuilder()
				.setCustomId('select')
				.setPlaceholder('Select a rank')
				.addOptions(...Object.values(Rank).map(rank => ({ label: rank, value: rank }))),
		)

		const row2 = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			new SelectMenuBuilder().setCustomId('select2').setPlaceholder('Nothing selected').addOptions(
				{
					label: 'Select me',
					description: 'This is a description',
					value: 'first_option',
				},
				{
					label: 'You can select me too',
					description: 'This is also a description',
					value: 'second_option',
				},
			),
		)

		await ia.reply({ content: ia.options.getString('message') || 'hi', components: [row, row2] })
	},
})
