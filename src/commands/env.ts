import { Command } from '../types/index.js'
import { PermissionFlagsBits } from 'discord.js'

export default new Command({
	name: 'env',
	description: 'Outputs the content of the NODE_ENV variable',
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia }) {
		ia.reply(`${process.env.NODE_ENV || 'local'}: Latency to bot: ${Date.now() - ia.createdTimestamp}ms`)
	},
})
