import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	props: [{ name: 'number', required: false, type: 'number' }],
	allowedPermissions: PermissionFlagsBits.ManageMessages,
	async execute({ ia }) {
		const num = ia.options.getNumber('number') ?? 1
		if (num < 1 || num > 100) throw new ClientError(ia, 'Number must be in range 1-100')

		// Need to fetch messages, because they can only be deleted from cache
		await ia.channel.messages.fetch({ limit: num })
		await ia.channel.bulkDelete(num, true)
		await ia.reply({ content: num + ' messages deleted!' })
		setTimeout(() => ia.deleteReply(), 3000)
	},
})
