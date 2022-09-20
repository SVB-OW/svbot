import { Command } from '../types'

module.exports = new Command({
	name: 'latency',
	description: 'Replies with the bots latency',
	permission: 'Administrator',
	async execute({ msg }) {
		msg.channel.send(`Latency to bot: ${Date.now() - msg.createdTimestamp}ms`)
	},
})