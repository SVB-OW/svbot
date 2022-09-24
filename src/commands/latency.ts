import { Command } from '../types'

module.exports = new Command({
	name: 'latency',
	description: 'Replies with the bots latency',
	async execute({ ia }) {
		ia.reply(`Latency to bot: ${Date.now() - ia.createdTimestamp}ms`)
	},
})
