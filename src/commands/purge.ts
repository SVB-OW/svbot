import { Command, ClientError } from '../types'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	permission: 'Administrator',
	props: [{ name: 'number', required: false }],
	async execute({ msg, args }) {
		const num = args[0] ? Number.parseInt(args[0]) : 100
		if (num < 1 || num > 100) throw new ClientError(msg, 'Number must be in range 1-100')

		await msg.channel.bulkDelete(num)
		msg.channel.send(num + ' messages have been deleted').then((m) => setTimeout(() => m.delete(), 3000))
	},
})