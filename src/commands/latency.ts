import { Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'latency',
	description: 'Replies with the bots latency',
	allowedPermissions: PermissionFlagsBits.Administrator,
	async execute({ ia }) {
		ia.reply(`Latency to bot: ${Date.now() - ia.createdTimestamp}ms`)
	},
})
