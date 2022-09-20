import { Command } from '../types'

module.exports = new Command({
	name: 'env',
	description: 'Outputs the content of the NODE_ENV variable',
	permission: 'Administrator',
	async execute({ msg }) {
		msg.channel.send(process.env.NODE_ENV || 'local')
	},
})