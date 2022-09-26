import { Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'echo',
	description: 'Replies with the same params as you give it',
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia }) {
		await ia.reply(ia.options.data.toString())
	},
})
