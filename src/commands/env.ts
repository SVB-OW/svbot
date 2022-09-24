import { PermissionFlagsBits } from 'discord.js'
import { Command } from '../types'

module.exports = new Command({
	name: 'env',
	description: 'Outputs the content of the NODE_ENV variable',
	allowedPermissions: PermissionFlagsBits.ManageEvents,
	async execute({ ia }) {
		ia.reply(process.env.NODE_ENV || 'local')
	},
})
