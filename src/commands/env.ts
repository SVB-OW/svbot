import { Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'env',
	description: 'Outputs the content of the NODE_ENV variable',
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia }) {
		ia.reply(process.env.NODE_ENV || 'local')
	},
})
